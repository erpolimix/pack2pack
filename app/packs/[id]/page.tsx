"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { packService, type Pack } from "@/services/packService"
import { bookingService } from "@/services/bookingService"
import { ratingService, type UserRatingsStats } from "@/services/ratingService"
import { authService } from "@/services/authService"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"
import { Toast } from "@/components/ui/toast"
import { useToast } from "@/lib/useToast"
import { ArrowLeft, MapPin, Share2, Shield, User, Calendar, Clock, Star } from "lucide-react"
import { RatingsDisplay } from "@/components/ratings-display"
import Link from "next/link"
import { Skeleton } from "@/components/ui/skeleton"
import { User as UserType } from "@supabase/supabase-js"

export default function PackDetailPage() {
    const params = useParams()
    const router = useRouter()
    const id = params.id as string
    const [pack, setPack] = useState<Pack | undefined>(undefined)
    const [loading, setLoading] = useState(true)
    const [currentUser, setCurrentUser] = useState<UserType | null>(null)
    const [showBookingModal, setShowBookingModal] = useState(false)
    const [bookingInProgress, setBookingInProgress] = useState(false)
    const [hasActiveBooking, setHasActiveBooking] = useState(false)
    const [isPackBooked, setIsPackBooked] = useState(false)
    const [sellerRatingStats, setSellerRatingStats] = useState<UserRatingsStats | null>(null)
    const [sellerRatings, setSellerRatings] = useState<any[]>([])
    
    // Booking form state
    const [selectedTimeWindow, setSelectedTimeWindow] = useState("")
    
    const { toast, showSuccess, showError, hideToast } = useToast()

    useEffect(() => {
        const loadPageData = async () => {
            if (id) {
                try {
                    const [foundPack, user] = await Promise.all([
                        packService.getPackById(id),
                        authService.getUser()
                    ])
                    setPack(foundPack)
                    setCurrentUser(user)
                    
                    // Load seller ratings
                    if (foundPack) {
                        const stats = await ratingService.getRatingsStats(foundPack.seller_id)
                        const ratings = await ratingService.getRatingsForUser(foundPack.seller_id)
                        setSellerRatingStats(stats)
                        setSellerRatings(ratings)
                    }
                    
                    // Check if user has active booking for this pack
                    if (user && foundPack) {
                        const hasBooking = await bookingService.hasActiveBooking(foundPack.id)
                        setHasActiveBooking(hasBooking)
                    }
                    
                    // Check if pack is booked by ANY user
                    if (foundPack) {
                        const packBooked = await bookingService.isPackBooked(foundPack.id)
                        setIsPackBooked(packBooked)
                    }
                } catch (error) {
                    console.error("Error loading pack details:", error)
                } finally {
                    setLoading(false)
                }
            }
        }
        loadPageData()
    }, [id])

    const isOwner = currentUser?.id === pack?.seller_id

    const handleReserveClick = () => {
        if (!currentUser) {
            router.push('/login')
            return
        }
        if (hasActiveBooking) {
            showError("Ya tienes una reserva activa para este pack")
            return
        }
        if (isPackBooked) {
            showError("Este pack ya ha sido reservado por otro usuario")
            return
        }
        setShowBookingModal(true)
    }

    const handleBookingSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        
        if (!selectedTimeWindow) {
            showError("Selecciona una franja horaria")
            return
        }

        setBookingInProgress(true)
        try {
            await bookingService.createBooking(pack!.id, selectedTimeWindow)
            showSuccess("¡Reserva creada! Revisa tu código en 'Mis Compras'")
            setShowBookingModal(false)
            setHasActiveBooking(true)
            
            // Redirect to purchases after a moment
            setTimeout(() => {
                router.push('/my-purchases')
            }, 2000)
        } catch (error) {
            console.error(error)
            showError(error instanceof Error ? error.message : "Error al crear la reserva")
        } finally {
            setBookingInProgress(false)
        }
    }

    if (loading) {
        return (
            <div className="container max-w-4xl mx-auto py-10 px-4 space-y-8">
                <div className="space-y-4">
                    <Skeleton className="h-8 w-1/3" />
                    <Skeleton className="h-[400px] w-full rounded-xl" />
                </div>
            </div>
        )
    }

    if (!pack) {
        return (
            <div className="container py-20 text-center">
                <h1 className="text-2xl font-bold mb-4">Pack no encontrado</h1>
                <Button asChild>
                    <Link href="/">Volver al inicio</Link>
                </Button>
            </div>
        )
    }

    const discount = Math.round(((pack.originalPrice - pack.price) / pack.originalPrice) * 100)

    return (
        <div className="container max-w-4xl mx-auto py-8 px-6">
            <Button variant="ghost" size="sm" asChild className="mb-4 -ml-2 text-muted-foreground">
                <Link href="/"><ArrowLeft className="w-4 h-4 mr-2" /> Volver a buscar</Link>
            </Button>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Image Section */}
                <div className="relative aspect-square md:aspect-[4/3] rounded-2xl overflow-hidden bg-muted shadow-sm">
                    <img
                        src={pack.imageUrl}
                        alt={pack.title}
                        className="object-cover w-full h-full"
                    />
                    <div className="absolute top-4 left-4">
                        <Badge variant="secondary" className="text-sm font-bold shadow-sm">
                            -{discount}% DTO.
                        </Badge>
                    </div>
                </div>

                {/* Info Section */}
                <div className="flex flex-col space-y-6">
                    <div>
                        <div className="flex justify-between items-start">
                            <h1 className="text-3xl font-bold leading-tight mb-2">{pack.title}</h1>
                            <Button variant="ghost" size="icon" className="shrink-0 text-muted-foreground">
                                <Share2 className="w-5 h-5" />
                            </Button>
                        </div>
                        <div className="flex items-center text-muted-foreground mb-4">
                            <MapPin className="w-4 h-4 mr-1" />
                            <span>{pack.distance} • {pack.location}</span>
                        </div>
                    </div>

                    <div className="bg-muted/30 p-4 rounded-lg border flex justify-between items-center">
                        <div>
                            <p className="text-xs text-muted-foreground uppercase font-semibold">Precio</p>
                            <div className="flex items-baseline gap-2">
                                <span className="text-3xl font-bold text-primary">{pack.price.toFixed(2)}€</span>
                                <span className="text-sm text-muted-foreground line-through">{pack.originalPrice.toFixed(2)}€</span>
                            </div>
                        </div>
                        <Button
                            size="lg"
                            className="px-8 shadow-lg shadow-primary/20"
                            disabled={isOwner || hasActiveBooking || isPackBooked}
                            onClick={handleReserveClick}
                        >
                            {isOwner ? "Es tu propio pack" : (hasActiveBooking || isPackBooked) ? "Ya reservado" : "Reservar ahora"}
                        </Button>
                    </div>

                    <div className="space-y-4">
                        <h3 className="font-semibold text-lg">Sobre este pack</h3>
                        <p className="text-muted-foreground leading-relaxed">
                            {pack.description}
                        </p>
                        <div className="flex flex-wrap gap-2">
                            {pack.tags.map(tag => (
                                <Badge key={tag} variant="secondary" className="font-normal">#{tag}</Badge>
                            ))}
                        </div>
                    </div>

                    <div className="border-t pt-6 mt-auto">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
                                <User className="w-5 h-5 text-muted-foreground" />
                            </div>
                            <div>
                                <p className="text-sm font-medium">{pack.sellerName}</p>
                                <div className="flex items-center text-xs text-green-600">
                                    <Shield className="w-3 h-3 mr-1" /> Verificado
                                </div>
                            </div>
                            <Button variant="outline" size="sm" className="ml-auto">
                                Ver Perfil
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Seller Info & Ratings Section */}
            {pack && (
                <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Seller Card */}
                    <div className="md:col-span-1">
                        <Card className="p-6">
                            <h3 className="text-lg font-bold text-brand-dark mb-4">Vendedor</h3>
                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-12 h-12 rounded-full bg-brand-light flex items-center justify-center text-brand-primary font-bold">
                                    {pack.sellerName.charAt(0)}
                                </div>
                                <div>
                                    <Link href={`/profile?view=${pack.seller_id}`} className="font-semibold text-brand-dark hover:text-brand-primary transition-colors">
                                        {pack.sellerName}
                                    </Link>
                                </div>
                            </div>
                            
                            {/* Quick Rating Summary */}
                            {sellerRatingStats && (
                                <div className="bg-brand-light rounded-lg p-4 mb-4">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Star className="h-5 w-5 fill-brand-primary text-brand-primary" />
                                        <span className="text-lg font-bold text-brand-primary">
                                            {sellerRatingStats.averageRating.toFixed(1)}
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-600">
                                        {sellerRatingStats.totalRatings} {sellerRatingStats.totalRatings === 1 ? 'valoración' : 'valoraciones'}
                                    </p>
                                </div>
                            )}
                            
                            <Link href={`/profile?view=${pack.seller_id}`}>
                                <Button variant="outline" className="w-full rounded-xl">
                                    Ver Perfil
                                </Button>
                            </Link>
                        </Card>
                    </div>

                    {/* Ratings Display */}
                    {sellerRatingStats && (
                        <div className="md:col-span-2">
                            <Card className="p-6">
                                <h3 className="text-lg font-bold text-brand-dark mb-4 flex items-center gap-2">
                                    <Star className="h-5 w-5 fill-brand-primary text-brand-primary" />
                                    Valoraciones del Vendedor
                                </h3>
                                <RatingsDisplay
                                    ratings={sellerRatings}
                                    averageRating={sellerRatingStats.averageRating}
                                    totalRatings={sellerRatingStats.totalRatings}
                                    ratingDistribution={sellerRatingStats.ratingDistribution}
                                />
                            </Card>
                        </div>
                    )}
                </div>
            )}

            {showBookingModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
                        <h2 className="text-2xl font-bold text-brand-dark mb-4">Reservar Pack</h2>
                        <p className="text-gray-600 mb-6">Selecciona cuándo recogerás el pack</p>
                        
                        <form onSubmit={handleBookingSubmit} className="space-y-4">
                            {/* Pickup Location (readonly from pack) */}
                            <div className="bg-brand-light p-4 rounded-lg border border-brand-primary/20">
                                <div className="flex items-start gap-3">
                                    <MapPin className="h-5 w-5 text-brand-primary flex-shrink-0 mt-0.5" />
                                    <div>
                                        <p className="text-sm font-semibold text-brand-dark mb-1">Punto de recogida:</p>
                                        <p className="text-sm text-gray-700">{pack?.pickupLocation || pack?.location}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Time Window Selection */}
                            <div>
                                <Label className="flex items-center gap-2 mb-3">
                                    <Clock className="h-4 w-4 text-brand-primary" />
                                    Elige cuándo recogerás el pack
                                </Label>
                                <div className="space-y-2 max-h-64 overflow-y-auto">
                                    {pack?.pickupWindows && pack.pickupWindows.length > 0 ? (
                                        pack.pickupWindows.map((window, index) => (
                                            <label
                                                key={index}
                                                className={`
                                                    flex items-center gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all
                                                    ${selectedTimeWindow === window 
                                                        ? 'border-brand-primary bg-brand-light shadow-md' 
                                                        : 'border-gray-200 bg-white hover:border-brand-primary/50 hover:bg-gray-50'
                                                    }
                                                `}
                                            >
                                                <input
                                                    type="radio"
                                                    name="timeWindow"
                                                    value={window}
                                                    checked={selectedTimeWindow === window}
                                                    onChange={(e) => setSelectedTimeWindow(e.target.value)}
                                                    className="w-5 h-5 text-brand-primary focus:ring-brand-primary"
                                                />
                                                <div className="flex-1">
                                                    <span className="font-semibold text-base">{window}</span>
                                                </div>
                                                {selectedTimeWindow === window && (
                                                    <svg className="w-5 h-5 text-brand-primary" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                                                    </svg>
                                                )}
                                            </label>
                                        ))
                                    ) : (
                                        <p className="text-sm text-gray-500 text-center py-4">No hay franjas disponibles</p>
                                    )}
                                </div>
                            </div>

                            <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
                                <p className="text-sm text-yellow-900">
                                    <strong>Pago en mano:</strong> El pago se realiza directamente con el vendedor al recoger el pack.
                                </p>
                            </div>

                            <div className="flex gap-3 pt-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    className="flex-1"
                                    onClick={() => setShowBookingModal(false)}
                                    disabled={bookingInProgress}
                                >
                                    Cancelar
                                </Button>
                                <Button
                                    type="submit"
                                    className="flex-1 bg-brand-primary hover:bg-brand-dark"
                                    disabled={bookingInProgress || !selectedTimeWindow}
                                >
                                    {bookingInProgress ? "Reservando..." : "Confirmar Reserva"}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
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
