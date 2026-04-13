# Task: Adicionar badges/contadores na sidebar

## Contexto
A sidebar (`src/components/layout/Sidebar.tsx`) nao mostra contadores. O padrao Notion mostra counts nos items (ex: "5" no inbox).

## Objetivo
Adicionar badges com contadores relevantes nos items da sidebar: tarefas atrasadas, deals abertos, gravacoes pendentes.

## Arquivos
- `src/components/layout/Sidebar.tsx`

## Design (Nobibecode)
```
Badge container: ml-auto
Badge:          min-w-[18px] h-[18px] text-[10px] font-black flex items-center justify-center
                bg-zinc-800 text-zinc-400 px-1 rounded-sm
Badge alert:    bg-white text-zinc-950 (para contadores que requerem atencao)
```

## Implementacao
1. Criar hook `useSidebarBadges()` que retorna:
   ```ts
   { pipeline: number, projects_overdue: number, orphaned: number }
   ```
2. Queries leves (count only, cached 60s via React Query):
   - `pipeline`: COUNT de `opportunities` onde `pipeline_stage` NOT IN ('won', 'lost')
   - `projects_overdue`: COUNT de `orqflow_tasks` onde `due_date < now()` AND `status != 'done'`
   - `orphaned`: COUNT de gravacoes orfas (mesma query do OrphanedRecordingsAlert)
3. Renderizar badge ao lado do label no item da sidebar:
   - Pipeline: numero de deals abertos
   - Projetos: numero de tarefas atrasadas (badge alert se > 0)
4. Nao mostrar badge se count = 0
5. Cache de 60 segundos para nao sobrecarregar

## Criterio de Aceite
- Badges aparecem na sidebar ao lado de Pipeline e Projetos
- Contadores refletem dados reais do Supabase
- Badge nao aparece quando count = 0
- Performance: queries sao leves (COUNT only) e cached
- Estilo segue Nobibecode (zinc, sem cores vibrantes)
