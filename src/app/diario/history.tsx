'use client'

import { useState, useEffect } from 'react'
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getMonthlyMoods } from './history-actions'
import { ptBR } from 'date-fns/locale/pt-BR'

type Entry = {
    entry_date: string
    mood: string
    energy_level: number
}

export function DiaryHistory() {
    const [date, setDate] = useState<Date | undefined>(new Date())
    const [entries, setEntries] = useState<Entry[]>([])

    useEffect(() => {
        if (date) {
            getMonthlyMoods(date).then(setEntries)
        }
    }, [date])

    // Function to customize day rendering
    const modifiers = {
        hasEntry: (day: Date) => {
            const dateStr = day.toISOString().split('T')[0]
            return entries.some(e => e.entry_date === dateStr)
        }
    }

    const modifiersStyles = {
        hasEntry: {
            fontWeight: 'bold',
            textDecoration: 'underline',
            color: 'var(--primary)'
        }
    }

    return (
        <Card className="glass border-white/20 rounded-[2.5rem] shadow-xl overflow-hidden animate-in fade-in slide-in-from-bottom-6 duration-700 delay-200">
            <CardHeader className="text-center pt-8 border-b border-foreground/5">
                <CardTitle className="text-xl font-serif">Sua Constelação de Emoções</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center p-8">
                <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    locale={ptBR}
                    modifiers={modifiers}
                    modifiersStyles={modifiersStyles}
                    className="p-4 bg-white/30 rounded-3xl border border-white/40 shadow-inner"
                />
                <div className="mt-8 flex gap-6 text-[10px] uppercase tracking-[0.2em] font-bold text-foreground/30">
                    <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-primary" />
                        Houve Registro
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-wellness-gold" />
                        Dia Selecionado
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
