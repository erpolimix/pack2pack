"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { aiService } from "@/services/aiService"
import { packService } from "@/services/packService"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Camera, Loader2, Sparkles } from "lucide-react"
import Image from "next/image"

export function CreatePackForm() {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)
    const [isAnalyzing, setIsAnalyzing] = useState(false)
    const [selectedFile, setSelectedFile] = useState<File | null>(null)
    const [imagePreview, setImagePreview] = useState<string | null>(null)

    // Form State
    const [title, setTitle] = useState("")
    const [description, setDescription] = useState("")
    const [price, setPrice] = useState("")
    const [originalPrice, setOriginalPrice] = useState("")
    const [tagInput, setTagInput] = useState("")

    const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        setSelectedFile(file)
        // Create preview
        const reader = new FileReader()
        reader.onloadend = () => {
            setImagePreview(reader.result as string)
        }
        reader.readAsDataURL(file)

        // Auto-analyze
        setIsAnalyzing(true)
        try {
            const aiDesc = await aiService.generateDescription(file)
            if (aiDesc && !aiDesc.startsWith("No se ha podido")) {
                setDescription(aiDesc)
                // Heuristic title guess based on description
                setTitle(aiDesc.split(' ').slice(0, 3).join(' ') + " Pack")
            }
        } catch (error) {
            console.error("AI Error", error)
        } finally {
            setIsAnalyzing(false)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)

        try {
            // 1. Upload image if exists
            let finalImageUrl = imagePreview || "https://images.unsplash.com/photo-1546213290-e1fc4f6d4f75?auto=format&fit=crop&q=80&w=600"

            if (selectedFile) {
                finalImageUrl = await packService.uploadImage(selectedFile)
            }

            // 2. Create pack in DB
            await packService.createPack({
                title,
                description,
                price: Number.parseFloat(price) || 0,
                originalPrice: Number.parseFloat(originalPrice) || 0,
                imageUrl: finalImageUrl,
                tags: tagInput.split(',').map(t => t.trim()).filter(Boolean),
                location: "Mi Barrio",
                distance: "0.5 km",
                sellerName: "Usuario Demo"
            })
            router.push('/')
        } catch (error) {
            console.error("Submit Error:", error)
            console.error("Error details:", {
                message: error instanceof Error ? error.message : 'Unknown error',
                stack: error instanceof Error ? error.stack : undefined,
                fullError: JSON.stringify(error, null, 2)
            })
            alert("Error al publicar el pack. Por favor, revisa la consola para más detalles.")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6 max-w-lg mx-auto p-6 bg-card rounded-xl border shadow-sm">

            {/* Image Upload Area */}
            <div className="space-y-2">
                <Label htmlFor="image-upload" className="block text-sm font-medium">
                    Foto del Pack
                </Label>
                <div className="relative group cursor-pointer border-2 border-dashed border-muted-foreground/25 rounded-xl hover:bg-muted/50 transition-colors h-48 flex flex-col items-center justify-center bg-muted/10 overflow-hidden">
                    <input
                        id="image-upload"
                        type="file"
                        accept="image/*"
                        className="absolute inset-0 opacity-0 cursor-pointer z-20"
                        onChange={handleImageChange}
                        required={!imagePreview}
                    />

                    {imagePreview ? (
                        <div className="relative w-full h-full">
                            <Image src={imagePreview} alt="Preview" fill className="object-cover" />
                        </div>
                    ) : (
                        <div className="flex flex-col items-center text-muted-foreground">
                            <Camera className="w-8 h-8 mb-2" />
                            <span className="text-sm font-medium">Pulsa para hacer foto</span>
                        </div>
                    )}

                    {isAnalyzing && (
                        <div className="absolute inset-0 bg-background/60 backdrop-blur-sm z-30 flex items-center justify-center flex-col text-primary animate-in fade-in">
                            <Sparkles className="w-6 h-6 mb-2 animate-pulse" />
                            <span className="text-xs font-semibold">IA analizando...</span>
                        </div>
                    )}
                </div>
                <p className="text-[10px] text-muted-foreground text-center">
                    La IA describirá automáticamente tus productos.
                </p>
            </div>

            <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label>Precio (€)</Label>
                        <Input
                            type="number"
                            step="0.50"
                            placeholder="5.00"
                            value={price}
                            onChange={e => setPrice(e.target.value)}
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Valor Original (€)</Label>
                        <Input
                            type="number"
                            step="0.50"
                            placeholder="20.00"
                            value={originalPrice}
                            onChange={e => setOriginalPrice(e.target.value)}
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <Label>Título</Label>
                    <Input
                        placeholder="ej. Pack de inicio de cocina"
                        value={title}
                        onChange={e => setTitle(e.target.value)}
                        required
                    />
                </div>

                <div className="space-y-2">
                    <div className="flex justify-between items-center">
                        <Label>Descripción</Label>
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-6 text-xs text-primary"
                            onClick={async () => {
                                if (!selectedFile) {
                                    alert("Primero sube una foto para que la IA la analice.");
                                    return;
                                }
                                setIsAnalyzing(true);
                                try {
                                    const d = await aiService.generateDescription(selectedFile);
                                    setDescription(d);
                                } finally {
                                    setIsAnalyzing(false);
                                }
                            }}
                        >
                            <Sparkles className="w-3 h-3 mr-1" /> Regenerar
                        </Button>
                    </div>
                    <Textarea
                        placeholder="¿Qué hay en el pack?"
                        value={description}
                        onChange={e => setDescription(e.target.value)}
                        className="h-24 resize-none"
                        required
                    />
                </div>

                <div className="space-y-2">
                    <Label>Etiquetas (separadas por comas)</Label>
                    <Input
                        placeholder="ropa, vintage, tecnología"
                        value={tagInput}
                        onChange={e => setTagInput(e.target.value)}
                    />
                </div>
            </div>

            <Button type="submit" className="w-full" disabled={isLoading || isAnalyzing}>
                {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {isLoading ? "Publicando..." : "Vender Pack"}
            </Button>
        </form>
    )
}
