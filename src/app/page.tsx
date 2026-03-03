import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { ELEMENTS, ElementType } from '@/lib/tcm-data'
import { SignOutButton } from '@/components/sign-out-button'
import { Map as MapIcon, Leaf, Brain, Activity } from 'lucide-react'
import { UserAvatar } from '@/components/user-avatar'
import { FireIcon, EarthIcon, WoodIcon, MetalIcon, WaterIcon } from '@/components/element-icons'

const IconMap = {
  Flame: FireIcon,
  Mountain: EarthIcon,
  Wind: MetalIcon,
  Droplets: WaterIcon,
  TreePine: WoodIcon,
}

const DICAS_DA_DOUTORA = [
  "Lembre-se: seu fígado precisa de movimento e seu coração de pausas. Respire fundo e traga a atenção para o agora. — Dra. Ranieli & Dra. Cleucia",
  "O corpo nunca mente. Quando a mente tenta disfarçar a exaustão, ele nos avisa através dos pequenos sinais. Honre seu cansaço. — Dra. Ranieli & Dra. Cleucia",
  "A verdadeira saúde não é a ausência perfeita de desequilíbrios, mas a resiliência para voltar ao seu eixo. Você está no caminho seguro. — Dra. Ranieli & Dra. Cleucia",
  "Observe seu corpo sem julgamentos. Cada sintoma é apenas um mensageiro tentando te proteger. Ouça-o com amor e compaixão. — Dra. Ranieli & Dra. Cleucia"
];

