"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { packService, type Pack } from "@/services/packService"
import { authService } from "@/services/authService"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, MapPin, Share2, Shield, User } from "lucide-react"
import Link from "next/link"
import { Skeleton } from "@/components/ui/skeleton"
import { User as UserType } from "@supabase/supabase-js"

export default function PackDetailPage() {
    const params = useParams()
    const id = params.id as string
    const [pack, setPack] = useState<Pack | undefined>(undefined)
    const [loading, setLoading] = useState(true)
    const [currentUser, setCurrentUser] = useState<UserType | null>(null)

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
        <div className="container max-w-4xl mx-auto py-8 px-4">
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
                            disabled={isOwner}
                        >
                            {isOwner ? "Es tu propio pack" : "Reservar ahora"}
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
        </div>
    )
}
