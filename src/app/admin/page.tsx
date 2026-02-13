import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export default async function AdminPage() {
    const supabase = createClient()
    const { data: { user } } = await (await supabase).auth.getUser()

    if (!user) redirect('/login')

    // Check role
    const { data: currentUserProfile } = await (await supabase)
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

    if (currentUserProfile?.role !== 'admin') {
        redirect('/')
    }

    // Fetch all users with profile data
    const { data: users } = await (await supabase)
        .from('profiles')
        .select('id, full_name, age, dominant_element, onboarding_completed, created_at')
        .order('created_at', { ascending: false })

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900 py-12 px-4">
            <div className="max-w-6xl mx-auto space-y-8">
                <h1 className="text-3xl font-bold">Painel Administrativo</h1>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card>
                        <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Total de Alunas</CardTitle></CardHeader>
                        <CardContent><div className="text-2xl font-bold">{users?.length || 0}</div></CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Diagnósticos</CardTitle></CardHeader>
                        <CardContent><div className="text-2xl font-bold">{users?.filter(u => u.dominant_element).length || 0}</div></CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Onboarding Completo</CardTitle></CardHeader>
                        <CardContent><div className="text-2xl font-bold">{users?.filter(u => u.onboarding_completed).length || 0}</div></CardContent>
                    </Card>
                </div>

                <Card>
                    <CardHeader><CardTitle>Alunas Cadastradas</CardTitle></CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Nome</TableHead>
                                    <TableHead>Idade</TableHead>
                                    <TableHead>Elemento</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Data Cadastro</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {users?.map((u) => (
                                    <TableRow key={u.id}>
                                        <TableCell className="font-medium">{u.full_name || 'Anônima'}</TableCell>
                                        <TableCell>{u.age || '-'}</TableCell>
                                        <TableCell>{u.dominant_element || <span className="text-muted-foreground">Pendente</span>}</TableCell>
                                        <TableCell>
                                            {u.onboarding_completed ?
                                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">Ativo</span> :
                                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">Pendente</span>
                                            }
                                        </TableCell>
                                        <TableCell>{new Date(u.created_at).toLocaleDateString()}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
