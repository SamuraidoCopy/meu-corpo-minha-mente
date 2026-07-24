# Quiz Public Copy Narrative Alignment Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Alinhar a copy pública do quiz à narrativa atual do MCMM, apresentando o resultado como um elemento em destaque e uma primeira leitura de padrões, sem alterar o cálculo, as perguntas, o produto pago ou o nome do Método Cortando o Mal pela Raiz™.

**Architecture:** Manter `src/lib/quiz-copy.ts` como fonte única da linguagem pública e fazer `page.tsx` e `quiz-client.tsx` consumirem esse contrato. Preservar `src/lib/quiz-data.ts`, `src/lib/tcm-data.ts`, as dez perguntas, o checkout e os identificadores históricos de analytics. Atualizar também os dois documentos de produto que ainda registram o nome anterior.

**Tech Stack:** Next.js, React, TypeScript, Vitest, Markdown.

---

## Decisões de copy

| Trecho atual | Nova direção aprovada |
|---|---|
| “O que domina seu corpo?” | “O que você precisa prestar atenção agora?” |
| “Cada sinal aponta pra um elemento diferente” | “Suas respostas ajudam a organizar os sinais e padrões” |
| “Descubra qual domina você” | “Veja qual eixo emocional está mais forte em você” |
| “Elemento dominante” | “Elemento em destaque” |
| “Mostrar onde a tensão realmente começa” | “Aprofundar a investigação dos padrões relacionados à tensão” |
| “Entender de onde vem a agitação” | “Observar como esse padrão aparece na sua história e rotina” |

Nota editorial: foi acrescentado o verbo “está” à terceira formulação para completar a frase sem mudar a intenção aprovada.

## Limites da mudança

- Não modificar `src/lib/quiz-data.ts`.
- Não modificar `src/lib/tcm-data.ts`.
- Não modificar `/diagnostico`, `/mapa` ou `/diario`.
- Não mudar as dez perguntas, a pontuação ou o critério de desempate.
- Não renomear `calculateDominantElement`, pois é uma implementação interna.
- Não renomear `quiz_o_que_domina_seu_corpo`, para preservar a continuidade histórica dos eventos.
- Não apresentar o quiz como diagnóstico, causa exata ou conclusão total sobre a pessoa.
- Manter o nome **Método Cortando o Mal pela Raiz™**.

## Mapa de arquivos

- Modificar `src/lib/quiz-copy.ts`: fonte única da abertura, metadata, rótulo do resultado, ponte por elemento e próximo passo.
- Modificar `src/app/quiz/page.tsx`: consumir a metadata da fonte única de copy.
- Modificar `src/app/quiz/quiz-client.tsx`: substituir o rótulo fixo “Elemento dominante” pela copy centralizada.
- Modificar `src/__tests__/quiz-copy.test.ts`: testar o novo contrato e impedir a volta da linguagem determinista.
- Modificar `Produtos/Quiz/PRD_Quiz_Emocao_Raiz.md`: registrar o novo nome público e o novo enquadramento.
- Modificar `Documentos de Estratégia/Resumo_para_Aprovacao_Dras_Quiz.md`: reconciliar o título e os exemplos com a decisão mais recente.

### Task 1: Fixar o novo contrato editorial em testes

**Files:**
- Modify: `src/__tests__/quiz-copy.test.ts`
- Test: `src/__tests__/quiz-copy.test.ts`

- [ ] **Step 1: Escrever o teste que exige a nova abertura e o novo rótulo**

Adicionar:

```ts
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
```

- [ ] **Step 2: Escrever o teste que rejeita a linguagem determinista visível**

Adicionar:

```ts
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
```

- [ ] **Step 3: Executar o teste e confirmar a falha esperada**

Run:

```powershell
npm test -- src/__tests__/quiz-copy.test.ts
```

Expected: FAIL porque `metadata` e `result.label` ainda não existem e a copy atual contém as expressões deterministas.

- [ ] **Step 4: Registrar somente o teste, se commits fizerem parte da execução autorizada**

```powershell
git add src/__tests__/quiz-copy.test.ts
git commit -m "test: define new public quiz copy contract"
```

### Task 2: Atualizar a fonte única da copy pública

**Files:**
- Modify: `src/lib/quiz-copy.ts:3-71`
- Test: `src/__tests__/quiz-copy.test.ts`

- [ ] **Step 1: Adicionar a metadata e substituir a abertura**

No início de `QUIZ_COPY`, usar:

```ts
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
```

- [ ] **Step 2: Centralizar o rótulo do resultado e explicitar o mecanismo no próximo passo**

Substituir o bloco `result` por:

```ts
result: {
  label: "Elemento em destaque",
  headline: "Este é um primeiro sinal. A leitura completa vai além.",
  nextStep:
    "Aprofunde esta leitura com o Mapa da Raiz, primeiro passo do Método Cortando o Mal pela Raiz™.",
  cta: "Quero aprofundar minha leitura",
},
```

