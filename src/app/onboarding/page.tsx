import { OnboardingForm } from './onboarding-form'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"

export default function OnboardingPage() {
    return (
        <div className="flex min-h-screen w-full items-center justify-center p-4 bg-zinc-50 dark:bg-zinc-900">
            <Card className="w-full max-w-lg">
                <CardHeader>
                    <CardTitle className="text-2xl">Bem-vinda ao "Meu Corpo Minha Mente"</CardTitle>
                    <CardDescription>
                        Para começarmos, precisamos saber um pouco mais sobre você.
                        Essas informações ajudarão a personalizar sua jornada.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <OnboardingForm />
                </CardContent>
            </Card>
        </div>
    )
}
