'use client'

import { useActionState, useState } from 'react'
import { saveDiaryEntry } from './actions'
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

const MOODS = [
    'Radiante',
    'Feliz',
    'Calma',
    'Neutra',
    'Cansada',
    'Irritada',
    'Ansiosa',
    'Triste',
]

const initialState = {
    message: '',
    success: false
}

export function DiaryForm() {
    const [state, formAction, isPending] = useActionState(saveDiaryEntry, initialState)

    // Local state for sliders to show values
    const [energy, setEnergy] = useState([3])
    const [sleep, setSleep] = useState([3])

    return (
        <form action={formAction} className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">

            <div className="space-y-4">
                <Label className="text-lg font-medium">Como está sua energia hoje? (1-5)</Label>
                <div className="flex items-center gap-4">
                    <span className="text-2xl font-bold w-8 text-center">{energy[0]}</span>
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
                <Label className="text-lg font-medium">Qualidade do sono (1-5)</Label>
                <div className="flex items-center gap-4">
                    <span className="text-2xl font-bold w-8 text-center">{sleep[0]}</span>
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

            <div className="space-y-2">
                <Label htmlFor="mood" className="text-lg font-medium">Emoção Predominante</Label>
                <Select name="mood" required>
                    <SelectTrigger>
                        <SelectValue placeholder="Selecione..." />
                    </SelectTrigger>
                    <SelectContent>
                        {MOODS.map(mood => (
                            <SelectItem key={mood} value={mood}>{mood}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <div className="space-y-2">
                <Label htmlFor="symptoms" className="text-lg font-medium">Sintomas Físicos</Label>
                <Textarea
                    id="symptoms"
                    name="symptoms"
                    placeholder="Ex: Dor de cabeça, inchaço, tensão nos ombros..."
                    className="min-h-[80px]"
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="notes" className="text-lg font-medium">Notas do Dia</Label>
                <Textarea
                    id="notes"
                    name="notes"
                    placeholder="Algum evento importante? Algo que queira registrar?"
                    className="min-h-[100px]"
                />
            </div>

            <input type="hidden" name="date" value={new Date().toISOString().split('T')[0]} />

            {state?.message && (
                <p className={`text-sm font-medium ${state.success ? 'text-green-600' : 'text-red-500'}`}>
                    {state.message}
                </p>
            )}

            <Button className="w-full h-12 text-lg" type="submit" disabled={isPending}>
                {isPending ? 'Salvando...' : 'Registrar Check-in'}
            </Button>
        </form>
    )
}
