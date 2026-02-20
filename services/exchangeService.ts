import { supabase } from "@/lib/supabase"
import { authService } from "@/services/authService"
import { notificationService } from "@/services/notificationService"
import type { Pack } from "@/services/packService"

export interface Exchange {
  id: string
  packOfferedId: string
  packRequestedId: string
  requesterId: string
  ownerId: string
  status: 'pending' | 'accepted' | 'rejected' | 'completed' | 'cancelled'
  selectedTimeWindow?: string | null
  exchangeCode: string
  validatedByRequester: boolean
  validatedByOwner: boolean
  requesterMessage?: string | null
  ownerResponse?: string | null
  createdAt: string
  updatedAt: string
  expiresAt: string
  // Joined data
  packOffered?: Pack
  packRequested?: Pack
  requester?: {
    id: string
    full_name: string
    avatar_url?: string
  }
  owner?: {
    id: string
    full_name: string
    avatar_url?: string
  }
}

export const exchangeService = {
  /**
   * Verificar si el usuario actual tiene un intercambio activo para un pack específico
   * (como requester u owner, en estado pending o accepted)
   */
  async hasActiveExchange(packId: string): Promise<boolean> {
    const user = await authService.getUser()
    if (!user) return false

    const { data, error } = await supabase
      .from("exchanges")
      .select("id")
      .or(`pack_requested_id.eq.${packId},pack_offered_id.eq.${packId}`)
      .or(`requester_id.eq.${user.id},owner_id.eq.${user.id}`)
      .in("status", ["pending", "accepted"])

    if (error) {
      console.error("Error checking active exchange:", error)
      return false
    }

    return (data && data.length > 0)
  },

  /**
   * Verificar si un pack tiene algún intercambio activo (cualquier usuario)
   */
  async isPackInExchange(packId: string): Promise<boolean> {
    const { data, error } = await supabase
      .from("exchanges")
      .select("id")
      .or(`pack_requested_id.eq.${packId},pack_offered_id.eq.${packId}`)
      .in("status", ["pending", "accepted"])

    if (error) {
      console.error("Error checking pack in exchange:", error)
      return false
    }

    return (data && data.length > 0)
  },

  /**
   * Proponer un intercambio de packs
   * Validaciones:
   * - Usuario debe estar logueado
   * - Pack oferido debe ser del usuario actual
   * - Ambos packs deben estar disponibles
   * - No pueden ser el mismo usuario
   * - Los packs deben ser diferentes
   */
  async proposeExchange(
    packRequestedId: string,
    packOfferedId: string,
    message?: string
  ): Promise<Exchange> {
    const user = await authService.getUser()
    if (!user) throw new Error("Debes estar logueado para proponer un intercambio")

    // Obtener ambos packs
    const [packRequested, packOffered] = await Promise.all([
      this.getPackById(packRequestedId),
      this.getPackById(packOfferedId)
    ])

    // Validaciones
    if (!packRequested) throw new Error("Pack solicitado no encontrado")
    if (!packOffered) throw new Error("Pack ofrecido no encontrado")

    if (packRequested.status !== "available") {
      throw new Error("El pack solicitado ya no está disponible")
    }

    if (packOffered.status !== "available") {
      throw new Error("Tu pack debe estar disponible para intercambiar")
    }

    if (packOffered.seller_id !== user.id) {
      throw new Error("Solo puedes ofrecer tus propios packs")
    }

    if (packRequested.seller_id === user.id) {
      throw new Error("No puedes intercambiar con tus propios packs")
    }

    // Validar que el usuario no tenga ya un intercambio activo para el pack solicitado
    const hasActiveExchangeForRequested = await this.hasActiveExchange(packRequestedId)
    if (hasActiveExchangeForRequested) {
      throw new Error("Ya tienes un intercambio activo para este pack")
    }

    // Validar que el pack ofrecido no esté ya en otro intercambio activo
    const isOfferedInExchange = await this.isPackInExchange(packOfferedId)
    if (isOfferedInExchange) {
      throw new Error("Tu pack ya está en otro intercambio activo")
    }

    // Crear propuesta
    const { data, error } = await supabase
      .from("exchanges")
      .insert({
        pack_requested_id: packRequestedId,
        pack_offered_id: packOfferedId,
        requester_id: user.id,
        owner_id: packRequested.seller_id,
        requester_message: message || null,
        status: "pending"
      })
      .select()
      .single()

    if (error) throw error

    // Notificar al dueño del pack solicitado
    try {
      await notificationService.createNotification(
        packRequested.seller_id,
        "exchange_proposed",
        "Propuesta de intercambio",
        `${user.user_metadata?.full_name || "Un usuario"} te ofrece "${packOffered.title}" por tu "${packRequested.title}"`,
        "/my-exchanges"
      )
    } catch (notificationError) {
      console.error("Error creating notification:", notificationError)
      // No falles si la notificación no se crea
    }

    return this.mapExchange(data)
  },

  /**
   * Aceptar una propuesta de intercambio
   */
  async acceptExchange(
    exchangeId: string,
    timeWindow: string
  ): Promise<void> {
    const user = await authService.getUser()
    if (!user) throw new Error("Debes estar logueado")

    const { data: exchange, error: fetchError } = await supabase
      .from("exchanges")
      .select("*, pack_offered:packs!pack_offered_id(*), pack_requested:packs!pack_requested_id(*), owner:profiles!owner_id(*), requester:profiles!requester_id(*)")
      .eq("id", exchangeId)
      .single()

    if (fetchError || !exchange) throw new Error("Intercambio no encontrado")

    if (exchange.owner_id !== user.id) {
      throw new Error("Solo el dueño puede aceptar esta propuesta")
    }

    if (exchange.status !== "pending") {
      throw new Error("Este intercambio ya no está pendiente")
    }

    // Verificar que los packs siguen disponibles
    if (
      exchange.pack_offered.status !== "available" ||
      exchange.pack_requested.status !== "available"
    ) {
      throw new Error("Uno de los packs ya no está disponible")
    }

    // Actualizar estado
    const { error: updateError } = await supabase
      .from("exchanges")
      .update({
        status: "accepted",
        selected_time_window: timeWindow
      })
      .eq("id", exchangeId)

    if (updateError) throw updateError

    // Marcar ambos packs como reservados
    const [packOfferedError, packRequestedError] = await Promise.all([
      supabase
        .from("packs")
        .update({ status: "reserved" })
        .eq("id", exchange.pack_offered_id),
      supabase
        .from("packs")
        .update({ status: "reserved" })
        .eq("id", exchange.pack_requested_id)
    ].map(p => p.then(r => r.error)))

    if (packOfferedError || packRequestedError) {
      throw new Error("Error al marcar packs como reservados")
    }

    // Notificar al solicitante
    try {
      await notificationService.createNotification(
        exchange.requester_id,
        "exchange_accepted",
        "¡Intercambio aceptado!",
        `${user.user_metadata?.full_name || "El usuario"} aceptó tu propuesta de intercambio. Hora: ${timeWindow}`,
        "/my-exchanges"
      )
    } catch (notificationError) {
      console.error("Error creating notification:", notificationError)
    }
  },

  /**
   * Rechazar una propuesta de intercambio
   */
  async rejectExchange(exchangeId: string): Promise<void> {
    const user = await authService.getUser()
    if (!user) throw new Error("Debes estar logueado")

    const { data: exchange, error: fetchError } = await supabase
      .from("exchanges")
      .select("requester_id, owner_id, status")
      .eq("id", exchangeId)
      .single()

    if (fetchError || !exchange) throw new Error("Intercambio no encontrado")

    if (exchange.owner_id !== user.id) {
      throw new Error("Solo el dueño puede rechazar")
    }

    if (exchange.status !== "pending") {
      throw new Error("Este intercambio ya no está pendiente")
    }

    const { error } = await supabase
      .from("exchanges")
      .update({
        status: "rejected"
      })
      .eq("id", exchangeId)

    if (error) throw error

    // Notificar rechazo
    try {
      await notificationService.createNotification(
        exchange.requester_id,
        "exchange_rejected",
        "Propuesta rechazada",
        "Tu propuesta de intercambio fue rechazada",
        "/my-exchanges"
      )
    } catch (notificationError) {
      console.error("Error creating notification:", notificationError)
    }
  },

  /**
   * Cancelar un intercambio aceptado (antes de validar)
   */
  async cancelExchange(exchangeId: string): Promise<void> {
    const user = await authService.getUser()
    if (!user) throw new Error("Debes estar logueado")

    const { data: exchange, error: fetchError } = await supabase
      .from("exchanges")
      .select("requester_id, owner_id, status, pack_offered_id, pack_requested_id")
      .eq("id", exchangeId)
      .single()

    if (fetchError || !exchange) throw new Error("Intercambio no encontrado")

    if (exchange.requester_id !== user.id && exchange.owner_id !== user.id) {
      throw new Error("No tienes permiso para cancelar")
    }

    // Verificar que el estado permite cancelación
    if (exchange.status !== "pending" && exchange.status !== "accepted") {
      throw new Error("No se puede cancelar este intercambio")
    }

    // Si está pending, solo el requester puede cancelar
    if (exchange.status === "pending" && exchange.requester_id !== user.id) {
      throw new Error("Solo quien propuso puede cancelar una propuesta pendiente")
    }

    // Actualizar estado
    const { error: updateError } = await supabase
      .from("exchanges")
      .update({
        status: "cancelled"
      })
      .eq("id", exchangeId)

    if (updateError) throw updateError

    // Si el intercambio estaba aceptado, liberar los packs
    if (exchange.status === "accepted") {
      await Promise.all([
        supabase
          .from("packs")
          .update({ status: "available" })
          .eq("id", exchange.pack_offered_id),
        supabase
          .from("packs")
          .update({ status: "available" })
          .eq("id", exchange.pack_requested_id)
      ])
    }

    // Notificar al otro usuario
    const otherUserId =
      exchange.requester_id === user.id ? exchange.owner_id : exchange.requester_id
    try {
      await notificationService.createNotification(
        otherUserId,
        "exchange_cancelled",
        "Intercambio cancelado",
        "El intercambio ha sido cancelado",
        "/my-exchanges"
      )
    } catch (notificationError) {
      console.error("Error creating notification:", notificationError)
    }
  },

  /**
   * Validar intercambio con código (por requester u owner)
   * Ambos deben validar para completar el intercambio
   */
  async validateByUser(exchangeId: string, code: string): Promise<boolean> {
    const user = await authService.getUser()
    if (!user) throw new Error("Debes estar logueado")

    const { data: exchange, error: fetchError } = await supabase
      .from("exchanges")
      .select("*")
      .eq("id", exchangeId)
      .single()

    if (fetchError || !exchange) throw new Error("Intercambio no encontrado")

    if (exchange.status !== "accepted") {
      throw new Error("El intercambio debe estar aceptado")
    }

    if (exchange.exchange_code !== code) {
      throw new Error("Código incorrecto")
    }

    const isRequester = exchange.requester_id === user.id
    const isOwner = exchange.owner_id === user.id

    if (!isRequester && !isOwner) {
      throw new Error("No participas en este intercambio")
    }

    // Actualizar validación
    const updateField = isRequester
      ? { validated_by_requester: true }
      : { validated_by_owner: true }

    const { error: updateError } = await supabase
      .from("exchanges")
      .update(updateField)
      .eq("id", exchangeId)

    if (updateError) throw updateError

    // Verificar si ambos ya han validado
    const { data: updated } = await supabase
      .from("exchanges")
      .select("validated_by_requester, validated_by_owner")
      .eq("id", exchangeId)
      .single()

    const bothValidated = updated?.validated_by_requester && updated?.validated_by_owner

    if (bothValidated) {
      await this.completeExchange(exchangeId)
    }

    return bothValidated || false
  },

  /**
   * Completar intercambio (cuando ambos han validado)
   */
  async completeExchange(exchangeId: string): Promise<void> {
    const { data: exchange, error: fetchError } = await supabase
      .from("exchanges")
      .select("*")
      .eq("id", exchangeId)
      .single()

    if (fetchError || !exchange) throw new Error("Intercambio no encontrado")

    // Marcar como completado
    const { error: updateError } = await supabase
      .from("exchanges")
      .update({
        status: "completed",
        validated_at: new Date().toISOString()
      })
      .eq("id", exchangeId)

    if (updateError) throw updateError

    // Marcar packs como vendidos
    await Promise.all([
      supabase
        .from("packs")
        .update({ status: "sold" })
        .eq("id", exchange.pack_offered_id),
      supabase
        .from("packs")
        .update({ status: "sold" })
        .eq("id", exchange.pack_requested_id)
    ])

    // Notificar a ambos usuarios
    try {
      await Promise.all([
        notificationService.createNotification(
          exchange.requester_id,
          "exchange_completed",
          "¡Intercambio completado!",
          "No olvides valorar al otro usuario",
          "/my-exchanges"
        ),
        notificationService.createNotification(
          exchange.owner_id,
          "exchange_completed",
          "¡Intercambio completado!",
          "No olvides valorar al otro usuario",
          "/my-exchanges"
        )
      ])
    } catch (notificationError) {
      console.error("Error creating notifications:", notificationError)
    }
  },

  /**
   * Obtener mis intercambios (como requester u owner)
   */
  async getMyExchanges(): Promise<Exchange[]> {
    const user = await authService.getUser()
    if (!user) return []

    const { data, error } = await supabase
      .from("exchanges")
      .select(
        `
        *,
        pack_offered:packs!pack_offered_id(*),
        pack_requested:packs!pack_requested_id(*),
        requester:profiles!requester_id(id, full_name, avatar_url),
        owner:profiles!owner_id(id, full_name, avatar_url)
      `
      )
      .or(`requester_id.eq.${user.id},owner_id.eq.${user.id}`)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching exchanges:", error)
      return []
    }

    return (data || []).map(this.mapExchange)
  },

  /**
   * Obtener intercambios recibidos (como owner)
   */
  async getReceivedExchanges(): Promise<Exchange[]> {
    const user = await authService.getUser()
    if (!user) return []

    const { data, error } = await supabase
      .from("exchanges")
      .select(
        `
        *,
        pack_offered:packs!pack_offered_id(*),
        pack_requested:packs!pack_requested_id(*),
        requester:profiles!requester_id(id, full_name, avatar_url),
        owner:profiles!owner_id(id, full_name, avatar_url)
      `
      )
      .eq("owner_id", user.id)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching received exchanges:", error)
      return []
    }

    return (data || []).map(this.mapExchange)
  },

  /**
   * Obtener intercambios enviados (como requester)
   */
  async getSentExchanges(): Promise<Exchange[]> {
    const user = await authService.getUser()
    if (!user) return []

    const { data, error } = await supabase
      .from("exchanges")
      .select(
        `
        *,
        pack_offered:packs!pack_offered_id(*),
        pack_requested:packs!pack_requested_id(*),
        requester:profiles!requester_id(id, full_name, avatar_url),
        owner:profiles!owner_id(id, full_name, avatar_url)
      `
      )
      .eq("requester_id", user.id)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching sent exchanges:", error)
      return []
    }

    return (data || []).map(this.mapExchange)
  },

  /**
   * Obtener un intercambio por ID
   */
  async getExchangeById(exchangeId: string): Promise<Exchange | null> {
    const { data, error } = await supabase
      .from("exchanges")
      .select(
        `
        *,
        pack_offered:packs!pack_offered_id(*),
        pack_requested:packs!pack_requested_id(*),
        requester:profiles!requester_id(id, full_name, avatar_url),
        owner:profiles!owner_id(id, full_name, avatar_url)
      `
      )
      .eq("id", exchangeId)
      .single()

    if (error) {
      console.error("Error fetching exchange:", error)
      return null
    }

    return this.mapExchange(data)
  },

  /**
   * Helper para mapear datos de BD a interface
   */
  mapExchange(data: any): Exchange {
    return {
      id: data.id,
      packOfferedId: data.pack_offered_id,
      packRequestedId: data.pack_requested_id,
      requesterId: data.requester_id,
      ownerId: data.owner_id,
      status: data.status,
      selectedTimeWindow: data.selected_time_window,
      exchangeCode: data.exchange_code,
      validatedByRequester: data.validated_by_requester,
      validatedByOwner: data.validated_by_owner,
      requesterMessage: data.requester_message,
      ownerResponse: data.owner_response,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      expiresAt: data.expires_at,
      packOffered: data.pack_offered
        ? {
            id: data.pack_offered.id,
            title: data.pack_offered.title,
            description: data.pack_offered.description,
            category: data.pack_offered.category,
            price: Number(data.pack_offered.price),
            originalPrice: Number(data.pack_offered.original_price),
            imageUrl: data.pack_offered.image_url,
            status: data.pack_offered.status,
            seller_id: data.pack_offered.seller_id,
            expiresAt: data.pack_offered.expires_at,
            latitude: data.pack_offered.latitude,
            longitude: data.pack_offered.longitude,
            location: data.pack_offered.location,
            sellerName: "",
            distance: "",
            tags: [],
            pickupLocation: data.pack_offered.pickup_location,
            pickupWindows: data.pack_offered.pickup_windows,
            isFree: data.pack_offered.is_free === true
          }
        : undefined,
      packRequested: data.pack_requested
        ? {
            id: data.pack_requested.id,
            title: data.pack_requested.title,
            description: data.pack_requested.description,
            category: data.pack_requested.category,
            price: Number(data.pack_requested.price),
            originalPrice: Number(data.pack_requested.original_price),
            imageUrl: data.pack_requested.image_url,
            status: data.pack_requested.status,
            seller_id: data.pack_requested.seller_id,
            expiresAt: data.pack_requested.expires_at,
            latitude: data.pack_requested.latitude,
            longitude: data.pack_requested.longitude,
            location: data.pack_requested.location,
            sellerName: "",
            distance: "",
            tags: [],
            pickupLocation: data.pack_requested.pickup_location,
            pickupWindows: data.pack_requested.pickup_windows,
            isFree: data.pack_requested.is_free === true
          }
        : undefined,
      requester: data.requester,
      owner: data.owner
    }
  },

  /**
   * Helper para obtener pack por ID (reutilizable)
   */
  async getPackById(packId: string): Promise<Pack | null> {
    const { data, error } = await supabase
      .from("packs")
      .select("*")
      .eq("id", packId)
      .single()

    if (error) {
      console.error("Error fetching pack:", error)
      return null
    }

    if (!data) return null

    return {
      id: data.id,
      title: data.title,
      description: data.description,
      category: data.category,
      price: Number(data.price),
      originalPrice: Number(data.original_price),
      imageUrl: data.image_url,
      status: data.status,
      seller_id: data.seller_id,
      expiresAt: data.expires_at,
      latitude: data.latitude,
      longitude: data.longitude,
      location: data.location,
      sellerName: "",
      distance: "",
      tags: [],
      pickupLocation: data.pickup_location,
      pickupWindows: data.pickup_windows,
      isFree: data.is_free === true
    }
  }
}
