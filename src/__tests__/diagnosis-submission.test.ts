import { describe, expect, it } from 'vitest'

import {
    buildDiagnosticRecord,
    parseDiagnosticSubmission,
} from '@/lib/diagnosis-submission'
import { getTcmQuestions } from '@/lib/tcm-data'

const allNegative = Object.fromEntries(getTcmQuestions().map((question) => [question.id, false]))

function payload(overrides: Record<string, unknown> = {}) {
    return {
        facialZoneIds: [],
        questionAnswers: allNegative,
        tiebreakAnswers: {},
        reflectionAnswers: {},
        ...overrides,
    }
}

describe('contrato server-side do diagnóstico', () => {
    it('aceita exatamente as 15 perguntas e calcula insuficiente sem fallback', () => {
        const parsed = parseDiagnosticSubmission(payload())

        expect(parsed.main.kind).toBe('insufficient')
        expect(parsed.final.elements).toEqual([])
        expect(buildDiagnosticRecord(parsed).result_kind).toBe('insufficient')
    })

    it('rejeita pergunta ausente ou desconhecida', () => {
        const missing = { ...allNegative }
        delete missing.fogo_1
        expect(() => parseDiagnosticSubmission(payload({ questionAnswers: missing }))).toThrow()
        expect(() => parseDiagnosticSubmission(payload({
            questionAnswers: { ...allNegative, pergunta_forjada: false },
        }))).toThrow()
    })

    it('rejeita zona facial desconhecida e duplicada', () => {
        expect(() => parseDiagnosticSubmission(payload({ facialZoneIds: ['nao_existe'] }))).toThrow()
        expect(() => parseDiagnosticSubmission(payload({ facialZoneIds: ['ponto_figado', 'ponto_figado'] }))).toThrow()
    })

    it('ignora resultado enviado pelo cliente e calcula o elemento pelo relato', () => {
        const answers = { ...allNegative, fogo_1: true }
        const parsed = parseDiagnosticSubmission(payload({
            questionAnswers: answers,
            dominantElement: 'Água',
        }))

        expect(parsed.final.elements).toEqual(['Fogo'])
        expect(buildDiagnosticRecord(parsed).result_elements).toEqual(['Fogo'])
    })

    it('exige somente os elementos empatados no desempate', () => {
        const answers = { ...allNegative, fogo_1: true, terra_1: true }

        expect(() => parseDiagnosticSubmission(payload({
            questionAnswers: answers,
            tiebreakAnswers: { Fogo: 2 },
        }))).toThrow()

        const parsed = parseDiagnosticSubmission(payload({
            questionAnswers: answers,
            tiebreakAnswers: { Fogo: 2, Terra: 1 },
        }))
        expect(parsed.final.elements).toEqual(['Fogo'])
    })

    it('preserva resultado combinado quando a comparação não separa', () => {
        const answers = { ...allNegative, fogo_1: true, terra_1: true }
        const parsed = parseDiagnosticSubmission(payload({
            questionAnswers: answers,
            tiebreakAnswers: { Fogo: 2, Terra: 2 },
            comparisonChoice: 'none',
        }))

        expect(parsed.final.kind).toBe('combined')
        expect(buildDiagnosticRecord(parsed).result_kind).toBe('combined')
    })

    it('rejeita chaves de reflexão que não existem no resultado', () => {
        expect(() => parseDiagnosticSubmission(payload({
            questionAnswers: { ...allNegative, fogo_1: true },
            reflectionAnswers: { '2': 'reflexão forjada' },
        }))).toThrow()
    })
})
