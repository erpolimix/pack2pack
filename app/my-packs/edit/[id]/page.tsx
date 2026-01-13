"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { packService, Pack } from "@/services/packService"
import { authService } from "@/services/authService"
import { EditPackForm } from "@/components/edit-pack-form"
import { Toast } from "@/components/ui/toast"
import { Loader2, PackageX } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function EditPackPage() {
    const [pack, setPack] = useState<Pack | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const params = useParams()
    const router = useRouter()
    const id = params.id as string
    const [toast, setToast] = useState<{ message: string; type: "success" | "error"; isVisible: boolean }>({
        message: "",
        type: "success",
        isVisible: false
    })

    useEffect(() => {
        if (id) {
            const fetchPack = async () => {
                try {
                    const user = await authService.getUser()
                    const fetchedPack = await packService.getPackById(id)
                    if (fetchedPack) {
                        if (user?.id !== fetchedPack.seller_id) {
                            setError("No tienes permiso para editar este pack")
                            setTimeout(() => router.push("/"), 2000)
                        } else {
                            setPack(fetchedPack)
                        }
                    } else {
                        setError("Pack no encontrado")
                    }
                } catch (error) {
                    console.error("Error fetching pack:", error)
                    setError("Error al cargar el pack")
                } finally {
                    setLoading(false)
                }
            }
            fetchPack()
        }
    }, [id, router])

    const showToast = (message: string, type: "success" | "error") => {
        setToast({ message, type, isVisible: true })
    }

    const handleSuccess = () => {
        showToast("Pack actualizado correctamente", "success")
        setTimeout(() => {
            router.push("/my-packs")
        }, 1500)
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-brand-cream flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="h-12 w-12 text-brand-primary animate-spin mx-auto mb-4" />
                    <p className="text-brand-dark font-semibold">Cargando pack...</p>
                </div>
            </div>
        )
    }

    if (error || !pack) {
        return (
            <div className="min-h-screen bg-brand-cream flex items-center justify-center">
                <div className="text-center max-w-md mx-auto px-4">
                    <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
                        <PackageX className="h-10 w-10 text-brand-alert" />
                    </div>
                    <h2 className="text-2xl font-bold text-brand-dark mb-3">
                        {error || "Pack no encontrado"}
                    </h2>
                    <p className="text-gray-600 mb-6">
                        No se pudo cargar el pack que intentas editar.
                    </p>
                    <Button asChild className="bg-brand-primary text-white hover:bg-brand-dark font-bold rounded-xl px-8">
                        <Link href="/my-packs">Volver a Mis Packs</Link>
                    </Button>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-brand-cream">
            <div className="container max-w-2xl mx-auto py-10 px-4">
                {/* Header */}
                <div className="mb-8 text-center">
                    <h1 className="text-3xl font-bold tracking-tight mb-2 text-brand-dark">
                        Editar Pack
                    </h1>
                    <p className="text-muted-foreground">
                        Actualiza la información de tu pack
                    </p>
                </div>

                {/* Form */}
                <EditPackForm pack={pack} onSuccess={handleSuccess} />
            </div>

            {/* Toast Notification */}
            <Toast
                message={toast.message}
                type={toast.type}
                isVisible={toast.isVisible}
                onClose={() => setToast({ ...toast, isVisible: false })}
            />
        </div>
    )
}
