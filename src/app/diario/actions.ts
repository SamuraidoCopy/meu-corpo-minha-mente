'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function saveDiaryEntry(prevState: any, formData: FormData) {
    const supabase = createClient()
    const { data: { user } } = await (await supabase).auth.getUser()

    if (!user) return { message: 'Usuário não autenticado' }

    const energy = parseInt(formData.get('energy') as string)
    const sleep = parseInt(formData.get('sleep') as string)
    const mood = formData.get('mood') as string
    const notes = formData.get('notes') as string
    const symptoms = formData.get('symptoms') as string
    const date = formData.get('date') as string || new Date().toISOString().split('T')[0]

    const { error } = await (await supabase)
        .from('diary_entries')
        .upsert({
            user_id: user.id,
            entry_date: date,
            energy_level: energy,
            sleep_quality: sleep,
            mood,
            notes,
            symptoms,
            created_at: new Date().toISOString()
        }, { onConflict: 'user_id, entry_date' })

    if (error) {
        console.error('Error saving diary:', error)
        return { message: 'Erro ao salvar diário. Tente novamente.' }
    }

    revalidatePath('/diario')
    return { message: 'Diário salvo com sucesso!', success: true }
}
