'use server'
import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY || "";
const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

async function chat(prompt: string, base64: string, mime: string) {
    if (!apiKey) throw new Error("API Key missing");
    const result = await model.generateContent([prompt, { inlineData: { data: base64, mimeType: mime } }]);
    return result.response.text().trim();
}

export async function generateAIDescriptionAction(base64: string, mime: string) {
    return chat("Analiza esta imagen de un pack de productos y describe brevemente qué contiene en castellano (máximo 2 frases). Sé directo y descriptivo.", base64, mime);
}

export async function detectCategoryAction(base64: string, mime: string, description: string) {
    const prompt = `Analiza esta imagen y la siguiente descripción, y categorízalo en UNA ÚNICA categoría de: Alimentos, Libros, Ropa, Juguetes, Hogar, Otro.\nDescripción: "${description}"\nResponde ÚNICAMENTE con el nombre de la categoría.`;
    const res = await chat(prompt, base64, mime);
    return ['Alimentos', 'Libros', 'Ropa', 'Juguetes', 'Hogar', 'Otro'].find(c => res.toLowerCase().includes(c.toLowerCase())) || 'Otro';
}

export async function generateTitleAndDescriptionAction(base64: string, mime: string) {
    const prompt = `Analiza esta imagen y proporciona un TÍTULO corto y una DESCRIPCIÓN breve en castellano.\nResponde en formato JSON exactamente así: {"title": "...", "description": "..."}`;
    return chat(prompt, base64, mime);
}
