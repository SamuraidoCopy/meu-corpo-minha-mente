import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { DiaryForm } from './diary-form'
import { DiaryHistory } from './history'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale/pt-BR'

export default async function DiarioPage() {
    const supabase = createClient()
    const { data: { user } } = await (await supabase).auth.getUser()

    if (!user) {
        redirect('/login')
    }

    const todayDay = format(new Date(), "d", { locale: ptBR })
    const todayMonth = format(new Date(), "MMMM", { locale: ptBR })

    return (
        <main className="min-h-screen py-16 px-6 relative overflow-hidden flex flex-col items-center">

            <div className="max-w-3xl w-full space-y-12 z-10 relative">
                <header className="text-center space-y-4">
                    <div className="inline-flex flex-col items-center">
                        <span className="text-6xl font-serif text-primary/30 leading-none">{todayDay}</span>
                        <span className="text-xs uppercase tracking-[0.3em] font-bold text-foreground/40 mt-1">{todayMonth}</span>
                    </div>
                    <div className="space-y-1">
                        <h1 className="text-5xl font-serif text-foreground/90 leading-tight">Diário das <span className="italic text-primary">Emoções</span></h1>
                        <p className="text-foreground/50 text-lg italic">"Dê voz ao que seu corpo sente em silêncio."</p>
                    </div>
                </header>

                <div className="grid grid-cols-1 gap-12">
                    <Card className="glass border-white/30 rounded-[2.5rem] shadow-2xl overflow-hidden">
                        <CardHeader className="text-center pt-10 pb-6 border-b border-foreground/5">
                            <CardTitle className="text-2xl font-serif">Check-in de hoje</CardTitle>
                            <CardDescription className="text-foreground/50">Reserve um momento sagrado para se escutar.</CardDescription>
                        </CardHeader>
                        <CardContent className="p-8 md:p-12">
                            <DiaryForm />
                        </CardContent>
                    </Card>

                    <section className="space-y-6">
                        <h2 className="text-xs uppercase tracking-widest text-foreground/40 font-bold ml-6 italic">Sua Jornada Recente</h2>
                        <DiaryHistory />
                    </section>
                </div>

                <footer className="text-center pt-8">
                    <Button variant="ghost" className="text-foreground/30 hover:text-foreground/60" asChild>
                        <Link href="/">← Voltar ao Início</Link>
                    </Button>
                </footer>
            </div>
        </main>
    )
}
