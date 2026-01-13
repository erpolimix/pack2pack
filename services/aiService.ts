// Mock AI service
// In a real app, this would call OpenAI Vision API or similar

export const aiService = {
    async generateDescription(_file: File): Promise<string> {
        // Simulate upload and processing time
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Basic heuristic based on filename just for fun, or random
        const options = [
            "A curated collection of items including vintage accessories and lightly used home decor. Perfect for collectors.",
            "A pack containing assorted electronic cables, a pristine mechanical keyboard, and various tech gadgets in great condition.",
            "An assortment of kitchenware, ceramic plates, and cutlery. Ideal for a starter home or student.",
            "A bundle of outdoor gear, including a sturdy backpack and hiking accessories. Ready for your next adventure."
        ];

        // Return a random description for the simulator
        return options[Math.floor(Math.random() * options.length)];
    }
};
