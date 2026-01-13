"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { packService, Pack } from "@/services/packService"
import { authService } from "@/services/authService"

export default function EditPackPage() {
    const [pack, setPack] = useState<Pack | null>(null)
    const [loading, setLoading] = useState(true)
    const params = useParams()
    const router = useRouter()
    const id = params.id as string

    useEffect(() => {
        if (id) {
            const fetchPack = async () => {
                try {
                    const user = await authService.getUser()
                    const fetchedPack = await packService.getPackById(id)
                    if (fetchedPack) {
                        if (user?.id !== fetchedPack.seller_id) {
                            router.push("/")
                        } else {
                            setPack(fetchedPack)
                        }
                    }
                } catch (error) {
                    console.error("Error fetching pack:", error)
                } finally {
                    setLoading(false)
                }
            }
            fetchPack()
        }
    }, [id, router])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (pack) {
            try {
                await packService.updatePack(id, pack)
                router.push("/my-packs")
            } catch (error) {
                console.error("Error updating pack:", error)
            }
        }
    }

    if (loading) {
        return <div>Loading...</div>
    }

    if (!pack) {
        return <div>Pack not found.</div>
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-8">Edit Pack</h1>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="title" className="block text-sm font-medium text-gray-700">Title</label>
                    <input
                        type="text"
                        id="title"
                        value={pack.title}
                        onChange={(e) => setPack({ ...pack, title: e.target.value })}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    />
                </div>
                <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
                    <textarea
                        id="description"
                        value={pack.description}
                        onChange={(e) => setPack({ ...pack, description: e.target.value })}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    />
                </div>
                <div>
                    <label htmlFor="price" className="block text-sm font-medium text-gray-700">Price</label>
                    <input
                        type="number"
                        id="price"
                        value={pack.price}
                        onChange={(e) => setPack({ ...pack, price: Number(e.target.value) })}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    />
                </div>
                <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">Save Changes</button>
            </form>
        </div>
    )
}
