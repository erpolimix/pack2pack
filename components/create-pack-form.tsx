"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { aiService } from "@/services/aiService"
import { packService } from "@/services/packService"
import { geoService, type Location } from "@/services/geoService"
import { supabase } from "@/lib/supabase"
import { imageOptimizer } from "@/lib/image-optimizer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Camera, Loader2, Sparkles, MapPin } from "lucide-react"
import Image from "next/image"

export function CreatePackForm() {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)
    const [isAnalyzing, setIsAnalyzing] = useState(false)
    const [selectedFile, setSelectedFile] = useState<File | null>(null)
    const [imagePreview, setImagePreview] = useState<string | null>(null)

    // Form State
    const [title, setTitle] = useState("")
    const [description, setDescription] = useState("")
    const [price, setPrice] = useState("")
    const [originalPrice, setOriginalPrice] = useState("")
    const [tagInput, setTagInput] = useState("")
    const [pickupLocation, setPickupLocation] = useState("")
    const [category, setCategory] = useState<string>("Otro") // Nueva categoría automática
    const [isFree, setIsFree] = useState(false) // Estado para pack gratis
    
    // Geolocalización
    const [userLocation, setUserLocation] = useState<Location | null>(null)
    const [loadingLocation, setLoadingLocation] = useState(true)

    // Time windows with visual picker
    type TimeSlot = { day: string; time: string; label: string }
    const [selectedSlots, setSelectedSlots] = useState<TimeSlot[]>([])

    // Obtener ubicación del usuario al montar
    useEffect(() => {
        const loadLocation = async () => {
            try {
                // Intentar obtener ubicación guardada
                const saved = geoService.getUserLocation()
                if (saved) {
                    setUserLocation(saved)
                } else {
                    // Si no hay guardada, intentar obtener actual
                    const coords = await geoService.getCurrentPosition()
                    const location = await geoService.reverseGeocode(coords)
                    setUserLocation(location)
                    geoService.saveUserLocation(location)
                }
            } catch (error) {
                console.error("Error obteniendo ubicación:", error)
            } finally {
                setLoadingLocation(false)
            }
        }
        loadLocation()
    }, [])

    // Generate smart day and time options based on current time
    const generateAvailableOptions = () => {
        const now = new Date()
        const currentHour = now.getHours()
        
        // Generate next 7 days with exact dates
        const allDays = []
        for (let i = 0; i < 7; i++) {
            const date = new Date(now)
            date.setDate(date.getDate() + i)
            const dateStr = date.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' })
            const dayName = i === 0 ? 'Hoy' : i === 1 ? 'Mañana' : date.toLocaleDateString('es-ES', { weekday: 'long' })
            
            allDays.push({
                value: i.toString(),
                label: `${dayName.charAt(0).toUpperCase() + dayName.slice(1)} ${dateStr}`,
                date: date.toISOString().split('T')[0], // YYYY-MM-DD
                dayOffset: i
            })
        }

        // All time slots with their hour ranges
        const allTimeSlots = [
            { value: "morning", label: "Mañana", time: "09:00-12:00", startHour: 9, endHour: 12 },
            { value: "lunch", label: "Mediodía", time: "12:00-15:00", startHour: 12, endHour: 15 },
            { value: "afternoon", label: "Tarde", time: "15:00-18:00", startHour: 15, endHour: 18 },
            { value: "evening", label: "Noche", time: "18:00-21:00", startHour: 18, endHour: 21 },
        ]

        // Filter time slots for "today" - only show slots that haven't passed
        const getAvailableTimeSlotsForDay = (dayOffset: number) => {
            if (dayOffset === 0) {
                // For today, only show slots where current hour < slot end hour - 1
                // (give at least 1 hour buffer)
                return allTimeSlots.filter(slot => currentHour < slot.endHour - 1)
            }
            // For future days, show all slots
            return allTimeSlots
        }

        return { days: allDays, getAvailableTimeSlotsForDay, allTimeSlots }
    }

    const { days: dayOptions, getAvailableTimeSlotsForDay } = generateAvailableOptions()

    const toggleSlot = (day: string, dayLabel: string, time: string, timeLabel: string, timeRange: string) => {
        const slotId = `${day}-${time}`
        const label = `${dayLabel} ${timeRange}`
        
        const exists = selectedSlots.find(s => `${s.day}-${s.time}` === slotId)
        if (exists) {
            setSelectedSlots(selectedSlots.filter(s => `${s.day}-${s.time}` !== slotId))
        } else {
            setSelectedSlots([...selectedSlots, { day, time, label }])
        }
    }

    const isSlotSelected = (day: string, time: string) => {
        return selectedSlots.some(s => s.day === day && s.time === time)
    }

    const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        // Validar imagen
        const validation = imageOptimizer.validateImage(file, 5)
        if (!validation.valid) {
            alert(validation.error)
            return
        }

        // Comprimir imagen ANTES de procesar
        setIsAnalyzing(true)
        try {
            const compressedFile = await imageOptimizer.compressImage(file, 1200, 0.85)
            setSelectedFile(compressedFile)
            
            // Create preview
            const reader = new FileReader()
            reader.onloadend = () => {
                setImagePreview(reader.result as string)
            }
            reader.readAsDataURL(compressedFile)

            // Auto-analyze with AI (usa archivo comprimido)
            const aiSuggestion = await aiService.generateTitleAndDescription(compressedFile)
            if (aiSuggestion.title && !aiSuggestion.title.startsWith("No se ha podido")) {
                setTitle(aiSuggestion.title)
            }
            if (aiSuggestion.description && !aiSuggestion.description.startsWith("No se ha podido")) {
                setDescription(aiSuggestion.description)
                // Detectar categoría automáticamente basada en la descripción
                const detectedCategory = await aiService.detectCategory(compressedFile, aiSuggestion.description)
                setCategory(detectedCategory)
            }
        } catch (error) {
            console.error("Error procesando imagen:", error)
            alert("Error al procesar la imagen. Intenta con otra.")
        } finally {
            setIsAnalyzing(false)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)

        // Validar autenticación ANTES de cualquier otra cosa
        const { data: { session }, error: authError } = await supabase.auth.getSession()
        if (authError || !session) {
            alert("Debes iniciar sesión para crear un pack")
            router.push('/login?redirect=/create')
            setIsLoading(false)
            return
        }

        // Validación de campos
        if (!title.trim() || !description.trim() || !originalPrice) {
            alert("Por favor, completa todos los campos requeridos")
            setIsLoading(false)
            return
        }

        if (selectedSlots.length === 0) {
            alert("Por favor, selecciona al menos una franja horaria de recogida")
            setIsLoading(false)
            return
        }

        try {
            // 1. Upload image if exists
            let finalImageUrl = imagePreview || "https://images.unsplash.com/photo-1546213290-e1fc4f6d4f75?auto=format&fit=crop&q=80&w=600"

            if (selectedFile) {
                finalImageUrl = await packService.uploadImage(selectedFile)
            }

            // 2. Create pack in DB
            await packService.createPack({
                title,
                description,
                price: isFree ? 0 : (Number.parseFloat(price) || 0),
                originalPrice: Number.parseFloat(originalPrice) || 0,
                imageUrl: finalImageUrl,
                tags: tagInput.split(',').map(t => t.trim()).filter(Boolean),
                category: category, // Guardar la categoría detectada
                location: "Mi Barrio",
                distance: "0.5 km",
                sellerName: "Usuario Demo",
                pickupLocation: pickupLocation || "Mi Barrio",
                pickupWindows: selectedSlots.map(s => s.label),
                isFree: isFree, // Guardar si es gratuito
                // Añadir geolocalización
                latitude: userLocation?.coordinates.latitude,
                longitude: userLocation?.coordinates.longitude,
                city: userLocation?.city,
                neighborhood: userLocation?.neighborhood,
            })
            router.push('/')
        } catch (error) {
            console.error("Submit Error:", error)
            console.error("Error details:", {
                message: error instanceof Error ? error.message : 'Unknown error',
                stack: error instanceof Error ? error.stack : undefined,
                fullError: JSON.stringify(error, null, 2)
            })
            alert("Error al publicar el pack. Por favor, revisa la consola para más detalles.")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6 max-w-lg mx-auto p-6 bg-card rounded-xl border shadow-sm">

            {/* Ubicación Preview */}
            {userLocation && (
                <div className="bg-brand-light/50 border border-brand-primary/20 rounded-xl p-4 flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-brand-primary flex-shrink-0 mt-0.5" />
                    <div>
                        <p className="text-sm font-bold text-brand-dark">Tu pack se publicará en:</p>
                        <p className="text-sm text-gray-700">
                            {userLocation.neighborhood && `${userLocation.neighborhood}, `}
                            {userLocation.city}
                        </p>
                    </div>
                </div>
            )}

            {/* Image Upload Area */}
            <div className="space-y-2">
                <Label htmlFor="image-upload" className="block text-sm font-medium">
                    Foto del Pack
                </Label>
                <div className="relative group cursor-pointer border-2 border-dashed border-muted-foreground/25 rounded-xl hover:bg-muted/50 transition-colors h-48 flex flex-col items-center justify-center bg-muted/10 overflow-hidden">
                    <input
                        id="image-upload"
                        type="file"
                        accept="image/*"
                        className="absolute inset-0 opacity-0 cursor-pointer z-20"
                        onChange={handleImageChange}
                        required={!imagePreview}
                    />

                    {imagePreview ? (
                        <div className="relative w-full h-full">
                            <Image src={imagePreview} alt="Preview" fill className="object-cover" />
                        </div>
                    ) : (
                        <div className="flex flex-col items-center text-muted-foreground">
                            <Camera className="w-8 h-8 mb-2" />
                            <span className="text-sm font-medium">Pulsa para hacer foto</span>
                        </div>
                    )}

                    {isAnalyzing && (
                        <div className="absolute inset-0 bg-background/60 backdrop-blur-sm z-30 flex items-center justify-center flex-col text-primary animate-in fade-in">
                            <Sparkles className="w-6 h-6 mb-2 animate-pulse" />
                            <span className="text-xs font-semibold">IA analizando...</span>
                        </div>
                    )}
                </div>
                <p className="text-[10px] text-muted-foreground text-center">
                    La IA describirá automáticamente tus productos.
                </p>
            </div>

            <div className="space-y-4">
                {/* Free toggle */}
                <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl border border-emerald-200">
                    <input
                        type="checkbox"
                        id="is-free"
                        checked={isFree}
                        onChange={e => setIsFree(e.target.checked)}
                        className="w-5 h-5 rounded cursor-pointer accent-emerald-600"
                    />
                    <Label htmlFor="is-free" className="cursor-pointer flex-1 font-semibold text-emerald-700">
                        ¡Este pack es GRATIS! 🎁
                    </Label>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label>Precio (€)</Label>
                        <Input
                            type="number"
                            step="0.50"
                            placeholder="5.00"
                            value={isFree ? "0" : price}
                            onChange={e => setPrice(e.target.value)}
                            disabled={isFree}
                            className={isFree ? "opacity-50 cursor-not-allowed" : ""}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Valor Original (€)</Label>
                        <Input
                            type="number"
                            step="0.50"
                            placeholder="20.00"
                            value={originalPrice}
                            onChange={e => setOriginalPrice(e.target.value)}
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <Label>Título</Label>
                    <Input
                        placeholder="ej. Pack de libros juveniles, Lote de ropa bebé, etc."
                        value={title}
                        onChange={e => setTitle(e.target.value)}
                        required
                    />
                </div>

                <div className="space-y-2">
                    <div className="flex justify-between items-center">
                        <Label>Descripción</Label>
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-6 text-xs text-primary"
                            onClick={async () => {
                                if (!selectedFile) {
                                    alert("Primero sube una foto para que la IA la analice.");
                                    return;
                                }
                                setIsAnalyzing(true);
                                try {
                                    const d = await aiService.generateDescription(selectedFile);
                                    setDescription(d);
                                } finally {
                                    setIsAnalyzing(false);
                                }
                            }}
                        >
                            <Sparkles className="w-3 h-3 mr-1" /> Regenerar
                        </Button>
                    </div>
                    <Textarea
                        placeholder="¿Qué incluye tu pack? Describe los productos que estás ofreciendo..."
                        value={description}
                        onChange={e => setDescription(e.target.value)}
                        className="h-24 resize-none"
                        required
                    />
                </div>

                {/* Pickup Location */}
                <div className="space-y-2">
                    <Label>Punto de Recogida</Label>
                    <Input
                        placeholder="ej. Calle Mayor 15, portal izquierdo"
                        value={pickupLocation}
                        onChange={e => setPickupLocation(e.target.value)}
                        required
                    />
                    <p className="text-xs text-gray-500">Dirección específica donde el comprador recogerá el pack</p>
                </div>

                {/* Time Windows - Visual Slot Picker */}
                <div className="space-y-3">
                    <Label className="text-base font-semibold">¿Cuándo pueden recoger el pack?</Label>
                    <p className="text-xs text-gray-500 -mt-1">Selecciona los días y horarios disponibles (mínimo 1)</p>
                    
                    <div className="bg-gray-50 rounded-lg p-4 space-y-4">
                        {dayOptions.map((day) => {
                            const availableTimeSlots = getAvailableTimeSlotsForDay(day.dayOffset)
                            
                            // Don't show day if no time slots available
                            if (availableTimeSlots.length === 0) return null
                            
                            return (
                                <div key={day.value} className="space-y-2">
                                    <p className="text-sm font-semibold text-gray-700">{day.label}</p>
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                        {availableTimeSlots.map((timeOpt) => {
                                            const isSelected = isSlotSelected(day.value, timeOpt.value)
                                            return (
                                                <button
                                                    key={timeOpt.value}
                                                    type="button"
                                                    onClick={() => toggleSlot(day.value, day.label, timeOpt.value, timeOpt.label, timeOpt.time)}
                                                    className={`
                                                        px-3 py-2 rounded-lg border-2 text-sm font-medium transition-all
                                                        ${isSelected 
                                                            ? 'border-brand-primary bg-brand-primary text-white shadow-md' 
                                                            : 'border-gray-200 bg-white text-gray-700 hover:border-brand-primary/50 hover:bg-brand-light'
                                                        }
                                                    `}
                                                >
                                                    <div className="text-center">
                                                        <div className="font-semibold">{timeOpt.label}</div>
                                                        <div className="text-xs opacity-80">{timeOpt.time}</div>
                                                    </div>
                                                </button>
                                            )
                                        })}
                                    </div>
                                </div>
                            )
                        })}
                    </div>

                    {/* Selected slots preview */}
                    {selectedSlots.length > 0 && (
                        <div className="bg-brand-light border border-brand-primary/20 rounded-lg p-3">
                            <p className="text-xs font-semibold text-brand-dark mb-2">Franjas seleccionadas:</p>
                            <div className="flex flex-wrap gap-2">
                                {selectedSlots.map((slot, idx) => (
                                    <span
                                        key={idx}
                                        className="inline-flex items-center gap-1 px-2 py-1 bg-white rounded-md text-xs font-medium text-brand-dark border border-brand-primary/20"
                                    >
                                        {slot.label}
                                        <button
                                            type="button"
                                            onClick={() => toggleSlot(slot.day, "", slot.time, "", "")}
                                            className="ml-1 text-brand-primary hover:text-brand-dark"
                                        >
                                            ×
                                        </button>
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                    
                    {selectedSlots.length === 0 && (
                        <p className="text-xs text-red-600">Selecciona al menos una franja horaria</p>
                    )}
                </div>

                <div className="space-y-2">
                    <Label>Etiquetas (separadas por comas)</Label>
                    <Input
                        placeholder="ropa, vintage, tecnología"
                        value={tagInput}
                        onChange={e => setTagInput(e.target.value)}
                    />
                </div>
            </div>

            <Button 
                type="submit" 
                disabled={isLoading || isAnalyzing || selectedSlots.length === 0}
                className="w-full bg-brand-primary hover:bg-brand-dark text-white h-12 text-base font-bold rounded-xl shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {isLoading ? (
                    <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Publicando...
                    </>
                ) : selectedSlots.length === 0 ? (
                    "Selecciona franjas horarias"
                ) : (
                    "Publicar Pack"
                )}
            </Button>
        </form>
    )
}
