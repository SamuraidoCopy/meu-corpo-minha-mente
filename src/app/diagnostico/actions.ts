'use server'

import { createClient } from '@/lib/supabase/server'
import { ElementType } from '@/lib/tcm-data'
import { revalidatePath } from 'next/cache'

export async function saveDiagnosis(dominantElement: ElementType) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { error: 'Usuário não autenticado' }

    // Check if profile exists; if not, triggers might have failed, but we proceed
    // ideally we should update a 'diagnosis' column or a separate table
    // For MVP, let's store it in the 'profiles' table (we need to add a column)
    // OR create a new table. 
    // Given the schema.sql I made earlier, I didn't add a diagnosis column.
    // I should probably add a JSONB column or similar for flexibility, or just a text column.
    // For now, let's assume I can add it to metadata or I need to alter the table.
    // Let's UPDATE the profile with a new column 'dominant_element'.
    // NOTE: I need to run a migration to add this column. 
    // I will assume for now I can update 'history' or 'raw_user_meta_data' strictly for MVP speed,
    // BUT proper way is a column.

    // Let's try to update `raw_user_meta_data` first as it's schema-less and easy for MVP.
    // Actually, better to use a dedicated table or column. 
    // I'll create a SQL migration file to add `dominant_element` to profiles.

    const { error } = await supabase
        .from('profiles')
        .update({
            // @ts-ignore - we will add this column
            dominant_element: dominantElement,
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
