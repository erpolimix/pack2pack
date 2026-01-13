"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { authService } from "@/services/authService"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Loader2, User } from "lucide-react"
import Link from "next/link"

export default function ProfilePage() {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(true)
    const [isSaving, setIsSaving] = useState(false)
    const [user, setUser] = useState<any>(null)

    // Form State
    const [fullName, setFullName] = useState("")
    const [phone, setPhone] = useState("")
    const [country, setCountry] = useState("")
    const [gender, setGender] = useState("unspecified")
    const [dietary, setDietary] = useState("unspecified")
    const [pickupTimes, setPickupTimes] = useState("")

    useEffect(() => {
        loadProfile()
    }, [])

    const loadProfile = async () => {
        try {
            const currentUser = await authService.getUser()
            if (!currentUser) {
                router.push("/login")
                return
            }
            setUser(currentUser)

            const profile = await authService.getProfile()
            if (profile) {
                setFullName(profile.full_name || "")
                setPhone(profile.phone || "")
                setCountry(profile.country || "")
                setGender(profile.gender || "unspecified")
                setDietary(profile.dietary_preference || "unspecified")
                setPickupTimes(profile.pickup_times || "")
            }
        } catch (error) {
            console.error("Error loading profile:", error)
        } finally {
            setIsLoading(false)
        }
    }

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSaving(true)
        try {
            await authService.updateProfile({
                full_name: fullName,
                phone,
                country,
                gender,
                dietary_preference: dietary,
                pickup_times: pickupTimes
            })
            alert("Perfil actualizado correctamente")
        } catch (error) {
            console.error("Error saving profile:", error)
            alert("Error al guardar el perfil")
        } finally {
            setIsSaving(false)
        }
    }

    const handleLogout = async () => {
        await authService.logout()
        router.push("/")
        router.refresh()
    }

    if (isLoading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        )
    }

    return (
        <div className="container mx-auto max-w-3xl py-10 px-4">
            <div className="bg-white rounded-3xl shadow-sm border border-brand-primary/5 p-8 md:p-10">
                {/* Header */}
                <div className="border-b border-gray-100 pb-6 mb-8">
                    <div className="flex items-center gap-4 mb-2">
                        <div className="w-16 h-16 rounded-full bg-brand-light flex items-center justify-center text-brand-primary">
                            {user?.user_metadata?.avatar_url ? (
                                <img
                                    src={user.user_metadata.avatar_url}
                                    alt="Avatar"
                                    className="w-16 h-16 rounded-full object-cover border-2 border-white shadow-sm"
                                />
                            ) : (
                                <User className="h-8 w-8" />
                            )}
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-brand-dark">Mi Perfil</h1>
                            <p className="text-gray-500 text-sm">Gestiona tus datos y preferencias</p>
                        </div>
                    </div>
                </div>

                <form onSubmit={handleSave} className="space-y-8">
                    {/* Basic Info */}
                    <div className="space-y-4">
                        <h2 className="text-xl font-bold text-brand-dark flex items-center gap-2">
                            Información Personal
                        </h2>

                        <div className="grid gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="email" className="text-sm font-semibold text-gray-700">Email</Label>
                                <Input id="email" value={user?.email} disabled className="bg-gray-50 border-gray-200" />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="fullname" className="text-sm font-semibold text-gray-700">Nombre Completo</Label>
                                <Input
                                    id="fullname"
                                    value={fullName}
                                    onChange={e => setFullName(e.target.value)}
                                    placeholder="Tu nombre"
                                    className="border-gray-200"
                                />
                            </div>

                            <div className="grid md:grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="phone" className="text-sm font-semibold text-gray-700">Teléfono (Opcional)</Label>
                                    <Input
                                        id="phone"
                                        value={phone}
                                        onChange={e => setPhone(e.target.value)}
                                        placeholder="+34 600..."
                                        className="border-gray-200"
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="country" className="text-sm font-semibold text-gray-700">País</Label>
                                    <Input
                                        id="country"
                                        value={country}
                                        onChange={e => setCountry(e.target.value)}
                                        placeholder="España"
                                        className="border-gray-200"
                                    />
                                </div>
                            </div>

                            <div className="grid gap-2">
                                <Label className="text-sm font-semibold text-gray-700">Género</Label>
                                <Select value={gender} onValueChange={setGender}>
                                    <SelectTrigger className="border-gray-200">
                                        <SelectValue placeholder="Selecciona" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="male">Masculino</SelectItem>
                                        <SelectItem value="female">Femenino</SelectItem>
                                        <SelectItem value="non_binary">No binario</SelectItem>
                                        <SelectItem value="other">Otro</SelectItem>
                                        <SelectItem value="unspecified">Prefiero no decirlo</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>

                    {/* Preferences */}
                    <div className="space-y-4 pt-6 border-t border-gray-100">
                        <h2 className="text-xl font-bold text-brand-dark">Preferencias Pack2Pack</h2>

                        <div className="grid gap-4">
                            <div className="grid gap-2">
                                <Label className="text-sm font-semibold text-gray-700">Preferencia Alimentaria</Label>
                                <Select value={dietary} onValueChange={setDietary}>
                                    <SelectTrigger className="border-gray-200">
                                        <SelectValue placeholder="Selecciona" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="everything">Como de todo</SelectItem>
                                        <SelectItem value="vegetarian">Vegetariano</SelectItem>
                                        <SelectItem value="vegan">Vegano</SelectItem>
                                        <SelectItem value="unspecified">No especificado</SelectItem>
                                    </SelectContent>
                                </Select>
                                <p className="text-xs text-gray-500">Ayuda a filtrar packs de comida relevantes para ti.</p>
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="pickup" className="text-sm font-semibold text-gray-700">Horarios de Recogida Preferidos</Label>
                                <Textarea
                                    id="pickup"
                                    value={pickupTimes}
                                    onChange={e => setPickupTimes(e.target.value)}
                                    placeholder="Ej: Lunes a Viernes de 18:00 a 20:00"
                                    className="h-24 resize-none border-gray-200"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-gray-100">
                        <Button
                            type="submit"
                            disabled={isSaving}
                            className="bg-brand-primary hover:bg-brand-dark text-white rounded-xl font-bold shadow-md flex-1"
                        >
                            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Guardar Cambios
                        </Button>
                        <Button
                            variant="outline"
                            asChild
                            className="border-gray-200 rounded-xl font-semibold"
                        >
                            <Link href="/">Cancelar</Link>
                        </Button>
                        <Button
                            variant="outline"
                            onClick={handleLogout}
                            className="border-destructive/20 text-destructive hover:bg-destructive/10 rounded-xl font-semibold"
                        >
                            Cerrar Sesión
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    )
}
