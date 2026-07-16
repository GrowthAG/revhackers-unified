# RevHackers Growth Hub - Documentação "Deep Dive" (v3.0)

> **ATENÇÃO:** Este documento é a Single Source of Truth (SSOT) técnica. Se o código diz uma coisa e este documento diz outra, *atualize este documento*.

---

## 1. Identidade & Manifesto "Surgical V2"

O projeto não é apenas "dark mode". É um sistema visual de alta precisão inspirado em engenharia aeroespacial e interfaces de terminal.

### 1.1 DNA Visual (Design System)
*   **Philosophy:** "Data over decoration". Se não é um dado ou uma ação, remova.
*   **Cores Absolutas:**
    *   🟢 **Action/Growth:** `#03FC3B` (Neon Green). Usado para o que cresce (dinheiro, leads, sucesso).
    *   🔴 **Danger/Churn:** `#FF0000` (Pure Red). Usado para erros e métricas negativas.
    *   ⚫ **The Void:** `#000000` (Pure Black). O fundo *nunca* é cinza escuro. É `#000000`.
    *   ⚪ **Data:** `#FFFFFF` (Pure White). Títulos e números importantes.
    *   🔘 **Meta-Data:** `#4a4a4a` (Zinc 700). Labels, datas e textos secundários.
*   **Tipografia "Swiss Tech":**
    *   Família: `Inter`
    *   Títulos: `tracking-tighter` (-0.05em) e `leading-none`. Ex: "REVENUE ENGINE".
    *   Botões: `uppercase`, `tracking-widest` (0.2em), `text-xs`. Ex: "ANALISAR PERFIL →".
*   **Efeitos Visuais (FX):**
    *   **Grain:** Uma camada de ruído SVG (`.bg-grain`) aplicada globalmente para dar textura "analógica".
    *   **Marquee:** Faixas de texto em movimento infinito (`.animate-marquee`) usadas para separar seções.

---

## 2. Arquitetura do Sistema (O Monólito Modular)

O RevHackers Growth Hub centraliza **Produto** (REI), **Marketing** (Blog/Scores) e **Operação** (Admin) em um único repo React+Vite.

### 2.1 Stack Tecnológica
*   **Runtime:** React 18 + TypeScript (Strict Mode).
*   **Build:** Vite (SWC).
*   **Styling:** TailwindCSS + Shadcn/UI (Radix Primitives).
*   **Motion:** Framer Motion (para transições de passos e carregamento de cards).
*   **Backend as a Service:** Supabase.
    *   **Auth:** Gerenciado via `AuthContext.tsx`.
    *   **Database:** PostgreSQL.
    *   **Storage:** Buckets para capas de blog (`blog-covers`).
    *   **Edge Functions:** (Planejado) Para chamadas sensíveis como Proxycurl.

### 2.2 Mapa de Rotas (Router Tree)
*   **Zona Pública (Marketing):**
    *   `/` (Home): Landing Page de alta conversão.
    *   `/blog`: CMS próprio.
    *   `/score-[tipo]`: Ferramentas de lead magnet (`/score-site`, `/score-founder`).
*   **Zona do Produto (REI Hub):**
    *   `/rei-hub`: Dashboard do cliente.
    *   `/rei/wizard`: O coração do diagnóstico (5 etapas).
    *   `/rei/resultado/:id`: O relatório final.
*   **Zona Administrativa (Backoffice):**
    *   `/admin`: Dashboard unificado.
    *   `/admin/posts`: Gestão de conteúdo.
    *   `/admin/materials`: Gestão de e-books/fichas.
    *   `/admin/rei`: Gestão dos diagnósticos de clientes.

---

## 3. Business Logic & Algoritmos (O "Cérebro")

### 3.1 O Sistema REI (Revenue Engineering Intelligence)
Não é apenas um formulário. É um motor de consultoria automatizada.
*   **Entrada:** `REIWizard.tsx`. 5 Etapas de coleta de dados (Contexto, Desafios, Estratégia, Prontidão, Expectativas).
*   **Processamento:** `src/utils/reiScoring.ts`.
    *   O algoritmo pontua cada resposta (Ex: MRR > 1M = +10 pontos).
    *   Gera 5 sub-scores (Contexto, Desafios, Estratégia, Prontidão, Maturidade).
    *   Baseado no score total, classifica em níveis: "Fundação" (<20%) até "World Class" (>80%).
