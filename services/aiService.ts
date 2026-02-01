import {
    generateAIDescriptionAction,
    detectCategoryAction,
    generateTitleAndDescriptionAction
} from "@/app/actions/ai";

export interface AIPackSuggestion { title: string; description: string; }
export interface AICategoryDetection { category: string; confidence: string; }

/**
 * Client-side service that delegates Gemini AI processing to secure server actions.
 */
export const aiService = {
    async generateDescription(file: File): Promise<string> {
        try {
            const { data, mime } = await this.fileToBase64(file);
            return await generateAIDescriptionAction(data, mime);
        } catch (error) {
            console.error("AI Error:", error);
            return "No se ha podido generar la descripción automáticamente.";
        }
    },

    async detectCategory(file: File, description: string): Promise<string> {
        try {
            const { data, mime } = await this.fileToBase64(file);
            return await detectCategoryAction(data, mime, description);
        } catch (error) {
            console.error("AI Error:", error);
            return "Otro";
        }
    },

    async generateTitleAndDescription(file: File): Promise<AIPackSuggestion> {
        try {
            const { data, mime } = await this.fileToBase64(file);
            const res = await generateTitleAndDescriptionAction(data, mime);
            const match = res.match(/\{[\s\S]*\}/);
            return match ? JSON.parse(match[0]) : { title: "", description: "" };
        } catch (error) {
            console.error("AI Error:", error);
            return { title: "", description: "No se ha podido generar automáticamente." };
        }
    },

    async fileToBase64(file: File): Promise<{ data: string; mime: string }> {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve({ data: (reader.result as string).split(',')[1], mime: file.type });
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }
};
