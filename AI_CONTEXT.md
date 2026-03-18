# Revhackers Growth Hub - AI Context Guide

## O que é este projeto
Este projeto opera como um frontend (React/Vite) conectado a um backend serverless via Supabase. Sua arquitetura integra módulos de natureza mista na mesma base de código:
- Site institucional, blog para marketing de conteúdo, materiais e cases de sucesso.
- Interface para captação de leads via ferramentas públicas de diagnóstico e calculadoras de score.
- Área administrativa para operação e gerenciamento interno.
- Sistema REI (Revenue Engine Intelligence) acessado em rotas protegidas pelo estado do usuário.
- Backend focado em integrações, persistência no banco e processamento assíncrono via Edge Functions (Deno).
- Uso potencial de IA conectada às Edge Functions para organizar dados externos em relatórios.

## Estrutura Central (Prioridade Máxima)
Alterações nestas áreas podem impactar o sistema inteiro e exigem muito cuidado:
- `src/App.tsx` (Roteador central)
- `src/contexts/AuthContext.tsx` e `src/components/auth/ProtectedRoute.tsx` (Controle de sessão e proteção de acesso)
- `src/integrations/supabase/*` e `src/api/*` (Comunicação com o banco e definição de dados)
- `src/services/*` e `supabase/functions/*` (Regras de negócio e microsserviços)
- `src/pages/REI-*`, `src/pages/admin/*` (Módulos principais de gerenciamento)

## Organização de Rotas
- `src/config/routes.ts` (Dicionário padronizado usado para evitar links quebrados)

## Operação e Geração de Demanda
- Interações de conversão (`src/pages/Diagnostico.tsx`, fluxos na rota `/score`)
- Scripts de pré-renderização para SEO (`scripts/prerender.js`, `sitemap.xml`)

## Interface e Conteúdo (Menor Risco)
- Páginas de informação estática (`src/pages/Blog.tsx`, `src/pages/Servicos.tsx`, `src/pages/Materiais.tsx`, `src/pages/Cases.tsx`)
- Componentes visuais (`src/components/home/*`, `src/components/shared/*`)

## Como interpretar o projeto
1. A base de dados não atende apenas um site. Ela serve uma aplicação B2B e o marketing ao mesmo tempo.
2. Tratamentos defensivos presentes no código (ex: limitações de tempo ou rechecagem de login) geralmente existem para lidar com latência de rede ou do provedor de auth genérico. Não remova esses tratamentos apenas para deixar o código menor.

## Áreas Sensíveis
- Funções que recuperam senha ou lidam com tokens na URL.
- Funções que salvam respostas do usuário remoto (`publicDiagnostic`, `reiProjects`, `rei_responses`).
- Autenticação e sincronização de perfis (User / Admin).
