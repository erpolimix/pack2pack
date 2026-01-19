import { supabase } from "@/lib/supabase"

export type NotificationType = 
    | 'booking_created'
    | 'booking_validated_seller'
    | 'booking_validated_buyer'
    | 'booking_completed'
    | 'booking_cancelled'
    | 'rating_received'
    | 'pack_sold'
    | 'exchange_proposed'
    | 'exchange_accepted'
    | 'exchange_rejected'
    | 'exchange_completed'
    | 'exchange_cancelled'

export interface Notification {
    id: string
    userId: string
    type: NotificationType
    title: string
    message: string
    link?: string
    read: boolean
    createdAt: string
    metadata: Record<string, any>
}

export const notificationService = {
    /**
     * Get all notifications for current user
     */
    async getMyNotifications(): Promise<Notification[]> {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return []

        const { data, error } = await supabase
            .from('notifications')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .limit(50)

        if (error) {
            console.error("Error fetching notifications:", error)
            return []
        }

        return (data || []).map(n => ({
            id: n.id,
            userId: n.user_id,
            type: n.type,
            title: n.title,
            message: n.message,
            link: n.link,
            read: n.read,
            createdAt: n.created_at,
            metadata: n.metadata || {}
        }))
    },

    /**
     * Get unread count for current user
     */
    async getUnreadCount(): Promise<number> {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return 0

        const { count, error } = await supabase
            .from('notifications')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', user.id)
            .eq('read', false)

        if (error) {
            console.error("Error fetching unread count:", error)
            return 0
        }

        return count || 0
    },

    /**
     * Mark notification as read
     */
    async markAsRead(notificationId: string): Promise<void> {
        const { error } = await supabase
            .from('notifications')
            .update({ read: true })
            .eq('id', notificationId)

        if (error) {
            console.error("Error marking notification as read:", error)
            throw error
        }
    },

    /**
     * Mark all notifications as read
     */
    async markAllAsRead(): Promise<void> {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        const { error } = await supabase
            .from('notifications')
            .update({ read: true })
            .eq('user_id', user.id)
            .eq('read', false)

        if (error) {
            console.error("Error marking all as read:", error)
            throw error
        }
    },

    /**
     * Create a notification for a user
     */
    async createNotification(
        userId: string,
        type: NotificationType,
        title: string,
        message: string,
        link?: string,
        metadata?: Record<string, any>
    ): Promise<void> {
        const { error } = await supabase
            .from('notifications')
            .insert({
                user_id: userId,
                type,
                title,
                message,
                link,
                metadata: metadata || {}
            })

        if (error) {
            console.error("Error creating notification:", error)
            throw error
        }
    },

    /**
     * Helper: Notify seller about new booking
     */
    async notifyNewBooking(sellerId: string, packTitle: string, bookingId: string): Promise<void> {
        await this.createNotification(
            sellerId,
            'booking_created',
            'Nueva reserva recibida',
            `Tienes una nueva reserva para "${packTitle}". ¡Revisa los detalles!`,
            '/my-sales',
            { bookingId }
        )
    },

    /**
     * Helper: Notify buyer that seller validated
     */
    async notifySellerValidated(buyerId: string, packTitle: string, bookingId: string): Promise<void> {
        await this.createNotification(
            buyerId,
            'booking_validated_seller',
            'Entrega confirmada',
            `El vendedor ha validado la entrega de "${packTitle}". ¡Confirma que lo recibiste!`,
            '/my-purchases',
            { bookingId }
        )
    },

    /**
     * Helper: Notify seller that buyer confirmed receipt
     */
    async notifyBuyerConfirmed(sellerId: string, packTitle: string, bookingId: string): Promise<void> {
        await this.createNotification(
            sellerId,
            'booking_validated_buyer',
            'Comprador confirmó recepción',
            `El comprador ha confirmado la recepción de "${packTitle}". ¡Transacción completada!`,
            '/my-sales',
            { bookingId }
        )
    },

    /**
     * Helper: Notify both when transaction is completed
     */
    async notifyTransactionCompleted(
        buyerId: string,
        sellerId: string,
        packTitle: string,
        bookingId: string
    ): Promise<void> {
        await Promise.all([
            this.createNotification(
                buyerId,
                'booking_completed',
                'Transacción completada',
                `Tu compra de "${packTitle}" se ha completado. ¡No olvides valorar al vendedor!`,
                '/my-purchases',
                { bookingId }
            ),
            this.createNotification(
                sellerId,
                'booking_completed',
                'Venta completada',
                `Tu venta de "${packTitle}" se ha completado. ¡No olvides valorar al comprador!`,
                '/my-sales',
                { bookingId }
            )
        ])
    },

    /**
     * Helper: Notify about received rating
     */
    async notifyRatingReceived(
        ratedUserId: string,
        raterName: string,
        rating: number,
        packTitle: string
    ): Promise<void> {
        const stars = '⭐'.repeat(rating)
        await this.createNotification(
            ratedUserId,
            'rating_received',
            '⭐ Nueva valoración',
            `${raterName} te ha valorado con ${stars} por "${packTitle}"`,
            '/profile',
            { rating }
        )
    },

    /**
     * Helper: Notify buyer that booking was cancelled
     */
    async notifyBookingCancelled(buyerId: string, packTitle: string): Promise<void> {
        await this.createNotification(
            buyerId,
            'booking_cancelled',
            'Reserva cancelada',
            `Tu reserva de "${packTitle}" ha sido cancelada.`,
            '/my-purchases',
            {}
        )
    }
}
