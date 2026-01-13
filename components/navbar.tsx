"use client"
import Link from "next/link"
import { Package2, User, PlusCircle } from "lucide-react"

import { Button } from "@/components/ui/button"

export function Navbar() {
    return (
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container flex h-16 items-center justify-between">
                {/* Logo */}
                <Link href="/" className="flex items-center gap-2 font-bold text-xl text-primary">
                    <Package2 className="h-6 w-6" />
                    <span>Pack2Pack</span>
                </Link>

                {/* Desktop Nav */}
                <nav className="hidden md:flex items-center gap-6">
                    <Link href="/" className="text-sm font-medium hover:text-primary transition">
                        Browse
                    </Link>
                    <Link href="/create" className="text-sm font-medium hover:text-primary transition">
                        Sell a Pack
                    </Link>
                </nav>

                {/* Actions */}
                <div className="flex items-center gap-2">
                    <Link href="/create">
                        <Button size="sm" className="hidden md:flex">
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Sell Pack
                        </Button>
                        {/* Mobile Fab alternative if needed, but for now simple hidden on mobile */}
                    </Link>

                    <Link href="/login">
                        <Button variant="ghost" size="icon">
                            <User className="h-5 w-5" />
                            <span className="sr-only">Toggle user menu</span>
                        </Button>
                    </Link>
                </div>
            </div>
        </header>
    )
}
