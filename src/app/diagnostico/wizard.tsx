'use client'

import { useEffect, useMemo, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import {
    calculateMainDiagnosis,
    calculateTiebreak,
    TIEBREAK_QUESTIONS,
    type MainDiagnosis,
    type TiebreakResult,
} from '@/lib/diagnosis'
import { ELEMENTS, getTcmQuestions, type ElementType } from '@/lib/tcm-data'
import { completeDiagnosis, saveDiagnosisProgress, startDiagnosisAssessment } from './actions'

type Stage = 'main' | 'tiebreak' | 'comparison' | 'reflection' | 'result'
type FinalDiagnosis = MainDiagnosis | TiebreakResult

interface DiagnosisWizardProps {
    userGender?: string
    initialFacialZoneIds?: string[]
    invalidFacialZoneIds?: boolean
    resumeAssessment?: {
        id: string
        facialZoneIds: string[]
        questionAnswers: Record<string, boolean>
        tiebreakAnswers: Record<string, number>
        reflectionAnswers: Record<string, string>
    }
}

const FREQUENCY_OPTIONS = [
    { value: 0, label: 'Raramente' },
    { value: 1, label: 'Às vezes' },
    { value: 2, label: 'Frequentemente' },
    { value: 3, label: 'Quase todos os dias' },
] as const

function elementInfo(elements: readonly ElementType[]) {
    return elements.map((element) => ELEMENTS[element])
}

export function DiagnosisWizard({ userGender = 'Feminino', initialFacialZoneIds = [], invalidFacialZoneIds = false, resumeAssessment }: DiagnosisWizardProps) {
    const router = useRouter()
    const questions = useMemo(() => getTcmQuestions(userGender), [userGender])
    const [stage, setStage] = useState<Stage>('main')
    const [currentStep, setCurrentStep] = useState(Object.keys(resumeAssessment?.questionAnswers || {}).length)
    const [assessmentId, setAssessmentId] = useState<string | null>(resumeAssessment?.id || null)
    const [answers, setAnswers] = useState<Record<string, boolean>>(resumeAssessment?.questionAnswers || {})
    const [mainDiagnosis, setMainDiagnosis] = useState<MainDiagnosis | null>(null)
    const [tiebreakAnswers, setTiebreakAnswers] = useState<Partial<Record<ElementType, number>>>(resumeAssessment?.tiebreakAnswers || {})
    const [tiebreakIndex, setTiebreakIndex] = useState(Object.keys(resumeAssessment?.tiebreakAnswers || {}).length)
    const [tiebreakDiagnosis, setTiebreakDiagnosis] = useState<TiebreakResult | null>(null)
    const [comparisonChoice, setComparisonChoice] = useState<ElementType | 'none' | undefined>()
    const [finalDiagnosis, setFinalDiagnosis] = useState<FinalDiagnosis | null>(null)
    const [reflectionAnswers, setReflectionAnswers] = useState<Record<number, string>>(() => Object.fromEntries(
        Object.entries(resumeAssessment?.reflectionAnswers || {}).map(([key, value]) => [Number(key), value]),
    ))
    const [error, setError] = useState<string | null>(null)
    const [isPending, startTransition] = useTransition()
    const [, startDraftTransition] = useTransition()

    const tiedElements = mainDiagnosis?.kind === 'tie' ? mainDiagnosis.elements : []
    const facialZoneIdsForSubmission = resumeAssessment?.facialZoneIds || initialFacialZoneIds

    useEffect(() => {
        if (resumeAssessment || assessmentId) return
        let cancelled = false
        startDraftTransition(async () => {
            try {
                const result = await startDiagnosisAssessment({ facialZoneIds: initialFacialZoneIds })
                if (cancelled) return
                if (result.success && result.assessmentId) setAssessmentId(result.assessmentId)
                else if (!result.success) setError(result.error || 'Não foi possível iniciar esta leitura.')
            } catch (startError) {
                if (!cancelled) {
                    console.error('Diagnosis draft creation failed:', startError)
                    setError('Não foi possível iniciar esta leitura. Suas respostas ainda podem ser preenchidas localmente.')
                }
            }
        })
        return () => { cancelled = true }
    }, [assessmentId, initialFacialZoneIds, resumeAssessment])

    useEffect(() => {
        if (!resumeAssessment || mainDiagnosis) return
        const resumedMain = calculateMainDiagnosis(resumeAssessment.questionAnswers, questions)
        setMainDiagnosis(resumedMain)
        if (Object.keys(resumeAssessment.questionAnswers).length < questions.length) return
        if (resumedMain.kind !== 'tie') {
            setFinalDiagnosis(resumedMain)
            setStage('reflection')
            return
        }
        const resumedTiebreak = calculateTiebreak(resumedMain.elements, resumeAssessment.tiebreakAnswers)
        setTiebreakDiagnosis(resumedTiebreak)
        if (Object.keys(resumeAssessment.tiebreakAnswers).length < resumedMain.elements.length) {
            setStage('tiebreak')
            setTiebreakIndex(Object.keys(resumeAssessment.tiebreakAnswers).length)
        } else if (resumedTiebreak.kind === 'tie') {
            setStage('comparison')
        } else {
            setFinalDiagnosis(resumedTiebreak)
            setStage('reflection')
        }
    }, [mainDiagnosis, questions, resumeAssessment])

    const persistProgress = (nextAnswers: Record<string, boolean>, nextTiebreakAnswers = tiebreakAnswers) => {
        if (!assessmentId) return
        void saveDiagnosisProgress({
            assessmentId,
            questionAnswers: nextAnswers,
            tiebreakAnswers: nextTiebreakAnswers,
            reflectionAnswers: Object.fromEntries(Object.entries(reflectionAnswers).filter(([, answer]) => answer.trim().length > 0)),
        }).then((result) => {
            if (!result.success) setError(result.error || 'Não foi possível salvar o progresso.')
        }).catch((progressError) => {
            console.error('Diagnosis progress save failed:', progressError)
            setError('Não foi possível salvar o progresso. Tente novamente.')
        })
    }

    const moveToReflection = (diagnosis: FinalDiagnosis) => {
        setFinalDiagnosis(diagnosis)
        setStage('reflection')
        setError(null)
    }

    const handleMainAnswer = (yes: boolean) => {
        const question = questions[currentStep]
        const nextAnswers = { ...answers, [question.id]: yes }
        setAnswers(nextAnswers)
        persistProgress(nextAnswers)

        if (currentStep < questions.length - 1) {
            setCurrentStep((step) => step + 1)
            return
        }

        const diagnosis = calculateMainDiagnosis(nextAnswers, questions)
        setMainDiagnosis(diagnosis)

        if (diagnosis.kind === 'tie') {
            setTiebreakIndex(0)
            setStage('tiebreak')
        } else {
            moveToReflection(diagnosis)
        }
    }

    const handleTiebreakAnswer = (score: number) => {
        if (!mainDiagnosis || mainDiagnosis.kind !== 'tie') return

        const element = tiedElements[tiebreakIndex]
        const nextAnswers = { ...tiebreakAnswers, [element]: score }
        setTiebreakAnswers(nextAnswers)
        persistProgress(answers, nextAnswers)

        if (tiebreakIndex < tiedElements.length - 1) {
            setTiebreakIndex((index) => index + 1)
            return
        }

        const diagnosis = calculateTiebreak(tiedElements, nextAnswers)
        setTiebreakDiagnosis(diagnosis)
        if (diagnosis.kind === 'tie') {
            setStage('comparison')
        } else {
            moveToReflection(diagnosis)
        }
    }

    const handleComparison = (choice: ElementType | 'none') => {
        if (!mainDiagnosis || mainDiagnosis.kind !== 'tie') return
        const diagnosis = calculateTiebreak(tiedElements, tiebreakAnswers, choice)
        setComparisonChoice(choice)
        setTiebreakDiagnosis(diagnosis)
        moveToReflection(diagnosis)
    }

    const finishDiagnosis = () => {
        if (!finalDiagnosis || isPending) return

        setError(null)
        startTransition(async () => {
            try {
                const result = await completeDiagnosis({
                    assessmentId,
                    facialZoneIds: facialZoneIdsForSubmission,
                    questionAnswers: answers,
                    tiebreakAnswers,
                    comparisonChoice,
                    reflectionAnswers: Object.fromEntries(
                        Object.entries(reflectionAnswers).filter(([, answer]) => answer.trim().length > 0),
                    ),
                })

                if (!result.success) {
                    setError(result.error || 'Não foi possível salvar sua leitura.')
                    return
                }

                setStage('result')
            } catch (submissionError) {
                console.error('Diagnosis submission failed:', submissionError)
                setError('Não foi possível salvar sua leitura. Tente novamente.')
            }
        })
    }

    if (stage === 'result' && finalDiagnosis) {
        if (finalDiagnosis.kind === 'insufficient') {
            return (
                <Card className="glass border-white/40 shadow-2xl rounded-[3rem] overflow-hidden">
                    <div className="p-12 text-center space-y-8">
                        <p className="text-xs uppercase tracking-[0.2em] font-bold text-wellness-sage">Leitura concluída</p>
                        <h2 className="text-4xl font-serif text-foreground/90">Nenhum padrão em destaque agora</h2>
                        <p className="text-lg text-foreground/60 leading-relaxed max-w-lg mx-auto">
                            Suas respostas não apontaram um padrão predominante neste momento. Isso pode mudar conforme seu contexto e suas experiências.
                        </p>
                        <Button onClick={() => router.push('/o-mapa-da-raiz')} className="h-14 px-8 rounded-2xl bg-wellness-sage text-white">
                            Voltar ao Mapa da Raiz
                        </Button>
                    </div>
                </Card>
            )
        }

        const infos = elementInfo(finalDiagnosis.elements)
        const combined = finalDiagnosis.kind === 'combined'

        return (
            <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in zoom-in-95 duration-500">
                <Card className="glass border-white/40 shadow-2xl rounded-[3rem] overflow-hidden">
                    <div className="p-10 md:p-12 text-center space-y-8">
                        <p className="text-xs uppercase tracking-[0.2em] font-bold text-wellness-sage">
                            {combined ? 'Padrões em destaque' : 'Elemento em destaque'}
                        </p>
                        <div className={`grid gap-6 ${infos.length > 1 ? 'md:grid-cols-2' : ''}`}>
                            {infos.map((info) => (
                                <div key={info.name} className="space-y-4 rounded-3xl bg-white/30 p-6">
                                    <h2 className="text-5xl font-serif text-foreground/90">{info.name}</h2>
                                    <p className="text-xl text-wellness-gold font-serif italic">{info.emotion}</p>
                                    <p className="text-base text-foreground/65 leading-relaxed">{info.description}</p>
                                    <p className="text-sm text-foreground/50">{info.organ}</p>
                                </div>
                            ))}
                        </div>
                        <p className="text-sm text-foreground/50 max-w-xl mx-auto">
                            Esta é uma leitura educativa de tendências para autoconhecimento; não substitui avaliação ou acompanhamento profissional.
                        </p>
                        <Button onClick={() => router.push('/o-mapa-da-raiz')} className="h-14 px-8 rounded-2xl bg-wellness-sage text-white">
                            Ir para O Mapa da Raiz
                        </Button>
                    </div>
                </Card>
            </div>
        )
    }

    if (stage === 'reflection' && finalDiagnosis) {
        const infos = elementInfo(finalDiagnosis.elements)
        return (
            <div className="max-w-2xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <Card className="glass border-white/20 shadow-2xl rounded-[3rem] overflow-hidden">
                    <CardHeader className="text-center pt-12 pb-6">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-wellness-sage/10 text-wellness-sage text-xs font-bold uppercase tracking-[0.2em] mb-4 mx-auto">
                            Reflexão opcional
                        </div>
                        <CardTitle className="text-3xl font-serif text-foreground/90">
                            O que você percebe neste padrão?
                        </CardTitle>
                        <CardDescription className="text-lg text-foreground/60 mt-4 max-w-md mx-auto">
                            Escreva livremente. Suas reflexões ficam associadas a esta leitura.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="px-10 pb-8 space-y-6">
                        {infos.length > 0 ? infos.flatMap((info) => info.reflectionQuestions.map((question) => ({ info: info.name, question }))).map(({ info, question }, index) => (
                            <div key={`${info}-${index}`} className="bg-white/40 p-5 rounded-2xl border border-white/50 space-y-4 shadow-sm">
                                <p className="text-foreground/80 font-medium italic text-center text-lg">&ldquo;{question}&rdquo;</p>
                                <Textarea
                                    placeholder="Sua reflexão (opcional)..."
                                    value={reflectionAnswers[index] || ''}
                                    onChange={(event) => setReflectionAnswers((previous) => ({ ...previous, [index]: event.target.value }))}
                                    className="min-h-[100px] resize-none bg-white/50 border-white/60 focus:bg-white transition-colors text-foreground/80"
                                />
                            </div>
                        )) : (
                            <p className="text-center text-foreground/60">Você pode concluir esta leitura sem uma reflexão adicional.</p>
                        )}
                        <p className="text-xs text-center text-foreground/40 mt-8 max-w-sm mx-auto font-medium">
                            Esta ferramenta apoia o autoconhecimento e não substitui avaliação médica ou psicológica.
                        </p>
                        {error && <p role="alert" className="text-sm text-red-700 text-center">{error}</p>}
                    </CardContent>
                    <CardFooter className="pb-12 px-10">
                        <Button
                            onClick={finishDiagnosis}
                            className="w-full h-16 rounded-[2rem] bg-wellness-sage hover:bg-wellness-sage/90 text-white transition-all text-xl shadow-xl shadow-wellness-sage/20 font-serif"
                            disabled={isPending}
                        >
                            {isPending ? 'Salvando...' : 'Concluir minha leitura'}
                        </Button>
                    </CardFooter>
                </Card>
            </div>
        )
    }

    if (stage === 'comparison' && tiebreakDiagnosis) {
        return (
            <Card className="max-w-2xl mx-auto glass border-white/20 shadow-2xl rounded-[3rem] p-10 md:p-14 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <CardHeader className="p-0 text-center space-y-4">
                    <p className="text-xs uppercase tracking-[0.2em] font-bold text-wellness-sage">Última pergunta de desempate</p>
                    <CardTitle className="text-3xl md:text-4xl font-serif leading-tight text-foreground/90 italic">
                        Qual desses padrões mais interferiu na sua rotina nos últimos 30 dias?
                    </CardTitle>
                    <CardDescription className="text-base text-foreground/60">Escolha um ou reconheça que eles ainda estão misturados.</CardDescription>
                </CardHeader>
                <CardFooter className="p-0 pt-10 flex flex-col gap-4">
                    {tiebreakDiagnosis.elements.map((element) => (
                        <Button key={element} variant="outline" className="w-full min-h-14 rounded-2xl text-lg border-foreground/10" onClick={() => handleComparison(element)}>
                            {element}
                        </Button>
                    ))}
                    <Button variant="ghost" className="w-full min-h-14 rounded-2xl text-base text-foreground/60" onClick={() => handleComparison('none')}>
                        Não consigo separar esses padrões
                    </Button>
                </CardFooter>
            </Card>
        )
    }

    if (stage === 'tiebreak' && mainDiagnosis?.kind === 'tie') {
        const element = tiedElements[tiebreakIndex]
        const question = TIEBREAK_QUESTIONS[element]
        return (
            <Card className="max-w-2xl mx-auto glass border-white/20 shadow-2xl rounded-[3rem] p-10 md:p-14 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <CardHeader className="p-0 text-center space-y-5">
                    <p className="text-xs uppercase tracking-[0.2em] font-bold text-wellness-sage">Vamos entender qual padrão está mais presente agora</p>
                    <p className="text-sm text-foreground/50">Pergunta {tiebreakIndex + 1} de {tiedElements.length}</p>
                    <CardTitle className="text-3xl md:text-4xl font-serif leading-tight text-foreground/90 italic">&quot;{question.text}&quot;</CardTitle>
                </CardHeader>
                <CardFooter className="p-0 pt-10 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {FREQUENCY_OPTIONS.map((option) => (
                        <Button key={option.value} variant="outline" className="w-full min-h-14 rounded-2xl text-base border-foreground/10" onClick={() => handleTiebreakAnswer(option.value)}>
                            {option.label}
                        </Button>
                    ))}
                </CardFooter>
            </Card>
        )
    }

    const question = questions[currentStep]
    const progress = ((currentStep) / questions.length) * 100

    return (
        <div className="max-w-2xl mx-auto space-y-12">
            {invalidFacialZoneIds && (
                <p role="alert" className="text-sm text-amber-800 bg-amber-50 border border-amber-200 rounded-2xl px-5 py-4 text-center">
                    Algumas zonas recebidas pelo link não foram reconhecidas e foram descartadas. Você pode continuar a leitura sem elas.
                </p>
            )}
            <div className="space-y-4 px-4">
                <div className="flex justify-between items-end">
                    <div className="space-y-1">
                        <p className="text-[10px] uppercase tracking-widest text-foreground/40 font-bold">Progresso</p>
                        <p className="text-xl font-serif text-primary">{currentStep + 1} <span className="text-sm text-foreground/30">de {questions.length}</span></p>
                    </div>
                    <span className="text-xs font-bold text-foreground/20">{Math.round(progress)}%</span>
                </div>
                <div className="h-1.5 w-full bg-foreground/5 rounded-full overflow-hidden">
                    <div className="h-full bg-primary transition-all duration-500 ease-out" style={{ width: `${progress}%` }} />
                </div>
            </div>

            <div key={currentStep} className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <Card className="glass border-white/20 shadow-2xl rounded-[3rem] p-12 md:p-16 min-h-[400px] flex flex-col justify-between">
                    <CardHeader className="p-0 text-center">
                        <CardTitle className="text-3xl md:text-4xl font-serif leading-tight text-foreground/90 italic">&quot;{question.text}&quot;</CardTitle>
                    </CardHeader>
                    <CardFooter className="p-0 pt-16 flex flex-col sm:flex-row gap-6">
                        <Button variant="outline" className="w-full py-6 rounded-2xl text-lg uppercase tracking-widest font-bold border-foreground/10 hover:bg-foreground/5 text-foreground/40 transition-all border-2" onClick={() => handleMainAnswer(false)}>
                            Não se aplica
                        </Button>
                        <Button className="w-full py-6 rounded-2xl text-lg uppercase tracking-widest font-bold bg-wellness-sage hover:bg-wellness-sage/90 shadow-xl shadow-wellness-sage/20 transition-all active:scale-95" onClick={() => handleMainAnswer(true)}>
                            Faz sentido
                        </Button>
                    </CardFooter>
                </Card>
            </div>
        </div>
    )
}
