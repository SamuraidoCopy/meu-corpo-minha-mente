# Diagnóstico fundamentado e desempate contextual

**Status:** Aprovado conceitualmente pelo usuário em 2026-08-14; plano de implementação criado e execução iniciada.

## Objetivo

Substituir a classificação frágil do fluxo `/mapa` -> `/diagnostico` por uma leitura educativa, reproduzível e auditável dos padrões associados aos cinco elementos. O resultado deve considerar separadamente o relato da usuária e os sinais faciais selecionados, abrir perguntas contextuais quando houver empate e aceitar um resultado combinado quando a própria experiência não sustentar um único elemento.

O sistema não deve apresentar essa leitura como diagnóstico médico ou psicológico. A rota `/diagnostico` pode ser preservada por compatibilidade, mas a interface deve usar `leitura`, `padrão` e `elemento em destaque`.

## Base teórica e limites de transferência

### Extraído das fontes

As seguintes regras foram encontradas na base teórica fornecida pelo usuário:

1. A análise deve considerar a pessoa como um todo, não apenas partes isoladas.
2. Existem inúmeras combinações possíveis; um traço não deve ser transformado em sentença absoluta.
3. O conhecimento deve servir ao autoconhecimento e à identificação de tendências, sem julgamento moral.
4. Rosto, relato, comportamento e contexto são fontes correlacionadas, mas não equivalentes.
5. A história, os detalhes, a intensidade e o contexto da experiência importam para a interpretação.

Fontes principais:

- `G:\Meu Drive\Obsidian\Vitor Samurai 2 cerebro advance\Projetos\Profissional\Samurai do Copy\Missão Católica\Clientes\Dra. Ranieli e Cleucia - Meu Corpo Minha Mente\Documentos Gerais\Livros\Segredos Revelados - rosanedescomplica.pdf`
- `G:\Meu Drive\Obsidian\Vitor Samurai 2 cerebro advance\Projetos\Profissional\Samurai do Copy\Missão Católica\Clientes\Dra. Ranieli e Cleucia - Meu Corpo Minha Mente\Documentos Gerais\Livros\OGUIADAMEDICINASAGRADA.pdf`
- Os cinco dossiers `Framework de Pensamento e Resumo do Livro - *.md` da mesma pasta.

### Derivado para o produto

1. O questionário e o mapa facial devem produzir sinais separados.
2. O mapa facial pode indicar convergência ou divergência, mas não recebe peso oculto no cálculo do questionário.
3. Um empate exige mais contexto em vez de uma ordem fixa de elementos.
4. Um resultado combinado é mais fiel do que inventar um vencedor quando os sinais permanecem equivalentes.
5. Toda conclusão deve preservar as respostas e a versão do algoritmo que a produziu.

### Hipóteses de produto a validar com uso real

1. A janela de 30 dias é adequada para as perguntas de desempate.
2. Uma escala de quatro frequências discrimina melhor que outro `sim/não`.
3. Uma pergunta contextual por elemento empatado é suficiente na primeira rodada.
4. A comparação final reduz empates sem induzir respostas excessivamente.

Essas hipóteses serão identificadas no código por `algorithm_version` e poderão ser revisadas sem reescrever avaliações antigas.

## Fluxo funcional

### 1. Mapa facial

1. A usuária seleciona zero ou mais zonas faciais conhecidas.
2. O cliente envia apenas os IDs das zonas, nunca um elemento calculado.
3. O servidor valida os IDs contra a fonte canônica e recalcula os scores faciais.
4. Um empate facial é armazenado como múltiplos elementos; a ordem de seleção não altera o resultado.
5. A navegação para `/diagnostico` não pode aceitar `?element=` como autoridade. O parâmetro antigo será ignorado para usuárias comuns.

### 2. Perguntas principais

1. São exibidas as 15 perguntas canônicas, três por elemento.
2. Cada resposta positiva vale um ponto para o elemento da pergunta.
3. A resposta da 15ª pergunta deve ser incorporada antes do cálculo.
4. O servidor valida que cada ID canônico aparece exatamente uma vez e recalcula todos os scores.
5. O cliente nunca envia `dominantElement` como resultado confiável.

### 3. Classificação inicial

O cálculo retorna um estado discriminado:

- `single`: existe um único maior score acima de zero;
- `tie`: dois ou mais elementos compartilham o maior score acima de zero;
- `insufficient`: todas as respostas são negativas.

Não existe fallback para Madeira, Terra ou qualquer outro elemento.

### 4. Desempate contextual

Quando o estado for `tie`, o app abre imediatamente a etapa `Vamos entender qual padrão está mais presente agora`.

Para cada elemento empatado, aparece uma pergunta contextual referente aos últimos 30 dias:

