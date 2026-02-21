import { DiagnosisWizard } from './wizard'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default async function DiagnosticoPage() {
    const supabase = createClient()
    const { data: { user } } = await (await supabase).auth.getUser()

    if (!user) {
        redirect('/login')
    }

    const { data: profile } = await (await supabase)
        .from('profiles')
        .select('gender')
        .eq('id', user.id)
        .single()

    return (
        <main className="min-h-screen pt-32 pb-16 px-6 relative overflow-hidden flex flex-col items-center">
            <Link href="/" className="absolute top-6 left-6 md:top-8 md:left-8 z-50">
                <img
                    src="/images/logo-mapa-raiz.png"
                    alt="O Mapa da Raiz"
                    className="h-8 md:h-12 w-auto object-contain opacity-90 drop-shadow-sm hover:opacity-100 transition-opacity"
                />
            </Link>

            <Button variant="ghost" size="icon" className="absolute top-6 right-6 md:top-8 md:right-8 z-50 rounded-full bg-white/50 backdrop-blur-sm border border-white/20 hover:bg-white text-foreground/50 hover:text-foreground shadow-sm" asChild>
                <Link href="/">
                    <span className="sr-only">Fechar</span>
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
                </Link>
            </Button>
            <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-wellness-gold/5 rounded-full blur-3xl" />

            <div className="max-w-4xl w-full z-10 relative">
                <header className="text-center mb-16 space-y-4">
                    <p className="text-xs uppercase tracking-[0.3em] font-bold text-foreground/40">INVESTIGAÇÃO GUIADA</p>
                    <h1 className="text-6xl font-serif text-foreground/90 leading-tight">O Silêncio dos <span className="italic text-primary">Sintomas</span></h1>
                    <p className="text-foreground/50 text-lg max-w-xl mx-auto italic">
                        "O que o corpo não fala, o sintoma grita. Responda com a verdade do seu momento."
                    </p>
                </header>

                <DiagnosisWizard userGender={profile?.gender || 'Feminino'} />

                <footer className="mt-16 text-center">
                    <Button variant="ghost" className="text-foreground/30 hover:text-foreground/60 transition-colors" asChild>
                        <Link href="/">← Interromper por agora</Link>
                    </Button>
                </footer>
            </div>
        </main>
    )
}
