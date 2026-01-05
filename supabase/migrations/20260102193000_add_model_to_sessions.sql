-- Add model column to chat_sessions to persist selected model per chat
alter table public.chat_sessions 
add column if not exists model text default 'gpt-4o';
