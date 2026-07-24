import type { Metadata } from "next";

import { QUIZ_COPY } from "@/lib/quiz-copy";

import { QuizClient } from "./quiz-client";

export const metadata: Metadata = QUIZ_COPY.metadata;

export default function QuizPage() {
  return <QuizClient />;
}
