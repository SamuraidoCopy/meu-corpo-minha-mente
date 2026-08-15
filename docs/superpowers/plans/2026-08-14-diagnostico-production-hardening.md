# Diagnostic Production Hardening Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fechar os bloqueios de QA do diagnóstico, tornando a persistência exclusivamente server-side, eliminando perda de progresso, removendo vulnerabilidades altas e devolvendo todos os gates do repositório ao estado verde.

**Architecture:** A sessão Supabase da usuária será usada somente para autenticação e leitura protegida por RLS. Toda mutação de `diagnostic_assessments` ocorrerá em Server Actions que validam os payloads canônicos e usam um cliente `service_role`; funções SQL acessíveis apenas ao `service_role` manterão conclusão e merge de progresso atômicos. O wizard serializará salvamentos, enquanto dependências, copy pública e imagens serão saneadas em commits separados para facilitar revisão e rollback.

**Tech Stack:** Next.js 15 App Router, React 19, TypeScript, Supabase/Postgres/RLS, Zod, Vitest, Testing Library, ESLint, npm audit.

---

## File map

- Create: `docs/stories/diagnostico-production-hardening.md` — story formal, riscos, critérios de aceite e checklist de QA.
- Modify: `docs/superpowers/specs/2026-08-14-diagnostico-fundamentado-design.md` — registra a nova fronteira de confiança: leitura do proprietário, mutação apenas pelo backend.
- Create: `supabase/migrations/20260814190000_harden_diagnostic_assessments.sql` — revoga mutações diretas, restringe RPCs e cria merge atômico de progresso.
- Create: `supabase/tests/database/diagnostic_assessments_security.test.sql` — testes de privilégios, RLS e imutabilidade de concluídos.
- Modify: `src/lib/supabase/admin-access.ts` — marca o cliente administrativo como server-only.
- Modify: `src/app/diagnostico/actions.ts` — autentica com a sessão e persiste exclusivamente com o cliente administrativo.
- Create: `src/__tests__/diagnosis-actions.test.ts` — prova a fronteira de confiança e os erros de autenticação/persistência.
- Modify: `src/app/diagnostico/wizard.tsx` — fila de salvamentos para preservar ordem.
- Modify: `src/__tests__/diagnosis-wizard.test.tsx` — teste de concorrência e remoção dos avisos de `act(...)`.
- Modify: `src/lib/quiz-copy.ts` — restaura os dois títulos cautelosos aprovados para o quiz público.
- Modify: `src/__tests__/quiz-copy.test.ts` — permanece como contrato editorial; só deve mudar se a copy aprovada mudar junto.
- Modify: `src/app/diagnostico/page.tsx` — usa `next/image`.
- Modify: `src/app/mapa/mapa-client.tsx` — usa `next/image`.
- Modify: `src/app/o-mapa-da-raiz/page.tsx` — usa `next/image`.
- Modify: `package.json` e `package-lock.json` — alinha o ecossistema Next e atualiza dependências vulneráveis.
- Create: `docs/runbooks/diagnostico-database-hardening.md` — aplicação, smoke test e rollback da migração.

## Target quality gate

- Nenhum papel `anon` ou `authenticated` possui `INSERT`, `UPDATE`, `DELETE` ou `EXECUTE` nas rotinas de mutação do diagnóstico.
- A Server Action recalcula o resultado e chama a persistência apenas com `service_role`.
- Dois salvamentos consecutivos nunca são executados fora de ordem no cliente e o banco faz merge atômico das chaves recebidas.
- `npm test`, `npx tsc --noEmit`, lint focado e `npm run build` terminam com código zero.
- `npm audit --omit=dev --audit-level=high` e `npm audit --audit-level=high` terminam com código zero.
- Os testes SQL demonstram isolamento entre usuárias e impossibilidade de reabrir ou sobrescrever uma avaliação concluída.

---

### Task 1: Formalizar a story e atualizar a fronteira de confiança

**Files:**
- Create: `docs/stories/diagnostico-production-hardening.md`
- Modify: `docs/superpowers/specs/2026-08-14-diagnostico-fundamentado-design.md:168-177`

- [ ] **Step 1: Criar a story formal**

Criar o arquivo com este contrato:

