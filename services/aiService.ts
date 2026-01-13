import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY || "";
const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

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
