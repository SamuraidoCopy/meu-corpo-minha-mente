'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function updateProfilePicture(base64Image: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        throw new Error('User not authenticated')
    }

    const { error } = await supabase
        .from('profiles')
        .update({
            avatar_url: base64Image,
            updated_at: new Date().toISOString(),
        })
        .eq('id', user.id)

    if (error) {
        console.error('Error updating profile picture:', error)
        throw new Error('Falha ao salvar a imagem.')
    }

    revalidatePath('/', 'layout')
    return { success: true }
}
