import Link from "next/link"
import Image from "next/image"
import { Clock, Star, MapPin, Gift } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { geoService } from "@/services/geoService"
import type { Pack } from "@/services/packService"

interface PackCardProps {
    pack: Pack
    sellerRating?: number
    sellerRatingCount?: number
}

export function PackCard({ pack, sellerRating, sellerRatingCount }: Readonly<PackCardProps>) {
    const averageRating = sellerRating || 0
    const ratingCount = sellerRatingCount || 0
    
    // Calcular tiempo restante
    const now = Date.now()
    const expiresTime = new Date(pack.expiresAt).getTime()
    const timeRemaining = expiresTime - now
    
    const days = Math.floor(timeRemaining / (1000 * 60 * 60 * 24))
    const hours = Math.floor((timeRemaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    
    let timeText: string
    if (days > 0) {
        timeText = `Faltan ${days}d ${hours}h`
    } else if (hours > 0) {
        timeText = `Faltan ${hours}h`
    } else {
        timeText = 'Expirando pronto'
    }
    
    // Formatear distancia si está disponible
    const distanceText = pack.distanceKm ? geoService.formatDistance(pack.distanceKm) : null
    
    // Estilo especial para packs gratis
    const isFree = pack.isFree
    
    return (
        <Card className={`pack-card group border-0 shadow-md hover:shadow-xl transition-all duration-300 rounded-2xl overflow-hidden flex flex-col h-full relative ${
            isFree 
                ? 'bg-gradient-to-br from-emerald-50 via-white to-teal-50 ring-2 ring-emerald-400/50' 
                : 'bg-white'
        }`}>
            {/* Image Section */}
            <div className="relative h-48 overflow-hidden bg-gray-100">
                <Image
                    src={pack.imageUrl}
                    alt={pack.title}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover transform group-hover:scale-110 transition-transform duration-500"
                    loading="lazy"
                    quality={85}
                />

                {/* Badge GRATIS - Llamativo */}
                {isFree && (
                    <div className="absolute top-3 right-3 z-20 animate-pulse">
                        <div className="bg-gradient-to-r from-emerald-400 to-teal-400 text-white px-4 py-2 rounded-full font-bold text-sm flex items-center gap-2 shadow-lg drop-shadow-lg">
                            <Gift className="h-5 w-5" />
                            GRATIS
                        </div>
                    </div>
                )}

                {/* Badge de distancia */}
                {distanceText && (
                    <div className={`absolute top-3 left-3 backdrop-blur-sm px-2 py-1 rounded-lg text-xs font-bold flex items-center gap-1 z-10 ${
                        isFree ? 'bg-emerald-100/90 text-emerald-700' : 'bg-white/90 text-brand-primary'
                    }`}>
                        <MapPin size={12} />
                        {distanceText}
                    </div>
                )}

                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
                    <span className={`text-xs font-bold px-2 py-1 rounded-lg border flex items-center w-fit ${
                        isFree
                            ? 'bg-emerald-500/30 border-emerald-300 text-white'
                            : 'bg-black/30 border-white/20 text-white'
                    } backdrop-blur-md`}>
                        <Clock className="mr-1 h-3 w-3" /> {timeText}
                    </span>
                </div>
            </div>

            {/* Content Section */}
            <div className="p-4 flex flex-col flex-grow">
                {/* User Info Mock (since we don't have all this data in Pack yet, we use placeholders or derived data) */}
                <div className="flex items-center mb-3 pb-3 border-b border-gray-100">
                    <div className="w-8 h-8 rounded-full bg-brand-light border border-gray-200 mr-2 flex items-center justify-center text-brand-primary font-bold text-xs">
                        {pack.sellerName.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                        <Link href={`/profile?view=${pack.seller_id}`} className="hover:text-brand-primary transition-colors">
                            <p className="text-xs font-bold text-gray-800 truncate">{pack.sellerName}</p>
                        </Link>
                        <div className="flex items-center text-[10px] text-gray-500">
                            {averageRating > 0 ? (
                                <>
                                    <Star className="h-3 w-3 fill-brand-accent text-brand-accent mr-1" />
                                    <span className="text-brand-accent font-semibold">{averageRating.toFixed(1)}</span>
                                    <span className="ml-1">({ratingCount})</span>
                                </>
                            ) : (
                                <>
                                    <Star className="h-3 w-3 text-gray-300 mr-1" />
                                    <span className="text-gray-400">Sin valoraciones</span>
                                </>
                            )}
                        </div>
                    </div>
                    <div className="text-xs text-brand-primary font-bold bg-brand-light px-2 py-1 rounded-full">
                        {pack.distance}
                    </div>
                </div>

                <h3 className="font-bold text-lg text-brand-dark mb-1 leading-tight line-clamp-2 min-h-[3.5rem]">
                    <Link href={`/packs/${pack.id}`} className="hover:text-brand-primary transition-colors">
                        {pack.title}
                    </Link>
                </h3>

                <div className="flex flex-wrap gap-2 mb-4 mt-2">
                    {pack.tags.map(tag => (
                        <span key={tag} className="text-[10px] font-semibold text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                            {tag}
                        </span>
                    ))}
                </div>

                <div className="mt-auto flex justify-between items-end">
                    <div>
                        {isFree ? (
                            <div className="flex flex-col items-start gap-1">
                                <span className="text-gray-400 text-sm line-through">{pack.originalPrice}€</span>
                                <span className="text-emerald-600 text-2xl font-extrabold">¡GRATIS!</span>
                            </div>
                        ) : (
                            <div>
                                <span className="text-gray-400 text-sm line-through block">{pack.originalPrice}€</span>
                                <span className="text-brand-accent text-2xl font-extrabold">{pack.price}€</span>
                            </div>
                        )}
                    </div>
                    <Button asChild className={`font-bold rounded-xl text-sm transition-colors shadow-none hover:shadow-md ${
                        isFree
                            ? 'bg-emerald-500 text-white hover:bg-emerald-600'
                            : 'bg-brand-light text-brand-primary hover:bg-brand-primary hover:text-white'
                    }`}>
                        <Link href={`/packs/${pack.id}`}>
                            Ver Pack
                        </Link>
                    </Button>
                </div>
            </div>
        </Card>
    )
}
