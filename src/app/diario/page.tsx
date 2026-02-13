import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { DiaryForm } from './diary-form'
import { DiaryHistory } from './history'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export default async function DiarioPage() {
    const supabase = createClient()
    const { data: { user } } = await (await supabase).auth.getUser()

    if (!user) {
        redirect('/login')
    }

    const today = format(new Date(), "d 'de' MMMM", { locale: ptBR })

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900 py-12 px-4">
            <div className="max-w-2xl mx-auto space-y-8">
                <div className="text-center space-y-2">
                    <h1 className="text-3xl font-bold">Diário das Emoções</h1>
                    <p className="text-muted-foreground">Check-in de hoje, {today}</p>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Como você está hoje?</CardTitle>
                        <CardDescription>Reserve um momento para se escutar.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <DiaryForm />
                    </CardContent>
                </Card>

                <DiaryHistory />
            </div>
        </div>
    )
}
