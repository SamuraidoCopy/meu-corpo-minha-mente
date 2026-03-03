'use client'

import { useState, useTransition } from 'react'
import { ElementType } from '@/lib/tcm-data'
import { DEEP_QUESTIONS } from '@/lib/tcm-deep-questions'
import { saveDeepReflections } from '@/app/mapa/v2/actions'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { ArrowLeft, ArrowRight, Check, Loader2, Sparkles } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface DeepQuestionsFlowProps {
    dominantElement: ElementType
    selectedMarks: string[]
}

export function DeepQuestionsFlow({ dominantElement, selectedMarks }: DeepQuestionsFlowProps) {
    const questions = DEEP_QUESTIONS[dominantElement] || DEEP_QUESTIONS['Água']
    const [step, setStep] = useState(0) // 0 to questions.length - 1
    const [answers, setAnswers] = useState<string[]>(new Array(questions.length).fill(''))
    const [isPending, startTransition] = useTransition()
    const router = useRouter()
    const [isFinished, setIsFinished] = useState(false)

    const [hasCheckedInToday, setHasCheckedInToday] = useState(false)

    const isLastStep = step === questions.length - 1
    const canContinue = answers[step].trim().length > 5

    const handleNext = () => {
        if (!isLastStep) {
            setStep(s => s + 1)
        } else {
            handleComplete()
        }
    }

    const handlePrev = () => {
        if (step > 0) setStep(s => s - 1)
    }

    const handleChange = (val: string) => {
        const newAnswers = [...answers]
        newAnswers[step] = val
        setAnswers(newAnswers)
    }

    const handleComplete = () => {
        // Prepare dictionary for DB
        const answersDict = questions.reduce((acc, q, idx) => {
            acc[q] = answers[idx]
            return acc
        }, {} as Record<string, string>)

        startTransition(async () => {
            try {
                const result = await saveDeepReflections(dominantElement, answersDict)
                if (result.success) {
                    setHasCheckedInToday(result.hasCheckedInToday ?? false)
                    setIsFinished(true)
                } else {
                    console.error('Validation/DB error:', result.error)
                }
            } catch (error) {
                console.error(error)
            }
        })
    }

    if (isFinished) {
        return (
            <div className="flex flex-col items-center justify-center space-y-8 animate-in zoom-in-95 duration-700 py-16">
                <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center text-primary shadow-2xl relative">
                    <div className="absolute inset-0 border-4 border-primary rounded-full animate-ping opacity-20" />
                    <Sparkles size={40} className="animate-pulse" />
                </div>
                <div className="text-center space-y-4 max-w-2xl">
                    <h2 className="text-4xl font-serif text-foreground/90">A Cura Vem da Aceitação</h2>
                    <p className="text-lg text-foreground/60 leading-relaxed">
                        Suas respostas foram guardadas no seu refúgio com segurança. Olhar de frente para suas marcas de expressão e para suas dores raízes é o primeiro passo para a recomposição do seu Elemento.
                    </p>
                    {!hasCheckedInToday && (
                        <p className="text-md text-primary font-medium mt-4">
                            Notamos que você ainda não registrou seu diário de sintomas hoje.
                        </p>
                    )}
                </div>
                <Button
                    onClick={() => router.push(hasCheckedInToday ? '/' : '/diario')}
                    className="h-14 px-10 rounded-full bg-primary hover:bg-primary/90 text-lg shadow-xl shrink-0 mt-8 transition-transform hover:scale-105 active:scale-95"
                >
                    {hasCheckedInToday ? 'Voltar para o Início' : 'Fazer Check-in Diário'}
                </Button>
            </div>
        )
    }

    const currentQuestion = questions[step]
    const progress = ((step + 1) / questions.length) * 100

    return (
        <div className="space-y-12 animate-in slide-in-from-right-16 fade-in duration-500">
            {/* Header / Intro */}
            <div className="glass rounded-[2rem] p-10 md:p-14 relative overflow-hidden text-center max-w-3xl mx-auto space-y-6">
                <div className="absolute top-0 inset-x-0 h-1 bg-primary/20">
                    <div className="h-full bg-primary transition-all duration-500" style={{ width: `${progress}%` }} />
                </div>

                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider bg-primary/10 text-primary">
                    Análise Profunda &middot; Elemento {dominantElement}
                </div>

                <h2 className="text-3xl md:text-5xl font-serif text-foreground/90 leading-tight">
                    {currentQuestion}
                </h2>

                <p className="text-foreground/50 italic max-w-xl mx-auto pt-6 text-sm">
                    {step === 0 && `Nós notamos que você marcou: ${selectedMarks.slice(0, 2).join(', ')}${selectedMarks.length > 2 ? ' e outras' : ''}. `}
                    Escreva sem amarras. Ninguém além de você lerá isso.
                </p>
            </div>

            {/* Answer Box */}
            <div className="max-w-3xl mx-auto space-y-8 relative">
                <Textarea
                    value={answers[step]}
                    onChange={(e) => handleChange(e.target.value)}
                    placeholder="Sua resposta vem direto de dentro..."
                    className="min-h-[220px] text-lg md:text-xl p-8 rounded-3xl glass resize-none focus:ring-4 focus:ring-primary/20 bg-white/70 border-white/40 placeholder:text-foreground/30 shadow-2xl transition-all"
                />

                {/* Controls */}
                <div className="flex items-center justify-between">
                    <Button
                        variant="ghost"
                        onClick={handlePrev}
                        disabled={step === 0 || isPending}
                        className="text-foreground/50 hover:text-foreground/80 h-12 px-6 rounded-full"
                    >
                        <ArrowLeft className="w-5 h-5 mr-2" />
                        Anterior
                    </Button>

                    <Button
                        onClick={handleNext}
                        disabled={!canContinue || isPending}
                        className={`h-14 px-8 rounded-full shadow-2xl shadow-primary/20 text-lg transition-all ${isLastStep ? 'bg-wellness-sage hover:bg-wellness-sage/90 text-white' : 'bg-primary hover:bg-primary/90'}`}
                    >
                        {isPending ? (
                            <Loader2 className="w-5 h-5 animate-spin mr-2" />
                        ) : isLastStep ? (
                            <>
                                Finalizar Reflexão
                                <Check className="w-5 h-5 ml-3" />
                            </>
                        ) : (
                            <>
                                Próxima Pergunta
                                <ArrowRight className="w-5 h-5 ml-3" />
                            </>
                        )}
                    </Button>
                </div>
            </div>
        </div>
    )
}