| Elemento | Pergunta de desempate |
|---|---|
| Madeira | Nos últimos 30 dias, com que frequência irritação ou tensão apareceram quando seus planos foram interrompidos? |
| Fogo | Nos últimos 30 dias, com que frequência sua mente ficou acelerada justamente quando você precisava desacelerar? |
| Terra | Nos últimos 30 dias, com que frequência preocupação e pensamentos repetitivos deixaram você sobrecarregada? |
| Metal | Nos últimos 30 dias, com que frequência tristeza, dificuldade de estabelecer limites ou de deixar algo ir pesaram na sua rotina? |
| Água | Nos últimos 30 dias, com que frequência medo, insegurança ou sensação de esgotamento limitaram suas decisões? |

Respostas e pontos:

- `Raramente`: 0;
- `Às vezes`: 1;
- `Frequentemente`: 2;
- `Quase todos os dias`: 3.

Somente os elementos empatados recebem perguntas e scores de desempate. Esses pontos não alteram nem escondem o score principal; são armazenados separadamente.

Se houver um único maior score contextual, o resultado se torna `single`, com `resolution_method = contextual_tiebreak`.

### 5. Comparação final

Se o empate contextual persistir, o app pergunta:

> Qual desses padrões mais interferiu na sua rotina nos últimos 30 dias?

A usuária pode selecionar um dos elementos ainda empatados ou `Não consigo separar esses padrões`.

- Ao selecionar um elemento, o resultado é `single`, com `resolution_method = comparative_choice`.
- Ao não conseguir separar, o resultado é `combined`, preservando todos os elementos ainda empatados e `resolution_method = combined_acknowledged`.

Não haverá rodadas infinitas de desempate.

### 6. Resultado

Resultado único:

- mostra `Elemento em destaque`;
- apresenta a leitura educativa e as reflexões correspondentes;
- informa se o mapa facial converge, converge parcialmente, diverge ou não tem dados.

Resultado combinado:

- mostra `Padrões em destaque`;
- apresenta os elementos lado a lado, sem eleger um principal oculto;
- permite escolher qual padrão aprofundar na sessão atual, sem alterar o resultado salvo.

Resultado insuficiente:

- informa que as respostas não apontaram um padrão em destaque neste momento;
- não grava um elemento dominante artificial;
- oferece voltar ao mapa, revisar as respostas ou refazer a leitura futuramente.

## Convergência com o mapa facial

O mapa facial gera um conjunto `facial_elements`, que pode conter zero, um ou vários elementos.

O resultado recebe uma classificação adicional:

- `no_facial_data`: nenhuma zona selecionada;
- `convergent`: todos os elementos finais aparecem entre os elementos faciais;
- `partially_convergent`: ao menos um elemento final aparece no mapa;
- `divergent`: não há interseção.

Essa classificação é explicativa. Ela não decide nem desempata o questionário.

## Persistência e auditoria

Criar uma tabela `diagnostic_assessments` com uma avaliação por execução:

- `id uuid primary key`;
- `user_id uuid not null`;
- `status text`: `in_progress` ou `completed`;
- `facial_zone_ids jsonb`;
- `facial_scores jsonb`;
- `question_answers jsonb`;
- `question_scores jsonb`;
- `tiebreak_answers jsonb`;
- `tiebreak_scores jsonb`;
- `result_kind text`: `single`, `combined` ou `insufficient`;
- `result_elements jsonb`;
- `resolution_method text`;
- `facial_convergence text`;
- `reflection_answers jsonb`;
- `algorithm_version text not null`;
- `created_at timestamptz`;
- `updated_at timestamptz`;
- `completed_at timestamptz`.

Requisitos:

1. RLS permite à usuária ler somente suas próprias avaliações.
2. `anon` e `authenticated` não possuem privilégios diretos de mutação em `diagnostic_assessments`.
3. Server Actions autenticadas validam os dados canônicos e usam um cliente `service_role` server-only para iniciar, atualizar e concluir avaliações.
4. O resultado é recalculado no servidor antes da chamada atômica de conclusão; nenhuma RPC pública aceita resultado calculado pelo cliente.
5. Avaliações concluídas não têm seus dados de cálculo sobrescritos por uma nova execução.
6. `profiles.dominant_element` permanece temporariamente como cache de compatibilidade apenas para resultados únicos.
7. Adicionar ao perfil `highlighted_elements text[]` para consumidores que precisam renderizar resultados combinados.
8. Para resultado combinado ou insuficiente, `dominant_element` deve ficar nulo.
9. Registros antigos no perfil continuam legíveis como `legacy-profile-v1`; não serão fabricadas respostas históricas inexistentes.

## Integração com telas existentes

### `/diagnostico`

- Nunca pula as perguntas porque o perfil já possui resultado.
- Retomada exige um `assessment_id` pertencente à usuária e com status `in_progress`.
- Valida parâmetros e exibe erro recuperável em vez de acessar um elemento inexistente.
- Só avança para o resultado após confirmação de persistência.

### `/o-mapa-da-raiz`

