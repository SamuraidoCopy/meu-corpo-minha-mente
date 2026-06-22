'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

type LoginState = {
  message: string
  success?: boolean
}

export async function adminLogin(_prevState: LoginState, formData: FormData): Promise<LoginState> {
  const supabase = await createClient()

  const email = (formData.get('email') as string)?.trim().toLowerCase()
  const password = formData.get('password') as string

  if (!email || !password) {
    return { message: 'Informe e-mail e senha.' }
  }

  const { error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    return { message: 'E-mail ou senha incorretos.' }
  }

  // Verifica se o usuário tem role admin
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { message: 'Erro ao autenticar.' }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') {
    await supabase.auth.signOut()
    return { message: 'Acesso negado. Esta área é restrita a administradores.' }
  }

  redirect('/admin')
}
