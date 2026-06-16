'use client'

import { useActionState } from 'react'
import { login } from './actions'
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

const initialState = {
    message: '',
    success: false,
}

export function LoginForm() {
    const [state, formAction, isPending] = useActionState(login, initialState)

    if (state?.success) {
        return (
            <div className="grid gap-3 text-center animate-in fade-in duration-500">
                <p className="text-3xl">📧</p>
                <p className="text-sm text-foreground/80 font-medium">
                    {state.message}
                </p>
                <p className="text-xs text-foreground/50">
                    Não recebeu? Confira a caixa de spam ou tente novamente em alguns minutos.
                </p>
            </div>
        )
    }

    return (
        <form action={formAction} className="grid gap-6">
            <div className="grid gap-2">
                <Label htmlFor="email" className="text-xs uppercase tracking-widest text-foreground/50 font-medium ml-1">
                    E-mail da sua compra
                </Label>
                <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="seu@email.com"
                    required
                    autoComplete="email"
                    className="bg-white/50 border-white/30 focus:border-wellness-sage/50 focus:ring-wellness-sage/20 transition-all rounded-xl h-12"
                />
            </div>
            {state?.message && !state.success && (
                <p className="text-sm text-red-500 text-center font-medium">{state.message}</p>
            )}
            <Button className="w-full h-12 rounded-xl bg-wellness-sage hover:bg-wellness-sage/90 text-white shadow-lg shadow-wellness-sage/20 transition-all active:scale-[0.98]" type="submit" disabled={isPending}>
                {isPending ? 'Enviando link...' : 'Receber link de acesso'}
            </Button>
            <p className="text-xs text-center text-foreground/50 -mt-2">
                Você receberá um link no seu e-mail para entrar. Sem senha. ✨
            </p>
        </form>
    )
}
