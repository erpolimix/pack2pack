"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { exchangeService } from "@/services/exchangeService"
import { authService } from "@/services/authService"
import { ExchangeCard } from "@/components/exchange-card"
import type { Exchange } from "@/services/exchangeService"

type FilterTab = "all" | "received" | "sent" | "completed"

export default function MyExchangesPage() {
  const router = useRouter()
  const [exchanges, setExchanges] = useState<Exchange[]>([])
  const [currentUserId, setCurrentUserId] = useState<string>()
  const [filter, setFilter] = useState<FilterTab>("all")
  const [isLoading, setIsLoading] = useState(true)
  const [isEmpty, setIsEmpty] = useState(false)

  // Cargar datos al montar
  useEffect(() => {
    const loadData = async () => {
      try {
        const user = await authService.getUser()
        if (!user) {
          router.push("/login?redirect=/my-exchanges")
          return
        }

        setCurrentUserId(user.id)
        const data = await exchangeService.getMyExchanges()
        setExchanges(data)
        setIsEmpty(data.length === 0)
      } catch (error) {
        console.error("Error loading exchanges:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [router])

  // Filtrar intercambios según tab
  const getFilteredExchanges = () => {
    const now = new Date()

    switch (filter) {
      case "received":
        return exchanges.filter(e => e.ownerId === currentUserId)
      case "sent":
        return exchanges.filter(e => e.requesterId === currentUserId)
      case "completed":
        return exchanges.filter(e => e.status === "completed")
      case "all":
      default:
        return exchanges
    }
  }

  const filteredExchanges = getFilteredExchanges()

  // Contar intercambios pendientes recibidos
  const pendingReceivedCount = exchanges.filter(
    e => e.ownerId === currentUserId && e.status === "pending"
  ).length

  const handleRefresh = async () => {
    setIsLoading(true)
    try {
      const data = await exchangeService.getMyExchanges()
      setExchanges(data)
      setIsEmpty(data.length === 0)
    } catch (error) {
      console.error("Error refreshing exchanges:", error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-brand-cream to-white">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="animate-pulse space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-40 bg-gray-200 rounded-2xl"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-brand-cream to-white pb-16">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900">Mis Intercambios</h1>
            <button
              onClick={handleRefresh}
              disabled={isLoading}
              className="text-gray-600 hover:text-gray-900 p-2 rounded-lg hover:bg-white transition-colors disabled:opacity-50"
            >
              ↻
            </button>
          </div>
          <p className="text-gray-600">Gestiona tus propuestas de intercambio de packs</p>
        </div>

        {isEmpty ? (
          // Empty State
          <div className="text-center py-16 bg-white rounded-2xl border-2 border-gray-100">
            <div className="w-20 h-20 bg-brand-light rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10 text-brand-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Sin intercambios</h2>
            <p className="text-gray-600 mb-6">Aún no has propuesto ni recibido intercambios</p>
            <button
              onClick={() => router.push("/")}
              className="inline-block bg-brand-primary text-white font-semibold py-3 px-6 rounded-xl hover:bg-brand-dark transition-colors shadow-sm"
            >
              Explorar Packs
            </button>
          </div>
        ) : (
          <>
            {/* Tabs */}
            <div className="flex gap-2 mb-6 overflow-x-auto pb-2 -mx-4 px-4 md:mx-0 md:px-0">
              {[
                { key: "all" as FilterTab, label: "Todos" },
                {
                  key: "received" as FilterTab,
                  label: `Recibidas${pendingReceivedCount > 0 ? ` (${pendingReceivedCount})` : ""}`
                },
                { key: "sent" as FilterTab, label: "Enviadas" },
                { key: "completed" as FilterTab, label: "Completados" }
              ].map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setFilter(tab.key)}
                  className={`whitespace-nowrap px-4 py-2 rounded-xl font-semibold transition-all ${
                    filter === tab.key
                      ? "bg-brand-primary text-white shadow-sm"
                      : "bg-white text-gray-700 border-2 border-gray-200 hover:border-brand-primary hover:text-brand-primary"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Exchanges List */}
            <div className="space-y-4">
              {filteredExchanges.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-2xl border-2 border-gray-200">
                  <p className="text-gray-500 font-medium">
                    {filter === "received"
                      ? "No has recibido propuestas"
                      : filter === "sent"
                        ? "No has enviado propuestas"
                        : filter === "completed"
                          ? "No hay intercambios completados"
                          : "No hay intercambios"}
                  </p>
                </div>
              ) : (
                filteredExchanges.map(exchange => (
                  <ExchangeCard
                    key={exchange.id}
                    exchange={exchange}
                    isRequester={exchange.requesterId === currentUserId}
                    onActionCompleted={handleRefresh}
                  />
                ))
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
