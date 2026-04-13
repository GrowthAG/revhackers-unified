# Task: Auditoria e correcao de RLS nas Edge Functions

## Contexto
As edge functions `auto-handoff` e `generate-strategic-plan` podem ter gaps de autorizacao. O sistema usa Supabase RLS mas as functions podem estar bypassando com service_role key.

## Objetivo
Garantir que todas as edge functions validam autenticacao e autorizacao antes de executar operacoes.

## Arquivos
- `supabase/functions/auto-handoff/index.ts`
- `supabase/functions/generate-strategic-plan/index.ts`
- `supabase/functions/analyze-diagnostic/index.ts`
- `supabase/functions/agent-chat/index.ts`
- `supabase/functions/ask-agent/index.ts`

## Implementacao
1. Em cada function, verificar se existe validacao do JWT token no inicio
2. Pattern correto:
   ```ts
   const authHeader = req.headers.get('Authorization');
   if (!authHeader) return new Response('Unauthorized', { status: 401 });
   const { data: { user }, error } = await supabaseClient.auth.getUser(authHeader.replace('Bearer ', ''));
   if (error || !user) return new Response('Unauthorized', { status: 401 });
   ```
3. Para functions que sao chamadas por triggers (auto-handoff), validar que o request vem do proprio Supabase (verificar header x-supabase-*)
4. Nunca expor service_role key em responses ou logs
5. Validar que inputs sao sanitizados (especialmente campos que vao para prompts de IA)

## Criterio de Aceite
- Todas as functions retornam 401 se chamadas sem auth valido
- Functions de trigger validam origem
- Nenhum secret e logado ou exposto
- Inputs para prompts de IA sao sanitizados contra injection
