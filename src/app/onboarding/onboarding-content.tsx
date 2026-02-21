'use client'

import { OnboardingForm } from './onboarding-form'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"

export function OnboardingContent() {
    return (
        <div
            className="w-full max-w-lg z-10 animate-in fade-in zoom-in-95 duration-500"
        >
            <Card className="glass border-white/20 shadow-2xl">
                <CardHeader className="text-center">
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
    )
}
