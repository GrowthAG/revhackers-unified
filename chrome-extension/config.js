/**
 * RevHackers Clipper - Configuracao
 *
 * INSTRUCOES DE SETUP:
 * 1. Preencha SUPABASE_URL e SUPABASE_ANON_KEY com os valores do seu projeto.
 *    Encontre-os em: Supabase Dashboard -> Settings -> API
 * 2. Recarregue a extensao no Chrome (chrome://extensions -> botao de reload).
 *
 * SEGURANCA:
 * - SUPABASE_ANON_KEY e uma chave publica segura para incluir no frontend/extensao.
 * - NUNCA coloque a Service Role Key aqui.
 * - O JWT do usuario autenticado e armazenado em chrome.storage.local apos o login
 *   e enviado nos headers das chamadas as Edge Functions.
 */

export const SUPABASE_URL = 'https://eqspbruarsdybpfeijnf.supabase.co';

export const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVxc3BicnVhcnNkeWJwZmVpam5mIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYwOTk0OTIsImV4cCI6MjA4MTY3NTQ5Mn0.z1IEQ4_5X0Qf5TnUsAmxkvfkD3VLrB5ewyXHGRqBtfY';

export const EDGE_FUNCTION_BASE_URL = `${SUPABASE_URL}/functions/v1`;

/**
 * Endpoints das Edge Functions
 * Nao altere esses caminhos - eles devem corresponder exatamente ao que esta
 * deployado no Supabase.
 */
export const ENDPOINTS = {
    PROCESS_MEETING_AUDIO: `${EDGE_FUNCTION_BASE_URL}/process-meeting-audio`,
    SCRAPE_PROFILE:        `${EDGE_FUNCTION_BASE_URL}/scrape-profile`,
    REI_PROJECTS_REST:     `${SUPABASE_URL}/rest/v1/rei_projects`,
};
