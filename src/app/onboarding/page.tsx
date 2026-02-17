import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { OnboardingForm } from './onboarding-form'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"

export default async function OnboardingPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    // Check if redirect is needed (already completed)
    const { data: profile } = await supabase
        .from('profiles')
        .select('onboarding_completed')
        .eq('id', user.id)
        .single()

    if (profile?.onboarding_completed) {
        redirect('/')
    }

    return (
        <div className="flex min-h-screen w-full items-center justify-center px-4 relative overflow-hidden mesh-gradient">
            <div className="w-full max-w-lg z-10 animate-in zoom-in-95 fade-in duration-700">
                <Card className="glass border-white/20 shadow-2xl">
                    <CardHeader className="text-center">
                        <CardTitle className="text-3xl font-serif text-foreground/90">
                            Bem-vinda ao <span className="text-primary italic">Meu Corpo Minha Mente</span>
                        </CardTitle>
                        <CardDescription className="text-lg text-foreground/70 mt-2">
                            Para começarmos, precisamos saber um pouco mais sobre você.
                            Essas informações ajudarão a personalizar sua jornada.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <OnboardingForm />
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
