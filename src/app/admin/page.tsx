import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { AdminDashboard } from './admin-dashboard'

export const dynamic = 'force-dynamic'

export default async function AdminPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) redirect('/login')

    // Check role
    const { data: currentUserProfile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

    if (currentUserProfile?.role !== 'admin') {
        redirect('/o-mapa-da-raiz')
    }

    // Fetch all users with profile data
    const { data: users } = await supabase
        .from('profiles')
        .select('id, full_name, age, dominant_element, onboarding_completed, created_at')
        .order('created_at', { ascending: false })

    return (
        <div className="min-h-screen py-12 px-6 lg:px-12 relative overflow-hidden">

            <div className="max-w-7xl mx-auto space-y-12 z-10 relative">
                <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-foreground/5 pb-8">
                    <div className="space-y-1">
                        <p className="text-sm uppercase tracking-[0.2em] text-foreground/40 font-medium">GESTÃO DE ALUNAS</p>
                        <h1 className="text-5xl font-serif text-foreground/90">Painel Administrativo</h1>
                    </div>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="glass rounded-3xl p-8 border-white/20">
                        <p className="text-xs uppercase tracking-widest text-foreground/40 font-bold mb-2">Total de Alunas</p>
                        <div className="text-4xl font-serif text-primary">{users?.length || 0}</div>
                    </div>
                    <div className="glass rounded-3xl p-8 border-white/20">
                        <p className="text-xs uppercase tracking-widest text-foreground/40 font-bold mb-2">Diagnósticos</p>
                        <div className="text-4xl font-serif text-wellness-gold">{users?.filter(u => u.dominant_element).length || 0}</div>
                    </div>
                    <div className="glass rounded-3xl p-8 border-white/20">
                        <p className="text-xs uppercase tracking-widest text-foreground/40 font-bold mb-2">Onboarding</p>
                        <div className="text-4xl font-serif text-wellness-sage">{users?.filter(u => u.onboarding_completed).length || 0}</div>
                    </div>
                </div>

                <AdminDashboard users={users || []} />
            </div>
        </div>
    )
}
