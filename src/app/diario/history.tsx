'use client'

import { useState, useEffect, useRef } from 'react'
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { getMonthlyMoods } from './history-actions'
import { ptBR } from 'date-fns/locale/pt-BR'
import { Button } from '@/components/ui/button'
import { DownloadCloud } from 'lucide-react'
import { useReactToPrint } from 'react-to-print'

type Entry = {
    entry_date: string
    mood: string
    energy_level: number
    vital_energy_score: number
}

// Strategic Levels Logic (Internal Helper)
const getStrategicLevel = (score: number) => {
    if (score <= 39) return { color: 'bg-red-500', name: 'Energia Crítica', description: 'Drenagem intensa', hex: '#ef4444' }
    if (score <= 59) return { color: 'bg-orange-500', name: 'Energia Instável', description: 'Oscilação emocional', hex: '#f97316' }
    if (score <= 79) return { color: 'bg-yellow-400', name: 'Energia Funcional', description: 'Estável, mas ajustável', hex: '#facd06' }
    return { color: 'bg-green-500', name: 'Alta Vitalidade', description: 'Fluxo energético harmonioso', hex: '#22c55e' }
}

// DEDICATED PRINT COMPONENT (Brad Foster - Atomic Architecture)
// This is a zero-glass, zero-animation, 100% semantic version of the report
// designed purely for browser print engines.
function PrintOnlyReport({ userName, userAvatar, entries, feedback }: {
    userName: string,
    userAvatar: string,
    entries: Entry[],
    feedback: string | null
}) {
    return (
        <div className="hidden print:block bg-white text-black min-h-screen font-sans p-8">
            <style type="text/css" media="print">
                {`
                    @page { size: A4; margin: 15mm; }
                    body { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
                    .break-inside-avoid { break-inside: avoid; }
                `}
            </style>

            {/* Header Molecule */}
            <div className="flex justify-between items-center border-b-2 border-slate-200 pb-8 mb-8">
                <img src="/images/logo-mapa-raiz.png" alt="Logo" className="h-16 w-auto" />
                <div className="flex items-center gap-4 text-right">
                    <div>
                        <h1 className="text-2xl font-serif font-bold text-slate-900">{userName}</h1>
                        <p className="text-xs uppercase tracking-widest text-slate-500 font-bold">Relatório de Saúde Emocional</p>
                        <p className="text-[10px] text-slate-400 mt-1">{new Intl.DateTimeFormat('pt-BR', { dateStyle: 'long' }).format(new Date())}</p>
                    </div>
                    {userAvatar ? (
                        <img src={userAvatar} alt={userName} className="w-20 h-20 rounded-full border-4 border-slate-100 object-cover" />
                    ) : (
                        <div className="w-20 h-20 rounded-full bg-slate-100 border-4 border-slate-50 flex items-center justify-center text-slate-400 font-bold text-3xl uppercase">
                            {userName.charAt(0)}
                        </div>
                    )}
                </div>
            </div>

            {/* AI Insights Molecule */}
            {feedback && (
                <div className="mb-10 p-6 bg-slate-50 border-l-4 border-slate-400 rounded-r-lg break-inside-avoid">
                    <h2 className="text-[10px] uppercase tracking-widest font-bold text-slate-400 mb-2 font-sans">Diagnóstico de Inteligência</h2>
                    <p className="text-lg italic text-slate-800 leading-relaxed font-serif">"{feedback}"</p>
                </div>
            )}

            {/* Vital Energy Chart Molecule */}
            <div className="mb-12 break-inside-avoid">
                <h2 className="text-xl font-serif font-bold mb-6 border-b border-slate-100 pb-2 text-slate-800">Tendência do Nível de Vitalidade Energética (NVE)</h2>
                <div className="h-40 w-full flex items-end justify-between gap-1 border-b border-slate-200 pb-2 relative mb-2">
                    {/* Simplified Grid Lines */}
                    {[100, 79, 59, 39].map(line => (
                        <div key={line} className="absolute left-0 w-full border-t border-slate-100 border-dashed" style={{ bottom: `${line}%` }}>
                            <span className="absolute -left-6 -top-2 text-[8px] text-slate-300 font-bold">{line}</span>
                        </div>
                    ))}

                    {entries.map((entry, i) => {
                        const level = getStrategicLevel(entry.vital_energy_score);
                        return (
                            <div key={i} className="flex-1 flex flex-col justify-end h-full">
                                <div
                                    className="w-full"
                                    style={{
                                        height: `${Math.max(2, entry.vital_energy_score)}%`,
                                        backgroundColor: level.hex
                                    }}
                                />
                            </div>
                        )
                    })}
                </div>
                <div className="flex justify-between text-[8px] text-slate-400 font-bold tracking-widest">
                    <span>INÍCIO DO PERÍODO</span>
                    <span>ATUAL</span>
                </div>

                {/* Legend Molecule */}
                <div className="flex gap-6 mt-8 justify-center border-t border-slate-50 pt-4">
                    {[
                        { color: '#ef4444', label: 'Crítica (0-39)' },
                        { color: '#f97316', label: 'Instável (40-59)' },
                        { color: '#facd06', label: 'Funcional (60-79)' },
                        { color: '#22c55e', label: 'Alta (80-100)' }
                    ].map((item, i) => (
                        <div key={i} className="flex items-center gap-2 text-[9px] font-bold text-slate-500 uppercase tracking-tighter">
                            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                            {item.label}
                        </div>
                    ))}
                </div>
            </div>

            {/* Detailed History Organism */}
            <div className="mt-12">
                <h2 className="text-xl font-serif font-bold mb-6 border-b border-slate-100 pb-2 text-slate-800">Histórico de Registros</h2>
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b-2 border-slate-200">
                            <th className="py-3 text-[10px] uppercase tracking-widest text-slate-400 font-bold">Data</th>
                            <th className="py-3 text-[10px] uppercase tracking-widest text-slate-400 font-bold">Estado Vital</th>
                            <th className="py-3 text-[10px] uppercase tracking-widest text-slate-400 font-bold">Interpretação</th>
                            <th className="py-3 text-[10px] uppercase tracking-widest text-slate-400 font-bold text-right">Score</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {[...entries].reverse().map((entry, i) => {
                            const level = getStrategicLevel(entry.vital_energy_score);
                            const [y, m, d] = entry.entry_date.split('-');
                            return (
                                <tr key={i} className="break-inside-avoid">
                                    <td className="py-3 text-sm font-bold text-slate-700">{d}/{m}/{y}</td>
                                    <td className="py-3">
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: level.hex }} />
                                            <span className="text-[10px] font-bold text-slate-700 uppercase">{level.name}</span>
                                        </div>
                                    </td>
                                    <td className="py-3 text-xs text-slate-500 italic font-serif leading-none">{level.description}</td>
                                    <td className="py-3 text-right font-serif font-bold text-slate-900 text-lg">{entry.vital_energy_score}</td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
            </div>

            <footer className="mt-20 border-t border-slate-100 pt-8 text-center">
                <p className="text-[10px] text-slate-300 uppercase tracking-[0.3em]">© 2026 O Mapa da Raiz • Gerado via Inteligência Artificial</p>
            </footer>
        </div>
    )
}

export function DiaryHistory({ userName = 'Usuário', userAvatar = '' }: { userName?: string, userAvatar?: string }) {
    const [date, setDate] = useState<Date | undefined>(new Date())
    const [entries, setEntries] = useState<Entry[]>([])
    const [feedback, setFeedback] = useState<string | null>(null)
    const contentRef = useRef<HTMLDivElement>(null)

    const handlePrint = useReactToPrint({
        contentRef,
        documentTitle: `Relatorio-Saude-${userName.replace(/\s+/g, '-')}`,
    })

    useEffect(() => {
        if (date) {
            getMonthlyMoods(date).then(res => {
                setEntries(res.entries || [])
                setFeedback(res.feedback || null)
            })
        }
    }, [date])

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
        <div className="space-y-6">
            <div className="flex justify-end animate-in fade-in fill-mode-both">
                <Button onClick={() => handlePrint()} variant="outline" className="gap-2 border-primary/20 hover:bg-primary/5">
                    <DownloadCloud className="w-4 h-4" />
                    Exportar Relatório PDF
                </Button>
            </div>

            <div ref={contentRef}>
                {/* DEDICATED PRINT UI - BRAD FOSTER ATOMIC DESIGN */}
                <PrintOnlyReport
                    userName={userName}
                    userAvatar={userAvatar}
                    entries={entries}
                    feedback={feedback}
                />

                {/* INTERACTIVE DASHBOARD UI - UX EXPERT EXPERIENCE */}
                <div className="animate-in fade-in slide-in-from-bottom-6 duration-700 delay-200 print:hidden space-y-8">
                    {feedback && (
                        <div className="bg-wellness-sage/10 border border-wellness-sage/20 rounded-3xl p-6 text-wellness-sage flex items-start gap-4">
                            <span className="text-3xl">🌿</span>
                            <div>
                                <h4 className="font-bold uppercase tracking-widest text-[10px] mb-2">Feedback Inteligente</h4>
                                <p className="text-sm font-medium leading-relaxed">{feedback}</p>
                            </div>
                        </div>
                    )}

                    <Card className="glass border-white/20 rounded-[2.5rem] shadow-xl overflow-hidden">
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

                    {entries.length > 0 && (
                        <Card className="glass border-white/20 rounded-[2.5rem] shadow-xl overflow-hidden">
                            <CardHeader className="text-center pt-8 pb-4">
                                <CardTitle className="text-xl font-serif">Nível de Vitalidade Energética (NVE)</CardTitle>
                                <CardDescription className="text-xs uppercase tracking-[0.2em] mt-2">
                                    Seu score com base nas Faixas Estratégicas
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="p-8 pt-4">
                                <div className="h-40 w-full flex items-end justify-between gap-1 mt-4 border-b border-foreground/10 pb-4 relative">
                                    {/* Y-axis indicators */}
                                    <div className="absolute left-0 bottom-1/4 w-full h-[1px] border-t border-dashed border-red-500/20 z-0">
                                        <span className="absolute -top-4 -left-2 text-[8px] text-red-500/50">39</span>
                                    </div>
                                    <div className="absolute left-0 bottom-2/4 w-full h-[1px] border-t border-dashed border-orange-500/20 z-0">
                                        <span className="absolute -top-4 -left-2 text-[8px] text-orange-500/50">59</span>
                                    </div>
                                    <div className="absolute left-0 bottom-[79%] w-full h-[1px] border-t border-dashed border-yellow-500/30 z-0">
                                        <span className="absolute -top-4 -left-2 text-[8px] text-yellow-600/50">79</span>
                                    </div>
                                    <div className="absolute left-0 top-0 w-full h-[1px] border-t border-dashed border-green-500/30 z-0">
                                        <span className="absolute -top-4 -left-2 text-[8px] text-green-600/50">100</span>
                                    </div>

                                    {entries.map((entry, i) => {
                                        const level = getStrategicLevel(entry.vital_energy_score);

                                        return (
                                            <div key={i} className="relative flex flex-col items-center flex-1 group z-10 h-full justify-end cursor-pointer">
                                                <div
                                                    className={`w-full max-w-[12px] md:max-w-[20px] transition-all rounded-t-sm opacity-80 hover:opacity-100 ${level.color} shadow-sm border border-black/5`}
                                                    style={{ height: `${entry.vital_energy_score}%` }}
                                                ></div>
                                            </div>
                                        )
                                    })}
                                </div>
                                <div className="flex justify-between text-[10px] text-foreground/40 mt-4 font-bold tracking-wider">
                                    <span>INÍCIO DO MÊS</span>
                                    <span>ATUAL/FIM</span>
                                </div>

                                <div className="mt-8 pt-6 border-t border-foreground/5 grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <div className="flex items-center gap-2 text-[10px] uppercase font-bold tracking-wide text-foreground/60">
                                        <div className="w-3 h-3 rounded-sm bg-red-500" />
                                        0-39 (Crítica)
                                    </div>
                                    <div className="flex items-center gap-2 text-[10px] uppercase font-bold tracking-wide text-foreground/60">
                                        <div className="w-3 h-3 rounded-sm bg-orange-500" />
                                        40-59 (Instável)
                                    </div>
                                    <div className="flex items-center gap-2 text-[10px] uppercase font-bold tracking-wide text-foreground/60">
                                        <div className="w-3 h-3 rounded-sm bg-yellow-400" />
                                        60-79 (Funcional)
                                    </div>
                                    <div className="flex items-center gap-2 text-[10px] uppercase font-bold tracking-wide text-foreground/60">
                                        <div className="w-3 h-3 rounded-sm bg-green-500" />
                                        80-100 (Alta Vitalidade)
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    )
}
