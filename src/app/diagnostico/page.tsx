import { DiagnosisWizard } from './wizard'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function DiagnosticoPage() {
    const supabase = createClient()
    const { data: { user } } = await (await supabase).auth.getUser()

    if (!user) {
        redirect('/login')
    }

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900 py-12 px-4">
            <div className="max-w-4xl mx-auto mb-12 text-center space-y-4">
                <h1 className="text-3xl font-bold">Investigação Guiada</h1>
                <p className="text-muted-foreground max-w-xl mx-auto">
                    Responda com sinceridade. Não existe certo ou errado, apenas o que o seu corpo está dizendo agora.
                </p>
            </div>

            <DiagnosisWizard />
        </div>
    )
}
