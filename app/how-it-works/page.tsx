"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import {
    Search,
    ShoppingBag,
    Store,
    Utensils,
    Camera,
    Sparkles,
    TrendingUp,
    Handshake,
    ChevronDown,
    ArrowRight,
    Leaf,
    PiggyBank
} from "lucide-react"
import { cn } from "@/lib/utils"

export default function HowItWorksPage() {
    const [activeTab, setActiveTab] = useState<"buyer" | "seller">("buyer")

    return (
        <div className="min-h-screen bg-brand-cream">
            {/* Hero Section */}
            <section className="relative overflow-hidden pt-20 pb-32 px-4">
                <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-brand-light/50 via-transparent to-transparent -z-10" />

                <div className="container mx-auto text-center max-w-4xl animate-in fade-in slide-in-from-bottom-8 duration-700">
                    <Badge variant="outline" className="mb-6 px-4 py-1.5 text-sm border-brand-primary text-brand-primary bg-brand-primary/5">
                        <Leaf className="w-3.5 h-3.5 mr-2" /> Movimiento Anti-Desperdicio
                    </Badge>
                    <h1 className="text-4xl md:text-6xl font-extrabold text-brand-dark tracking-tight mb-6">
                        Salva comida, ahorra dinero y <span className="text-brand-primary">ayuda al planeta</span>.
                    </h1>
                    <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
                        Únete a la comunidad que está cambiando la forma en que consumimos.
                        Conecta con personas de tu zona y rescata excedentes de calidad a precios increíbles.
                    </p>

                    {/* Role Switcher */}
                    <div className="inline-flex bg-white p-1.5 rounded-full shadow-lg border border-border/50 relative">
                        <button
                            onClick={() => setActiveTab("buyer")}
                            className={cn(
                                "px-8 py-3 rounded-full text-sm font-bold transition-all duration-300 flex items-center gap-2",
                                activeTab === "buyer"
                                    ? "bg-brand-primary text-white shadow-md"
                                    : "text-muted-foreground hover:text-brand-dark hover:bg-gray-50"
                            )}
                        >
                            <ShoppingBag className="w-4 h-4" /> Quiero Comprar
                        </button>
                        <button
                            onClick={() => setActiveTab("seller")}
                            className={cn(
                                "px-8 py-3 rounded-full text-sm font-bold transition-all duration-300 flex items-center gap-2",
                                activeTab === "seller"
                                    ? "bg-brand-accent text-brand-dark shadow-md"
                                    : "text-muted-foreground hover:text-brand-dark hover:bg-gray-50"
                            )}
                        >
                            <Store className="w-4 h-4" /> Quiero Vender
                        </button>
                    </div>
                </div>
            </section>

            {/* Steps Section */}
            <section className="py-20 px-4 bg-white/50 backdrop-blur-sm">
                <div className="container mx-auto max-w-5xl">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold text-brand-dark mb-4">
                            {activeTab === "buyer" ? "Tu camino hacia el ahorro" : "Dale una segunda vida a tus alimentos"}
                        </h2>
                        <p className="text-muted-foreground">
                            {activeTab === "buyer"
                                ? "Descubre lo fácil que es rescatar tu primer pack cerca de ti."
                                : "Cuatro pasos sencillos para evitar el desperdicio y recuperar dinero."}
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
                        {/* Connecting Line (Desktop) */}
                        <div className="hidden md:block absolute top-12 left-0 w-full h-0.5 bg-gradient-to-r from-brand-primary/10 via-brand-primary/30 to-brand-primary/10" />

                        {activeTab === "buyer" ? (
                            <>
                                <StepCard
                                    icon={Search}
                                    title="1. Explora"
                                    description="Navega por el mapa y encuentra packs sorpresa de vecinos en tu zona."
                                    delay="0"
                                    color="bg-brand-light text-brand-primary"
                                />
                                <StepCard
                                    icon={ShoppingBag}
                                    title="2. Reserva"
                                    description="Asegura el pack que te interesa pagando de forma segura."
                                    delay="100"
                                    color="bg-blue-50 text-blue-600"
                                />
                                <StepCard
                                    icon={Store}
                                    title="3. Recoge"
                                    description="Acude al punto de encuentro acordado con el vendedor para la entrega."
                                    delay="200"
                                    color="bg-orange-50 text-orange-600"
                                />
                                <StepCard
                                    icon={Utensils}
                                    title="4. Disfruta"
                                    description="¡Sorpresa! Disfruta de comida de calidad sabiendo que has ayudado."
                                    delay="300"
                                    color="bg-green-50 text-green-600"
                                />
                            </>
                        ) : (
                            <>
                                <StepCard
                                    icon={Camera}
                                    title="1. Publica"
                                    description="Sube una foto de lo que te sobra. Comparte en vez de tirar."
                                    delay="0"
                                    color="bg-purple-50 text-purple-600"
                                />
                                <StepCard
                                    icon={Sparkles}
                                    title="2. Describe"
                                    description="Nuestra IA te ayuda a detallar qué contiene tu pack sorpresa."
                                    delay="100"
                                    color="bg-pink-50 text-pink-600"
                                />
                                <StepCard
                                    icon={TrendingUp}
                                    title="3. Intercambia"
                                    description="Tus vecinos reservan el pack. Recuperas parte del valor."
                                    delay="200"
                                    color="bg-amber-50 text-amber-600"
                                />
                                <StepCard
                                    icon={Handshake}
                                    title="4. Entrega"
                                    description="Queda con el comprador en el punto acordado. ¡Simple y social!"
                                    delay="300"
                                    color="bg-teal-50 text-teal-600"
                                />
                            </>
                        )}
                    </div>
                </div>
            </section>

            {/* Impact Section */}
            <section className="py-20 px-4 bg-brand-primary text-white overflow-hidden relative">
                <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-brand-accent/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

                <div className="container mx-auto grid md:grid-cols-2 gap-12 items-center relative z-10">
                    <div className="space-y-6">
                        <Badge variant="secondary" className="bg-brand-accent text-brand-dark border-none">
                            Impacto Real
                        </Badge>
                        <h2 className="text-3xl md:text-5xl font-bold leading-tight">
                            Pequeñas acciones,<br />grandes cambios.
                        </h2>
                        <p className="text-brand-light text-lg opacity-90">
                            Cada pack salvado equivale a 2.5kg de emisiones de CO2 evitadas.
                            Juntos estamos construyendo un futuro más sostenible.
                        </p>
                        <ul className="space-y-4 pt-4">
                            <li className="flex items-center gap-3">
                                <div className="p-2 bg-white/10 rounded-full"><Leaf className="w-5 h-5 text-brand-accent" /></div>
                                <span>Reduce el desperdicio alimentario</span>
                            </li>
                            <li className="flex items-center gap-3">
                                <div className="p-2 bg-white/10 rounded-full"><PiggyBank className="w-5 h-5 text-brand-accent" /></div>
                                <span>Ahorra y ayuda a tus vecinos</span>
                            </li>
                        </ul>
                    </div>
                    <div className="bg-white/10 p-8 rounded-3xl backdrop-blur-md border border-white/10">
                        <div className="grid grid-cols-2 gap-6 text-center">
                            <div className="space-y-2">
                                <div className="text-4xl font-bold text-brand-accent">10k+</div>
                                <div className="text-sm opacity-80">Packs Salvados</div>
                            </div>
                            <div className="space-y-2">
                                <div className="text-4xl font-bold text-brand-accent">25Tn</div>
                                <div className="text-sm opacity-80">CO2 Evitado</div>
                            </div>
                            <div className="space-y-2">
                                <div className="text-4xl font-bold text-brand-accent">500+</div>
                                <div className="text-sm opacity-80">Vecinos Activos</div>
                            </div>
                            <div className="space-y-2">
                                <div className="text-4xl font-bold text-brand-accent">15k+</div>
                                <div className="text-sm opacity-80">Intercambios</div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* FAQ Section */}
            <section className="py-20 px-4 container mx-auto max-w-3xl">
                <div className="text-center mb-12">
                    <h2 className="text-3xl font-bold text-brand-dark">Preguntas Frecuentes</h2>
                    <p className="text-muted-foreground mt-2">Resolvemos tus dudas principales</p>
                </div>

                <div className="space-y-4">
                    <FaqItem
                        question="¿Qué contiene un Pack Sorpresa?"
                        answer="El contenido exacto es sorpresa porque depende de lo que le sobre a tu vecino ese día. Sin embargo, se garantiza que los alimentos están en buen estado y el valor es superior al precio simbólico que pagas."
                    />
                    <FaqItem
                        question="¿Cómo funciona la recogida?"
                        answer="Al reservar, se abrirá un chat o se mostrará el punto de encuentro acordado (puede ser un portal, una plaza, etc.). Acudes a la hora pactada, muestras tu reserva y recoges tu pack."
                    />
                    <FaqItem
                        question="¿Qué pasa si tengo alergias?"
                        answer="Al ser un intercambio entre particulares de comida variada, es difícil garantizar ausencia de trazas. Recomendamos preguntar al vendedor por el chat antes de consumir si tienes alguna alergia severa."
                    />
                    <FaqItem
                        question="¿Cómo empiezo a vender?"
                        answer="Es muy sencillo. Pulsa en 'Quiero Vender', sube una foto de tus alimentos excedentes y publica. En cuanto un vecino lo reserve, acordaréis la entrega."
                    />
                </div>
            </section>

            {/* CTA Final */}
            <section className="py-20 px-4 text-center bg-brand-light/30">
                <h2 className="text-3xl font-bold text-brand-dark mb-6">¿Listo para empezar?</h2>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Button asChild size="lg" className="rounded-full px-8 h-14 text-lg shadow-lg hover:translate-y-[-2px] transition-transform">
                        <Link href="/">
                            Explorar Packs <ArrowRight className="ml-2 w-5 h-5" />
                        </Link>
                    </Button>
                    <Button asChild variant="outline" size="lg" className="rounded-full px-8 h-14 text-lg border-2 hover:bg-white hover:text-brand-primary">
                        <Link href="/create">
                            Vender mis excedentes
                        </Link>
                    </Button>
                </div>
            </section>
        </div>
    )
}