- [ ] **Step 3: Reescrever as cinco pontes sem conclusões causais**

Manter o primeiro parágrafo de observação de cada elemento e substituir o segundo parágrafo por:

```ts
Madeira: [
  "Suas respostas foram na direção da Madeira. É uma leitura inicial — vale observar se esse padrão aparece mais quando os planos não saem como você esperava.",
  "O Mapa da Raiz amplia esta primeira leitura com mais 15 perguntas, reflexão guiada e leitura facial para aprofundar a investigação dos padrões relacionados à tensão.",
],
Fogo: [
  "Suas respostas foram na direção do Fogo. É uma leitura inicial — vale observar se a mente acelera justamente nas horas em que o corpo precisa desacelerar.",
  "O Mapa da Raiz amplia esta primeira leitura com mais 15 perguntas, reflexão guiada e leitura facial para observar como esse padrão aparece na sua história e rotina.",
],
Terra: [
  "Suas respostas foram na direção da Terra. É uma leitura inicial — vale observar o que anda difícil de digerir nas últimas semanas.",
  "O Mapa da Raiz amplia esta primeira leitura com mais 15 perguntas, reflexão guiada e leitura facial para observar como preocupação e sobrecarga aparecem na sua história e rotina.",
],
Metal: [
  "Suas respostas foram na direção do Metal. É uma leitura inicial — vale observar o que você está segurando há tempo demais.",
  "O Mapa da Raiz amplia esta primeira leitura com mais 15 perguntas, reflexão guiada e leitura facial para aprofundar a investigação dos padrões relacionados aos limites e à dificuldade de deixar ir.",
],
Água: [
  "Suas respostas foram na direção da Água. É uma leitura inicial — vale observar quantas decisões recentes você adiou por medo, não por falta de tempo.",
  "O Mapa da Raiz amplia esta primeira leitura com mais 15 perguntas, reflexão guiada e leitura facial para observar como medo, insegurança e esgotamento aparecem na sua história e rotina.",
],
```

- [ ] **Step 4: Executar o teste focal**

Run:

```powershell
npm test -- src/__tests__/quiz-copy.test.ts
```

Expected: PASS em todos os testes de `quiz-copy`.

- [ ] **Step 5: Registrar a fonte de copy, se commits fizerem parte da execução autorizada**

```powershell
git add src/lib/quiz-copy.ts src/__tests__/quiz-copy.test.ts
git commit -m "feat: align public quiz copy with current narrative"
```

### Task 3: Fazer a interface consumir integralmente a fonte de copy

**Files:**
- Modify: `src/app/quiz/page.tsx:5-9`
- Modify: `src/app/quiz/quiz-client.tsx:370-373`
- Test: `src/__tests__/quiz-copy.test.ts`

- [ ] **Step 1: Consumir a metadata centralizada**

Em `page.tsx`, importar `QUIZ_COPY`:

```ts
import { QUIZ_COPY } from "@/lib/quiz-copy";
```

Substituir a declaração da metadata por:

```ts
export const metadata: Metadata = QUIZ_COPY.metadata;
```

- [ ] **Step 2: Substituir o rótulo fixo do resultado**

Em `quiz-client.tsx`, substituir:

```tsx
Elemento dominante
```

por:

```tsx
{QUIZ_COPY.result.label}
```

- [ ] **Step 3: Confirmar que identificadores internos foram preservados**

Run:

```powershell
rg -n "calculateDominantElement|quiz_o_que_domina_seu_corpo" src/app/quiz src/lib/quiz-data.ts
```

Expected: a função interna e os eventos históricos continuam presentes.

- [ ] **Step 4: Confirmar que a linguagem antiga não está mais visível**

Run:

```powershell
rg -n -i "O que domina seu corpo|qual domina você|Elemento dominante|onde a tensão realmente começa|de onde vem a agitação" src/app/quiz src/components/ui/stack-feature-section.tsx src/lib/quiz-copy.ts
```

Expected: nenhum resultado visível; ocorrências em identificadores técnicos estáveis não entram neste comando porque usam `snake_case`.

- [ ] **Step 5: Registrar a integração da interface, se commits fizerem parte da execução autorizada**

```powershell
git add src/app/quiz/page.tsx src/app/quiz/quiz-client.tsx
git commit -m "refactor: centralize visible quiz labels and metadata"
```

### Task 4: Reconciliar os documentos de produto

**Files:**
- Modify: `G:/Meu Drive/Obsidian/Vitor Samurai 2 cerebro advance/Projetos/Profissional/Samurai do Copy/Missão Católica/Clientes/Dra. Ranieli e Cleucia - Meu Corpo Minha Mente/Produtos/Quiz/PRD_Quiz_Emocao_Raiz.md`
- Modify: `G:/Meu Drive/Obsidian/Vitor Samurai 2 cerebro advance/Projetos/Profissional/Samurai do Copy/Missão Católica/Clientes/Dra. Ranieli e Cleucia - Meu Corpo Minha Mente/Documentos de Estratégia/Resumo_para_Aprovacao_Dras_Quiz.md`

