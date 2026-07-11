import { describe, expect, it } from "vitest";

import { calculateDominantElement, getQuizQuestions, QuizAnswer } from "@/lib/quiz-data";

describe("quiz-data", () => {
  it("seleciona 10 perguntas neutras, duas por elemento", () => {
    const questions = getQuizQuestions();

    expect(questions.map((question) => question.id)).toEqual([
      "fogo_1",
      "fogo_3",
      "terra_1",
      "terra_2",
      "metal_1",
      "metal_3",
      "agua_1",
      "agua_2",
      "madeira_1",
      "madeira_3",
    ]);
  });

  it("usa Terra como fallback quando não há resposta positiva", () => {
    const answers = getQuizQuestions().map((question) => ({
      questionId: question.id,
      answer: false,
    }));

    expect(calculateDominantElement(answers)).toBe("Terra");
  });

  it("retorna o elemento com maior pontuação", () => {
    const answers: QuizAnswer[] = [
      { questionId: "agua_1", answer: true },
      { questionId: "agua_2", answer: true },
      { questionId: "fogo_3", answer: true },
    ];

    expect(calculateDominantElement(answers)).toBe("Água");
  });

  it("desempata pelo sim na pergunta emocional", () => {
    const answers: QuizAnswer[] = [
      { questionId: "terra_1", answer: true },
      { questionId: "metal_1", answer: true },
    ];

    expect(calculateDominantElement(answers)).toBe("Metal");
  });

  it("quando o empate emocional persiste, usa o último sim respondido", () => {
    const answers: QuizAnswer[] = [
      { questionId: "terra_2", answer: true },
      { questionId: "metal_1", answer: true },
    ];

    expect(calculateDominantElement(answers)).toBe("Metal");
  });
});
