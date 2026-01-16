import { supabase } from "@/lib/supabase"

export const authService = {
    async loginWithEmail(email: string, redirectPath?: string) {
        const callbackUrl = redirectPath 
            ? `${window.location.origin}/auth/callback?redirect=${encodeURIComponent(redirectPath)}`
            : `${window.location.origin}/auth/callback`

        const { data, error } = await supabase.auth.signInWithOtp({
            email,
            options: {
                shouldCreateUser: true,
                emailRedirectTo: callbackUrl,
            },
        })

        if (error) throw error
        return data
    },

    async loginWithGoogle(redirectPath?: string) {
        const callbackUrl = redirectPath 
            ? `${window.location.origin}/auth/callback?redirect=${encodeURIComponent(redirectPath)}`
            : `${window.location.origin}/auth/callback`

        const { data, error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: callbackUrl,
                queryParams: {
                    access_type: 'offline',
                    prompt: 'consent',
                },
            },
        })

        if (error) throw error
        return data
    },

    async isAuthenticated() {
        const { data: { session } } = await supabase.auth.getSession()
        return !!session
    },

    async getUser() {
        const { data: { user } } = await supabase.auth.getUser()
        return user
    },

    async getProfile() {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return null

        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single()

        if (error) {
            console.error("Error fetching profile:", error)
            return null
        }
        return data
    },

    async getProfileById(userId: string) {
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single()

        if (error) {
            console.error("Error fetching profile:", error)
            return null
        }
        return data
    },

    // Update specific profile fields
    async updateProfile(updates: any) {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) throw new Error("No user logged in")

        const { error } = await supabase
            .from('profiles')
            .update(updates)
            .eq('id', user.id)

        if (error) throw error
    },

    async logout() {
        await supabase.auth.signOut()
    }
};
