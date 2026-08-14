# Runbook: hardening do banco do diagnóstico

Este runbook aplica as migrações que tornam a persistência do diagnóstico
server-side, monotônica e retomável.

## Pré-requisitos

- Supabase CLI autenticado no projeto correto.
- Docker Desktop ativo para o ambiente local.
- Backup/export da base antes da aplicação em staging ou produção.
- `SUPABASE_SERVICE_ROLE_KEY` disponível somente no ambiente server-side.

## Aplicação local

```powershell
npx supabase start
npx supabase db reset
npx supabase test db supabase/tests/database/diagnostic_assessments_security.test.sql
```

O reset aplica, nesta ordem, as migrações de hardening, revisão monotônica,
escolha comparativa e conclusão auditável:

- `20260814190000_harden_diagnostic_assessments.sql`
- `20260814200000_diagnostic_progress_revision.sql`
- `20260814201000_diagnostic_comparison_choice.sql`
- `20260814202000_diagnostic_completion_comparison_choice.sql`

O teste SQL deve confirmar os privilégios de `anon`, `authenticated` e
`service_role`, a assinatura final de
`merge_diagnostic_progress(uuid, uuid, jsonb, jsonb, jsonb, integer, text)` e
os casos de revisão antiga, revisão duplicada, proprietário incorreto e
avaliação concluída.

## Smoke test pós-migração

1. Criar uma leitura autenticada e confirmar que ela aparece apenas para a
   própria usuária.
2. Responder duas perguntas rapidamente e verificar que o draft mantém a
   resposta mais recente.
3. Escolher a comparação final, sair da página e retomá-la; a tela deve abrir
   diretamente na reflexão.
4. Concluir a leitura e confirmar que uma nova chamada de progresso não altera
   a linha `completed`.
5. Repetir a tentativa com o `assessment_id` de outra usuária; a action deve
   retornar erro sem modificar a avaliação alvo.

## Produção

Aplicar as migrações pelo fluxo versionado do projeto, nunca colando SQL
manualmente no painel. Após a aplicação, executar o smoke test com uma conta
de teste e registrar o resultado, horário, versão do algoritmo e hash do
deploy.

## Rollback

As migrações não têm rollback destrutivo automático. Em caso de falha:

1. interromper o deploy e preservar os logs da migration;
2. restaurar o backup somente após validar o ponto de recuperação;
3. se o erro for de aplicação, criar uma migration corretiva para frente;
4. não reabrir avaliações `completed` nem devolver privilégios de escrita a
   `anon` ou `authenticated` como medida temporária.

Se a base já tiver recebido a coluna `progress_revision` ou
`comparison_choice`, as migrations são idempotentes para essas colunas, mas a
assinatura antiga das RPCs deve continuar removida.
