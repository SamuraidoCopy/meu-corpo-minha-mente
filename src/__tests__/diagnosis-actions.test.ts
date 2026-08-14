import { beforeEach, describe, expect, it, vi } from 'vitest'

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

const assessmentId = '00000000-0000-4000-8000-000000000001'

function createAdminQuery() {
    const query = {
        select: vi.fn(() => query),
        eq: vi.fn(() => query),
        order: vi.fn(() => query),
        limit: vi.fn(() => query),
        maybeSingle: vi.fn(async () => ({ data: null, error: null })),
        insert: vi.fn(() => query),
        single: vi.fn(async () => ({ data: { id: assessmentId }, error: null })),
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
        })).resolves.toEqual({
            error: 'Usu\u00e1rio n\u00e3o autenticado.',
        })
        expect(mocks.getSupabaseAdmin).not.toHaveBeenCalled()
    })
})
