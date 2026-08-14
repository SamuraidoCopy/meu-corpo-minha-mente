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
