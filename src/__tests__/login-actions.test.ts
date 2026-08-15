// @vitest-environment node

import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
    headers: vi.fn(),
    createClient: vi.fn(),
}))

vi.mock('next/headers', () => ({ headers: mocks.headers }))
vi.mock('@/lib/supabase/server', () => ({ createClient: mocks.createClient }))

import { login } from '@/app/login/actions'

beforeEach(() => {
    vi.clearAllMocks()
    mocks.headers.mockResolvedValue(new Headers({ origin: 'https://example.com' }))
})

describe('login', () => {
    it('orienta a aguardar quando o limite de envio do e-mail é atingido', async () => {
        mocks.createClient.mockResolvedValue({
            auth: {
                signInWithOtp: vi.fn().mockResolvedValue({
                    data: { user: null, session: null },
                    error: {
                        code: 'over_email_send_rate_limit',
                        status: 429,
                        message: 'email rate limit exceeded',
                    },
                }),
            },
        })

        const formData = new FormData()
        formData.set('email', 'vitoruehara@protonmail.com')

        const result = await login({ message: '' }, formData)

        expect(result).toEqual({
            message: 'Muitas tentativas recentes. Aguarde alguns minutos antes de solicitar outro link.',
        })
    })
})
