import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { OnboardingForm } from './onboarding-form'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"

export default async function OnboardingPage({ searchParams }: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    const { inspect } = await searchParams

    if (!user) {
        redirect('/login')
    }

    // Check if redirect is needed (already completed or admin)
    const { data: profile } = await supabase
        .from('profiles')
        .select('onboarding_completed, role')
        .eq('id', user.id)
        .single()
    const isAdmin = profile?.role === 'admin'

    // Only redirect non-admins if they finished or admins if they didn't ask for inspection
    if (!isAdmin) {
        if (profile?.onboarding_completed) {
            redirect('/')
        }
    } else if (inspect !== 'true') {
        // Admins go to dashboard by default if they just hit the URL normally
        redirect('/admin')
    }

    return (
        <div className="flex min-h-screen w-full items-center justify-center px-4 relative overflow-hidden mesh-gradient">
            <div className="w-full max-w-lg z-10 animate-in zoom-in-95 fade-in duration-700">
                <Card className="glass border-white/20 shadow-2xl">
                    <CardHeader className="text-left">
                        <CardTitle className="text-3xl font-serif text-foreground/90">
                            Boas-vindas ao <span className="text-primary italic">Meu Corpo Minha Mente</span>
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
