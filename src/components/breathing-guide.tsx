'use client'

import { useState, useEffect, useRef } from 'react'
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger, DrawerFooter, DrawerClose } from "@/components/ui/drawer"
import { Button } from "@/components/ui/button"
import { Check, Wind } from 'lucide-react'

const ORGANS = [
    { id: 'figado', name: 'Fígado', emotion: 'Raiva', colorClass: 'text-emerald-500', bgClass: 'bg-emerald-500', glowClass: 'shadow-emerald-500/50', boxClass: 'bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900 border-emerald-200 dark:border-emerald-800' },
    { id: 'coracao', name: 'Coração', emotion: 'Ansiedade', colorClass: 'text-rose-500', bgClass: 'bg-rose-500', glowClass: 'shadow-rose-500/50', boxClass: 'bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900 border-rose-200 dark:border-rose-800' },
    { id: 'estomago', name: 'Estômago', emotion: 'Preocupação', colorClass: 'text-amber-500', bgClass: 'bg-amber-500', glowClass: 'shadow-amber-500/50', boxClass: 'bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100 dark:hover:bg-amber-900 border-amber-200 dark:border-amber-800' },
    { id: 'pulmao', name: 'Pulmão', emotion: 'Tristeza', colorClass: 'text-zinc-500', bgClass: 'bg-zinc-500', glowClass: 'shadow-zinc-500/50', boxClass: 'bg-zinc-50 dark:bg-zinc-950/40 hover:bg-zinc-100 dark:hover:bg-zinc-900 border-zinc-200 dark:border-zinc-800' },
    { id: 'rins', name: 'Rins', emotion: 'Medo', colorClass: 'text-blue-500', bgClass: 'bg-blue-500', glowClass: 'shadow-blue-500/50', boxClass: 'bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100 dark:hover:bg-blue-900 border-blue-200 dark:border-blue-800' },
]

type Phase = 'idle' | 'inspire' | 'hold' | 'expire' | 'done'

