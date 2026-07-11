import { describe, expect, it } from "vitest";

import { getQuizQuestions } from "@/lib/quiz-data";
import { parseQuizSubmission } from "@/lib/quiz-submission";

const VALID_SUBMISSION_ID = "123e4567-e89b-42d3-a456-426614174000";

function buildValidSubmission() {
  return {
    submissionId: VALID_SUBMISSION_ID,
    name: "  Maria   da Silva  ",
    email: "  MARIA@EXAMPLE.COM  ",
    consent: true,
    element: "Fogo",
    answers: getQuizQuestions().map((question) => ({
      questionId: question.id,
      answer: false,
    })),
    tracking: {
      utm_source: "instagram",
      utm_campaign: "quiz",
    },
    website: "",
  };
}

function getIssues(input: unknown) {
  const result = parseQuizSubmission(input);

  expect(result.success).toBe(false);
  if (result.success) throw new Error("A submissao deveria ser invalida.");

  return result.error.issues;
}

describe("parseQuizSubmission", () => {
  it("normaliza a identidade e sempre recalcula o elemento", () => {
    const result = parseQuizSubmission(buildValidSubmission());

    expect(result.success).toBe(true);
    if (!result.success) return;

    expect(result.data.name).toBe("Maria da Silva");
    expect(result.data.email).toBe("maria@example.com");
    expect(result.data.element).toBe("Terra");
    expect(result.data).not.toHaveProperty("calculatedElement");
  });

  it("rejeita menos de 10 respostas pela restricao de tamanho minimo", () => {
    const submission = buildValidSubmission();
    submission.answers = submission.answers.slice(0, 9);

    expect(getIssues(submission)).toContainEqual(
      expect.objectContaining({ code: "too_small", path: ["answers"], minimum: 10 })
    );
  });

  it("rejeita mais de 10 respostas pela restricao de tamanho maximo", () => {
    const submission = buildValidSubmission();
    submission.answers.push({ ...submission.answers[0] });

    expect(getIssues(submission)).toContainEqual(
      expect.objectContaining({ code: "too_big", path: ["answers"], maximum: 10 })
    );
  });

  it("rejeita ID de pergunta desconhecido", () => {
    const submission = buildValidSubmission();
    submission.answers[0] = { questionId: "desconhecida_1", answer: false };

    expect(parseQuizSubmission(submission).success).toBe(false);
  });

  it("rejeita ID de pergunta repetido", () => {
    const submission = buildValidSubmission();
    submission.answers[1] = {
      ...submission.answers[1],
      questionId: submission.answers[0].questionId,
    };

    expect(parseQuizSubmission(submission).success).toBe(false);
  });

  it("rejeita submissionId que nao seja UUID", () => {
    expect(
      parseQuizSubmission({ ...buildValidSubmission(), submissionId: "nao-e-uuid" }).success
    ).toBe(false);
  });

  it("exige consentimento literal true e um elemento valido", () => {
    expect(parseQuizSubmission({ ...buildValidSubmission(), consent: false }).success).toBe(false);
    expect(parseQuizSubmission({ ...buildValidSubmission(), element: "Ar" }).success).toBe(false);
  });

  it.each(["constructor", "toString"])(
    "rejeita a propriedade herdada %s como elemento",
    (element) => {
      expect(parseQuizSubmission({ ...buildValidSubmission(), element }).success).toBe(false);
    }
  );

  it("exige nome entre 2 e 80 caracteres depois da normalizacao", () => {
    expect(parseQuizSubmission({ ...buildValidSubmission(), name: " A " }).success).toBe(false);
    expect(parseQuizSubmission({ ...buildValidSubmission(), name: "A".repeat(81) }).success).toBe(
      false
    );
  });

  it("exige email valido com no maximo 180 caracteres", () => {
    expect(parseQuizSubmission({ ...buildValidSubmission(), email: "email-invalido" }).success).toBe(
      false
    );
    expect(
      parseQuizSubmission({ ...buildValidSubmission(), email: `${"a".repeat(175)}@e.com` }).success
    ).toBe(false);
  });

  it("aplica defaults para tracking e website", () => {
    const submission: Record<string, unknown> = { ...buildValidSubmission() };
    delete submission.tracking;
    delete submission.website;
    const result = parseQuizSubmission(submission);

    expect(result.success).toBe(true);
    if (!result.success) return;

    expect(result.data.tracking).toEqual({});
    expect(result.data.website).toBe("");
  });

  it("limita valores de tracking a 180 caracteres", () => {
    const submission = buildValidSubmission();
    submission.tracking.utm_source = "a".repeat(181);

    expect(parseQuizSubmission(submission).success).toBe(false);
  });

  it("limita o honeypot website a 200 caracteres", () => {
    expect(
      parseQuizSubmission({ ...buildValidSubmission(), website: "a".repeat(201) }).success
    ).toBe(false);
  });

  it("rejeita campos desconhecidos no objeto raiz", () => {
    expect(
      parseQuizSubmission({ ...buildValidSubmission(), privileged: true }).success
    ).toBe(false);
  });

  it("limita questionId a 80 caracteres", () => {
    const submission = buildValidSubmission();
    submission.answers[0] = { questionId: "a".repeat(81), answer: false };

    expect(getIssues(submission)).toContainEqual(
      expect.objectContaining({
        code: "too_big",
        path: ["answers", 0, "questionId"],
        maximum: 80,
      })
    );
  });
});
