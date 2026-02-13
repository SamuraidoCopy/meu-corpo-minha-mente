'use client'

import { useState, useEffect } from 'react'
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getMonthlyMoods } from './history-actions'
import { ptBR } from 'date-fns/locale'

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
        <Card className="mt-8">
            <CardHeader>
                <CardTitle>Seu Histórico</CardTitle>
            </CardHeader>
            <CardContent className="flex justify-center">
                <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    locale={ptBR}
                    modifiers={modifiers}
                    modifiersStyles={modifiersStyles}
                    className="rounded-md border"
                />
                {/* Detail view for selected date could go here */}
            </CardContent>
        </Card>
    )
}
