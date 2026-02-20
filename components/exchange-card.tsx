"use client"

import { useState } from "react"
import Image from "next/image"
import { exchangeService, type Exchange } from "@/services/exchangeService"
import { Input } from "@/components/ui/input"
import { Toast } from "@/components/ui/toast"
import { cn } from "@/lib/utils"
import { useToast } from "@/lib/useToast"

interface ExchangeCardProps {
  exchange: Exchange
  isRequester: boolean
  onActionCompleted?: () => void
}

const STATUS_LABELS = {
  pending: "Pendiente",
  accepted: "Aceptado",
  rejected: "Rechazado",
  completed: "Completado",
  cancelled: "Cancelado"
}

const STATUS_COLORS = {
  pending: "bg-amber-50 border-amber-200 text-amber-900",
  accepted: "bg-blue-50 border-blue-200 text-blue-900",
  rejected: "bg-red-50 border-red-200 text-red-900",
  completed: "bg-green-50 border-green-200 text-green-900",
  cancelled: "bg-gray-50 border-gray-200 text-gray-900"
}

export function ExchangeCard({
  exchange,
  isRequester,
  onActionCompleted
}: ExchangeCardProps) {
  const [showValidationCode, setShowValidationCode] = useState(false)
  const [validationCode, setValidationCode] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [showTimeWindowModal, setShowTimeWindowModal] = useState(false)
  const [selectedTimeWindow, setSelectedTimeWindow] = useState("")
  const { showError, showSuccess, toast, hideToast } = useToast()

  const otherUser = isRequester ? exchange.owner : exchange.requester

  // Formatear fecha
  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("es-ES", {
      year: "numeric",
      month: "short",
      day: "numeric"
    })
  }

  // Verificar si la propuesta ha expirado
  const isExpired = new Date(exchange.expiresAt) < new Date() && exchange.status === "pending"

  // Botón Aceptar (solo para owner de pack solicitado)
  const handleAcceptClick = () => {
    // Verificar que el pack tenga franjas horarias disponibles
    if (!exchange.packRequested?.pickupWindows || exchange.packRequested.pickupWindows.length === 0) {
      showError("El pack no tiene franjas horarias configuradas")
      return
    }
    setShowTimeWindowModal(true)
  }

  const handleConfirmAccept = async () => {
    if (!selectedTimeWindow) {
      showError("Debes seleccionar una franja horaria")
      return
    }

    setIsLoading(true)
    try {
      await exchangeService.acceptExchange(
        exchange.id,
        selectedTimeWindow
      )
      showSuccess("¡Propuesta aceptada!")
      setShowTimeWindowModal(false)
      setSelectedTimeWindow("")
      onActionCompleted?.()
    } catch (error) {
      showError(error instanceof Error ? error.message : "Error al aceptar")
    } finally {
      setIsLoading(false)
    }
  }

  // Botón Rechazar (solo para owner)
  const handleReject = async () => {
    if (!confirm("¿Estás seguro de que quieres rechazar esta propuesta?")) return

    setIsLoading(true)
    try {
      await exchangeService.rejectExchange(exchange.id)
      showSuccess("Propuesta rechazada")
      onActionCompleted?.()
    } catch (error) {
      showError(error instanceof Error ? error.message : "Error al rechazar")
    } finally {
      setIsLoading(false)
    }
  }

  // Botón Cancelar (solo para quien propuso)
  const handleCancel = async () => {
    if (!confirm("¿Estás seguro de que quieres cancelar este intercambio?")) return

    setIsLoading(true)
    try {
      await exchangeService.cancelExchange(exchange.id)
      showSuccess("Intercambio cancelado")
      onActionCompleted?.()
    } catch (error) {
      showError(error instanceof Error ? error.message : "Error al cancelar")
    } finally {
      setIsLoading(false)
    }
  }

  // Validar con código
  const handleValidate = async () => {
    if (!validationCode || validationCode.length !== 6) {
      showError("Código debe tener 6 dígitos")
      return
    }

    setIsLoading(true)
    try {
      const isCompleted = await exchangeService.validateByUser(exchange.id, validationCode)
      if (isCompleted) {
        showSuccess("¡Intercambio completado!")
      } else {
        showSuccess("Validación registrada. En espera del otro usuario...")
      }
      setValidationCode("")
      setShowValidationCode(false)
      onActionCompleted?.()
    } catch (error) {
      showError(error instanceof Error ? error.message : "Código incorrecto")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div
      className={cn(
        "border-2 rounded-2xl p-4 md:p-6 transition-all",
        isExpired ? "border-gray-200 bg-gray-50 opacity-60" : "border-brand-primary/20 bg-white"
      )}
    >
      {/* Header con estado */}
      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="flex-1">
          <h3 className="font-bold text-lg text-gray-900">
            {isRequester ? "Propuesta Enviada" : "Propuesta Recibida"}
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            {otherUser?.full_name || "Usuario"} • {formatDate(exchange.createdAt)}
          </p>
        </div>
        <div
          className={cn(
            "px-3 py-1 rounded-full text-xs font-bold border whitespace-nowrap",
            STATUS_COLORS[exchange.status]
          )}
        >
          {isExpired ? "Expirada" : STATUS_LABELS[exchange.status]}
        </div>
      </div>

      {/* Packs */}
      <div className="grid md:grid-cols-2 gap-4 mb-6">
        {/* Pack Ofrecido */}
        <div className="space-y-2">
          <p className="text-xs font-bold text-gray-600 uppercase">
            {isRequester ? "Tu Oferta" : "Su Oferta"}
          </p>
          <div className="border-2 border-gray-200 rounded-xl p-3 flex gap-3">
            <div className="relative w-16 h-16 flex-shrink-0">
              <Image
                src={exchange.packOffered?.imageUrl || ""}
                alt={exchange.packOffered?.title || ""}
                fill
                className="object-cover rounded-lg"
                sizes="64px"
              />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-bold text-sm text-gray-900 truncate">
                {exchange.packOffered?.title}
              </h4>
              <p className="text-xs text-gray-600">{exchange.packOffered?.category}</p>
              <p className="font-bold text-brand-primary text-sm mt-1">
                {exchange.packOffered?.price}€
              </p>
            </div>
          </div>
        </div>

        {/* Pack Solicitado */}
        <div className="space-y-2">
          <p className="text-xs font-bold text-gray-600 uppercase">
            {isRequester ? "Lo que Quieres" : "Lo que Pide"}
          </p>
          <div className="border-2 border-gray-200 rounded-xl p-3 flex gap-3">
            <div className="relative w-16 h-16 flex-shrink-0">
              <Image
                src={exchange.packRequested?.imageUrl || ""}
                alt={exchange.packRequested?.title || ""}
                fill
                className="object-cover rounded-lg"
                sizes="64px"
              />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-bold text-sm text-gray-900 truncate">
                {exchange.packRequested?.title}
              </h4>
              <p className="text-xs text-gray-600">{exchange.packRequested?.category}</p>
              <p className="font-bold text-brand-primary text-sm mt-1">
                {exchange.packRequested?.price}€
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Mensaje del Solicitante */}
      {exchange.requesterMessage && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 mb-4">
          <p className="text-xs font-semibold text-blue-900 mb-1">Mensaje:</p>
          <p className="text-sm text-blue-900">{exchange.requesterMessage}</p>
        </div>
      )}

      {/* Hora Acordada */}
      {exchange.selectedTimeWindow && exchange.status !== "pending" && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-3 mb-4">
          <p className="text-xs font-semibold text-green-900 mb-1">Hora Acordada:</p>
          <p className="text-sm text-green-900">{exchange.selectedTimeWindow}</p>
        </div>
      )}

      {/* Sección de Validación (status: accepted) */}
      {exchange.status === "accepted" && !showValidationCode && (
        <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 mb-4">
          <p className="text-xs font-bold text-purple-900 mb-2">CÓDIGO DE INTERCAMBIO</p>
          <p className="text-2xl font-mono font-bold text-purple-900 tracking-widest mb-3">
            {exchange.exchangeCode}
          </p>
          <p className="text-xs text-purple-800">
            Ambos deben validar con este código en el encuentro
          </p>
        </div>
      )}

      {/* Validación con Código */}
      {exchange.status === "accepted" && showValidationCode && (
        <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 mb-4">
          <p className="text-sm font-bold text-purple-900 mb-3">Ingresa el código de 6 dígitos</p>
          <div className="flex gap-2">
            <Input
              type="text"
              inputMode="numeric"
              maxLength={6}
              value={validationCode}
              onChange={e => setValidationCode(e.target.value.replace(/\D/g, ""))}
              placeholder="000000"
              className="text-center text-xl font-mono tracking-widest"
            />
            <button
              onClick={() => setShowValidationCode(false)}
              className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-100"
            >
              ✕
            </button>
          </div>
          <button
            onClick={handleValidate}
            disabled={validationCode.length !== 6 || isLoading}
            className="w-full mt-3 bg-brand-primary text-white font-bold py-3 rounded-xl hover:bg-brand-dark disabled:opacity-50 shadow-md hover:shadow-lg transition-all"
          >
            {isLoading ? "Validando..." : "Validar Intercambio"}
          </button>
        </div>
      )}

      {/* Estado de Validación */}
      {exchange.status === "accepted" && (
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className={cn("p-3 rounded-lg", exchange.validatedByRequester ? "bg-green-100" : "bg-gray-100")}>
            <p className="text-xs font-semibold text-gray-700">Solicitante</p>
            <span className={`inline-flex items-center mt-2 px-2 py-1 rounded-md text-xs font-medium ${
              exchange.validatedByRequester ? "bg-green-200 text-green-900" : "bg-gray-200 text-gray-600"
            }`}>
              {exchange.validatedByRequester ? "Validado" : "Pendiente"}
            </span>
          </div>
          <div className={cn("p-3 rounded-lg", exchange.validatedByOwner ? "bg-green-100" : "bg-gray-100")}>
            <p className="text-xs font-semibold text-gray-700">Dueño</p>
            <span className={`inline-flex items-center mt-2 px-2 py-1 rounded-md text-xs font-medium ${
              exchange.validatedByOwner ? "bg-green-200 text-green-900" : "bg-gray-200 text-gray-600"
            }`}>
              {exchange.validatedByOwner ? "Validado" : "Pendiente"}
            </span>
          </div>
        </div>
      )}

      {/* Botones de Acción */}
      <div className="flex gap-3 flex-wrap">
        {/* Para owner - Propuesta pendiente */}
        {!isRequester && exchange.status === "pending" && !isExpired && (
          <>
            <button
              onClick={handleAcceptClick}
              disabled={isLoading}
              className="flex-1 min-w-[120px] bg-brand-primary text-white font-bold py-3 px-4 rounded-xl hover:bg-brand-dark disabled:opacity-50 transition-all shadow-md hover:shadow-lg"
            >
              {isLoading ? "Aceptando..." : "Aceptar"}
            </button>
            <button
              onClick={handleReject}
              disabled={isLoading}
              className="flex-1 min-w-[120px] bg-red-500 text-white py-3 px-4 rounded-xl font-bold hover:bg-red-600 disabled:opacity-50 transition-all shadow-md hover:shadow-lg"
            >
              {isLoading ? "Rechazando..." : "Rechazar"}
            </button>
          </>
        )}

        {/* Para requester - Propuesta pendiente */}
        {isRequester && exchange.status === "pending" && !isExpired && (
          <button
            onClick={handleCancel}
            disabled={isLoading}
            className="flex-1 border-2 border-gray-300 text-gray-700 font-bold py-3 px-4 rounded-xl hover:border-red-500 hover:bg-red-50 hover:text-red-600 disabled:opacity-50 transition-all"
          >
            {isLoading ? "Cancelando..." : "Cancelar Propuesta"}
          </button>
        )}

        {/* Botón Validar - Solo si status es accepted y no ha validado */}
        {exchange.status === "accepted" && (
          <>
            {!showValidationCode ? (
              <button
                onClick={() => setShowValidationCode(true)}
                className="flex-1 bg-gradient-to-r from-brand-primary to-brand-dark text-white font-bold py-3 px-4 rounded-xl hover:from-brand-dark hover:to-brand-primary transition-all shadow-md hover:shadow-xl"
              >
                Validar Código
              </button>
            ) : null}
            {exchange.status === "accepted" && !exchange.validatedByRequester && !exchange.validatedByOwner && (
              <button
                onClick={handleCancel}
                disabled={isLoading}
                className="flex-1 border-2 border-gray-300 text-gray-700 font-bold py-3 px-4 rounded-xl hover:border-red-500 hover:bg-red-50 hover:text-red-600 disabled:opacity-50 transition-all"
              >
                Cancelar
              </button>
            )}
          </>
        )}

        {/* Propuesta Expirada */}
        {isExpired && (
          <div className="w-full text-center text-sm text-gray-500 font-medium">
            Propuesta expirada
          </div>
        )}

        {/* Estados terminales */}
        {(exchange.status === "rejected" || exchange.status === "cancelled" || exchange.status === "completed") && (
          <div className="w-full text-center text-sm text-gray-500 font-medium">
            Intercambio {STATUS_LABELS[exchange.status].toLowerCase()}
          </div>
        )}
      </div>

      {/* Modal para seleccionar franja horaria (al aceptar) */}
      {showTimeWindowModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Selecciona la hora de intercambio</h3>
            <p className="text-gray-600 mb-6">Elige cuándo realizarás el intercambio</p>
            
            <div className="space-y-2 max-h-64 overflow-y-auto mb-6">
              {exchange.packRequested?.pickupWindows?.map((window) => (
                <label
                  key={window}
                  className={cn(
                    "flex items-center gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all",
                    selectedTimeWindow === window 
                      ? "border-brand-primary bg-brand-light shadow-md" 
                      : "border-gray-200 bg-white hover:border-brand-primary/50 hover:bg-gray-50"
                  )}
                >
                  <input
                    type="radio"
                    name="timeWindowSelect"
                    value={window}
                    checked={selectedTimeWindow === window}
                    onChange={(e) => setSelectedTimeWindow(e.target.value)}
                    className="w-5 h-5 text-brand-primary focus:ring-brand-primary"
                  />
                  <div className="flex-1">
                    <span className="font-semibold text-base">{window}</span>
                  </div>
                  {selectedTimeWindow === window && (
                    <svg className="w-5 h-5 text-brand-primary" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                    </svg>
                  )}
                </label>
              ))}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowTimeWindowModal(false)
                  setSelectedTimeWindow("")
                }}
                disabled={isLoading}
                className="flex-1 border-2 border-gray-300 text-gray-700 font-bold py-3 rounded-xl hover:border-gray-400 hover:bg-gray-50 disabled:opacity-50 transition-all"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmAccept}
                disabled={!selectedTimeWindow || isLoading}
                className="flex-1 bg-brand-primary text-white font-bold py-3 rounded-xl hover:bg-brand-dark disabled:opacity-50 transition-all shadow-md hover:shadow-lg"
              >
                {isLoading ? "Aceptando..." : "Confirmar"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast notifications */}
      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.isVisible}
        onClose={hideToast}
      />
    </div>
  )
}
