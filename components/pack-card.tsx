import Link from "next/link"
import { Clock, Star } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import type { Pack } from "@/services/packService"

interface PackCardProps {
    pack: Pack
    sellerRating?: number
    sellerRatingCount?: number
}

export function PackCard({ pack, sellerRating, sellerRatingCount }: PackCardProps) {
    // Determine random stock for visual flair if not present (simulated based on logic)
    const showLowStock = Math.random() > 0.7;
    const averageRating = sellerRating || 0
    const ratingCount = sellerRatingCount || 0
    
    return (
        <Card className="pack-card group border-0 shadow-md hover:shadow-xl transition-all duration-300 rounded-2xl overflow-hidden bg-white flex flex-col h-full relative">
            {/* Image Section */}
            <div className="relative h-48 overflow-hidden">
                {showLowStock && (
                    <div className="absolute top-3 left-3 bg-brand-alert text-white text-xs font-bold px-2 py-1 rounded-md z-10 shadow-sm animate-pulse">
                        ¡Solo quedan 2!
                    </div>
                )}

                <button className="absolute top-3 right-3 z-10 w-8 h-8 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center text-gray-400 hover:text-brand-alert hover:bg-white transition-colors shadow-sm">
                    <Clock className="h-4 w-4" /> {/* Using Clock as placeholder for Heart/Favorite logic if needed */}
                </button>

                <img
                    src={pack.imageUrl}
                    alt={pack.title}
                    className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
                />

                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
                    <span className="text-white text-xs font-bold bg-black/30 backdrop-blur-md px-2 py-1 rounded-lg border border-white/20 flex items-center w-fit">
                        <Clock className="mr-1 h-3 w-3" /> {new Date(pack.expiresAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
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
                        <span className="text-gray-400 text-sm line-through block">{pack.originalPrice}€</span>
                        <span className="text-brand-accent text-2xl font-extrabold">{pack.price}€</span>
                    </div>
                    <Button asChild className="bg-brand-light text-brand-primary hover:bg-brand-primary hover:text-white font-bold rounded-xl text-sm transition-colors shadow-none hover:shadow-md">
                        <Link href={`/packs/${pack.id}`}>
                            Ver Pack
                        </Link>
                    </Button>
                </div>
            </div>
        </Card>
    )
}
