import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { ELEMENTS, ElementType } from '@/lib/tcm-data'
import { SignOutButton } from '@/components/sign-out-button'

export default async function Home() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Check valid profile
  const { data: profile } = await supabase
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
    <main className="flex min-h-screen flex-col items-center justify-start py-12 px-6 md:px-12 relative overflow-hidden">

      <div className="max-w-5xl w-full space-y-12 z-10">
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-foreground/5 pb-8">
          <div className="space-y-1">
            <p className="text-sm uppercase tracking-[0.2em] text-foreground/40 font-medium">BEM-VINDA AO SEU ESPAÇO</p>
            <h1 className="text-5xl font-serif text-foreground/90">
              Olá, <span className="italic text-primary">{user.user_metadata.full_name?.split(' ')[0] || 'Aluna'}</span>.
            </h1>
          </div>
          <div className="flex gap-3 items-center">
            <Button variant="outline" className="rounded-full px-6 border-foreground/10 hover:bg-foreground/5 text-xs uppercase tracking-widest" asChild>
              <Link href="/admin">Painel Admin</Link>
            </Button>
            <SignOutButton />
          </div>
        </header>

        <section className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main Status / Element Badge */}
          <div className="lg:col-span-8 space-y-8">
            {diagnosis && elementInfo ? (
              <div className="glass rounded-[2rem] p-10 relative overflow-hidden group hover:shadow-2xl transition-all duration-500 border-white/40">
                <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                  <span className="text-8xl">✨</span>
                </div>
                <div className="relative z-10 space-y-6">
                  <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-wellness-sage/10 text-wellness-sage text-xs font-bold uppercase tracking-wider">
                    Elemento Dominante
                  </div>
                  <h2 className="text-6xl font-serif text-foreground/90 leading-tight">
                    {elementInfo.name}
                  </h2>
                  <p className="text-xl text-foreground/60 max-w-xl leading-relaxed">
                    "{elementInfo.description}"
                  </p>
                  <div className="flex gap-4 pt-4 border-t border-foreground/5 font-medium">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-wellness-gold" />
                      <span className="text-sm text-foreground/70 tracking-wide uppercase italic">{elementInfo.emotion}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-wellness-sage" />
                      <span className="text-sm text-foreground/70 tracking-wide uppercase italic">{elementInfo.organ}</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="glass rounded-[2rem] p-12 text-center space-y-6 border-dashed border-2 border-foreground/10 bg-transparent shadow-none">
                <h2 className="text-3xl font-serif text-foreground/80 italic">Ainda não encontramos sua Raiz.</h2>
                <p className="text-foreground/50 max-w-md mx-auto">Complete sua investigação inicial para descobrir seu elemento dominante e começar a equilibrar seu corpo e mente.</p>
                <Button asChild className="h-14 px-10 rounded-full text-lg shadow-xl shadow-wellness-sage/20 bg-wellness-sage">
                  <Link href="/diagnostico">Iniciar Investigação</Link>
                </Button>
              </div>
            )}

            {/* Sub-grid for actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Mapa da Raiz */}
              <Link href="/mapa" className="group">
                <div className="glass rounded-3xl p-8 h-full border-white/30 group-hover:bg-white/60 transition-all group-hover:-translate-y-1">
                  <div className="w-12 h-12 rounded-2xl bg-wellness-sage/10 flex items-center justify-center text-2xl mb-6 group-hover:scale-110 transition-transform">🗺️</div>
                  <h3 className="text-xl font-serif mb-2">O Mapa da Raiz</h3>
                  <p className="text-sm text-foreground/50 leading-relaxed">Analise os sinais que o seu rosto revela sobre sua saúde interna.</p>
                </div>
              </Link>

              {/* Diário */}
              <Link href="/diario" className="group">
                <div className="glass rounded-3xl p-8 h-full border-white/30 group-hover:bg-white/60 transition-all group-hover:-translate-y-1">
                  <div className="w-12 h-12 rounded-2xl bg-wellness-gold/10 flex items-center justify-center text-2xl mb-6 group-hover:scale-110 transition-transform">🌿</div>
                  <h3 className="text-xl font-serif mb-2">Check-in Diário</h3>
                  <p className="text-sm text-foreground/50 leading-relaxed">Registre suas variações de energia e emoções ao longo do dia.</p>
                </div>
              </Link>
            </div>
          </div>

          {/* Sidebar / Secondary Info */}
          <div className="lg:col-span-4 space-y-8">
            <div className="glass rounded-3xl p-8 border-wellness-gold/10">
              <h3 className="text-sm uppercase tracking-widest text-foreground/40 font-bold mb-6 italic">Sua Jornada</h3>
              <div className="space-y-6">
                <div className="flex gap-4 items-start">
                  <div className="w-1 h-8 rounded-full bg-wellness-sage" />
                  <div>
                    <h4 className="text-sm font-bold text-foreground/80">Fase de Descoberta</h4>
                    <p className="text-xs text-foreground/50 mt-1">Identificando desequilíbrios elementares.</p>
                  </div>
                </div>
                <div className="flex gap-4 items-start opacity-40">
                  <div className="w-1 h-8 rounded-full bg-foreground/20" />
                  <div>
                    <h4 className="text-sm font-bold text-foreground/80">Harmonização</h4>
                    <p className="text-xs text-foreground/50 mt-1">Sugerido após 7 dias de diário.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-8 rounded-3xl bg-wellness-sage text-white shadow-xl shadow-wellness-sage/30 relative overflow-hidden">
              <div className="absolute top-[-20%] right-[-20%] w-[60%] h-[60%] bg-white/10 rounded-full blur-2xl" />
              <h3 className="text-xl font-serif relative z-10 mb-2 italic">Dica da Dra.</h3>
              <p className="text-sm text-white/80 relative z-10 leading-relaxed">
                "O equilíbrio não é um destino, mas uma prática diária. Ouça o que seu corpo diz hoje."
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
