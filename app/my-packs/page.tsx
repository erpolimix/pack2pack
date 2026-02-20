"use client"

import { useEffect, useState } from "react"
import { packService, Pack } from "@/services/packService"
import { authService } from "@/services/authService"
import { MyPackCard } from "@/components/my-pack-card"
import { Modal } from "@/components/ui/modal"
import { Toast } from "@/components/ui/toast"
import { PackagePlus, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function MyPacksPage() {
    const [packs, setPacks] = useState<Pack[]>([])
    const [loading, setLoading] = useState(true)
    const [user, setUser] = useState<any>(null)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
    const [packToMarkSold, setPackToMarkSold] = useState<string | null>(null)
    const [packToDelete, setPackToDelete] = useState<string | null>(null)
    const [isUpdatingStatus, setIsUpdatingStatus] = useState(false)
    const [isDeleting, setIsDeleting] = useState(false)
    const [toast, setToast] = useState<{ message: string; type: "success" | "error"; isVisible: boolean }>({
        message: "",
        type: "success",
        isVisible: false
    })

    useEffect(() => {
        const fetchUserAndPacks = async () => {
            try {
                const u = await authService.getUser()
                setUser(u)
                if (u) {
                    const userPacks = await packService.getPacksByUser(u.id)
                    setPacks(userPacks)
                }
            } catch (error) {
                console.error("Error fetching user and packs:", error)
                showToast("Error al cargar tus packs", "error")
            } finally {
                setLoading(false)
            }
        }

        fetchUserAndPacks()
    }, [])

    const showToast = (message: string, type: "success" | "error") => {
        setToast({ message, type, isVisible: true })
    }

    const handleMarkAsSold = (packId: string) => {
        setPackToMarkSold(packId)
        setIsModalOpen(true)
    }

    const handleConfirmMarkSold = async () => {
        if (packToMarkSold) {
            setIsUpdatingStatus(true)
            try {
                await packService.updatePackStatus(packToMarkSold, 'sold')
                setPacks(packs.map((pack) =>
                    pack.id === packToMarkSold ? { ...pack, status: 'sold' } : pack
                ))
                showToast("Pack marcado como vendido", "success")
            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : "Error desconocido"
                console.error("Error marking pack as sold:", error)
                showToast(`Error: ${errorMessage}`, "error")
            } finally {
                setIsUpdatingStatus(false)
                setIsModalOpen(false)
                setPackToMarkSold(null)
            }
        }
    }

    const handleDelete = (packId: string) => {
        setPackToDelete(packId)
        setIsDeleteModalOpen(true)
    }

    const handleConfirmDelete = async () => {
        if (packToDelete) {
            setIsDeleting(true)
            try {
                await packService.deletePack(packToDelete)
                setPacks(packs.filter((pack) => pack.id !== packToDelete))
                showToast("Pack eliminado correctamente", "success")
            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : "Error desconocido"
                console.error("Error deleting pack:", error)
                showToast(`Error: ${errorMessage}`, "error")
            } finally {
                setIsDeleting(false)
                setIsDeleteModalOpen(false)
                setPackToDelete(null)
            }
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-brand-cream flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="h-12 w-12 text-brand-primary animate-spin mx-auto mb-4" />
                    <p className="text-brand-dark font-semibold">Cargando tus packs...</p>
                </div>
            </div>
        )
    }

    if (!user) {
        return (
            <div className="min-h-screen bg-brand-cream flex items-center justify-center">
                <div className="text-center max-w-md mx-auto px-4">
                    <div className="w-20 h-20 bg-brand-light rounded-full flex items-center justify-center mx-auto mb-6">
                        <PackagePlus className="h-10 w-10 text-brand-primary" />
                    </div>
                    <h2 className="text-2xl font-bold text-brand-dark mb-3">Inicia sesión</h2>
                    <p className="text-gray-600 mb-6">
                        Necesitas iniciar sesión para ver tus packs.
                    </p>
                    <Button asChild className="bg-brand-primary text-white hover:bg-brand-dark font-bold rounded-xl px-8">
                        <Link href="/login">Iniciar Sesión</Link>
                    </Button>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-brand-cream">
            <div className="container mx-auto px-6 py-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl md:text-4xl font-extrabold text-brand-dark mb-2">
                        Mis Packs
                    </h1>
                    <p className="text-gray-600">
                        Gestiona tus packs publicados
                    </p>
                </div>

                {/* Content */}
                {packs.length === 0 ? (
                    <div className="bg-white rounded-3xl p-12 text-center shadow-sm border border-brand-primary/5">
                        <div className="w-24 h-24 bg-brand-light rounded-full flex items-center justify-center mx-auto mb-6">
                            <PackagePlus className="h-12 w-12 text-brand-primary" />
                        </div>
                        <h2 className="text-2xl font-bold text-brand-dark mb-3">
                            Aún no has creado ningún pack
                        </h2>
                        <p className="text-gray-600 mb-6 max-w-md mx-auto">
                            Empieza a compartir tus excedentes con la comunidad y ayuda a reducir el desperdicio.
                        </p>
                        <Button asChild className="bg-brand-primary text-white hover:bg-brand-dark font-bold rounded-xl px-8 h-12 shadow-lg shadow-brand-primary/30">
                            <Link href="/create">
                                <PackagePlus className="mr-2 h-5 w-5" />
                                Crear mi primer pack
                            </Link>
                        </Button>
                    </div>
                ) : (
                    <>
                        <div className="flex justify-between items-center mb-6">
                            <p className="text-gray-600">
                                <span className="font-bold text-brand-primary">{packs.length}</span> {packs.length === 1 ? 'pack publicado' : 'packs publicados'}
                            </p>
                            <Button asChild className="bg-brand-primary text-white hover:bg-brand-dark font-bold rounded-xl text-sm">
                                <Link href="/create">
                                    <PackagePlus className="mr-2 h-4 w-4" />
                                    Nuevo Pack
                                </Link>
                            </Button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {packs.map((pack) => (
                                <MyPackCard
                                    key={pack.id}
                                    pack={pack}
                                    onMarkSold={handleMarkAsSold}
                                    onDelete={handleDelete}
                                />
                            ))}
                        </div>
                    </>
                )}
            </div>

            {/* Confirmation Modal - Mark as Sold */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onConfirm={handleConfirmMarkSold}
                title="Marcar como vendido"
                description="¿Estás seguro de que quieres marcar este pack como vendido? Se ocultará de la página principal pero se mantendrá en tu historial."
                cancelText="Cancelar"
                confirmText={isUpdatingStatus ? "Actualizando..." : "Marcar como vendido"}
            />

            {/* Confirmation Modal - Delete */}
            <Modal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleConfirmDelete}
                title="Eliminar pack"
                description="¿Estás seguro de que quieres eliminar este pack? Esta acción no se puede deshacer y se eliminará permanentemente."
                cancelText="Cancelar"
                confirmText={isDeleting ? "Eliminando..." : "Eliminar"}
            />

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
