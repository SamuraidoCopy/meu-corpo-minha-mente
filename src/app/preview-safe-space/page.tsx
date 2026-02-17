'use client'

import { SafeSpaceTransition } from "@/components/onboarding/safe-space-transition"
import { Button } from "@/components/ui/button"
import { useState } from "react"

export default function PreviewPage() {
    const [key, setKey] = useState(0) // State to force re-render

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-background">
            <div className="absolute top-4 left-4 z-50">
                <Button variant="outline" onClick={() => setKey(prev => prev + 1)}>
                    Replay Animation
                </Button>
            </div>

            <SafeSpaceTransition
                key={key}
                onComplete={() => alert('Animação concluída! O usuário seria redirecionado agora.')}
            />
        </div>
    )
}