// Components Helper
function StepCard({ icon: Icon, title, description, delay, color }: { icon: any, title: string, description: string, delay: string, color: string }) {
    return (
        <div
            className="flex flex-col items-center text-center group bg-white p-6 rounded-2xl shadow-sm border border-transparent hover:border-brand-primary/20 hover:shadow-lg transition-all duration-500 animate-in fade-in slide-in-from-bottom-4 fill-mode-both"
            style={{ animationDelay: `${delay}ms` }}
        >
            <div className={cn("w-16 h-16 rounded-2xl flex items-center justify-center mb-6 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3 relative z-10", color)}>
                <Icon className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-brand-dark mb-3">{title}</h3>
            <p className="text-muted-foreground leading-relaxed">{description}</p>
        </div>
    )
}

function FaqItem({ question, answer }: { question: string, answer: string }) {
    const [isOpen, setIsOpen] = useState(false)

    return (
        <div className="border rounded-xl overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between p-6 text-left font-semibold text-brand-dark hover:bg-gray-50 transition-colors"
            >
                {question}
                <ChevronDown className={cn("w-5 h-5 text-muted-foreground transition-transform duration-300", isOpen && "rotate-180")} />
            </button>
            <div
                className={cn(
                    "overflow-hidden transition-all duration-300 ease-in-out bg-gray-50/50",
                    isOpen ? "max-h-48 opacity-100" : "max-h-0 opacity-0"
                )}
            >
                <div className="p-6 pt-0 text-muted-foreground leading-relaxed">
                    {answer}
                </div>
            </div>
        </div>
    )
}
