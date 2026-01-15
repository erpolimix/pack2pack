"use client"

import { Star } from "lucide-react"
import { Rating } from "@/services/ratingService"

interface RatingsDisplayProps {
    ratings: Rating[]
    averageRating: number
    totalRatings: number
    ratingDistribution?: { [key: number]: number }
}

export function RatingsDisplay({
    ratings,
    averageRating,
    totalRatings,
    ratingDistribution = {}
}: RatingsDisplayProps) {
    if (totalRatings === 0) {
        return (
            <div className="text-center py-12">
                <Star className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-600">Este usuario aún no tiene valoraciones</p>
            </div>
        )
    }

    return (
        <div className="space-y-8">
            {/* Rating Summary */}
            <div className="bg-brand-light rounded-lg p-6">
                <div className="flex items-start gap-6">
                    {/* Average Rating */}
                    <div className="text-center">
                        <div className="text-5xl font-bold text-brand-primary mb-2">
                            {averageRating.toFixed(1)}
                        </div>
                        <div className="flex items-center justify-center gap-1 mb-2">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                    key={star}
                                    size={18}
                                    className={`
                                        ${star <= Math.round(averageRating)
                                            ? 'fill-brand-primary text-brand-primary'
                                            : 'text-gray-300'
                                        }
                                    `}
                                />
                            ))}
                        </div>
                        <p className="text-sm text-gray-600">
                            {totalRatings} {totalRatings === 1 ? 'valoración' : 'valoraciones'}
                        </p>
                    </div>

                    {/* Rating Distribution */}
                    <div className="flex-1 space-y-2">
                        {[5, 4, 3, 2, 1].map((rating) => {
                            const count = ratingDistribution[rating] || 0
                            const percentage = totalRatings > 0 ? (count / totalRatings) * 100 : 0

                            return (
                                <div key={rating} className="flex items-center gap-2">
                                    <span className="text-sm font-medium text-gray-600 w-12">
                                        {rating} ⭐
                                    </span>
                                    <div className="flex-1 bg-gray-200 rounded-full h-2 overflow-hidden">
                                        <div
                                            className="bg-brand-primary h-full transition-all"
                                            style={{ width: `${percentage}%` }}
                                        />
                                    </div>
                                    <span className="text-sm text-gray-600 w-8 text-right">
                                        {count}
                                    </span>
                                </div>
                            )
                        })}
                    </div>
                </div>
            </div>

            {/* Individual Ratings */}
            <div className="space-y-4">
                <h3 className="text-lg font-bold text-brand-dark">Comentarios ({ratings.length})</h3>
                {ratings.map((rating) => (
                    <div key={rating.id} className="border border-gray-200 rounded-lg p-4">
                        {/* Rater Info */}
                        <div className="flex items-start gap-3 mb-3">
                            {rating.raterImageUrl && (
                                <div className="relative w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
                                    <img
                                        src={rating.raterImageUrl}
                                        alt={rating.raterName || 'Usuario'}
                                        className="w-10 h-10 object-cover"
                                    />
                                </div>
                            )}
                            <div className="flex-1 min-w-0">
                                <p className="font-semibold text-gray-900">{rating.raterName}</p>
                                <p className="text-xs text-gray-500">
                                    {new Date(rating.createdAt).toLocaleDateString('es-ES', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric'
                                    })}
                                </p>
                            </div>
                        </div>

                        {/* Rating Stars */}
                        <div className="flex items-center gap-2 mb-2">
                            <div className="flex gap-1">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <Star
                                        key={star}
                                        size={16}
                                        className={`
                                            ${star <= rating.rating
                                                ? 'fill-brand-primary text-brand-primary'
                                                : 'text-gray-300'
                                            }
                                        `}
                                    />
                                ))}
                            </div>
                            <span className="text-sm font-semibold text-brand-primary">
                                {rating.rating.toFixed(1)}
                            </span>
                        </div>

                        {/* Comment */}
                        {rating.comment && (
                            <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                                {rating.comment}
                            </p>
                        )}
                    </div>
                ))}
            </div>
        </div>
    )
}
