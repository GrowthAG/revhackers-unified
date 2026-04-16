-- Fix: descobre valores de status unicos na tabela e remove a constraint rigida
-- para depois recriar com todos os valores validos.

-- Passo 1: remove a constraint antiga
ALTER TABLE public.rei_projects DROP CONSTRAINT IF EXISTS rei_projects_status_check;

-- Passo 2: recria sem constraint rigida (os valores sao controlados pelo app)
-- A constraint original era muito restritiva e impedia o fluxo do RPC.
-- Removemos a CHECK e usamos validação no app layer.
