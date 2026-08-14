import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { getTcmQuestions } from '@/lib/tcm-data'

const mocks = vi.hoisted(() => ({
    getUser: vi.fn(),
    sessionRpc: vi.fn(),
    sessionFrom: vi.fn(),
    sessionInsert: vi.fn(),
    sessionUpdate: vi.fn(),
    adminRpc: vi.fn(),
    adminFrom: vi.fn(),
    getSupabaseAdmin: vi.fn(),
    revalidatePath: vi.fn(),
}))

vi.mock('next/cache', () => ({ revalidatePath: mocks.revalidatePath }))
vi.mock('@/lib/supabase/server', () => ({
    createClient: vi.fn(async () => ({
        auth: { getUser: mocks.getUser },
        rpc: mocks.sessionRpc,
        from: mocks.sessionFrom,
    })),
}))
vi.mock('@/lib/supabase/admin-access', () => ({
    getSupabaseAdmin: mocks.getSupabaseAdmin,
}))

import {
    completeDiagnosis,
    saveDiagnosisProgress,
    startDiagnosisAssessment,
} from '@/app/diagnostico/actions'

const validPayload = {
    facialZoneIds: [],
    questionAnswers: Object.fromEntries(
        getTcmQuestions().map((question, index) => [question.id, index === 0]),
    ),
    tiebreakAnswers: {},
    reflectionAnswers: {},
}

const tiedQuestionAnswers = Object.fromEntries(
    getTcmQuestions().map((question) => [question.id, question.element === 'Madeira' || question.element === 'Fogo']),
)

const assessmentId = '00000000-0000-4000-8000-000000000001'

function createAdminQuery(options: {
    maybeSingleResult?: { data: { id: string } | null; error: unknown }
    singleResult?: { data: { id: string } | null; error: unknown }
} = {}) {
    const maybeSingleResult = options.maybeSingleResult || { data: null, error: null }
    const singleResult = options.singleResult || { data: { id: assessmentId }, error: null }
    const query = {
        select: vi.fn(() => query),
        eq: vi.fn(() => query),
        order: vi.fn(() => query),
        limit: vi.fn(() => query),
        maybeSingle: vi.fn(async () => maybeSingleResult),
        insert: vi.fn(() => query),
        single: vi.fn(async () => singleResult),
    }
    return query
}

function createSessionQuery() {
    const query = {
        select: vi.fn(() => query),
        eq: vi.fn(() => query),
        order: vi.fn(() => query),
        limit: vi.fn(() => query),
        maybeSingle: vi.fn(async () => ({ data: null, error: null })),
        single: vi.fn(async () => ({
            data: {
                id: assessmentId,
                question_answers: {},
                tiebreak_answers: {},
            },
            error: null,
        })),
        insert: mocks.sessionInsert,
        update: mocks.sessionUpdate,
    }
    mocks.sessionInsert.mockImplementation(() => query)
    mocks.sessionUpdate.mockImplementation(() => query)
    return query
}