```markdown
# Story: Hardening de produção do diagnóstico

## Status
Ready for Development

## Contexto
A lógica determinística e o desempate estão funcionais, mas usuários autenticados ainda conseguem chamar a RPC de conclusão com um `p_record` arbitrário. Salvamentos de progresso também podem terminar fora de ordem.

## Critérios de aceite
1. Usuários `anon` e `authenticated` não executam rotinas de mutação nem escrevem diretamente em `diagnostic_assessments`.
2. Server Actions autenticam a usuária, validam dados canônicos e usam `service_role` somente depois da autenticação.
3. A conclusão continua atômica e uma avaliação `completed` não pode ser alterada.
4. O progresso é mesclado atomicamente e as chamadas do wizard são serializadas.
5. Testes SQL cobrem privilégios, RLS, isolamento e imutabilidade.
6. A suíte Vitest completa passa sem avisos de `act(...)` nos testes do diagnóstico.
7. Não existem vulnerabilidades altas no audit de produção ou no audit completo.
8. Lint, typecheck e build de produção passam.

## Fora de escopo
- Alterar o algoritmo ou as perguntas de diagnóstico.
- Reinterpretar a base teórica.
- Alterar o conteúdo do diário.

## QA Results
Não revisado.
```

- [ ] **Step 2: Atualizar a especificação de persistência**

Substituir o requisito que concede insert/update direto à usuária por:

```markdown
1. RLS permite à usuária ler somente suas próprias avaliações.
2. `anon` e `authenticated` não possuem privilégios diretos de mutação em `diagnostic_assessments`.
3. Server Actions autenticadas validam os dados canônicos e usam um cliente `service_role` server-only para iniciar, atualizar e concluir avaliações.
4. O resultado é recalculado no servidor antes da chamada atômica de conclusão; nenhuma RPC pública aceita resultado calculado pelo cliente.
```

Renumerar os requisitos seguintes sem alterar seu conteúdo.

- [ ] **Step 3: Revisar escopo**

Run:

```powershell
git diff --check -- docs/stories/diagnostico-production-hardening.md docs/superpowers/specs/2026-08-14-diagnostico-fundamentado-design.md
```

Expected: saída vazia e código zero.

- [ ] **Step 4: Commit**

```powershell
git add docs/stories/diagnostico-production-hardening.md docs/superpowers/specs/2026-08-14-diagnostico-fundamentado-design.md
git commit -m "docs: define diagnosis production hardening"
```

---

### Task 2: Escrever os testes de segurança antes da correção

**Files:**
- Create: `supabase/tests/database/diagnostic_assessments_security.test.sql`
- Create: `src/__tests__/diagnosis-actions.test.ts`

- [ ] **Step 1: Inicializar o harness local do Supabase**

Run:

```powershell
npx supabase init
```

Expected: `supabase/config.toml` criado. Se o arquivo já existir, o comando informa que o projeto já foi inicializado e não deve sobrescrevê-lo.

- [ ] **Step 2: Criar o teste SQL de privilégios**

Criar `supabase/tests/database/diagnostic_assessments_security.test.sql`:

```sql
begin;
select plan(8);

select ok(
  not has_table_privilege('anon', 'public.diagnostic_assessments', 'INSERT'),
  'anon cannot insert diagnostic assessments'
);
select ok(
  not has_table_privilege('authenticated', 'public.diagnostic_assessments', 'INSERT'),
  'authenticated cannot insert diagnostic assessments'
);
select ok(
  not has_table_privilege('authenticated', 'public.diagnostic_assessments', 'UPDATE'),
  'authenticated cannot update diagnostic assessments'
);
select ok(
  not has_table_privilege('authenticated', 'public.diagnostic_assessments', 'DELETE'),
  'authenticated cannot delete diagnostic assessments'
);
select ok(
  not has_function_privilege(
    'authenticated',
    'public.complete_diagnostic_assessment(uuid,jsonb,uuid)',
    'EXECUTE'
  ),
  'authenticated cannot execute completion RPC'
);
select ok(
  has_function_privilege(
    'service_role',
    'public.complete_diagnostic_assessment(uuid,jsonb,uuid)',
    'EXECUTE'
  ),
  'service role can execute completion RPC'
);
select ok(
  not has_function_privilege(
    'authenticated',
    'public.merge_diagnostic_progress(uuid,uuid,jsonb,jsonb,jsonb)',
    'EXECUTE'
  ),
  'authenticated cannot execute progress RPC'
);
select ok(
  has_function_privilege(
    'service_role',
    'public.merge_diagnostic_progress(uuid,uuid,jsonb,jsonb,jsonb)',
    'EXECUTE'
  ),
  'service role can execute progress RPC'
);

select * from finish();
rollback;
```

- [ ] **Step 3: Criar o teste da Server Action**

Criar `src/__tests__/diagnosis-actions.test.ts` com mocks separados para sessão e administração:

