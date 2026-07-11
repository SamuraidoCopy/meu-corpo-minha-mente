import { z } from "zod";

import { calculateDominantElement, getQuizQuestions } from "@/lib/quiz-data";
import { ELEMENTS, type ElementType } from "@/lib/tcm-data";

const TRACKING_KEYS = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_content",
  "utm_term",
  "src",
] as const;

const CANONICAL_QUESTION_IDS = getQuizQuestions().map((question) => question.id);
const CANONICAL_QUESTION_ID_SET = new Set(CANONICAL_QUESTION_IDS);

const trackingFields = Object.fromEntries(
  TRACKING_KEYS.map((key) => [key, z.string().trim().max(180).optional()])
) as Record<(typeof TRACKING_KEYS)[number], z.ZodOptional<z.ZodString>>;

export const quizTrackingSchema = z.object(trackingFields).strict().default({});

export const quizAnswerSchema = z.object({
  questionId: z.string().trim().max(80),
  answer: z.boolean(),
});

const quizElementSchema = z
  .string()
  .refine((value): value is ElementType => Object.hasOwn(ELEMENTS, value), {
    message: "Elemento invalido.",
  });

export const quizLeadSchema = z
  .object({
    submissionId: z.uuid(),
    name: z
      .string()
      .transform((value) => value.trim().replace(/\s+/g, " "))
      .pipe(z.string().min(2, "Informe seu primeiro nome.").max(80)),
    email: z.string().trim().toLowerCase().email("Informe um e-mail valido.").max(180),
    consent: z.literal(true),
    element: quizElementSchema,
    answers: z.array(quizAnswerSchema).length(CANONICAL_QUESTION_IDS.length),
    tracking: quizTrackingSchema.optional().default({}),
    website: z.string().max(200).optional().default(""),
  })
  .strict()
  .superRefine((submission, context) => {
    const submittedIds = submission.answers.map((answer) => answer.questionId);
    const submittedIdSet = new Set(submittedIds);

    if (submittedIdSet.size !== submittedIds.length) {
      context.addIssue({
        code: "custom",
        path: ["answers"],
        message: "As respostas nao podem repetir perguntas.",
      });
    }

    if (
      submittedIds.some((questionId) => !CANONICAL_QUESTION_ID_SET.has(questionId)) ||
      CANONICAL_QUESTION_IDS.some((questionId) => !submittedIdSet.has(questionId))
    ) {
      context.addIssue({
        code: "custom",
        path: ["answers"],
        message: "Responda exatamente as perguntas canonicas do quiz.",
      });
    }
  })
  .transform((submission) => ({
    ...submission,
    element: calculateDominantElement(submission.answers),
  }));

export type QuizSubmissionInput = z.input<typeof quizLeadSchema>;
export type QuizSubmission = z.output<typeof quizLeadSchema>;
export type QuizTracking = z.output<typeof quizTrackingSchema>;

export function parseQuizSubmission(input: unknown) {
  return quizLeadSchema.safeParse(input);
}
