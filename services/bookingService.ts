import { supabase } from "@/lib/supabase"
import { notificationService } from "@/services/notificationService"
import { packService } from "@/services/packService"

export type BookingStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled'

export interface Booking {
    id: string
    packId: string
    buyerId: string
    sellerId: string
    pickupCode: string
    selectedTimeWindow: string
    status: BookingStatus
    validatedBySeller: boolean
    validatedByBuyer: boolean
    validatedAt: string | null
    createdAt: string
    updatedAt: string
    // Joined data
    packTitle?: string
    packImageUrl?: string
    packPrice?: number
    packPickupLocation?: string
    buyerName?: string
    sellerName?: string
}

export const bookingService = {
    /**
     * Generate a random 4-digit pickup code
     */
    generatePickupCode(): string {
        return Math.floor(1000 + Math.random() * 9000).toString()
    },

    /**
     * Create a new booking for a pack
     */
    async createBooking(packId: string, selectedTimeWindow: string): Promise<Booking> {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) throw new Error("Must be logged in to create a booking")

        // Get pack details to verify it exists and get seller_id
        const { data: pack, error: packError } = await supabase
            .from('packs')
            .select('seller_id, title, pickup_windows')
            .eq('id', packId)
            .single()

        if (packError || !pack) throw new Error("Pack not found")
        if (pack.seller_id === user.id) throw new Error("Cannot book your own pack")

        // Verify selected time window is valid
        const availableWindows = pack.pickup_windows || []
        if (!availableWindows.includes(selectedTimeWindow)) {
            throw new Error("Franja horaria no válida")
        }

        // Check if user already has an active booking for this pack
        const { data: existingBooking } = await supabase
            .from('bookings')
            .select('id, status')
            .eq('pack_id', packId)
            .eq('buyer_id', user.id)
            .in('status', ['pending', 'confirmed'])

        if (existingBooking && existingBooking.length > 0) {
            throw new Error("Ya tienes una reserva activa para este pack")
        }

        // Check if pack is already booked by ANY user
        const { data: anyActiveBooking } = await supabase
            .from('bookings')
            .select('id, status')
            .eq('pack_id', packId)
            .in('status', ['pending', 'confirmed'])

        if (anyActiveBooking && anyActiveBooking.length > 0) {
            throw new Error("Este pack ya ha sido reservado por otro usuario")
        }

        const pickupCode = this.generatePickupCode()

        const { data, error } = await supabase
            .from('bookings')
            .insert({
                pack_id: packId,
                buyer_id: user.id,
                seller_id: pack.seller_id,
                pickup_code: pickupCode,
                selected_time_window: selectedTimeWindow,
                status: 'pending'
            })
            .select()
            .single()

        if (error) throw error

        // Mark pack as reserved
        try {
            await packService.markPackAsReserved(packId)
        } catch (packError) {
            console.error("Error marking pack as reserved:", packError)
            // Don't fail the booking if pack update fails
        }

        // Send notification to seller
        try {
            await notificationService.notifyNewBooking(pack.seller_id, pack.title, data.id)
        } catch (notifError) {
            console.error("Error sending notification:", notifError)
            // Don't fail the booking if notification fails
        }

        return this.mapBookingFromDb(data)
    },

    /**
     * Get all bookings for the current user (as buyer)
     */
    async getMyPurchases(): Promise<Booking[]> {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) throw new Error("Must be logged in")

        const { data, error } = await supabase
            .from('bookings')
            .select(`
                *,
                packs!bookings_pack_id_fkey (title, image_url, price, pickup_location),
                profiles!bookings_seller_id_fkey (full_name)
            `)
            .eq('buyer_id', user.id)
            .order('created_at', { ascending: false })

        if (error) {
            console.error("Error fetching purchases:", error)
            return []
        }

        return (data || []).map(b => ({
            ...this.mapBookingFromDb(b),
            packTitle: b.packs?.title,
            packImageUrl: b.packs?.image_url,
            packPrice: b.packs?.price,
            packPickupLocation: b.packs?.pickup_location,
            sellerName: b.profiles?.full_name || 'Vendedor',
        }))
    },

    /**
     * Get all bookings for packs owned by the current user (as seller)
     */
    async getMySales(): Promise<Booking[]> {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) throw new Error("Must be logged in")

        const { data, error } = await supabase
            .from('bookings')
            .select(`
                *,
                packs!bookings_pack_id_fkey (title, image_url, price, pickup_location),
                profiles!bookings_buyer_id_fkey (full_name)
            `)
            .eq('seller_id', user.id)
            .order('created_at', { ascending: false })

        if (error) {
            console.error("Error fetching sales:", error)
            return []
        }

        return (data || []).map(b => ({
            ...this.mapBookingFromDb(b),
            packTitle: b.packs?.title,
            packImageUrl: b.packs?.image_url,
            packPrice: b.packs?.price,
            packPickupLocation: b.packs?.pickup_location,
            buyerName: b.profiles?.full_name || 'Comprador',
        }))
    },

    /**
     * Get a specific booking by ID
     */
    async getBookingById(bookingId: string): Promise<Booking | null> {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) throw new Error("Must be logged in")

        const { data, error } = await supabase
            .from('bookings')
            .select(`
                *,
                packs!bookings_pack_id_fkey (title, image_url, price, pickup_location),
                buyer_profile:profiles!bookings_buyer_id_fkey (full_name),
                seller_profile:profiles!bookings_seller_id_fkey (full_name)
            `)
            .eq('id', bookingId)
            .single()

        if (error || !data) {
            console.error("Error fetching booking:", error)
            return null
        }

        // Verify user has access to this booking
        if (data.buyer_id !== user.id && data.seller_id !== user.id) {
            throw new Error("Unauthorized access to booking")
        }

        return {
            ...this.mapBookingFromDb(data),
            packTitle: data.packs?.title,
            packImageUrl: data.packs?.image_url,
            packPrice: data.packs?.price,
            packPickupLocation: data.packs?.pickup_location,
            buyerName: data.buyer_profile?.full_name || 'Comprador',
            sellerName: data.seller_profile?.full_name || 'Vendedor',
        }
    },

    /**
     * Seller validates the pickup code and confirms delivery
     */
    async validateBySeller(bookingId: string, inputCode: string): Promise<void> {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) throw new Error("Must be logged in")

        // Get booking with pack info
        const { data: booking, error: fetchError } = await supabase
            .from('bookings')
            .select('seller_id, buyer_id, pickup_code, status, validated_by_buyer, pack_id, packs!bookings_pack_id_fkey (title)')
            .eq('id', bookingId)
            .single()

        if (fetchError || !booking) throw new Error("Booking not found")
        if (booking.seller_id !== user.id) throw new Error("Unauthorized")
        if (booking.status === 'completed') throw new Error("Booking already completed")
        if (booking.status === 'cancelled') throw new Error("Booking is cancelled")

        // Verify code
        if (booking.pickup_code !== inputCode) {
            throw new Error("Código incorrecto. Verifica con el comprador.")
        }

        // Update booking
        const updates: any = {
            validated_by_seller: true,
            status: 'confirmed'
        }

        // If buyer also validated, mark as completed
        const willComplete = booking.validated_by_buyer
        if (willComplete) {
            updates.status = 'completed'
            updates.validated_at = new Date().toISOString()
        }

        const { error: updateError } = await supabase
            .from('bookings')
            .update(updates)
            .eq('id', bookingId)

        if (updateError) throw updateError

        // If transaction completed, mark pack as sold
        if (willComplete) {
            try {
                await packService.markPackAsSold(booking.pack_id)
            } catch (packError) {
                console.error("Error updating pack status:", packError)
            }
        }

        // Send notifications
        try {
            const packTitle = (booking as any).packs?.title || 'tu pack'
            
            // Notify buyer that seller validated
            await notificationService.notifySellerValidated(booking.buyer_id, packTitle, bookingId)

            // If transaction completed, notify both
            if (willComplete) {
                await notificationService.notifyTransactionCompleted(booking.buyer_id, booking.seller_id, packTitle, bookingId)
            }
        } catch (notifError) {
            console.error("Error sending notification:", notifError)
        }
    },

    /**
     * Buyer confirms receipt of the pack
     */
    async validateByBuyer(bookingId: string): Promise<void> {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) throw new Error("Must be logged in")

        // Get booking with pack info
        const { data: booking, error: fetchError } = await supabase
            .from('bookings')
            .select('buyer_id, seller_id, status, validated_by_seller, pack_id, packs!bookings_pack_id_fkey (title)')
            .eq('id', bookingId)
            .single()

        if (fetchError || !booking) throw new Error("Booking not found")
        if (booking.buyer_id !== user.id) throw new Error("Unauthorized")
        if (booking.status === 'completed') throw new Error("Booking already completed")
        if (booking.status === 'cancelled') throw new Error("Booking is cancelled")

        // Update booking
        const updates: any = {
            validated_by_buyer: true
        }

        // If seller also validated, mark as completed
        const willComplete = booking.validated_by_seller
        console.log(`[validateByBuyer] validated_by_seller: ${booking.validated_by_seller}, willComplete: ${willComplete}`)
        
        if (willComplete) {
            updates.status = 'completed'
            updates.validated_at = new Date().toISOString()
        }

        const { error: updateError } = await supabase
            .from('bookings')
            .update(updates)
            .eq('id', bookingId)

        if (updateError) throw updateError

        // If transaction completed, mark pack as sold
        if (willComplete) {
            try {
                await packService.markPackAsSold(booking.pack_id)
            } catch (packError) {
                console.error("Error updating pack status:", packError)
                // Re-throw the error so it's not silenced
                throw new Error(`Failed to mark pack as sold: ${packError}`)
            }
        } else {
            console.log(`[validateByBuyer] No se marca como sold porque vendedor aún no ha validado`)
        }

        // Send notifications
        try {
            const packTitle = (booking as any).packs?.title || 'el pack'
            
            // Notify seller that buyer confirmed
            await notificationService.notifyBuyerConfirmed(booking.seller_id, packTitle, bookingId)

            // If transaction completed, notify both
            if (willComplete) {
                await notificationService.notifyTransactionCompleted(booking.buyer_id, booking.seller_id, packTitle, bookingId)
            }
        } catch (notifError) {
            console.error("Error sending notification:", notifError)
        }
    },

    /**
     * Cancel a booking (only buyer can cancel pending bookings)
     */
    async cancelBooking(bookingId: string): Promise<void> {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) throw new Error("Must be logged in")

        const { data: booking, error: fetchError } = await supabase
            .from('bookings')
            .select('buyer_id, seller_id, status, pack_id, packs!bookings_pack_id_fkey (title)')
            .eq('id', bookingId)
            .single()

        if (fetchError || !booking) throw new Error("Booking not found")
        if (booking.buyer_id !== user.id) throw new Error("Unauthorized")
        if (booking.status !== 'pending') {
            throw new Error("Solo puedes cancelar reservas pendientes")
        }

        const { error } = await supabase
            .from('bookings')
            .update({ status: 'cancelled' })
            .eq('id', bookingId)

        if (error) throw error

        // Mark pack as available again
        try {
            await packService.markPackAsAvailable(booking.pack_id)
        } catch (packError) {
            console.error("Error marking pack as available:", packError)
        }

        // Notify seller about cancellation
        try {
            const packTitle = (booking as any).packs?.title || 'un pack'
            await notificationService.notifyBookingCancelled(booking.seller_id, packTitle)
        } catch (notifError) {
            console.error("Error sending notification:", notifError)
        }
    },

    /**
     * Check if a pack has an active booking (from current user)
     */
    async hasActiveBooking(packId: string): Promise<boolean> {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return false

        const { data, error } = await supabase
            .from('bookings')
            .select('id')
            .eq('pack_id', packId)
            .eq('buyer_id', user.id)
            .in('status', ['pending', 'confirmed'])
            .maybeSingle()  // Returns null if no match, instead of error

        // If there's an RLS error, assume no booking
        if (error) {
            console.log('[hasActiveBooking] Error (probably RLS):', error.message)
            return false
        }

        return !!data
    },

    /**
     * Check if a pack is already booked by ANY user
     */
    async isPackBooked(packId: string): Promise<boolean> {
        const { data, error } = await supabase
            .from('bookings')
            .select('id')
            .eq('pack_id', packId)
            .in('status', ['pending', 'confirmed'])
            .limit(1)
            .maybeSingle()  // Returns null if no match

        // If there's an RLS error, log it but don't fail
        if (error) {
            console.log('[isPackBooked] Error (probably RLS):', error.message)
            return false
        }

        return !!data
    },

    /**
     * Map database fields to camelCase interface
     */
    mapBookingFromDb(data: any): Booking {
        return {
            id: data.id,
            packId: data.pack_id,
            buyerId: data.buyer_id,
            sellerId: data.seller_id,
            pickupCode: data.pickup_code,
            selectedTimeWindow: data.selected_time_window,
            status: data.status,
            validatedBySeller: data.validated_by_seller,
            validatedByBuyer: data.validated_by_buyer,
            validatedAt: data.validated_at,
            createdAt: data.created_at,
            updatedAt: data.updated_at,
        }
    }
}
