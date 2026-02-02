'use server'

import { GoogleGenerativeAI } from "@google/generative-ai";

// Use server-side API key, falling back to public one if private is not set
const apiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY || "";
const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

export interface AIPackSuggestion {
    title: string;
    description: string;
}

async function fileToGenerativePart(file: File) {
    const arrayBuffer = await file.arrayBuffer();
    return {
        inlineData: {
            data: Buffer.from(arrayBuffer).toString('base64'),
            mimeType: file.type
        }
    };
}

export async function generateDescriptionAction(formData: FormData): Promise<string> {
    try {
        if (!apiKey) {
            console.warn("GEMINI_API_KEY is not set.");
            return "No se ha podido generar la descripción (falta API Key).";
        }

        const file = formData.get('file') as File;
        if (!file) throw new Error("No file provided");

        const base64Data = await fileToGenerativePart(file);
        const prompt = "Analiza esta imagen de un pack de productos y describe brevemente qué contiene en castellano (máximo 2 frases). Sé directo y descriptivo.";

        const result = await model.generateContent([prompt, base64Data]);
        const response = result.response;
        return response.text().trim();
    } catch (error) {
        console.error("Gemini AI Error:", error);
        return "No se ha podido generar la descripción automáticamente.";
    }
}

export async function detectCategoryAction(formData: FormData): Promise<string> {
    try {
        if (!apiKey) {
            console.warn("GEMINI_API_KEY is not set.");
            return "Sin categoría";
        }

        const file = formData.get('file') as File;
        const description = formData.get('description') as string;
        if (!file) throw new Error("No file provided");

        const base64Data = await fileToGenerativePart(file);

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

        const validCategories = ['Alimentos', 'Libros', 'Ropa', 'Juguetes', 'Hogar', 'Otro'];
        category = category.charAt(0).toUpperCase() + category.slice(1).toLowerCase();

        if (!validCategories.some(cat => cat.toLowerCase() === category.toLowerCase())) {
            const match = validCategories.find(cat =>
                category.toLowerCase().includes(cat.toLowerCase()) ||
                cat.toLowerCase().includes(category.toLowerCase())
            );
            category = match || 'Otro';
        }

        return category;
    } catch (error) {
        console.error("Gemini AI Category Detection Error:", error);
        return "Otro";
    }
}

export async function generateTitleAndDescriptionAction(formData: FormData): Promise<AIPackSuggestion> {
    try {
        if (!apiKey) {
            console.warn("GEMINI_API_KEY is not set.");
            return {
                title: "",
                description: "No se ha podido generar (falta API Key)."
            };
        }

        const file = formData.get('file') as File;
        if (!file) throw new Error("No file provided");

        const base64Data = await fileToGenerativePart(file);

        const prompt = `Analiza esta imagen de un pack de productos y proporciona:

1. Un TÍTULO corto (máx 30 caracteres) con gancho promocional profesional. Ejemplos: "Pack ENERGY Premium", "FreshBowl PRO", "Pizza Night Pack", "Pack ECO Saludable"
2. Una DESCRIPCIÓN breve (máx 150 caracteres) indicando qué contiene en castellano.

Responde en formato JSON exactamente así (sin markdown):
{"title": "título aquí", "description": "descripción aquí"}`;

        const result = await model.generateContent([prompt, base64Data]);
        const response = result.response;
        const text = response.text().trim();

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
}
