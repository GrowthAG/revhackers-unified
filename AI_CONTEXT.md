# Revhackers Growth Hub - AI Context Guide

## O que é este projeto
Este projeto opera como um frontend (React/Vite) conectado a um backend serverless via Supabase. Sua arquitetura integra módulos de natureza mista na mesma base de código:
- Site institucional, blog para marketing de conteúdo, materiais e cases de sucesso.
- Interface para captação de leads via áreas públicas de diagnóstico e avaliações analíticas (Score).
- Área administrativa desenvolvida para gestão de processos, leads e projetos.
- Sistema REI (Revenue Engine Intelligence) operável em rotas protegidas pelo contexto de usuário.
- Backend focado em integrações, persistência via banco de dados e processamento paralelo via Edge Functions (Deno).
- Uso potencial de processamento de inteligência artificial alocado nas Edge Functions para extração e agrupamento de dados externos em relatórios estruturais de planejamento.

## Estrutura Centralizada (Alta Criticidade)
Modificações nestas áreas podem impactar transversalmente o comportamento do sistema e exigem validação minuciosa:
- `src/App.tsx` (Roteador central que orquestra as áreas públicas, autenticadas e administrativas via código de divisão preguiçosa - lazy load)
- `src/contexts/AuthContext.tsx` e `src/components/auth/ProtectedRoute.tsx` (Controle principal do estado de sessão da aplicação e interceptação de acesso não autorizado)
- `src/integrations/supabase/*` e `src/api/*` (Data fetching, clientes de banco e modelagem formal de types para comunicação com backend)
- `src/services/*` e `supabase/functions/*` (Microsserviços e encapsulamento de regras operacionais de sistema)
- `src/pages/REI-*`, `src/pages/admin/*` (Módulos estruturais de gerenciamento interno e condução de processo do hub)

## Áreas de Fundação Organizacional e Padrões
- `src/config/routes.ts` (Dicionário padronizado de referências para evitar navegação via strings soltas)

## Áreas Operacionais e Geração de Demanda (Criticidade Moderada a Alta)
- Interações de captação de conversão (`src/pages/Diagnostico.tsx`, fluxos analíticos na rota `/score`)
- Scripts de pré-renderização e otimização para motores de busca aplicados em pipeline dinâmico (`scripts/prerender.js`, configurações orientadas a estáticos ou `sitemap.xml`)

## Áreas de Interface e Conteúdo (Impacto Localizado)
- Páginas puramente informacionais (`src/pages/Blog.tsx`, `src/pages/Servicos.tsx`, `src/pages/Materiais.tsx`, `src/pages/Cases.tsx`)
- Componentes visuais encapsulados e representacionais (`src/components/home/*`, `src/components/shared/*`, modais independentes)

## Regras Operacionais para Interpretação
1. A base de código não representa uma interface unicamente estática. Trata-se de uma aplicação B2B e portal de marketing acoplados no mesmo roteador.
2. A transição e persistência do roteamento entre diagnósticos da área livre, área administrativa e API compõem módulos intrinsecamente relacionados no produto primário.
3. Tratamentos e cláusulas puramente defensivas encontradas no código (lógicas de redirecionamento, time-outs fixos em *useEffect*) frequentemente existem como tolerância transiente baseada na comunicação com provedores de auth na nuvem e concorrência no cliente; supressões dessas cláusulas assumidas apenas por clareza estética tendem a ocasionar perdas de serviço em cenários reais de rede limitada.

## Observações Sensíveis e Integração de Estado
- Fluxos que gerenciam interrupção pontual para restabelecimento de dados (exemplo: hash listeners ou tokens interceptados na autenticação visando recuperação de senhas).
- Operações de leitura e escrita tangentes ou vinculadas às entidades principais do negócio (ex: formulários e cadastros diagnósticos processados remotamente e injetados de volta).
- Orquestrações externas na cloud da infraestrutura que interagem com payloads da plataforma (Supabase Edge Functions ligadas a cronjobs ou Webhooks com processamento de texto/transcricional).
- Preservação da correlação de autorização entre o estado refletido do usuário na interface (`Role`/Perfil) versus o acesso concedido efetivamente validado na nuvem.

## Ordem Operacional de Leitura Recomendada
Para estabelecer a compreensão topológica de blocos abrangentes, a sequência indicada é:
1. `src/App.tsx`
2. `src/contexts/AuthContext.tsx` e `src/components/auth/ProtectedRoute.tsx`
3. `src/integrations/supabase/*` e `src/api/*`
4. `src/services/*` e `supabase/functions/*`
