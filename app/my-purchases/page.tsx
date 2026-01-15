"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { bookingService, type Booking } from "@/services/bookingService"
import { ratingService } from "@/services/ratingService"
import { authService } from "@/services/authService"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Toast } from "@/components/ui/toast"
import { useToast } from "@/lib/useToast"
import { Clock, MapPin, Package, CheckCircle, XCircle, Calendar, Star } from "lucide-react"
import { RatingModal } from "@/components/rating-modal"
import Image from "next/image"
import Link from "next/link"

export default function MyPurchasesPage() {
    const router = useRouter()
    const [purchases, setPurchases] = useState<Booking[]>([])
    const [loading, setLoading] = useState(true)
    const [ratingModalOpen, setRatingModalOpen] = useState(false)
    const [selectedBookingId, setSelectedBookingId] = useState<string | null>(null)
    const [ratedBookings, setRatedBookings] = useState<Set<string>>(new Set())
    const { toast, showSuccess, showError, hideToast } = useToast()

    useEffect(() => {
        checkAuthAndLoad()
    }, [])

    const checkAuthAndLoad = async () => {
        try {
            const user = await authService.getUser()
            if (!user) {
                router.push('/login')
                return
            }
            await loadPurchases()
        } catch (error) {
            console.error(error)
            showError("Error al cargar tus compras")
        } finally {
            setLoading(false)
        }
    }

    const loadPurchases = async () => {
        try {
            const data = await bookingService.getMyPurchases()
            setPurchases(data)
            
            // Check which bookings have been rated
            const ratedIds = new Set<string>()
            for (const booking of data) {
                const isRated = await ratingService.isBookingRated(booking.id)
                if (isRated) {
                    ratedIds.add(booking.id)
                }
            }
            setRatedBookings(ratedIds)
        } catch (error) {
            console.error(error)
            showError("Error al cargar tus compras")
        }
    }

    const handleConfirmReceipt = async (bookingId: string) => {
        try {
            await bookingService.validateByBuyer(bookingId)
            showSuccess("¡Recogida confirmada! Gracias por tu compra")
            await loadPurchases()
        } catch (error) {
            console.error(error)
            showError(error instanceof Error ? error.message : "Error al confirmar")
        }
    }

    const handleCancelBooking = async (bookingId: string) => {
        if (!confirm("¿Seguro que quieres cancelar esta reserva?")) return

        try {
            await bookingService.cancelBooking(bookingId)
            showSuccess("Reserva cancelada")
            await loadPurchases()
        } catch (error) {
            console.error(error)
            showError(error instanceof Error ? error.message : "Error al cancelar")
        }
    }

    const getStatusBadge = (booking: Booking) => {
        switch (booking.status) {
            case 'pending':
                return <Badge className="bg-yellow-500">Pendiente</Badge>
            case 'confirmed':
                return <Badge className="bg-blue-500">Confirmada</Badge>
            case 'completed':
                return <Badge className="bg-green-600">Completada</Badge>
            case 'cancelled':
                return <Badge className="bg-gray-500">Cancelada</Badge>
            default:
                return null
        }
    }

    const formatDate = (dateString: string) => {
        const date = new Date(dateString)
        return new Intl.DateTimeFormat('es-ES', {
            day: '2-digit',
            month: 'short',
            hour: '2-digit',
            minute: '2-digit'
        }).format(date)
    }

    if (loading) {
        return (
            <div className="container mx-auto px-6 py-12">
                <div className="text-center">Cargando tus compras...</div>
            </div>
        )
    }

    return (
        <div className="container mx-auto px-6 py-12">
            <div className="max-w-4xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-brand-dark mb-2">Mis Compras</h1>
                        <p className="text-gray-600">Gestiona tus reservas y recogidas</p>
                    </div>
                    <Link href="/">
                        <Button variant="outline">Explorar Packs</Button>
                    </Link>
                </div>

                {purchases.length === 0 ? (
                    <Card className="p-12 text-center">
                        <Package className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                        <h2 className="text-xl font-bold mb-2">No tienes compras todavía</h2>
                        <p className="text-gray-600 mb-6">Explora los packs disponibles y haz tu primera reserva</p>
                        <Link href="/">
                            <Button className="bg-brand-primary hover:bg-brand-dark">
                                Ver Packs
                            </Button>
                        </Link>
                    </Card>
                ) : (
                    <div className="space-y-4">
                        {purchases.map((booking) => (
                            <Card key={booking.id} className="p-4 md:p-6">
                                <div className="flex flex-col md:flex-row gap-4 md:gap-6">
                                    {/* Image */}
                                    <div className="relative w-full md:w-32 h-40 md:h-32 rounded-xl overflow-hidden flex-shrink-0">
                                        <Image
                                            src={booking.packImageUrl || 'https://images.unsplash.com/photo-1546213290-e1fc4f6d4f75?auto=format&fit=crop&q=80&w=600'}
                                            alt={booking.packTitle || 'Pack'}
                                            fill
                                            className="object-cover"
                                        />
                                    </div>

                                    {/* Details */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3 mb-3">
                                            <div className="min-w-0">
                                                <h3 className="text-lg md:text-xl font-bold text-brand-dark mb-1 break-words">
                                                    {booking.packTitle}
                                                </h3>
                                                <p className="text-sm text-gray-600">
                                                    Vendedor: {booking.sellerName}
                                                </p>
                                            </div>
                                            <div className="text-left md:text-right">
                                                {getStatusBadge(booking)}
                                                <p className="text-xl md:text-2xl font-bold text-brand-primary mt-2">
                                                    €{booking.packPrice?.toFixed(2)}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Pickup Info */}
                                        <div className="bg-brand-light rounded-lg p-3 md:p-4 mb-4">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                <div className="flex items-center gap-2 text-sm min-w-0">
                                                    <MapPin className="h-4 w-4 text-brand-primary flex-shrink-0" />
                                                    <span className="break-words">{booking.packPickupLocation || booking.sellerName}</span>
                                                </div>
                                                <div className="flex items-center gap-2 text-sm min-w-0">
                                                    <Calendar className="h-4 w-4 text-brand-primary flex-shrink-0" />
                                                    <span className="break-words">{booking.selectedTimeWindow}</span>
                                                </div>
                                            </div>

                                            {/* Pickup Code - Only show if not cancelled */}
                                            {booking.status !== 'cancelled' && (
                                                <div className="mt-3 pt-3 border-t border-brand-primary/20">
                                                    <p className="text-xs text-gray-600 mb-1">Código de recogida:</p>
                                                    <p className="text-2xl md:text-3xl font-bold text-brand-primary tracking-wider break-words">
                                                        {booking.pickupCode}
                                                    </p>
                                                    <p className="text-xs text-gray-600 mt-1">
                                                        Muestra este código al vendedor
                                                    </p>
                                                </div>
                                            )}
                                        </div>

                                        {/* Validation Status */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4 text-sm">
                                            <div className="flex items-center gap-2">
                                                {booking.validatedBySeller ? (
                                                    <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                                                ) : (
                                                    <Clock className="h-4 w-4 text-gray-400 flex-shrink-0" />
                                                )}
                                                <span className={booking.validatedBySeller ? "text-green-600" : "text-gray-500"}>
                                                    Validado por vendedor
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                {booking.validatedByBuyer ? (
                                                    <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                                                ) : (
                                                    <Clock className="h-4 w-4 text-gray-400 flex-shrink-0" />
                                                )}
                                                <span className={booking.validatedByBuyer ? "text-green-600" : "text-gray-500"}>
                                                    Confirmado por ti
                                                </span>
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        <div className="flex flex-col sm:flex-row gap-2">
                                            {booking.status === 'pending' && (
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleCancelBooking(booking.id)}
                                                    className="text-red-600 border-red-200 hover:bg-red-50 w-full sm:w-auto"
                                                >
                                                    <XCircle className="h-4 w-4 mr-2" />
                                                    Cancelar Reserva
                                                </Button>
                                            )}
                                            {(booking.status === 'confirmed' || booking.status === 'pending') && !booking.validatedByBuyer && (
                                                <Button
                                                    size="sm"
                                                    onClick={() => handleConfirmReceipt(booking.id)}
                                                    className="bg-brand-primary hover:bg-brand-dark w-full sm:w-auto"
                                                >
                                                    <CheckCircle className="h-4 w-4 mr-2" />
                                                    Confirmar Recogida
                                                </Button>
                                            )}
                                            {booking.status === 'completed' && !ratedBookings.has(booking.id) && (
                                                <Button
                                                    size="sm"
                                                    onClick={() => {
                                                        setSelectedBookingId(booking.id)
                                                        setRatingModalOpen(true)
                                                    }}
                                                    className="bg-brand-primary hover:bg-brand-dark w-full sm:w-auto"
                                                >
                                                    <Star className="h-4 w-4 mr-2" />
                                                    Valorar Compra
                                                </Button>
                                            )}
                                            {booking.status === 'completed' && ratedBookings.has(booking.id) && (
                                                <div className="flex items-center gap-2 text-sm text-brand-primary font-semibold">
                                                    <CheckCircle className="h-4 w-4" />
                                                    Valorado
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                )}
            </div>

            {/* Rating Modal */}
            {selectedBookingId && (
                <RatingModal
                    isOpen={ratingModalOpen}
                    bookingId={selectedBookingId}
                    sellerName={purchases.find(b => b.id === selectedBookingId)?.sellerName || "Vendedor"}
                    onClose={() => {
                        setRatingModalOpen(false)
                        setSelectedBookingId(null)
                    }}
                    onSuccess={() => loadPurchases()}
                />
            )}

            <Toast
                message={toast.message}
                type={toast.type}
                isVisible={toast.isVisible}
                onClose={hideToast}
            />
        </div>
    )
}
