'use client'

import { useState, useTransition, useMemo, useRef } from 'react'
import { FACIAL_MARKS } from '@/lib/tcm-deep-questions'
import { ElementType, FACIAL_ZONES, FacialZone } from '@/lib/tcm-data'
import { Button } from '@/components/ui/button'
import { Check, ArrowRight, Loader2, ArrowUp } from 'lucide-react'
import dynamic from 'next/dynamic'
// Import dinâmico para isolar os chunks do Next.js e Webpack
const DeepQuestionsFlow = dynamic(() => import('@/components/mapa/deep-questions-flow').then(mod => mod.DeepQuestionsFlow), {
    loading: () => <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 text-primary animate-spin" /></div>
})
import { saveFacialMarks } from './actions'
import { cn } from '@/lib/utils'

interface ExpressionsSelectorBProps {
    dominantElement: ElementType
    gender?: 'Feminino' | 'Masculino'
}

// Map SVG Zones to String Locations from FACIAL_MARKS
const ZONE_LOCATION_MAP: Record<string, string[]> = {
    'testa_centro': ['Testa', 'Geral'],
    'testa_laterais': ['Testa', 'Geral'],
    'sobrancelhas': ['Sobrancelha', 'Olhos', 'Geral'],
    'ponto_figado': ['Sobrancelha', 'Geral'],
    'temporas': ['Olhos', 'Face Lateral', 'Geral'],
    'olheiras': ['Olhos', 'Bochechas', 'Geral'],
    'bochechas_superiores': ['Bochechas', 'Nariz', 'Geral'],
    'hormonal': ['Nariz', 'Lábios', 'Queixo', 'Geral'],
    'bochechas_inferiores': ['Bochechas', 'Geral'],
    'pescoco': ['Face Lateral', 'Geral']
};

