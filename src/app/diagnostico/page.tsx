import { DiagnosisWizard } from './wizard'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

import { FACIAL_ZONES } from '@/lib/tcm-data'

function parseFacialZoneIds(value: string | string[] | undefined) {
    const rawValues = Array.isArray(value) ? value : value?.split(',') || []
    const knownIds = new Set(FACIAL_ZONES.map((zone) => zone.id))
    const candidates = rawValues.flatMap((item) => item.split(',')).map((item) => item.trim()).filter(Boolean)

    return {
        ids: [...new Set(candidates.filter((item) => knownIds.has(item)))],
        hadInvalid: candidates.some((item) => !knownIds.has(item)),
    }
}

export default async function DiagnosticoPage({ searchParams }: {
    searchParams: Promise<{ zones?: string | string[]; element?: string }>
}) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    const { data: profile } = await supabase
        .from('profiles')
        .select('gender')
        .eq('id', user.id)
        .single()

    const { data: draft } = await supabase
        .from('diagnostic_assessments')
        .select('id, facial_zone_ids, question_answers, tiebreak_answers, reflection_answers, comparison_choice, progress_revision')
        .eq('user_id', user.id)
        .eq('status', 'in_progress')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()

    const resolvedParams = await searchParams
    const parsedFacialZones = parseFacialZoneIds(resolvedParams?.zones)
    const initialFacialZoneIds = parsedFacialZones.ids
    const resumeAssessment = draft ? {
        id: draft.id,
        facialZoneIds: Array.isArray(draft.facial_zone_ids) ? draft.facial_zone_ids : [],
        questionAnswers: (draft.question_answers || {}) as Record<string, boolean>,
        tiebreakAnswers: (draft.tiebreak_answers || {}) as Record<string, number>,
        reflectionAnswers: (draft.reflection_answers || {}) as Record<string, string>,
        comparisonChoice: draft.comparison_choice as 'Madeira' | 'Fogo' | 'Terra' | 'Metal' | 'Água' | 'none' | undefined,
        progressRevision: typeof draft.progress_revision === 'number' ? draft.progress_revision : 0,
    } : undefined

    return (
        <main className="min-h-screen pt-32 pb-16 px-6 relative overflow-hidden flex flex-col items-center">
            <Link href="/o-mapa-da-raiz" className="absolute top-6 left-6 md:top-8 md:left-8 z-50">
                <Image
                    src="/images/logo-mapa-raiz.png"
                    alt="O Mapa da Raiz"
                    width={761}
                    height={328}
                    priority
                    className="h-8 md:h-12 w-auto object-contain opacity-90 drop-shadow-sm hover:opacity-100 transition-opacity"
                />
            </Link>

            <Button variant="ghost" size="icon" className="absolute top-6 right-6 md:top-8 md:right-8 z-50 rounded-full bg-white/50 backdrop-blur-sm border border-white/20 hover:bg-white text-foreground/50 hover:text-foreground shadow-sm" asChild>
                <Link href="/o-mapa-da-raiz">
                    <span className="sr-only">Fechar</span>
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
                </Link>
            </Button>
            <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-wellness-gold/5 rounded-full blur-3xl" />

            <div className="max-w-4xl w-full z-10 relative">
                <header className="text-center mb-16 space-y-4">
                    <p className="text-xs uppercase tracking-[0.3em] font-bold text-foreground/40">LEITURA GUIADA</p>
                    <h1 className="text-6xl font-serif text-foreground/90 leading-tight">Observe seus <span className="italic text-primary">padrões</span></h1>
                    <p className="text-foreground/50 text-lg max-w-xl mx-auto italic">
                        &quot;Observe o que aparece no seu momento atual e responda sem julgamento.&quot;
                    </p>
                </header>

                <DiagnosisWizard
                    userGender={profile?.gender}
                    initialFacialZoneIds={initialFacialZoneIds}
                    invalidFacialZoneIds={parsedFacialZones.hadInvalid}
                    resumeAssessment={resumeAssessment}
                />

                <footer className="mt-16 text-center">
                    <Button variant="ghost" className="text-foreground/30 hover:text-foreground/60 transition-colors" asChild>
                        <Link href="/o-mapa-da-raiz">← Interromper por agora</Link>
                    </Button>
                </footer>
            </div>
        </main>
    )
}

