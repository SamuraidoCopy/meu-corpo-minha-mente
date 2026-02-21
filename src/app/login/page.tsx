import { LoginForm } from './login-form'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"

export default function LoginPage() {
    return (
        <div className="flex min-h-screen w-full items-center justify-center px-4 relative overflow-hidden mesh-gradient">
            <div className="w-full max-w-sm z-10 animate-in fade-in slide-in-from-bottom-8 duration-700 flex flex-col items-center">
                <img
                    src="/images/logo-mapa-raiz.png"
                    alt="O Mapa da Raiz"
                    className="h-16 mb-8 drop-shadow-md object-contain"
                />
                <Card className="glass border-white/20 w-full">
                    <CardHeader className="text-center">
                        <CardTitle className="text-3xl font-serif text-foreground/90">
                            Boas-vindas
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
