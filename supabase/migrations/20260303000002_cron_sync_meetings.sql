-- ═══════════════════════════════════════════════════════════════════════════════
-- Cron Job: Sync automático de reuniões Google Meet a cada 15 minutos
-- Usa pg_cron + pg_net para chamar a Edge Function
-- ═══════════════════════════════════════════════════════════════════════════════

-- Habilitar extensões necessárias
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Criar cron job: a cada 15 minutos, chama a Edge Function
SELECT cron.schedule(
    'sync-google-meetings',           -- nome do job
    '*/15 * * * *',                   -- a cada 15 minutos
    $$
    SELECT net.http_post(
        url := 'https://eqspbruarsdybpfeijnf.supabase.co/functions/v1/google-meetings',
        headers := jsonb_build_object(
            'Content-Type', 'application/json',
            'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVxc3BicnVhcnNkeWJwZmVpam5mIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzkyMjI5ODEsImV4cCI6MjA1NDc5ODk4MX0.JLxjCGjmWiSjGK7MmxK1ezF5VDTHLdxfQ7T7lhw5nD8'
        ),
        body := '{"action":"list"}'::jsonb
    );
    $$
);
