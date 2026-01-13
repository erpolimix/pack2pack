"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { authService } from "@/services/authService"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2 } from "lucide-react"

export default function LoginPage() {
    const router = useRouter()
    const [email, setEmail] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const [isGoogleLoading, setIsGoogleLoading] = useState(false)
    const [message, setMessage] = useState("")

    const handleEmailLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        setMessage("")
        try {
            await authService.loginWithEmail(email)
            setMessage("¡Enlace mágico enviado! Revisa tu correo.")
        } catch (error) {
            console.error(error)
            setMessage("Error al intentar iniciar sesión.")
        } finally {
            setIsLoading(false)
        }
    }

    const handleGoogleLogin = async () => {
        setIsGoogleLoading(true)
        try {
            await authService.loginWithGoogle()
        } catch (error) {
            console.error(error)
        } finally {
            // Usually redirects, but just in case
            setIsGoogleLoading(false)
        }
    }

    return (
        <div className="flex flex-col lg:flex-row min-h-[calc(100vh-4rem)] bg-brand-cream/30">
            {/* Left Side: Visual/Hero (Visible only on Desktop) */}
            <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-brand-dark">
                <div className="absolute inset-0 z-10 bg-gradient-to-r from-brand-dark/80 to-transparent" />
                <img
                    src="/login-hero.png"
                    alt="Sustainable Community Market"
                    className="absolute inset-0 object-cover w-full h-full opacity-60"
                />
                <div className="relative z-20 flex flex-col justify-center p-16 text-white max-w-xl">
                    <h1 className="text-5xl font-extrabold tracking-tight mb-6 leading-tight">
                        Salva comida, conecta con tu <span className="text-brand-accent">comunidad</span>.
                    </h1>
                    <p className="text-xl text-brand-light/90 leading-relaxed italic">
                        "Cada pack rescatado es un paso más hacia un planeta sin desperdicio y una comunidad más unida."
                    </p>
                    <div className="mt-12 flex items-center space-x-4">
                        <div className="flex -space-x-2">
                            {[1, 2, 3, 4].map(i => (
                                <div key={i} className="w-10 h-10 rounded-full border-2 border-brand-dark bg-brand-light/20 flex items-center justify-center overflow-hidden">
                                    <img src={`https://i.pravatar.cc/100?u=${i}`} alt="user" />
                                </div>
                            ))}
                        </div>
                        <p className="text-sm font-medium text-brand-light/80">
                            Únete a más de <span className="text-white font-bold">1,000 vecinos</span> activos.
                        </p>
                    </div>
                </div>
            </div>

            {/* Right Side: Login Form */}
            <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
                <Card className="w-full max-w-md border-none shadow-2xl bg-white/80 backdrop-blur-sm lg:bg-white animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <CardHeader className="space-y-2 pb-8 text-center lg:text-left">
                        <CardTitle className="text-3xl font-bold text-brand-dark">Inicia Sesión</CardTitle>
                        <CardDescription className="text-base">
                            Entra para publicar o reservar packs con tus vecinos.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <Button
                            variant="outline"
                            className="w-full h-12 text-base font-semibold border-2 hover:bg-brand-cream/50 transition-all rounded-xl relative"
                            onClick={handleGoogleLogin}
                            disabled={isGoogleLoading || isLoading}
                        >
                            {isGoogleLoading ? (
                                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                            ) : (
                                <svg className="mr-3 h-5 w-5" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512">
                                    <path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"></path>
                                </svg>
                            )}
                            Continuar con Google
                        </Button>

                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <span className="w-full border-t border-gray-200" />
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-white px-2 text-muted-foreground font-medium">
                                    O con tu email
                                </span>
                            </div>
                        </div>

                        <form onSubmit={handleEmailLogin} className="space-y-5">
                            <div className="space-y-2">
                                <Label htmlFor="email" className="text-sm font-bold text-brand-dark/70 ml-1">Dirección de Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="nombre@ejemplo.com"
                                    required
                                    className="h-12 rounded-xl bg-brand-cream/20 border-2 focus:border-brand-primary/50 transition-all"
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                />
                            </div>
                            <Button
                                className="w-full h-12 text-base font-bold rounded-xl shadow-lg shadow-brand-primary/20 hover:shadow-xl hover:-translate-y-0.5 transition-all"
                                type="submit"
                                disabled={isLoading || isGoogleLoading}
                            >
                                {isLoading && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
                                Enviar Enlace Mágico
                            </Button>
                            {message && (
                                <div className="p-4 rounded-xl bg-brand-primary/10 border border-brand-primary/20 animate-in fade-in zoom-in-95 duration-300">
                                    <p className="text-sm text-center text-brand-primary font-bold">
                                        {message}
                                    </p>
                                </div>
                            )}
                        </form>
                    </CardContent>
                    <CardFooter className="text-center justify-center pt-2">
                        <p className="text-xs text-muted-foreground max-w-[250px] leading-relaxed">
                            Al continuar, aceptas nuestras Condiciones de Uso y Política de Privacidad.
                        </p>
                    </CardFooter>
                </Card>
            </div>
        </div>
    )
}
