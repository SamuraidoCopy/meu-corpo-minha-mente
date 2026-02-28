'use client'

import { useState, useTransition } from 'react'
import { getTcmQuestions, ELEMENTS, ElementType } from '@/lib/tcm-data'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { saveDiagnosis } from './actions'
import { useRouter } from 'next/navigation'

interface DiagnosisWizardProps {
    userGender?: string
    initialElement?: ElementType
    hasCompletedInitialDiagnosis?: boolean
}

export function DiagnosisWizard({ userGender = 'Feminino', initialElement, hasCompletedInitialDiagnosis = false }: DiagnosisWizardProps) {
    const router = useRouter()
    const shouldSkipQuestions = !!initialElement && hasCompletedInitialDiagnosis;
    const questions = getTcmQuestions(userGender)
    const [currentStep, setCurrentStep] = useState(0)
    const [answers, setAnswers] = useState<Record<string, number>>({}) // element -> score
    const [showResult, setShowResult] = useState(false)
    const [showReflection, setShowReflection] = useState(shouldSkipQuestions)
    const [resultElement, setResultElement] = useState<ElementType | null>(shouldSkipQuestions ? initialElement : null)
    const [reflectionAnswers, setReflectionAnswers] = useState<Record<number, string>>({})
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
        setShowReflection(true)

        // Save to server (if bypassing reflection? No, reflection is next)
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
                                &quot;{info.description}&quot;
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

                        <div className="space-y-4 pt-4 border-t border-foreground/5">
                            <h3 className="text-xl font-serif text-foreground/80 italic mb-6">Você já fez o seu Check-in Diário hoje?</h3>
                            <div className="flex flex-col sm:flex-row gap-4">
                                <Button onClick={() => router.push('/')} variant="outline" className="w-full h-16 rounded-[2rem] text-lg font-medium border-wellness-sage text-wellness-sage hover:bg-wellness-sage/10 transition-all border-2">
                                    Sim, já fiz
                                </Button>
                                <Button onClick={() => router.push('/diario')} className="w-full h-16 rounded-[2rem] bg-wellness-sage hover:bg-primary text-white transition-all text-lg shadow-xl shadow-wellness-sage/20 font-medium">
                                    Não, ir para o Check-in
                                </Button>
                            </div>
                        </div>
                    </div>
                </Card>
            </div>
        )
    }

    if (showReflection && resultElement) {
        const info = ELEMENTS[resultElement]
        return (
            <div className="max-w-2xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <Card className="glass border-white/20 shadow-2xl rounded-[3rem] overflow-hidden">
                    <CardHeader className="text-center pt-12 pb-6">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-wellness-sage/10 text-wellness-sage text-xs font-bold uppercase tracking-[0.2em] mb-4 mx-auto">
                            Reflexão Profunda
                        </div>
                        <CardTitle className="text-3xl font-serif text-foreground/90">
                            Padrão {resultElement} Identificado
                        </CardTitle>
                        <CardDescription className="text-lg text-foreground/60 mt-4 max-w-md mx-auto">
                            Antes de ver o seu resultado completo, reserve um momento para refletir sobre estas questões:
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="px-10 pb-8 space-y-6">
                        <div className="space-y-4">
                            {info.reflectionQuestions.map((q, i) => (
                                <div key={i} className="bg-white/40 p-5 rounded-2xl border border-white/50 space-y-4 shadow-sm">
                                    <p className="text-foreground/80 font-medium italic text-center text-lg">
                                        &ldquo;{q}&rdquo;
                                    </p>
                                    <Textarea
                                        placeholder="Suas reflexões sobre essa questão (opcional)..."
                                        value={reflectionAnswers[i] || ''}
                                        onChange={(e) => setReflectionAnswers(prev => ({ ...prev, [i]: e.target.value }))}
                                        className="min-h-[100px] resize-none bg-white/50 border-white/60 focus:bg-white transition-colors text-foreground/80"
                                    />
                                </div>
                            ))}
                        </div>
                        <p className="text-xs text-center text-foreground/40 mt-8 max-w-sm mx-auto font-medium">
                            Aviso de Apoio: Esta é uma ferramenta de autoconhecimento e não substitui avaliação ou acompanhamento profissional (médico/psicológico).
                        </p>
                    </CardContent>
                    <CardFooter className="pb-12 px-10">
                        <Button
                            onClick={() => {
                                setShowReflection(false);
                                setShowResult(true);

                                const answersPayload = info.reflectionQuestions.map((question, i) => ({
                                    question,
                                    answer: reflectionAnswers[i] || ''
                                })).filter(a => a.answer.trim() !== '')

                                startTransition(async () => {
                                    await saveDiagnosis(resultElement, answersPayload.length > 0 ? answersPayload : undefined)
                                })
                            }}
                            className="w-full h-16 rounded-[2rem] bg-wellness-sage hover:bg-wellness-sage/90 text-white transition-all text-xl shadow-xl shadow-wellness-sage/20 font-serif"
                            disabled={isPending}
                        >
                            {isPending ? 'Salvando...' : 'Ver Minha Essência Revelada'}
                        </Button>
                    </CardFooter>
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
                            &quot;{question.text}&quot;
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
