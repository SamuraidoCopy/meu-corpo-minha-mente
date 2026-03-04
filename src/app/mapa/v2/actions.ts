'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

const facialMarksSchema = z.object({
    marks: z.array(z.string()).min(1, 'Selecione pelo menos uma marca.')
})

export async function saveFacialMarks(marks: string[]) {
    try {
        const parsed = facialMarksSchema.parse({ marks })

        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return { success: false, error: 'Usuário não autenticado.' }
        }

        const { error } = await supabase
            .from('facial_expressions')
            .insert({
                user_id: user.id,
                marks_selected: parsed.marks
            })

        if (error) {
            console.error('Save facial marks schema DB error:', error)
            return { success: false, error: 'Erro ao salvar no banco de dados.' }
        }

        // revalidatePath('/mapa/v2') - Removido para evitar conflitos de cache no Client Transition
        return { success: true }
    } catch (e: any) {
        return { success: false, error: e?.message || 'Payload inválido.' }
    }
}

const deepReflectionsSchema = z.object({
    elementContext: z.string().min(1, 'Elemento é obrigatório'),
    answers: z.record(z.string(), z.string().min(1, 'A resposta não pode estar vazia'))
})

export async function saveDeepReflections(elementContext: string, answers: Record<string, string>) {
    try {
        const parsed = deepReflectionsSchema.parse({ elementContext, answers })

        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return { success: false, error: 'Usuário não autenticado.' }
        }

        const { error } = await supabase
            .from('deep_reflections')
            .insert({
                user_id: user.id,
                element_context: parsed.elementContext,
                answers: parsed.answers
            })

        if (error) {
            console.error('Save deep reflections DB error:', error)
            return { success: false, error: 'Erro ao salvar no banco de dados.' }
        }

        // Check if the user has completed the diary check-in today
        const startOfToday = new Date()
        startOfToday.setHours(0, 0, 0, 0)

        const { count } = await supabase
            .from('diary_entries')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', user.id)
            .gte('created_at', startOfToday.toISOString())

        const hasCheckedInToday = (count ?? 0) > 0

        revalidatePath('/mapa/v2')
        return { success: true, hasCheckedInToday }
    } catch (e: any) {
        return { success: false, error: e?.message || 'Payload inválido.' }
    }
}
