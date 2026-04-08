'use client'

import { useState } from 'react'
import Link from 'next/link'
import { FacialMap } from '@/components/facial-map'
import { FACIAL_ZONES, FacialZone, ELEMENTS } from '@/lib/tcm-data'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChevronDown } from 'lucide-react'

export function MapaClient({ gender = 'Feminino' }: { gender?: 'Masculino' | 'Feminino' }) {
    const [selectedZones, setSelectedZones] = useState<FacialZone[]>([])

    const handleToggleZone = (zone: FacialZone) => {
        setSelectedZones(prev => {
            const exists = prev.find(z => z.id === zone.id)
            if (exists) {
                return prev.filter(z => z.id !== zone.id)
            } else {
                return [...prev, zone]
            }
        })
    }

    const dominantElementInfo = (() => {
        if (selectedZones.length === 0) return null;
        const counts = selectedZones.reduce((acc, zone) => {
            acc[zone.element] = (acc[zone.element] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        let dominant = selectedZones[0].element;
        let max = 0;
        for (const [el, count] of Object.entries(counts)) {
            if (count > max) {
                max = count;
                dominant = el as keyof typeof ELEMENTS;
            }
        }
        return ELEMENTS[dominant];
    })();

    return (
        <main className="flex flex-col lg:flex-row min-h-screen items-center justify-center pt-32 pb-10 px-6 lg:px-20 gap-12 relative overflow-hidden bg-gradient-to-br from-background via-background to-wellness-sage/5">
            <Link href="/o-mapa-da-raiz" className="absolute top-6 left-6 md:top-8 md:left-12 z-50">
                <img
                    src="/images/logo-mapa-raiz.png"
                    alt="O Mapa da Raiz"
                    className="h-10 md:h-14 w-auto object-contain opacity-90 drop-shadow-sm hover:opacity-100 transition-opacity"
                />
            </Link>

            <Button variant="ghost" size="icon" className="absolute top-6 right-6 md:top-8 md:right-12 z-50 rounded-full bg-white/50 backdrop-blur-sm border border-white/20 hover:bg-white text-foreground/50 hover:text-foreground shadow-sm" asChild>
                <Link href="/o-mapa-da-raiz">
                    <span className="sr-only">Fechar</span>
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
                </Link>
            </Button>

            {/* Dekorativa elementer */}
            <div
                className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-wellness-sage/10 rounded-full blur-[100px] animate-in fade-in duration-[2000ms]"
            />
            <div
                className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-wellness-gold/10 rounded-full blur-[100px] animate-in fade-in duration-[2000ms] delay-500 fill-mode-backwards"
            />

            {/* Left Column: Interactive Map */}
            <div
                className="flex-[1.2] flex flex-col items-center lg:items-start justify-center z-10 w-full max-w-xl animate-in fade-in slide-in-from-left-10 duration-1000 ease-out"
            >
                <header className="mb-12 text-center lg:text-left w-full">
                    <p
                        className="text-xs uppercase tracking-[0.2em] text-wellness-sage font-bold mb-3 animate-in fade-in slide-in-from-bottom-2 duration-700 delay-200 fill-mode-backwards"
                    >
                        Ferramenta de Autodiagnóstico
                    </p>
                    <h1
                        className="text-5xl lg:text-6xl font-serif text-foreground leading-tight mb-6 animate-in fade-in slide-in-from-bottom-2 duration-700 delay-300 fill-mode-backwards"
                    >
                        Mapa da <span className="italic text-wellness-gold">Raiz</span>
                    </h1>
                    <p
                        className="text-foreground/70 text-lg leading-relaxed max-w-lg mx-auto lg:mx-0 animate-in fade-in slide-in-from-bottom-2 duration-700 delay-400 fill-mode-backwards mb-8"
                    >
                        Seu rosto é um mapa da sua saúde interna. <span className="font-semibold text-primary">Selecione uma ou mais áreas</span> que apresentam sinais (manchas, cor, linhas profundas) para revelar a origem.
                    </p>
                </header>

                <div className="glass rounded-[3rem] shadow-2xl p-8 lg:p-12 border-white/50 bg-white/20 backdrop-blur-md w-full max-w-lg mb-8 relative group cursor-pointer lg:hover:scale-[1.02] transition-transform duration-500 animate-in fade-in zoom-in-95 duration-1000 delay-600 fill-mode-backwards">
                    <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent rounded-[3rem] opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                    <FacialMap
                        onToggleZone={handleToggleZone}
                        selectedZoneIds={selectedZones.map(z => z.id)}
                        gender={gender}
                        className="w-full h-auto drop-shadow-xl"
                    />
                </div>

                {/* Seta Móvel (Visível Apenas no Mobile caso haja áreas selecionadas) */}
                {selectedZones.length > 0 && (
                    <div
                        className="lg:hidden flex flex-col items-center justify-center gap-2 mb-8 text-primary animate-bounce cursor-pointer opacity-90 hover:opacity-100 transition-opacity"
                        onClick={() => document.getElementById('info-panel')?.scrollIntoView({ behavior: 'smooth' })}
                    >
                        <span className="text-[10px] uppercase font-bold tracking-widest bg-primary/10 text-primary px-4 py-1.5 rounded-full border border-primary/20">Deslize para o Diagnóstico</span>
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                            <ChevronDown size={18} strokeWidth={2.5} />
                        </div>
                    </div>
                )}

                <div className="animate-in fade-in duration-700 delay-700 fill-mode-backwards">
                    <Button variant="ghost" className="text-foreground/50 hover:text-foreground/80 hover:bg-transparent -ml-4 gap-2 group" asChild>
                        <Link href="/o-mapa-da-raiz">
                            <span className="group-hover:-translate-x-1 transition-transform">←</span> Voltar ao Início
                        </Link>
                    </Button>
                </div>
            </div>

            {/* Right Column: Info Panel */}
            <div
                id="info-panel"
                className="flex-1 w-full max-w-md min-h-[500px] flex items-center justify-center z-10 relative scroll-mt-24"
            >
                {dominantElementInfo ? (
                    <div
                        key={dominantElementInfo.name}
                        className="w-full animate-in fade-in slide-in-from-right-10 zoom-in-95 duration-500"
                    >
                        <Card className="glass border-white/40 shadow-2xl rounded-[2.5rem] overflow-hidden bg-white/60 backdrop-blur-xl">
                            <CardHeader className="text-center pb-8 border-b border-foreground/5 py-10 bg-white/40">
                                <div
                                    className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-wellness-sage/10 text-wellness-sage text-[10px] font-bold uppercase tracking-widest mb-6 mx-auto animate-in zoom-in spin-in-180 duration-500"
                                >
                                    Padrão Predominante ({selectedZones.length} região(ões))
                                </div>
                                <CardTitle className="text-4xl font-serif mb-3 text-foreground">Elemento {dominantElementInfo.name}</CardTitle>
                                <div className="flex items-center justify-center gap-2 text-sm uppercase tracking-wide font-medium text-wellness-gold">
                                    <span>{dominantElementInfo.organ}</span>
                                    <span className="w-1 h-1 rounded-full bg-wellness-gold" />
                                    <span>{dominantElementInfo.emotion}</span>
                                </div>
                            </CardHeader>
                            <CardContent className="pt-10 space-y-8 px-8 pb-10">
                                <div className="space-y-4">
                                    <h4 className="text-[10px] uppercase tracking-[0.2em] text-foreground/40 font-bold">Zonas Selecionadas</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {selectedZones.map(zone => (
                                            <span key={zone.id} className="text-xs px-3 py-1 rounded-full bg-primary/10 text-primary font-medium hover:bg-primary/20 transition-colors cursor-default" title={zone.description}>
                                                {zone.name}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                <div className="bg-wellness-sage/5 p-6 rounded-2xl border border-wellness-sage/10 space-y-3">
                                    <h4 className="text-[10px] uppercase tracking-[0.2em] text-wellness-sage font-bold flex items-center gap-2">
                                        <span className="w-1.5 h-1.5 rounded-full bg-wellness-sage" />
                                        Interpretação
                                    </h4>
                                    <p className="text-sm text-foreground/70 leading-relaxed pl-3.5 border-l-2 border-wellness-sage/20">
                                        <strong>{dominantElementInfo.name}</strong>. {dominantElementInfo.description}
                                    </p>
                                </div>

                                <Button className="w-full h-14 rounded-2xl bg-wellness-sage hover:bg-wellness-sage/90 text-white shadow-lg shadow-wellness-sage/25 text-lg font-medium tracking-wide transition-all hover:translate-y-[-2px] active:translate-y-[1px]" asChild>
                                    <Link href={`/diagnostico?element=${dominantElementInfo.name}`}>Investigar Raiz Profundamente</Link>
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                ) : (
                    <div
                        className="text-center space-y-6 p-12 border-2 border-dashed border-foreground/10 rounded-[3rem] w-full animate-in fade-in duration-500"
                    >
                        <span className="text-7xl block mb-6 animate-pulse opacity-20 filter grayscale">👆</span>
                        <div className="space-y-2">
                            <h3 className="text-2xl font-serif text-foreground/40 italic">Inicie sua análise</h3>
                            <p className="text-foreground/30 text-sm max-w-[200px] mx-auto leading-relaxed">
                                Selecione uma ou mais regiões no mapa facial para descobrir as conexões com sua saúde interna.
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </main>
    )
}

