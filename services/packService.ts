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
    category?: string; // Nueva categoría automática
    pickupLocation?: string;
    pickupWindows?: string[];
    status: 'available' | 'reserved' | 'sold' | 'expired' | 'archived';
    isFree: boolean; // Indicador si el pack es gratuito
    // Geolocalización
    latitude?: number;
    longitude?: number;
    city?: string;
    neighborhood?: string;
    distanceKm?: number; // Calculado desde ubicación del usuario
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
        const { data: activeBookings, error: bookingsError } = await supabase
            .from('bookings')
            .select('pack_id')
            .in('status', ['pending', 'confirmed'])

        if (bookingsError) {
            console.error("Error fetching bookings:", bookingsError)
        }

        console.log(`[packService] Reservas activas encontradas: ${activeBookings?.length || 0}`)
        if (activeBookings && activeBookings.length > 0) {
            console.log('[packService] Pack IDs reservados:', activeBookings.map(b => b.pack_id))
        }

        const bookedPackIds = new Set((activeBookings || []).map(b => b.pack_id))

        // Filter out packs that are already booked
        const availablePacks = packs.filter(p => !bookedPackIds.has(p.id))

        console.log(`[packService] Packs disponibles después de filtrar: ${availablePacks.length}`)

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
            category: p.category || 'Sin categoría',
            pickupLocation: p.pickup_location,
            pickupWindows: p.pickup_windows || [],
            status: p.status || 'available',
            isFree: p.is_free === true,
            // Campos de geolocalización
            latitude: p.latitude,
            longitude: p.longitude,
            city: p.city,
            neighborhood: p.neighborhood,
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
            category: data.category || 'Sin categoría',
            pickupLocation: data.pickup_location,
            pickupWindows: data.pickup_windows || [],
            status: data.status || 'available',
            isFree: data.is_free === true,
            // Campos de geolocalización
            latitude: data.latitude,
            longitude: data.longitude,
            city: data.city,
            neighborhood: data.neighborhood,
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
                category: pack.category || 'Sin categoría', // Guardar la categoría
                location: pack.location,
                distance: pack.distance,
                pickup_location: pack.pickupLocation,
                pickup_windows: pack.pickupWindows || [],
                is_free: pack.isFree || false, // Guardar si es gratuito
                // Guardar geolocalización
                latitude: pack.latitude,
                longitude: pack.longitude,
                city: pack.city,
                neighborhood: pack.neighborhood,
                seller_id: user.id,
                seller_name: user.user_metadata.full_name || pack.sellerName || "Usuario Pack2Pack",
                expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
                created_at: new Date().toISOString()
            })
            .select('*, is_free')
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
            category: p.category || 'Sin categoría',
            pickupLocation: p.pickup_location,
            pickupWindows: p.pickup_windows || [],
            status: p.status || 'available',
            isFree: p.is_free === true,
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
                is_free: pack.isFree,
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
    },

    /**
     * Internal method to mark pack as sold after transaction completion
     * Used by bookingService when both parties validate the transaction
     * Uses a PostgreSQL function with SECURITY DEFINER to bypass RLS
     */
    async markPackAsSold(packId: string): Promise<void> {
        
        // Call PostgreSQL function with SECURITY DEFINER to bypass RLS
        const { error } = await supabase.rpc('mark_pack_as_sold', {
            pack_id_param: packId
        })

        if (error) {
            console.error("[markPackAsSold] Error al actualizar:", error)
            throw error
        }
        
    },

    /**
     * Internal method to mark pack as reserved when booking is created
     * Uses a PostgreSQL function with SECURITY DEFINER to bypass RLS
     */
    async markPackAsReserved(packId: string): Promise<void> {
        
        const { error } = await supabase.rpc('mark_pack_as_reserved', {
            pack_id_param: packId
        })

        if (error) {
            console.error("[markPackAsReserved] Error al actualizar:", error)
            throw error
        }
        
    },

    /**
     * Internal method to mark pack as available when booking is cancelled
     * Uses a PostgreSQL function with SECURITY DEFINER to bypass RLS
     */
    async markPackAsAvailable(packId: string): Promise<void> {
        
        const { error } = await supabase.rpc('mark_pack_as_available', {
            pack_id_param: packId
        })

        if (error) {
            console.error("[markPackAsAvailable] Error al actualizar:", error)
            throw error
        }
        
    },

    /**
     * Get packs filtered by category
     * Uses case-insensitive search (ilike) for flexibility
     */
    async getPacksByCategory(category: string): Promise<Pack[]> {
        // Handle unspecified category by returning all available packs
        if (!category || category === 'todo') {
            return this.getPacks()
        }

        const { data, error } = await supabase
            .from('packs')
            .select('*')
            .eq('status', 'available')
            .ilike('category', `%${category}%`)
            .order('created_at', { ascending: false })

        if (error) {
            console.error("[getPacksByCategory] Error fetching packs:", error)
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
            category: p.category || 'Sin categoría',
            pickupLocation: p.pickup_location,
            pickupWindows: p.pickup_windows || [],
            status: p.status || 'available',
            isFree: p.is_free === true,
        }))
    },

    /**
     * Get packs sorted by proximity to user location
     * @param userCoords User's current coordinates
     * @param radiusKm Maximum distance in kilometers (default: 50km)
     */
    async getPacksByProximity(userCoords: { latitude: number; longitude: number }, radiusKm: number = 50): Promise<Pack[]> {
        const { geoService } = await import('@/services/geoService')

        // Get all available packs with location data
        const { data: packs, error } = await supabase
            .from('packs')
            .select('*')
            .eq('status', 'available')
            .not('latitude', 'is', null)
            .not('longitude', 'is', null)
            .order('created_at', { ascending: false })

        if (error) {
            console.error("[getPacksByProximity] Error fetching packs:", error)
            return []
        }

        if (!packs || packs.length === 0) return []

        // Get active bookings to filter out reserved packs
        const { data: activeBookings } = await supabase
            .from('bookings')
            .select('pack_id')
            .in('status', ['pending', 'confirmed'])

        const bookedPackIds = new Set((activeBookings || []).map(b => b.pack_id))

        // Calculate distance for each pack and filter by radius
        const packsWithDistance = packs
            .filter(p => !bookedPackIds.has(p.id))
            .map(p => {
                const distance = geoService.calculateDistance(
                    userCoords,
                    { latitude: p.latitude!, longitude: p.longitude! }
                )
                
                return {
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
                    category: p.category || 'Sin categoría',
                    pickupLocation: p.pickup_location,
                    pickupWindows: p.pickup_windows || [],
                    status: p.status || 'available',
                    isFree: p.is_free === true,
                    latitude: p.latitude,
                    longitude: p.longitude,
                    city: p.city,
                    neighborhood: p.neighborhood,
                    distanceKm: distance
                } as Pack
            })
            .filter(p => p.distanceKm! <= radiusKm)
            .sort((a, b) => (a.distanceKm || 0) - (b.distanceKm || 0))

        console.log(`[getPacksByProximity] Encontrados ${packsWithDistance.length} packs dentro de ${radiusKm}km`)
        
        return packsWithDistance
    }
};


