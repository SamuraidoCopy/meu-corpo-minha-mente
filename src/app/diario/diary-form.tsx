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

const getMoods = (gender: string) => [
    'Radiante',
    'Feliz',
    `Calm${gender === 'Masculino' ? 'o' : 'a'}`,
    `Neutr${gender === 'Masculino' ? 'o' : 'a'}`,
    `Cansad${gender === 'Masculino' ? 'o' : 'a'}`,
    `Irritad${gender === 'Masculino' ? 'o' : 'a'}`,
    `Ansios${gender === 'Masculino' ? 'o' : 'a'}`,
    'Triste',
]

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
                    <div className="flex items-center gap-6 px-4 py-6 rounded-2xl bg-foreground/5 border border-foreground/5">
                        <span className="text-4xl font-serif text-primary w-8 text-center">{energy[0]}</span>
                        <Slider
                            name="energy"
                            min={1}
                            max={5}
                            step={1}
                            value={energy}
                            onValueChange={setEnergy}
                            className="flex-1"
                        />
                    </div>
                    <input type="hidden" name="energy" value={energy[0]} />
                </div>

                <div className="space-y-4">
                    <Label className="text-xs uppercase tracking-[0.2em] font-bold text-foreground/40 italic">Qualidade do Sono</Label>
                    <div className="flex items-center gap-6 px-4 py-6 rounded-2xl bg-foreground/5 border border-foreground/5">
                        <span className="text-4xl font-serif text-wellness-gold w-8 text-center">{sleep[0]}</span>
                        <Slider
                            name="sleep"
                            min={1}
                            max={5}
                            step={1}
                            value={sleep}
                            onValueChange={setSleep}
                            className="flex-1"
                        />
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

            <div className="space-y-4">
                <Label htmlFor="did_breathing_exercise" className="text-xs uppercase tracking-[0.2em] font-bold text-foreground/40 italic ml-1">Exercício de Respiração</Label>
                <Select name="did_breathing_exercise" defaultValue="false">
                    <SelectTrigger className="h-14 rounded-2xl border-foreground/10 bg-white/50 focus:ring-primary/20">
                        <SelectValue placeholder="Você praticou a respiração guiada hoje?" />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl border-foreground/5 shadow-2xl">
                        <SelectItem value="true" className="py-3 rounded-lg focus:bg-primary/10">Sim, eu pratiquei</SelectItem>
                        <SelectItem value="false" className="py-3 rounded-lg focus:bg-primary/10">Não pratiquei hoje</SelectItem>
                    </SelectContent>
                </Select>

                <details className="group border border-foreground/10 rounded-2xl bg-white/30 overflow-hidden">
                    <summary className="cursor-pointer p-4 font-medium text-sm text-foreground/70 outline-none flex justify-between items-center group-open:bg-foreground/5 transition-colors">
                        Como realizar o exercício "Respirar no Órgão"? (Guia de Primeiro Passo)
                        <span className="transition-transform group-open:rotate-180">↓</span>
                    </summary>
                    <div className="p-4 pt-2 text-sm text-foreground/60 space-y-3 bg-white/50">
                        <p><strong>1. Identifique seu órgão alvo:</strong> Fígado (Raiva), Coração (Ansiedade), Estômago (Preocupação), Pulmão (Tristeza), Rins (Medo).</p>
                        <p><strong>2. Posição:</strong> Sente-se confortavelmente e coloque as mãos sobre a região do órgão.</p>
                        <p><strong>3. Respire com intenção (Ritmo 4-4-6):</strong><br />
                            - INSPIRE contando até 4<br />
                            - SEGURE a respiração contando até 4<br />
                            - EXPIRE contando até 6</p>
                        <p><strong>4. Visualize:</strong> Imagine que o ar desce até o órgão, levando luz, calor e cura.</p>
                        <p><strong>5. Repetições:</strong> Faça 5 ciclos completos de respiração.</p>
                    </div>
                </details>
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
