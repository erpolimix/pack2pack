"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { bookingService, type Booking } from "@/services/bookingService"
import { authService } from "@/services/authService"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Toast } from "@/components/ui/toast"
import { useToast } from "@/lib/useToast"
import { Clock, MapPin, Package, CheckCircle, Key, Calendar, User } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

export default function MySalesPage() {
    const router = useRouter()
    const [sales, setSales] = useState<Booking[]>([])
    const [loading, setLoading] = useState(true)
    const [validatingId, setValidatingId] = useState<string | null>(null)
    const [codeInput, setCodeInput] = useState<{ [key: string]: string }>({})
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
            await loadSales()
        } catch (error) {
            console.error(error)
            showError("Error al cargar tus ventas")
        } finally {
            setLoading(false)
        }
    }

    const loadSales = async () => {
        try {
            const data = await bookingService.getMySales()
            setSales(data)
        } catch (error) {
            console.error(error)
            showError("Error al cargar tus ventas")
        }
    }

    const handleValidateCode = async (bookingId: string) => {
        const code = codeInput[bookingId]?.trim()
        if (!code || code.length !== 4) {
            showError("Introduce el código de 4 dígitos")
            return
        }

        try {
            await bookingService.validateBySeller(bookingId, code)
            showSuccess("¡Código validado! Entrega confirmada")
            setCodeInput({ ...codeInput, [bookingId]: "" })
            setValidatingId(null)
            await loadSales()
        } catch (error) {
            console.error(error)
            showError(error instanceof Error ? error.message : "Código incorrecto")
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
                <div className="text-center">Cargando tus ventas...</div>
            </div>
        )
    }

    return (
        <div className="container mx-auto px-6 py-12">
            <div className="max-w-4xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-brand-dark mb-2">Mis Ventas</h1>
                        <p className="text-gray-600">Gestiona las reservas de tus packs</p>
                    </div>
                    <Link href="/my-packs">
                        <Button variant="outline">Mis Packs</Button>
                    </Link>
                </div>

                {sales.length === 0 ? (
                    <Card className="p-12 text-center">
                        <Package className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                        <h2 className="text-xl font-bold mb-2">No tienes ventas todavía</h2>
                        <p className="text-gray-600 mb-6">Publica un pack para empezar a vender</p>
                        <Link href="/create">
                            <Button className="bg-brand-primary hover:bg-brand-dark">
                                Publicar Pack
                            </Button>
                        </Link>
                    </Card>
                ) : (
                    <div className="space-y-4">
                        {sales.map((booking) => (
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
                                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                                    <User className="h-4 w-4" />
                                                    <span>Comprador: {booking.buyerName}</span>
                                                </div>
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
                                                    <span className="break-words">{booking.packPickupLocation || "Tu ubicación"}</span>
                                                </div>
                                                <div className="flex items-center gap-2 text-sm min-w-0">
                                                    <Calendar className="h-4 w-4 text-brand-primary flex-shrink-0" />
                                                    <span className="break-words">{booking.selectedTimeWindow}</span>
                                                </div>
                                            </div>
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
                                                    Validado por ti
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                {booking.validatedByBuyer ? (
                                                    <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                                                ) : (
                                                    <Clock className="h-4 w-4 text-gray-400 flex-shrink-0" />
                                                )}
                                                <span className={booking.validatedByBuyer ? "text-green-600" : "text-gray-500"}>
                                                    Confirmado por comprador
                                                </span>
                                            </div>
                                        </div>

                                        {/* Code Validation Section */}
                                        {booking.status !== 'cancelled' && !booking.validatedBySeller && (
                                            <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-3 md:p-4 mb-4">
                                                <div className="flex flex-col md:flex-row md:items-start gap-3">
                                                    <Key className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                                                    <div className="flex-1 min-w-0">
                                                        <p className="font-semibold text-yellow-900 mb-2">
                                                            Validación pendiente
                                                        </p>
                                                        <p className="text-sm text-yellow-800 mb-3">
                                                            Pide al comprador que te muestre su código de 4 dígitos
                                                        </p>
                                                        
                                                        {validatingId === booking.id ? (
                                                            <div className="flex flex-col sm:flex-row gap-2">
                                                                <Input
                                                                    type="text"
                                                                    maxLength={4}
                                                                    placeholder="Ej: 1234"
                                                                    value={codeInput[booking.id] || ""}
                                                                    onChange={(e) => {
                                                                        const value = e.target.value.replace(/\D/g, '')
                                                                        setCodeInput({ ...codeInput, [booking.id]: value })
                                                                    }}
                                                                    className="w-full sm:w-24 text-center text-lg font-bold"
                                                                />
                                                                <Button
                                                                    size="sm"
                                                                    onClick={() => handleValidateCode(booking.id)}
                                                                    className="bg-green-600 hover:bg-green-700 w-full sm:w-auto"
                                                                >
                                                                    Validar
                                                                </Button>
                                                                <Button
                                                                    size="sm"
                                                                    variant="outline"
                                                                    onClick={() => {
                                                                        setValidatingId(null)
                                                                        setCodeInput({ ...codeInput, [booking.id]: "" })
                                                                    }}
                                                                    className="w-full sm:w-auto"
                                                                >
                                                                    Cancelar
                                                                </Button>
                                                            </div>
                                                        ) : (
                                                            <Button
                                                                size="sm"
                                                                onClick={() => setValidatingId(booking.id)}
                                                                className="bg-yellow-600 hover:bg-yellow-700 w-full sm:w-auto"
                                                            >
                                                                <Key className="h-4 w-4 mr-2" />
                                                                Introducir Código
                                                            </Button>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {/* Completed Message */}
                                        {booking.status === 'completed' && (
                                            <div className="bg-green-50 border-2 border-green-200 rounded-lg p-3 flex items-center gap-2">
                                                <CheckCircle className="h-5 w-5 text-green-600" />
                                                <span className="text-sm font-semibold text-green-800">
                                                    Venta completada exitosamente
                                                </span>
                                            </div>
                                        )}
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
