import {
    generateDescriptionAction,
    detectCategoryAction,
    generateTitleAndDescriptionAction,
    type AIPackSuggestion
} from "@/app/actions/ai";

/**
 * Client-side service that acts as a bridge to Server Actions for AI processing.
 * This ensures that sensitive API keys are not exposed to the browser.
 */
export const aiService = {
    async generateDescription(file: File): Promise<string> {
        const formData = new FormData();
        formData.append('file', file);
        return await generateDescriptionAction(formData);
    },

    async detectCategory(file: File, description: string): Promise<string> {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('description', description);
        return await detectCategoryAction(formData);
    },

    async generateTitleAndDescription(file: File): Promise<AIPackSuggestion> {
        const formData = new FormData();
        formData.append('file', file);
        return await generateTitleAndDescriptionAction(formData);
    }
};
