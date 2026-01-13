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
            setDescription(aiDesc)
            // Heuristic title guess based on description or random
            setTitle(aiDesc.split(' ').slice(0, 3).join(' ') + " Pack")
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
            await packService.createPack({
                title,
                description,
                price: Number.parseFloat(price) || 0,
                originalPrice: Number.parseFloat(originalPrice) || 0,
                imageUrl: imagePreview || "https://images.unsplash.com/photo-1546213290-e1fc4f6d4f75?auto=format&fit=crop&q=80&w=600",
                tags: tagInput.split(',').map(t => t.trim()).filter(Boolean),
                location: "My Neighborhood", // Demo default
                expiresAt: new Date(Date.now() + 86400000).toISOString() // 24h default
            })
            router.push('/')
        } catch (error) {
            console.error("Submit Error", error)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6 max-w-lg mx-auto p-6 bg-card rounded-xl border shadow-sm">

            {/* Image Upload Area */}
            <div className="space-y-2">
                <Label htmlFor="image-upload" className="block text-sm font-medium">
                    Pack Photo
                </Label>
                <div className="relative group cursor-pointer border-2 border-dashed border-muted-foreground/25 rounded-xl hover:bg-muted/50 transition-colors h-48 flex flex-col items-center justify-center bg-muted/10 overflow-hidden">
                    <input
                        id="image-upload"
                        type="file"
                        accept="image/*"
                        className="absolute inset-0 opacity-0 cursor-pointer z-20"
                        onChange={handleImageChange}
                        required={!imagePreview} // Require unless we have a preview (mock)
                    />

                    {imagePreview ? (
                        <div className="relative w-full h-full">
                            <Image src={imagePreview} alt="Preview" fill className="object-cover" />
                        </div>
                    ) : (
                        <div className="flex flex-col items-center text-muted-foreground">
                            <Camera className="w-8 h-8 mb-2" />
                            <span className="text-sm font-medium">Tap to take photo</span>
                        </div>
                    )}

                    {isAnalyzing && (
                        <div className="absolute inset-0 bg-background/60 backdrop-blur-sm z-30 flex items-center justify-center flex-col text-primary animate-in fade-in">
                            <Sparkles className="w-6 h-6 mb-2 animate-pulse" />
                            <span className="text-xs font-semibold">AI analyzing...</span>
                        </div>
                    )}
                </div>
                <p className="text-[10px] text-muted-foreground text-center">
                    AI will automatically describe your items.
                </p>
            </div>

            <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label>Price (€)</Label>
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
                        <Label>Original Value (€)</Label>
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
                    <Label>Title</Label>
                    <Input
                        placeholder="e.g. Kitchen Starter Pack"
                        value={title}
                        onChange={e => setTitle(e.target.value)}
                        required
                    />
                </div>

                <div className="space-y-2">
                    <div className="flex justify-between items-center">
                        <Label>Description</Label>
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-6 text-xs text-primary"
                            onClick={() => {
                                setIsAnalyzing(true);
                                setTimeout(() => {
                                    aiService.generateDescription(new File([], "foo")).then(d => {
                                        setDescription(d);
                                        setIsAnalyzing(false);
                                    });
                                }, 1000);
                            }}
                        >
                            <Sparkles className="w-3 h-3 mr-1" /> Regenerate
                        </Button>
                    </div>
                    <Textarea
                        placeholder="What&apos;s in the pack?"
                        value={description}
                        onChange={e => setDescription(e.target.value)}
                        className="h-24 resize-none"
                        required
                    />
                </div>

                <div className="space-y-2">
                    <Label>Tags (comma separated)</Label>
                    <Input
                        placeholder="clothes, vintage, tech"
                        value={tagInput}
                        onChange={e => setTagInput(e.target.value)}
                    />
                </div>
            </div>

            <Button type="submit" className="w-full" disabled={isLoading || isAnalyzing}>
                {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {isLoading ? "Publishing..." : "Sell Pack"}
            </Button>
        </form>
    )
}
