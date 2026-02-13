# Fullstack Architecture: Meu Corpo Minha Mente - Web App

> **Status:** Draft | **Versão:** 1.0 | **Autor:** @architect (Aria) | **Data:** 2026-02-12

## 1. Visão Geral do Sistema

O sistema é um **Web App (PWA)** focado em autodiagnóstico e acompanhamento emocional. A arquitetura prioriza **Mobile-First**, **Simplicidade Operacional** (Serverless) e **Segurança de Dados** (Saúde/LGPD).

### 1.1 Diagrama de Contexto
```mermaid
graph TD
    User((Aluna)) -->|Acessa via Celular| WebApp[Next.js PWA]
    WebApp -->|Autenticação & Dados| Supabase[Supabase (Auth + DB)]
    Hotmart[Hotmart] -->|Webhook de Compra| API[Next.js API Routes]
    Scheduler[Cron Job] -->|Gatilho Diário| API
    API -->|Cria Usuário D+8| Supabase
    API -->|Envia Credenciais| MailService[Resend/SES]
    Dras((Dras)) -->|Admin Dashboard| WebApp
```

## 2. Stack Tecnológico

### 2.1 Frontend (Web App & Admin)
*   **Framework:** **Next.js 14+** (App Router).
*   **Linguagem:** TypeScript.
*   **Estilização:** **Tailwind CSS** (Utility-first) + **Shadcn/UI** (Componentes acessíveis e customizáveis).
*   **State Management:** React Context + Zustand (se necessário) para o "Mapa da Raiz" (wizard multi-etapas).
*   **Ícones:** Lucide React.
*   **Animações:** Framer Motion (para feedback visual suave e "premium").

### 2.2 Backend (Serverless)
*   **Runtime:** Next.js API Routes (Edge/Node.js).
*   **Integrações:**
    *   **Hotmart Webhook:** Endpoint para receber `purchase_approved` e `switch_plan`.
    *   **E-mail:** Resend (recomendado pela DX) ou AWS SES.

### 2.3 Banco de Dados & Auth
*   **Plataforma:** **Supabase** (PostgreSQL).
*   **Auth:** Supabase Auth (Email/Password).
*   **Database:** PostgreSQL com Row Level Security (RLS) para isolamento total dos dados das pacientes.

### 2.4 Infraestrutura
*   **Hospedagem:** Vercel (Frontend + API) ou Railway.
*   **Banco de Dados:** Supabase Cloud.

## 3. Arquitetura de Dados (Schema Simplificado)

### Tabela: `users` (Extensão da `auth.users`)
*   `id` (UUID, PK) -> Link com Supabase Auth
*   `email` (String)
*   `name` (String)
*   `phone` (String)
*   `role` (Enum: 'patient', 'admin')
*   `purchase_date` (Date)
*   `hotmart_transaction_code` (String)
*   `access_granted` (Boolean) - Controla liberação do App.
*   `created_at` (Date)

### Tabela: `assessments` (O Mapa da Raiz)
*   `id` (UUID, PK)
*   `user_id` (UUID, FK)
*   `answers` (JSONB) - Respostas detalhadas do wizard.
*   `dominant_emotion` (Enum: 'madeira', 'fogo', 'terra', 'metal', 'agua')
*   `created_at` (Date)

### Tabela: `daily_logs` (Diário)
*   `id` (UUID, PK)
*   `user_id` (UUID, FK)
*   `emotion_level` (Int 1-5)
*   `dominant_emotion` (Enum) - Sentimento do dia.
*   `notes` (Text)
*   `created_at` (Date)

## 4. Fluxos Críticos

### 4.1 Fluxo "Day 8 Access" (Automação)
1.  **Compra:** Hotmart envia webhook `purchase_approved` para `/api/webhooks/hotmart`.
2.  **Registro:** API cria registro na tabela `users` (sem criar no Auth ainda) com `purchase_date = NOW()` e `access_granted = false`.
3.  **Agendamento:** Um Cron Job (Vercel Cron ou pg_cron) roda diariamente às 06:00.
4.  **Verificação:** O Job busca usuários onde `purchase_date <= (NOW - 8 days)` E `access_granted = false`.
5.  **Provisionamento:** Para cada usuário elegível:
    *   Cria usuário no Supabase Auth (Gera senha aleatória).
    *   Envia e-mail de "Boas-Vindas" com credenciais.
    *   Atualiza `access_granted = true`.

### 4.2 Fluxo Autodiagnóstico
1.  Usuária acessa wizard.
2.  Responde perguntas e marca zonas no SVG do corpo/rosto.
3.  Frontend calcula score localmente (ou via API para segurança).
4.  Salva resultado em `assessments`.
5.  Redireciona para Dashboard com o resultado.

## 5. Segurança & Privacidade (LGPD)
*   **RLS (Row Level Security):** Regras estritas no banco. Usuário só lê/escreve seus próprios dados. Admin lê tudo.
*   **Criptografia:** Dados em repouso no Supabase. HTTPS em trânsito.
*   **Dados Sensíveis:** Evitar coletar dados médicos profundos desnecessários no MVP.

## 6. Plano de Desenvolvimento (MVP)

1.  **Setup:** Inicializar Next.js, configurar Shadcn/UI, conectar Supabase.
2.  **Database:** Criar tabelas e policies RLS.
3.  **Webhook Hotmart:** Implementar recepção e gravação da compra.
4.  **Scheduler:** Implementar Vercel Cron para regra D+8.
5.  **Frontend (Auth):** Login Page.
6.  **Frontend (Wizard):** Implementar lógica do Mapa da Raiz.
7.  **Admin:** Tabela simples de visualização.

---
**Status:** 🏗️ Aguardando Validação
