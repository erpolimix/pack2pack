"use server"
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

async function fileToPart(file: File) {
    return { inlineData: { data: Buffer.from(await file.arrayBuffer()).toString('base64'), mimeType: file.type } };
}

export async function aiAction(type: 'desc' | 'cat' | 'all', formData: FormData) {
    const file = formData.get('file') as File;
    const desc = formData.get('description') as string;
    if (!file || !file.type.startsWith('image/') || file.size > 10 * 1024 * 1024) return type === 'all' ? { title: "", description: "" } : (type === 'cat' ? "Otro" : "");
    if (!process.env.GEMINI_API_KEY) return type === 'all' ? { title: "", description: "" } : (type === 'cat' ? "Otro" : "");

    const part = await fileToPart(file);
    if (type === 'desc') {
        const r = await model.generateContent(["Describe brevemente este pack (máximo 2 frases).", part]);
        return r.response.text().trim();
    } else if (type === 'cat') {
        const r = await model.generateContent([`Categoriza en: Alimentos, Libros, Ropa, Juguetes, Hogar, Otro. Desc: "${desc}"`, part]);
        return r.response.text().trim();
    } else {
        const r = await model.generateContent(['Proporciona Título (máx 30 car) y Descripción (máx 150 car) en JSON: {"title": "...", "description": "..."}', part]);
        const m = r.response.text().match(/\{.*\}/);
        return m ? JSON.parse(m[0]) : { title: "", description: "" };
    }
}