```ts
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { getTcmQuestions } from '@/lib/tcm-data'

const mocks = vi.hoisted(() => ({
  getUser: vi.fn(),
  sessionRpc: vi.fn(),
  adminRpc: vi.fn(),
  revalidatePath: vi.fn(),
}))

vi.mock('next/cache', () => ({ revalidatePath: mocks.revalidatePath }))
vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(async () => ({
    auth: { getUser: mocks.getUser },
    rpc: mocks.sessionRpc,
  })),
}))
vi.mock('@/lib/supabase/admin-access', () => ({
  getSupabaseAdmin: vi.fn(() => ({ rpc: mocks.adminRpc })),
}))

import { completeDiagnosis } from '@/app/diagnostico/actions'

const validPayload = {
  facialZoneIds: [],
  questionAnswers: Object.fromEntries(
    getTcmQuestions().map((question, index) => [question.id, index === 0]),
  ),
  tiebreakAnswers: {},
  reflectionAnswers: {},
}

describe('diagnosis actions trust boundary', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.getUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
    mocks.adminRpc.mockResolvedValue({ data: 'assessment-1', error: null })
  })

  it('persists completion through the service-role client only', async () => {
    const result = await completeDiagnosis(validPayload)

    expect(result).toMatchObject({ success: true, assessmentId: 'assessment-1' })
    expect(mocks.sessionRpc).not.toHaveBeenCalled()
    expect(mocks.adminRpc).toHaveBeenCalledWith(
      'complete_diagnostic_assessment',
      expect.objectContaining({ p_user_id: 'user-1' }),
    )
  })

  it('does not initialize privileged persistence when unauthenticated', async () => {
    mocks.getUser.mockResolvedValue({ data: { user: null } })

    await expect(completeDiagnosis(validPayload)).resolves.toEqual({
      error: 'Usuário não autenticado.',
    })
    expect(mocks.adminRpc).not.toHaveBeenCalled()
  })
})
```

- [ ] **Step 4: Executar os testes e confirmar o estado vermelho**

Run:

```powershell
npx vitest run src/__tests__/diagnosis-actions.test.ts
npx supabase start
npx supabase db reset
npx supabase test db supabase/tests/database/diagnostic_assessments_security.test.sql
```

Expected: o teste TypeScript falha porque a action ainda usa o cliente de sessão; o teste SQL falha porque `authenticated` ainda possui execução da RPC e a função de merge ainda não existe.

---

### Task 3: Fechar a fronteira de escrita e tornar o progresso atômico

**Files:**
- Create: `supabase/migrations/20260814190000_harden_diagnostic_assessments.sql`
- Modify: `src/lib/supabase/admin-access.ts:1`
- Modify: `src/app/diagnostico/actions.ts:1-187`
- Test: `supabase/tests/database/diagnostic_assessments_security.test.sql`
- Test: `src/__tests__/diagnosis-actions.test.ts`

- [ ] **Step 1: Criar a migração corretiva sem editar a migração histórica**

Criar `supabase/migrations/20260814190000_harden_diagnostic_assessments.sql`:

