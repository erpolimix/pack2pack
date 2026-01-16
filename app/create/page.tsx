"use client"

import { CreatePackForm } from "@/components/create-pack-form";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Loader2 } from "lucide-react";

export default function CreatePage() {
    const router = useRouter()
    const [isChecking, setIsChecking] = useState(true)
    const [isAuthenticated, setIsAuthenticated] = useState(false)

    useEffect(() => {
        checkAuth()
    }, [])

    const checkAuth = async () => {
        try {
            const { data: { session }, error } = await supabase.auth.getSession()
            
            if (error || !session) {
                console.log('[Create Page] No authenticated session, redirecting to login')
                router.push('/login?redirect=/create')
                return
            }
            
            setIsAuthenticated(true)
        } catch (error) {
            console.error('[Create Page] Auth check error:', error)
            router.push('/login?redirect=/create')
        } finally {
            setIsChecking(false)
        }
    }

    if (isChecking) {
        return (
            <div className="container max-w-2xl mx-auto py-10 px-6 flex items-center justify-center min-h-[60vh]">
                <div className="text-center">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-brand-primary" />
                    <p className="text-muted-foreground">Verificando autenticación...</p>
                </div>
            </div>
        )
    }

    if (!isAuthenticated) {
        return null
    }

    return (
        <div className="container max-w-2xl mx-auto py-10 px-6">
            <div className="mb-8 text-center">
                <h1 className="text-3xl font-bold tracking-tight mb-2">Vender un Pack</h1>
                <p className="text-muted-foreground">
                    Saca una foto, deja que la IA haga el resto, y dale a tus cosas un nuevo hogar.
                </p>
            </div>
            <CreatePackForm />
        </div>
    );
}
