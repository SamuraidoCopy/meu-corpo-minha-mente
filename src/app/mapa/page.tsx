'use client'

import { useState } from 'react'
import Link from 'next/link'
import { FacialMap } from '@/components/facial-map'
import { FACIAL_ZONES, FacialZone, ELEMENTS } from '@/lib/tcm-data'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function MapaPage() {
    const [selectedZone, setSelectedZone] = useState<FacialZone | null>(null)

    return (
        <div className="flex flex-col md:flex-row min-h-screen p-4 gap-6 bg-zinc-50 dark:bg-zinc-900">

            {/* Left Column: Interactive Map */}
            <div className="flex-1 flex items-center justify-center bg-white dark:bg-zinc-800 rounded-xl shadow-sm p-8">
                <div className="w-full max-w-md">
                    <h2 className="text-xl font-semibold text-center mb-6">Toque em uma área</h2>
                    <FacialMap
                        onSelectZone={setSelectedZone}
                        selectedZoneId={selectedZone?.id}
                    />
                </div>
            </div>

            {/* Right Column: Info Panel */}
            <div className="flex-1 max-w-md mx-auto w-full">
                {selectedZone ? (
                    <Card className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <CardHeader className={`${ELEMENTS[selectedZone.element].color} text-white rounded-t-xl`}>
                            <CardTitle>{selectedZone.name}</CardTitle>
                            <CardDescription className="text-white/90">
                                Elemento: {selectedZone.element} ({ELEMENTS[selectedZone.element].emotion})
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="pt-6 space-y-4">
                            <p className="text-lg leading-relaxed">{selectedZone.description}</p>

                            <div className="bg-zinc-100 dark:bg-zinc-800 p-4 rounded-lg">
                                <h4 className="font-semibold mb-2 text-sm uppercase tracking-wide opacity-70">Sinais Comuns</h4>
                                <p className="text-sm">Rugas profundas, mudanças de coloração, manchas ou tensão muscular nesta região.</p>
                            </div>

                            <Button className="w-full" size="lg" asChild>
                                <Link href="/diagnostico">Investigar Sintomas</Link>
                            </Button>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="h-full flex flex-col items-center justify-center text-center space-y-4 text-zinc-400">
                        <p className="text-lg">Selecione uma parte do rosto para ver detalhes.</p>
                    </div>
                )}
            </div>
        </div>
    )
}