```sql
-- Users may read their own assessments, but all mutations cross a trusted
-- Server Action boundary and execute as service_role.
drop policy if exists "Users can create their own diagnostic assessments"
  on public.diagnostic_assessments;
drop policy if exists "Users can update their own diagnostic assessments"
  on public.diagnostic_assessments;

revoke insert, update, delete on table public.diagnostic_assessments
  from anon, authenticated;
grant select on table public.diagnostic_assessments to authenticated;

create or replace function public.complete_diagnostic_assessment(
  p_user_id uuid,
  p_record jsonb,
  p_assessment_id uuid default null
) returns uuid
language plpgsql
security invoker
set search_path = public
as $$
declare
  assessment_id uuid;
  result_kind_value text := p_record->>'result_kind';
  result_elements_value text[] := coalesce(
    array(select jsonb_array_elements_text(coalesce(p_record->'result_elements', '[]'::jsonb))),
    '{}'
  );
begin
  if result_kind_value not in ('single', 'combined', 'insufficient') then
    raise exception 'invalid result kind';
  end if;

  if nullif(p_record->>'algorithm_version', '') is null then
    raise exception 'algorithm version is required';
  end if;

  if p_assessment_id is null then
    insert into public.diagnostic_assessments (
      user_id, status, facial_zone_ids, facial_scores, question_answers,
      question_scores, tiebreak_answers, tiebreak_scores, result_kind,
      result_elements, resolution_method, facial_convergence,
      reflection_answers, algorithm_version, completed_at
    ) values (
      p_user_id,
      'completed',
      coalesce(array(select jsonb_array_elements_text(coalesce(p_record->'facial_zone_ids', '[]'::jsonb))), '{}'),
      coalesce(p_record->'facial_scores', '{}'::jsonb),
      coalesce(p_record->'question_answers', '{}'::jsonb),
      coalesce(p_record->'question_scores', '{}'::jsonb),
      coalesce(p_record->'tiebreak_answers', '{}'::jsonb),
      coalesce(p_record->'tiebreak_scores', '{}'::jsonb),
      result_kind_value,
      result_elements_value,
      nullif(p_record->>'resolution_method', ''),
      nullif(p_record->>'facial_convergence', ''),
      coalesce(p_record->'reflection_answers', '{}'::jsonb),
      p_record->>'algorithm_version',
      now()
    ) returning id into assessment_id;
  else
    update public.diagnostic_assessments
    set status = 'completed',
        facial_zone_ids = coalesce(array(select jsonb_array_elements_text(coalesce(p_record->'facial_zone_ids', '[]'::jsonb))), '{}'),
        facial_scores = coalesce(p_record->'facial_scores', '{}'::jsonb),
        question_answers = coalesce(p_record->'question_answers', '{}'::jsonb),
        question_scores = coalesce(p_record->'question_scores', '{}'::jsonb),
        tiebreak_answers = coalesce(p_record->'tiebreak_answers', '{}'::jsonb),
        tiebreak_scores = coalesce(p_record->'tiebreak_scores', '{}'::jsonb),
        result_kind = result_kind_value,
        result_elements = result_elements_value,
        resolution_method = nullif(p_record->>'resolution_method', ''),
        facial_convergence = nullif(p_record->>'facial_convergence', ''),
        reflection_answers = coalesce(p_record->'reflection_answers', '{}'::jsonb),
        algorithm_version = p_record->>'algorithm_version',
        updated_at = now(),
        completed_at = now()
    where id = p_assessment_id
      and user_id = p_user_id
      and status = 'in_progress'
    returning id into assessment_id;

    if assessment_id is null then
      raise exception 'assessment not found or already completed';
    end if;
  end if;

  update public.profiles
  set dominant_element = case
        when result_kind_value = 'single' then result_elements_value[1]
        else null
      end,
      highlighted_elements = result_elements_value,
      reflection_answers = nullif(p_record->'reflection_answers', '{}'::jsonb),
      updated_at = now()
  where id = p_user_id;

  return assessment_id;
end;
$$;

create or replace function public.merge_diagnostic_progress(
  p_user_id uuid,
  p_assessment_id uuid,
  p_question_answers jsonb,
  p_tiebreak_answers jsonb,
  p_reflection_answers jsonb
) returns boolean
language plpgsql
security invoker
set search_path = public
as $$
declare
  updated_id uuid;
begin
  update public.diagnostic_assessments
  set question_answers = question_answers || coalesce(p_question_answers, '{}'::jsonb),
      tiebreak_answers = tiebreak_answers || coalesce(p_tiebreak_answers, '{}'::jsonb),
      reflection_answers = coalesce(reflection_answers, '{}'::jsonb) || coalesce(p_reflection_answers, '{}'::jsonb),
      updated_at = now()
  where id = p_assessment_id
    and user_id = p_user_id
    and status = 'in_progress'
  returning id into updated_id;

  if updated_id is null then
    raise exception 'assessment not found or already completed';
  end if;

  return true;
end;
$$;

revoke all on function public.complete_diagnostic_assessment(uuid, jsonb, uuid)
  from public, anon, authenticated;
revoke all on function public.merge_diagnostic_progress(uuid, uuid, jsonb, jsonb, jsonb)
  from public, anon, authenticated;
grant execute on function public.complete_diagnostic_assessment(uuid, jsonb, uuid)
  to service_role;
grant execute on function public.merge_diagnostic_progress(uuid, uuid, jsonb, jsonb, jsonb)
  to service_role;
```

- [ ] **Step 2: Impedir importação acidental do cliente privilegiado no browser**

Adicionar na primeira linha de `src/lib/supabase/admin-access.ts`:

```ts
import 'server-only'
```

- [ ] **Step 3: Usar a sessão apenas para autenticação**

Em `src/app/diagnostico/actions.ts`, importar:

```ts
import { getSupabaseAdmin } from '@/lib/supabase/admin-access'
```

