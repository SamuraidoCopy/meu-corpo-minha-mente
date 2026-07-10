# Design: copy cautelosa para o quiz

## Objetivo

Melhorar a conversão e a confiança da rota pública `/quiz` sem alterar a experiência ou as descrições compartilhadas do app pago.

## Escopo

- Reescrever a abertura, o gate de captura e os CTAs do quiz.
- Ocultar o nome do elemento durante as perguntas.
- Criar descrições e pontes de oferta específicas do quiz para os cinco elementos.
- Manter perguntas, cálculo de pontuação, persistência de leads, rastreamento e URLs de checkout inalterados.
- Não alterar `src/lib/tcm-data.ts` nem os fluxos do produto pago.

## Arquitetura

Criar `src/lib/quiz-copy.ts` como a única fonte de conteúdo editorial da rota pública. O módulo exportará uma entrada para cada `ElementType`, com:

- `description`: leitura educativa contextualizada como associação da tradição da Medicina Tradicional Chinesa, sem diagnóstico ou promessa clínica.
- `bridge`: dois parágrafos. O primeiro deixa claro que as respostas indicam um padrão inicial; o segundo explica que o Mapa da Raiz aprofunda a leitura com 15 perguntas, reflexão guiada e leitura facial.

`QuizClient` usará esse módulo no resultado. A rota continuará a usar `ELEMENTS` somente para nome, emoção, órgão, tema e ícone.

## Copy e comportamento

- Abertura: informar "10 perguntas" e "cerca de 90 segundos", traduzindo o elemento em um padrão emocional percebido nos sinais do corpo. CTA: "Descobrir meu elemento".
- Perguntas: mostrar apenas número e progresso. O elemento não aparece antes da resposta para evitar viés de confirmação.
- Gate: resultado disponível na próxima tela e cópia enviada por e-mail. CTA: "Revelar meu elemento".
- Resultado: descrever o padrão com linguagem de autoconhecimento, incluir a ressalva educativa atual e convidar para aprofundar a leitura. CTA: "Quero aprofundar minha leitura".

## Segurança de linguagem

O conteúdo exclusivo do quiz não poderá conter "cura", "curar", "diagnóstico", "adoecimento" ou promessas de resultado clínico. As descrições usarão construções como "na tradição da MTC, este elemento é associado a..." e "essa leitura inicial não substitui acompanhamento médico ou psicológico".

## Testes

Antes da implementação, criar testes para o módulo de copy que:

1. Cobrem os cinco elementos do domínio.
2. Confirmam que cada elemento possui descrição e ponte não vazias.
3. Reprovam caso os termos proibidos apareçam na copy pública.

Depois, executar o teste específico, a suíte completa, lint e build.

## Fora de escopo

- Alterar templates transacionais hospedados no Brevo.
- Mudar a lógica de cálculo de elemento, as perguntas ou o consentimento LGPD.
- Fazer teste A/B, trocar o layout visual ou modificar a página de vendas.
