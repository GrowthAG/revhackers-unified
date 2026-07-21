// Origens permitidas para CORS. Evita que domínios externos façam requisições
// autenticadas usando JWTs de usuários legítimos (CSRF via CORS wildcard).
const ALLOWED_ORIGINS = [
  'https://revhackers.com.br',
  'https://www.revhackers.com.br',
  'https://app.revhackers.com.br',
  'http://localhost:5173',
  'http://localhost:3000',
];

// Retorna headers CORS restritos ao Origin da requisição se ele for permitido.
// Funções invocadas internamente (sem Origin) recebem um fallback seguro.
export function getCorsHeaders(req?: Request): Record<string, string> {
  const origin = req?.headers?.get('Origin') ?? '';
  const allowedOrigin = ALLOWED_ORIGINS.includes(origin)
    ? origin
    : ALLOWED_ORIGINS[0]; // fallback para produção

  return {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Vary': 'Origin',
  };
}

// Compat: funções que ainda importam corsHeaders como objeto estático.
// Continuam funcionando — mas preferir getCorsHeaders(req) em novas funções.
export const corsHeaders = getCorsHeaders();
