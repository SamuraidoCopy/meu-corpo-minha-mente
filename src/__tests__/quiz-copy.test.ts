import { describe, expect, it } from "vitest";

import { QUIZ_COPY, QUIZ_RESULT_COPY } from "@/lib/quiz-copy";

const elements = ["Madeira", "Fogo", "Terra", "Metal", "Água"] as const;
const forbiddenTerms = ["cura", "curar", "diagnostico", "adoecimento"];

describe("quiz-copy", () => {
  it("apresenta o quiz como leitura do que merece atenção", () => {
    expect(QUIZ_COPY.metadata.title).toBe(
      "O que você precisa prestar atenção agora? | Meu Corpo Minha Mente",
    );
    expect(QUIZ_COPY.intro.title).toBe(
      "O que você precisa prestar atenção agora?",
    );
    expect(QUIZ_COPY.intro.description).toContain(
      "suas respostas ajudam a organizar os sinais e padrões",
    );
    expect(QUIZ_COPY.intro.description).toContain(
      "qual eixo emocional está mais forte em você",
    );
    expect(QUIZ_COPY.result.label).toBe("Elemento em destaque");
  });

  it("tem uma leitura e uma ponte para todos os cinco elementos", () => {
    expect(Object.keys(QUIZ_RESULT_COPY).sort()).toEqual([...elements].sort());

    for (const element of elements) {
      expect(QUIZ_RESULT_COPY[element].description.trim().length).toBeGreaterThan(0);
      expect(QUIZ_RESULT_COPY[element].bridge).toHaveLength(2);
      for (const bridgeEntry of QUIZ_RESULT_COPY[element].bridge) {
        expect(bridgeEntry.trim().length).toBeGreaterThan(0);
      }
    }
  });

  it("mantém a copy pública fora dos termos clínicos proibidos", () => {
    const publicContent = [
      QUIZ_COPY.intro.eyebrow,
      QUIZ_COPY.intro.title,
      QUIZ_COPY.intro.description,
      QUIZ_COPY.intro.cta,
      QUIZ_COPY.gate.badge,
      QUIZ_COPY.gate.title,
      QUIZ_COPY.gate.description,
      QUIZ_COPY.gate.cta,
      QUIZ_COPY.result.headline,
      QUIZ_COPY.result.nextStep,
      QUIZ_COPY.result.cta,
      ...Object.values(QUIZ_RESULT_COPY).flatMap(({ description, bridge }) => [
        description,
        ...bridge,
      ]),
    ].join(" ");
    const normalizedContent = publicContent
      .normalize("NFD")
      .replace(/\p{Diacritic}/gu, "")
      .toLowerCase();

    for (const term of forbiddenTerms) {
      expect(normalizedContent).not.toMatch(
        new RegExp(`(^|[^\\p{L}])${term}($|[^\\p{L}])`, "u"),
      );
    }
  });

  it("não transforma a primeira leitura em veredito", () => {
    const publicContent = JSON.stringify({
      copy: QUIZ_COPY,
      results: QUIZ_RESULT_COPY,
    })
      .normalize("NFD")
      .replace(/\p{Diacritic}/gu, "")
      .toLowerCase();

    for (const expression of [
      "o que domina seu corpo",
      "qual domina voce",
      "elemento dominante",
      "onde a tensao realmente comeca",
      "de onde vem a agitacao",
    ]) {
      expect(publicContent).not.toContain(expression);
    }
  });
});
