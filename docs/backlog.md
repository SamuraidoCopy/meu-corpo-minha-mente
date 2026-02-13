# Project Backlog: Meu Corpo Minha Mente

> **Status:** Draft | **Mantenedor:** @po (Pax) | **Data:** 2026-02-12

## 🎯 Visão do MVP
Lançar um Web App seguro e integrado à Hotmart que permita às alunas realizarem o autodiagnóstico ("O Mapa da Raiz") e às Dras coletarem esses dados, com controle de acesso rigoroso (Regra D+8).

---

## 📂 Epic 1: Foundation & Infrastructure 🏗️
**Objetivo:** Estabelecer a base técnica segura e escalável do projeto.

*   **Story 1.1:** Inicializar repositório Monorepo (Next.js 14 + Tailwind + Shadcn/UI).
*   **Story 1.2:** Configurar Projeto no Supabase (Auth, Database, Storage).
*   **Story 1.3:** Implementar Banco de Dados com Schema e RLS (Tabelas: `users`, `assessments`, `daily_logs`).
*   **Story 1.4:** Configurar CI/CD na Vercel (ou Railway) para Deploy contínuo.

## 📂 Epic 2: Hotmart & Access Control (Day 8) 🔐
**Objetivo:** Automatizar a gestão de alunos e garantir a regra de negócio de liberação diferida.

*   **Story 2.1:** Criar API Route para Webhook da Hotmart (receber `purchase_approved`).
*   **Story 2.2:** Implementar lógica de "Shadow User" (gravar compra sem criar login no Auth).
*   **Story 2.3:** Desenvolver Scheduler (Cron) para verificar usuários com compra > 8 dias.
*   **Story 2.4:** Implementar criação automática de conta e disparo de e-mail de boas-vindas (Provider de e-mail).
*   **Story 2.5:** Bloquear acesso em caso de reembolso/cancelamento (Webhook `purchase_refunded`).

## 📂 Epic 3: O Mapa da Raiz (Core Product) 🧩
**Objetivo:** A ferramenta interativa de autodiagnóstico.

*   **Story 3.1:** Implementar tela de Onboarding (Anamnese rápida no primeiro login).
*   **Story 3.2:** Desenvolver componente interativo de Mapa Facial (SVG clicável ou Seletores visuais).
*   **Story 3.3:** Criar lógica do Wizard (Perguntas condicionais das 5 Emoções).
*   **Story 3.4:** Implementar algoritmo de cálculo de "Emoção Predominante".
*   **Story 3.5:** Tela de Resultados (Exibição do Arquétipo e Recomendações).

## 📂 Epic 4: Journey & Retention 📅
**Objetivo:** Manter a aluna engajada após o diagnóstico.

*   **Story 4.1:** Implementar Dashboard da Aluna (Visão geral do progresso).
*   **Story 4.2:** Criar Diário das 5 Emoções (Input diário de humor/sintomas).
*   **Story 4.3:** Histórico visual de evolução (Gráfico simples).

## 📂 Epic 5: Admin & Data Intelligência 📊
**Objetivo:** Visibilidade para as Dras.

*   **Story 5.1:** Grid de Alunas (Listagem com filtros por Emoção Predominante).
*   **Story 5.2:** Detalhe da Aluna (Ver respostas do Mapa e histórico do Diário).
*   **Story 5.3:** Export de dados (CSV) para análise externa.

---

## 🚀 Próximos Passos (Sprint 1)
Foco total na **Epic 1** e **Epic 2** para garantir que a infraestrutura esteja pronta para receber as primeiras vendas e processar o "Day 8".
