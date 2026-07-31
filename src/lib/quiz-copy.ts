import type { ElementType } from "@/lib/tcm-data";

export const QUIZ_COPY = {
  metadata: {
    title: "O que você precisa prestar atenção agora? | Meu Corpo Minha Mente",
    description:
      "Responda 10 perguntas rápidas e veja qual elemento e eixo emocional aparecem em destaque nesta leitura inicial de autoconhecimento.",
  },
  intro: {
    eyebrow: "Mapa inicial gratuito",
    title: "O que você precisa prestar atenção agora?",
    description:
      "Cansaço que não passa, irritação por qualquer coisa e situações que se repetem podem ser sinais de padrões que merecem atenção. Em 10 perguntas simples (cerca de 90 segundos), suas respostas ajudam a organizar os sinais e padrões e mostram qual eixo emocional está mais forte em você, com base nos cinco elementos da Medicina Tradicional Chinesa.",
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
    label: "Elemento em destaque",
    headline: "Este é um primeiro sinal. A leitura completa vai além.",
    nextStep:
      "Aprofunde esta leitura com o Mapa da Raiz, primeiro passo do Método Cortando o Mal pela Raiz™.",
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
      "O Mapa da Raiz amplia esta primeira leitura com mais 15 perguntas, reflexão guiada e leitura facial para aprofundar a investigação dos padrões relacionados à tensão.",
    ],
  },
  Fogo: {
    description:
      "Fogo rege o ritmo — do coração e da mente. Quando esse ritmo acelera demais, a cabeça costuma continuar girando bem depois da hora de dormir.",
    bridge: [
      "Suas respostas foram na direção do Fogo. É uma leitura inicial — vale observar se a mente acelera justamente nas horas em que o corpo precisa desacelerar.",
      "O Mapa da Raiz amplia esta primeira leitura com mais 15 perguntas, reflexão guiada e leitura facial para observar como esse padrão aparece na sua história e rotina.",
    ],
  },
  Terra: {
    description:
      "Terra rege a digestão, de comida e de experiência. Quando algo fica difícil demais de \"digerir\", o pensamento entra em loop e o cansaço cobra a conta.",
    bridge: [
      "Suas respostas foram na direção da Terra. É uma leitura inicial — vale observar o que anda difícil de digerir nas últimas semanas.",
      "O Mapa da Raiz amplia esta primeira leitura com mais 15 perguntas, reflexão guiada e leitura facial para observar como preocupação e sobrecarga aparecem na sua história e rotina.",
    ],
  },
  Metal: {
    description:
      "Metal rege os limites: o que você deixa entrar e o que escolhe deixar ir. Quando esse limite embaça, dizer \"não\" costuma custar mais caro do que devia.",
    bridge: [
      "Suas respostas foram na direção do Metal. É uma leitura inicial — vale observar o que você está segurando há tempo demais.",
      "O Mapa da Raiz amplia esta primeira leitura com mais 15 perguntas, reflexão guiada e leitura facial para aprofundar a investigação dos padrões relacionados aos limites e à dificuldade de deixar ir.",
    ],
  },
  Água: {
    description:
      "Água é a reserva — a bateria vital que sustenta o resto. Quando ela opera no vermelho, o medo às vezes decide antes da coragem.",
    bridge: [
      "Suas respostas foram na direção da Água. É uma leitura inicial — vale observar quantas decisões recentes você adiou por medo, não por falta de tempo.",
      "O Mapa da Raiz amplia esta primeira leitura com mais 15 perguntas, reflexão guiada e leitura facial para observar como medo, insegurança e esgotamento aparecem na sua história e rotina.",
    ],
  },
};
