import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
    completeDiagnosis: vi.fn(),
    startDiagnosisAssessment: vi.fn(),
    saveDiagnosisProgress: vi.fn(),
}))

vi.mock('@/app/diagnostico/actions', () => ({
    completeDiagnosis: mocks.completeDiagnosis,
    startDiagnosisAssessment: mocks.startDiagnosisAssessment,
    saveDiagnosisProgress: mocks.saveDiagnosisProgress,
}))

import { DiagnosisWizard } from '@/app/diagnostico/wizard'
import { getTcmQuestions } from '@/lib/tcm-data'

function answerMain(yesIndexes: number[]) {
    for (let index = 0; index < 15; index += 1) {
        const yes = yesIndexes.includes(index)
        fireEvent.click(screen.getByRole('button', { name: yes ? /faz sentido/i : /não se aplica/i }))
    }
}

beforeEach(() => {
    vi.clearAllMocks()
    mocks.completeDiagnosis.mockResolvedValue({
        success: true,
        assessmentId: 'assessment-1',
        resultKind: 'single',
        resultElements: ['Madeira'],
    })
    mocks.startDiagnosisAssessment.mockResolvedValue({ success: true, assessmentId: '123e4567-e89b-42d3-a456-426614174000' })
    mocks.saveDiagnosisProgress.mockResolvedValue({ success: true })
})

describe('fluxo do wizard de diagnóstico', () => {
    it('incorpora a 15ª resposta antes de concluir', async () => {
        render(<DiagnosisWizard />)
        answerMain([14])

        fireEvent.click(screen.getByRole('button', { name: /concluir minha leitura/i }))
        await waitFor(() => expect(mocks.completeDiagnosis).toHaveBeenCalledOnce())

        const submission = mocks.completeDiagnosis.mock.calls[0][0]
        expect(submission.questionAnswers.madeira_3).toBe(true)
        expect(screen.getByText(/elemento em destaque/i)).toBeInTheDocument()
    })

    it('retoma uma avaliação em andamento sem reiniciar as perguntas', () => {
        const partialAnswers = Object.fromEntries(getTcmQuestions().slice(0, 14).map((question) => [question.id, false]))
        render(<DiagnosisWizard resumeAssessment={{
            id: '123e4567-e89b-42d3-a456-426614174000',
            facialZoneIds: [],
            questionAnswers: partialAnswers,
            tiebreakAnswers: {},
            reflectionAnswers: {},
        }} />)

        expect(screen.getByText(/Sente tensão nos ombros e pescoço/i)).toBeInTheDocument()
        fireEvent.click(screen.getByRole('button', { name: /faz sentido/i }))
        expect(screen.getByText(/o que você percebe neste padrão/i)).toBeInTheDocument()
    })

    it('abre imediatamente as perguntas contextuais depois de um empate', () => {
        render(<DiagnosisWizard />)
        answerMain([0, 3])

        expect(screen.getByText(/vamos entender qual padrão está mais presente agora/i)).toBeInTheDocument()
        expect(screen.getByText(/mente ficou acelerada/i)).toBeInTheDocument()
    })

    it('resolve o empate contextual sem abrir comparação quando há vencedor', () => {
        render(<DiagnosisWizard />)
        answerMain([0, 3])

        fireEvent.click(screen.getByRole('button', { name: /frequentemente/i }))
        fireEvent.click(screen.getByRole('button', { name: /às vezes/i }))

        expect(screen.queryByText(/última pergunta de desempate/i)).not.toBeInTheDocument()
        expect(screen.getByText(/o que você percebe neste padrão/i)).toBeInTheDocument()
    })

    it('abre comparação final e aceita resultado combinado', async () => {
        render(<DiagnosisWizard />)
        answerMain([0, 3])

        fireEvent.click(screen.getByRole('button', { name: /frequentemente/i }))
        fireEvent.click(screen.getByRole('button', { name: /frequentemente/i }))

        expect(screen.getByText(/qual desses padrões mais interferiu/i)).toBeInTheDocument()
        fireEvent.click(screen.getByRole('button', { name: /não consigo separar/i }))
        fireEvent.click(screen.getByRole('button', { name: /concluir minha leitura/i }))

        await waitFor(() => expect(mocks.completeDiagnosis).toHaveBeenCalledOnce())
        expect(mocks.completeDiagnosis.mock.calls[0][0].comparisonChoice).toBe('none')
    })

    it('mantém as respostas na tela quando a gravação falha', async () => {
        mocks.completeDiagnosis.mockResolvedValue({ error: 'falha temporária' })
        render(<DiagnosisWizard />)
        answerMain([0, 3])

        fireEvent.click(screen.getByRole('button', { name: /frequentemente/i }))
        fireEvent.click(screen.getByRole('button', { name: /às vezes/i }))
        fireEvent.click(screen.getByRole('button', { name: /concluir minha leitura/i }))

        await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent(/falha temporária/i))
        expect(screen.queryByText(/elemento em destaque/i)).not.toBeInTheDocument()
    })
})
