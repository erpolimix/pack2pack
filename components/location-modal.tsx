"use client"

import { useState } from 'react'
import { MapPin, Loader2, X } from 'lucide-react'
import { geoService, type Location } from '@/services/geoService'

interface LocationModalProps {
    isOpen: boolean
    onClose: () => void
    onLocationSet: (location: Location) => void
}

export function LocationModal({ isOpen, onClose, onLocationSet }: LocationModalProps) {
    const [loading, setLoading] = useState(false)
    const [manualCity, setManualCity] = useState("")
    const [error, setError] = useState("")

    if (!isOpen) return null

    const handleUseCurrentLocation = async () => {
        setLoading(true)
        setError("")
        try {
            const coords = await geoService.getCurrentPosition()
            const location = await geoService.reverseGeocode(coords)
            geoService.saveUserLocation(location)
            onLocationSet(location)
            onClose()
        } catch (err) {
            console.error("Error obteniendo ubicación:", err)
            
            // Mostrar el mensaje de error detallado al usuario
            const errorMessage = err instanceof Error ? err.message : String(err)
            
            // Si el error incluye diagnóstico, mostrarlo (útil para debug)
            if (errorMessage.includes('[GEO]')) {
                // Extraer solo la parte legible para el usuario
                const userMessage = errorMessage.split('\n\n')[0]
                const diagnostic = errorMessage.split('\n\n')[1] || ''
                
                console.log('=== DIAGNÓSTICO DETALLADO ===\n' + diagnostic)
                setError(userMessage || "No pudimos obtener tu ubicación. Por favor, introdúcela manualmente.")
            } else {
                setError(errorMessage || "No pudimos obtener tu ubicación. Por favor, introdúcela manualmente.")
            }
        } finally {
            setLoading(false)
        }
    }

    const handleManualCity = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!manualCity.trim()) return

        setLoading(true)
        setError("")
        try {
            const location = await geoService.geocodeAddress(manualCity)
            geoService.saveUserLocation(location)
            onLocationSet(location)
            onClose()
        } catch (err) {
            console.error("Error geocodificando:", err)
            setError("No encontramos esa ubicación. Intenta con otra ciudad o código postal.")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 relative shadow-2xl">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
                >
                    <X size={24} />
                </button>

                <div className="w-16 h-16 bg-brand-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <MapPin className="w-8 h-8 text-brand-primary" />
                </div>

                <h2 className="text-2xl font-bold text-center mb-2 text-brand-dark">
                    ¿Desde dónde buscas?
                </h2>
                <p className="text-gray-600 text-center mb-6">
                    Para mostrarte packs cerca de ti, necesitamos tu ubicación
                </p>

                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-600 rounded-lg p-3 mb-4 text-sm">
                        {error}
                    </div>
                )}

                <button
                    onClick={handleUseCurrentLocation}
                    disabled={loading}
                    className="w-full bg-brand-primary text-white py-3 rounded-xl font-bold mb-4 hover:bg-brand-dark transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                    {loading ? (
                        <>
                            <Loader2 className="animate-spin" size={20} />
                            <span>Obteniendo ubicación...</span>
                        </>
                    ) : (
                        <>
                            <MapPin size={20} />
                            <span>Usar mi ubicación actual</span>
                        </>
                    )}
                </button>

                <div className="flex items-center gap-2 mb-4">
                    <div className="flex-1 border-t border-gray-300"></div>
                    <span className="text-gray-500 text-sm">o</span>
                    <div className="flex-1 border-t border-gray-300"></div>
                </div>

                <form onSubmit={handleManualCity}>
                    <input
                        type="text"
                        placeholder="Madrid, Barcelona, 28001..."
                        value={manualCity}
                        onChange={(e) => setManualCity(e.target.value)}
                        className="w-full border border-gray-300 rounded-xl px-4 py-3 mb-4 focus:outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 transition-all"
                        disabled={loading}
                    />
                    <button
                        type="submit"
                        disabled={loading || !manualCity.trim()}
                        className="w-full bg-white border-2 border-brand-primary text-brand-primary py-3 rounded-xl font-bold hover:bg-brand-light transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Buscar en esta ciudad
                    </button>
                </form>

                <p className="text-xs text-gray-500 text-center mt-4">
                    Tu ubicación se guarda localmente en tu dispositivo
                </p>
            </div>
        </div>
    )
}
