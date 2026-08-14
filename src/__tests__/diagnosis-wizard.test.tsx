import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'
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

async function clickButton(name: RegExp) {
    await act(async () => {
        fireEvent.click(screen.getByRole('button', { name }))
        await Promise.resolve()
    })
}

async function answerMain(yesIndexes: number[]) {
    for (let index = 0; index < 15; index += 1) {
        const yes = yesIndexes.includes(index)
        await clickButton(yes ? /faz sentido/i : /não se aplica/i)
    }
}

function deferred<T>() {
    let resolve!: (value: T) => void
    let reject!: (reason?: unknown) => void
    const promise = new Promise<T>((promiseResolve, promiseReject) => {
        resolve = promiseResolve
        reject = promiseReject
    })

    return { promise, resolve, reject }
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
        await answerMain([14])

        await clickButton(/concluir minha leitura/i)
        await waitFor(() => expect(mocks.completeDiagnosis).toHaveBeenCalledOnce())

        const submission = mocks.completeDiagnosis.mock.calls[0][0]
        expect(submission.questionAnswers.madeira_3).toBe(true)
        expect(screen.getByText(/elemento em destaque/i)).toBeInTheDocument()
    })

    it('retoma uma avaliação em andamento sem reiniciar as perguntas', async () => {
        const partialAnswers = Object.fromEntries(getTcmQuestions().slice(0, 14).map((question) => [question.id, false]))
        render(<DiagnosisWizard resumeAssessment={{
            id: '123e4567-e89b-42d3-a456-426614174000',
            facialZoneIds: [],
            questionAnswers: partialAnswers,
            tiebreakAnswers: {},
            reflectionAnswers: {},
        }} />)

        expect(screen.getByText(/Sente tensão nos ombros e pescoço/i)).toBeInTheDocument()
        await clickButton(/faz sentido/i)
        expect(screen.getByText(/o que você percebe neste padrão/i)).toBeInTheDocument()
    })

    it('persiste a última resposta preenchida antes da criação do rascunho', async () => {
        const draft = deferred<{ success: boolean; assessmentId: string }>()
        mocks.startDiagnosisAssessment.mockReturnValueOnce(draft.promise)

        render(<DiagnosisWizard />)
        await clickButton(/faz sentido/i)
        expect(mocks.saveDiagnosisProgress).not.toHaveBeenCalled()

        await act(async () => {
            draft.resolve({ success: true, assessmentId: '123e4567-e89b-42d3-a456-426614174000' })
            await draft.promise
        })

        await waitFor(() => expect(mocks.saveDiagnosisProgress).toHaveBeenCalledOnce())
        const question = getTcmQuestions()[0]
        expect(mocks.saveDiagnosisProgress.mock.calls[0][0]).toMatchObject({
            assessmentId: '123e4567-e89b-42d3-a456-426614174000',
            questionAnswers: { [question.id]: true },
        })
    })

    it('abre imediatamente as perguntas contextuais depois de um empate', async () => {
        render(<DiagnosisWizard />)
        await answerMain([0, 3])

        expect(screen.getByText(/vamos entender qual padrão está mais presente agora/i)).toBeInTheDocument()
        expect(screen.getByText(/mente ficou acelerada/i)).toBeInTheDocument()
    })

    it('resolve o empate contextual sem abrir comparação quando há vencedor', async () => {
        render(<DiagnosisWizard />)
        await answerMain([0, 3])

        await clickButton(/frequentemente/i)
        await clickButton(/às vezes/i)

        expect(screen.queryByText(/última pergunta de desempate/i)).not.toBeInTheDocument()
        expect(screen.getByText(/o que você percebe neste padrão/i)).toBeInTheDocument()
    })

    it('abre comparação final e aceita resultado combinado', async () => {
        render(<DiagnosisWizard />)
        await answerMain([0, 3])

        await clickButton(/frequentemente/i)
        await clickButton(/frequentemente/i)

        expect(screen.getByText(/qual desses padrões mais interferiu/i)).toBeInTheDocument()
        await clickButton(/não consigo separar/i)
        await clickButton(/concluir minha leitura/i)

        await waitFor(() => expect(mocks.completeDiagnosis).toHaveBeenCalledOnce())
        expect(mocks.completeDiagnosis.mock.calls[0][0].comparisonChoice).toBe('none')
    })

    it('mantém as respostas na tela quando a gravação falha', async () => {
        mocks.completeDiagnosis.mockResolvedValue({ error: 'falha temporária' })
        render(<DiagnosisWizard />)
        await answerMain([0, 3])

        await clickButton(/frequentemente/i)
        await clickButton(/às vezes/i)
        await clickButton(/concluir minha leitura/i)

        await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent(/falha temporária/i))
        expect(screen.queryByText(/elemento em destaque/i)).not.toBeInTheDocument()
    })

    it('espera o salvamento anterior concluir antes de persistir o próximo progresso', async () => {
        const firstSave = deferred<{ success: boolean }>()
        mocks.saveDiagnosisProgress.mockReturnValueOnce(firstSave.promise)

        render(<DiagnosisWizard resumeAssessment={{
            id: '123e4567-e89b-42d3-a456-426614174000',
            facialZoneIds: [],
            questionAnswers: {},
            tiebreakAnswers: {},
            reflectionAnswers: {},
        }} />)

        await clickButton(/faz sentido/i)
        await waitFor(() => expect(mocks.saveDiagnosisProgress).toHaveBeenCalledOnce())

        await clickButton(/faz sentido/i)

        expect(mocks.saveDiagnosisProgress).toHaveBeenCalledOnce()

        await act(async () => {
            firstSave.resolve({ success: true })
        })

        await waitFor(() => expect(mocks.saveDiagnosisProgress).toHaveBeenCalledTimes(2))
        const [firstQuestion, secondQuestion] = getTcmQuestions().slice(0, 2)
        expect(mocks.saveDiagnosisProgress.mock.calls[1][0].questionAnswers).toMatchObject({
            [firstQuestion.id]: true,
            [secondQuestion.id]: true,
        })
    })

    it('continua a fila quando o primeiro salvamento retorna erro', async () => {
        const firstSave = deferred<{ success: boolean; error: string }>()
        mocks.saveDiagnosisProgress.mockReturnValueOnce(firstSave.promise).mockResolvedValueOnce({ success: true })

        render(<DiagnosisWizard resumeAssessment={{
            id: '123e4567-e89b-42d3-a456-426614174000',
            facialZoneIds: [],
            questionAnswers: {},
            tiebreakAnswers: {},
            reflectionAnswers: {},
        }} />)

        await clickButton(/faz sentido/i)
        await waitFor(() => expect(mocks.saveDiagnosisProgress).toHaveBeenCalledOnce())
        await clickButton(/faz sentido/i)
        expect(mocks.saveDiagnosisProgress).toHaveBeenCalledOnce()

        await act(async () => {
            firstSave.resolve({ success: false, error: 'falha temporária' })
            await firstSave.promise
        })

        await waitFor(() => expect(mocks.saveDiagnosisProgress).toHaveBeenCalledTimes(2))
    })

    it('continua a fila quando o primeiro salvamento rejeita', async () => {
        const firstSave = deferred<{ success: boolean }>()
        mocks.saveDiagnosisProgress.mockReturnValueOnce(firstSave.promise).mockResolvedValueOnce({ success: true })

        render(<DiagnosisWizard resumeAssessment={{
            id: '123e4567-e89b-42d3-a456-426614174000',
            facialZoneIds: [],
            questionAnswers: {},
            tiebreakAnswers: {},
            reflectionAnswers: {},
        }} />)

        await clickButton(/faz sentido/i)
        await waitFor(() => expect(mocks.saveDiagnosisProgress).toHaveBeenCalledOnce())
        await clickButton(/faz sentido/i)
        expect(mocks.saveDiagnosisProgress).toHaveBeenCalledOnce()

        await act(async () => {
            firstSave.reject(new Error('falha de rede'))
            await firstSave.promise.catch(() => undefined)
        })

        await waitFor(() => expect(mocks.saveDiagnosisProgress).toHaveBeenCalledTimes(2))
    })

    it('libera a fila depois do timeout de um salvamento pendente', async () => {
        vi.useFakeTimers()
        try {
            mocks.saveDiagnosisProgress.mockReturnValueOnce(new Promise(() => undefined)).mockResolvedValueOnce({ success: true })

            render(<DiagnosisWizard resumeAssessment={{
                id: '123e4567-e89b-42d3-a456-426614174000',
                facialZoneIds: [],
                questionAnswers: {},
                tiebreakAnswers: {},
                reflectionAnswers: {},
            }} />)

            await clickButton(/faz sentido/i)
            await act(async () => {
                await Promise.resolve()
                await Promise.resolve()
            })
            expect(mocks.saveDiagnosisProgress).toHaveBeenCalledOnce()

            await clickButton(/faz sentido/i)
            expect(mocks.saveDiagnosisProgress).toHaveBeenCalledOnce()

            await act(async () => {
                vi.advanceTimersByTime(10_000)
                await Promise.resolve()
                await Promise.resolve()
                await Promise.resolve()
            })

            expect(mocks.saveDiagnosisProgress).toHaveBeenCalledTimes(2)
        } finally {
            vi.useRealTimers()
        }
    })
})
