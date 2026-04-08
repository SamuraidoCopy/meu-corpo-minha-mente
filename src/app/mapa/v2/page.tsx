import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Brain, Map as MapIcon, ArrowLeft } from 'lucide-react'
import { ExpressionsSelectorB } from './expressions-selector-b'
import { ELEMENTS, ElementType } from '@/lib/tcm-data'

export default async function MapaV2Page() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    // Load user profile to get dominant element
    const { data: profile } = await supabase
        .from('profiles')
        .select('dominant_element, onboarding_completed, gender')
        .eq('id', user.id)
        .single()

    if (!profile || !profile.onboarding_completed) {
        redirect('/onboarding')
    }

    if (!profile.dominant_element) {
        // Redireciona para o Mapa V1 se não tiver elemento dominante
        redirect('/mapa')
    }

    const dominantElement = profile.dominant_element as ElementType

    // Check if user already submitted the facial marks today
    // For simplicity, we can let them do it multiple times or restrict. 
    // We'll let the ExpressionsSelector handle the flow states.

    return (
        <main className="min-h-screen bg-[#F9F6F1] mesh-gradient pt-24 pb-12 px-6 overflow-hidden">
            <Link href="/o-mapa-da-raiz" className="fixed top-8 left-8 text-foreground/40 hover:text-primary transition-colors flex items-center gap-2 z-50">
                <ArrowLeft size={20} />
                <span className="font-medium text-sm tracking-wide uppercase">Voltar ao Início</span>
            </Link>

            <div className="max-w-4xl mx-auto space-y-12 relative animate-in fade-in slide-in-from-bottom-8 duration-700">
                <header className="text-center space-y-6">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-primary/10 text-primary mb-4 ring-1 ring-primary/20 shadow-xl">
                        <MapIcon size={32} strokeWidth={1.5} />
                    </div>
                    <div className="space-y-4">
                        <p className="text-sm uppercase tracking-[0.3em] text-foreground/40 font-bold">FASE 2: APROFUNDAMENTO EMOCIONAL</p>
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif text-foreground/90 leading-tight">
                            O Rosto é o Seu <span className="italic text-primary">Espelho</span>
                        </h1>
                        <p className="text-lg md:text-xl text-foreground/60 max-w-2xl mx-auto leading-relaxed">
                            As marcas de expressão confessam como você reagiu e vivenciou cada experiência na sua vida. Selecione as linhas e marcas mais evidentes no seu rosto agora.
                        </p>
                    </div>
                </header>

                <ExpressionsSelectorB dominantElement={dominantElement} gender={profile.gender as 'Feminino' | 'Masculino'} />
            </div>
        </main>
    )
}

