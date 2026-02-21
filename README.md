# Meu Corpo, Minha Mente

Uma plataforma interativa de autodiagnóstico baseada na Medicina Tradicional Chinesa (MTC) projetada para equilibrar corpo e mente através da análise de padrões físicos e emocionais.

## 🌟 Funcionalidades
- **Mapa da Raiz Facial:** Um modelo anatômico de rosto interativo que permite aos usuários clicar em zonas específicas (como "Entre Sobrancelhas" ou "Boca/Queixo") para descobrir desequilíbrios associados a órgãos (Fígado, Rins, etc.).
- **Diagnóstico Elementar:** Um questionário guiado que identifica o Elemento Dominante atual do usuário (Fogo, Terra, Madeira, Metal ou Água) de acordo com os 5 Elementos da MTC.
- **Check-in Diário:** Registro de bem-estar emocional e físico contínuo, salvando o histórico diário na nuvem.
- **Integração com Perfil e Foto:** Upload de avatares com compressão de imagem assíncrona feita diretamente no frontend via Canvas HTML5.

## 🛠️ Stack Tecnológico
- **Frontend:** [Next.js 15](https://nextjs.org/) (App Router, Server Actions, React 19)
- **Linguagem:** TypeScript
- **Estilização:** [Tailwind CSS](https://tailwindcss.com/) com design focado em Glassmorphism, Mesh Gradients e micro-animações.
- **Ícones:** Lucide React
- **Autenticação & Banco de Dados:** [Supabase](https://supabase.com/)

---

## 🚀 Como Executar Localmente

### 1. Requisitos
- [Node.js](https://nodejs.org/) (versão 18+ recomendada)
- Uma conta e um projeto configurado no [Supabase](https://supabase.com/).

### 2. Configurando o Ambiente
Clone o repositório e instale as dependências:
```bash
git clone https://github.com/SEU_USUARIO/meu-corpo-minha-mente.git
cd meu-corpo-minha-mente
npm install
```

Crie um arquivo `.env.local` na raiz do projeto baseado no `.env.example`:
```bash
cp .env.example .env.local
```

Preencha o `.env.local` com as suas chaves do Supabase:
```env
NEXT_PUBLIC_SUPABASE_URL=sua_url_do_projeto
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_anon_key_publica
```

### 3. Rodando o Servidor de Desenvolvimento
```bash
npm run dev
```
Abra [http://localhost:3000](http://localhost:3000) no seu navegador para ver o aplicativo funcionando.

---

## 🔒 Variáveis de Ambiente e Segurança
Sempre certifique-se de que o `.env.local` está listado no seu `.gitignore`. **Nunca commite** variáveis sensíveis de produção no histórico do Git.

---
_Design liderado por metodologias de "Visual Breathing Space" inspiradas por Brad Foster._
