'use client'

import { useActionState } from 'react'
import { completeOnboarding } from './actions'
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"

const initialState = {
    message: '',
}

export function OnboardingForm() {
    const [state, formAction, isPending] = useActionState(completeOnboarding, initialState)

    return (
        <form action={formAction} className="grid gap-6">
            <div className="grid gap-2">
                <Label htmlFor="fullName">Nome Completo</Label>
                <Input id="fullName" name="fullName" placeholder="Como gostaria de ser chamada?" required />
            </div>

            <div className="grid gap-2">
                <Label htmlFor="age">Idade</Label>
                <Input id="age" name="age" type="number" min="10" max="100" placeholder="Sua idade" required />
            </div>

            <div className="grid gap-2">
                <Label htmlFor="history">Breve Histórico</Label>
                <Textarea
                    id="history"
                    name="history"
                    placeholder="Conte brevemente o que te trouxe aqui (sintomas, dores, objetivos)..."
                    className="min-h-[100px]"
                />
            </div>

            {state?.message && <p className="text-sm text-red-500">{state.message}</p>}

            <Button className="w-full" type="submit" disabled={isPending}>
                {isPending ? 'Salvando...' : 'Começar minha jornada'}
            </Button>
        </form>
    )
}
