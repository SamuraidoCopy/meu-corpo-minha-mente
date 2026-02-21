'use client'

import { useActionState, useState, startTransition } from 'react'
import { completeOnboarding } from './actions'
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { SafeSpaceTransition } from "@/components/onboarding/safe-space-transition"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const initialState = {
    message: '',
}

export function OnboardingForm() {
    const [state, formAction, isPending] = useActionState(completeOnboarding, initialState)
    const [showTransition, setShowTransition] = useState(false)
    const [formData, setFormData] = useState<FormData | null>(null)

    const handleSubmit = (payload: FormData) => {
        setFormData(payload)
        setShowTransition(true)
    }

    const handleTransitionComplete = () => {
        if (formData) {
            startTransition(() => {
                formAction(formData)
            })
        }
    }

    // If there's an error message, we must allow the user to see the form again
    if (state?.message && showTransition && !isPending) {
        setShowTransition(false)
    }

    if (showTransition) {
        const selectedGender = formData?.get('gender')?.toString() || 'Feminino'
        return <SafeSpaceTransition onComplete={handleTransitionComplete} isProcessing={isPending} userGender={selectedGender} />
    }

    return (
        <form action={handleSubmit} className="grid gap-6">
            <div className="grid gap-2">
                <Label htmlFor="fullName" className="text-xs uppercase tracking-widest text-foreground/50 font-medium ml-1">
                    Nome Completo
                </Label>
                <Input
                    id="fullName"
                    name="fullName"
                    placeholder="Como gostaria de ser chamado(a)?"
                    required
                    className="bg-white/50 border-white/30 focus:border-wellness-sage/50 focus:ring-4 focus:ring-wellness-sage/10 transition-all rounded-xl h-14 text-lg"
                />
            </div>

            <div className="grid gap-2">
                <Label htmlFor="gender" className="text-xs uppercase tracking-widest text-foreground/50 font-medium ml-1">
                    Como você se identifica?
                </Label>
                <Select name="gender" required>
                    <SelectTrigger className="h-14 rounded-xl bg-white/50 border-white/30 focus:border-wellness-sage/50 focus:ring-4 focus:ring-wellness-sage/10 transition-all text-lg">
                        <SelectValue placeholder="Selecione..." />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl border-white/30 bg-white/90 shadow-2xl">
                        <SelectItem value="Feminino" className="py-3 focus:bg-wellness-sage/10">Feminino</SelectItem>
                        <SelectItem value="Masculino" className="py-3 focus:bg-wellness-sage/10">Masculino</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <div className="grid gap-2">
                <Label htmlFor="age" className="text-xs uppercase tracking-widest text-foreground/50 font-medium ml-1">
                    Idade
                </Label>
                <Input
                    id="age"
                    name="age"
                    type="number"
                    min="10"
                    max="100"
                    placeholder="Sua idade"
                    required
                    className="bg-white/50 border-white/30 focus:border-wellness-sage/50 focus:ring-4 focus:ring-wellness-sage/10 transition-all rounded-xl h-14 text-lg"
                />
            </div>

            <div className="grid gap-2">
                <Label htmlFor="history" className="text-xs uppercase tracking-widest text-foreground/50 font-medium ml-1">
                    Breve Histórico
                </Label>
                <Textarea
                    id="history"
                    name="history"
                    placeholder="Conte brevemente o que te trouxe aqui (sintomas, dores, objetivos)..."
                    className="min-h-[120px] bg-white/50 border-white/30 focus:border-wellness-sage/50 focus:ring-4 focus:ring-wellness-sage/10 transition-all rounded-xl resize-none p-4 text-base"
                />
            </div>

            {state?.message && <p className="text-sm text-red-500 text-center font-medium">{state.message}</p>}

            <Button className="w-full h-14 rounded-xl bg-wellness-sage hover:bg-wellness-sage/90 text-white shadow-xl shadow-wellness-sage/20 transition-all hover:scale-[1.02] active:scale-[0.98] text-lg tracking-wide" type="submit" disabled={isPending}>
                {isPending ? 'Entrando...' : 'Entrar no meu refúgio'}
            </Button>
        </form>
    )
}
