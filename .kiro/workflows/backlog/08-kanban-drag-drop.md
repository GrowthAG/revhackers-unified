# Task: Adicionar drag-and-drop ao Kanban do RevenueCockpit

## Contexto
O Kanban view no `RevenueCockpit.tsx` e read-only. Os cards nao podem ser arrastados entre colunas para avancar estagios.

## Objetivo
Implementar drag-and-drop nos cards do Kanban para permitir transicao de estagio visual.

## Dependencias
- Instalar `@dnd-kit/core` e `@dnd-kit/sortable`

## Arquivos
- `src/pages/admin/RevenueCockpit.tsx` (secao kanban view)

## Implementacao
1. Envolver o kanban com `<DndContext>` do @dnd-kit
2. Cada coluna e um `<Droppable>` com id = pipeline_stage
3. Cada card e um `<Draggable>` com id = project.id
4. No `onDragEnd`:
   - Identificar o stage de destino
   - Se stage = 'won', abrir DealClosingModal (igual ao select)
   - Se stage = 'lost', confirmar com window.confirm
   - Demais stages: chamar `handleAdvance(entityId, newStage)` diretamente
5. Feedback visual durante drag:
   - Card arrastado: `opacity-50 shadow-sm`
   - Coluna destino hover: `bg-zinc-50 border-dashed border-zinc-300`
6. Manter o select dropdown nos cards como alternativa

## Design (Nobibecode)
```
Card dragging:     opacity-50 scale-105 shadow-sm z-50
Drop target:       bg-zinc-50/50 border-2 border-dashed border-zinc-200 transition-colors
Drop active:       border-zinc-400
```

## Criterio de Aceite
- Cards podem ser arrastados entre colunas
- Avancar estagio funciona via drag (igual ao select)
- Transicao para 'won' abre modal de fechamento
- Transicao para 'lost' pede confirmacao
- Feedback visual durante drag
- Select dropdown continua funcionando como fallback