Depois de cada `getUser()` bem-sucedido, criar `const admin = getSupabaseAdmin()` e usar `admin` para todas as consultas de escrita em `diagnostic_assessments`.

Na conclusão, substituir a RPC do cliente de sessão por:

```ts
const { data: completedAssessmentId, error: assessmentError } = await admin.rpc(
  'complete_diagnostic_assessment',
  {
    p_user_id: user.id,
    p_record: record,
    p_assessment_id: assessmentId,
  },
)
```

Em `startDiagnosisAssessment`, fazer tanto a busca do draft quanto o insert com `admin`, sempre mantendo `.eq('user_id', user.id)`.

Em `saveDiagnosisProgress`, manter `parseDiagnosisProgress`, `calculateMainDiagnosis` e todas as validações atuais, mas substituir o read-merge-write por uma única chamada:

```ts
const { error: updateError } = await admin.rpc('merge_diagnostic_progress', {
  p_user_id: user.id,
  p_assessment_id: input.assessmentId,
  p_question_answers: progress.questionAnswers,
  p_tiebreak_answers: progress.tiebreakAnswers,
  p_reflection_answers: progress.reflectionAnswers,
})
```

Não enviar `question_scores` nem `tiebreak_scores` nessa RPC. Os scores auditáveis são recalculados e gravados somente por `completeDiagnosis`.

- [ ] **Step 4: Executar os testes de segurança**

Run:

```powershell
npx supabase db reset
npx supabase test db supabase/tests/database/diagnostic_assessments_security.test.sql
npx vitest run src/__tests__/diagnosis-actions.test.ts src/__tests__/diagnosis-submission.test.ts
npx tsc --noEmit
```

Expected: todos os testes passam; TypeScript termina sem saída.

- [ ] **Step 5: Commit**

```powershell
git add supabase/config.toml supabase/migrations/20260814190000_harden_diagnostic_assessments.sql supabase/tests/database/diagnostic_assessments_security.test.sql src/lib/supabase/admin-access.ts src/app/diagnostico/actions.ts src/__tests__/diagnosis-actions.test.ts
git commit -m "fix: secure diagnostic persistence boundary"
```

---

### Task 4: Serializar os salvamentos do wizard e limpar os testes assíncronos

**Files:**
- Modify: `src/app/diagnostico/wizard.tsx:1-164`
- Modify: `src/__tests__/diagnosis-wizard.test.tsx:1-120`

- [ ] **Step 1: Escrever o teste de ordem em vermelho**

Importar `act` e adicionar um helper controlável:

```ts
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'

function deferred<T>() {
  let resolve!: (value: T) => void
  const promise = new Promise<T>((resolver) => { resolve = resolver })
  return { promise, resolve }
}
```

Adicionar o teste:

```ts
it('serializa salvamentos de progresso na ordem das respostas', async () => {
  const firstSave = deferred<{ success: true }>()
  mocks.saveDiagnosisProgress
    .mockReturnValueOnce(firstSave.promise)
    .mockResolvedValue({ success: true })

  const resumeAssessment = {
    id: '123e4567-e89b-42d3-a456-426614174000',
    facialZoneIds: [],
    questionAnswers: {},
    tiebreakAnswers: {},
    reflectionAnswers: {},
  }

  render(<DiagnosisWizard resumeAssessment={resumeAssessment} />)

  fireEvent.click(screen.getByRole('button', { name: /faz sentido/i }))
  fireEvent.click(screen.getByRole('button', { name: /não se aplica/i }))

  expect(mocks.saveDiagnosisProgress).toHaveBeenCalledTimes(1)

  await act(async () => firstSave.resolve({ success: true }))
  await waitFor(() => expect(mocks.saveDiagnosisProgress).toHaveBeenCalledTimes(2))
})
```

- [ ] **Step 2: Confirmar que o teste falha**

Run:

```powershell
npx vitest run src/__tests__/diagnosis-wizard.test.tsx -t "serializa salvamentos"
```

Expected: FAIL; a implementação atual inicia duas requisições antes da primeira resolver.

- [ ] **Step 3: Implementar uma fila por instância do wizard**

Importar `useRef` e criar a fila:

```ts
const progressQueueRef = useRef<Promise<void>>(Promise.resolve())

const persistProgress = (
  nextAnswers: Record<string, boolean>,
  nextTiebreakAnswers = tiebreakAnswers,
) => {
  if (!assessmentId) return

  const payload = {
    assessmentId,
    questionAnswers: nextAnswers,
    tiebreakAnswers: nextTiebreakAnswers,
    reflectionAnswers: Object.fromEntries(
      Object.entries(reflectionAnswers)
        .filter(([, answer]) => answer.trim().length > 0),
    ),
  }

  progressQueueRef.current = progressQueueRef.current
    .catch(() => undefined)
    .then(async () => {
      const result = await saveDiagnosisProgress(payload)
      if (result?.error) throw new Error(result.error)
    })
}
```

