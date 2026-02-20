import Link from "next/link"
import { Clock, Pencil, CheckCircle2, Trash2, RefreshCw } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import type { Pack } from "@/services/packService"

interface MyPackCardProps {
    readonly pack: Pack
    readonly onMarkSold: (packId: string) => void
    readonly onDelete: (packId: string) => void
    readonly onRenew: (packId: string) => void
}

export function MyPackCard({ pack, onMarkSold, onDelete, onRenew }: MyPackCardProps) {
    const statusColors: Record<string, string> = {
        available: "bg-green-100 text-green-800",
        sold: "bg-blue-100 text-blue-800",
        expired: "bg-gray-100 text-gray-800",
        archived: "bg-orange-100 text-orange-800"
    }

    const statusLabels: Record<string, string> = {
        available: "Disponible",
        sold: "Vendido",
        expired: "Expirado",
        archived: "Archivado"
    }

    const isAvailable = pack.status === 'available'
    const isExpired = pack.status === 'expired'

    return (
        <Card className="pack-card group border-0 shadow-md hover:shadow-xl transition-all duration-300 rounded-2xl overflow-hidden bg-white flex flex-col h-full relative">
            {/* Image Section */}
            <div className="relative h-48 overflow-hidden">
                <img
                    src={pack.imageUrl}
                    alt={pack.title}
                    className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
                />

                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4 flex justify-between items-end">
                    <span className="text-white text-xs font-bold bg-black/30 backdrop-blur-md px-2 py-1 rounded-lg border border-white/20 flex items-center">
                        <Clock className="mr-1 h-3 w-3" /> {new Date(pack.expiresAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <Badge className={`${statusColors[pack.status]} font-bold text-xs`}>
                        {statusLabels[pack.status]}
                    </Badge>
                </div>
            </div>

            {/* Content Section */}
            <div className="p-4 flex flex-col flex-grow">
                <h3 className="font-bold text-lg text-brand-dark mb-1 leading-tight line-clamp-2 min-h-[3.5rem]">
                    {pack.title}
                </h3>

                <div className="flex flex-wrap gap-2 mb-4 mt-2">
                    {pack.tags.map(tag => (
                        <span key={tag} className="text-[10px] font-semibold text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                            {tag}
                        </span>
                    ))}
                </div>

                <div className="mt-auto">
                    <div className="mb-3">
                        <span className="text-gray-400 text-sm line-through block">{pack.originalPrice}€</span>
                        <span className="text-brand-accent text-2xl font-extrabold">{pack.price}€</span>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col gap-2">
                        {/* Row 1: Editar + Vendido */}
                        <div className="flex gap-2">
                            <Button
                                asChild
                                className="flex-1 bg-brand-primary text-white hover:bg-brand-dark font-bold rounded-xl text-sm transition-colors shadow-none hover:shadow-md"
                            >
                                <Link href={`/my-packs/edit/${pack.id}`} className="flex items-center justify-center gap-2">
                                    <Pencil className="h-4 w-4" />
                                    Editar
                                </Link>
                            </Button>
                            {isAvailable && (
                                <Button
                                    onClick={() => onMarkSold(pack.id)}
                                    className="flex-1 bg-brand-primary/10 text-brand-primary hover:bg-brand-primary hover:text-white font-bold rounded-xl text-sm transition-colors shadow-none hover:shadow-md flex items-center justify-center gap-2"
                                >
                                    <CheckCircle2 className="h-4 w-4" />
                                    Vendido
                                </Button>
                            )}
                        </div>
                        
                        {/* Row 2: Renovar (solo si expirado) */}
                        {isExpired && (
                            <Button
                                onClick={() => onRenew(pack.id)}
                                className="w-full bg-green-500 text-white hover:bg-green-600 font-bold rounded-xl text-sm transition-colors flex items-center justify-center gap-2"
                            >
                                <RefreshCw className="h-4 w-4" />
                                Renovar (+7 días)
                            </Button>
                        )}
                        
                        {/* Row 3: Eliminar */}
                        <Button
                            onClick={() => onDelete(pack.id)}
                            variant="outline"
                            className="w-full border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 font-medium rounded-xl text-sm transition-colors flex items-center justify-center gap-2"
                        >
                            <Trash2 className="h-4 w-4" />
                            Eliminar
                        </Button>
                    </div>
                </div>
            </div>
        </Card>
    )
}
