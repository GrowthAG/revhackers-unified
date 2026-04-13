# Task: Implementar skeleton loading states nas paginas admin

## Contexto
As paginas admin (Dashboard, Pipeline, ProjectDetails) mostram um spinner generico durante carregamento. O padrao Notion usa skeletons que espelham o layout final.

## Objetivo
Substituir spinners por skeleton loading states que refletem a estrutura da pagina.

## Arquivos
- `src/pages/admin/AdminDashboard.tsx`
- `src/pages/admin/RevenueCockpit.tsx`
- `src/pages/admin/ProjectDetails.tsx`
- Criar: `src/components/ui/Skeleton.tsx` (se nao existe, ou usar o existente)

## Design (Nobibecode)
```tsx
// Skeleton base
className="bg-zinc-100 rounded animate-pulse"

// Skeleton line:    h-4 w-3/4
// Skeleton title:   h-8 w-1/2
// Skeleton card:    border border-zinc-200 p-5 space-y-3
// Skeleton metric:  h-12 w-20
// Skeleton row:     flex gap-4 py-3 border-b border-zinc-100
```

## Implementacao
1. AdminDashboard skeleton:
   - 4 metric placeholders em linha (KPI strip)
   - 4 card placeholders em grid 4 cols (quick-access)
   - Divider
   - 2/3 col: 4 row placeholders (saude projetos) + chart placeholder
   - 1/3 col: 2 card placeholders (upcoming + activity)
2. RevenueCockpit skeleton:
   - 4 metric cards
   - Tab bar placeholder
   - Copilot alert placeholder
   - 5 row placeholders (lista de leads)
3. ProjectDetails skeleton:
   - Header placeholder (nome + badge)
   - Journey bar placeholder (6 dots em linha)
   - Metadata table placeholder (6 cols)
   - Sidebar placeholder (3 sections com 3 items cada)
4. Transicao: fade do skeleton para conteudo real (opacity transition 200ms)

## Criterio de Aceite
- Cada pagina mostra skeleton especifico em vez de spinner
- Skeleton reflete a estrutura real da pagina
- Transicao suave ao carregar dados
- Nenhum layout shift (CLS) ao trocar skeleton por conteudo
