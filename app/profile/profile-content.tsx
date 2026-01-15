"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { authService } from "@/services/authService"
import { ratingService, type UserRatingsStats } from "@/services/ratingService"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Card } from "@/components/ui/card"
import { Loader2, User, Star } from "lucide-react"
import { RatingsDisplay } from "@/components/ratings-display"
import Link from "next/link"

export function ProfileContent() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const viewUserId = searchParams.get('view')  // For viewing other users' profiles
    
    const [isLoading, setIsLoading] = useState(true)
    const [isSaving, setIsSaving] = useState(false)
    const [user, setUser] = useState<any>(null)
    const [isViewingOtherProfile, setIsViewingOtherProfile] = useState(false)
    const [viewingProfile, setViewingProfile] = useState<any>(null)
    const [ratingStats, setRatingStats] = useState<UserRatingsStats | null>(null)
    const [ratings, setRatings] = useState<any[]>([])

    // Form State
    const [fullName, setFullName] = useState("")
    const [phone, setPhone] = useState("")
    const [country, setCountry] = useState("")
    const [gender, setGender] = useState("unspecified")
    const [dietary, setDietary] = useState("unspecified")
    const [pickupTimes, setPickupTimes] = useState("")

    useEffect(() => {
        loadProfile()
    }, [viewUserId])

    const loadProfile = async () => {
        try {
            const currentUser = await authService.getUser()
            if (!currentUser && !viewUserId) {
                router.push("/login")
                return
            }

            // If viewing another user's profile
            if (viewUserId) {
                setIsViewingOtherProfile(true)
                const profile = await authService.getProfileById(viewUserId)
                if (profile) {
                    setViewingProfile(profile)
                    const stats = await ratingService.getRatingsStats(viewUserId)
                    const userRatings = await ratingService.getRatingsForUser(viewUserId)
                    setRatingStats(stats)
                    setRatings(userRatings)
                }
            } else {
                // Editing own profile
                setUser(currentUser)
                const profile = await authService.getProfile()
                if (profile) {
                    setFullName(profile.full_name || "")
                    setPhone(profile.phone || "")
                    setCountry(profile.country || "")
                    setGender(profile.gender || "unspecified")
                    setDietary(profile.dietary_preference || "unspecified")
                    setPickupTimes(profile.pickup_times || "")
                    
                    // Load own ratings stats
                    const stats = await ratingService.getRatingsStats(currentUser!.id)
                    const userRatings = await ratingService.getRatingsForUser(currentUser!.id)
                    setRatingStats(stats)
                    setRatings(userRatings)
                }
            }
        } catch (error) {
            console.error("Error loading profile:", error)
        } finally {
            setIsLoading(false)
        }
    }

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSaving(true)
        try {
            // Map dietary values to ensure consistency
            const dietaryValue = dietary === 'unspecified' ? null : dietary
            
            const updateData = {
                full_name: fullName,
                phone: phone || null,
                country: country || null,
                gender: gender,
                dietary_preference: dietaryValue,
                pickup_times: pickupTimes || null
            }
            
            console.log("Guardando perfil con valores:", updateData)
            await authService.updateProfile(updateData)
            alert("Perfil actualizado correctamente")
        } catch (error) {
            console.error("Error updating profile:", error)
            alert("Error al actualizar el perfil")
        } finally {
            setIsSaving(false)
        }
    }

    if (isLoading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        )
    }

    // Viewing other user's profile (read-only)
    if (isViewingOtherProfile && viewingProfile) {
        return (
            <div className="max-w-2xl mx-auto py-8 px-4">
                <div className="flex items-center gap-4 mb-8">
                    <div className="w-16 h-16 rounded-full bg-brand-light flex items-center justify-center text-brand-primary font-bold text-2xl">
                        {viewingProfile.full_name?.charAt(0) || 'U'}
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-brand-dark">{viewingProfile.full_name || 'Usuario'}</h1>
                        <p className="text-gray-600">Perfil público</p>
                    </div>
                </div>

                {/* Rating Stats Summary */}
                {ratingStats && (
                    <Card className="p-6 mb-8">
                        <div className="flex items-center gap-4">
                            <div>
                                <div className="flex items-center gap-2 mb-2">
                                    <Star className="h-6 w-6 fill-brand-primary text-brand-primary" />
                                    <span className="text-2xl font-bold">{ratingStats.averageRating.toFixed(1)}</span>
                                </div>
                                <p className="text-gray-600">
                                    {ratingStats.totalRatings} {ratingStats.totalRatings === 1 ? 'valoración' : 'valoraciones'}
                                </p>
                            </div>
                        </div>
                    </Card>
                )}

                {/* Full Ratings Display */}
                {ratings && ratings.length > 0 && (
                    <div className="mb-8">
                        <h2 className="text-2xl font-bold mb-6">Valoraciones</h2>
                        <RatingsDisplay
                            ratings={ratings}
                            averageRating={ratingStats?.averageRating || 0}
                            totalRatings={ratingStats?.totalRatings || 0}
                            ratingDistribution={ratingStats?.ratingDistribution}
                        />
                    </div>
                )}
                
                {ratings && ratings.length === 0 && (
                    <Card className="p-6 text-center">
                        <p className="text-gray-600">Este usuario aún no tiene valoraciones</p>
                    </Card>
                )}
            </div>
        )
    }

    // Own profile (edit mode)
    return (
        <div className="max-w-2xl mx-auto py-8 px-4">
            <h1 className="text-3xl font-bold text-brand-dark mb-8">Mi Perfil</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Edit Form */}
                <Card className="p-6">
                    <form onSubmit={handleSave} className="space-y-4">
                        <div>
                            <Label htmlFor="fullName">Nombre Completo</Label>
                            <Input
                                id="fullName"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                placeholder="Tu nombre"
                                className="mt-1"
                            />
                        </div>

                        <div>
                            <Label htmlFor="phone">Teléfono</Label>
                            <Input
                                id="phone"
                                type="tel"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                placeholder="+34 123 456 789"
                                className="mt-1"
                            />
                        </div>

                        <div>
                            <Label htmlFor="country">País</Label>
                            <Input
                                id="country"
                                value={country}
                                onChange={(e) => setCountry(e.target.value)}
                                placeholder="España"
                                className="mt-1"
                            />
                        </div>

                        <div>
                            <Label htmlFor="gender">Género</Label>
                            <Select value={gender} onValueChange={setGender}>
                                <SelectTrigger id="gender" className="mt-1">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="unspecified">Prefiero no especificar</SelectItem>
                                    <SelectItem value="male">Hombre</SelectItem>
                                    <SelectItem value="female">Mujer</SelectItem>
                                    <SelectItem value="other">Otro</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <Label htmlFor="dietary">Preferencia Dietética</Label>
                            <Select value={dietary} onValueChange={setDietary}>
                                <SelectTrigger id="dietary" className="mt-1">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="unspecified">Sin especificar</SelectItem>
                                    <SelectItem value="omnivore">Omnívoro</SelectItem>
                                    <SelectItem value="vegetarian">Vegetariano</SelectItem>
                                    <SelectItem value="vegan">Vegano</SelectItem>
                                    <SelectItem value="gluten-free">Sin gluten</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <Label htmlFor="pickupTimes">Horarios de Recogida</Label>
                            <Textarea
                                id="pickupTimes"
                                value={pickupTimes}
                                onChange={(e) => setPickupTimes(e.target.value)}
                                placeholder="Ej: Lunes a Viernes de 18:00 a 20:00..."
                                className="mt-1"
                            />
                        </div>

                        <Button 
                            type="submit" 
                            className="w-full bg-brand-primary text-white hover:bg-brand-dark rounded-xl"
                            disabled={isSaving}
                        >
                            {isSaving ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Guardando...
                                </>
                            ) : (
                                'Guardar Cambios'
                            )}
                        </Button>
                    </form>
                </Card>

                {/* Rating Stats Display */}
                <div>
                    {ratingStats && (
                        <Card className="p-6 mb-6">
                            <h2 className="text-lg font-bold mb-4">Mis Valoraciones</h2>
                            <div className="flex items-center gap-4 mb-6">
                                <div>
                                    <div className="flex items-center gap-2 mb-2">
                                        <Star className="h-6 w-6 fill-brand-primary text-brand-primary" />
                                        <span className="text-2xl font-bold">{ratingStats.averageRating.toFixed(1)}</span>
                                    </div>
                                    <p className="text-gray-600">
                                        {ratingStats.totalRatings} {ratingStats.totalRatings === 1 ? 'valoración' : 'valoraciones'}
                                    </p>
                                </div>
                            </div>
                        </Card>
                    )}

                    {/* Full Ratings Display */}
                    {ratings && ratings.length > 0 && (
                        <div>
                            <h3 className="text-lg font-bold mb-4">Mis Reseñas</h3>
                            <RatingsDisplay
                                ratings={ratings}
                                averageRating={ratingStats?.averageRating || 0}
                                totalRatings={ratingStats?.totalRatings || 0}
                                ratingDistribution={ratingStats?.ratingDistribution}
                            />
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