- Lê a avaliação concluída mais recente.
- Renderiza resultado único, combinado ou insuficiente.
- Não depende exclusivamente de `profiles.dominant_element`.

### `/mapa/v2`

- Para resultado único, usa o elemento como contexto de aprofundamento.
- Para resultado combinado, pede qual dos elementos a usuária deseja explorar hoje.
- Essa escolha é contexto da sessão e não reescreve a avaliação.

### Admin

- Exibe o resultado mais recente e o método de resolução.
- Diferencia avaliações `legacy-profile-v1` das novas avaliações auditáveis.
- Overrides de inspeção continuam restritos a administradores e não persistem no perfil.

## Segurança e validação

1. Definir `ELEMENT_ORDER` e schemas Zod canônicos em módulo compartilhado sem usar a ordem de objetos como regra de negócio.
2. Validar elementos, IDs de pergunta, IDs de zona, escalas e transições de estado no servidor.
3. Adicionar constraints de banco para enums textuais possíveis.
4. Limitar tamanho das reflexões e remover chaves arbitrárias.
5. Não confiar em resultados, scores ou elementos calculados no cliente.
6. Mensagens de erro devem permitir tentar novamente sem perder respostas locais.
7. A autoria de toda leitura ou mutação é derivada exclusivamente de `auth.getUser()` na Server Action; `user_id`, `assessment_id`, scores e resultado enviados pelo cliente não concedem autorização.
8. O cliente `service_role` só pode ser inicializado após uma sessão autenticada e sempre deve receber o `user.id` obtido dessa sessão como escopo da operação.

## Tratamento de gravação

1. A avaliação permanece `in_progress` enquanto perguntas e desempate são respondidos.
2. A conclusão ocorre em uma única operação lógica que salva respostas, scores, resultado e versão.
3. Reflexões podem ser salvas depois em campo próprio sem apagar os dados de cálculo.
4. A interface não mostra sucesso quando a ação retorna erro.
5. Revalidação deve apontar para `/o-mapa-da-raiz`, `/mapa/v2` e `/admin` após a conclusão ou atualização de uma avaliação.

## Testes obrigatórios

### Cálculo puro

1. Inclui a última resposta.
2. Retorna cada um dos cinco elementos quando há vencedor único.
3. Retorna `insufficient` para quinze negativas.
4. Retorna todos os elementos empatados, em ordem canônica estável.
5. A ordem de seleção das zonas faciais não muda o empate facial.

### Desempate

1. Abre automaticamente após empate principal.
2. Pergunta somente pelos elementos empatados.
3. Resolve por maior frequência contextual.
4. Abre comparação final quando o empate persiste.
5. Aceita escolha comparativa.
6. Preserva resultado combinado quando a usuária não consegue separar.

### Servidor e segurança

1. Rejeita pergunta ausente, duplicada ou desconhecida.
2. Rejeita elemento, zona, escala e `assessment_id` inválidos.
3. Recalcula scores e ignora resultados forjados pelo cliente.
4. `anon` e `authenticated` não possuem `INSERT`, `UPDATE`, `DELETE` em `diagnostic_assessments` nem `EXECUTE` nas RPCs de mutação; somente `service_role` possui execução dessas RPCs.
5. Uma Server Action sem sessão retorna erro de autenticação antes de inicializar ou chamar o cliente `service_role`.
6. Cada Server Action usa o `user.id` devolvido pela sessão como única autoria efetiva, sem aceitar autoria alternativa no payload.
7. A leitura por RLS retorna somente avaliações da usuária autenticada.
8. Retomar, salvar progresso ou concluir uma avaliação pertencente a outra usuária falha sem alterar o registro alvo.
9. Não permite `?element=` alterar ou salvar resultado.

### Persistência e UI

1. Não avança quando a gravação falha.
2. Nova leitura não sobrescreve avaliação concluída anterior.
3. Resultado combinado funciona no dashboard e no Mapa V2.
4. Avaliações legadas continuam visíveis.

## Critérios de aceite

1. Nenhuma resposta é perdida, inclusive a 15ª.
2. Nenhum empate depende de ordem de objeto, ordem de clique ou fallback silencioso.
3. Todo empate acima de zero abre as perguntas contextuais automaticamente.
4. Todo resultado pode ser reconstruído a partir do registro salvo.
5. O servidor é a autoridade do cálculo.
6. URL manipulada não altera o resultado.
7. Resultado combinado é suportado de ponta a ponta.
8. A interface comunica leitura educativa, não diagnóstico clínico.
9. Testes focados, lint dos arquivos alterados, typecheck e build concluem sem novos erros.

## Fora de escopo

1. Validar cientificamente as teorias dos livros.
2. Criar diagnóstico médico, psicológico ou psiquiátrico.
3. Automatizar análise fotográfica do rosto.
4. Alterar o quiz público de 10 perguntas.
5. Reescrever conteúdos do diário que não dependam do resultado combinado.
