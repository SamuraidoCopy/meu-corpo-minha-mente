'use server'

import { createClient } from '@/lib/supabase/server'
import { format } from 'date-fns'

export async function getMonthlyMoods(date: Date) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return []

    // Get start and end of month
    const start = new Date(date.getFullYear(), date.getMonth(), 1).toISOString().split('T')[0]
    const end = new Date(date.getFullYear(), date.getMonth() + 1, 0).toISOString().split('T')[0]

    const { data } = await supabase
        .from('diary_entries')
        .select('entry_date, mood, energy_level')
        .eq('user_id', user.id)
        .gte('entry_date', start)
        .lte('entry_date', end)

    return data || []
}
