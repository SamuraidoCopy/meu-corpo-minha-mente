'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function completeOnboarding(prevState: any, formData: FormData) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    const age = parseInt(formData.get('age') as string)
    const history = formData.get('history') as string
    const fullName = formData.get('fullName') as string

    // Validate inputs
    if (!age || isNaN(age)) {
        return { message: 'Idade inválida' }
    }

    const { error } = await supabase
        .from('profiles')
        .upsert({
            id: user.id,
            age,
            history,
            full_name: fullName,
            onboarding_completed: true,
            updated_at: new Date().toISOString(),
        })

    if (error) {
        console.error('Error updating profile:', error)
        return { message: 'Erro ao salvar perfil. Tente novamente.' }
    }

    revalidatePath('/', 'layout')
    redirect('/')
}
