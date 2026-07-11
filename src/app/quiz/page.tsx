import type { Metadata } from "next";

import { QuizClient } from "./quiz-client";

export const metadata: Metadata = {
  title: "O que domina seu corpo? | Meu Corpo Minha Mente",
  description:
    "Responda 10 perguntas rápidas e descubra seu elemento dominante em uma leitura inicial de autoconhecimento.",
};

export default function QuizPage() {
  return <QuizClient />;
}
