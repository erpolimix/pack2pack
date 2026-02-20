import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY || "";
const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

export interface AIPackSuggestion {
    title: string;
    description: string;
}

export interface AIPackComplete {
    title: string;
    description: string;
    category: string;
}

export interface AICategoryDetection {
    category: string;
    confidence: string;
}

// ============================================
// RATE LIMITING SYSTEM
// ============================================
// Límites conservadores para API gratuita de Gemini
// Documentación: https://ai.google.dev/gemini-api/docs/rate-limits
const RATE_LIMIT = {
    MAX_REQUESTS_PER_MINUTE: 10, // Conservador (algunos reportan 15 RPM en tier gratuito)
    MIN_INTERVAL_MS: 6000, // 6 segundos entre llamadas = max 10 req/min
    MAX_RETRIES: 2,
    RETRY_DELAY_MS: 3000
};

class RateLimiter {
    private lastCallTime = 0;
    private callCount = 0;
    private windowStart = Date.now();

    async waitIfNeeded(): Promise<void> {
        const now = Date.now();

        // Reset counter cada minuto
        if (now - this.windowStart > 60000) {
            this.callCount = 0;
            this.windowStart = now;
        }

        // Verificar si excedemos el límite por minuto
        if (this.callCount >= RATE_LIMIT.MAX_REQUESTS_PER_MINUTE) {
            const waitTime = 60000 - (now - this.windowStart);
            if (waitTime > 0) {
                console.log(`[aiService] Rate limit alcanzado. Esperando ${waitTime}ms...`);
                await this.sleep(waitTime);
                this.callCount = 0;
                this.windowStart = Date.now();
            }
        }

        // Intervalo mínimo entre llamadas
        const timeSinceLastCall = now - this.lastCallTime;
        if (timeSinceLastCall < RATE_LIMIT.MIN_INTERVAL_MS) {
            const waitTime = RATE_LIMIT.MIN_INTERVAL_MS - timeSinceLastCall;
            console.log(`[aiService] Esperando ${waitTime}ms antes de siguiente llamada...`);
            await this.sleep(waitTime);
        }

        this.lastCallTime = Date.now();
        this.callCount++;
    }

