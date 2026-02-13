import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function Home() {
  const supabase = createClient()
  const { data: { user } } = await (await supabase).auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Check valid profile
  const { data: profile } = await (await supabase)
    .from('profiles')
    .select('onboarding_completed')
    .eq('id', user.id)
    .single()

  if (!profile || !profile.onboarding_completed) {
    redirect('/onboarding')
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8">
      <h1 className="text-4xl font-bold mb-4">Meu Corpo Minha Mente</h1>
      <p className="text-lg text-neutral-600 mb-8">
        Bem-vinda de volta. Seu mapa está pronto.
      </p>
      {/* TODO: Add Dashboard Components (Epic 3) */}
    </main>
  );
}
