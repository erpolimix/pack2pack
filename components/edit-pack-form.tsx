"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { aiAction } from "@/app/actions/ai"
import { packService, Pack } from "@/services/packService"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Camera, Loader2, Sparkles } from "lucide-react"
import Image from "next/image"

interface EditPackFormProps {
    readonly pack: Pack
    readonly onSuccess?: () => void
}

export function EditPackForm({ pack, onSuccess }: EditPackFormProps) {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)
    const [isAnalyzing, setIsAnalyzing] = useState(false)
    const [selectedFile, setSelectedFile] = useState<File | null>(null)
    const [imagePreview, setImagePreview] = useState<string | null>(pack.imageUrl)

    // Form State - Initialize with pack data
    const [title, setTitle] = useState(pack.title)
    const [description, setDescription] = useState(pack.description)
    const [price, setPrice] = useState(pack.price.toString())
    const [originalPrice, setOriginalPrice] = useState(pack.originalPrice?.toString() || "")
    const [tagInput, setTagInput] = useState(pack.tags?.join(", ") || "")
    const [pickupLocation, setPickupLocation] = useState(pack.pickupLocation || pack.location || "")
    const [isFree, setIsFree] = useState(pack.isFree)

    // Time windows with visual picker
    type TimeSlot = { day: string; time: string; label: string }
    const [selectedSlots, setSelectedSlots] = useState<TimeSlot[]>(() => {
        // Convert existing pickupWindows back to TimeSlot format if available
        if (pack.pickupWindows && pack.pickupWindows.length > 0) {
            return pack.pickupWindows.map((label, idx) => ({
                day: `existing-${idx}`,
                time: `existing-${idx}`,
                label: label
            }))
        }
        return []
    })

    // Generate smart day and time options based on current time
    const generateAvailableOptions = () => {
        const now = new Date()
        const currentHour = now.getHours()
        const currentDay = now.getDay()
        
        const allDays = [
            { value: "today", label: "Hoy", dayNumber: currentDay },
            { value: "tomorrow", label: "Mañana", dayNumber: (currentDay + 1) % 7 },
            { value: "dayAfter", label: "Pasado mañana", dayNumber: (currentDay + 2) % 7 },
        ]
        
        const saturdayOffset = (6 - currentDay + 7) % 7
        if (saturdayOffset > 2) {
            allDays.push({ value: "saturday", label: "Sábado", dayNumber: 6 })
        }
        
        const sundayOffset = (7 - currentDay) % 7
        if (sundayOffset > 2) {
            allDays.push({ value: "sunday", label: "Domingo", dayNumber: 0 })
        }

        const allTimeSlots = [
            { value: "morning", label: "Mañana", time: "09:00-12:00", startHour: 9, endHour: 12 },
            { value: "lunch", label: "Mediodía", time: "12:00-15:00", startHour: 12, endHour: 15 },
            { value: "afternoon", label: "Tarde", time: "15:00-18:00", startHour: 15, endHour: 18 },
            { value: "evening", label: "Noche", time: "18:00-21:00", startHour: 18, endHour: 21 },
        ]

        const getAvailableTimeSlotsForDay = (dayValue: string) => {
            if (dayValue === "today") {
                return allTimeSlots.filter(slot => currentHour < slot.endHour - 1)
            }
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

        setSelectedFile(file)
        // Create preview
        const reader = new FileReader()
        reader.onloadend = () => {
            setImagePreview(reader.result as string)
        }
        reader.readAsDataURL(file)

        // Auto-analyze
        setIsAnalyzing(true)
        try {
            const formData = new FormData()
            formData.append('file', file)
            const aiDesc = await aiAction('desc', formData) as string
            if (aiDesc) {
                setDescription(aiDesc)
                // Heuristic title guess based on description
                setTitle(aiDesc.split(' ').slice(0, 3).join(' ') + " Pack")
            }
        } catch (error) {
            console.error("AI Error", error)
        } finally {
            setIsAnalyzing(false)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)

        try {
            // 1. Upload new image if changed
            let finalImageUrl = pack.imageUrl

            if (selectedFile) {
                finalImageUrl = await packService.uploadImage(selectedFile)
            }

            // 2. Update pack in DB
            await packService.updatePack(pack.id, {
                title,
                description,
                price: isFree ? 0 : (Number.parseFloat(price) || 0),
                originalPrice: Number.parseFloat(originalPrice) || 0,
                imageUrl: finalImageUrl,
                tags: tagInput.split(',').map(t => t.trim()).filter(Boolean),
                pickupLocation: pickupLocation || pack.location,
                pickupWindows: selectedSlots.map(s => s.label),
                isFree: isFree,
            })

            if (onSuccess) {
                onSuccess()
            } else {
                router.push('/my-packs')
            }
        } catch (error) {
            console.error("Update Error:", error)
            console.error("Error details:", {
                message: error instanceof Error ? error.message : 'Unknown error',
                stack: error instanceof Error ? error.stack : undefined,
                fullError: JSON.stringify(error, null, 2)
            })
            alert("Error al actualizar el pack. Por favor, revisa la consola para más detalles.")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6 max-w-lg mx-auto p-6 bg-card rounded-xl border shadow-sm">

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
                    />

                    {imagePreview ? (
                        <div className="relative w-full h-full">
                            <Image src={imagePreview} alt="Preview" fill className="object-cover" />
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                                <span className="text-white font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                                    Click para cambiar imagen
                                </span>
                            </div>
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
                    {selectedFile ? "Nueva imagen seleccionada" : "Click para cambiar la imagen actual"}
                </p>
            </div>

            <div className="space-y-4">
                {/* Free toggle */}
                <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl border border-emerald-200">
                    <input
                        type="checkbox"
                        id="is-free-edit"
                        checked={isFree}
                        onChange={e => setIsFree(e.target.checked)}
                        className="w-5 h-5 rounded cursor-pointer accent-emerald-600"
                    />
                    <Label htmlFor="is-free-edit" className="cursor-pointer flex-1 font-semibold text-emerald-700">
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
                                    const formData = new FormData()
                                    formData.append('file', selectedFile)
                                    const d = await aiAction('desc', formData) as string;
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
                        placeholder="¿Qué hay en el pack?"
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
                            const availableTimeSlots = getAvailableTimeSlotsForDay(day.value)
                            
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
                        Guardando cambios...
                    </>
                ) : selectedSlots.length === 0 ? (
                    "Selecciona franjas horarias"
                ) : (
                    "Guardar Cambios"
                )}
            </Button>
        </form>
    )
}