    private sleep(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// ============================================
// CACHE SYSTEM
// ============================================
interface CacheEntry<T> {
    data: T;
    timestamp: number;
}

class SimpleCache<T> {
    private readonly cache = new Map<string, CacheEntry<T>>();
    private readonly maxAge: number;

    constructor(maxAgeMinutes = 30) {
        this.maxAge = maxAgeMinutes * 60 * 1000;
    }

    set(key: string, data: T): void {
        this.cache.set(key, {
            data,
            timestamp: Date.now()
        });
    }

    get(key: string): T | null {
        const entry = this.cache.get(key);
        if (!entry) return null;

        // Verificar si expiró
        if (Date.now() - entry.timestamp > this.maxAge) {
            this.cache.delete(key);
            return null;
        }

        return entry.data;
    }

    clear(): void {
        this.cache.clear();
    }
}

// Instancias globales
const rateLimiter = new RateLimiter();
const packCache = new SimpleCache<AIPackComplete>(30); // 30 minutos

export const aiService = {
    /**
     * FUNCIÓN OPTIMIZADA: Obtiene título, descripción Y categoría en UNA sola llamada
     * Esto reduce de 2-3 llamadas a solo 1, optimizando el uso de la API
     */
    async generatePackComplete(file: File): Promise<AIPackComplete> {
        try {
            if (!apiKey) {
                console.warn("GEMINI_API_KEY is not set.");
                return {
                    title: "",
                    description: "No se ha podido generar (falta API Key).",
                    category: "Otro"
                };
            }

            // Verificar caché usando hash del archivo
            const fileHash = await this.getFileHash(file);
            const cached = packCache.get(fileHash);
            if (cached) {
                console.log("[aiService] Resultado obtenido desde caché");
                return cached;
            }

            // Rate limiting
            await rateLimiter.waitIfNeeded();

            const base64Data = await this.fileToGenerativePart(file);

            const prompt = `Analiza esta imagen de un pack de productos y proporciona la siguiente información en castellano:

1. Un TÍTULO corto (máx 30 caracteres) con gancho promocional profesional
   Ejemplos: "Pack ENERGY Premium", "FreshBowl PRO", "Pizza Night Pack", "Pack ECO Saludable"

2. Una DESCRIPCIÓN breve (máx 150 caracteres) indicando qué contiene

3. Una CATEGORÍA de esta lista exacta:
   - Alimentos
   - Libros
   - Ropa
   - Juguetes
   - Hogar
   - Otro

Responde ÚNICAMENTE en formato JSON sin markdown ni explicaciones adicionales:
{"title": "título aquí", "description": "descripción aquí", "category": "categoría exacta"}`;

            const result = await this.callWithRetry(() => 
                model.generateContent([prompt, base64Data])
            );

            const response = result.response;
            const text = response.text().trim();
            
            // Extrae JSON de la respuesta
            const jsonRegex = /\{[\s\S]*\}/;
            const jsonMatch = jsonRegex.exec(text);
            if (jsonMatch) {
                const parsed = JSON.parse(jsonMatch[0]);
                
                // Validar y normalizar categoría
                const category = this.validateCategory(parsed.category || "Otro");
                
                const packData: AIPackComplete = {
                    title: parsed.title || "",
                    description: parsed.description || "",
                    category
                };

                // Guardar en caché
                packCache.set(fileHash, packData);
                
                console.log(`[aiService] Generación completa exitosa:`, packData);
                return packData;
            }
            
            throw new Error("No se pudo parsear la respuesta JSON de IA");
        } catch (error) {
            console.error("Gemini AI Error:", error);
            return {
                title: "",
                description: "No se ha podido generar automáticamente.",
                category: "Otro"
            };
        }
    },

    /**
     * @deprecated Usar generatePackComplete() en su lugar para optimizar llamadas
     */
    async generateDescription(_file: File): Promise<string> {
        console.warn("[aiService] generateDescription() está deprecated. Usa generatePackComplete()");
        try {
            if (!apiKey) {
                console.warn("GEMINI_API_KEY is not set.");
                return "No se ha podido generar la descripción (falta API Key).";
            }

            await rateLimiter.waitIfNeeded();
            const base64Data = await this.fileToGenerativePart(_file);

            const prompt = "Analiza esta imagen de un pack de productos y describe brevemente qué contiene en castellano (máximo 2 frases). Sé directo y descriptivo.";

            const result = await this.callWithRetry(() =>
                model.generateContent([prompt, base64Data])
            );
            
            const response = result.response;
            return response.text().trim();
        } catch (error) {
            console.error("Gemini AI Error:", error);
            return "No se ha podido generar la descripción automáticamente.";
        }
    },

    /**
     * @deprecated Usar generatePackComplete() en su lugar para optimizar llamadas
     */
    async detectCategory(file: File, description: string): Promise<string> {
        console.warn("[aiService] detectCategory() está deprecated. Usa generatePackComplete()");
        try {
            if (!apiKey) {
                console.warn("GEMINI_API_KEY is not set.");
                return "Otro";
            }

            await rateLimiter.waitIfNeeded();
            const base64Data = await this.fileToGenerativePart(file);

            const prompt = `Analiza esta imagen de un pack de productos y la siguiente descripción, y categorízalo en UNA ÚNICA categoría de esta lista:
- Alimentos
- Libros
- Ropa
- Juguetes
- Hogar
- Otro

Descripción del pack: "${description}"

Responde ÚNICAMENTE con el nombre de la categoría sin explicaciones adicionales. Ejemplo: "Alimentos"`;

            const result = await this.callWithRetry(() =>
                model.generateContent([prompt, base64Data])
            );
            
            const response = result.response;
            const category = response.text().trim();

            return this.validateCategory(category);
        } catch (error) {
            console.error("Gemini AI Category Detection Error:", error);
            return "Otro";
        }
    },

    /**
     * @deprecated Usar generatePackComplete() en su lugar para optimizar llamadas
     */
    async generateTitleAndDescription(file: File): Promise<AIPackSuggestion> {
        console.warn("[aiService] generateTitleAndDescription() está deprecated. Usa generatePackComplete()");
        try {
            if (!apiKey) {
                console.warn("GEMINI_API_KEY is not set.");
                return {
                    title: "",
                    description: "No se ha podido generar (falta API Key)."
                };
            }

            await rateLimiter.waitIfNeeded();
            const base64Data = await this.fileToGenerativePart(file);

            const prompt = `Analiza esta imagen de un pack de productos y proporciona:

1. Un TÍTULO corto (máx 30 caracteres) con gancho promocional profesional. Ejemplos: "Pack ENERGY Premium", "FreshBowl PRO", "Pizza Night Pack", "Pack ECO Saludable"
2. Una DESCRIPCIÓN breve (máx 150 caracteres) indicando qué contiene en castellano.

Responde en formato JSON exactamente así (sin markdown):
{"title": "título aquí", "description": "descripción aquí"}`;

            const result = await this.callWithRetry(() =>
                model.generateContent([prompt, base64Data])
            );
            
            const response = result.response;
            const text = response.text().trim();
            
            // Extrae JSON de la respuesta
            const jsonRegex = /\{[\s\S]*\}/;
            const jsonMatch = jsonRegex.exec(text);
            if (jsonMatch) {
                const parsed = JSON.parse(jsonMatch[0]);
                return {
                    title: parsed.title || "",
                    description: parsed.description || ""
                };
            }
            
            throw new Error("No se pudo parsear la respuesta de IA");
        } catch (error) {
            console.error("Gemini AI Error:", error);
            return {
                title: "",
                description: "No se ha podido generar automáticamente."
            };
        }
    },

    // ============================================
    // UTILIDADES
    // ============================================

    /**
     * Ejecuta una llamada a la API con reintentos si falla por rate limiting
     */
    async callWithRetry<T>(
        fn: () => Promise<T>,
        retries = RATE_LIMIT.MAX_RETRIES
    ): Promise<T> {
        try {
            return await fn();
        } catch (error: unknown) {
            // Error 429: Rate limit exceeded
            const isRateLimitError = typeof error === 'object' && error !== null && 'status' in error && (error as { status: number }).status === 429;
            
            if (isRateLimitError && retries > 0) {
                console.log(`[aiService] Rate limit 429. Reintentando en ${RATE_LIMIT.RETRY_DELAY_MS}ms... (${retries} intentos restantes)`);
                await new Promise(resolve => setTimeout(resolve, RATE_LIMIT.RETRY_DELAY_MS));
                return this.callWithRetry(fn, retries - 1);
            }
            throw error;
        }
    },

    /**
     * Valida y normaliza una categoría
     */
    validateCategory(category: string): string {
        const validCategories = ['Alimentos', 'Libros', 'Ropa', 'Juguetes', 'Hogar', 'Otro'];
        
        // Normalizar respuesta
        const normalized = category.charAt(0).toUpperCase() + category.slice(1).toLowerCase();
        
        // Verificar si está en la lista válida
        if (validCategories.some(cat => cat.toLowerCase() === normalized.toLowerCase())) {
            return validCategories.find(cat => cat.toLowerCase() === normalized.toLowerCase())!;
        }

        // Buscar coincidencia parcial
        const match = validCategories.find(cat => 
            normalized.toLowerCase().includes(cat.toLowerCase()) || 
            cat.toLowerCase().includes(normalized.toLowerCase())
        );
        
        return match || 'Otro';
    },

    /**
     * Genera un hash simple del archivo para caché
     */
    async getFileHash(file: File): Promise<string> {
        return `${file.name}-${file.size}-${file.lastModified}`;
    },

    async fileToGenerativePart(file: File): Promise<{ inlineData: { data: string, mimeType: string } }> {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64 = (reader.result as string).split(',')[1];
                resolve({
                    inlineData: {
                        data: base64,
                        mimeType: file.type
                    }
                });
            };
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    },

    /**
     * Limpia el caché (útil para testing o cuando el usuario cierra sesión)
     */
    clearCache(): void {
        packCache.clear();
        console.log("[aiService] Caché limpiado");
    }
};
