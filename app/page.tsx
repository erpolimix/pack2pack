"use client"

import { Button } from "@/components/ui/button"
import { PackCard } from "@/components/pack-card"
import { Footer } from "@/components/footer"
import { LocationModal } from "@/components/location-modal"
import { useEffect, useState } from "react"
import type { Pack } from "@/services/packService"
import { packService } from "@/services/packService"
import { ratingService } from "@/services/ratingService"
import { geoService, type Location } from "@/services/geoService"
import { clearInvalidSession } from "@/lib/auth-helper"
import { Search, MapPin, Leaf, CheckCircle2, ChevronDown, Gift } from "lucide-react"
import Link from "next/link"

export default function Home() {
  const [packs, setPacks] = useState<Pack[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState<string>('todo')
  const [showOnlyFree, setShowOnlyFree] = useState(false) // Nuevo: filtro de packs gratis
  const [sellerRatings, setSellerRatings] = useState<Record<string, { rating: number; count: number }>>({})
  
  // Estados de geolocalización
  const [userLocation, setUserLocation] = useState<Location | null>(null)
  const [showLocationModal, setShowLocationModal] = useState(false)
  const [radiusKm, setRadiusKm] = useState<number>(50) // Radio por defecto 50km

  useEffect(() => {
    // Limpiar tokens inválidos al iniciar
    clearInvalidSession().then(() => {
      checkUserLocation()
    })
  }, [])

  useEffect(() => {
    if (userLocation) {
      loadPacksByProximity()
    } else {
      loadPacks()
    }
  }, [userLocation, radiusKm])

  useEffect(() => {
    loadPacksByCategory()
  }, [selectedCategory])

  const checkUserLocation = () => {
    const saved = geoService.getUserLocation()
    if (saved) {
      setUserLocation(saved)
    } else {
      setShowLocationModal(true)
    }
  }

  const handleLocationSet = (location: Location) => {
    setUserLocation(location)
    setShowLocationModal(false)
  }

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

  const loadPacksByProximity = async () => {
    if (!userLocation) return

    setLoading(true)
    try {
      const data = await packService.getPacksByProximity(
        userLocation.coordinates,
        radiusKm
      )
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
      console.error("Error cargando packs por proximidad:", error)
    } finally {
      setLoading(false)
    }
  }

  const loadPacksByCategory = async () => {
    if (selectedCategory === 'todo') {
      loadPacks()
      return
    }

    setLoading(true)
    try {
      const data = await packService.getPacksByCategory(selectedCategory)
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
      console.error("Error cargando packs por categoría:", error)
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
              Únete a la comunidad P2P que da segunda vida a todo. Compra y vende packs de alimentos, ropa, libros, juguetes, decoración y mucho más a precios increíbles.
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
                alt="Pack2Pack - Marketplace de productos entre vecinos"
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
        <div className="container mx-auto px-6 sm:px-8">
          {/* Ubicación y Radio */}
          {userLocation && (
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <div className="flex items-center gap-2 bg-white rounded-full px-4 py-2 border border-brand-primary/20">
                <MapPin className="w-4 h-4 text-brand-primary" />
                <span className="text-sm font-medium text-brand-dark">
                  {userLocation.city}
                </span>
              </div>
              
              <div className="relative">
                <select
                  value={radiusKm}
                  onChange={(e) => setRadiusKm(Number(e.target.value))}
                  className="appearance-none bg-white rounded-full px-4 py-2 pr-10 border border-gray-200 text-sm font-medium text-gray-700 hover:border-brand-primary transition-colors cursor-pointer"
                >
                  <option value={5}>5 km</option>
                  <option value={10}>10 km</option>
                  <option value={25}>25 km</option>
                  <option value={50}>50 km</option>
                  <option value={100}>100 km</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>

              <button
                onClick={() => setShowLocationModal(true)}
                className="text-sm text-brand-primary hover:text-brand-dark font-medium transition-colors"
              >
                Cambiar ubicación
              </button>
            </div>
          )}

          {/* Filtros de Categoría */}
          <div className="overflow-x-auto no-scrollbar">
            <div className="flex space-x-3 md:space-x-4 min-w-max">
              <Button 
                onClick={() => setSelectedCategory('todo')}
                variant={selectedCategory === 'todo' ? 'default' : 'outline'}
                className={selectedCategory === 'todo' ? "rounded-full bg-brand-dark text-white hover:bg-brand-dark/90 font-bold text-sm shadow-md transition-transform transform active:scale-95 flex items-center gap-2 cursor-pointer" : "rounded-full bg-white border-gray-200 text-gray-600 font-semibold text-sm hover:border-brand-primary hover:text-brand-primary transition-colors hover:bg-white/50 flex items-center gap-2 cursor-pointer"}
              >
              <Leaf className="h-4 w-4" /> Todo
            </Button>
            <Button 
              onClick={() => setSelectedCategory('Alimentos')}
              variant={selectedCategory === 'Alimentos' ? 'default' : 'outline'}
              className={selectedCategory === 'Alimentos' ? "rounded-full bg-brand-dark text-white hover:bg-brand-dark/90 font-bold text-sm shadow-md transition-transform transform active:scale-95 flex items-center gap-2 cursor-pointer" : "rounded-full bg-white border-gray-200 text-gray-600 font-semibold text-sm hover:border-brand-primary hover:text-brand-primary transition-colors hover:bg-white/50 flex items-center gap-2 cursor-pointer"}
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              Alimentos
            </Button>
            <Button 
              onClick={() => setSelectedCategory('Libros')}
              variant={selectedCategory === 'Libros' ? 'default' : 'outline'}
              className={selectedCategory === 'Libros' ? "rounded-full bg-brand-dark text-white hover:bg-brand-dark/90 font-bold text-sm shadow-md transition-transform transform active:scale-95 flex items-center gap-2 cursor-pointer" : "rounded-full bg-white border-gray-200 text-gray-600 font-semibold text-sm hover:border-brand-primary hover:text-brand-primary transition-colors hover:bg-white/50 flex items-center gap-2 cursor-pointer"}
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              Libros
            </Button>
            <Button 
              onClick={() => setSelectedCategory('Ropa')}
              variant={selectedCategory === 'Ropa' ? 'default' : 'outline'}
              className={selectedCategory === 'Ropa' ? "rounded-full bg-brand-dark text-white hover:bg-brand-dark/90 font-bold text-sm shadow-md transition-transform transform active:scale-95 flex items-center gap-2 cursor-pointer" : "rounded-full bg-white border-gray-200 text-gray-600 font-semibold text-sm hover:border-brand-primary hover:text-brand-primary transition-colors hover:bg-white/50 flex items-center gap-2 cursor-pointer"}
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.121 15.536c-1.171 1.952-3.07 1.952-4.242 0-1.172-1.953-1.172-5.119 0-7.072 1.171-1.952 3.07-1.952 4.242 0M8 10.5h4m-4 3h4m9-1.5a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Ropa
            </Button>
            <Button 
              onClick={() => setSelectedCategory('Juguetes')}
              variant={selectedCategory === 'Juguetes' ? 'default' : 'outline'}
              className={selectedCategory === 'Juguetes' ? "rounded-full bg-brand-dark text-white hover:bg-brand-dark/90 font-bold text-sm shadow-md transition-transform transform active:scale-95 flex items-center gap-2 cursor-pointer" : "rounded-full bg-white border-gray-200 text-gray-600 font-semibold text-sm hover:border-brand-primary hover:text-brand-primary transition-colors hover:bg-white/50 flex items-center gap-2 cursor-pointer"}
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Juguetes
            </Button>
            <Button 
              onClick={() => setSelectedCategory('Hogar')}
              variant={selectedCategory === 'Hogar' ? 'default' : 'outline'}
              className={selectedCategory === 'Hogar' ? "rounded-full bg-brand-dark text-white hover:bg-brand-dark/90 font-bold text-sm shadow-md transition-transform transform active:scale-95 flex items-center gap-2 cursor-pointer" : "rounded-full bg-white border-gray-200 text-gray-600 font-semibold text-sm hover:border-brand-primary hover:text-brand-primary transition-colors hover:bg-white/50 flex items-center gap-2 cursor-pointer"}
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              Hogar
            </Button>
            <Button 
              onClick={() => setSelectedCategory('Otro')}
              variant={selectedCategory === 'Otro' ? 'default' : 'outline'}
              className={selectedCategory === 'Otro' ? "rounded-full bg-brand-dark text-white hover:bg-brand-dark/90 font-bold text-sm shadow-md transition-transform transform active:scale-95 flex items-center gap-2 cursor-pointer" : "rounded-full bg-white border-gray-200 text-gray-600 font-semibold text-sm hover:border-brand-primary hover:text-brand-primary transition-colors hover:bg-white/50 flex items-center gap-2 cursor-pointer"}
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
              </svg>
              Otros
            </Button>

            {/* Filtro Gratis - Separador visual */}
            <div className="hidden md:block border-l border-gray-200 mx-2"></div>

            {/* Botón Gratis con diseño destacado */}
            <Button 
              onClick={() => setShowOnlyFree(!showOnlyFree)}
              variant={showOnlyFree ? 'default' : 'outline'}
              className={showOnlyFree ? "rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:from-emerald-600 hover:to-teal-600 font-bold text-sm shadow-lg shadow-emerald-500/50 transition-all transform active:scale-95 flex items-center gap-2 cursor-pointer ring-2 ring-emerald-300" : "rounded-full bg-white border-2 border-emerald-300 text-emerald-600 font-bold text-sm hover:border-emerald-500 hover:bg-emerald-50 transition-all hover:shadow-md flex items-center gap-2 cursor-pointer"}
            >
              <Gift className="h-5 w-5" /> ¡GRATIS!
            </Button>
            </div>
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
          <>
            {/* Mostrar mensaje si solo se muestran packs gratis */}
            {showOnlyFree && packs.some(p => p.isFree) && (
              <div className="mb-6 p-4 bg-gradient-to-r from-emerald-50 to-teal-50 border-l-4 border-emerald-500 rounded-lg">
                <p className="text-emerald-700 font-semibold flex items-center gap-2">
                  <Gift className="h-5 w-5" />
                  {(() => {
                    const freeCount = packs.filter(p => p.isFree).length
                    return `${freeCount} pack${freeCount === 1 ? '' : 's'} GRATIS disponible${freeCount === 1 ? '' : 's'}`
                  })()}
                </p>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {packs
                .filter(pack => !showOnlyFree || pack.isFree) // Aplicar filtro de gratis
                .map((pack) => {
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

            {/* Mensaje si no hay resultados */}
            {showOnlyFree && !packs.some(p => p.isFree) && (
              <div className="text-center py-12">
                <Gift className="h-16 w-16 text-emerald-300 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-700 mb-2">No hay packs gratis disponibles</h3>
                <p className="text-gray-500 mb-6">Revisa más tarde o explora otros packs especiales</p>
                <Button 
                  onClick={() => setShowOnlyFree(false)}
                  className="bg-brand-primary text-white hover:bg-brand-dark rounded-xl font-bold px-6 py-2 transition-colors"
                >
                  Ver todos los packs
                </Button>
              </div>
            )}
          </>
        )}

        {/* VALUE PROPS */}
        <div className="my-16 bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-brand-primary/5 grid md:grid-cols-3 gap-8 text-center">
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 bg-brand-light rounded-2xl flex items-center justify-center text-brand-primary mb-4 p-4">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="font-bold text-lg text-brand-dark mb-2">Ahorra Dinero</h3>
            <p className="text-gray-500 text-sm">Consigue productos de calidad a precios increíbles de tus vecinos.</p>
          </div>
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 bg-brand-light rounded-2xl flex items-center justify-center text-brand-primary mb-4 p-4">
              <Leaf className="w-8 h-8" />
            </div>
            <h3 className="font-bold text-lg text-brand-dark mb-2">Consumo Responsable</h3>
            <p className="text-gray-500 text-sm">Da segunda vida a productos y reduce el desperdicio en tu comunidad.</p>
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

      {/* Location Modal */}
      <LocationModal
        isOpen={showLocationModal}
        onClose={() => setShowLocationModal(false)}
        onLocationSet={handleLocationSet}
      />
    </div>
  )
}
