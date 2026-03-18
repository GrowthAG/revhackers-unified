# AI File Priority

Este documento organiza a ordem de leitura recomendada para agentes de inteligência artificial. O foco é poupar o uso do limite de contexto, instruindo a IA a ler a "inteligência do sistema" antes de ler os arquivos visuais ou componentes descartáveis.

## Prioridade 1 (Obrigatório Ler para Mudanças Core)
Arquivos que concentram a arquitetura, rotas globais, login e comunicação direta com o banco de dados.
- `src/App.tsx`
- `src/contexts/AuthContext.tsx`
- `src/components/auth/ProtectedRoute.tsx`
- `src/integrations/supabase/*`
- `src/api/*` e `src/services/*`
- `supabase/functions/*`
- Dashboards e fluxos centrais: `src/pages/REI-*`, `src/pages/admin/*`

## Prioridade 2 (Ler Apenas para Tarefas de Interface e Navegação)
Rotas focadas na experiência do usuário, interações pontuais e ferramentas de conversão.
- Entradas e captação: `src/pages/Index.tsx`, `src/pages/Diagnostico.tsx`, `src/components/diagnostic*`, `src/pages/Score*.tsx`
- Páginas estáticas/conteúdo: `src/pages/Blog.tsx`, `src/pages/Materiais.tsx`, `src/pages/Cases.tsx`
- Agendamentos: `src/pages/Booking.tsx`, `src/pages/Agenda*.tsx`
- Mapa passivo de URLs: `src/config/routes.ts`

## Prioridade 3 (Elementos de Layout e Repetição)
Ler apenas se a tarefa envolver puramente ajuste de tela, formatação de mock ou documentação inativa.
- Componentes visuais secundários: `src/components/home/*`, `src/components/blog/*`, `src/components/shared/*`
- O CSS base: `src/styles/*` ou `src/index.css`
- Documentos passivos de preenchimento: `src/data/*`

## O que ignorar na busca padrão
Evite abrir os arquivos abaixo a não ser que a tarefa mande de modo direto:
- Elementos pesados como SVGs extensos importados visualmente ou binários de ícones longos.
- Conteúdo das pastas de build (`dist/` ou compilados finais estáticos).
- Arquivos de erro `.log` perdidos na máquina que misturam o histórico do git real com dados transientes.
