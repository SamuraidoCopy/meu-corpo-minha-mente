'use client'

import { useActionState, useState } from 'react'
import { saveDiaryEntry } from './actions'
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale/pt-BR"
import { BreathingGuide } from "@/components/breathing-guide"

const getMoods = (gender: string) => {
    const isM = gender === 'Masculino'
    return [
        'Radiante',
        'Feliz',
        isM ? 'Calmo' : 'Calma',
        isM ? 'Neutro' : 'Neutra',
        isM ? 'Cansado' : 'Cansada',
        isM ? 'Irritado' : 'Irritada',
        isM ? 'Ansioso' : 'Ansiosa',
        'Triste',
        isM ? 'Frustrado' : 'Frustrada',
        isM ? 'Inseguro' : 'Insegura',
        'Com Medo'
    ]
}

const initialState = {
    message: '',
    success: false
}

interface DiaryFormProps {
    userGender?: string
}

export function DiaryForm({ userGender = 'Feminino' }: DiaryFormProps) {
    const [state, formAction, isPending] = useActionState(saveDiaryEntry, initialState)
    const activeMoods = getMoods(userGender)

    // Local state for sliders to show values
    const [energy, setEnergy] = useState([3])
    const [sleep, setSleep] = useState([3])

    return (
        <form action={formAction} className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="space-y-6">
                <div className="space-y-4">
                    <Label className="text-xs uppercase tracking-[0.2em] font-bold text-foreground/40 italic">Nível de Energia</Label>
                    <div className="flex items-center justify-between px-4 py-6 rounded-2xl bg-foreground/5 border border-foreground/5 overflow-x-auto gap-2">
                        {[
                            { val: 1, emoji: '😫', label: 'Muito Baixa' },
                            { val: 2, emoji: '🙁', label: 'Baixa' },
                            { val: 3, emoji: '😐', label: 'Média' },
                            { val: 4, emoji: '🙂', label: 'Boa' },
                            { val: 5, emoji: '🤩', label: 'Excelente' }
                        ].map(({ val, emoji, label }) => (
                            <button
                                key={val}
                                type="button"
                                onClick={() => setEnergy([val])}
                                title={label}
                                className={`flex flex-col items-center gap-2 transition-all duration-300 hover:scale-110 min-w-[60px] ${energy[0] === val ? 'scale-110 opacity-100 filter drop-shadow-md' : 'opacity-40 grayscale hover:grayscale-0'}`}
                            >
                                <span className="text-4xl md:text-5xl">{emoji}</span>
                                <span className={`text-[10px] font-bold uppercase tracking-wider ${energy[0] === val ? 'text-primary' : 'text-foreground/50'}`}>{label}</span>
                            </button>
                        ))}
                    </div>
                    <input type="hidden" name="energy" value={energy[0]} />
                </div>

                <div className="space-y-4">
                    <Label className="text-xs uppercase tracking-[0.2em] font-bold text-foreground/40 italic">Qualidade do Sono</Label>
                    <div className="flex items-center justify-between px-4 py-6 rounded-2xl bg-foreground/5 border border-foreground/5 overflow-x-auto gap-2">
                        {[
                            { val: 1, emoji: '😫', label: 'Muito Ruim' },
                            { val: 2, emoji: '🙁', label: 'Ruim' },
                            { val: 3, emoji: '😐', label: 'Regular' },
                            { val: 4, emoji: '🙂', label: 'Bom' },
                            { val: 5, emoji: '🤩', label: 'Excelente' }
                        ].map(({ val, emoji, label }) => (
                            <button
                                key={val}
                                type="button"
                                onClick={() => setSleep([val])}
                                title={label}
                                className={`flex flex-col items-center gap-2 transition-all duration-300 hover:scale-110 min-w-[60px] ${sleep[0] === val ? 'scale-110 opacity-100 filter drop-shadow-md' : 'opacity-40 grayscale hover:grayscale-0'}`}
                            >
                                <span className="text-4xl md:text-5xl">{emoji}</span>
                                <span className={`text-[10px] font-bold uppercase tracking-wider ${sleep[0] === val ? 'text-wellness-gold' : 'text-foreground/50'}`}>{label}</span>
                            </button>
                        ))}
                    </div>
                    <input type="hidden" name="sleep" value={sleep[0]} />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                    <Label htmlFor="mood" className="text-xs uppercase tracking-[0.2em] font-bold text-foreground/40 italic ml-1">Emoção Predominante</Label>
                    <Select name="mood" required>
                        <SelectTrigger className="h-14 rounded-2xl border-foreground/10 bg-white/50 focus:ring-primary/20">
                            <SelectValue placeholder="Como se sente?" />
                        </SelectTrigger>
                        <SelectContent className="rounded-2xl border-foreground/5 shadow-2xl">
                            {activeMoods.map(mood => (
                                <SelectItem key={mood} value={mood} className="py-3 rounded-lg focus:bg-primary/10">{mood}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-3">
                    <Label htmlFor="symptoms" className="text-xs uppercase tracking-[0.2em] font-bold text-foreground/40 italic ml-1">Sintomas Físicos</Label>
                    <Textarea
                        id="symptoms"
                        name="symptoms"
                        placeholder="Ex: Tensão nos ombros..."
                        className="min-h-[56px] rounded-2xl border-foreground/10 bg-white/50 focus:ring-primary/20 resize-none pb-4"
                    />
                </div>
            </div>

            <div className="space-y-3">
                <Label className="text-xs uppercase tracking-[0.2em] font-bold text-foreground/40 italic ml-1">Exercício de Respiração</Label>
                <BreathingGuide />
            </div>

            <div className="space-y-3">
                <Label htmlFor="notes" className="text-xs uppercase tracking-[0.2em] font-bold text-foreground/40 italic ml-1">Reflexão do Momento</Label>
                <Textarea
                    id="notes"
                    name="notes"
                    placeholder="O que seu corpo quer dizer hoje?"
                    className="min-h-[120px] rounded-3xl border-foreground/10 bg-white/50 focus:ring-primary/20 p-6"
                />
            </div>

            <input type="hidden" name="date" value={new Date().toISOString().split('T')[0]} />

            {state?.message && (
                <div className={`p-4 rounded-2xl text-sm font-bold uppercase tracking-wider text-center border ${state.success ? 'bg-wellness-sage/10 border-wellness-sage/20 text-wellness-sage' : 'bg-red-50 border-red-100 text-red-500'}`}>
                    {state.message}
                </div>
            )}

            <Button className="w-full h-16 rounded-[2rem] bg-wellness-sage hover:bg-wellness-sage/90 text-white shadow-2xl shadow-wellness-sage/30 text-xl transition-all active:scale-95 disabled:opacity-50" type="submit" disabled={isPending}>
                {isPending ? 'Sintonizando...' : 'Registrar no Diário'}
            </Button>
        </form>
    )
}
