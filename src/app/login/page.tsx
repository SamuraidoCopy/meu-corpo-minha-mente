import { LoginForm } from './login-form'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"

export default function LoginPage() {
    return (
        <div className="flex min-h-screen w-full items-center justify-center px-4 relative overflow-hidden mesh-gradient">
            <div className="w-full max-w-sm z-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
                <Card className="glass border-white/20">
                    <CardHeader className="text-center">
                        <CardTitle className="text-3xl font-serif text-foreground/90">
                            Bem-vinda
                        </CardTitle>
                        <CardDescription className="text-foreground/60">
                            Sua jornada de equilíbrio e autoconhecimento começa aqui.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <LoginForm />
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
