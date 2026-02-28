'use server'

import { createClient } from '@/lib/supabase/server'
import { ElementType } from '@/lib/tcm-data'
import { revalidatePath } from 'next/cache'

export async function saveDiagnosis(dominantElement: ElementType, answers?: { question: string, answer: string }[]) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { error: 'Usuário não autenticado' }

    const { error } = await supabase
        .from('profiles')
        .update({
            // @ts-ignore - we will add this column
            dominant_element: dominantElement,
            // @ts-ignore - we will add this column
            reflection_answers: answers || null,
            updated_at: new Date().toISOString()
        })
        .eq('id', user.id)

    if (error) {
        console.error('Error saving diagnosis:', error)
        return { error: 'Erro ao salvar diagnóstico.' }
    }

    revalidatePath('/dashboard')
    return { success: true }
}
