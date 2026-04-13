# Task: Adicionar filtros ao RevenueCockpit

## Contexto
O RevenueCockpit nao tem filtros. O padrao Notion tem Filter/Sort/Search nas database views.

## Objetivo
Adicionar barra de filtros no RevenueCockpit com: fonte do lead, range de investimento, dias no estagio.

## Arquivos
- `src/pages/admin/RevenueCockpit.tsx`

## Design (Nobibecode)
```
Filter bar:       flex items-center gap-2 mb-6
Filter button:    text-xs font-bold text-zinc-400 hover:text-zinc-900 border border-zinc-200
                  px-3 py-1.5 flex items-center gap-1.5 hover:bg-zinc-50 transition-colors
Filter active:    bg-zinc-900 text-white border-zinc-900
Dropdown:         bg-white border border-zinc-200 shadow-sm p-2 min-w-[200px]
Option:           px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 cursor-pointer
Option selected:  bg-zinc-100 font-bold text-zinc-900
```

## Implementacao
1. Adicionar state: `filters: { source: string | null, minDays: number | null, minInvestment: number | null }`
2. Renderizar filter bar entre o view switcher e o conteudo (lista/kanban/followups)
3. Filtros disponiveis:
   - **Fonte do Lead**: dropdown com opcoes de `LEAD_SOURCE_LABELS` (LinkedIn, WhatsApp, Indicacao, Inbound, Evento, Manual)
   - **Dias no estagio**: "3+ dias", "7+ dias", "14+ dias", "30+ dias"
   - **Investimento**: "Ate R$5k", "R$5k-15k", "R$15k-50k", "R$50k+"
4. Aplicar filtros no `useMemo` de `diagnostico`, `vendas`, `followups`
5. Mostrar badge com count de filtros ativos
6. Botao "Limpar filtros" quando ha filtros ativos
7. Filtros aplicam em todas as views (lista, kanban, followups)

## Criterio de Aceite
- Cada filtro funciona independente e em combinacao
- Filtros aplicam em lista, kanban e followups
- Badge mostra quantos filtros estao ativos
- "Limpar filtros" reseta todos
- Contadores de KPIs no topo refletem dados filtrados
