import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY || "";
const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

export interface AIPackSuggestion {
    title: string;
    description: string;
}

export interface AICategoryDetection {
    category: string;
    confidence: string;
}

export const aiService = {
    async generateDescription(_file: File): Promise<string> {
        try {
            if (!apiKey) {
                console.warn("GEMINI_API_KEY is not set.");
                return "No se ha podido generar la descripción (falta API Key).";
            }

            const base64Data = await this.fileToGenerativePart(_file);

            const prompt = "Analiza esta imagen de un pack de productos y describe brevemente qué contiene en castellano (máximo 2 frases). Sé directo y descriptivo.";

            const result = await model.generateContent([prompt, base64Data]);
            const response = result.response;
            return response.text().trim();
        } catch (error) {
            console.error("Gemini AI Error:", error);
            return "No se ha podido generar la descripción automáticamente.";
        }
    },

    async detectCategory(file: File, description: string): Promise<string> {
        try {
            if (!apiKey) {
                console.warn("GEMINI_API_KEY is not set.");
                return "Sin categoría";
            }

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

            const result = await model.generateContent([prompt, base64Data]);
            const response = result.response;
            let category = response.text().trim();

            // Validar que la respuesta sea una de las categorías permitidas
            const validCategories = ['Alimentos', 'Libros', 'Ropa', 'Juguetes', 'Hogar', 'Otro'];
            
            // Normalizar respuesta (puede venir con espacios, minúsculas, etc)
            category = category.charAt(0).toUpperCase() + category.slice(1).toLowerCase();
            
            // Verificar si está en la lista válida
            if (!validCategories.some(cat => cat.toLowerCase() === category.toLowerCase())) {
                // Si no coincide exactamente, intentar encontrar la más similar
                const match = validCategories.find(cat => 
                    category.toLowerCase().includes(cat.toLowerCase()) || 
                    cat.toLowerCase().includes(category.toLowerCase())
                );
                category = match || 'Otro';
            }

            console.log(`[aiService] Categoría detectada: ${category}`);
            return category;
        } catch (error) {
            console.error("Gemini AI Category Detection Error:", error);
            return "Otro";
        }
    },

    async generateTitleAndDescription(file: File): Promise<AIPackSuggestion> {
        try {
            if (!apiKey) {
                console.warn("GEMINI_API_KEY is not set.");
                return {
                    title: "",
                    description: "No se ha podido generar (falta API Key)."
                };
            }

            const base64Data = await this.fileToGenerativePart(file);

            const prompt = `Analiza esta imagen de un pack de productos y proporciona:

1. Un TÍTULO corto (máx 30 caracteres) con gancho promocional y emoji. Ejemplos: "🔥 Pack ENERGY!", "🥗 FreshBowl PRO", "🍕 Pizza Night!", "💚 Pack ECO"
2. Una DESCRIPCIÓN breve (máx 150 caracteres) indicando qué contiene en castellano.

Responde en formato JSON exactamente así (sin markdown):
{"title": "título aquí", "description": "descripción aquí"}`;

            const result = await model.generateContent([prompt, base64Data]);
            const response = result.response;
            const text = response.text().trim();
            
            // Extrae JSON de la respuesta
            const jsonMatch = text.match(/\{[\s\S]*\}/);
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
    }
};