Manter o payload capturado antes de entrar na fila; não ler state mutável dentro do `.then()`.

- [ ] **Step 4: Tornar os helpers de teste assíncronos**

Trocar `answerMain` por uma função `async` que usa `act` em cada clique e atualizar os testes para `await answerMain(...)`. Isso remove os avisos de atualizações React fora de `act(...)` sem ocultar `console.error`.

- [ ] **Step 5: Executar e confirmar o estado verde**

Run:

```powershell
npx vitest run src/__tests__/diagnosis-wizard.test.tsx --testTimeout=20000
```

Expected: todos os testes passam e não aparecem avisos de `act(...)` relacionados a `DiagnosisWizard`.

- [ ] **Step 6: Commit**

```powershell
git add src/app/diagnostico/wizard.tsx src/__tests__/diagnosis-wizard.test.tsx
git commit -m "fix: serialize diagnosis progress saves"
```

---

### Task 5: Restaurar o contrato editorial do quiz e zerar warnings de imagem

**Files:**
- Modify: `src/lib/quiz-copy.ts:5-11`
- Verify: `src/__tests__/quiz-copy.test.ts:8-16`
- Modify: `src/app/diagnostico/page.tsx:1-63`
- Modify: `src/app/mapa/mapa-client.tsx:1-39`
- Modify: `src/app/o-mapa-da-raiz/page.tsx:1-101`

- [ ] **Step 1: Preservar e revisar a alteração local antes de tocar nela**

Run:

```powershell
git diff -- src/lib/quiz-copy.ts src/__tests__/quiz-copy.test.ts
```

Expected: apenas os títulos “O que domina o seu corpo?” divergem do contrato cauteloso aprovado. Não modificar outras alterações locais presentes no arquivo.

- [ ] **Step 2: Restaurar os títulos cautelosos aprovados**

Em `src/lib/quiz-copy.ts`, usar:

```ts
metadata: {
  title: 'O que você precisa prestar atenção agora? | Meu Corpo Minha Mente',
},
hero: {
  title: 'O que você precisa prestar atenção agora?',
},
```

Manter o teste existente como contrato. Não trocar a expectativa para fazer o teste aceitar a frase “domina o seu corpo”.

- [ ] **Step 3: Confirmar o contrato editorial**

Run:

```powershell
npx vitest run src/__tests__/quiz-copy.test.ts
```

Expected: 4/4 testes passando.

- [ ] **Step 4: Substituir as três tags de logo por `next/image`**

Adicionar `import Image from 'next/image'` nos três arquivos e substituir cada `<img>` por:

```tsx
<Image
  src="/images/logo-mapa-raiz.png"
  alt="O Mapa da Raiz"
  width={761}
  height={328}
  priority
  className="h-8 md:h-12 w-auto object-contain opacity-90 drop-shadow-sm hover:opacity-100 transition-opacity"
/>
```

Em `src/app/mapa/mapa-client.tsx`, preservar a classe responsiva atual `h-10 md:h-14`; nos outros dois arquivos, preservar `h-8 md:h-12`.

- [ ] **Step 5: Executar lint focado**

Run:

```powershell
npx eslint src/app/diagnostico/page.tsx src/app/mapa/mapa-client.tsx src/app/o-mapa-da-raiz/page.tsx src/lib/quiz-copy.ts src/__tests__/quiz-copy.test.ts
```

Expected: zero erros e zero warnings.

- [ ] **Step 6: Commit sem incluir outros arquivos do usuário**

```powershell
git add src/lib/quiz-copy.ts src/app/diagnostico/page.tsx src/app/mapa/mapa-client.tsx src/app/o-mapa-da-raiz/page.tsx
git commit -m "fix: restore safe quiz copy and optimize logos"
```

---

### Task 6: Atualizar dependências vulneráveis com versões alinhadas

**Files:**
- Modify: `package.json`
- Modify: `package-lock.json`

- [ ] **Step 1: Registrar o baseline antes da atualização**

Run:

```powershell
npm audit --audit-level=high
npm ls next @next/third-parties eslint-config-next postcss sharp ws nanoid picomatch esbuild
```

