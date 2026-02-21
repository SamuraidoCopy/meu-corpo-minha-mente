import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { MapaClient } from './mapa-client'

export default async function MapaPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    // Fetch the gender from the user profile
    const { data: profile } = await supabase
        .from('profiles')
        .select('gender')
        .eq('id', user.id)
        .single()

    const gender = (profile?.gender as 'Masculino' | 'Feminino') || 'Feminino'

    return <MapaClient gender={gender} />
}
