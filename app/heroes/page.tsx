"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Trophy, Leaf, Users, Play, ArrowRight, Star, Heart, Zap, Award, Share2, Shirt, BookOpen, Package } from 'lucide-react'
import { statsService, type PlatformStats, type TopUser } from '@/services/statsService'

export default function HeroesPage() {
  const router = useRouter()
  const [scrolled, setScrolled] = useState(false)
  const [stats, setStats] = useState<PlatformStats>({
    totalPacks: 0,
    totalUsers: 0,
    totalValue: 0,
    uniqueNeighborhoods: 0
  })
  const [topUsers, setTopUsers] = useState<TopUser[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()

    const handleScroll = () => {
      setScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll)
    
    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [])

  const loadData = async () => {
    try {
      const [platformStats, users] = await Promise.all([
        statsService.getPlatformStats(),
        statsService.getTopUsersByCategory()
      ])
      
      setStats(platformStats)
      setTopUsers(users)
    } catch (error) {
      console.error("Error loading heroes data:", error)
    } finally {
      setLoading(false)
    }
  }

  const getCategoryIcon = (category: string) => {
    const icons: Record<string, React.ReactElement> = {
      'Ropa': <Shirt size={16} className="text-white" />,
      'Libros': <BookOpen size={16} className="text-white" />,
      'Juguetes': <Package size={16} className="text-white" />,
      'Alimentos': <Leaf size={16} className="text-white" />,
      'Hogar': <Trophy size={16} className="text-white" />,
      'Otro': <Package size={16} className="text-white" />
    }
    return icons[category] || icons['Otro']
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white font-sans overflow-x-hidden selection:bg-emerald-500 selection:text-white">
      
      {/* Navigation */}
      <nav className={`fixed w-full z-50 transition-all duration-300 ${scrolled ? 'bg-slate-900/90 backdrop-blur-md py-4 border-b border-white/10' : 'bg-transparent py-6'}`}>
        <div className="max-w-7xl mx-auto px-6 flex justify-end items-center">
          <button 
            onClick={() => router.push('/')}
            className="flex items-center gap-2 px-6 py-2 bg-white/10 hover:bg-white/20 rounded-full border border-white/10 transition-all backdrop-blur-sm"
          >
            <span>Volver al Market</span>
            <ArrowRight size={16} />
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="relative pt-20 pb-16 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 opacity-90 z-10"></div>
          <img 
            src="https://images.unsplash.com/photo-1550989460-0adf9ea622e2?ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&q=80" 
            alt="Community Background" 
            className="w-full h-full object-cover scale-110 opacity-30"
          />
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-brand-primary/20 rounded-full blur-[100px] animate-blob"></div>
          <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-indigo-500/20 rounded-full blur-[100px] animate-blob animation-delay-2000"></div>
        </div>

        <div className="relative z-20 text-center px-4 max-w-5xl mx-auto pt-24">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-primary/10 border border-brand-primary/30 text-brand-primary mb-6 animate-fade-in-up">
            <Star size={16} className="fill-brand-primary" />
            <span className="text-sm font-semibold tracking-wide uppercase">Impacto Comunitario 2026</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-black tracking-tight mb-6 leading-tight animate-fade-in-up animation-delay-100">
            Héroes de la <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-primary via-teal-300 to-indigo-400">
              Segunda Vida
            </span>
          </h1>
          
          <p className="text-lg md:text-xl text-slate-300 max-w-2xl mx-auto mb-8 font-light leading-relaxed animate-fade-in-up animation-delay-200">
            No llevan capa, dan nuevas oportunidades. Ya sea un abrigo, un libro o un juguete, aquí nada se pierde, todo se transforma.
          </p>

          <div className="flex flex-col md:flex-row items-center justify-center gap-6 animate-fade-in-up animation-delay-300">
            <button 
              onClick={() => router.push('/create')}
              className="group relative px-8 py-4 bg-brand-primary hover:bg-brand-dark text-white font-bold rounded-xl transition-all hover:scale-105 hover:shadow-[0_0_40px_-10px_rgba(45,90,39,0.5)]"
            >
              <span className="flex items-center gap-2">
                Empieza a Circular
                <Zap className="group-hover:fill-white transition-colors" size={20} />
              </span>
            </button>
            <button className="group flex items-center gap-3 px-8 py-4 bg-white/5 hover:bg-white/10 backdrop-blur-sm border border-white/10 rounded-xl transition-all">
              <div className="w-10 h-10 rounded-full bg-white text-slate-900 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Play size={16} className="ml-1 fill-slate-900" />
              </div>
              <span className="font-medium">Ver Manifiesto</span>
            </button>
          </div>
        </div>

        {/* Floating Impact Stats */}
        <div className="relative mt-16 z-20">
          <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 border-t border-white/10 pt-8">
            <div className="text-center md:text-left">
              <div className="text-3xl md:text-4xl font-bold text-white mb-1 font-mono">
                {loading ? '...' : stats.totalPacks.toLocaleString()}
              </div>
              <div className="text-sm text-slate-400 uppercase tracking-wider">Packs Salvados</div>
            </div>
            <div className="text-center md:text-left">
              <div className="text-3xl md:text-4xl font-bold text-white mb-1 font-mono">
                {loading ? '...' : stats.totalUsers.toLocaleString()}
              </div>
              <div className="text-sm text-slate-400 uppercase tracking-wider">Usuarios Activos</div>
            </div>
            <div className="text-center md:text-left">
              <div className="text-3xl md:text-4xl font-bold text-white mb-1 font-mono">
                {loading ? '...' : Math.floor(stats.totalValue / 1000)}
                <span className="text-brand-primary text-lg ml-1">k€</span>
              </div>
              <div className="text-sm text-slate-400 uppercase tracking-wider">Valor Recuperado</div>
            </div>
            <div className="text-center md:text-left">
              <div className="text-3xl md:text-4xl font-bold text-white mb-1 font-mono">
                {loading ? '...' : stats.uniqueNeighborhoods}
              </div>
              <div className="text-sm text-slate-400 uppercase tracking-wider">Barrios Conectados</div>
            </div>
          </div>
        </div>
      </header>

      {/* Top Heroes Section */}
      <section className="py-32 relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16">
            <div>
              <h2 className="text-4xl md:text-5xl font-bold mb-4">Leyendas del Barrio</h2>
              <p className="text-slate-400 text-lg max-w-md">Estos vecinos han movido más productos que nadie este mes. ¡Economía circular en estado puro! 👏</p>
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[1, 2, 3].map(i => (
                <div key={i} className="bg-slate-800/50 rounded-3xl p-6 h-80 animate-pulse"></div>
              ))}
            </div>
          ) : topUsers.length === 0 ? (
            <div className="text-center py-20 text-slate-400">
              <Trophy size={64} className="mx-auto mb-4 opacity-20" />
              <p className="text-xl">Aún no hay héroes registrados.</p>
              <p className="text-sm mt-2">¡Sé el primero en subir un pack!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {topUsers.map((hero, index) => {
                const categoryInfo = statsService.getCategoryInfo(hero.category)
                
                return (
                  <div key={hero.id} className="group relative bg-slate-800/50 rounded-3xl p-6 border border-white/5 hover:border-brand-primary/30 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-brand-primary/20">
                    <div className="absolute -top-4 -right-4 w-12 h-12 bg-slate-900 rounded-full border-4 border-slate-800 flex items-center justify-center z-10 font-bold text-xl shadow-lg">
                      #{index + 1}
                    </div>

                    <div className="flex items-center gap-4 mb-6">
                      <div className={`p-1 rounded-full bg-gradient-to-br ${categoryInfo.color} relative`}>
                        {hero.avatar ? (
                          <img src={hero.avatar} alt={hero.name} className="w-16 h-16 rounded-full border-4 border-slate-900 object-cover" />
                        ) : (
                          <img 
                            src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${hero.id}`} 
                            alt={hero.name} 
                            className="w-16 h-16 rounded-full border-4 border-slate-900 object-cover bg-slate-700" 
                          />
                        )}
                        <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-slate-900 flex items-center justify-center border border-slate-700">
                          {getCategoryIcon(hero.category)}
                        </div>
                      </div>
                      <div>
                        <h3 className="text-xl font-bold">{hero.name}</h3>
                        <div className="flex items-center gap-1 text-sm text-brand-primary">
                          <Award size={14} />
                          <span>{hero.badge}</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="bg-slate-900/50 rounded-2xl p-4 flex items-center justify-between">
                        <div className="flex items-center gap-3 text-slate-300">
                          <div className="p-2 bg-brand-primary/10 rounded-lg text-brand-primary">
                            <Trophy size={20} />
                          </div>
                          <span className="text-sm font-medium">{hero.statLabel}</span>
                        </div>
                        <span className="text-2xl font-bold text-white">{hero.statValue}</span>
                      </div>

                      <div className="flex gap-2 flex-wrap">
                        {hero.tags.map(tag => (
                          <span key={tag} className="px-3 py-1 bg-white/5 rounded-full text-xs text-slate-400 border border-white/5">{tag}</span>
                        ))}
                      </div>
                    </div>
                    
                    <div className="mt-6 pt-6 border-t border-white/5 flex justify-center items-center">
                      <div className="text-sm font-medium text-slate-300">
                        <span className="text-brand-primary font-bold text-lg">{hero.totalTransactions}</span> packs publicados
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </section>

      {/* Manifesto Section */}
      <section className="py-20 bg-brand-primary/20 overflow-hidden relative">
        <div className="absolute top-0 right-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5"></div>
        
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center gap-16 relative z-10">
          <div className="md:w-1/2">
            <div className="relative group cursor-pointer">
              <div className="absolute -inset-1 bg-gradient-to-r from-brand-primary to-indigo-600 rounded-2xl blur opacity-25 group-hover:opacity-75 transition duration-1000 group-hover:duration-200"></div>
              <div className="relative rounded-2xl overflow-hidden aspect-video shadow-2xl">
                <img 
                  src="https://images.unsplash.com/photo-1556761175-5973dc0f32e7?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&q=80" 
                  alt="Video Thumbnail" 
                  className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-slate-900/40 group-hover:bg-slate-900/20 transition-colors flex items-center justify-center">
                  <div className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border border-white/30 group-hover:scale-110 transition-transform">
                    <Play size={32} className="ml-2 text-white fill-white" />
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="md:w-1/2 space-y-8">
            <h2 className="text-4xl font-bold leading-tight">
              Cada objeto merece <br/>
              <span className="text-brand-primary">un segundo estreno</span>
            </h2>
            <div className="space-y-6">
              {[
                { title: "Libera Espacio", desc: "Convierte ese rincón lleno de 'por si acasos' en dinero extra.", icon: <Package size={24} /> },
                { title: "Economía Circular", desc: "Lo que tú ya no usas, es justo lo que tu vecino estaba buscando.", icon: <Users size={24} /> },
                { title: "Gana Comunidad", desc: "Conecta con gente de tu zona y fortalece el comercio local.", icon: <Trophy size={24} /> }
              ].map((item, i) => (
                <div key={i} className="flex gap-4 items-start group">
                  <div className="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center text-brand-primary group-hover:bg-brand-primary group-hover:text-white transition-colors">
                    {item.icon}
                  </div>
                  <div>
                    <h4 className="text-xl font-bold mb-1">{item.title}</h4>
                    <p className="text-slate-400 text-sm leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-24 text-center px-6 relative">
        <div className="max-w-3xl mx-auto">
          <div className="inline-block p-4 rounded-full bg-brand-primary/10 mb-6">
            <Share2 size={32} className="text-brand-primary" />
          </div>
          <h2 className="text-5xl md:text-7xl font-black mb-8 tracking-tight">
            ¿Tienes algo que <br/><span className="text-brand-primary">ya no usas?</span>
          </h2>
          <p className="text-xl text-slate-400 mb-10 max-w-xl mx-auto">
            Únete a la comunidad de vecinos que intercambian de todo: ropa, libros, muebles, tecnología y más.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button 
              onClick={() => router.push('/create')}
              className="w-full sm:w-auto px-8 py-4 bg-brand-primary hover:bg-brand-dark text-white text-lg font-bold rounded-xl transition-all hover:scale-105 shadow-xl shadow-brand-primary/50"
            >
              Subir mi primer Pack
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-12 text-center text-slate-500 text-sm">
        <p>© 2026 Pack2Pack. Economía Circular Vecinal.</p>
      </footer>

      <style jsx>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animate-fade-in-up {
          animation: fadeInUp 0.8s ease-out forwards;
          opacity: 0;
          transform: translateY(20px);
        }
        .animation-delay-100 { animation-delay: 0.1s; }
        .animation-delay-200 { animation-delay: 0.2s; }
        .animation-delay-300 { animation-delay: 0.3s; }
        
        @keyframes fadeInUp {
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  )
}
