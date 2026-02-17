'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function login(prevState: any, formData: FormData) {
    const supabase = createClient()

    const email = formData.get('email') as string
    const password = formData.get('password') as string

    const { error } = await (await supabase).auth.signInWithPassword({
        email,
        password,
    })

    if (error) {
        console.error('Login error:', error)
        return { message: error.message }
    }

    revalidatePath('/', 'layout')
    redirect('/')
}

export async function signOut() {
    const supabase = createClient()
    await (await supabase).auth.signOut()
    redirect('/login')
}
