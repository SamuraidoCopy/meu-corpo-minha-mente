import { NextRequest, NextResponse } from 'next/server'
import type { EmailOtpType } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/server'

/**
 * Callback do link mágico (magic link / OTP por e-mail).
 *
 * Suporta os dois formatos de link que o Supabase pode gerar:
 *  - PKCE: ?code=...           -> exchangeCodeForSession
 *  - OTP:  ?token_hash=&type=  -> verifyOtp
 *
 * Em sucesso, redireciona o aluno para o app. Em falha, volta para o login
 * com um aviso amigável.
 */
export async function GET(req: NextRequest) {
    const { searchParams, origin } = new URL(req.url)
    const next = searchParams.get('next') ?? '/o-mapa-da-raiz'

    const code = searchParams.get('code')
    const tokenHash = searchParams.get('token_hash')
    const type = searchParams.get('type') as EmailOtpType | null

    const supabase = await createClient()

    if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code)
        if (!error) {
            return NextResponse.redirect(`${origin}${next}`)
        }
        console.error('[auth/callback] exchangeCodeForSession error:', error)
    } else if (tokenHash && type) {
        const { error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type })
        if (!error) {
            return NextResponse.redirect(`${origin}${next}`)
        }
        console.error('[auth/callback] verifyOtp error:', error)
    }

    return NextResponse.redirect(`${origin}/login?error=link_invalido`)
}
