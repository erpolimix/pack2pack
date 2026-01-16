"use client"

import { useState, useEffect, useCallback } from "react"
import { notificationService, type Notification } from "@/services/notificationService"

export function useNotifications() {
    const [notifications, setNotifications] = useState<Notification[]>([])
    const [unreadCount, setUnreadCount] = useState(0)
    const [isLoading, setIsLoading] = useState(true)

    const loadNotifications = useCallback(async () => {
        try {
            const [notifs, count] = await Promise.all([
                notificationService.getMyNotifications(),
                notificationService.getUnreadCount()
            ])
            setNotifications(notifs)
            setUnreadCount(count)
        } catch (error) {
            console.error("Error loading notifications:", error)
        } finally {
            setIsLoading(false)
        }
    }, [])

    const markAsRead = useCallback(async (notificationId: string) => {
        try {
            await notificationService.markAsRead(notificationId)
            setNotifications(prev =>
                prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
            )
            setUnreadCount(prev => Math.max(0, prev - 1))
        } catch (error) {
            console.error("Error marking notification as read:", error)
        }
    }, [])

    const markAllAsRead = useCallback(async () => {
        try {
            await notificationService.markAllAsRead()
            setNotifications(prev => prev.map(n => ({ ...n, read: true })))
            setUnreadCount(0)
        } catch (error) {
            console.error("Error marking all as read:", error)
        }
    }, [])

    const refresh = useCallback(() => {
        loadNotifications()
    }, [loadNotifications])

    // Initial load
    useEffect(() => {
        loadNotifications()
    }, [loadNotifications])

    // Poll for updates every 30 seconds
    useEffect(() => {
        const interval = setInterval(() => {
            loadNotifications()
        }, 30000)

        return () => clearInterval(interval)
    }, [loadNotifications])

    return {
        notifications,
        unreadCount,
        isLoading,
        markAsRead,
        markAllAsRead,
        refresh
    }
}
