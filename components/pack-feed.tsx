"use client"

import { useEffect, useState } from "react"
import { PackCard } from "@/components/pack-card"
import { type Pack, packService } from "@/services/packService"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"

interface PackFeedProps {
    initialPacks: Pack[]
}

export function PackFeed({ initialPacks }: PackFeedProps) {
    const [packs, setPacks] = useState<Pack[]>(initialPacks)
    const [search, setSearch] = useState("")

    useEffect(() => {
        // Hydrate from localStorage if available (merging logic or replace)
        // For MVP, packService.getPacks() handles the logic of checking window/localStorage
        // so we can just re-fecth on mount to get "client" view
        packService.getPacks().then(setPacks)
    }, [])

    const filtered = packs.filter(p =>
        p.title.toLowerCase().includes(search.toLowerCase()) ||
        p.tags.some(t => t.toLowerCase().includes(search.toLowerCase()))
    )

    return (
        <div className="space-y-6">
            <div className="flex gap-2 max-w-md mx-auto md:mx-0">
                <div className="relative flex-1">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        type="search"
                        placeholder="Search packs..."
                        className="pl-8 bg-card"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {filtered.map(pack => (
                    <PackCard key={pack.id} pack={pack} />
                ))}
            </div>

            {filtered.length === 0 && (
                <div className="text-center py-20">
                    <h3 className="text-xl font-semibold mb-2">No packs found</h3>
                    <p className="text-muted-foreground mb-6">Be the first to create one!</p>
                    <Button asChild>
                        <Link href="/create">Sell a Pack</Link>
                    </Button>
                </div>
            )}
        </div>
    )
}
