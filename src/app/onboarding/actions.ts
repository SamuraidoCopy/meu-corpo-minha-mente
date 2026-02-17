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
    if (!fullName || fullName.trim().length < 3) {
        return { message: 'Por favor, informe seu nome completo.' }
    }

    if (!age || isNaN(age) || age < 10 || age > 100) {
        return { message: 'Por favor, informe uma idade válida.' }
    }

    if (!history || history.trim().length < 10) {
        return { message: 'Por favor, conte um pouco mais sobre sua história (mínimo 10 caracteres).' }
    }

    const { error } = await supabase
        .from('profiles')
        .update({
            age,
            history,
            full_name: fullName,
            onboarding_completed: true,
            updated_at: new Date().toISOString(),
        })
        .eq('id', user.id)

    if (error) {
        console.error('Onboarding error:', error)
        return { message: 'Erro ao salvar perfil. Tente novamente.' }
    }

    revalidatePath('/', 'layout')
    redirect('/')
}
