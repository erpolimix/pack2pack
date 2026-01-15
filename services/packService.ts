import { supabase } from "@/lib/supabase"

export interface Pack {
    id: string;
    title: string;
    description: string;
    price: number;
    originalPrice: number;
    imageUrl: string;
    sellerName: string;
    seller_id: string;
    location: string;
    distance: string;
    expiresAt: string;
    tags: string[];
    pickupLocation?: string;
    pickupWindows?: string[];
    status: 'available' | 'sold' | 'expired' | 'archived';
}

export const packService = {
    async getPacks(): Promise<Pack[]> {
        // First get all available packs
        const { data: packs, error } = await supabase
            .from('packs')
            .select('*')
            .eq('status', 'available')
            .order('created_at', { ascending: false })

        if (error) {
            console.error("Error fetching packs:", error)
            return []
        }

        if (!packs || packs.length === 0) return []

        // Get all active bookings (pending or confirmed)
        const { data: activeBookings } = await supabase
            .from('bookings')
            .select('pack_id')
            .in('status', ['pending', 'confirmed'])

        const bookedPackIds = new Set((activeBookings || []).map(b => b.pack_id))

        // Filter out packs that are already booked
        const availablePacks = packs.filter(p => !bookedPackIds.has(p.id))

        return availablePacks.map(p => ({
            id: p.id,
            title: p.title,
            description: p.description,
            price: Number(p.price),
            originalPrice: Number(p.original_price),
            imageUrl: p.image_url,
            sellerName: p.seller_name,
            seller_id: p.seller_id,
            location: p.location,
            distance: p.distance,
            expiresAt: p.expires_at,
            tags: p.tags || [],
            pickupLocation: p.pickup_location,
            pickupWindows: p.pickup_windows || [],
            status: p.status || 'available',
        }))
    },

    async getPackById(id: string): Promise<Pack | undefined> {
        const { data, error } = await supabase
            .from('packs')
            .select('*')
            .eq('id', id)
            .single()

        if (error || !data) {
            console.error("Error fetching pack by ID:", error)
            return undefined
        }

        return {
            id: data.id,
            title: data.title,
            description: data.description,
            price: Number(data.price),
            originalPrice: Number(data.original_price),
            imageUrl: data.image_url,
            sellerName: data.seller_name,
            seller_id: data.seller_id,
            location: data.location,
            distance: data.distance,
            expiresAt: data.expires_at,
            tags: data.tags || [],
            pickupLocation: data.pickup_location,
            pickupWindows: data.pickup_windows || [],
            status: data.status || 'available',
        }
    },

    async createPack(pack: Omit<Pack, "id" | "expiresAt" | "seller_id" | "status">) {
        // Get real user
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) throw new Error("Must be logged in to create a pack")

        const { data, error } = await supabase
            .from('packs')
            .insert({
                title: pack.title,
                description: pack.description,
                price: pack.price,
                original_price: pack.originalPrice,
                image_url: pack.imageUrl,
                tags: pack.tags,
                location: pack.location,
                distance: pack.distance,
                pickup_location: pack.pickupLocation,
                pickup_windows: pack.pickupWindows || [],
                seller_id: user.id,
                seller_name: user.user_metadata.full_name || pack.sellerName || "Usuario Pack2Pack",
                expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
                created_at: new Date().toISOString()
            })
            .select()
            .single()

        if (error) throw error
        return data as Pack
    },

    async uploadImage(file: File) {
        const fileExt = file.name.split('.').pop()
        const fileName = `${Math.random()}.${fileExt}`
        const filePath = `${fileName}`

        const { error: uploadError } = await supabase.storage
            .from('pack-images')
            .upload(filePath, file)

        if (uploadError) {
            throw uploadError
        }

        const { data } = supabase.storage
            .from('pack-images')
            .getPublicUrl(filePath)

        return data.publicUrl
    },

    async deletePack(packId: string) {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) throw new Error("Must be logged in to delete")

        // Check ownership
        const { data: pack } = await supabase
            .from('packs')
            .select('seller_id')
            .eq('id', packId)
            .single()

        if (!pack) throw new Error("Pack not found")
        if (pack.seller_id !== user.id) {
            throw new Error("Unauthorized: You can only delete your own packs")
        }

        const { error } = await supabase
            .from('packs')
            .delete()
            .eq('id', packId)

        if (error) {
            console.error("Error deleting pack:", error)
            throw error
        }
    },

    async getPacksByUser(userId: string): Promise<Pack[]> {
        const { data, error } = await supabase
            .from('packs')
            .select('*')
            .eq('seller_id', userId)
            .order('created_at', { ascending: false })

        if (error) {
            console.error("Error fetching packs by user:", error)
            return []
        }

        return (data || []).map(p => ({
            id: p.id,
            title: p.title,
            description: p.description,
            price: Number(p.price),
            originalPrice: Number(p.original_price),
            imageUrl: p.image_url,
            sellerName: p.seller_name,
            seller_id: p.seller_id,
            location: p.location,
            distance: p.distance,
            expiresAt: p.expires_at,
            tags: p.tags || [],
            pickupLocation: p.pickup_location,
            pickupWindows: p.pickup_windows || [],
            status: p.status || 'available',
        }))
    },

    async updatePack(packId: string, pack: Partial<Pack>) {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) throw new Error("Must be logged in to update")

        const { data: existingPack } = await supabase
            .from('packs')
            .select('seller_id')
            .eq('id', packId)
            .single()

        if (!existingPack) throw new Error("Pack not found")
        if (existingPack.seller_id !== user.id) {
            throw new Error("Unauthorized: You can only update your own packs")
        }

        const { error } = await supabase
            .from('packs')
            .update({
                title: pack.title,
                description: pack.description,
                price: pack.price,
                original_price: pack.originalPrice,
                image_url: pack.imageUrl,
                tags: pack.tags,
                location: pack.location,
                pickup_location: pack.pickupLocation,
                pickup_windows: pack.pickupWindows,
            })
            .eq('id', packId)

        if (error) throw error
    },

    async updatePackStatus(packId: string, status: 'available' | 'sold' | 'expired' | 'archived') {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) throw new Error("Must be logged in to update")

        const { data: existingPack } = await supabase
            .from('packs')
            .select('seller_id')
            .eq('id', packId)
            .single()

        if (!existingPack) throw new Error("Pack not found")
        if (existingPack.seller_id !== user.id) {
            throw new Error("Unauthorized: You can only update your own packs")
        }

        const { error } = await supabase
            .from('packs')
            .update({ status })
            .eq('id', packId)

        if (error) {
            console.error("Error updating pack status:", error)
            throw error
        }
    }
};