Expected: audit com vulnerabilidades altas; Next 15.5.12 e `@next/third-parties` 16.2.4 aparecem desalinhados.

- [ ] **Step 2: Alinhar Next e atualizar o toolchain**

Run:

```powershell
npm install --save-exact next@15.5.23 @next/third-parties@15.5.23 @supabase/supabase-js@2.112.3
npm install --save-dev --save-exact eslint-config-next@15.5.23 postcss@8.5.26 tsx@4.23.12 vite@7.3.6 vitest@4.1.10 @vitejs/plugin-react@5.2.0
npm update ws nanoid picomatch esbuild sharp
```

Expected: `package.json` e `package-lock.json` mudam; o ecossistema Next permanece na linha 15.5.23 e Vitest permanece na linha 4.

- [ ] **Step 3: Aplicar override somente se o Sharp transitivo continuar abaixo de 0.35.0**

Verificar:

```powershell
npm ls sharp
```

Se a árvore ainda contiver `sharp@0.34.x`, adicionar ao `package.json`:

```json
{
  "overrides": {
    "next": {
      "sharp": "0.35.0"
    }
  }
}
```

Então executar:

```powershell
npm install
```

Expected: `npm ls sharp` não lista versão inferior a 0.35.0.

- [ ] **Step 4: Validar segurança e compatibilidade**

Run:

```powershell
npm audit --omit=dev --audit-level=high
npm audit --audit-level=high
npx tsc --noEmit
npm test
npm run build
```

Expected: todos os comandos terminam com código zero. O build gera as 24 rotas e as telas que usam imagens compilam sem erro.

- [ ] **Step 5: Revisar o lockfile antes do commit**

Run:

```powershell
git diff --stat -- package.json package-lock.json
git diff --check -- package.json package-lock.json
npm ls --depth=0
```

Expected: nenhuma remoção de dependência declarada sem justificativa, nenhuma dependência inválida e nenhuma inconsistência de whitespace.

- [ ] **Step 6: Commit**

```powershell
git add package.json package-lock.json
git commit -m "chore: update vulnerable application dependencies"
```

---

### Task 7: Criar runbook e validar banco em ambiente controlado

**Files:**
- Create: `docs/runbooks/diagnostico-database-hardening.md`
- Update: `docs/stories/diagnostico-production-hardening.md`

- [ ] **Step 1: Criar o runbook de implantação**

O runbook deve conter exatamente esta sequência operacional:

```markdown
# Hardening do banco do diagnóstico

## Pré-condições
- Backup ou point-in-time recovery habilitado.
- `SUPABASE_SERVICE_ROLE_KEY` configurada somente no backend.
- Testes locais do banco e Vitest verdes no mesmo commit.

## Aplicação
1. Aplicar `20260814190000_harden_diagnostic_assessments.sql` primeiro em staging.
2. Confirmar que `authenticated` mantém SELECT e perde INSERT/UPDATE/DELETE.
3. Confirmar que apenas `service_role` executa as duas RPCs.
4. Realizar uma leitura nova, interromper após duas respostas e retomar.
5. Concluir com resultado único e confirmar assessment + cache de perfil.
6. Concluir um empate combinado e confirmar `dominant_element = null`.

## Smoke test de isolamento
1. Usuária A inicia e conclui uma leitura.
2. Usuária B não consegue selecionar o UUID da avaliação de A.
3. Chamadas REST autenticadas de A para INSERT/UPDATE retornam permissão negada.
4. Chamada REST autenticada para `complete_diagnostic_assessment` retorna permissão negada.

## Rollback
1. Reverter a aplicação para o commit anterior antes de restaurar privilégios.
2. Revogar novamente qualquer acesso externo à aplicação durante o rollback.
3. Restaurar a migração anterior somente em staging ou a partir do backup aprovado.
4. Não reabrir UPDATE direto para `authenticated` em produção.
```

- [ ] **Step 2: Aplicar em staging e executar smoke test**

Run com o projeto Supabase de staging previamente vinculado:

```powershell
npx supabase db push --dry-run
npx supabase db push
npx supabase test db supabase/tests/database/diagnostic_assessments_security.test.sql
```

Expected: dry-run lista apenas a nova migração; push e testes terminam com código zero.

- [ ] **Step 3: Atualizar QA Results da story**

Registrar os comandos executados, contagens de testes, resultado do audit, hash do commit validado e resultado do smoke test. Definir o gate como `PASS` somente se todos os critérios de aceite estiverem comprovados; usar `CONCERNS` ou `FAIL` caso qualquer evidência falte.

- [ ] **Step 4: Commit**