describe('diagnosis actions trust boundary', () => {
beforeEach(() => {
    vi.clearAllMocks()
    vi.spyOn(console, 'error').mockImplementation(() => undefined)
    mocks.getUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
        mocks.sessionRpc.mockResolvedValue({ data: 'session-assessment-1', error: null })
        mocks.sessionFrom.mockReturnValue(createSessionQuery())
        mocks.adminRpc.mockResolvedValue({ data: 'assessment-1', error: null })
        mocks.adminFrom.mockReturnValue(createAdminQuery())
    mocks.getSupabaseAdmin.mockReturnValue({
        from: mocks.adminFrom,
        rpc: mocks.adminRpc,
    })
})

afterEach(() => {
    vi.restoreAllMocks()
})

    it('persists completion through the service-role client only', async () => {
        const result = await completeDiagnosis(validPayload)

        expect(result).toMatchObject({ success: true, assessmentId: 'assessment-1' })
        expect(mocks.sessionRpc).not.toHaveBeenCalled()
        expect(mocks.adminRpc).toHaveBeenCalledWith(
            'complete_diagnostic_assessment',
            expect.objectContaining({ p_user_id: 'user-1' }),
        )
    })

    it('does not initialize privileged persistence when unauthenticated', async () => {
        mocks.getUser.mockResolvedValue({ data: { user: null } })

        await expect(completeDiagnosis(validPayload)).resolves.toEqual({
            error: 'Usu\u00e1rio n\u00e3o autenticado.',
        })
        expect(mocks.adminRpc).not.toHaveBeenCalled()
        expect(mocks.getSupabaseAdmin).not.toHaveBeenCalled()
    })

    it('starts an assessment through the service-role client only', async () => {
        const result = await startDiagnosisAssessment({ facialZoneIds: [] })

        expect(result).toEqual({ success: true, assessmentId })
        expect(mocks.sessionInsert).not.toHaveBeenCalled()
        expect(mocks.sessionFrom).not.toHaveBeenCalled()
        expect(mocks.sessionRpc).not.toHaveBeenCalled()
        expect(mocks.adminFrom).toHaveBeenCalledWith('diagnostic_assessments')
    })

    it('reuses a draft created concurrently after a unique conflict', async () => {
        const initialLookup = createAdminQuery({
            maybeSingleResult: { data: null, error: null },
        })
        const insertConflict = createAdminQuery({
            singleResult: { data: null, error: { code: '23505' } },
        })
        const concurrentDraft = createAdminQuery({
            maybeSingleResult: { data: { id: 'concurrent-assessment' }, error: null },
        })
        mocks.adminFrom
            .mockReturnValueOnce(initialLookup)
            .mockReturnValueOnce(insertConflict)
            .mockReturnValueOnce(concurrentDraft)

        const result = await startDiagnosisAssessment({ facialZoneIds: [] })

        expect(result).toEqual({ success: true, assessmentId: 'concurrent-assessment' })
        expect(mocks.adminFrom).toHaveBeenCalledTimes(3)
    })

    it('returns the existing persistence error when the admin client throws', async () => {
        mocks.getSupabaseAdmin.mockImplementation(() => {
            throw new Error('missing service role key')
        })

        await expect(completeDiagnosis(validPayload)).resolves.toEqual({
            error: 'Não foi possível salvar sua leitura. Tente novamente.',
        })
        await expect(startDiagnosisAssessment({ facialZoneIds: [] })).resolves.toEqual({
            error: 'Não foi possível iniciar esta leitura.',
        })
        await expect(saveDiagnosisProgress({
            assessmentId,
            questionAnswers: { fogo_1: true },
            tiebreakAnswers: {},
            reflectionAnswers: {},
            progressRevision: 1,
        })).resolves.toEqual({
            error: 'Não foi possível salvar o progresso desta leitura.',
        })
    })

    it('does not initialize privileged draft persistence when unauthenticated', async () => {
        mocks.getUser.mockResolvedValue({ data: { user: null } })

        await expect(startDiagnosisAssessment({ facialZoneIds: [] })).resolves.toEqual({
            error: 'Usu\u00e1rio n\u00e3o autenticado.',
        })
        expect(mocks.getSupabaseAdmin).not.toHaveBeenCalled()
    })

    it('merges progress through the service-role RPC only', async () => {
        const result = await saveDiagnosisProgress({
            assessmentId,
            questionAnswers: { fogo_1: true },
            tiebreakAnswers: {},
            reflectionAnswers: {},
            progressRevision: 1,
        })

        expect(result).toEqual({ success: true })
        expect(mocks.sessionUpdate).not.toHaveBeenCalled()
        expect(mocks.sessionFrom).not.toHaveBeenCalled()
        expect(mocks.sessionRpc).not.toHaveBeenCalled()
        expect(mocks.adminRpc).toHaveBeenCalledWith('merge_diagnostic_progress', {
            p_user_id: 'user-1',
            p_assessment_id: assessmentId,
            p_question_answers: { fogo_1: true },
            p_tiebreak_answers: {},
            p_reflection_answers: {},
            p_revision: 1,
            p_comparison_choice: undefined,
        })
        expect(mocks.adminFrom).not.toHaveBeenCalled()
    })

    it('does not initialize privileged progress persistence when unauthenticated', async () => {
        mocks.getUser.mockResolvedValue({ data: { user: null } })

        await expect(saveDiagnosisProgress({
            assessmentId,
            questionAnswers: { fogo_1: true },
            tiebreakAnswers: {},
            reflectionAnswers: {},
            progressRevision: 1,
        })).resolves.toEqual({
            error: 'Usu\u00e1rio n\u00e3o autenticado.',
        })
        expect(mocks.getSupabaseAdmin).not.toHaveBeenCalled()
    })

    it('rejects a comparison choice until every contextual answer is present', async () => {
        await expect(saveDiagnosisProgress({
            assessmentId,
            questionAnswers: tiedQuestionAnswers,
            tiebreakAnswers: { Madeira: 3 },
            comparisonChoice: 'none',
            reflectionAnswers: {},
            progressRevision: 1,
        })).resolves.toEqual({ error: 'A escolha comparativa só pode ser salva após concluir o desempate.' })
        expect(mocks.adminRpc).not.toHaveBeenCalled()
    })
})
