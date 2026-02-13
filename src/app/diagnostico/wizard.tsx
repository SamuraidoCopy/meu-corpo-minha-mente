'use client'

import { useState, useTransition } from 'react'
import { TCM_QUESTIONS, ELEMENTS, ElementType } from '@/lib/tcm-data'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card'
import { saveDiagnosis } from './actions'
import { useRouter } from 'next/navigation'

export function DiagnosisWizard() {
    const router = useRouter()
    const [currentStep, setCurrentStep] = useState(0)
    const [answers, setAnswers] = useState<Record<string, number>>({}) // element -> score
    const [showResult, setShowResult] = useState(false)
    const [resultElement, setResultElement] = useState<ElementType | null>(null)
    const [isPending, startTransition] = useTransition()

    const progress = ((currentStep) / TCM_QUESTIONS.length) * 100

    const handleAnswer = (yes: boolean) => {
        const question = TCM_QUESTIONS[currentStep]

        if (yes) {
            setAnswers(prev => ({
                ...prev,
                [question.element]: (prev[question.element] || 0) + 1
            }))
        }

        if (currentStep < TCM_QUESTIONS.length - 1) {
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
            <div className="max-w-md mx-auto space-y-6 animate-in fade-in duration-700">
                <Card className="border-2 border-primary/20 shadow-xl">
                    <CardHeader className={`${info.color} text-white rounded-t-xl`}>
                        <CardTitle className="text-3xl text-center">Seu Elemento: {resultElement}</CardTitle>
                        <CardDescription className="text-white/80 text-center text-lg">
                            {info.emotion}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-8 space-y-4">
                        <p className="text-lg text-center leading-relaxed">
                            {info.description}
                        </p>
                        <div className="bg-zinc-100 dark:bg-zinc-800 p-4 rounded-lg">
                            <h4 className="font-bold text-sm uppercase mb-2">Órgãos Associados</h4>
                            <p>{info.organ}</p>
                        </div>
                    </CardContent>
                    <CardFooter className="flex flex-col gap-3">
                        <Button onClick={() => router.push('/')} className="w-full" size="lg">
                            Voltar ao Início
                        </Button>
                        <p className="text-xs text-center text-muted-foreground">
                            Resultado salvo no seu perfil.
                        </p>
                    </CardFooter>
                </Card>
            </div>
        )
    }

    const question = TCM_QUESTIONS[currentStep]

    return (
        <div className="max-w-xl mx-auto space-y-8">
            <div className="space-y-2">
                <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Questão {currentStep + 1} de {TCM_QUESTIONS.length}</span>
                    <span>{Math.round(progress)}%</span>
                </div>
                <Progress value={progress} className="h-2" />
            </div>

            <Card className="min-h-[300px] flex flex-col justify-between shadow-lg">
                <CardHeader>
                    <CardTitle className="text-xl md:text-2xl font-medium leading-relaxed text-center">
                        "{question.text}"
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {/* Add an illustration here later? */}
                </CardContent>
                <CardFooter className="flex flex-col sm:flex-row gap-4 pt-4">
                    <Button
                        variant="outline"
                        className="w-full sm:w-1/2 h-14 text-lg hover:bg-red-50 hover:text-red-600 hover:border-red-200"
                        onClick={() => handleAnswer(false)}
                    >
                        Não
                    </Button>
                    <Button
                        className="w-full sm:w-1/2 h-14 text-lg bg-emerald-600 hover:bg-emerald-700"
                        onClick={() => handleAnswer(true)}
                    >
                        Sim
                    </Button>
                </CardFooter>
            </Card>
        </div>
    )
}