```powershell
git add docs/runbooks/diagnostico-database-hardening.md docs/stories/diagnostico-production-hardening.md
git commit -m "docs: add diagnosis database rollout runbook"
```

---

### Task 8: Executar o gate final e preparar a entrega

**Files:**
- Review all files changed by Tasks 1–7

- [ ] **Step 1: Confirmar que alterações alheias não entraram nos commits**

Run:

```powershell
git status --short
git diff HEAD~6..HEAD --name-only
git diff --check HEAD~6..HEAD
```

Expected: apenas os arquivos listados neste plano. O plano antigo não rastreado `docs/superpowers/plans/2026-07-09-quiz-copy.md` continua fora dos commits, salvo decisão explícita separada.

- [ ] **Step 2: Rodar todos os testes e verificadores**

Run:

```powershell
npx supabase test db supabase/tests/database/diagnostic_assessments_security.test.sql
npm test
npx eslint src/lib/diagnosis.ts src/lib/diagnosis-submission.ts src/lib/supabase/admin-access.ts src/app/diagnostico/actions.ts src/app/diagnostico/wizard.tsx src/app/diagnostico/page.tsx src/app/mapa/mapa-client.tsx src/app/mapa/v2/page.tsx src/app/o-mapa-da-raiz/page.tsx src/__tests__/diagnosis.test.ts src/__tests__/diagnosis-submission.test.ts src/__tests__/diagnosis-actions.test.ts src/__tests__/diagnosis-wizard.test.tsx src/__tests__/quiz-copy.test.ts
npx tsc --noEmit
npm audit --omit=dev --audit-level=high
npm audit --audit-level=high
npm run build
```

Expected: todos os comandos terminam com código zero, sem testes falhos, sem vulnerabilidades altas e sem warnings ESLint nos arquivos focados.

- [ ] **Step 3: Fazer revisão manual dos caminhos críticos**

Confirmar no diff:

1. `getSupabaseAdmin()` só é chamado depois de `getUser()` retornar uma usuária.
2. Nenhuma action aceita `user_id`, scores ou resultado como autoridade externa.
3. `authenticated` não executa as RPCs de mutação.
4. `complete_diagnostic_assessment` só altera `in_progress` quando recebe `p_assessment_id`.
5. `merge_diagnostic_progress` nunca altera `completed`.
6. O wizard captura payload imutável e serializa chamadas.
7. O título público continua dentro do contrato cauteloso aprovado.

- [ ] **Step 4: Emitir o gate final**

O resultado esperado é:

```text
Gate: PASS
Security: PASS
Persistence integrity: PASS
Diagnosis logic: PASS
Progress reliability: PASS
Dependencies: PASS
Build and tests: PASS
```

Não publicar, aplicar em produção ou enviar mudanças remotas sem aprovação explícita do usuário.

---

## Self-review against the approved diagnosis specification

- Autoridade do servidor: Tasks 2–3.
- RLS e isolamento: Tasks 2–3 e 7.
- Conclusão atômica e imutabilidade: Task 3.
- Retomada sem perda de respostas: Tasks 3–4.
- Erros sem perda de estado local: testes existentes preservados na Task 4.
- Copy educativa e teste global verde: Task 5.
- Lint, typecheck, build e dependências: Tasks 5–6 e 8.
- Evidência formal de QA e implantação: Tasks 1, 7 e 8.
- O algoritmo, o desempate imediato e o resultado combinado não são alterados por este plano.

## Execution log (2026-08-14)

- Tasks 1–2: story/spec e testes de fronteira de confiança — commits `3d9e28f`,
  `0823470`, `e147641`, `63d1ebc` e `0f64320`.
- Task 3: persistência server-side, concorrência do draft e tratamento de
  erros — commits `3f5d8ff` e `8fff53d`.
- Task 4: fila coalescida, revisão monotônica, escolha comparativa retomável e
  conclusão sem writes fora de ordem — commits `66721fa`, `99248f4` e
  `c70c110`.
- Task 5: logos em `next/image` — commit `7f64e7c`; a copy cautelosa já estava
  no HEAD aprovado `23b0d57`.
- Task 6: Next 16.3.1, PostCSS 8.5.26, toolchain e overrides — commit
  `c4dc4ff`; os dois comandos `npm audit` retornaram zero vulnerabilidades.
- Task 7: runbook — commit `a7fc96d`. O teste pgTAP foi preparado, mas não
  executado porque o Docker/Supabase local estava desligado (`ECONNREFUSED
  127.0.0.1:54322`).
