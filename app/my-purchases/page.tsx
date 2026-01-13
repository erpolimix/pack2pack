"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { bookingService, type Booking } from "@/services/bookingService"
import { authService } from "@/services/authService"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Toast } from "@/components/ui/toast"
import { useToast } from "@/lib/useToast"
import { Clock, MapPin, Package, CheckCircle, XCircle, Calendar } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

export default function MyPurchasesPage() {
    const router = useRouter()
    const [purchases, setPurchases] = useState<Booking[]>([])
    const [loading, setLoading] = useState(true)
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
                            <Card key={booking.id} className="p-6">
                                <div className="flex gap-6">
                                    {/* Image */}
                                    <div className="relative w-32 h-32 rounded-xl overflow-hidden flex-shrink-0">
                                        <Image
                                            src={booking.packImageUrl || 'https://images.unsplash.com/photo-1546213290-e1fc4f6d4f75?auto=format&fit=crop&q=80&w=600'}
                                            alt={booking.packTitle || 'Pack'}
                                            fill
                                            className="object-cover"
                                        />
                                    </div>

                                    {/* Details */}
                                    <div className="flex-1">
                                        <div className="flex items-start justify-between mb-3">
                                            <div>
                                                <h3 className="text-xl font-bold text-brand-dark mb-1">
                                                    {booking.packTitle}
                                                </h3>
                                                <p className="text-sm text-gray-600">
                                                    Vendedor: {booking.sellerName}
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                {getStatusBadge(booking)}
                                                <p className="text-2xl font-bold text-brand-primary mt-2">
                                                    €{booking.packPrice?.toFixed(2)}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Pickup Info */}
                                        <div className="bg-brand-light rounded-lg p-4 mb-4">
                                            <div className="grid md:grid-cols-2 gap-3">
                                                <div className="flex items-center gap-2 text-sm">
                                                    <MapPin className="h-4 w-4 text-brand-primary" />
                                                    <span>{booking.packPickupLocation || booking.sellerName}</span>
                                                </div>
                                                <div className="flex items-center gap-2 text-sm">
                                                    <Calendar className="h-4 w-4 text-brand-primary" />
                                                    <span>{booking.selectedTimeWindow}</span>
                                                </div>
                                            </div>

                                            {/* Pickup Code - Only show if not cancelled */}
                                            {booking.status !== 'cancelled' && (
                                                <div className="mt-3 pt-3 border-t border-brand-primary/20">
                                                    <p className="text-xs text-gray-600 mb-1">Código de recogida:</p>
                                                    <p className="text-3xl font-bold text-brand-primary tracking-wider">
                                                        {booking.pickupCode}
                                                    </p>
                                                    <p className="text-xs text-gray-600 mt-1">
                                                        Muestra este código al vendedor
                                                    </p>
                                                </div>
                                            )}
                                        </div>

                                        {/* Validation Status */}
                                        <div className="flex gap-4 mb-4 text-sm">
                                            <div className="flex items-center gap-2">
                                                {booking.validatedBySeller ? (
                                                    <CheckCircle className="h-4 w-4 text-green-600" />
                                                ) : (
                                                    <Clock className="h-4 w-4 text-gray-400" />
                                                )}
                                                <span className={booking.validatedBySeller ? "text-green-600" : "text-gray-500"}>
                                                    Validado por vendedor
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                {booking.validatedByBuyer ? (
                                                    <CheckCircle className="h-4 w-4 text-green-600" />
                                                ) : (
                                                    <Clock className="h-4 w-4 text-gray-400" />
                                                )}
                                                <span className={booking.validatedByBuyer ? "text-green-600" : "text-gray-500"}>
                                                    Confirmado por ti
                                                </span>
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        <div className="flex gap-2">
                                            {booking.status === 'pending' && (
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleCancelBooking(booking.id)}
                                                    className="text-red-600 border-red-200 hover:bg-red-50"
                                                >
                                                    <XCircle className="h-4 w-4 mr-2" />
                                                    Cancelar Reserva
                                                </Button>
                                            )}
                                            {(booking.status === 'confirmed' || booking.status === 'pending') && !booking.validatedByBuyer && (
                                                <Button
                                                    size="sm"
                                                    onClick={() => handleConfirmReceipt(booking.id)}
                                                    className="bg-brand-primary hover:bg-brand-dark"
                                                >
                                                    <CheckCircle className="h-4 w-4 mr-2" />
                                                    Confirmar Recogida
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                )}
            </div>

            <Toast
                message={toast.message}
                type={toast.type}
                isVisible={toast.isVisible}
                onClose={hideToast}
            />
        </div>
    )
}
