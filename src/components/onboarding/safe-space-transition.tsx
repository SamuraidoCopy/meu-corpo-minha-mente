'use client'

import { useEffect, useState } from 'react'
import { cn } from "@/lib/utils"

interface SafeSpaceTransitionProps {
    onComplete: () => void;
    isProcessing?: boolean;
    userGender?: string;
}

export function SafeSpaceTransition({ onComplete, isProcessing, userGender = 'Feminino' }: SafeSpaceTransitionProps) {
    const [step, setStep] = useState(0)
    const [animationDone, setAnimationDone] = useState(false)

    useEffect(() => {
        let mounted = true;

        const sequence = async () => {
            // Step 1: "Entendo o que você passou..."
            await new Promise(r => setTimeout(r, 800))
            if (!mounted) return;
            setStep(1)

            // Step 2: "Agora você está segura."
            await new Promise(r => setTimeout(r, 2200))
            if (!mounted) return;
            setStep(2)

            // Step 3: "Tudo mudará."
            await new Promise(r => setTimeout(r, 2200))
            if (!mounted) return;
            setStep(3)

            // Complete animation part
            await new Promise(r => setTimeout(r, 2200))
            if (!mounted) return;
            setAnimationDone(true)
            onComplete()
        }

        sequence()

        return () => {
            mounted = false;
        }
    }, [])

    return (
        <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#F9F6F1] animate-breathe">
            <div className="absolute inset-0 bg-gradient-to-br from-wellness-sage/10 via-transparent to-wellness-gold/5 opacity-50" />
            <div className="max-w-2xl px-8 text-center space-y-8 relative z-10 transition-all duration-1000">
                <div className={cn("space-y-8 transition-all duration-1000", (animationDone && isProcessing) ? "opacity-30 scale-95 blur-sm" : "opacity-100")}>
                    <h1 className={cn(
                        "text-4xl md:text-5xl font-serif text-foreground/90 leading-tight transition-all duration-1000",
                        step >= 1 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
                    )}>
                        "Entendo o que você passou..."
                    </h1>

                    <h2 className={cn(
                        "text-3xl md:text-4xl font-serif text-wellness-sage italic transition-all duration-1000 delay-300",
                        step >= 2 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
                    )}>
                        Agora você está segur{userGender === 'Masculino' ? 'o' : 'a'}.
                    </h2>

                    <h3 className={cn(
                        "text-2xl md:text-3xl font-serif text-foreground/60 transition-all duration-1000 delay-300",
                        step >= 3 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
                    )}>
                        Tudo mudará.
                    </h3>
                </div>

                {/* Processing State */}
                {animationDone && isProcessing && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center space-y-4 animate-in fade-in duration-1000">
                        <div className="w-12 h-12 border-4 border-wellness-sage/20 border-t-wellness-sage rounded-full animate-spin" />
                        <p className="text-wellness-sage font-serif italic text-xl animate-pulse">Preparando seu refúgio...</p>
                    </div>
                )}
            </div>
        </div>
    )
}

