"use client"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useNotifications } from "@/lib/useNotifications"
import { Bell, ShoppingCart, CheckCircle, PartyPopper, XCircle, Star, Package, Sparkles } from "lucide-react"

export function NotificationBell() {
    const [isOpen, setIsOpen] = useState(false)
    const dropdownRef = useRef<HTMLDivElement>(null)
    const router = useRouter()
    const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications()

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false)
            }
        }

        if (isOpen) {
            document.addEventListener("mousedown", handleClickOutside)
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside)
        }
    }, [isOpen])

    const handleNotificationClick = async (notification: any) => {
        if (!notification.read) {
            await markAsRead(notification.id)
        }
        setIsOpen(false)
        if (notification.link) {
            router.push(notification.link)
        }
    }

    const handleMarkAllAsRead = async (e: React.MouseEvent) => {
        e.stopPropagation()
        await markAllAsRead()
    }

    const getNotificationIcon = (type: string) => {
        const iconMap: Record<string, { icon: any; color: string; bg: string }> = {
            booking_created: { icon: ShoppingCart, color: "text-blue-600", bg: "bg-blue-50" },
            booking_validated_seller: { icon: CheckCircle, color: "text-green-600", bg: "bg-green-50" },
            booking_validated_buyer: { icon: CheckCircle, color: "text-green-600", bg: "bg-green-50" },
            booking_completed: { icon: PartyPopper, color: "text-purple-600", bg: "bg-purple-50" },
            booking_cancelled: { icon: XCircle, color: "text-red-600", bg: "bg-red-50" },
            rating_received: { icon: Star, color: "text-yellow-600", bg: "bg-yellow-50" },
            pack_sold: { icon: Package, color: "text-brand-primary", bg: "bg-brand-light" }
        }
        return iconMap[type] || { icon: Bell, color: "text-gray-600", bg: "bg-gray-50" }
    }

    const formatTime = (dateString: string): string => {
        const date = new Date(dateString)
        const now = new Date()
        const diffMs = now.getTime() - date.getTime()
        const diffMins = Math.floor(diffMs / 60000)
        const diffHours = Math.floor(diffMs / 3600000)
        const diffDays = Math.floor(diffMs / 86400000)

        if (diffMins < 1) return "Ahora mismo"
        if (diffMins < 60) return `Hace ${diffMins}min`
        if (diffHours < 24) return `Hace ${diffHours}h`
        if (diffDays < 7) return `Hace ${diffDays}d`
        return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })
    }

    return (
        <div className="relative" ref={dropdownRef}>
            {/* Bell Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2.5 text-brand-dark hover:bg-brand-light/80 rounded-xl transition-all duration-200 hover:scale-105"
                aria-label="Notificaciones"
            >
                <Bell className="w-5 h-5" strokeWidth={2.5} />
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-gradient-to-br from-brand-primary to-brand-dark text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1 shadow-lg animate-pulse">
                        {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                )}
            </button>

            {/* Dropdown Panel */}
            {isOpen && (
                <div className="absolute right-0 mt-3 w-[340px] md:w-[400px] bg-white rounded-2xl shadow-2xl border border-brand-primary/10 z-50 max-h-[550px] flex flex-col overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                    {/* Header */}
                    <div className="px-5 py-4 bg-gradient-to-r from-brand-primary/5 to-brand-light/50 border-b border-brand-primary/10">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Sparkles className="w-5 h-5 text-brand-primary" strokeWidth={2.5} />
                                <h3 className="font-bold text-lg text-brand-dark tracking-tight">Actividad</h3>
                            </div>
                            {unreadCount > 0 && (
                                <button
                                    onClick={handleMarkAllAsRead}
                                    className="text-xs font-semibold text-brand-primary hover:text-brand-dark transition-colors px-3 py-1.5 rounded-lg hover:bg-white/80"
                                >
                                    Marcar leídas
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Notifications list */}
                    <div className="overflow-y-auto flex-1 bg-gray-50/30">
                        {notifications.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-16 px-6">
                                <div className="w-16 h-16 bg-brand-light rounded-full flex items-center justify-center mb-4">
                                    <Bell className="w-8 h-8 text-brand-primary/40" strokeWidth={2} />
                                </div>
                                <p className="text-sm font-medium text-gray-500">Sin notificaciones</p>
                                <p className="text-xs text-gray-400 mt-1">Te avisaremos de tu actividad</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-gray-100">
                                {notifications.map((notification) => {
                                    const iconConfig = getNotificationIcon(notification.type)
                                    const IconComponent = iconConfig.icon
                                    
                                    return (
                                        <button
                                            key={notification.id}
                                            onClick={() => handleNotificationClick(notification)}
                                            className={`w-full p-4 hover:bg-white transition-all text-left group ${
                                                !notification.read ? "bg-brand-cream/40" : "bg-transparent"
                                            }`}
                                        >
                                            <div className="flex items-start gap-3.5">
                                                {/* Icon */}
                                                <div className={`${iconConfig.bg} w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform`}>
                                                    <IconComponent className={`w-5 h-5 ${iconConfig.color}`} strokeWidth={2.5} />
                                                </div>
                                                
                                                {/* Content */}
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-semibold text-brand-dark text-sm mb-0.5 leading-snug">
                                                        {notification.title}
                                                    </p>
                                                    <p className="text-sm text-gray-600 leading-relaxed line-clamp-2 mb-1.5">
                                                        {notification.message}
                                                    </p>
                                                    <p className="text-xs text-gray-400 font-medium">
                                                        {formatTime(notification.createdAt)}
                                                    </p>
                                                </div>
                                                
                                                {/* Unread indicator */}
                                                {!notification.read && (
                                                    <span className="w-2 h-2 bg-brand-primary rounded-full flex-shrink-0 mt-2 ring-2 ring-brand-primary/20"></span>
                                                )}
                                            </div>
                                        </button>
                                    )
                                })}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}
