"use client"

import { useEffect, useState } from "react"
import { packService, Pack } from "@/services/packService"
import { authService } from "@/services/authService"
import Link from "next/link"
import { Modal } from "@/components/ui/modal"

export default function MyPacksPage() {
    const [packs, setPacks] = useState<Pack[]>([])
    const [loading, setLoading] = useState(true)
    const [user, setUser] = useState<any>(null)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [packToDelete, setPackToDelete] = useState<string | null>(null)

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
            } finally {
                setLoading(false)
            }
        }

        fetchUserAndPacks()
    }, [])

    const handleDeleteConfirmation = (packId: string) => {
        setPackToDelete(packId)
        setIsModalOpen(true)
    }

    const handleDelete = async () => {
        if (packToDelete) {
            try {
                await packService.deletePack(packToDelete)
                setPacks(packs.filter((pack) => pack.id !== packToDelete))
            } catch (error) {
                console.error("Error deleting pack:", error)
            } finally {
                setIsModalOpen(false)
                setPackToDelete(null)
            }
        }
    }

    if (loading) {
        return <div>Loading...</div>
    }

    if (!user) {
        return <div>Please log in to see your packs.</div>
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-8">My Packs</h1>
            {packs.length === 0 ? (
                <p>You haven't created any packs yet.</p>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {packs.map((pack) => (
                        <div key={pack.id} className="border rounded-lg p-4">
                            <h2 className="text-xl font-semibold">{pack.title}</h2>
                            <p>{pack.description}</p>
                            <div className="mt-4 flex justify-end gap-2">
                                <Link href={`/my-packs/edit/${pack.id}`}>
                                    <button className="bg-blue-500 text-white px-4 py-2 rounded">Edit</button>
                                </Link>
                                <button onClick={() => handleDeleteConfirmation(pack.id)} className="bg-red-500 text-white px-4 py-2 rounded">Delete</button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onConfirm={handleDelete}
                title="Are you sure?"
                description="This action cannot be undone."
            />
        </div>
    )
}
