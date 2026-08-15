# Diagnóstico fundamentado e desempate contextual — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax so progress can be tracked.

**Goal:** Substituir a escolha implícita do primeiro elemento empatado por uma leitura reproduzível, baseada nas 15 perguntas, com desempate contextual imediato, resultado combinado quando necessário e persistência auditável.

**Architecture:** A camada pura de domínio calcula pontuações, empates, desempates e convergência facial em ordem estável. O servidor valida e recalcula toda submissão antes de persistir uma avaliação versionada em `diagnostic_assessments`; o perfil mantém apenas um cache compatível para resultado único. O wizard funciona como uma máquina de estados explícita (principal → desempate → comparação/reflexão → resultado), sem confiar em estado cliente para autoridade diagnóstica.

**Tech Stack:** Next.js App Router, React/TypeScript, Supabase/Postgres, Zod, Vitest, Testing Library.

---

## Task 1: Criar o domínio puro do diagnóstico com testes determinísticos

**Files:**
- Create: `src/lib/diagnosis.ts`
- Create: `src/__tests__/diagnosis.test.ts`

- [ ] Definir `ELEMENT_ORDER` estável e os tipos de resultado (`single`, `tie`, `combined`, `insufficient`), método de resolução e convergência facial.
- [ ] Implementar cálculo das 15 perguntas sem descartar a pergunta 15, tratando respostas negativas/all-zero como `insufficient` e nunca escolhendo um elemento por ordem de objeto.
- [ ] Implementar cálculo facial por IDs/zonas com ordem estável, empate explícito e classificação apenas explicativa de convergência.
- [ ] Implementar perguntas contextuais somente para os elementos empatados, escala 0–3, desempate por maior pontuação e pergunta comparativa final quando persistir empate.
- [ ] Escrever testes para cada vencedor possível, pergunta 15, all-zero, empate, ordem facial, desempate resolvido, empate persistente e resposta comparativa “não consigo separar”.
- [ ] Rodar `npx vitest run src/__tests__/diagnosis.test.ts` e corrigir até passar.

## Task 2: Adicionar persistência versionada e validação server-side

**Files:**
- Create: `supabase/migrations/20260814_create_diagnostic_assessments.sql`
- Create: `src/lib/diagnosis-submission.ts`
- Modify: `src/app/diagnostico/actions.ts`
- Create: `src/__tests__/diagnosis-submission.test.ts`

- [ ] Criar tabela `diagnostic_assessments` com usuário, status, zonas/pontuações faciais, respostas/pontuações principais, respostas/pontuações de desempate, tipo/elementos/método do resultado, convergência, reflexões, `algorithm_version` e timestamps.
- [ ] Criar RLS de proprietário e índice para a avaliação mais recente; adicionar `profiles.highlighted_elements text[]` para compatibilidade/cache.
- [ ] Definir schemas Zod canônicos para IDs de pergunta/zona, respostas, escalas, elementos e payload de salvamento; rejeitar elementos client-side que não possam ser derivados dos dados.
- [ ] Implementar action única de conclusão que autentica, valida, recalcula pelo domínio puro, grava a avaliação e atualiza o perfil somente para resultado `single`.
- [ ] Retornar erros estruturados e seguros, sem `@ts-ignore`; usar `revalidatePath` das telas realmente consumidoras.
- [ ] Testar payload válido, pergunta ausente/extra, zona inválida, elemento forjado e atualização single versus combined/insufficient.

## Task 3: Integrar mapa facial e entrada do diagnóstico sem autoridade por query string

**Files:**
- Modify: `src/app/mapa/mapa-client.tsx`
- Modify: `src/app/diagnostico/page.tsx`
- Modify: `src/lib/tcm-data.ts` (somente se necessário para IDs/ordem compartilhados)

- [ ] Fazer o mapa enviar IDs das zonas selecionadas (não somente `?element=`), preservando a seleção para auditoria.
- [ ] Validar/normalizar zonas no servidor e no carregamento da página; ignorar elemento recebido na URL como autoridade para usuários comuns.
- [ ] Manter compatibilidade de entrada para links antigos sem permitir que eles pulem o cálculo principal.
- [ ] Cobrir com teste de integração ou teste de transformação o mapeamento de zonas e a rejeição de IDs desconhecidos.

## Task 4: Reescrever o wizard como máquina de estados com desempate imediato

**Files:**
- Modify: `src/app/diagnostico/wizard.tsx`
- Create: `src/__tests__/diagnosis-wizard.test.tsx`

- [ ] Remover o skip baseado em `hasCompletedInitialDiagnosis`; permitir apenas retomada de avaliação `in_progress` válida.
- [ ] Garantir que a resposta clicada seja incorporada antes de classificar (sem perder a última resposta por atualização assíncrona de state).
- [ ] Após detectar empate, abrir imediatamente uma pergunta contextual para cada elemento empatado, em ordem estável; não mostrar resultado prematuro.
- [ ] Mostrar pergunta comparativa final quando o contextual não separar; produzir resultado combinado se a pessoa não conseguir separar.
- [ ] Diferenciar estados `single`, `combined` e `insufficient` na UI, com linguagem educativa e sem alegação clínica.
- [ ] Fazer uma única conclusão persistida, exibir erro/retry quando falhar e só mostrar resultado após confirmação server-side.
- [ ] Testar abertura imediata do desempate, pergunta 15, empate persistente, escolha comparativa e erro de salvamento.

## Task 5: Atualizar dashboard e mapa v2 para resultados não únicos

**Files:**
- Modify: `src/app/o-mapa-da-raiz/page.tsx`
- Modify: `src/app/mapa/v2/page.tsx`
- Modify: componentes diretamente usados por essas telas, se necessário

- [ ] Ler a avaliação concluída mais recente como fonte primária; usar o cache do perfil somente para legado.
- [ ] Renderizar resultado único, combinado e insuficiente sem inventar elemento dominante.
- [ ] Para resultado combinado, permitir escolher qual elemento explorar no mapa v2 sem sobrescrever a avaliação.
- [ ] Manter acesso administrativo explicitamente separado da experiência normal.

## Task 6: Verificação focada, revisão e fechamento

**Files:**
- Review all changed files and migration

- [ ] Rodar `npx vitest run` e separar falhas novas da falha preexistente em `src/__tests__/quiz-copy.test.ts` causada pela alteração local do usuário em `src/lib/quiz-copy.ts`.
- [ ] Rodar ESLint nos arquivos alterados, `npx tsc --noEmit` e `npm run build` quando o ambiente permitir.
- [ ] Revisar diff procurando perda da pergunta 15, fallback por ordem, autoridade de query string, persistência dupla e mensagens clínicas indevidas.
- [ ] Fazer revisão de especificação e revisão de qualidade do código; corrigir achados reais.
- [ ] Registrar resultado final, limitações de ambiente e arquivos alterados.
