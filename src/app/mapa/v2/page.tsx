import Link from 'next/link'
import { redirect } from 'next/navigation'
import { Map as MapIcon, ArrowLeft } from 'lucide-react'

import { ExpressionsSelectorB } from './expressions-selector-b'
import { createClient } from '@/lib/supabase/server'
import { ELEMENTS, type ElementType } from '@/lib/tcm-data'

export default async function MapaV2Page({
    searchParams,
}: {
    searchParams: Promise<{ inspect?: string; element?: string }>
}) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    const { inspect, element: elementOverride } = await searchParams

    if (!user) redirect('/login')

    const { data: profile } = await supabase
        .from('profiles')
        .select('dominant_element, highlighted_elements, onboarding_completed, gender, role')
        .eq('id', user.id)
        .single()

    const { data: latestAssessment } = await supabase
        .from('diagnostic_assessments')
        .select('result_kind, result_elements, created_at')
        .eq('user_id', user.id)
        .eq('status', 'completed')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()

    const isAdmin = profile?.role === 'admin'
    const isInspecting = isAdmin && (inspect === 'true' || !!elementOverride)

    if (!profile || (!profile.onboarding_completed && !isInspecting)) redirect('/onboarding')

    const storedElements = Array.isArray(latestAssessment?.result_elements)
        ? latestAssessment.result_elements.filter((element): element is ElementType => Object.prototype.hasOwnProperty.call(ELEMENTS, element))
        : Array.isArray(profile.highlighted_elements)
            ? profile.highlighted_elements.filter((element): element is ElementType => Object.prototype.hasOwnProperty.call(ELEMENTS, element))
            : profile.dominant_element && Object.prototype.hasOwnProperty.call(ELEMENTS, profile.dominant_element)
                ? [profile.dominant_element as ElementType]
                : []

    if (storedElements.length === 0 && !isInspecting) redirect('/mapa')

    let dominantElement = storedElements[0] || 'Madeira'
    if (elementOverride && Object.prototype.hasOwnProperty.call(ELEMENTS, elementOverride) && (isAdmin || storedElements.includes(elementOverride as ElementType))) {
        dominantElement = elementOverride as ElementType
    }

    return (
        <main className="min-h-screen bg-[#F9F6F1] mesh-gradient pt-24 pb-12 px-6 overflow-hidden">
            <Link href="/o-mapa-da-raiz" className="fixed top-8 left-8 text-foreground/40 hover:text-primary transition-colors flex items-center gap-2 z-50">
                <ArrowLeft size={20} />
                <span className="font-medium text-sm tracking-wide uppercase">Voltar ao Início</span>
            </Link>

            <div className="max-w-4xl mx-auto space-y-12 relative animate-in fade-in slide-in-from-bottom-8 duration-700">
                {isInspecting && (
                    <div className="bg-primary/5 border border-primary/20 rounded-2xl p-4 text-center">
                        <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-primary">Visualização Master: {dominantElement}</p>
                    </div>
                )}
                {latestAssessment?.result_kind === 'combined' && storedElements.length > 1 && (
                    <div className="bg-wellness-gold/5 border border-wellness-gold/20 rounded-2xl p-4 text-center space-y-3">
                        <p className="text-sm text-foreground/70">Esta leitura tem mais de um padrão. Escolha qual aprofundar nesta sessão:</p>
                        <div className="flex flex-wrap justify-center gap-2">
                            {storedElements.map((element) => (
                                <Link key={element} href={`/mapa/v2?element=${encodeURIComponent(element)}`} className={`px-4 py-2 rounded-full text-sm border transition-colors ${dominantElement === element ? 'bg-primary text-white border-primary' : 'bg-white/60 border-foreground/10 text-foreground/70'}`}>
                                    {element}
                                </Link>
                            ))}
                        </div>
                    </div>
                )}
                <header className="text-center space-y-6">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-primary/10 text-primary mb-4 ring-1 ring-primary/20 shadow-xl">
                        <MapIcon size={32} strokeWidth={1.5} />
                    </div>
                    <div className="space-y-4">
                        <p className="text-sm uppercase tracking-[0.3em] text-foreground/40 font-bold">FASE 2: APROFUNDAMENTO EMOCIONAL</p>
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif text-foreground/90 leading-tight">O Rosto é o Seu <span className="italic text-primary">Espelho</span></h1>
                        <p className="text-lg md:text-xl text-foreground/60 max-w-2xl mx-auto leading-relaxed">As marcas de expressão são um convite à observação. Selecione as linhas e marcas mais evidentes no seu rosto agora.</p>
                    </div>
                </header>

                <ExpressionsSelectorB dominantElement={dominantElement} gender={profile.gender as 'Feminino' | 'Masculino'} />
            </div>
        </main>
    )
}
