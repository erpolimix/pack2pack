"use client"

import Link from "next/link"
import { Package2, PlusCircle, User, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useEffect, useState } from "react"
import { authService } from "@/services/authService"
import { useRouter } from "next/navigation"
import { NotificationBell } from "@/components/notification-bell"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function Navbar() {
    const router = useRouter()
    const [user, setUser] = useState<any>(null)

    useEffect(() => {
        checkUser()
    }, [])

    const checkUser = async () => {
        try {
            const u = await authService.getUser()
            setUser(u)
        } catch (e) {
            console.error(e)
        }
    }

    const handleLogout = async () => {
        await authService.logout()
        setUser(null)
        router.push("/")
        router.refresh()
    }

    return (
        <header className="sticky top-0 z-50 w-full border-b border-brand-primary/10 bg-brand-cream/80 backdrop-blur-md">
            <div className="container mx-auto flex h-14 sm:h-16 items-center justify-between px-3 sm:px-6 lg:px-12">
                {/* Logo */}
                <Link href="/" className="flex items-center gap-1.5 sm:gap-2 group cursor-pointer flex-shrink-0">
                    <div className="w-7 h-7 sm:w-8 sm:h-8 bg-brand-primary rounded-lg flex items-center justify-center text-white shadow-sm group-hover:bg-brand-dark transition-colors">
                        <Package2 className="h-4 w-4 sm:h-5 sm:w-5" />
                    </div>
                    <span className="font-bold text-lg sm:text-2xl tracking-tight text-brand-primary">pack<span className="text-brand-dark">2</span>pack</span>
                </Link>

                {/* Desktop Search */}
                <div className="hidden lg:flex flex-1 mx-8 max-w-lg">
                    <div className="relative w-full">
                        <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                        </span>
                        <input
                            type="text"
                            className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-full leading-5 bg-white placeholder-gray-400 focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary text-sm shadow-sm"
                            placeholder="Buscar en tu barrio (ej. Malasaña)..."
                        />
                    </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1.5 sm:gap-4">
                    <Link href="/how-it-works" className="text-sm font-semibold text-brand-dark hover:text-brand-primary hidden sm:block transition-colors">
                        Cómo funciona
                    </Link>

                    {/* Vender Pack - Visible en todos los dispositivos */}
                    <Link href="/create">
                        <Button className="bg-brand-primary hover:bg-brand-dark text-white rounded-full font-bold shadow-lg shadow-brand-primary/20 transition-all text-xs sm:text-sm px-3 py-1.5 sm:px-6 sm:py-2 h-auto">
                            <PlusCircle className="mr-1 sm:mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4" />
                            <span className="hidden sm:inline">Vender Pack</span>
                            <span className="sm:hidden">Vender</span>
                        </Button>
                    </Link>

                    {/* Notification Bell - Solo visible para usuarios autenticados */}
                    {user && <NotificationBell />}

                    {user ? (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="rounded-full border border-transparent hover:border-brand-primary/20 hover:bg-brand-primary/5 h-8 w-8 sm:h-10 sm:w-10">
                                    {user.user_metadata?.avatar_url ? (
                                        <img
                                            src={user.user_metadata.avatar_url}
                                            alt="Avatar"
                                            className="w-7 h-7 sm:w-9 sm:h-9 rounded-full object-cover border-2 border-white shadow-sm"
                                        />
                                    ) : (
                                        <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-full bg-brand-light flex items-center justify-center text-brand-primary">
                                            <User className="h-4 w-4 sm:h-5 sm:w-5" />
                                        </div>
                                    )}
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="rounded-xl shadow-soft border-brand-primary/10">
                                <DropdownMenuLabel className="text-brand-dark">Mi Cuenta</DropdownMenuLabel>
                                <DropdownMenuSeparator className="bg-brand-primary/10" />
                                <DropdownMenuItem asChild className="focus:bg-brand-light focus:text-brand-primary cursor-pointer rounded-lg">
                                    <Link href="/profile">Perfil</Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild className="focus:bg-brand-light focus:text-brand-primary cursor-pointer rounded-lg">
                                    <Link href="/my-packs">Mis Packs</Link>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator className="bg-brand-primary/10" />
                                <DropdownMenuItem asChild className="focus:bg-brand-light focus:text-brand-primary cursor-pointer rounded-lg">
                                    <Link href="/my-purchases">Mis Compras</Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild className="focus:bg-brand-light focus:text-brand-primary cursor-pointer rounded-lg">
                                    <Link href="/my-sales">Mis Ventas</Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild className="focus:bg-brand-light focus:text-brand-primary cursor-pointer rounded-lg">
                                    <Link href="/my-exchanges">Mis Intercambios</Link>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator className="bg-brand-primary/10" />
                                <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:bg-destructive/10 focus:text-destructive cursor-pointer rounded-lg">
                                    <LogOut className="mr-2 h-4 w-4" />
                                    Cerrar Sesión
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    ) : (
                        <Link href="/login">
                            <Button variant="ghost" className="font-bold text-brand-dark hover:text-brand-primary hover:bg-transparent px-2 text-xs sm:text-sm">
                                Inicia sesión
                            </Button>
                        </Link>
                    )}
                </div>
            </div>
        </header>
    )
}
