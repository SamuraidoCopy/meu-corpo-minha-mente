import { ELEMENTS, ElementType, Question, getTcmQuestions } from "@/lib/tcm-data";

export type QuizAnswer = {
  questionId: string;
  answer: boolean;
};

const QUIZ_QUESTION_IDS = [
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
] as const;

const EMOTIONAL_QUESTION_BY_ELEMENT: Record<ElementType, string> = {
  Madeira: "madeira_1",
  Fogo: "fogo_3",
  Terra: "terra_2",
  Metal: "metal_1",
  Água: "agua_2",
};

const ELEMENT_ORDER = Object.keys(ELEMENTS) as ElementType[];

export function getQuizQuestions(): Question[] {
  const allQuestions = getTcmQuestions("Feminino");

  return QUIZ_QUESTION_IDS.map((id) => {
    const question = allQuestions.find((item) => item.id === id);
    if (!question) {
      throw new Error(`Pergunta do quiz não encontrada: ${id}`);
    }

    return question;
  });
}
export function calculateQuizScores(answers: QuizAnswer[]): Record<ElementType, number> {
  const questionsById = new Map(getQuizQuestions().map((question) => [question.id, question]));

  return answers.reduce(
    (scores, answer) => {
      if (!answer.answer) return scores;

      const question = questionsById.get(answer.questionId);
      if (!question) return scores;

      scores[question.element] += 1;
      return scores;
    },
    ELEMENT_ORDER.reduce(
      (scores, element) => ({ ...scores, [element]: 0 }),
      {} as Record<ElementType, number>
    )
  );
}

export function calculateDominantElement(answers: QuizAnswer[]): ElementType {
  const questionsById = new Map(getQuizQuestions().map((question) => [question.id, question]));
  const scores = calculateQuizScores(answers);
  const maxScore = Math.max(...Object.values(scores));

  if (maxScore === 0) {
    return "Terra";
  }

  const tiedElements = ELEMENT_ORDER.filter((element) => scores[element] === maxScore);
  if (tiedElements.length === 1) {
    return tiedElements[0];
  }

  const tiedWithEmotionalYes = tiedElements.filter((element) =>
    answers.some(
      (answer) => answer.answer && answer.questionId === EMOTIONAL_QUESTION_BY_ELEMENT[element]
    )
  );

  if (tiedWithEmotionalYes.length === 1) {
    return tiedWithEmotionalYes[0];
  }

  const eligibleElements = tiedWithEmotionalYes.length > 0 ? tiedWithEmotionalYes : tiedElements;
  const lastYesForTie = [...answers]
    .reverse()
    .find((answer) => {
      if (!answer.answer) return false;

      const question = questionsById.get(answer.questionId);
      return question ? eligibleElements.includes(question.element) : false;
    });

  if (lastYesForTie) {
    const question = questionsById.get(lastYesForTie.questionId);
    if (question) return question.element;
  }

  return tiedElements[0];
}
