# Design: endurecimento do quiz para produção

## Objetivo

Fechar os bloqueadores apontados pelo gate de QA para que o quiz público possa ser publicado com validação confiável, proteção contra abuso, submissões idempotentes e integração verificável com Supabase e Brevo.

## Escopo

- Validar no servidor exatamente as 10 perguntas canônicas, sem IDs desconhecidos ou repetidos.
- Recalcular o elemento exclusivamente no servidor.
- Substituir o rate limit em memória por um limite atômico e persistente no Supabase.
- Tornar retries idempotentes por meio de um `submissionId` UUID gerado no cliente.
- Ajustar o payload de atributos para o contrato real da conta Brevo.
- Documentar todas as variáveis de ambiente do quiz.
- Ativar os cinco templates transacionais e verificar lista, atributos e domínio remetente.
- Adicionar testes de contrato e integração para os caminhos críticos.

## Fora de escopo

- Alterar perguntas, cálculo editorial, copy ou layout do quiz.
- Alterar o produto pago ou `tcm-data.ts`.
- Criar uma plataforma genérica de filas ou um novo provedor de e-mail.
- Fazer push para o GitHub sem um novo gate de QA.

## Arquitetura

### Contrato de submissão

Um novo módulo puro, `src/lib/quiz-submission.ts`, será a fonte do schema Zod e das regras canônicas. Ele aceitará `submissionId`, nome, e-mail, consentimento, elemento informado, respostas, tracking e honeypot. As respostas deverão conter exatamente uma entrada para cada ID retornado por `getQuizQuestions()`.

O módulo retornará dados normalizados e o elemento recalculado. A Server Action consumirá esse contrato, sem confiar no elemento informado pelo navegador.

### Rate limit persistente

A migration criará `quiz_rate_limits` e a função SQL `check_quiz_submission_rate_limit`. A função fará incremento atômico de duas chaves HMAC: uma por IP e outra por e-mail. O IP permitirá até 10 tentativas em 10 minutos; o e-mail, até 3. A função será executável apenas pelo `service_role`.

As chaves serão derivadas com HMAC-SHA256 e `QUIZ_RATE_LIMIT_SECRET`; nenhum IP ou e-mail será persistido na tabela de limites.

### Idempotência

`quiz_leads` receberá `submission_id uuid` com índice único. O cliente criará um UUID ao entrar no gate e reutilizará o mesmo valor em qualquer retry. Apenas a requisição que criar a linha enviará o contato e o e-mail; conflitos de unicidade retornarão o lead já existente sem novo disparo.

### Brevo

O contato será enviado à lista `Lead Quiz` usando apenas atributos existentes e tipados: `NOME`, `ELEMENTO` e `ORIGEM`. `ELEMENTO` será convertido para o valor numérico da enumeração da conta. `FIRSTNAME` será removido.

Os templates 17 a 21 serão associados às variáveis por elemento e ativados. O domínio remetente será verificado; quando a autenticação exigir alteração DNS fora das integrações disponíveis, o gate ficará como bloqueado com os registros exatos a cadastrar.

### Erros e observabilidade

- Falha de validação: não acessa Supabase ou Brevo.
- Falha no rate limit: falha fechada e não envia o lead.
- Conflito idempotente: retorna sucesso usando o registro existente e não reenvia.
- Falha do Brevo: mantém o lead salvo com timestamps nulos e mostra a leitura na tela.
- Logs nunca incluem API keys, IP bruto ou corpo completo do lead.

## Testes

- Contrato: quantidade, IDs esperados, unicidade, consentimento e UUID.
- Cálculo: elemento informado pelo cliente nunca prevalece sobre o cálculo.
- Ação: honeypot, bloqueio por limite, primeira inserção e conflito idempotente.
- Brevo: mapeamento de template e enumeração por elemento, atributos permitidos e falhas HTTP.
- Verificação final: testes, tipos, lint focado, build de produção e smoke test no navegador até o resultado.

## Critérios de aceite

1. Uma submissão adulterada não cria lead nem envia e-mail.
2. Repetir o mesmo `submissionId` cria no máximo uma linha e um envio.
3. Variar e-mails a partir do mesmo IP continua limitado.
4. Os cinco elementos usam o template correto e o valor correto de `ELEMENTO`.
5. `.env.example` contém todas as variáveis exigidas sem segredos reais.
6. Os cinco templates estão ativos e a lista `Lead Quiz` existe.
7. O gate final registra explicitamente qualquer pendência de DNS ou Vercel.
