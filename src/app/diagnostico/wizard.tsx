'use client'

import { useState, useTransition } from 'react'
import { getTcmQuestions, ELEMENTS, ElementType } from '@/lib/tcm-data'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card'
import { saveDiagnosis } from './actions'
import { useRouter } from 'next/navigation'

interface DiagnosisWizardProps {
    userGender?: string
}

export function DiagnosisWizard({ userGender = 'Feminino' }: DiagnosisWizardProps) {
    const router = useRouter()
    const questions = getTcmQuestions(userGender)
    const [currentStep, setCurrentStep] = useState(0)
    const [answers, setAnswers] = useState<Record<string, number>>({}) // element -> score
    const [showResult, setShowResult] = useState(false)
    const [resultElement, setResultElement] = useState<ElementType | null>(null)
    const [isPending, startTransition] = useTransition()

    const progress = ((currentStep) / questions.length) * 100

    const handleAnswer = (yes: boolean) => {
        const question = questions[currentStep]

        if (yes) {
            setAnswers(prev => ({
                ...prev,
                [question.element]: (prev[question.element] || 0) + 1
            }))
        }

        if (currentStep < questions.length - 1) {
            setCurrentStep(prev => prev + 1)
        } else {
            finishDiagnosis()
        }
    }

    const finishDiagnosis = () => {
        // Calculate dominant
        let maxScore = -1
        let dominant: ElementType | null = null

        // We iterate strictly over known elements to avoid "undefined" keys
        Object.keys(ELEMENTS).forEach((key) => {
            const el = key as ElementType
            const score = answers[el] || 0
            if (score > maxScore) {
                maxScore = score
                dominant = el
            }
        })

        // Fallback if no yes answers (though unlikely in TCM context, usually something dominates)
        // Default to 'Terra' (middle) if 0, or just take the mapped one.
        const finalDominant = dominant || 'Terra'

        setResultElement(finalDominant)
        setShowResult(true)

        // Save to server
        startTransition(async () => {
            await saveDiagnosis(finalDominant)
        })
    }

    if (showResult && resultElement) {
        const info = ELEMENTS[resultElement]
        return (
            <div className="max-w-2xl mx-auto space-y-10 animate-in fade-in zoom-in-95 duration-500">
                <Card className="glass border-white/40 shadow-2xl rounded-[3rem] overflow-hidden">
                    <div className="relative p-12 text-center space-y-8">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-wellness-sage/10 text-wellness-sage text-xs font-bold uppercase tracking-[0.2em]">
                            Sua Essência Revelada
                        </div>

                        <div className="space-y-4">
                            <h2 className="text-7xl font-serif text-foreground/90 leading-tight">
                                {resultElement}
                            </h2>
                            <p className="text-2xl text-wellness-gold font-serif italic">
                                {info.emotion}
                            </p>
                        </div>

                        <div className="max-w-md mx-auto aspect-square rounded-full bg-wellness-sage/5 flex items-center justify-center relative">
                            <div className="absolute inset-0 rounded-full border border-wellness-sage/10 animate-spin-slow" />
                            <p className="text-lg text-foreground/70 leading-relaxed px-8">
                                "{info.description}"
                            </p>
                        </div>

                        <div className="grid grid-cols-2 gap-6 pt-10 border-t border-foreground/5">
                            <div className="space-y-1">
                                <p className="text-[10px] uppercase tracking-widest text-foreground/40 font-bold">Órgãos Chave</p>
                                <p className="font-serif text-lg text-foreground/80">{info.organ}</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-[10px] uppercase tracking-widest text-foreground/40 font-bold">Foco Mental</p>
                                <p className="font-serif text-lg text-foreground/80">{info.emotion.split('/')[0]}</p>
                            </div>
                        </div>

                        <Button onClick={() => router.push('/')} className="w-full h-16 rounded-[2rem] bg-wellness-sage hover:bg-primary transition-all text-xl shadow-xl shadow-wellness-sage/20">
                            Começar minha Jornada
                        </Button>
                    </div>
                </Card>
            </div>
        )
    }

    const question = questions[currentStep]

    return (
        <div className="max-w-2xl mx-auto space-y-12">
            <div className="space-y-4 px-4">
                <div className="flex justify-between items-end">
                    <div className="space-y-1">
                        <p className="text-[10px] uppercase tracking-widest text-foreground/40 font-bold">Progresso</p>
                        <p className="text-xl font-serif text-primary">{currentStep + 1} <span className="text-sm text-foreground/30">de {questions.length}</span></p>
                    </div>
                    <span className="text-xs font-bold text-foreground/20">{Math.round(progress)}%</span>
                </div>
                <div className="h-1.5 w-full bg-foreground/5 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-primary transition-all duration-500 ease-out"
                        style={{ width: `${progress}%` }}
                    />
                </div>
            </div>

            <div key={currentStep} className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <Card className="glass border-white/20 shadow-2xl rounded-[3rem] p-12 md:p-16 min-h-[400px] flex flex-col justify-between">
                    <CardHeader className="p-0 text-center">
                        <CardTitle className="text-3xl md:text-4xl font-serif leading-tight text-foreground/90 italic">
                            "{question.text}"
                        </CardTitle>
                    </CardHeader>

                    <CardFooter className="p-0 pt-16 flex flex-col sm:flex-row gap-6">
                        <Button
                            variant="outline"
                            className="w-full h-18 py-6 rounded-2xl text-lg uppercase tracking-widest font-bold border-foreground/10 hover:bg-foreground/5 hover:text-foreground text-foreground/40 transition-all border-2"
                            onClick={() => handleAnswer(false)}
                        >
                            Não se aplica
                        </Button>
                        <Button
                            className="w-full h-18 py-6 rounded-2xl text-lg uppercase tracking-widest font-bold bg-wellness-sage hover:bg-wellness-sage/90 shadow-xl shadow-wellness-sage/20 transition-all active:scale-95"
                            onClick={() => handleAnswer(true)}
                        >
                            Faz sentido
                        </Button>
                    </CardFooter>
                </Card>
            </div>
        </div>
    )
}