*   **Persistência:** Salva um JSONB complexo na tabela `rei_responses` via `src/api/reiResponses.ts`.

### 3.2 Lead Magnets (Scores Públicos)
*   **Site Score:** Usa `fetch()` direto para a API do Google PageSpeed Insights.
    *   *Hook:* O usuário responde 10 perguntas qualificadoras E recebe a análise técnica.
    *   *Conversão:* Envia os dados para um Webhook do LeadConnector (GHL) antes de mostrar o resultado.
*   **Founder Score:** Analise de Autoridade.
    *   *Atual:* Simulação (Mock) de crawler para validação de UX.
    *   *Futuro:* Backend function chamando API Proxycurl.

### 3.3 Auth & Permissions
*   **Singleton:** `src/contexts/AuthContext.tsx`.
*   **Roles:** `super_admin`, `admin`, `user`. Definidos na tabela `public.profiles`.
*   **Dev Door:** Existe um mecanismo de `setDevBypass` para testes rápidos sem login real, injetando um usuário fantasma.

---

## 4. Dicionário de Dados (Database Schema)

Esquema "inferred" do uso em produção (Supabase PostgreSQL).

### `public.blog_posts` (CMS Core)
| Coluna | Tipo | Notas |
| :--- | :--- | :--- |
| `id` | uuid | PK |
| `title` | text | Título H1 |
| `slug` | text | Unique, URL friendly |
| `content` | text | HTML/Rich Text do artigo |
| `published` | boolean | Flag de visibilidade |
| `author_id` | uuid | FK -> profiles.id |
| `created_at` | timestamptz | Data de publicação |

### `public.rei_responses` (O Big Data)
| Coluna | Tipo | Notas |
| :--- | :--- | :--- |
| `id` | uuid | PK |
| `project_id` | uuid | FK -> projects (Cliente) |
| `context` | text | `'internal'` (REI Hub) vs `'lead_gen'` (Scores Públicos) |
| `source` | text | Ex: `'rei'`, `'diagnostic'`, `'site_score'` |
| `responses` | jsonb | Payload bruto de todas as perguntas |
| `total_score` | numeric | 0 a 100+ |
| `maturity_level` | text | Classificação textual (Ex: "Escala") |
| `radar_data` | jsonb | Array `[{ label, value }]` p/ gráficos |
| `insights` | jsonb | Array de strings geradas pelo algoritmo |

### `public.profiles` (Usuários)
| Coluna | Tipo | Notas |
| :--- | :--- | :--- |
| `id` | uuid | PK, Linkado ao `auth.users` |
| `full_name` | text | Nome de exibição |
| `role` | text | `'user'`, `'admin'`, `'super_admin'` |

---

## 5. Integrações Externas & Chaves

*   **Google PageSpeed Insights:** Chave pública (hardcoded ou via ENV `VITE_GOOGLE_API_KEY`).
*   **Supabase:** Via variáveis de ambiente `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY`.
*   **LeadConnector (GoHighLevel):**
    *   **Chatbot:** Script injetado via `ChatbotManager.tsx` (ID pendente de configuração).
    *   **Webhooks:** URLs de endpoint disparadas nos formulários de Score.

---

## 6. Guia de Manutenção para IAs

Se você é uma IA lendo isso para fazer uma alteração, siga estas regras de ouro:

1.  **Tipagem Forte:** Ao editar `REIWizard`, sempre atualize a interface `WizardData` em `reiScoring.ts`. Não use `any`.
2.  **Imutabilidade do Design:** Não adicione `border-radius` grandes (> 4px). O design é "sharp". Não adicione sombras complexas (`box-shadow`), prefira bordas sutis.
3.  **Componentes:** Reutilize `PageLayout` e `Section`. Não crie layouts "ad-hoc" nas páginas.
4.  **Admin:** Qualquer nova tela de gestão deve verificar `isAdmin` ou estar sob a rota protegida.
5.  **Performance:** Imagens devem usar o bucket `blog-covers` e serem servidas otimizadas. Não incorpore Base64 gigante no código.

---
**Fim do Relatório Técnico.**
