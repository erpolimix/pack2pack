"use client"

import { useState } from "react"
import { Star, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { ratingService } from "@/services/ratingService"
import { useToast } from "@/lib/useToast"

interface RatingModalProps {
    isOpen: boolean
    bookingId: string
    sellerName: string
    onClose: () => void
    onSuccess?: () => void
}

export function RatingModal({ isOpen, bookingId, sellerName, onClose, onSuccess }: RatingModalProps) {
    const [rating, setRating] = useState<number>(0)
    const [hoveredRating, setHoveredRating] = useState<number>(0)
    const [comment, setComment] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const { showSuccess, showError } = useToast()

    const handleSubmit = async () => {
        if (rating === 0) {
            showError("Por favor selecciona una calificación")
            return
        }

        setIsLoading(true)
        try {
            await ratingService.createRating(bookingId, rating, comment || undefined)
            showSuccess("¡Valoración enviada! Gracias por tu feedback")
            setRating(0)
            setComment("")
            onClose()
            onSuccess?.()
        } catch (error) {
            console.error(error)
            showError(error instanceof Error ? error.message : "Error al guardar la valoración")
        } finally {
            setIsLoading(false)
        }
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 md:p-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="text-2xl font-bold text-brand-dark">Valorar Compra</h2>
                        <p className="text-sm text-gray-600 mt-1">Vendedor: {sellerName}</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition"
                    >
                        <X className="h-6 w-6" />
                    </button>
                </div>

                {/* Star Rating */}
                <div className="mb-8">
                    <p className="text-sm font-semibold text-gray-700 mb-4">¿Qué te pareció la compra?</p>
                    <div className="flex gap-3 justify-center">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <button
                                key={star}
                                onClick={() => setRating(star)}
                                onMouseEnter={() => setHoveredRating(star)}
                                onMouseLeave={() => setHoveredRating(0)}
                                className="transition-transform hover:scale-125"
                            >
                                <Star
                                    size={48}
                                    className={`
                                        transition-all
                                        ${(hoveredRating || rating) >= star
                                            ? 'fill-brand-primary text-brand-primary'
                                            : 'text-gray-300'
                                        }
                                    `}
                                />
                            </button>
                        ))}
                    </div>

                    {/* Rating Labels */}
                    {rating > 0 && (
                        <p className="text-center mt-4 text-sm font-semibold text-brand-primary">
                            {rating === 1 && "Muy insatisfecho"}
                            {rating === 2 && "Insatisfecho"}
                            {rating === 3 && "Normal"}
                            {rating === 4 && "Satisfecho"}
                            {rating === 5 && "Muy satisfecho"}
                        </p>
                    )}
                </div>

                {/* Comment */}
                <div className="mb-6">
                    <label className="text-sm font-semibold text-gray-700 block mb-2">
                        Comentario (opcional)
                    </label>
                    <Textarea
                        placeholder="Comparte tu experiencia... ¿Qué te gustó? ¿Qué mejoraría?"
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        maxLength={500}
                        className="resize-none h-24 text-sm"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                        {comment.length}/500 caracteres
                    </p>
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                    <Button
                        variant="outline"
                        onClick={onClose}
                        disabled={isLoading}
                        className="flex-1"
                    >
                        Cancelar
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={isLoading || rating === 0}
                        className="flex-1 bg-brand-primary hover:bg-brand-dark text-white"
                    >
                        {isLoading ? "Enviando..." : "Enviar Valoración"}
                    </Button>
                </div>
            </div>
        </div>
    )
}
