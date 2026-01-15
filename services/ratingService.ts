import { supabase } from "@/lib/supabase"

export interface Rating {
    id: string
    bookingId: string
    ratedById: string
    ratedToId: string
    rating: number
    comment: string | null
    createdAt: string
    updatedAt: string
    // Joined data
    raterName?: string
    raterImageUrl?: string
}

export interface UserRatingsStats {
    averageRating: number
    totalRatings: number
    ratingDistribution: {
        [key: number]: number  // count by star (1-5)
    }
}

export const ratingService = {
    /**
     * Create a new rating for a completed booking
     * Only the buyer can rate the seller, only one rating per booking
     */
    async createRating(bookingId: string, rating: number, comment?: string): Promise<Rating> {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) throw new Error("Must be logged in to rate")

        if (rating < 1 || rating > 5) throw new Error("Rating must be between 1 and 5")

        // Get booking details to verify it belongs to the current user as buyer
        const { data: booking, error: bookingError } = await supabase
            .from('bookings')
            .select('id, buyer_id, seller_id, status')
            .eq('id', bookingId)
            .single()

        if (bookingError || !booking) throw new Error("Booking not found")
        if (booking.buyer_id !== user.id) throw new Error("Only the buyer can rate this transaction")
        if (booking.status !== 'completed') throw new Error("Can only rate completed transactions")

        // Check if rating already exists for this booking
        const { data: existingRating } = await supabase
            .from('ratings')
            .select('id')
            .eq('booking_id', bookingId)
            .single()

        if (existingRating) throw new Error("This transaction has already been rated")

        // Create the rating
        const { data, error } = await supabase
            .from('ratings')
            .insert({
                booking_id: bookingId,
                rated_by_id: user.id,
                rated_to_id: booking.seller_id,
                rating: rating,
                comment: comment || null
            })
            .select()
            .single()

        if (error) throw error

        return mapRatingFromDb(data)
    },

    /**
     * Get all ratings for a specific user (public data)
     */
    async getRatingsForUser(userId: string): Promise<Rating[]> {
        const { data, error } = await supabase
            .from('ratings')
            .select(`
                *,
                rater:profiles!ratings_rated_by_id_fkey (full_name, avatar_url)
            `)
            .eq('rated_to_id', userId)
            .order('created_at', { ascending: false })

        if (error) {
            console.error("Error fetching ratings:", error)
            return []
        }

        return (data || []).map(r => ({
            ...mapRatingFromDb(r),
            raterName: r.rater?.full_name || 'Usuario',
            raterImageUrl: r.rater?.avatar_url
        }))
    },

    /**
     * Get rating statistics for a user
     */
    async getRatingsStats(userId: string): Promise<UserRatingsStats> {
        const { data, error } = await supabase
            .from('ratings')
            .select('rating')
            .eq('rated_to_id', userId)
        
        if (error || !data) {
            return {
                averageRating: 0,
                totalRatings: 0,
                ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
            }
        }

        const totalRatings = data.length
        if (totalRatings === 0) {
            return {
                averageRating: 0,
                totalRatings: 0,
                ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
            }
        }

        const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
        let sum = 0

        data.forEach(r => {
            sum += r.rating
            distribution[r.rating as keyof typeof distribution]++
        })

        const result = {
            averageRating: sum / totalRatings,
            totalRatings,
            ratingDistribution: distribution
        }
        return result
    },

    /**
     * Check if a booking has been rated
     */
    async isBookingRated(bookingId: string): Promise<boolean> {
        const { data } = await supabase
            .from('ratings')
            .select('id')
            .eq('booking_id', bookingId)
            .single()

        return !!data
    },

    /**
     * Get rating for a specific booking (if it exists)
     */
    async getRatingForBooking(bookingId: string): Promise<Rating | null> {
        const { data, error } = await supabase
            .from('ratings')
            .select(`
                *,
                rater:profiles!ratings_rated_by_id_fkey (full_name, avatar_url)
            `)
            .eq('booking_id', bookingId)
            .single()

        if (error || !data) return null

        return {
            ...mapRatingFromDb(data),
            raterName: data.rater?.full_name || 'Usuario',
            raterImageUrl: data.rater?.avatar_url
        }
    },

    /**
     * Update a rating (only the creator can update)
     */
    async updateRating(ratingId: string, rating: number, comment?: string): Promise<Rating> {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) throw new Error("Must be logged in")

        if (rating < 1 || rating > 5) throw new Error("Rating must be between 1 and 5")

        // Verify user owns this rating
        const { data: existingRating } = await supabase
            .from('ratings')
            .select('rated_by_id')
            .eq('id', ratingId)
            .single()

        if (!existingRating || existingRating.rated_by_id !== user.id) {
            throw new Error("Unauthorized - you can only update your own ratings")
        }

        const { data, error } = await supabase
            .from('ratings')
            .update({
                rating: rating,
                comment: comment || null
            })
            .eq('id', ratingId)
            .select()
            .single()

        if (error) throw error

        return mapRatingFromDb(data)
    },

    /**
     * Delete a rating (only the creator can delete)
     */
    async deleteRating(ratingId: string): Promise<void> {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) throw new Error("Must be logged in")

        // Verify user owns this rating
        const { data: existingRating } = await supabase
            .from('ratings')
            .select('rated_by_id')
            .eq('id', ratingId)
            .single()

        if (!existingRating || existingRating.rated_by_id !== user.id) {
            throw new Error("Unauthorized - you can only delete your own ratings")
        }

        const { error } = await supabase
            .from('ratings')
            .delete()
            .eq('id', ratingId)

        if (error) throw error
    }
}

/**
 * Map database record to interface (snake_case to camelCase)
 */
function mapRatingFromDb(data: any): Rating {
    return {
        id: data.id,
        bookingId: data.booking_id,
        ratedById: data.rated_by_id,
        ratedToId: data.rated_to_id,
        rating: data.rating,
        comment: data.comment,
        createdAt: data.created_at,
        updatedAt: data.updated_at
    }
}
