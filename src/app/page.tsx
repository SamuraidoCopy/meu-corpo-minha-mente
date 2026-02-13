import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { ELEMENTS, ElementType } from '@/lib/tcm-data'

export default async function Home() {
  const supabase = createClient()
  const { data: { user } } = await (await supabase).auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Check valid profile
  const { data: profile } = await (await supabase)
    .from('profiles')
    .select('onboarding_completed, dominant_element')
    .eq('id', user.id)
    .single()

  if (!profile || !profile.onboarding_completed) {
    redirect('/onboarding')
  }

  const diagnosis = profile.dominant_element as ElementType | null
  const elementInfo = diagnosis ? ELEMENTS[diagnosis] : null

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8 bg-zinc-50 dark:bg-zinc-900 transition-colors animate-in fade-in duration-500">
      <div className="max-w-4xl w-full text-center space-y-8">
        <h1 className="text-4xl font-bold text-zinc-800 dark:text-zinc-100">
          Bem-vinda, {user.user_metadata.full_name?.split(' ')[0] || 'Aluna'}.
        </h1>

        {diagnosis && elementInfo ? (
          <div className={`p-6 rounded-xl ${elementInfo.color} text-white shadow-lg transform hover:scale-105 transition-transform duration-300`}>
            <h2 className="text-2xl font-bold mb-2">Seu Elemento Dominante: {elementInfo.name}</h2>
            <p className="text-white/90">{elementInfo.emotion} • {elementInfo.organ}</p>
          </div>
        ) : (
          <p className="text-lg text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto">
            Seu diário de autoconhecimento está pronto. Comece investigando os sinais do seu corpo.
          </p>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
          {/* Card Mapa da Raiz */}
          <Card className="hover:shadow-lg transition-shadow cursor-pointer border-2 border-transparent hover:border-zinc-200 dark:hover:border-zinc-700">
            <CardHeader>
              <CardTitle className="flex items-center justify-center gap-2">
                <span>🗺️</span> O Mapa da Raiz
              </CardTitle>
              <CardDescription>
                Identifique desequilíbrios através dos sinais no seu rosto.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full" variant={diagnosis ? "outline" : "default"}>
                <Link href="/mapa">Acessar Mapa</Link>
              </Button>
            </CardContent>
          </Card>

          {/* Card Diagnóstico (Wizard) */}
          <Card className="hover:shadow-lg transition-shadow cursor-pointer border-2 border-transparent hover:border-zinc-200 dark:hover:border-zinc-700">
            <CardHeader>
              <CardTitle className="flex items-center justify-center gap-2">
                <span>🔍</span> Investigação
              </CardTitle>
              <CardDescription>
                {diagnosis
                  ? "Refazer sua análise de sintomas."
                  : "Descubra seu Elemento Dominante através dos sintomas."}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full" variant={diagnosis ? "secondary" : "default"}>
                <Link href="/diagnostico">
                  {diagnosis ? "Refazer Diagnóstico" : "Iniciar Investigação"}
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}
