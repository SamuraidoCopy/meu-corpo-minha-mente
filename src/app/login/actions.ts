'use server'

import { headers } from 'next/headers'
import { createClient } from '@/lib/supabase/server'

type LoginState = {
    message: string
    success?: boolean
}

export async function login(_prevState: LoginState, formData: FormData): Promise<LoginState> {
    const supabase = await createClient()

    const email = (formData.get('email') as string)?.trim().toLowerCase()

    if (!email) {
        return { message: 'Informe seu e-mail.' }
    }

    // Monta a URL de redirecionamento do link mágico (callback que troca o code por sessão)
    const headersList = await headers()
    const origin =
        process.env.NEXT_PUBLIC_SITE_URL ||
        (headersList.get('origin') ?? `https://${headersList.get('host')}`)

    const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
            // CRÍTICO: não cria usuário novo. Só quem já tem acesso liberado
            // (criado pelo cron release-access após D+8) consegue receber o link.
            shouldCreateUser: false,
            emailRedirectTo: `${origin}/auth/callback`,
        },
    })

    if (error) {
        console.error('Login (magic link) error:', error)
        // Mensagem genérica para não revelar se o e-mail existe na base.
        return { message: 'Não foi possível enviar o link. Verifique se este é o e-mail da sua compra.' }
    }

    return {
        success: true,
        message: 'Pronto! Enviamos um link de acesso para o seu e-mail. Abra-o neste dispositivo para entrar.',
    }
}

export async function signOut() {
    const supabase = await createClient()
    await supabase.auth.signOut()
}
