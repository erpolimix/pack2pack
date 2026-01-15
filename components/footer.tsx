import Link from "next/link"
import { Package2 } from "lucide-react"

export function Footer() {
    return (
        <footer className="bg-brand-dark text-white pt-16 pb-8">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
                    {/* Brand Column */}
                    <div className="col-span-1">
                        <div className="flex items-center mb-4">
                            <div className="w-8 h-8 bg-brand-primary rounded-lg flex items-center justify-center text-white mr-2">
                                <Package2 className="h-5 w-5" />
                            </div>
                            <span className="font-bold text-2xl">pack2pack</span>
                        </div>
                        <p className="text-gray-400 text-sm leading-relaxed">
                            La plataforma P2P líder para el intercambio de alimentos y reducción de desperdicios. Únete a la revolución verde desde tu barrio.
                        </p>
                    </div>

                    {/* Descubre Column */}
                    <div>
                        <h4 className="font-bold text-lg mb-4">Descubre</h4>
                        <ul className="space-y-2 text-gray-400 text-sm">
                            <li><Link href="/how-it-works" className="hover:text-brand-accent transition-colors">Cómo funciona</Link></li>
                            <li><Link href="#" className="hover:text-brand-accent transition-colors">Ciudades</Link></li>
                            <li><Link href="#" className="hover:text-brand-accent transition-colors">Héroes del desperdicio</Link></li>
                            <li><Link href="#" className="hover:text-brand-accent transition-colors">Blog</Link></li>
                        </ul>
                    </div>

                    {/* Comunidad Column */}
                    <div>
                        <h4 className="font-bold text-lg mb-4">Comunidad</h4>
                        <ul className="space-y-2 text-gray-400 text-sm">
                            <li><Link href="#" className="hover:text-brand-accent transition-colors">Reglas de convivencia</Link></li>
                            <li><Link href="#" className="hover:text-brand-accent transition-colors">Seguridad y Confianza</Link></li>
                            <li><Link href="#" className="hover:text-brand-accent transition-colors">Centro de Ayuda</Link></li>
                        </ul>
                    </div>

                    {/* App Download Column */}
                    <div>
                        <h4 className="font-bold text-lg mb-4">Descarga la App</h4>
                        <div className="space-y-3">
                            <button className="w-full bg-white/10 hover:bg-white/20 border border-white/10 rounded-xl p-2 flex items-center transition-colors">
                                <svg className="h-6 w-6 mx-3" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
                                </svg>
                                <div className="text-left">
                                    <div className="text-[10px] uppercase">Consíguelo en</div>
                                    <div className="text-sm font-bold leading-none">App Store</div>
                                </div>
                            </button>
                            <button className="w-full bg-white/10 hover:bg-white/20 border border-white/10 rounded-xl p-2 flex items-center transition-colors">
                                <svg className="h-5 w-5 mx-3" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.6 3,21.09 3,20.5M16.81,15.12L6.05,21.34L14.54,12.85L16.81,15.12M20.16,10.81C20.5,11.08 20.75,11.5 20.75,12C20.75,12.5 20.53,12.9 20.18,13.18L17.89,14.5L15.39,12L17.89,9.5L20.16,10.81M6.05,2.66L16.81,8.88L14.54,11.15L6.05,2.66Z" />
                                </svg>
                                <div className="text-left">
                                    <div className="text-[10px] uppercase">Disponible en</div>
                                    <div className="text-sm font-bold leading-none">Google Play</div>
                                </div>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center text-xs text-gray-500">
                    <p>&copy; 2026 Pack2pack Inc. Todos los derechos reservados.</p>
                    <div className="flex space-x-6 mt-4 md:mt-0">
                        <Link href="#" className="hover:text-white transition-colors">Privacidad</Link>
                        <Link href="#" className="hover:text-white transition-colors">Términos</Link>
                        <Link href="#" className="hover:text-white transition-colors">Cookies</Link>
                    </div>
                </div>
            </div>
        </footer>
    )
}
