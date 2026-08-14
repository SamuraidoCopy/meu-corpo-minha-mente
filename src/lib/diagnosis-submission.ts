import { z } from 'zod'

import {
    calculateFacialScores,
    calculateMainDiagnosis,
    calculateTiebreak,
    classifyFacialConvergence,
    ELEMENT_ORDER,
    DIAGNOSIS_ALGORITHM_VERSION as DOMAIN_ALGORITHM_VERSION,
    type ComparativeChoice,
} from '@/lib/diagnosis'
import { getTcmQuestions, type ElementType } from '@/lib/tcm-data'

export const DIAGNOSIS_ALGORITHM_VERSION = `${DOMAIN_ALGORITHM_VERSION}-contextual-tiebreak-2026-08-14`

const elementEnum = z.enum(ELEMENT_ORDER as unknown as [ElementType, ...ElementType[]])
const answersSchema = z.record(z.string(), z.boolean())
const tiebreakAnswersSchema = z.record(z.string(), z.number().int().min(0).max(3))
const reflectionAnswersSchema = z.record(z.string().regex(/^\d+$/), z.string().max(2_000))
export const facialZoneSelectionSchema = z.object({
    facialZoneIds: z.array(z.string().min(1).max(80)).max(30).default([]),
})

export const diagnosticSubmissionSchema = z.object({
    facialZoneIds: facialZoneSelectionSchema.shape.facialZoneIds,
    questionAnswers: answersSchema,
    tiebreakAnswers: tiebreakAnswersSchema.default({}),
    comparisonChoice: z.union([elementEnum, z.literal('none')]).optional(),
    reflectionAnswers: reflectionAnswersSchema.default({}),
})

export const diagnosisProgressSchema = z.object({
    questionAnswers: answersSchema.default({}),
    tiebreakAnswers: tiebreakAnswersSchema.default({}),
    comparisonChoice: z.union([elementEnum, z.literal('none')]).optional(),
    reflectionAnswers: reflectionAnswersSchema.default({}),
    progressRevision: z.number().int().nonnegative().default(0),
})

export type DiagnosticSubmission = z.infer<typeof diagnosticSubmissionSchema>
export type DiagnosisProgress = z.infer<typeof diagnosisProgressSchema>

type DiagnosisResult = ReturnType<typeof calculateMainDiagnosis> | ReturnType<typeof calculateTiebreak>

export type ParsedDiagnosticSubmission = DiagnosticSubmission & {
    facial: ReturnType<typeof calculateFacialScores>
    main: ReturnType<typeof calculateMainDiagnosis>
    final: DiagnosisResult
}

function assertCanonicalQuestionSet(questionAnswers: Record<string, boolean>) {
    const questions = getTcmQuestions()
    const expectedIds = new Set(questions.map((question) => question.id))
    const actualIds = Object.keys(questionAnswers)

    if (actualIds.length !== expectedIds.size || actualIds.some((id) => !expectedIds.has(id))) {
        throw new Error('As respostas devem conter exatamente as 15 perguntas canônicas.')
    }
}

function assertQuestionSubset(questionAnswers: Record<string, boolean>) {
    const expectedIds = new Set(getTcmQuestions().map((question) => question.id))
    if (Object.keys(questionAnswers).some((id) => !expectedIds.has(id))) {
        throw new Error('A avaliação contém uma pergunta desconhecida.')
    }
}

function assertCanonicalFacialZones(facialZoneIds: string[], facial: ReturnType<typeof calculateFacialScores>) {
    if (new Set(facialZoneIds).size !== facialZoneIds.length) {
        throw new Error('As zonas faciais não podem ser repetidas.')
    }
    if (facial.unknownZoneIds.length > 0) {
        throw new Error('A seleção contém uma zona facial desconhecida.')
    }
}

function assertCanonicalTiebreakSet(
    main: ReturnType<typeof calculateMainDiagnosis>,
    answers: Record<string, number>,
    comparisonChoice?: string,
) {
    if (main.kind !== 'tie') {
        if (Object.keys(answers).length > 0 || comparisonChoice !== undefined) {
            throw new Error('Desempate não é permitido quando não há empate principal.')
        }
        return
    }

    const expectedElements = new Set(main.elements)
    const actualElements = Object.keys(answers) as ElementType[]
    if (actualElements.length !== expectedElements.size || actualElements.some((element) => !expectedElements.has(element))) {
        throw new Error('As respostas de desempate devem cobrir somente os elementos empatados.')
    }

    const typedChoice = comparisonChoice as ComparativeChoice | undefined
    if (typedChoice !== undefined && typedChoice !== 'none' && !expectedElements.has(typedChoice)) {
        throw new Error('A escolha comparativa deve ser um dos elementos empatados.')
    }
}

function assertCanonicalReflectionSet(
    final: ReturnType<typeof calculateMainDiagnosis> | ReturnType<typeof calculateTiebreak>,
    reflectionAnswers: Record<string, string>,
) {
    const maxQuestions = final.elements.length * 2
    if (Object.keys(reflectionAnswers).some((key) => {
        const index = Number(key)
        return !Number.isInteger(index) || index < 0 || index >= maxQuestions
    })) {
        throw new Error('As reflexões devem corresponder às perguntas exibidas nesta leitura.')
    }
}

export function parseDiagnosticSubmission(payload: unknown): ParsedDiagnosticSubmission {
    const parsed = diagnosticSubmissionSchema.parse(payload)
    assertCanonicalQuestionSet(parsed.questionAnswers)

    const main = calculateMainDiagnosis(parsed.questionAnswers)
    assertCanonicalTiebreakSet(main, parsed.tiebreakAnswers, parsed.comparisonChoice)

    const final = main.kind === 'tie'
        ? calculateTiebreak(main.elements, parsed.tiebreakAnswers, parsed.comparisonChoice as ComparativeChoice | undefined)
        : main
    const facial = calculateFacialScores(parsed.facialZoneIds)
    assertCanonicalFacialZones(parsed.facialZoneIds, facial)
    assertCanonicalReflectionSet(final, parsed.reflectionAnswers)

    return { ...parsed, facial, main, final }
}

export function parseDiagnosisProgress(payload: unknown): DiagnosisProgress {
    const parsed = diagnosisProgressSchema.parse(payload)
    assertQuestionSubset(parsed.questionAnswers)
    return parsed
}

export function parseFacialZoneSelection(payload: unknown) {
    const parsed = facialZoneSelectionSchema.parse(payload)
    const facial = calculateFacialScores(parsed.facialZoneIds)
    assertCanonicalFacialZones(parsed.facialZoneIds, facial)
    return { ...parsed, facial }
}

export function buildDiagnosticRecord(parsed: ParsedDiagnosticSubmission) {
    return {
        facial_zone_ids: parsed.facial.selectedZoneIds,
        facial_scores: parsed.facial.scores,
        question_answers: parsed.questionAnswers,
        question_scores: parsed.main.scores,
        tiebreak_answers: parsed.tiebreakAnswers,
        tiebreak_scores: parsed.main.kind === 'tie' ? parsed.final.scores : {},
        result_kind: parsed.final.kind === 'tie' ? 'combined' : parsed.final.kind,
        result_elements: parsed.final.elements,
        resolution_method: parsed.final.resolutionMethod ?? null,
        facial_convergence: classifyFacialConvergence(parsed.final.elements, parsed.facial),
        comparison_choice: parsed.comparisonChoice ?? null,
        reflection_answers: parsed.reflectionAnswers,
        algorithm_version: DIAGNOSIS_ALGORITHM_VERSION,
    }
}
