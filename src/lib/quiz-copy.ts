import type { ElementType } from "@/lib/tcm-data";

export const QUIZ_COPY = {
  intro: {
    eyebrow: "Mapa inicial gratuito",
    title: "O que domina seu corpo?",
    description:
      "Cansaço que não passa e irritação por qualquer coisa são sinais: cada um aponta pra um elemento diferente. Em 10 perguntas simples (cerca de 90 segundos), descubra qual domina você e receba uma leitura inicial baseada nos 5 elementos da Medicina Tradicional Chinesa.",
    cta: "Descobrir meu elemento",
  },
  gate: {
    badge: "Seu mapa está pronto",
    title: "Seu resultado está pronto.",
    description:
      "Veja sua leitura agora e receba uma cópia no e-mail para consultar depois.",
    cta: "Revelar meu elemento",
  },
  result: {
    headline: "Este é um primeiro sinal. A leitura completa vai além.",
    nextStep: "Conheça o Mapa da Raiz com o app e a leitura facial.",
    cta: "Quero aprofundar minha leitura",
  },
} as const;

export interface QuizResultCopy {
  description: string;
  bridge: [string, string];
}

export const QUIZ_RESULT_COPY: Record<ElementType, QuizResultCopy> = {
  Madeira: {
    description:
      "Madeira é o elemento de quem planeja e segue em frente. Não é raro notar mais irritação bem na hora em que um plano trava ou alguém muda a rota que você já tinha decidido.",
    bridge: [
      "Suas respostas foram na direção da Madeira. É uma leitura inicial — vale observar se esse padrão aparece mais quando os planos não saem como você esperava.",
      "Esse quiz avaliou 10 sinais. O Mapa da Raiz soma mais 15 perguntas, reflexão guiada e leitura facial pra mostrar onde a tensão realmente começa.",
    ],
  },
  Fogo: {
    description:
      "Fogo rege o ritmo — do coração e da mente. Quando esse ritmo acelera demais, a cabeça costuma continuar girando bem depois da hora de dormir.",
    bridge: [
      "Suas respostas foram na direção do Fogo. É uma leitura inicial — vale observar se a mente acelera justamente nas horas em que o corpo precisa desacelerar.",
      "Esse quiz avaliou 10 sinais. O Mapa da Raiz soma mais 15 perguntas, reflexão guiada e leitura facial pra entender de onde vem a agitação.",
    ],
  },
  Terra: {
    description:
      "Terra rege a digestão, de comida e de experiência. Quando algo fica difícil demais de \"digerir\", o pensamento entra em loop e o cansaço cobra a conta.",
    bridge: [
      "Suas respostas foram na direção da Terra. É uma leitura inicial — vale observar o que anda difícil de digerir nas últimas semanas.",
      "Esse quiz avaliou 10 sinais. O Mapa da Raiz soma mais 15 perguntas, reflexão guiada e leitura facial pra chegar ao que você anda digerindo.",
    ],
  },
  Metal: {
    description:
      "Metal rege os limites: o que você deixa entrar e o que escolhe deixar ir. Quando esse limite embaça, dizer \"não\" costuma custar mais caro do que devia.",
    bridge: [
      "Suas respostas foram na direção do Metal. É uma leitura inicial — vale observar o que você está segurando há tempo demais.",
      "Esse quiz avaliou 10 sinais. O Mapa da Raiz soma mais 15 perguntas, reflexão guiada e leitura facial pra entender o que ainda está difícil de soltar.",
    ],
  },
  Água: {
    description:
      "Água é a reserva — a bateria vital que sustenta o resto. Quando ela opera no vermelho, o medo às vezes decide antes da coragem.",
    bridge: [
      "Suas respostas foram na direção da Água. É uma leitura inicial — vale observar quantas decisões recentes você adiou por medo, não por falta de tempo.",
      "Esse quiz avaliou 10 sinais. O Mapa da Raiz soma mais 15 perguntas, reflexão guiada e leitura facial pra encher a bateria de novo.",
    ],
  },
};