export function BreathingGuide({ onCompleteAction }: { onCompleteAction?: () => void }) {
    const [isOpen, setIsOpen] = useState(false)
    const [selectedOrgan, setSelectedOrgan] = useState<typeof ORGANS[0] | null>(null)

    const [phase, setPhase] = useState<Phase>('idle')
    const [cycle, setCycle] = useState(0)
    const totalCycles = 5

    const [timeLeft, setTimeLeft] = useState(0)
    const [isPracticed, setIsPracticed] = useState(false)

    // Reset state when opening/closing
    useEffect(() => {
        if (!isOpen) {
            setTimeout(() => {
                setSelectedOrgan(null)
                setPhase('idle')
                setCycle(0)
            }, 300)
        }
    }, [isOpen])

    // Breathing loop logic
    useEffect(() => {
        if (phase === 'idle' || phase === 'done') return

        let timer: NodeJS.Timeout

        if (phase === 'inspire') {
            setTimeLeft(4)
            timer = setTimeout(() => setPhase('hold'), 4000)
        } else if (phase === 'hold') {
            setTimeLeft(4)
            timer = setTimeout(() => setPhase('expire'), 4000)
        } else if (phase === 'expire') {
            setTimeLeft(6)
            timer = setTimeout(() => {
                if (cycle + 1 >= totalCycles) {
                    setPhase('done')
                } else {
                    setCycle(prev => prev + 1)
                    setPhase('inspire')
                }
            }, 6000)
        }

        return () => clearTimeout(timer)
    }, [phase, cycle])

    // Countdown timer for display
    useEffect(() => {
        if (timeLeft <= 0 || phase === 'idle' || phase === 'done') return
        const interval = setInterval(() => {
            setTimeLeft(prev => Math.max(0, prev - 1))
        }, 1000)
        return () => clearInterval(interval)
    }, [timeLeft, phase])

    const startBreathing = () => {
        setCycle(0)
        setPhase('inspire')
    }

    const handleFinish = () => {
        setIsOpen(false)
        setIsPracticed(true)
        if (onCompleteAction) {
            onCompleteAction()
        }
    }

    // Determine circle CSS based on phase
    let circleTransform = 'scale(1)'
    let circleTransition = 'transition-all ease-in-out'
    let circleDuration = 0

    if (phase === 'inspire') {
        circleTransform = 'scale(1.5)'
        circleTransition = 'transition-transform ease-out'
        circleDuration = 4000
    } else if (phase === 'hold') {
        circleTransform = 'scale(1.5)'
        circleTransition = 'transition-transform'
        circleDuration = 0
    } else if (phase === 'expire') {
        circleTransform = 'scale(0.8)'
        circleTransition = 'transition-transform ease-in-out'
        circleDuration = 6000
    }

    return (
        <Drawer open={isOpen} onOpenChange={setIsOpen}>
            <input type="hidden" name="did_breathing_exercise" value={isPracticed.toString()} />

            <div className="group border border-emerald-500/30 rounded-2xl bg-emerald-500/5 transition-colors p-5 flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 shrink-0 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-600">
                        <Wind size={28} />
                    </div>
                    <div>
                        <h4 className="font-bold text-emerald-800 dark:text-emerald-400 text-base md:text-lg">Imersão de Calibração</h4>
                        <p className="text-xs md:text-sm text-foreground/60 mt-1 max-w-sm">Regule seu sistema nervoso com a técnica 4-4-6 respirando no órgão alvo.</p>
                    </div>
                </div>
                <div className="flex flex-col gap-3 shrink-0 w-full md:w-auto mt-2 md:mt-0">
                    <DrawerTrigger asChild>
                        <Button variant="outline" className="h-12 px-8 rounded-full border-emerald-500/50 text-emerald-600 hover:bg-emerald-500 hover:text-white w-full">
                            Iniciar Prática
                        </Button>
                    </DrawerTrigger>

                    {isPracticed ? (
                        <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-emerald-600 bg-emerald-500/10 py-2 px-4 rounded-full border border-emerald-500/20 animate-in fade-in slide-in-from-bottom-2">
                            <Check size={16} strokeWidth={3} /> Prática Concluída
                        </div>
                    ) : (
                        <button
                            type="button"
                            onClick={() => setIsPracticed(true)}
                            className="text-[11px] text-foreground/40 hover:text-emerald-600 tracking-wider uppercase font-bold transition-colors text-center py-1"
                        >
                            Já Pratiquei Hoje
                        </button>
                    )}
                </div>
            </div>

            <DrawerContent className="h-[90vh] md:h-[600px] bg-background/95 backdrop-blur-2xl border-t border-white/20">
                <div className="w-full max-w-md mx-auto h-full flex flex-col relative">

                    {/* BACKGROUND MESH BASED ON ORGAN */}
                    {selectedOrgan && (
                        <div className={`absolute inset-0 opacity-10 pointer-events-none transition-colors duration-1000 ${selectedOrgan.bgClass}`} style={{ filter: 'blur(100px)' }} />
                    )}

                    <DrawerHeader className="text-center relative z-10">
                        <DrawerTitle className="text-xl font-serif text-foreground/80">Respirar no Órgão</DrawerTitle>
                        <p className="text-sm text-foreground/50">Técnica Terapêutica 4-4-6</p>
                    </DrawerHeader>

                    <div className="flex-1 flex flex-col items-center justify-center px-6 relative z-10">

                        {phase === 'idle' && !selectedOrgan && (
                            <div className="w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <h3 className="text-center text-lg font-medium mb-6 text-foreground/80">Onde você sente sua emoção hoje?</h3>
                                <div className="grid grid-cols-2 gap-3">
                                    {ORGANS.map(organ => (
                                        <button
                                            key={organ.id}
                                            onClick={() => setSelectedOrgan(organ)}
                                            className={`flex flex-col items-center p-4 rounded-2xl border border-${organ.colorClass.split('-')[1]}-200 dark:border-${organ.colorClass.split('-')[1]}-800 transition-all duration-300 hover:scale-105 active:scale-95 bg-${organ.colorClass.split('-')[1]}-50/50 dark:bg-${organ.colorClass.split('-')[1]}-950/30 hover:bg-${organ.colorClass.split('-')[1]}-100 dark:hover:bg-${organ.colorClass.split('-')[1]}-900`}
                                        >
                                            <span className={`text-sm font-bold uppercase tracking-wider ${organ.colorClass}`}>{organ.name}</span>
                                            <span className="text-xs text-foreground/50 mt-1">{organ.emotion}</span>
                                        </button>
                                    ))}
                                    {/* Pular/Não Sei button spanning full width */}
                                    <button
                                        onClick={() => setSelectedOrgan(ORGANS[0])} // Defaults to Fígado as general
                                        className="col-span-2 flex flex-col items-center p-3 rounded-2xl border border-foreground/10 bg-foreground/5 hover:bg-foreground/10 transition-colors"
                                    >
                                        <span className="text-xs font-medium text-foreground/60">Técnica Geral (Foco no Fígado)</span>
                                    </button>
                                </div>
                            </div>
                        )}

                        {phase === 'idle' && selectedOrgan && (
                            <div className="w-full flex flex-col items-center animate-in fade-in zoom-in-95 duration-500">
                                <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-6 ${selectedOrgan.bgClass}/20 ${selectedOrgan.colorClass}`}>
                                    <Wind size={32} />
                                </div>
                                <h3 className="text-2xl font-serif mb-2 text-center text-foreground/90">Curando o {selectedOrgan.name}</h3>
                                <p className="text-center text-sm text-foreground/60 mb-8 max-w-[280px]">
                                    Sente-se confortavelmente e coloque as mãos sobre o seu {selectedOrgan.name.toLowerCase()}. Vamos transmutar a {selectedOrgan.emotion}.
                                </p>
                                <Button
                                    onClick={startBreathing}
                                    className={`h-14 px-8 rounded-full text-white shadow-lg text-lg transition-transform hover:scale-105 ${selectedOrgan.bgClass} ${selectedOrgan.glowClass}`}
                                >
                                    Começar Respiração
                                </Button>
                            </div>
                        )}

                        {(phase === 'inspire' || phase === 'hold' || phase === 'expire') && selectedOrgan && (
                            <div className="w-full flex flex-col items-center justify-center h-full animate-in fade-in duration-1000">
                                <div className="text-sm font-bold uppercase tracking-widest text-foreground/40 mb-12">
                                    Ciclo {cycle + 1} de {totalCycles}
                                </div>

                                <div className="relative w-48 h-48 flex items-center justify-center mb-12">
                                    {/* Outer Breathing Circle */}
                                    <div
                                        className={`absolute inset-0 rounded-full opacity-30 ${selectedOrgan.bgClass} ${circleTransition}`}
                                        style={{ transform: circleTransform, transitionDuration: `${circleDuration}ms` }}
                                    />
                                    {/* Inner glowing circle */}
                                    <div className={`relative z-10 w-32 h-32 rounded-full flex flex-col items-center justify-center shadow-2xl ${selectedOrgan.bgClass} text-white`}>
                                        <span className="text-sm uppercase font-bold tracking-widest opacity-90 drop-shadow-sm">
                                            {phase === 'inspire' && 'Inspire'}
                                            {phase === 'hold' && 'Segure'}
                                            {phase === 'expire' && 'Solte'}
                                        </span>
                                        <span className="text-3xl font-light mt-1 tabular-nums drop-shadow-sm">
                                            {timeLeft}s
                                        </span>
                                    </div>
                                </div>

                                <p className={`text-center transition-opacity duration-500 ${phase === 'inspire' ? 'opacity-100' : 'opacity-40'} ${selectedOrgan.colorClass} font-medium`}>
                                    Mentalize luz entrando no seu {selectedOrgan.name}
                                </p>
                            </div>
                        )}

                        {phase === 'done' && selectedOrgan && (
                            <div className="w-full flex flex-col items-center animate-in fade-in slide-in-from-bottom-4 duration-700">
                                <div className={`w-24 h-24 rounded-full flex items-center justify-center mb-6 bg-emerald-500/20 text-emerald-500 shadow-xl shadow-emerald-500/20`}>
                                    <Check size={48} strokeWidth={3} />
                                </div>
                                <h3 className="text-2xl font-serif mb-2 text-center text-foreground/90">Sessão Concluída</h3>
                                <p className="text-center text-sm text-foreground/60 mb-8 max-w-[280px]">
                                    Como seu corpo se sente agora? Você completou 5 ciclos de cura profunda.
                                </p>
                                <Button
                                    onClick={handleFinish}
                                    className={`h-14 px-8 rounded-full text-white shadow-lg text-lg bg-foreground hover:bg-foreground/90`}
                                >
                                    Voltar ao Diário
                                </Button>
                            </div>
                        )}

                    </div>

                    <DrawerFooter className="relative z-10 pt-2 pb-6">
                        <DrawerClose asChild>
                            <Button variant="ghost" className="rounded-full text-foreground/50">Cancelar Prática</Button>
                        </DrawerClose>
                    </DrawerFooter>
                </div>
            </DrawerContent>
        </Drawer>
    )
}
