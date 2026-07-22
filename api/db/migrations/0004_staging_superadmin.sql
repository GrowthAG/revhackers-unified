-- Migration 0004: promove usuario de staging para super_admin
-- Necessario para que o primeiro login Google do admin possa acessar as rotas protegidas
-- Este arquivo e especifico de staging; em producao o super_admin e criado via admin CLI
BEGIN;

-- Atualiza o usuario existente (bbbbbbbb) para super_admin
UPDATE app.internal_users
SET global_role = 'super_admin'
WHERE id = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';

-- Garante que qualquer novo usuario criado via auto-registro que tenha o subject
-- 'synthetic-growthmap-e2e' (usado nos testes E2E) tambem seja super_admin
-- (idempotente se ja existir)
UPDATE app.internal_users u
SET global_role = 'super_admin'
FROM app.user_identities i
WHERE i.user_id = u.id
  AND i.issuer = 'https://securetoken.google.com/revhackers-staging'
  AND i.subject = 'synthetic-growthmap-e2e';

COMMIT;

-- Verifica (fora de transacao, sem RLS)
-- SELECT u.id, u.global_role, i.subject
-- FROM app.internal_users u
-- JOIN app.user_identities i ON i.user_id = u.id;
