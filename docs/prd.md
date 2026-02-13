# Product Requirements Document (PRD): Meu Corpo Minha Mente - Web App

> **Status:** Draft | **Versão:** 1.0 | **Autor:** @pm (Morgan) | **Data:** 2026-02-12

## 1. Introdução

### 1.1 Propósito
Este documento define os requisitos funcionais e técnicos para o desenvolvimento do **Web App "Meu Corpo Minha Mente"**. O objetivo é substituir os materiais de apoio estáticos (PDFs) do curso "O Mapa da Raiz" por uma experiência digital interativa, focada em autodiagnóstico guiado e coleta de dados estruturados.

### 1.2 Visão do Produto
Um Web App *mobile-first* que atua como um "espelho digital", guiando a usuária na identificação de sinais físicos e emocionais, traduzindo a linguagem complexa da Medicina Tradicional Chinesa (MTC) em insights simples e acionáveis.

### 1.3 Objetivos Estratégicos
*   **Melhorar a Usabilidade:** Eliminar a fricção de imprimir/preencher PDFs.
*   **Centralizar Dados:** Criar um banco de dados proprietário de sintomas e emoções para personalizar ofertas futuras (Sessão Intensiva).
*   **Aumentar Engajamento:** Transformar o autoconhecimento em uma jornada gamificada (início, meio e fim).

## 2. Escopo do Produto (MVP)

### 2.1 Módulo: Onboarding & Perfil
*   **Acesso Unificado:** Compra na Hotmart inclui Curso + App.
*   **Liberação Programada (Day 8):** O acesso ao App é liberado via e-mail automático apenas no **8º dia após a compra** (após garantia).
*   **Credenciais:** O sistema gera login/senha provisória e envia para o aluno.
*   **Anamnese Inicial:** Idade, histórico breve (no primeiro login).

### 2.2 Módulo: Ferramenta "O Mapa da Raiz"
*   **Interface Visual:** Um avatar ou diagrama facial/corporal onde a usuária clica nas áreas onde sente desconforto ou vê marcas.
*   **Wizard de Sintomas:** Perguntas guiadas baseadas nas 5 Emoções (ex: "Você tem a 'ruga do leão' entre as sobrancelhas?", "Sente o estômago embrulhado quando se preocupa?").
*   **Resultado (O Diagnóstico):** Ao final, o App exibe qual "Emoção Raiz" está predominante (Madeira, Fogo, Terra, Metal ou Água) e fornece uma explicação personalizada.

### 2.3 Módulo: Diário das 5 Emoções
*   **Check-in Diário:** A usuária registra como está se sentindo hoje (ex: seletor de emojis ou escala de 1-5).
*   **Histórico:** Visualização simples da evolução emocional ao longo da semana.

### 2.4 Módulo: Admin (Visão das Dras)
*   **Dashboard de Alunas:** Lista de alunas com seus respectivos diagnósticos predominantes.
*   **Filtros:** "Alunas com predominância em Tristeza", "Alunas com histórico de medicação".

## 3. Requisitos Funcionais

| ID | Funcionalidade | Descrição | Prioridade |
|----|----------------|-----------|------------|
| RF01 | Login/Cadastro | Autenticação via E-mail ou Link Mágico. | Alta |
| RF02 | Mapa Facial Interativo | Interface clicável para seleção de zonas faciais (testa, olhos, bochechas, queixo). | Alta |
| RF03 | Questionário Lógico | Fluxo de perguntas condicionais baseadas na MTC. | Alta |
| RF04 | Geração de Resultado | Algoritmo simples que contabiliza as respostas e define a emoção predominante. | Alta |
| RF05 | Dashboard Pessoal | Página da aluna exibindo seu resultado e recomendações iniciais. | Alta |
| RF06 | Admin View | Painel restrito para visualização dos dados agregados. | Média |

## 4. Requisitos Não-Funcionais

*   **Usabilidade:** Interface intuitiva para público não-nativo digital (Classe C/B, 28-45 anos). Letras grandes, contraste claro, botões evidentes.
*   **Performance:** Carregamento rápido em redes 3G/4G.
*   **Privacidade:** Conformidade com LGPD (dados sensíveis de saúde).
*   **Plataforma:** Web App Responsivo (acessível via navegador no celular e desktop). Sem necessidade de instalação na loja de apps inicialmente.

## 5. Integrações
*   **Hotmart (Webhook):**
    *   **Gatilho de Compra:** Receber confirmação de pagamento.
    *   **Gatilho de Acesso:** Automação (n8n/Backend) para agendar envio de credenciais D+8.
    *   **Status de Assinatura:** Bloquear acesso se houver reembolso/cancelamento.

## 6. Métricas de Sucesso (KPIs)
*   **Taxa de Ativação:** % de alunas que compram o curso e completam o cadastro no App.
*   **Taxa de Conclusão:** % de alunas que finalizam o "Mapa da Raiz" e geram um diagnóstico.
*   **Qualidade dos Dados:** Volume de perfis completos gerados para análise das Dras.

## 7. Próximos Passos (Roadmap)
1.  **Design (UX/UI):** @ux criar wireframes do fluxo de autodiagnóstico.
2.  **Arquitetura Técnica:** @architect definir stack (ex: React/Next.js + Supabase/Firebase) para desenvolvimento ágil.
3.  **Desenvolvimento:** @dev iniciar sprint do MVP.

---
**Status:** 🟡 Em Revisão | Aguardando Aprovação do Usuário
