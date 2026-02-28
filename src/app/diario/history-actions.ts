'use server'

import { createClient } from '@/lib/supabase/server'

// Mapeamento de emoções para cálculo de pontuação (1-5)
const getMoodScore = (mood: string) => {
    const m = mood.toLowerCase();
    if (m.includes('radiante') || m.includes('feliz')) return 5;
    if (m.includes('calm') || m.includes('neutr')) return 4;
    if (m.includes('cansad') || m.includes('insegur') || m.includes('triste')) return 2;
    return 1; // irritado, ansioso, frustrado, com medo
}

export async function getMonthlyMoods(date: Date) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { entries: [], feedback: null }

    const start = new Date(date.getFullYear(), date.getMonth(), 1).toISOString().split('T')[0]
    const end = new Date(date.getFullYear(), date.getMonth() + 1, 0).toISOString().split('T')[0]

    const { data } = await supabase
        .from('diary_entries')
        .select('entry_date, mood, energy_level, sleep_quality, symptoms, notes')
        .eq('user_id', user.id)
        .gte('entry_date', start)
        .lte('entry_date', end)
        .order('entry_date', { ascending: true })

    if (!data) return { entries: [], feedback: null }

    let madeiraCount = 0;
    let feedback = null;

    const entries = data.map(entry => {
        const score = Math.round(
            ((entry.energy_level / 5) * 100 * 0.4) +
            ((entry.sleep_quality / 5) * 100 * 0.4) +
            ((getMoodScore(entry.mood) / 5) * 100 * 0.2)
        );

        const m = entry.mood.toLowerCase();
        if (m.includes('irritad') || m.includes('frustrad') || m.includes('ansios')) {
            madeiraCount++;
        } else {
            madeiraCount = 0;
        }

        if (madeiraCount >= 3) {
            feedback = "Notamos um acúmulo de irritabilidade/ansiedade. Que tal um bom chá de camomila ou hortelã hoje e uma pausa de 10 min para respirar? Isso ajudará a suavizar o fluxo de energia intensa no corpo.";
        }

        return {
            ...entry,
            vital_energy_score: score
        }
    });

    return { entries, feedback }
}