- [ ] **Step 1: Atualizar o título e o nome público no PRD**

Aplicar:

```md
# PRD — Quiz "O que você precisa prestar atenção agora?" (Lead Magnet Principal)

> **Nome público atualizado:** "O que você precisa prestar atenção agora?" (alinhamento narrativo, 2026-07-24)
```

Substituir as ocorrências editoriais de “O que domina seu corpo?” pelo novo nome, preservando apenas identificadores técnicos históricos como `quiz_o_que_domina_seu_corpo`.

- [ ] **Step 2: Registrar o enquadramento do resultado no PRD**

Na seção de copy/compliance, registrar:

```md
**Enquadramento do resultado:** o quiz apresenta um **elemento em destaque** e indica qual eixo emocional apareceu com mais força nas respostas. Trata-se de uma primeira leitura para organizar sinais e padrões, não de uma causa individual exata ou conclusão total sobre a pessoa.
```

- [ ] **Step 3: Atualizar o título do resumo para aprovação**

Aplicar:

```md
# Resumo para Aprovação — Quiz "O que você precisa prestar atenção agora?"
```

Na tabela de decisões, usar o mesmo nome e a justificativa:

```md
| Nome do quiz | “O que você precisa prestar atenção agora?” | Convida a pessoa a observar o que merece atenção sem transformar a primeira leitura em veredito |
```

- [ ] **Step 4: Verificar que os documentos contam a mesma história**

Run:

```powershell
rg -n "O que domina seu corpo|O que você precisa prestar atenção agora|elemento dominante|elemento em destaque" `
  "G:\Meu Drive\Obsidian\Vitor Samurai 2 cerebro advance\Projetos\Profissional\Samurai do Copy\Missão Católica\Clientes\Dra. Ranieli e Cleucia - Meu Corpo Minha Mente\Produtos\Quiz\PRD_Quiz_Emocao_Raiz.md" `
  "G:\Meu Drive\Obsidian\Vitor Samurai 2 cerebro advance\Projetos\Profissional\Samurai do Copy\Missão Católica\Clientes\Dra. Ranieli e Cleucia - Meu Corpo Minha Mente\Documentos de Estratégia\Resumo_para_Aprovacao_Dras_Quiz.md"
```

Expected: o novo nome e “elemento em destaque” aparecem como linguagem pública; o nome anterior não permanece como decisão vigente.

### Task 5: Verificação final sem regressão

**Files:**
- Test: `src/__tests__/quiz-copy.test.ts`
- Verify: `src/lib/quiz-data.ts`
- Verify: `src/lib/tcm-data.ts`
- Verify: `src/app/quiz/quiz-client.tsx`

- [ ] **Step 1: Executar os testes do quiz**

Run:

```powershell
npm test -- src/__tests__/quiz-copy.test.ts src/__tests__/quiz-data.test.ts
```

Expected: todos os testes passam.

- [ ] **Step 2: Executar a suíte completa**

Run:

```powershell
npm test
```

Expected: suíte completa aprovada.

- [ ] **Step 3: Executar o build de produção**

Run:

```powershell
npm run build
```

Expected: build concluído sem erro de TypeScript ou Next.js.

- [ ] **Step 4: Revisar o escopo final**

Run:

```powershell
git diff -- src/lib/quiz-copy.ts src/app/quiz/page.tsx src/app/quiz/quiz-client.tsx src/__tests__/quiz-copy.test.ts
git status --short
```

Expected: nenhuma alteração em `src/lib/tcm-data.ts`, `src/lib/quiz-data.ts` ou nas rotas pagas. Os arquivos não relacionados que já estavam no worktree continuam intocados.

- [ ] **Step 5: Fazer smoke test manual do funil**

Validar em `/quiz`:

1. A abertura mostra “O que você precisa prestar atenção agora?”.
2. As dez perguntas continuam funcionando.
3. O gate continua exigindo nome, e-mail e consentimento.
4. O resultado mostra “Elemento em destaque”.
5. A ponte usa linguagem de observação e investigação.
6. O próximo passo preserva “Método Cortando o Mal pela Raiz™”.
7. O CTA continua levando para `/o-mapa-da-raiz-pva`.
8. O disclaimer médico e psicológico continua visível.

- [ ] **Step 6: Registrar a verificação final, se commits fizerem parte da execução autorizada**

```powershell
git add src/lib/quiz-copy.ts src/app/quiz/page.tsx src/app/quiz/quiz-client.tsx src/__tests__/quiz-copy.test.ts
git commit -m "test: verify quiz narrative alignment"
```
