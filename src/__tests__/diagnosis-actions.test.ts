import { beforeEach, describe, expect, it, vi } from 'vitest'

import { getTcmQuestions } from '@/lib/tcm-data'

const mocks = vi.hoisted(() => ({
    getUser: vi.fn(),
    sessionRpc: vi.fn(),
    adminRpc: vi.fn(),
    revalidatePath: vi.fn(),
}))

vi.mock('next/cache', () => ({ revalidatePath: mocks.revalidatePath }))
vi.mock('@/lib/supabase/server', () => ({
    createClient: vi.fn(async () => ({
        auth: { getUser: mocks.getUser },
        rpc: mocks.sessionRpc,
    })),
}))
vi.mock('@/lib/supabase/admin-access', () => ({
    getSupabaseAdmin: vi.fn(() => ({ rpc: mocks.adminRpc })),
}))

import { completeDiagnosis } from '@/app/diagnostico/actions'

const validPayload = {
    facialZoneIds: [],
    questionAnswers: Object.fromEntries(
        getTcmQuestions().map((question, index) => [question.id, index === 0]),
    ),
    tiebreakAnswers: {},
    reflectionAnswers: {},
}

describe('diagnosis actions trust boundary', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        mocks.getUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
        mocks.sessionRpc.mockResolvedValue({ data: 'session-assessment-1', error: null })
        mocks.adminRpc.mockResolvedValue({ data: 'assessment-1', error: null })
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
    })
})
