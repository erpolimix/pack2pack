import { supabase } from './supabase'

/**
 * Limpia localStorage de tokens inválidos de Supabase
 * Útil cuando aparece "Invalid Refresh Token" error
 */
export async function clearInvalidSession() {
  try {
    const { data: { session } } = await supabase.auth.getSession()
    
    if (!session) {
      // No hay sesión, limpiar localStorage por si acaso
      const keys = Object.keys(localStorage)
      const supabaseKeys = keys.filter(key => 
        key.startsWith('sb-') || 
        key.includes('supabase')
      )
      
      supabaseKeys.forEach(key => {
        console.log(`[Auth Helper] Removing invalid key: ${key}`)
        localStorage.removeItem(key)
      })
      
      return true
    }
    
    return false
  } catch (error) {
    console.error('[Auth Helper] Error checking session:', error)
    
    // Si hay error al obtener sesión, probablemente el token es inválido
    if (error instanceof Error && error.message.includes('refresh')) {
      console.log('[Auth Helper] Detected invalid refresh token, clearing...')
      await supabase.auth.signOut({ scope: 'local' })
      
      // Limpiar manualmente por si signOut falla
      const keys = Object.keys(localStorage)
      const supabaseKeys = keys.filter(key => 
        key.startsWith('sb-') || 
        key.includes('supabase')
      )
      
      supabaseKeys.forEach(key => localStorage.removeItem(key))
      
      return true
    }
    
    return false
  }
}

/**
 * Verifica si el usuario está autenticado
 * Retorna null si no hay sesión válida
 */
export async function getValidSession() {
  try {
    const { data: { session }, error } = await supabase.auth.getSession()
    
    if (error) {
      console.error('[Auth Helper] Session error:', error)
      await clearInvalidSession()
      return null
    }
    
    return session
  } catch (error) {
    console.error('[Auth Helper] Unexpected error:', error)
    await clearInvalidSession()
    return null
  }
}