export default async function Home() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Check valid profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('onboarding_completed, dominant_element, gender, full_name, avatar_url')
    .eq('id', user.id)
    .single()

  if (!profile || !profile.onboarding_completed) {
    redirect('/onboarding')
  }

  const diagnosis = profile.dominant_element as ElementType | null
  const elementInfo = diagnosis ? ELEMENTS[diagnosis] : null

  const firstName = profile?.full_name?.split(' ')[0] || user.user_metadata.full_name?.split(' ')[0] || (profile?.gender === 'Masculino' ? 'Aluno' : 'Aluna')
  const avatarUrl = profile?.avatar_url || user.user_metadata.avatar_url

  return (
    <main
      className={`flex min-h-screen flex-col items-center justify-start pt-32 md:pt-28 pb-12 px-6 md:px-12 relative overflow-hidden ${elementInfo ? elementInfo.theme.pageBgClass : ''}`}
      style={elementInfo ? elementInfo.theme.cssVars as React.CSSProperties : undefined}
    >
      <Link href="/" className="absolute top-6 left-6 md:top-8 md:left-8 z-50">
        <img
          src="/images/logo-mapa-raiz.png"
          alt="O Mapa da Raiz"
          className="h-8 md:h-12 w-auto object-contain opacity-90 drop-shadow-sm hover:opacity-100 transition-opacity"
        />
      </Link>

      <div className="max-w-5xl w-full space-y-8 z-10">
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-foreground/5 pb-6">
          <div className="flex gap-6 items-center">
            {/* Profile Picture */}
            <UserAvatar avatarUrl={avatarUrl} firstName={firstName} />

            <div className="space-y-1">
              <p className="text-sm uppercase tracking-[0.2em] text-foreground/40 font-medium">BEM-VIND{profile?.gender === 'Masculino' ? 'O' : 'A'} AO SEU ESPAÇO</p>
              <h1 className="text-5xl font-serif text-foreground/90">
                Olá, <span className="italic text-primary">{firstName}</span>.
              </h1>
            </div>
          </div>
          <div className="flex gap-3 items-center">
            <SignOutButton />
          </div>
        </header>

        <section className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main Status / Element Badge */}
          <div className="lg:col-span-8 space-y-8">
            {diagnosis && elementInfo ? (
              <div className={`rounded-[2rem] p-10 relative overflow-hidden group hover:shadow-2xl hover:scale-[1.01] transition-all duration-500 border backdrop-blur-md ${elementInfo.theme.gradientBorder} ${elementInfo.theme.cardBg}`}>
                <div className={`absolute top-6 right-6 p-2 transition-all group-hover:scale-110 duration-700 drop-shadow-xl`}>
                  {(() => {
                    const ElementIcon = IconMap[elementInfo.icon]
                    return <ElementIcon className="w-28 h-28" />
                  })()}
                </div>
                <div className="relative z-10 space-y-6 flex flex-col items-center text-center">
                  <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider ${elementInfo.theme.badgeBg} ${elementInfo.theme.badgeText} self-start md:self-center`}>
                    Elemento Dominante
                  </div>
                  <h2 className={`text-6xl font-serif leading-tight ${elementInfo.theme.titleColor}`}>
                    {elementInfo.name}
                  </h2>
                  <p className="text-xl text-foreground/60 max-w-xl leading-relaxed mx-auto">
                    "{elementInfo.description}"
                  </p>
                  <div className="flex flex-wrap justify-center gap-6 pt-6 border-t border-foreground/5 font-medium w-full">
                    <div className="flex items-center gap-2">
                      <Brain className="w-4 h-4 text-foreground/40" />
                      <span className="text-sm text-foreground/70 tracking-wide uppercase italic">{elementInfo.emotion}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Activity className="w-4 h-4 text-foreground/40" />
                      <span className="text-sm text-foreground/70 tracking-wide uppercase italic">{elementInfo.organ}</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="glass rounded-[2rem] p-12 text-center space-y-6 border-dashed border-2 border-foreground/10 bg-transparent shadow-none">
                <h2 className="text-3xl font-serif text-foreground/80 italic">Ainda não encontramos sua Raiz.</h2>
                <p className="text-foreground/50 max-w-md mx-auto">Complete sua investigação inicial para descobrir seu elemento dominante e começar a equilibrar seu corpo e mente.</p>
                <Button asChild className="h-14 px-10 rounded-full text-lg shadow-xl shadow-primary/20 bg-primary">
                  <Link href="/mapa">Iniciar Investigação</Link>
                </Button>
              </div>
            )}

            {/* Sub-grid for actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Mapa da Raiz */}
              <Link href={diagnosis ? "/mapa/v2" : "/mapa"} className="group">
                <div className="glass rounded-3xl p-8 h-full border-white/30 group-hover:bg-white/60 transition-all group-hover:-translate-y-1">
                  <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-6 group-hover:scale-110 transition-transform">
                    <MapIcon size={24} strokeWidth={1.5} />
                  </div>
                  <h3 className="text-xl font-serif mb-2">{diagnosis ? 'O Mapa das Expressões' : 'O Mapa da Raiz'}</h3>
                  <p className="text-sm text-foreground/50 leading-relaxed">
                    {diagnosis
                      ? "Aprofunde na sua Raiz e dores através das suas marcas de expressão facial."
                      : "Analise os sinais que o seu rosto revela sobre sua saúde interna."}
                  </p>
                </div>
              </Link>

              {/* Diário */}
              <Link href="/diario" className="group">
                <div className="glass rounded-3xl p-8 h-full border-white/30 group-hover:bg-white/60 transition-all group-hover:-translate-y-1">
                  <div className="w-12 h-12 rounded-2xl bg-secondary/10 flex items-center justify-center text-secondary mb-6 group-hover:scale-110 transition-transform">
                    <Leaf size={24} strokeWidth={1.5} />
                  </div>
                  <h3 className="text-xl font-serif mb-2">Check-in Diário</h3>
                  <p className="text-sm text-foreground/50 leading-relaxed">Registre suas variações de energia e emoções ao longo do dia.</p>
                </div>
              </Link>
            </div>
          </div>

          {/* Sidebar / Secondary Info */}
          <div className="lg:col-span-4 space-y-8">
            <div className="glass rounded-3xl p-8 border-secondary/10">
              <h3 className="text-sm uppercase tracking-widest text-foreground/40 font-bold mb-6 italic">Sua Jornada</h3>
              <div className="space-y-6">
                <div className="flex gap-4 items-start">
                  <div className="w-1 h-8 rounded-full bg-primary" />
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

            <div className="p-8 rounded-3xl bg-primary text-white shadow-xl shadow-primary/30 relative overflow-hidden">
              <div className="absolute top-[-20%] right-[-20%] w-[60%] h-[60%] bg-white/10 rounded-full blur-2xl" />
              <h3 className="text-xl font-serif relative z-10 mb-2 italic">Dica das Doutoras</h3>
              <p className="text-sm text-white/80 relative z-10 leading-relaxed">
                &quot;{DICAS_DA_DOUTORA[Math.floor(Math.random() * DICAS_DA_DOUTORA.length)]}&quot;
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
