import { createBrowserClient } from '@supabase/ssr'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    flowType: 'pkce'
  },
  global: {
    headers: {
      'X-Client-Info': 'pack2pack-web'
    }
  }
})

// Limpiar sesión si el refresh token falla
supabase.auth.onAuthStateChange((event, session) => {
  if (event === 'TOKEN_REFRESHED') {
    console.log('[Supabase] Token refreshed successfully')
  }
  
  if (event === 'SIGNED_OUT') {
    console.log('[Supabase] User signed out')
  }
  
  // Si hay error de token, limpiar y forzar re-login
  if (event === 'TOKEN_REFRESHED' && !session) {
    console.warn('[Supabase] Token refresh failed, clearing session')
    supabase.auth.signOut({ scope: 'local' })
  }
})
