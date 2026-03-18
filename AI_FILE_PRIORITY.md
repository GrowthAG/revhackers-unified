# AI File Priority

Este documento orienta diretrizes de indexação de busca para agentes de Inteligência Artificial para facilitar o refinamento otimizado de limite de tokens (Context Window) evitando saturar instâncias operacionais com requisições sobre diretórios periféricos quando o assunto envolver blocos principais da abstração da API ou interface do software.

## Prioridade 1 (Obrigatória em modificação funcional ou arquitetural profunda)
Definições de topologia unificada de endpoints, ciclos globais assíncronos e acesso restrito.
- `src/App.tsx`
- `src/contexts/AuthContext.tsx`
- `src/components/auth/ProtectedRoute.tsx`
- `src/integrations/supabase/*`
- `src/api/*`
- `src/services/*`
- `supabase/functions/*`
- Módulos gerenciais correspondentes ao escopo principal ativo: `src/pages/REI-*`, `src/pages/admin/*`

## Prioridade 2 (Sob-demanda para intervenções atreladas à rotas dinâmicas ou experiência conversional específica)
A varredura ou invocação em APIs destes subdiretórios deve ocorrer majoritariamente quando a interface pública ou funcional designada se referenciar explicitamente pelas variáveis do objetivo local.
- Entradas e captações sistêmicas: `src/pages/Index.tsx`, `src/pages/Diagnostico.tsx`, `src/components/diagnostics/*`, ramificações de score calculadas como `src/pages/Score*.tsx`
- Organização para indexação constante: `src/pages/Blog.tsx`, `src/pages/Materiais.tsx`, `src/pages/Cases.tsx`
- Componentes e módulos agendados: `src/pages/Booking.tsx`, `src/pages/Agenda*.tsx`
- Arquivo definidor simplificado: `src/config/routes.ts`

## Prioridade 3 (Elementos passivos estruturantes)
Inspeção recomendada em casos isolados de alteração restrita onde o escopo trata de formatação, documentação estática ou marcação sem ligação com métodos computacionais complexos.
- Subdivisões do repositório para composição secundária: `src/components/home/*`, `src/components/blog/*`, `src/components/shared/*`
- Representação unificada customizada: `src/styles/*` ou `src/index.css`
- Documentação enumerada representacional passiva: `src/data/*`

## Ocultação Pragmática (Despriorizado ou Ruído Elevado de Contexto)
Em circunstâncias padronizadas e correções ordinárias evite varrer os vetores listados abaixo sob prerrogativa de proteger estabilidade temporal e carga dos prompts de interpretação baseados em árvore de domínios densos.
- Repasses densos indexadores midiáticos originados de componentes importados.
- Arquivos comprimidos de dist e cache transacionais pré-gerados que sobrepõe blocos brutos (`dist/`).
- Logs transientes do sistema operacional que distorcem o repositório lógico.
