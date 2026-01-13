export const authService = {
    async login(email: string) {
        // Simulate login
        await new Promise(resolve => setTimeout(resolve, 500));
        return {
            id: "user_123",
            email,
            name: "Demo User",
            avatar: "https://github.com/shadcn.png"
        };
    },

    async isAuthenticated() {
        return true; // Always authenticated for MVP ease unless we implement real login flow state
    }
};
