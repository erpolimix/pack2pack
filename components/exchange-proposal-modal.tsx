"use client"

import { useState } from "react"
import { exchangeService } from "@/services/exchangeService"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import type { Pack } from "@/services/packService"
import Image from "next/image"

interface ExchangeProposalModalProps {
  packRequested: Pack
  userPacks: Pack[]
  onClose: () => void
  onSuccess: () => void
}

export function ExchangeProposalModal({
  packRequested,
  userPacks,
  onClose,
  onSuccess
}: ExchangeProposalModalProps) {
  const [selectedPackId, setSelectedPackId] = useState<string>("")
  const [message, setMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const availablePacks = userPacks.filter(p => p.status === "available")
  const selectedPack = availablePacks.find(p => p.id === selectedPackId)

  const handlePropose = async () => {
    if (!selectedPackId) {
      setError("Debes seleccionar un pack para ofrecer")
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      await exchangeService.proposeExchange(
        packRequested.id,
        selectedPackId,
        message || undefined
      )
      onSuccess()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al enviar la propuesta")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-brand-primary to-brand-dark text-white p-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Proponer Intercambio</h2>
            <p className="text-brand-cream text-sm mt-1">Ofrece tu pack por uno que te interese</p>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:bg-white/20 rounded-full p-2 transition-colors"
          >
            ✕
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Pack Solicitado */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-3">PACK QUE QUIERES</h3>
            <div className="border-2 border-brand-primary/20 rounded-xl p-4 flex gap-4">
              <div className="relative w-20 h-20 flex-shrink-0">
                <Image
                  src={packRequested.imageUrl}
                  alt={packRequested.title}
                  fill
                  className="object-cover rounded-lg"
                  sizes="80px"
                />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-bold text-gray-900 truncate">{packRequested.title}</h4>
                <p className="text-sm text-gray-600 truncate">{packRequested.category}</p>
                <p className="text-lg font-bold text-brand-primary mt-1">{packRequested.price}€</p>
              </div>
            </div>
          </div>

          {/* Separador Visual */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-gray-200"></div>
            <svg className="w-6 h-6 text-brand-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
            </svg>
            <div className="flex-1 h-px bg-gray-200"></div>
          </div>

          {/* Pack Ofrecido */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-3">PACK QUE OFRECES</h3>

            {availablePacks.length === 0 ? (
              <div className="bg-amber-50 border-2 border-amber-200 rounded-xl p-4 text-center text-amber-900">
                <p className="font-medium">No tienes packs disponibles</p>
                <p className="text-sm mt-1">Crea un pack primero para poder hacer intercambios</p>
              </div>
            ) : (
              <div className="space-y-2">
                {availablePacks.map(pack => (
                  <label
                    key={pack.id}
                    className={`flex items-center gap-4 p-4 border-2 rounded-xl cursor-pointer transition-all ${
                      selectedPackId === pack.id
                        ? "border-brand-primary bg-brand-primary/5"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <input
                      type="radio"
                      name="pack"
                      value={pack.id}
                      checked={selectedPackId === pack.id}
                      onChange={e => setSelectedPackId(e.target.value)}
                      className="w-5 h-5 cursor-pointer"
                    />
                    <div className="relative w-16 h-16 flex-shrink-0">
                      <Image
                        src={pack.imageUrl}
                        alt={pack.title}
                        fill
                        className="object-cover rounded-lg"
                        sizes="64px"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-gray-900 truncate">{pack.title}</h4>
                      <p className="text-sm text-gray-600 truncate">{pack.category}</p>
                      <p className="text-base font-bold text-brand-primary mt-1">{pack.price}€</p>
                    </div>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Comparación de Valores */}
          {selectedPack && (
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
              <h4 className="text-sm font-semibold text-gray-700 mb-3">Comparación de Valores</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-600 mb-1">Tu Pack</p>
                  <p className="text-2xl font-bold text-brand-primary">{selectedPack.price}€</p>
                  {selectedPack.originalPrice && selectedPack.originalPrice > selectedPack.price && (
                    <p className="text-xs text-gray-500 line-through">
                      {selectedPack.originalPrice}€
                    </p>
                  )}
                </div>
                <div>
                  <p className="text-xs text-gray-600 mb-1">Pack Solicitado</p>
                  <p className="text-2xl font-bold text-brand-primary">{packRequested.price}€</p>
                  {packRequested.originalPrice && packRequested.originalPrice > packRequested.price && (
                    <p className="text-xs text-gray-500 line-through">
                      {packRequested.originalPrice}€
                    </p>
                  )}
                </div>
              </div>
              <p className="text-xs text-gray-600 mt-3 text-center">
                {Math.abs(selectedPack.price - packRequested.price) <= 5
                  ? "Valores muy similares - Intercambio equilibrado"
                  : Math.abs(selectedPack.price - packRequested.price) > 10
                    ? "Diferencia de valor importante - Negocia si es necesario"
                    : "Diferencia de valor moderada"}
              </p>
            </div>
          )}

          {/* Mensaje Opcional */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Mensaje (Opcional)
            </label>
            <Textarea
              value={message}
              onChange={e => setMessage(e.target.value)}
              placeholder="Ej: Me encantaría tu pack, creo que es justo. Espero que te interese el mío..."
              maxLength={500}
              rows={3}
              className="w-full"
            />
            <p className="text-xs text-gray-500 mt-1">{message.length}/500</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border-2 border-red-200 rounded-xl p-3 text-red-900 text-sm">
              {error}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 border-2 border-gray-300 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-50 hover:border-gray-400 disabled:opacity-50 transition-all"
            >
              Cancelar
            </button>
            <button
              onClick={handlePropose}
              disabled={!selectedPackId || isLoading}
              className="flex-1 bg-gradient-to-r from-brand-primary to-brand-dark text-white py-3 rounded-xl font-semibold hover:from-brand-dark hover:to-brand-primary hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
            >
              {isLoading ? "Enviando..." : "Enviar Propuesta"}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
