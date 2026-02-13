'use client'

import { useActionState } from 'react'
import { login } from './actions'
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

const initialState = {
    message: '',
}

export function LoginForm() {
    const [state, formAction, isPending] = useActionState(login, initialState)

    return (
        <form action={formAction} className="grid gap-4">
            <div className="grid gap-2">
                <Label htmlFor="email">E-mail</Label>
                <Input id="email" name="email" type="email" placeholder="seu@email.com" required />
            </div>
            <div className="grid gap-2">
                <Label htmlFor="password">Senha</Label>
                <Input id="password" name="password" type="password" required />
            </div>
            {state?.message && <p className="text-sm text-red-500">{state.message}</p>}
            <Button className="w-full" type="submit" disabled={isPending}>
                {isPending ? 'Entrando...' : 'Entrar'}
            </Button>
        </form>
    )
}
