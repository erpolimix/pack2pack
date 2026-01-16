import { supabase } from "@/lib/supabase"

export interface PlatformStats {
    totalPacks: number
    totalUsers: number
    totalValue: number
    uniqueNeighborhoods: number
}

export interface TopUser {
    id: string
    name: string
    avatar: string | null
    category: string
    badge: string
    statLabel: string
    statValue: number
    tags: string[]
    totalTransactions: number
}

export const statsService = {
    /**
     * Get platform-wide statistics
     */
    async getPlatformStats(): Promise<PlatformStats> {
        try {
            // Total packs created
            const { count: totalPacks } = await supabase
                .from('packs')
                .select('*', { count: 'exact', head: true })

            // Total active users (users who created at least one pack)
            const { data: users } = await supabase
                .from('profiles')
                .select('id', { count: 'exact' })

            // Total value recovered (sum of all pack prices)
            const { data: packPrices } = await supabase
                .from('packs')
                .select('price, original_price')

            const totalValue = (packPrices || []).reduce((sum, pack) => {
                return sum + (Number(pack.original_price) || Number(pack.price) || 0)
            }, 0)

            // Unique neighborhoods (mock - we don't have this field yet, but could extract from location)
            const uniqueNeighborhoods = Math.floor((users?.length || 0) / 3) // Simulated

            return {
                totalPacks: totalPacks || 0,
                totalUsers: users?.length || 0,
                totalValue: Math.floor(totalValue),
                uniqueNeighborhoods
            }
        } catch (error) {
            console.error("[statsService] Error fetching platform stats:", error)
            return {
                totalPacks: 0,
                totalUsers: 0,
                totalValue: 0,
                uniqueNeighborhoods: 0
            }
        }
    },

    /**
     * Get top users by category based on number of packs created
     */
    async getTopUsersByCategory(): Promise<TopUser[]> {
        try {
            // Get all users with their pack counts
            const { data: packs, error } = await supabase
                .from('packs')
                .select('seller_id, seller_name, category')
                .order('created_at', { ascending: false })

            if (error) throw error

            // Group by seller and count packs
            const sellerStats = new Map<string, {
                name: string
                totalPacks: number
                categories: Map<string, number>
            }>()

            packs?.forEach(pack => {
                if (!pack.seller_id) return

                if (!sellerStats.has(pack.seller_id)) {
                    sellerStats.set(pack.seller_id, {
                        name: pack.seller_name || 'Usuario',
                        totalPacks: 0,
                        categories: new Map()
                    })
                }

                const stats = sellerStats.get(pack.seller_id)!
                stats.totalPacks++

                const category = pack.category || 'Otro'
                stats.categories.set(category, (stats.categories.get(category) || 0) + 1)
            })

            // Convert to array and find top 3
            const topSellers = Array.from(sellerStats.entries())
                .map(([id, stats]) => {
                    // Find most frequent category
                    let maxCategory = 'Otro'
                    let maxCount = 0
                    stats.categories.forEach((count, category) => {
                        if (count > maxCount) {
                            maxCount = count
                            maxCategory = category
                        }
                    })

                    return {
                        id,
                        name: stats.name,
                        totalPacks: stats.totalPacks,
                        mainCategory: maxCategory,
                        categoryCount: maxCount
                    }
                })
                .sort((a, b) => b.totalPacks - a.totalPacks)
                .slice(0, 3)

            // Get profile data for avatars
            const userIds = topSellers.map(s => s.id)
            const { data: profiles } = await supabase
                .from('profiles')
                .select('id, full_name, avatar_url')
                .in('id', userIds)

            // Map to TopUser format
            const topUsers: TopUser[] = topSellers.map((seller, index) => {
                const profile = profiles?.find(p => p.id === seller.id)
                const categoryInfo = this.getCategoryInfo(seller.mainCategory)

                return {
                    id: seller.id,
                    name: profile?.full_name || seller.name,
                    avatar: profile?.avatar_url || null,
                    category: seller.mainCategory,
                    badge: categoryInfo.badge,
                    statLabel: categoryInfo.statLabel,
                    statValue: seller.categoryCount,
                    tags: index === 0 ? ['Top Seller', 'Fiable', 'Rápido'] : ['Fiable', 'Activo', 'Vecino Pro'],
                    totalTransactions: seller.totalPacks
                }
            })

            return topUsers
        } catch (error) {
            console.error("[statsService] Error fetching top users:", error)
            return []
        }
    },

    /**
     * Get category-specific info (badge, label, icon)
     */
    getCategoryInfo(category: string): { badge: string; statLabel: string; color: string } {
        const categoryMap: Record<string, { badge: string; statLabel: string; color: string }> = {
            'Ropa': {
                badge: 'Estilista Circular',
                statLabel: 'Prendas Reubicadas',
                color: 'from-pink-500 to-rose-600'
            },
            'Libros': {
                badge: 'Bibliotecario Vecinal',
                statLabel: 'Libros Intercambiados',
                color: 'from-blue-400 to-indigo-600'
            },
            'Juguetes': {
                badge: 'Experto en Juguetes',
                statLabel: 'Juguetes Donados',
                color: 'from-yellow-400 to-orange-500'
            },
            'Alimentos': {
                badge: 'Guardián de Alimentos',
                statLabel: 'Packs Salvados',
                color: 'from-green-400 to-emerald-600'
            },
            'Hogar': {
                badge: 'Decorador Circular',
                statLabel: 'Objetos Reubicados',
                color: 'from-purple-400 to-violet-600'
            },
            'Otro': {
                badge: 'Héroe Versátil',
                statLabel: 'Packs Compartidos',
                color: 'from-gray-400 to-slate-600'
            }
        }

        return categoryMap[category] || categoryMap['Otro']
    }
}
