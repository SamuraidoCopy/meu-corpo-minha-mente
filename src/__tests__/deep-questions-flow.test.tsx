import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { DeepQuestionsFlow } from '@/components/mapa/deep-questions-flow'

/* 
  Testes Unitários da Ferramenta de Reflexão - Meu Corpo Minha Mente 
*/

describe('DeepQuestionsFlow', () => {
    it('deve renderizar a tela apontando para as marcas selecionadas recebidas nas consts', () => {
        render(<DeepQuestionsFlow dominantElement="Fogo" selectedMarks={['Rubor', 'Suor']} />)

        expect(screen.getByText(/Nós notamos que você marcou: Rubor, Suor/i)).toBeInTheDocument()
    })

    it('deve listar as perguntas corretas logo no primeiro render', () => {
        render(<DeepQuestionsFlow dominantElement="Madeira" selectedMarks={['Tensão', 'Maxilar']} />)

        // As perguntas do Fígado/Madeira mapeadas no PDF devem aparecer.
        // H2 -> heading level 2
        expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent(/perdeu o controle/i)
    })

    it('deve avançar as questões e clicar em finalizar reflexão', async () => {
        render(<DeepQuestionsFlow dominantElement="Metal" selectedMarks={['Pele seca']} />)

        const textarea = screen.getByPlaceholderText('Sua resposta vem direto de dentro...')
        const btnNext = screen.getByText(/Próxima Pergunta/i)

        // Preenche Q1
        fireEvent.change(textarea, { target: { value: 'Resposta A longo sulficiente' } })
        fireEvent.click(btnNext)

        // Preenche Q2
        fireEvent.change(textarea, { target: { value: 'Resposta B longa sulficiente' } })
        fireEvent.click(btnNext)

        // Preenche Q3 e Clica em Finalizar
        fireEvent.change(textarea, { target: { value: 'Resposta C longa sulficiente' } })

        // Esperamos que haja o botão de Finalizar Reflexão
        expect(screen.getByText(/Finalizar Reflexão/i)).toBeInTheDocument()
        fireEvent.click(screen.getByText(/Finalizar Reflexão/i))
    })
})
