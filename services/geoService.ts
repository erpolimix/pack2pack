export interface Coordinates {
    latitude: number
    longitude: number
}

export interface Location {
    coordinates: Coordinates
    city: string
    postalCode?: string
    neighborhood?: string
    address?: string
}

export const geoService = {
    baseUrl: 'https://nominatim.openstreetmap.org',
    
    // Cache para reducir llamadas API (reduce costes 80%)
    cache: {
        geocode: new Map<string, { location: Location; timestamp: number }>(),
        reverseGeocode: new Map<string, { location: Location; timestamp: number }>(),
        cacheDuration: 24 * 60 * 60 * 1000, // 24 horas
        
        getCached<T>(cache: Map<string, { location: T; timestamp: number }>, key: string): T | null {
            const cached = cache.get(key)
            if (!cached) return null
            
            const isExpired = Date.now() - cached.timestamp > this.cacheDuration
            if (isExpired) {
                cache.delete(key)
                return null
            }
            
            return cached.location
        },
        
        setCached<T>(cache: Map<string, { location: T; timestamp: number }>, key: string, location: T): void {
            cache.set(key, { location, timestamp: Date.now() })
            
            // Limpiar cache viejo (mantener máximo 100 entradas)
            if (cache.size > 100) {
                const oldestKey = Array.from(cache.keys())[0]
                cache.delete(oldestKey)
            }
        }
    },

    /**
     * Obtener ubicación actual del navegador
     * Implementación optimizada para iOS (Safari/Chrome) con diagnóstico detallado
     */
    async getCurrentPosition(): Promise<Coordinates> {
        return new Promise((resolve, reject) => {
            // Log 1: Verificar soporte de geolocalización
            const diagnosticInfo: string[] = []
            diagnosticInfo.push(`[GEO] Navegador: ${navigator.userAgent}`)
            diagnosticInfo.push(`[GEO] Geolocation API: ${navigator.geolocation ? 'DISPONIBLE' : 'NO DISPONIBLE'}`)
            
            if (!navigator.geolocation) {
                const error = "Geolocalización no soportada por este navegador"
                diagnosticInfo.push(`[GEO] ERROR: ${error}`)
                reject(new Error(error + "\n\nDiagnóstico:\n" + diagnosticInfo.join("\n")))
                return
            }

            // Log 2: Estado de permisos (si está disponible)
            if (navigator.permissions) {
                navigator.permissions.query({ name: 'geolocation' }).then(result => {
                    diagnosticInfo.push(`[GEO] Permiso: ${result.state}`)
                }).catch(() => {
                    diagnosticInfo.push(`[GEO] Permiso: No se pudo verificar`)
                })
            }

            diagnosticInfo.push(`[GEO] Iniciando intento 1 (alta precisión)...`)
            
            const tryHighAccuracy = () => {
                const startTime = Date.now()
                
                navigator.geolocation.getCurrentPosition(
                    (position) => {
                        const elapsed = Date.now() - startTime
                        diagnosticInfo.push(`[GEO] ✓ Éxito en ${elapsed}ms`)
                        diagnosticInfo.push(`[GEO] Precisión: ${position.coords.accuracy}m`)
                        console.log(diagnosticInfo.join("\n"))
                        
                        resolve({
                            latitude: position.coords.latitude,
                            longitude: position.coords.longitude
                        })
                    },
                    (error) => {
                        const elapsed = Date.now() - startTime
                        diagnosticInfo.push(`[GEO] ✗ Intento 1 falló en ${elapsed}ms`)
                        diagnosticInfo.push(`[GEO] Código error: ${error.code} (${error.message})`)
                        diagnosticInfo.push(`[GEO] Iniciando intento 2 (baja precisión)...`)
                        console.warn(diagnosticInfo.join("\n"))
                        
                        tryLowAccuracy()
                    },
                    {
                        enableHighAccuracy: true,
                        timeout: 15000,
                        maximumAge: 300000
                    }
                )
            }

            const tryLowAccuracy = () => {
                const startTime = Date.now()
                
                navigator.geolocation.getCurrentPosition(
                    (position) => {
                        const elapsed = Date.now() - startTime
                        diagnosticInfo.push(`[GEO] ✓ Éxito en ${elapsed}ms (baja precisión)`)
                        diagnosticInfo.push(`[GEO] Precisión: ${position.coords.accuracy}m`)
                        console.log(diagnosticInfo.join("\n"))
                        
                        resolve({
                            latitude: position.coords.latitude,
                            longitude: position.coords.longitude
                        })
                    },
                    (error) => {
                        const elapsed = Date.now() - startTime
                        diagnosticInfo.push(`[GEO] ✗ Intento 2 falló en ${elapsed}ms`)
                        diagnosticInfo.push(`[GEO] Código error: ${error.code} (${error.message})`)
                        
                        // Mensaje de error detallado según código
                        let errorMessage = ""
                        switch (error.code) {
                            case 1: // PERMISSION_DENIED
                                errorMessage = "PERMISO DENEGADO\n\nPor favor, habilita el acceso a ubicación:\n- iOS: Ajustes > Safari/Chrome > Ubicación > Permitir"
                                diagnosticInfo.push(`[GEO] Causa probable: Usuario negó permiso o no hay permisos en navegador`)
                                break
                            case 2: // POSITION_UNAVAILABLE
                                errorMessage = "UBICACIÓN NO DISPONIBLE\n\nVerifica:\n- GPS activado\n- WiFi conectado\n- Permisos de ubicación"
                                diagnosticInfo.push(`[GEO] Causa probable: Hardware GPS no disponible o sin señal`)
                                break
                            case 3: // TIMEOUT
                                errorMessage = "TIEMPO AGOTADO\n\nEl GPS tardó demasiado.\nIntenta de nuevo o usa entrada manual."
                                diagnosticInfo.push(`[GEO] Causa probable: GPS lento o sin señal suficiente`)
                                break
                            default:
                                errorMessage = `ERROR DESCONOCIDO (código ${error.code})`
                                diagnosticInfo.push(`[GEO] Error no reconocido`)
                        }
                        
                        const fullDiagnostic = diagnosticInfo.join("\n")
                        console.error(fullDiagnostic)
                        
                        reject(new Error(errorMessage + "\n\n" + fullDiagnostic))
                    },
                    {
                        enableHighAccuracy: false,
                        timeout: 20000,
                        maximumAge: 600000
                    }
                )
            }

            // Iniciar con alta precisión
            tryHighAccuracy()
        })
    },

    /**
     * Reverse geocoding: coordenadas → dirección
     * Con cache de 24 horas para reducir API calls
     */
    async reverseGeocode(coords: Coordinates): Promise<Location> {
        // Redondear coordenadas a 3 decimales (~100m precisión) para mejor cache hit rate
        const cacheKey = `${coords.latitude.toFixed(3)},${coords.longitude.toFixed(3)}`
        
        // Buscar en cache
        const cached = this.cache.getCached(this.cache.reverseGeocode, cacheKey)
        if (cached) {
            console.log('[GeoService] Cache HIT - reverseGeocode:', cacheKey)
            return cached
        }
        
        console.log('[GeoService] Cache MISS - fetching from Nominatim:', cacheKey)
        
        try {
            const response = await fetch(
                `${this.baseUrl}/reverse?lat=${coords.latitude}&lon=${coords.longitude}&format=json&addressdetails=1`,
                {
                    headers: {
                        'User-Agent': 'Pack2Pack/1.0',
                        'Accept-Language': 'es'
                    }
                }
            )

            if (!response.ok) {
                throw new Error('Error en reverse geocoding')
            }

            const data = await response.json()

            const location: Location = {
                coordinates: coords,
                city: data.address.city || data.address.town || data.address.village || data.address.municipality || 'Ciudad desconocida',
                postalCode: data.address.postcode,
                neighborhood: data.address.suburb || data.address.neighbourhood || data.address.quarter,
                address: data.display_name
            }
            
            // Guardar en cache
            this.cache.setCached(this.cache.reverseGeocode, cacheKey, location)
            
            return location
        } catch (error) {
            console.error("Error en reverseGeocode:", error)
            throw error
        }
    },

    /**
     * Geocoding: dirección/ciudad → coordenadas
     * Con cache de 24 horas para reducir API calls
     */
    async geocodeAddress(address: string): Promise<Location> {
        // Normalizar dirección para cache
        const cacheKey = address.toLowerCase().trim()
        
        // Buscar en cache
        const cached = this.cache.getCached(this.cache.geocode, cacheKey)
        if (cached) {
            console.log('[GeoService] Cache HIT - geocode:', cacheKey)
            return cached
        }
        
        console.log('[GeoService] Cache MISS - fetching from Nominatim:', cacheKey)
        
        try {
            // Añadir "España" si no está incluido para mejor precisión
            const searchQuery = address.toLowerCase().includes('españa') 
                ? address 
                : `${address}, España`

            const response = await fetch(
                `${this.baseUrl}/search?q=${encodeURIComponent(searchQuery)}&format=json&addressdetails=1&limit=1&countrycodes=es`,
                {
                    headers: {
                        'User-Agent': 'Pack2Pack/1.0',
                        'Accept-Language': 'es'
                    }
                }
            )

            if (!response.ok) {
                throw new Error('Error en geocoding')
            }

            const data = await response.json()

            if (data.length === 0) {
                throw new Error('Dirección no encontrada')
            }

            const result = data[0]
            const coords: Coordinates = {
                latitude: parseFloat(result.lat),
                longitude: parseFloat(result.lon)
            }

            const location: Location = {
                coordinates: coords,
                city: result.address.city || result.address.town || result.address.village || result.address.municipality || 'Ciudad desconocida',
                postalCode: result.address.postcode,
                neighborhood: result.address.suburb || result.address.neighbourhood || result.address.quarter,
                address: result.display_name
            }
            
            // Guardar en cache
            this.cache.setCached(this.cache.geocode, cacheKey, location)
            
            return location
        } catch (error) {
            console.error("Error en geocodeAddress:", error)
            throw error
        }
    },

    /**
     * Buscar direcciones con autocompletado
     */
    async searchAddresses(query: string): Promise<Array<{ display_name: string; lat: string; lon: string }>> {
        try {
            if (query.length < 3) return []

            const response = await fetch(
                `${this.baseUrl}/search?q=${encodeURIComponent(query)}, España&format=json&addressdetails=1&limit=5&countrycodes=es`,
                {
                    headers: {
                        'User-Agent': 'Pack2Pack/1.0',
                        'Accept-Language': 'es'
                    }
                }
            )

            if (!response.ok) {
                return []
            }

            return await response.json()
        } catch (error) {
            console.error("Error en searchAddresses:", error)
            return []
        }
    },

    /**
     * Calcular distancia entre dos puntos usando fórmula de Haversine
     * @returns distancia en kilómetros
     */
    calculateDistance(coords1: Coordinates, coords2: Coordinates): number {
        const R = 6371 // Radio de la Tierra en km
        const dLat = this.toRad(coords2.latitude - coords1.latitude)
        const dLon = this.toRad(coords2.longitude - coords1.longitude)

        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(this.toRad(coords1.latitude)) *
            Math.cos(this.toRad(coords2.latitude)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2)

        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
        return R * c
    },

    /**
     * Formatear distancia para mostrar
     */
    formatDistance(km: number): string {
        if (km < 1) {
            return `${Math.round(km * 1000)} m`
        } else if (km < 10) {
            return `${km.toFixed(1)} km`
        } else {
            return `${Math.round(km)} km`
        }
    },

    toRad(degrees: number): number {
        return degrees * (Math.PI / 180)
    },

    /**
     * Guardar ubicación del usuario en localStorage
     */
    saveUserLocation(location: Location): void {
        try {
            localStorage.setItem('user_location', JSON.stringify(location))
        } catch (error) {
            console.error("Error guardando ubicación:", error)
        }
    },

    /**
     * Obtener ubicación guardada del usuario
     */
    getUserLocation(): Location | null {
        try {
            const stored = localStorage.getItem('user_location')
            return stored ? JSON.parse(stored) : null
        } catch (error) {
            console.error("Error obteniendo ubicación guardada:", error)
            return null
        }
    },

    /**
     * Limpiar ubicación guardada
     */
    clearUserLocation(): void {
        try {
            localStorage.removeItem('user_location')
        } catch (error) {
            console.error("Error limpiando ubicación:", error)
        }
    }
}
