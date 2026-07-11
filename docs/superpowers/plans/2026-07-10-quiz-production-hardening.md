# Quiz Production Hardening Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Tornar a captura do quiz segura, idempotente e pronta para enviar resultados pelos cinco templates do Brevo.

**Architecture:** Um contrato puro valida a submissão; a Server Action coordena um rate limit atômico no Supabase, inserção idempotente e os adaptadores Brevo. O cliente fornece um UUID estável, enquanto a migration protege concorrência e evita armazenar identificadores brutos no rate limit.

**Tech Stack:** Next.js 15, TypeScript, Zod, Supabase/PostgreSQL, Brevo API v3, Vitest.

---

### Task 1: Contrato canônico da submissão

**Files:**
- Create: `src/lib/quiz-submission.ts`
- Create: `src/__tests__/quiz-submission.test.ts`

- [ ] Escrever testes que rejeitam menos ou mais de 10 respostas, IDs desconhecidos, IDs repetidos e `submissionId` inválido.
- [ ] Executar `npm test -- src/__tests__/quiz-submission.test.ts` e confirmar falha por módulo ausente.
- [ ] Implementar `quizLeadSchema` e `parseQuizSubmission`, comparando o conjunto de IDs com `getQuizQuestions()` e recalculando o elemento.
- [ ] Reexecutar o teste e confirmar todos os casos verdes.

### Task 2: Idempotência no cliente e no banco

**Files:**
- Modify: `src/app/quiz/quiz-client.tsx`
- Modify: `supabase/migrations/20260707_create_quiz_leads.sql`
- Test: `src/__tests__/quiz-submission.test.ts`

- [ ] Adicionar teste de contrato para UUID estável.
- [ ] Gerar `submissionId` com `crypto.randomUUID()` ao iniciar o quiz e enviá-lo no gate.
- [ ] Adicionar `submission_id uuid not null` e índice único à migration.
- [ ] Garantir que a ação trate erro PostgreSQL `23505` como retry idempotente.

### Task 3: Rate limit persistente

**Files:**
- Create: `src/lib/quiz-rate-limit.ts`
- Create: `src/__tests__/quiz-rate-limit.test.ts`
- Modify: `supabase/migrations/20260707_create_quiz_leads.sql`
- Modify: `src/app/quiz/actions.ts`

- [ ] Escrever testes para HMAC determinístico, separação IP/e-mail e ausência de dados brutos.
- [ ] Executar o teste e confirmar falha por módulo ausente.
- [ ] Implementar `hashRateLimitIdentifier` usando HMAC-SHA256 e `QUIZ_RATE_LIMIT_SECRET`.
- [ ] Criar tabela `quiz_rate_limits` e RPC atômica com limites 10/IP e 3/e-mail em 10 minutos.
- [ ] Remover o `Map` em memória e chamar a RPC antes da inserção.
- [ ] Falhar fechado quando a RPC ou o segredo não estiver disponível.

### Task 4: Orquestração testável da Server Action

**Files:**
- Modify: `src/app/quiz/actions.ts`
- Create: `src/__tests__/quiz-actions.test.ts`

- [ ] Mockar `next/headers`, Supabase admin e Brevo.
- [ ] Escrever casos para payload adulterado, honeypot, rate limit, inserção inicial, conflito idempotente e falha de e-mail.
- [ ] Confirmar os testes em vermelho antes de alterar a ação.
- [ ] Integrar `parseQuizSubmission`, RPC persistente e conflito `23505` com o mínimo de mudanças.
- [ ] Confirmar que apenas a inserção nova chama Brevo.

### Task 5: Contrato real do Brevo

**Files:**
- Modify: `src/lib/brevo.ts`
- Create: `src/__tests__/brevo-quiz.test.ts`

- [ ] Escrever testes para IDs 1 a 5 do atributo categórico `ELEMENTO`, templates por elemento e payload sem `FIRSTNAME`.
- [ ] Confirmar os testes em vermelho.
- [ ] Alterar atributos para `Record<string, string | number>` e mapear `Água=1`, `Fogo=2`, `Madeira=3`, `Terra=4`, `Metal=5`.
- [ ] Manter `NOME` e `ORIGEM`, removendo `FIRSTNAME`.
- [ ] Confirmar tratamento de respostas não-2xx sem lançar segredo ou payload em logs.

### Task 6: Configuração e recursos externos

**Files:**
- Modify: `.env.example`
- Modify ignored local file: `.env.local`

- [ ] Documentar `BREVO_LIST_LEADS_ID=8`, os cinco IDs de template e `QUIZ_RATE_LIMIT_SECRET`.
- [ ] Criar o atributo normal `ORIGEM` no Brevo se ainda ausente.
- [ ] Ativar templates 17, 18, 19, 20 e 21.
- [ ] Verificar lista 8, remetente e domínio por chamadas somente leitura após as alterações.
- [ ] Configurar as mesmas variáveis na Vercel quando houver sessão autenticada disponível.

### Task 7: Higiene de lint e validação final

**Files:**
- Modify: `eslint.config.mjs`
- Create: `.github/workflows/ci.yml`

- [ ] Adicionar ignores para `.next/**`, `.next-dev/**`, artefatos e diretórios temporários já presentes no repositório.
- [ ] Criar CI com instalação, testes, tipos, lint e build.
- [ ] Executar `npm test`, `npx tsc --noEmit --pretty false`, `npm run lint` e `npm run build`.
- [ ] Iniciar o servidor de produção e percorrer o quiz no navegador sem submissão real.
- [ ] Executar um único envio controlado, confirmar linha no Supabase e entrega no Brevo, e remover o lead de teste se necessário.
- [ ] Rodar `git diff --check` e revisar o conjunto exato de arquivos antes de qualquer commit ou push.
