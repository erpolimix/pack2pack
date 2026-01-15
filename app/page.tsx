"use client"

import { Button } from "@/components/ui/button"
import { PackCard } from "@/components/pack-card"
import { Footer } from "@/components/footer"
import { useEffect, useState } from "react"
import type { Pack } from "@/services/packService"
import { packService } from "@/services/packService"
import { ratingService } from "@/services/ratingService"
import { Search, MapPin, Leaf, CheckCircle2 } from "lucide-react"
import Link from "next/link"

export default function Home() {
  const [packs, setPacks] = useState<Pack[]>([])
  const [loading, setLoading] = useState(true)
  const [sellerRatings, setSellerRatings] = useState<Record<string, { rating: number; count: number }>>({})

  useEffect(() => {
    loadPacks()
  }, [])

  const loadPacks = async () => {
    try {
      const data = await packService.getPacks()
      setPacks(data)
      
      // Load ratings for all sellers
      const ratingsObj: Record<string, { rating: number; count: number }> = {}
      const uniqueSellers = new Set(data.map(p => p.seller_id))
      
      for (const sellerId of uniqueSellers) {
        try {
          const stats = await ratingService.getRatingsStats(sellerId)
          ratingsObj[sellerId] = {
            rating: stats.averageRating,
            count: stats.totalRatings
          }
        } catch (error) {
          console.error(`Error cargando stats para ${sellerId}:`, error)
        }
      }
      setSellerRatings(ratingsObj)
    } catch (error) {
      console.error("Error cargando packs:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* HERO SECTION */}
      <header className="relative bg-brand-light overflow-hidden">
        {/* Decorative Blobs */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-brand-accent/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-64 h-64 bg-brand-primary/10 rounded-full blur-3xl"></div>

        <div className="container mx-auto relative z-10 py-16 md:py-24 grid md:grid-cols-2 gap-12 items-center px-6 sm:px-8">
          <div>
            <div className="inline-flex items-center px-3 py-1 rounded-full bg-brand-primary/10 text-brand-primary text-xs font-bold mb-6">
              <Leaf className="mr-2 h-3 w-3" /> #1 App de intercambio vecinal
            </div>
            <h1 className="text-4xl md:text-6xl font-extrabold leading-tight text-brand-dark mb-6">
              Lo que sobra en tu casa,<br />
              <span className="text-brand-primary">es el tesoro de tu vecino.</span>
            </h1>
            <p className="text-lg text-gray-600 mb-8 leading-relaxed max-w-lg">
              Únete a la comunidad P2P que lucha contra el desperdicio. Compra packs sorpresa de comida casera, excedentes de huerto o despensa a precios increíbles.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                onClick={() => document.getElementById('packs-grid')?.scrollIntoView({ behavior: 'smooth' })}
                className="bg-brand-primary text-white px-8 h-12 rounded-xl font-bold shadow-lg shadow-brand-primary/30 hover:bg-brand-dark transition-all text-base cursor-pointer"
              >
                Explorar Packs
              </Button>
              <Button variant="outline" className="border-gray-200 text-brand-dark px-8 h-12 rounded-xl font-bold hover:bg-white hover:text-brand-primary transition-all text-base cursor-pointer">
                <MapPin className="mr-2 h-4 w-4" /> Ver Mapa
              </Button>
            </div>
          </div>

          {/* Hero Image / Composition */}
          <div className="relative hidden md:block">
            <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-white transform rotate-2 hover:rotate-0 transition-transform duration-500">
              {/* Placeholder image if we don't have a specific one, or use a reliable external one like in the design proposal */}
              <img
                src="https://images.unsplash.com/photo-1595475207225-428b62bda831?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
                alt="Frutas y verduras frescas"
                className="w-full h-auto object-cover"
              />

              {/* Floating Card Effect */}
              <div className="absolute bottom-6 left-6 bg-white p-4 rounded-xl shadow-lg flex items-center gap-3 max-w-xs animate-in slide-in-from-bottom duration-700">
                <div className="w-10 h-10 rounded-full border-2 border-brand-accent overflow-hidden">
                  <img src="https://randomuser.me/api/portraits/women/44.jpg" alt="User" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Acaba de publicar</p>
                  <p className="font-bold text-sm text-brand-dark">Marta S. • Pack Fruta Bio</p>
                </div>
                <span className="ml-auto font-bold text-brand-primary">3€</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* FILTERS & CONTENT */}
      <div className="sticky top-16 z-40 bg-brand-cream/95 backdrop-blur-sm border-b border-brand-primary/5 py-4 shadow-sm">
        <div className="container mx-auto overflow-x-auto no-scrollbar px-6 sm:px-8">
          <div className="flex space-x-3 md:space-x-4 min-w-max">
            <Button variant="default" className="rounded-full bg-brand-dark text-white hover:bg-brand-dark/90 font-bold text-sm shadow-md transition-transform transform active:scale-95 flex items-center gap-2 cursor-pointer">
              <Leaf className="h-4 w-4" /> Todo
            </Button>
            <Button variant="outline" className="rounded-full bg-white border-gray-200 text-gray-600 font-semibold text-sm hover:border-brand-primary hover:text-brand-primary transition-colors hover:bg-white/50 flex items-center gap-2 cursor-pointer">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Huerto
            </Button>
            <Button variant="outline" className="rounded-full bg-white border-gray-200 text-gray-600 font-semibold text-sm hover:border-brand-primary hover:text-brand-primary transition-colors hover:bg-white/50 flex items-center gap-2 cursor-pointer">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              Panadería
            </Button>
            <Button variant="outline" className="rounded-full bg-white border-gray-200 text-gray-600 font-semibold text-sm hover:border-brand-primary hover:text-brand-primary transition-colors hover:bg-white/50 flex items-center gap-2 cursor-pointer">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
              </svg>
              Cocinado
            </Button>
            <Button variant="outline" className="rounded-full bg-white border-gray-200 text-gray-600 font-semibold text-sm hover:border-brand-primary hover:text-brand-primary transition-colors hover:bg-white/50 flex items-center gap-2 cursor-pointer">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
              </svg>
              Pack Sorpresa
            </Button>
            <Button variant="outline" className="rounded-full bg-white border-gray-200 text-gray-600 font-semibold text-sm hover:border-brand-primary hover:text-brand-primary transition-colors hover:bg-white/50 flex items-center gap-2 cursor-pointer">
              <Leaf className="h-4 w-4" /> Vegano
            </Button>
          </div>
        </div>
      </div>

      <main className="flex-1 container mx-auto py-8 px-6 sm:px-8">
        <div className="flex justify-between items-end mb-6">
          <div>
            <h2 id="packs-grid" className="text-2xl font-bold text-brand-dark">Cerca de ti</h2>
            <p className="text-gray-500 text-sm mt-1 flex items-center">
              <MapPin className="h-3 w-3 text-brand-primary mr-1" /> Basado en tu ubicación actual
            </p>
          </div>
          <Link href="/" className="text-brand-primary font-bold text-sm hover:underline cursor-pointer">Ver todos</Link>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-64 bg-gray-100 rounded-2xl animate-pulse"></div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {packs.map((pack) => {
              const ratingData = sellerRatings[pack.seller_id]
              return (
                <PackCard 
                  key={pack.id} 
                  pack={pack}
                  sellerRating={ratingData?.rating}
                  sellerRatingCount={ratingData?.count}
                />
              )
            })}
          </div>
        )}

        {/* VALUE PROPS */}
        <div className="my-16 bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-brand-primary/5 grid md:grid-cols-3 gap-8 text-center">
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 bg-brand-light rounded-2xl flex items-center justify-center text-brand-primary mb-4 p-4">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="font-bold text-lg text-brand-dark mb-2">Ahorra Dinero</h3>
            <p className="text-gray-500 text-sm">Consigue comida de calidad por un tercio de su precio original.</p>
          </div>
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 bg-brand-light rounded-2xl flex items-center justify-center text-brand-primary mb-4 p-4">
              <Leaf className="w-8 h-8" />
            </div>
            <h3 className="font-bold text-lg text-brand-dark mb-2">Ayuda al Planeta</h3>
            <p className="text-gray-500 text-sm">Cada pack salvado reduce el desperdicio y las emisiones de CO2.</p>
          </div>
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 bg-brand-light rounded-2xl flex items-center justify-center text-brand-primary mb-4 p-4">
              <Search className="w-8 h-8" />
            </div>
            <h3 className="font-bold text-lg text-brand-dark mb-2">Conecta Local</h3>
            <p className="text-gray-500 text-sm">Conoce a tus vecinos y construye una comunidad más fuerte.</p>
          </div>
        </div>

      </main>

      <Footer />
    </div>
  )
}
