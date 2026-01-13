import Link from "next/link"
import Image from "next/image"
import { Clock, MapPin } from "lucide-react"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { Pack } from "@/services/packService"

interface PackCardProps {
    pack: Pack
}

export function PackCard({ pack }: PackCardProps) {
    const discount = Math.round(((pack.originalPrice - pack.price) / pack.originalPrice) * 100)

    return (
        <Card className="overflow-hidden group hover:shadow-lg transition-shadow border-0 shadow-md bg-card">
            <div className="relative aspect-[4/3] overflow-hidden">
                <img
                    src={pack.imageUrl}
                    alt={pack.title}
                    className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-3 left-3">
                    <Badge variant="secondary" className="bg-white/90 text-black shadow-sm backdrop-blur-sm font-bold">
                        -{discount}%
                    </Badge>
                </div>
                <div className="absolute top-3 right-3">
                    <Badge className="bg-primary/90 text-white shadow-sm backdrop-blur-sm">
                        {pack.price.toFixed(2)}€
                    </Badge>
                </div>
            </div>

            <CardContent className="p-4">
                <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-lg leading-tight line-clamp-1">{pack.title}</h3>
                </div>

                <div className="flex items-center text-muted-foreground text-xs mb-3 space-x-2">
                    <span className="flex items-center"><MapPin className="w-3 h-3 mr-1" /> {pack.distance} • {pack.location}</span>
                </div>

                <p className="text-muted-foreground text-sm line-clamp-2 h-10 mb-4">
                    {pack.description}
                </p>

                <div className="flex flex-wrap gap-2 mb-2">
                    {pack.tags.map(tag => (
                        <span key={tag} className="text-[10px] bg-secondary px-2 py-0.5 rounded-full text-secondary-foreground font-medium">
                            {tag}
                        </span>
                    ))}
                </div>
            </CardContent>

            <CardFooter className="p-4 pt-0 flex justify-between items-center text-sm border-t bg-muted/20 mt-auto">
                <div className="flex items-center text-orange-600 font-medium text-xs">
                    <Clock className="w-3 h-3 mr-1" />
                    Expires in 2h
                </div>
                <Button size="sm" asChild className="rounded-full px-4">
                    <Link href={`/packs/${pack.id}`}>
                        View Pack
                    </Link>
                </Button>
            </CardFooter>
        </Card>
    )
}
