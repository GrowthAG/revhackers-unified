/**
 * ORK - Meeting Intelligence
 * Configuração da Extensão
 * 
 * INSTRUÇÕES:
 * 1. Copie este arquivo para config.js
 * 2. Preencha as credenciais do Supabase
 * 3. Recarregue a extensão no Chrome
 */

// Supabase Configuration
// Encontre esses valores em: https://supabase.com/dashboard/project/YOUR_PROJECT/settings/api
export const CONFIG = {
    // URL do seu projeto Supabase (CORRIGIDO!)
    SUPABASE_URL: 'https://eqspbruarsdybpfeijnf.supabase.co',

    // Anon Key (pública, pode ficar no frontend)
    SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVxc3BicnVhcnNkeWJwZmVpam5mIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYwOTk0OTIsImV4cCI6MjA4MTY3NTQ5Mn0.z1IEQ4_5X0Qf5TnUsAmxkvfkD3VLrB5ewyXHGRqBtfY',

    // Endpoint da Edge Function
    PROCESS_AUDIO_ENDPOINT: '/functions/v1/process-meeting-audio',
};

// Não edite abaixo desta linha
export const getFullEndpoint = () => {
    return `${CONFIG.SUPABASE_URL}${CONFIG.PROCESS_AUDIO_ENDPOINT}`;
};
