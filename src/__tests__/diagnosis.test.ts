import { describe, expect, it } from 'vitest';

import {
  ELEMENT_ORDER,
  TIEBREAK_QUESTIONS,
  calculateFacialScores,
  calculateMainDiagnosis,
  calculateTiebreak,
  classifyFacialConvergence,
} from '@/lib/diagnosis';
import { FACIAL_ZONES, getTcmQuestions, type ElementType } from '@/lib/tcm-data';

const answerAll = (questionIds: string[], selected: string[]) =>
  Object.fromEntries(questionIds.map((id) => [id, selected.includes(id)]));

describe('diagnóstico fundamentado', () => {
  it('usa uma ordem de elementos explícita e estável', () => {
    expect(ELEMENT_ORDER).toEqual(['Madeira', 'Fogo', 'Terra', 'Metal', 'Água']);
  });

  it('inclui a 15ª pergunta no cálculo', () => {
    const questions = getTcmQuestions();
    const answers = answerAll(
      questions.map((question) => question.id),
      ['madeira_3'],
    );

    const result = calculateMainDiagnosis(answers, questions);

    expect(questions).toHaveLength(15);
    expect(result.scores.Madeira).toBe(1);
    expect(result.kind).toBe('single');
    expect(result.elements).toEqual(['Madeira']);
  });

  it.each(ELEMENT_ORDER)('identifica %s quando tem pontuação máxima única', (element) => {
    const questions = getTcmQuestions();
    const selected = questions.filter((question) => question.element === element).map((question) => question.id);

    const result = calculateMainDiagnosis(answerAll(questions.map((question) => question.id), selected), questions);

    expect(result.kind).toBe('single');
    expect(result.elements).toEqual([element]);
    expect(result.maxScore).toBe(3);
  });

  it('não inventa um elemento quando todas as respostas são negativas', () => {
    const result = calculateMainDiagnosis(answerAll(getTcmQuestions().map((question) => question.id), []));

    expect(result.kind).toBe('insufficient');
    expect(result.elements).toEqual([]);
    expect(result.maxScore).toBe(0);
  });

  it('retorna todos os elementos empatados em ordem estável', () => {
    const questions = getTcmQuestions();
    const selected = ['fogo_1', 'fogo_2', 'terra_1', 'terra_2'];

    const result = calculateMainDiagnosis(answerAll(questions.map((question) => question.id), selected), questions);

    expect(result.kind).toBe('tie');
    expect(result.elements).toEqual(['Fogo', 'Terra']);
    expect(result.scores.Fogo).toBe(2);
    expect(result.scores.Terra).toBe(2);
  });

  it('pontua zonas faciais sem depender da ordem em que foram selecionadas', () => {
    const forward = calculateFacialScores(['testa_centro', 'ponto_figado', 'sobrancelhas']);
    const reverse = calculateFacialScores(['sobrancelhas', 'ponto_figado', 'testa_centro']);

    expect(forward.scores).toEqual(reverse.scores);
    expect(forward.elements).toEqual(['Fogo']);
    expect(forward.kind).toBe('single');
  });

  it('explicita empate facial sem usá-lo para decidir o resultado principal', () => {
    const result = calculateFacialScores(['testa_centro', 'ponto_figado']);

    expect(result.kind).toBe('tie');
    expect(result.elements).toEqual(['Madeira', 'Fogo']);
  });

  it('classifica convergência facial apenas como contexto explicativo', () => {
    const facial = calculateFacialScores(['ponto_figado', 'temporas']);

    expect(classifyFacialConvergence(['Madeira'], facial)).toBe('convergent');
    expect(classifyFacialConvergence(['Fogo'], facial)).toBe('divergent');
    expect(classifyFacialConvergence([], facial)).toBe('divergent');
    expect(classifyFacialConvergence(['Madeira'], calculateFacialScores([]))).toBe('no_facial_data');
  });

  it('desempata somente os elementos que estavam empatados', () => {
    const result = calculateTiebreak(['Fogo', 'Terra'], {
      Fogo: 2,
      Terra: 3,
      Madeira: 3,
    });

    expect(result.kind).toBe('single');
    expect(result.elements).toEqual(['Terra']);
    expect(result.scores.Madeira).toBe(0);
    expect(result.resolutionMethod).toBe('contextual_tiebreak');
  });

  it('pede comparação final quando o desempate contextual ainda empata', () => {
    const result = calculateTiebreak(['Fogo', 'Terra'], { Fogo: 2, Terra: 2 });

    expect(result.kind).toBe('tie');
    expect(result.elements).toEqual(['Fogo', 'Terra']);
    expect(result.needsComparison).toBe(true);
    expect(TIEBREAK_QUESTIONS.Fogo.text).toContain('acelerada');
  });

  it('resolve a comparação final por escolha explícita', () => {
    const result = calculateTiebreak(['Fogo', 'Terra'], { Fogo: 2, Terra: 2 }, 'Terra');

    expect(result.kind).toBe('single');
    expect(result.elements).toEqual(['Terra']);
    expect(result.resolutionMethod).toBe('comparative_choice');
  });

  it('preserva o resultado combinado quando a pessoa não consegue separar os padrões', () => {
    const result = calculateTiebreak(['Fogo', 'Terra'], { Fogo: 2, Terra: 2 }, 'none');

    expect(result.kind).toBe('combined');
    expect(result.elements).toEqual(['Fogo', 'Terra']);
    expect(result.resolutionMethod).toBe('combined_acknowledged');
  });

  it('rejeita pontuação contextual fora da escala de 0 a 3', () => {
    expect(() => calculateTiebreak(['Fogo', 'Terra'], { Fogo: 4 })).toThrow(RangeError);
  });

  it('mantém a tabela de perguntas contextuais limitada aos cinco elementos', () => {
    const elements = Object.keys(TIEBREAK_QUESTIONS) as ElementType[];

    expect(elements).toEqual(ELEMENT_ORDER);
    expect(FACIAL_ZONES.length).toBeGreaterThan(0);
  });
});
