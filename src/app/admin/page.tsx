import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

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
        redirect('/')
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

                <div className="glass rounded-[2rem] overflow-hidden border-white/20 shadow-2xl">
                    <div className="p-8 border-b border-foreground/5 bg-white/10">
                        <h2 className="text-2xl font-serif">Alunas Cadastradas</h2>
                    </div>
                    <div className="p-4">
                        <Table>
                            <TableHeader>
                                <TableRow className="border-foreground/5 hover:bg-transparent">
                                    <TableHead className="uppercase tracking-widest text-[10px] font-bold py-6">Nome</TableHead>
                                    <TableHead className="uppercase tracking-widest text-[10px] font-bold">Idade</TableHead>
                                    <TableHead className="uppercase tracking-widest text-[10px] font-bold">Elemento</TableHead>
                                    <TableHead className="uppercase tracking-widest text-[10px] font-bold">Status</TableHead>
                                    <TableHead className="uppercase tracking-widest text-[10px] font-bold">Cadastro</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {users?.map((u) => (
                                    <TableRow key={u.id} className="border-foreground/5 hover:bg-white/40 transition-colors group">
                                        <TableCell className="py-6 font-medium text-foreground/90">{u.full_name || 'Anônima'}</TableCell>
                                        <TableCell className="text-foreground/70">{u.age || '-'}</TableCell>
                                        <TableCell>
                                            {u.dominant_element ? (
                                                <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-wellness-sage/10 text-wellness-sage">
                                                    {u.dominant_element}
                                                </span>
                                            ) : (
                                                <span className="text-foreground/30 italic text-sm">Pendente</span>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            {u.onboarding_completed ?
                                                <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-tighter text-wellness-sage">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-wellness-sage animate-pulse" /> Ativo
                                                </span> :
                                                <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-tighter text-wellness-gold">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-wellness-gold" /> Pendente
                                                </span>
                                            }
                                        </TableCell>
                                        <TableCell className="text-foreground/60 text-sm">
                                            {new Date(u.created_at).toLocaleDateString('pt-BR')}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </div>
            </div>
        </div>
    )
}
