# Story: Hardening de produção do diagnóstico

## Status

Implementation complete; production gate pending local Supabase execution.

## Contexto

A lógica determinística e o desempate estão funcionais, mas usuários autenticados ainda conseguem chamar a RPC de conclusão com um `p_record` arbitrário. Salvamentos de progresso também podem terminar fora de ordem.

## Critérios de aceite

1. Usuários `anon` e `authenticated` não executam rotinas de mutação nem escrevem diretamente em `diagnostic_assessments`; somente `service_role` executa as RPCs de mutação.
2. Server Actions autenticam a usuária antes de inicializar `service_role`, derivam autoria exclusivamente de `auth.getUser()` e validam dados canônicos.
3. A conclusão continua atômica e uma avaliação `completed` não pode ser alterada.
4. O progresso é mesclado atomicamente e as chamadas do wizard são serializadas.
5. Testes SQL cobrem privilégios negados a `anon` e `authenticated`, privilégios exclusivos de `service_role`, RLS, isolamento e imutabilidade; testes de ação cobrem leitura, retomada, progresso e conclusão cross-user.
6. A suíte Vitest completa passa sem avisos de `act(...)` nos testes do diagnóstico.
7. Não existem vulnerabilidades altas no audit de produção ou no audit completo.
8. Lint, typecheck e build de produção passam.

## Fora de escopo

- Alterar o algoritmo ou as perguntas de diagnóstico.
- Reinterpretar a base teórica.
- Alterar o conteúdo do diário.

## QA Results

- Vitest completo: **96/96** testes, 11 arquivos.
- TypeScript: `npx tsc --noEmit` **PASS**.
- ESLint focado: **PASS**; o aviso de `<img>` foi removido nas três telas de logo e a configuração foi atualizada para os presets Flat do Next16.
- Lint global (`npm run lint`): **CONCERNS** por 23 erros preexistentes fora do fluxo do diagnóstico (scripts, legado, admin/diário e componentes antigos); nenhum erro no escopo focado.
- Build: `npm run build` com Next16.3.1 **PASS**, 23 rotas geradas.
- Auditorias: `npm audit --omit=dev --audit-level=high` e `npm audit --audit-level=high` **PASS**, zero vulnerabilidades.
- Teste pgTAP: **PENDENTE**; `npx supabase test db ...` não conectou porque o Docker/Supabase local estava desligado (`ECONNREFUSED 127.0.0.1:54322`).

Gate atual: **CONCERNS** até executar `supabase start`, `supabase db reset` e o teste SQL em ambiente controlado. O código e os testes unitários estão prontos para essa validação.
