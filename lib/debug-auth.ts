/**
 * Utilidad para depurar y limpiar problemas de autenticación en Pack2Pack
 * 
 * Cómo usar en consola del navegador:
 * 
 * 1. Abrir DevTools (F12)
 * 2. Ir a pestaña Console
 * 3. Ejecutar uno de estos comandos:
 * 
 * // Ver todas las keys de Supabase
 * window.debugAuth.listSupabaseKeys()
 * 
 * // Limpiar todas las sesiones
 * window.debugAuth.clearAll()
 * 
 * // Limpiar solo tokens inválidos
 * window.debugAuth.clearInvalid()
 * 
 * // Verificar estado de sesión actual
 * await window.debugAuth.checkSession()
 */

import { supabase } from './supabase'

export const debugAuth = {
  /**
   * Lista todas las keys de Supabase en localStorage
   */
  listSupabaseKeys() {
    const keys = Object.keys(localStorage)
    const supabaseKeys = keys.filter(key => 
      key.startsWith('sb-') || 
      key.includes('supabase')
    )
    
    console.log('🔑 Keys de Supabase encontradas:')
    supabaseKeys.forEach(key => {
      const value = localStorage.getItem(key)
      console.log(`  - ${key}: ${value?.substring(0, 50)}...`)
    })
    
    return supabaseKeys
  },

  /**
   * Limpia todas las keys de Supabase
   */
  clearAll() {
    const keys = this.listSupabaseKeys()
    
    if (keys.length === 0) {
      console.log('✅ No hay keys de Supabase para limpiar')
      return
    }
    
    keys.forEach(key => {
      localStorage.removeItem(key)
      console.log(`🗑️  Eliminado: ${key}`)
    })
    
    console.log('✅ Todas las keys de Supabase han sido eliminadas')
    console.log('🔄 Recarga la página para aplicar cambios')
  },

  /**
   * Intenta limpiar solo tokens que causan errores
   */
  async clearInvalid() {
    try {
      const { data: { session }, error } = await supabase.auth.getSession()
      
      if (error) {
        console.error('❌ Error al obtener sesión:', error.message)
        console.log('🗑️  Limpiando tokens inválidos...')
        this.clearAll()
        return
      }
      
      if (!session) {
        console.log('ℹ️  No hay sesión activa')
        console.log('🔍 Buscando keys huérfanas...')
        const keys = this.listSupabaseKeys()
        if (keys.length > 0) {
          console.log('🗑️  Limpiando keys sin sesión válida...')
          this.clearAll()
        }
        return
      }
      
      console.log('✅ Sesión válida encontrada')
      console.log('👤 Usuario:', session.user.email)
      console.log('⏰ Expira:', new Date(session.expires_at! * 1000).toLocaleString())
    } catch (error) {
      console.error('❌ Error inesperado:', error)
      console.log('🗑️  Limpiando por seguridad...')
      this.clearAll()
    }
  },

  /**
   * Verifica el estado actual de la sesión
   */
  async checkSession() {
    console.log('🔍 Verificando estado de autenticación...')
    
    try {
      const { data: { session }, error } = await supabase.auth.getSession()
      
      if (error) {
        console.error('❌ Error:', error.message)
        return null
      }
      
      if (!session) {
        console.log('❌ No hay sesión activa')
        return null
      }
      
      console.log('✅ Sesión activa')
      console.log('👤 Usuario:', session.user.email)
      console.log('🆔 User ID:', session.user.id)
      console.log('⏰ Creada:', new Date(session.user.created_at).toLocaleString())
      console.log('⏰ Expira:', new Date(session.expires_at! * 1000).toLocaleString())
      console.log('🔑 Access Token:', session.access_token.substring(0, 20) + '...')
      console.log('🔄 Refresh Token:', session.refresh_token.substring(0, 20) + '...')
      
      return session
    } catch (error) {
      console.error('❌ Error inesperado:', error)
      return null
    }
  },

  /**
   * Fuerza un refresh del token
   */
  async refreshToken() {
    console.log('🔄 Intentando refrescar token...')
    
    try {
      const { data, error } = await supabase.auth.refreshSession()
      
      if (error) {
        console.error('❌ Error al refrescar:', error.message)
        console.log('💡 Tip: Ejecuta debugAuth.clearAll() y vuelve a hacer login')
        return false
      }
      
      console.log('✅ Token refrescado exitosamente')
      console.log('👤 Usuario:', data.session?.user.email)
      return true
    } catch (error) {
      console.error('❌ Error inesperado:', error)
      return false
    }
  },

  /**
   * Cierra sesión de forma segura
   */
  async signOut() {
    console.log('👋 Cerrando sesión...')
    
    try {
      await supabase.auth.signOut({ scope: 'local' })
      console.log('✅ Sesión cerrada')
      console.log('🗑️  Limpiando localStorage...')
      this.clearAll()
      console.log('🔄 Recarga la página para aplicar cambios')
    } catch (error) {
      console.error('❌ Error al cerrar sesión:', error)
      console.log('🗑️  Limpiando de forma forzada...')
      this.clearAll()
    }
  },

  /**
   * Información de ayuda
   */
  help() {
    console.log(`
📖 Comandos disponibles en window.debugAuth:

  listSupabaseKeys()  - Lista todas las keys de Supabase
  clearAll()          - Limpia todas las keys de Supabase
  clearInvalid()      - Limpia solo tokens inválidos
  checkSession()      - Verifica estado de sesión actual
  refreshToken()      - Fuerza refresh del token
  signOut()           - Cierra sesión de forma segura
  help()              - Muestra este mensaje

🐛 Solución de problemas comunes:

1. Error "Invalid Refresh Token":
   → debugAuth.clearAll()
   → Recarga la página
   → Vuelve a hacer login

2. No puedo hacer login:
   → debugAuth.clearAll()
   → Cierra y abre el navegador
   → Intenta de nuevo

3. Verificar si estoy autenticado:
   → await debugAuth.checkSession()

4. Forzar cierre de sesión:
   → await debugAuth.signOut()
    `)
  }
}

// Exponer en window para uso en consola
if (typeof window !== 'undefined') {
  (window as any).debugAuth = debugAuth
  console.log('🛠️  Pack2Pack Debug Tools cargado')
  console.log('💡 Ejecuta: window.debugAuth.help()')
}