export function ExpressionsSelectorB({ dominantElement, gender = 'Feminino' }: ExpressionsSelectorBProps) {
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
    const [step, setStep] = useState<'SELECTION' | 'SAVING' | 'DEEP_QUESTIONS'>('SELECTION')
    const [isPending, startTransition] = useTransition()
    const [activeZoneId, setActiveZoneId] = useState<string | null>(null) // State for interactive map
    const optionsRef = useRef<HTMLDivElement>(null)
    const mapRef = useRef<HTMLDivElement>(null)

    const handleZoneClick = (zoneId: string) => {
        const isZoneActive = activeZoneId === zoneId;
        setActiveZoneId(isZoneActive ? null : zoneId);

        if (!isZoneActive) {
            // No mobile, após selecionar a zona, a página rola suavemente para as opções
            setTimeout(() => {
                optionsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 100);
        }
    }

    const handleBackToMap = () => {
        mapRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    const toggleMark = (id: string) => {
        const newSet = new Set(selectedIds)
        if (newSet.has(id)) {
            newSet.delete(id)
        } else {
            newSet.add(id)
        }
        setSelectedIds(newSet)
    }

    const handleSaveMarks = () => {
        if (selectedIds.size === 0) return

        setStep('SAVING')
        startTransition(async () => {
            try {
                await saveFacialMarks(Array.from(selectedIds))
                setStep('DEEP_QUESTIONS')
            } catch (error) {
                console.error(error)
                setStep('SELECTION')
            }
        })
    }

    const filteredMarks = useMemo(() => {
        if (!activeZoneId) return FACIAL_MARKS; // Show all if no zone selected
        const allowedLocations = ZONE_LOCATION_MAP[activeZoneId] || ['Geral'];
        return FACIAL_MARKS.filter(mark => allowedLocations.includes(mark.location));
    }, [activeZoneId]);

    if (step === 'DEEP_QUESTIONS') {
        const selectedNames = Array.from(selectedIds).map(id => FACIAL_MARKS.find(m => m.id === id)?.name || '')
        return <DeepQuestionsFlow dominantElement={dominantElement} selectedMarks={selectedNames} />
    }

    return (
        <div className="space-y-10 pb-20 max-w-6xl mx-auto">

            <div className="flex flex-col lg:flex-row gap-12 items-start">

                {/* SVG Interactive Map (Left Panel) */}
                <div ref={mapRef} className="w-full lg:w-1/3 shrink-0 sticky top-24 pt-4 lg:pt-0">
                    <div className="glass rounded-[2rem] p-6 lg:p-8 space-y-6 text-center shadow-xl border-white/50 bg-white/40">
                        <div className="space-y-2">
                            <h2 className="font-serif text-2xl text-foreground">Toque onde você nota marcas</h2>
                            <p className="text-sm text-foreground/60 leading-relaxed">
                                Clique na região do rosto abaixo para filtrar a lista de marcas emocionais correspondentes.
                            </p>
                        </div>

                        <div className="relative w-full max-w-[280px] mx-auto aspect-[3/4]">
                            <svg viewBox="0 0 300 400" className="w-full h-full drop-shadow-xl overflow-visible" xmlns="http://www.w3.org/2000/svg">
                                <defs>
                                    <clipPath id="face-clip-b">
                                        <rect x="0" y="0" width="300" height="400" rx="150" ry="200" />
                                    </clipPath>
                                    <filter id="glow">
                                        <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                                        <feMerge>
                                            <feMergeNode in="coloredBlur" />
                                            <feMergeNode in="SourceGraphic" />
                                        </feMerge>
                                    </filter>
                                </defs>

                                <image
                                    href={gender === 'Masculino' ? '/images/rosto_masculino.png' : '/images/rosto_feminino.png'}
                                    x="0" y="0" width="300" height="400"
                                    preserveAspectRatio="xMidYMid slice"
                                    clipPath="url(#face-clip-b)"
                                    className="opacity-90"
                                />

                                {FACIAL_ZONES.map((zone) => {
                                    const isZoneActive = activeZoneId === zone.id;
                                    // Check if user has selected any marks in this zone's allowed locations
                                    const allowedLocs = ZONE_LOCATION_MAP[zone.id] || [];
                                    const hasSelectedMarksInZone = Array.from(selectedIds).some(id => {
                                        const mark = FACIAL_MARKS.find(m => m.id === id);
                                        return mark && allowedLocs.includes(mark.location) && mark.location !== 'Geral';
                                    });

                                    return (
                                        <path
                                            key={zone.id}
                                            d={zone.svgPath}
                                            onClick={() => handleZoneClick(zone.id)}
                                            className={cn(
                                                "cursor-pointer transition-all duration-300 outline-none hover:fill-primary/40",
                                                isZoneActive ? "fill-primary/60" :
                                                    hasSelectedMarksInZone ? "fill-primary/30" : "fill-transparent"
                                            )}
                                        />
                                    )
                                })}
                            </svg>
                        </div>

                        {activeZoneId && (
                            <Button variant="ghost" className="text-sm rounded-full text-foreground/60" onClick={() => setActiveZoneId(null)}>
                                Limpar filtro anatômico
                            </Button>
                        )}
                    </div>
                </div>

                {/* Expressions List (Right Panel) */}
                <div ref={optionsRef} className="flex-1 w-full space-y-6 scroll-mt-24">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-4">
                        <div className="flex items-center justify-between sm:justify-start gap-4">
                            <h3 className="text-xl font-serif text-foreground/80">
                                {activeZoneId ? `Repercussões na área: ${FACIAL_ZONES.find(z => z.id === activeZoneId)?.name.split(' ')[0]}` : 'Todas as Marcas'}
                            </h3>
                            <span className="text-sm font-medium px-3 py-1 bg-primary/10 text-primary rounded-full shrink-0">
                                {filteredMarks.length} opções
                            </span>
                        </div>

                        {/* Botão Retorno Flow (Apenas exibido quando um filtro está ativo) */}
                        {activeZoneId && (
                            <Button
                                variant="outline"
                                size="sm"
                                className="lg:hidden rounded-full border-primary/20 text-primary hover:bg-primary/5 gap-2 self-start"
                                onClick={handleBackToMap}
                            >
                                <ArrowUp size={14} />
                                Voltar ao Mapa
                            </Button>
                        )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {filteredMarks.map(mark => {
                            const isSelected = selectedIds.has(mark.id)
                            return (
                                <div
                                    key={mark.id}
                                    onClick={() => toggleMark(mark.id)}
                                    className={`p-5 rounded-2xl cursor-pointer border-2 transition-all duration-300 relative overflow-hidden group ${isSelected
                                        ? 'bg-primary/5 border-primary shadow-md scale-[1.02]'
                                        : 'bg-white/60 border-white/50 hover:bg-white/90 hover:border-primary/30 hover:shadow-lg'
                                        }`}
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <h3 className={`font-serif text-md leading-tight pr-6 ${isSelected ? 'text-primary' : 'text-foreground/80'}`}>
                                            {mark.name}
                                        </h3>
                                        <div className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 transition-colors ${isSelected ? 'bg-primary border-primary text-white' : 'border-foreground/20 text-transparent group-hover:border-primary/50'}`}>
                                            <Check size={12} strokeWidth={3} />
                                        </div>
                                    </div>
                                    <p className="text-xs text-foreground/60 leading-relaxed mb-3">
                                        {mark.meaning}
                                    </p>
                                    <div className="text-[10px] uppercase tracking-wider text-foreground/40 font-bold bg-foreground/5 inline-block px-2 py-1 rounded-sm">
                                        {mark.location}
                                    </div>
                                </div>
                            )
                        })}
                    </div>

                    {filteredMarks.length === 0 && (
                        <div className="text-center py-12 p-6 glass rounded-[2rem]">
                            <p className="text-foreground/50">Nenhuma marca específica catalogada apenas para esta área.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Bottom Bar */}
            <div className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-[#F9F6F1] via-[#F9F6F1] to-transparent z-50 pointer-events-none">
                <div className="max-w-4xl mx-auto flex justify-end pointer-events-auto">
                    <Button
                        onClick={handleSaveMarks}
                        disabled={selectedIds.size === 0 || step === 'SAVING' || isPending}
                        className="h-14 px-8 rounded-full shadow-2xl shadow-primary/20 text-lg group bg-primary hover:bg-primary/90 transition-all font-medium"
                    >
                        {step === 'SAVING' || isPending ? (
                            <>
                                <Loader2 className="w-5 h-5 mr-3 animate-spin" />
                                Registrando
                            </>
                        ) : (
                            <>
                                Continuar ({selectedIds.size} selecionadas)
                                <ArrowRight className="w-5 h-5 ml-3 group-hover:translate-x-1 transition-transform" />
                            </>
                        )}
                    </Button>
                </div>
            </div>
        </div>
    )
}
