'use client'

import { useActionState } from 'react'
import { adminLogin } from './actions'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

const initialState = { message: '' }

export function AdminLoginForm() {
  const [state, formAction, isPending] = useActionState(adminLogin, initialState)

  return (
    <form action={formAction} className="grid gap-6">
      <div className="grid gap-2">
        <Label htmlFor="email" className="text-xs uppercase tracking-widest text-foreground/50 font-medium ml-1">
          E-mail
        </Label>
        <Input
          id="email"
          name="email"
          type="email"
          placeholder="admin@exemplo.com"
          required
          autoComplete="email"
          className="bg-white/50 border-white/30 focus:border-wellness-sage/50 rounded-xl h-12"
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="password" className="text-xs uppercase tracking-widest text-foreground/50 font-medium ml-1">
          Senha
        </Label>
        <Input
          id="password"
          name="password"
          type="password"
          placeholder="••••••••"
          required
          autoComplete="current-password"
          className="bg-white/50 border-white/30 focus:border-wellness-sage/50 rounded-xl h-12"
        />
      </div>

      {state?.message && (
        <p className="text-sm text-red-500 text-center font-medium">{state.message}</p>
      )}

      <Button
        className="w-full h-12 rounded-xl bg-wellness-sage hover:bg-wellness-sage/90 text-white shadow-lg shadow-wellness-sage/20 transition-all active:scale-[0-98]"
        type="submit"
        disabled={isPending}
      >
        {isPending ? 'Entrando...' : 'Entrar'}
      </Button>
    </form>
  )
}
