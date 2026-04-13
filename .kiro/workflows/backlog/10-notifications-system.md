# Task: Implementar sistema de notificacoes in-app

## Contexto
O layout tem um sino de notificacoes mas nao esta conectado. O sistema precisa notificar sobre eventos criticos.

## Objetivo
Criar sistema de notificacoes in-app com persistencia no Supabase e realtime updates.

## Arquivos
- Criar: `src/components/admin/NotificationBell.tsx`
- Criar: `src/hooks/useNotifications.ts`
- Criar: `supabase/migrations/XXXXXX_create_notifications.sql`
- Editar: `src/components/layout/Sidebar.tsx` ou `AppShell.tsx` (integrar o bell)

## Schema SQL
```sql
create table notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) not null,
  type text not null, -- 'task_overdue', 'lead_stagnant', 'proposal_viewed', 'deal_won'
  title text not null,
  body text,
  entity_id uuid, -- referencia ao projeto/lead/tarefa
  entity_type text, -- 'project', 'opportunity', 'task'
  read boolean default false,
  created_at timestamptz default now()
);

create index idx_notifications_user on notifications(user_id, read, created_at desc);
alter table notifications enable row level security;
create policy "Users see own notifications" on notifications for select using (auth.uid() = user_id);
create policy "Users update own notifications" on notifications for update using (auth.uid() = user_id);
```

## Design (Nobibecode)
```
Bell button:      relative p-2 text-zinc-400 hover:text-zinc-900
Badge:            absolute -top-0.5 -right-0.5 w-4 h-4 bg-zinc-900 text-white
                  text-[9px] font-black flex items-center justify-center rounded-sm
Dropdown:         bg-white border border-zinc-200 shadow-sm w-80 max-h-96 overflow-y-auto
Item unread:      bg-zinc-50 border-l-2 border-zinc-900
Item read:        bg-white border-l-2 border-transparent
Title:            text-xs font-bold text-zinc-900
Body:             text-xs text-zinc-500
Time:             text-xxs text-zinc-400
```

## Implementacao
1. Hook `useNotifications()`:
   - Query inicial: ultimas 20 notificacoes do user
   - Supabase Realtime subscription para novas notificacoes
   - `markAsRead(id)`, `markAllAsRead()`
   - `unreadCount` derivado
2. NotificationBell component:
   - Icone Bell do Lucide com badge de count
   - Click abre dropdown com lista de notificacoes
   - Click em notificacao: marca como lida + navega para entity
3. Triggers (edge functions ou DB triggers) que criam notificacoes:
   - Tarefa atrasada (due_date < now() e status != done) - checar diariamente
   - Lead parado >7 dias sem movimentacao
   - Proposta visualizada (proposal_viewed stage change)

## Criterio de Aceite
- Bell aparece na sidebar/header com count de unread
- Notificacoes aparecem em tempo real
- Click navega para o contexto correto
- Mark as read funciona
- RLS garante isolamento por usuario
