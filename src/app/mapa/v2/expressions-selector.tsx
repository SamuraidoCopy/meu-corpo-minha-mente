'use client'

import { useState, useTransition } from 'react'
import { FACIAL_MARKS } from '@/lib/tcm-deep-questions'
import { ElementType } from '@/lib/tcm-data'
import { Button } from '@/components/ui/button'
import { Check, ArrowRight, Loader2 } from 'lucide-react'
import { DeepQuestionsFlow } from '@/components/mapa/deep-questions-flow'
import { saveFacialMarks } from './actions'

interface ExpressionsSelectorProps {
    dominantElement: ElementType
}

export function ExpressionsSelector({ dominantElement }: ExpressionsSelectorProps) {
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
    const [step, setStep] = useState<'SELECTION' | 'SAVING' | 'DEEP_QUESTIONS'>('SELECTION')
    const [isPending, startTransition] = useTransition()

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

    if (step === 'DEEP_QUESTIONS') {
        const selectedNames = Array.from(selectedIds).map(id => FACIAL_MARKS.find(m => m.id === id)?.name || '')
        return <DeepQuestionsFlow dominantElement={dominantElement} selectedMarks={selectedNames} />
    }

    return (
        <div className="space-y-10 pb-20">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {FACIAL_MARKS.map(mark => {
                    const isSelected = selectedIds.has(mark.id)
                    return (
                        <div
                            key={mark.id}
                            onClick={() => toggleMark(mark.id)}
                            className={`p-6 rounded-2xl cursor-pointer border-2 transition-all duration-300 relative overflow-hidden group ${isSelected
                                ? 'bg-primary/5 border-primary shadow-md scale-[1.02]'
                                : 'bg-white/50 border-white/40 hover:bg-white/80 hover:border-primary/30 hover:shadow-lg'
                                }`}
                        >
                            <div className="flex justify-between items-start mb-3">
                                <h3 className={`font-serif text-lg leading-tight pr-8 ${isSelected ? 'text-primary' : 'text-foreground/80'}`}>
                                    {mark.name}
                                </h3>
                                <div className={`w-6 h-6 rounded-full border flex items-center justify-center shrink-0 transition-colors ${isSelected ? 'bg-primary border-primary text-white' : 'border-foreground/20 text-transparent group-hover:border-primary/50'}`}>
                                    <Check size={14} strokeWidth={3} />
                                </div>
                            </div>
                            <p className="text-sm text-foreground/60 leading-relaxed">
                                {mark.meaning}
                            </p>
                            <div className="mt-4 pt-4 border-t border-foreground/5 text-xs uppercase tracking-widest text-foreground/40 font-medium">
                                LOCAL: {mark.location}
                            </div>
                        </div>
                    )
                })}
            </div>

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
