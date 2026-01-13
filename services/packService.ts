export interface Pack {
    id: string;
    title: string;
    description: string;
    price: number;
    originalPrice: number;
    imageUrl: string;
    sellerName: string;
    location: string;
    distance: string; // e.g., "0.5 km"
    expiresAt: string; // ISO date
    tags: string[];
}

// Initial Mock Data
const MOCK_PACKS: Pack[] = [
    {
        id: "1",
        title: "Surprise Electronics Pack",
        description: "Various cables, a spare mouse, and some mechanical keyboard switches.",
        price: 15.00,
        originalPrice: 45.00,
        imageUrl: "https://images.unsplash.com/photo-1550009158-9ebf69173e03?q=80&w=600&auto=format&fit=crop",
        sellerName: "Alex Tech",
        location: "Downtown",
        distance: "1.2 km",
        expiresAt: new Date(Date.now() + 86400000).toISOString(),
        tags: ["Electronics", "Gadgets"],
    },
    {
        id: "2",
        title: "Art Supplies Bundle",
        description: "Unused acrylic paints, canvas, and brushes. I switched to digital art.",
        price: 12.50,
        originalPrice: 40.00,
        imageUrl: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?q=80&w=600&auto=format&fit=crop",
        sellerName: "Sarah Creative",
        location: "Westside",
        distance: "3.5 km",
        expiresAt: new Date(Date.now() + 172800000).toISOString(),
        tags: ["Art", "Hobby"],
    },
    {
        id: "3",
        title: "Mystery Book Box",
        description: "5 classic sci-fi novels in good condition.",
        price: 8.00,
        originalPrice: 55.00,
        imageUrl: "https://images.unsplash.com/photo-1512820790803-83ca734da794?q=80&w=600&auto=format&fit=crop",
        sellerName: "Bookworm Joe",
        location: "North Hills",
        distance: "0.8 km",
        expiresAt: new Date(Date.now() + 43200000).toISOString(),
        tags: ["Books", "Reading"],
    }
];

// simulate database delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const packService = {
    async getPacks(): Promise<Pack[]> {
        await delay(500); // simulate network
        // specific for client-side demo persistence, we could check localStorage here
        if (typeof window !== 'undefined') {
            const stored = localStorage.getItem('pack2pack_packs');
            if (stored) return JSON.parse(stored);
        }
        return MOCK_PACKS;
    },

    async getPackById(id: string): Promise<Pack | undefined> {
        await delay(300);
        const packs = await this.getPacks();
        return packs.find(p => p.id === id);
    },

    async createPack(pack: Omit<Pack, 'id' | 'sellerName' | 'distance'>): Promise<Pack> {
        await delay(800);
        const newPack: Pack = {
            ...pack,
            id: Math.random().toString(36).substr(2, 9),
            sellerName: "You (Demo User)",
            distance: "0.1 km",
        };

        // Update "DB"
        if (typeof window !== 'undefined') {
            const current = await this.getPacks();
            const updated = [newPack, ...current];
            localStorage.setItem('pack2pack_packs', JSON.stringify(updated));
        }

        return newPack;
    }
};
