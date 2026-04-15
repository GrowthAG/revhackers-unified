// ============================================================================
// _shared/require-role.ts
//
// Helper canonico de autenticacao/autorizacao para edge functions que usam
// SERVICE_ROLE_KEY. Substitui o padrao vulneravel "eleva direto pra service
// role sem checar o caller".
//
// Fluxo:
//   1. authenticate(req) extrai Authorization e decide:
//      - Bearer == SERVICE_ROLE_KEY  -> chamada server-to-server (isServiceRole=true)
//      - Bearer == JWT de usuario    -> valida via auth.getUser() e lookup em profiles
//      - qualquer outra coisa        -> lanca AuthError(401)
//
//   2. requireRoleIn(auth, ['admin','super_admin']) bloqueia caller nao autorizado.
//      service_role sempre passa (bypass intencional para jobs internos).
//
// Uso tipico:
//   const auth = await authenticate(req);
//   requireRoleIn(auth, ['admin', 'super_admin']);
//   const supabaseAdmin = createClient(URL, SERVICE_KEY, ...);
//   // ... opera com supabaseAdmin a partir daqui
//
// Com captura de erro:
//   try { ... } catch (err) { return toErrorResponse(err, corsHeaders); }
// ============================================================================

// @ts-ignore Deno runtime
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

export class AuthError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'AuthError';
  }
}

export interface AuthContext {
  callerId: string | null;
  callerRole: string | null;
  callerEmail: string | null;
  isServiceRole: boolean;
}

// @ts-ignore Deno runtime
const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? '';
// @ts-ignore Deno runtime
const ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY') ?? '';
// @ts-ignore Deno runtime
const SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';

export async function authenticate(req: Request): Promise<AuthContext> {
  const authHeader = req.headers.get('Authorization') ?? '';
  if (!authHeader.startsWith('Bearer ')) {
    throw new AuthError(401, 'Authorization header ausente ou invalido');
  }

  const token = authHeader.slice('Bearer '.length).trim();

  // Chamada server-to-service (ex: outra edge function invocando esta com service_role).
  if (SERVICE_KEY && token === SERVICE_KEY) {
    return {
      callerId: null,
      callerRole: 'service_role',
      callerEmail: null,
      isServiceRole: true,
    };
  }

  // JWT de usuario autenticado.
  const supabaseUser = createClient(SUPABASE_URL, ANON_KEY, {
    global: { headers: { Authorization: authHeader } },
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { data: userData, error: userErr } = await supabaseUser.auth.getUser();
  if (userErr || !userData?.user) {
    throw new AuthError(401, 'JWT invalido ou expirado');
  }

  const { data: profile, error: profErr } = await supabaseUser
    .from('profiles')
    .select('role')
    .eq('id', userData.user.id)
    .single();

  if (profErr || !profile) {
    throw new AuthError(403, 'Perfil do solicitante nao encontrado');
  }

  return {
    callerId: userData.user.id,
    callerRole: (profile as any).role ?? null,
    callerEmail: userData.user.email ?? null,
    isServiceRole: false,
  };
}

export function requireRoleIn(auth: AuthContext, allowed: string[]): void {
  if (auth.isServiceRole) return;
  if (!auth.callerRole || !allowed.includes(auth.callerRole)) {
    throw new AuthError(
      403,
      `Permissao insuficiente. Esperado: ${allowed.join('|')}. Caller: ${auth.callerRole ?? 'anon'}`,
    );
  }
}

export function toErrorResponse(err: unknown, corsHeaders: Record<string, string>): Response {
  if (err instanceof AuthError) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: err.status,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
  const msg = err instanceof Error ? err.message : String(err);
  console.error('[require-role] Erro inesperado:', err);
  return new Response(JSON.stringify({ error: msg || 'Erro interno' }), {
    status: 500,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}
