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

    return (
        <main className="min-h-screen py-16 px-6 relative overflow-hidden flex flex-col items-center">
            <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-wellness-gold/5 rounded-full blur-3xl" />

            <div className="max-w-4xl w-full z-10 relative">
                <header className="text-center mb-16 space-y-4">
                    <p className="text-xs uppercase tracking-[0.3em] font-bold text-foreground/40">INVESTIGAÇÃO GUIADA</p>
                    <h1 className="text-6xl font-serif text-foreground/90 leading-tight">O Silêncio dos <span className="italic text-primary">Sintomas</span></h1>
                    <p className="text-foreground/50 text-lg max-w-xl mx-auto italic">
                        "O que o corpo não fala, o sintoma grita. Responda com a verdade do seu momento."
                    </p>
                </header>

                <DiagnosisWizard />

                <footer className="mt-16 text-center">
                    <Button variant="ghost" className="text-foreground/30 hover:text-foreground/60 transition-colors" asChild>
                        <Link href="/">← Interromper por agora</Link>
                    </Button>
                </footer>
            </div>
        </main>
    )
}
