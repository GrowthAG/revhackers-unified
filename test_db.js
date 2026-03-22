import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function test() {
    console.log("--- INICIANDO TELEMETRIA DO BANCO SUPABASE ---");
    
    // Teste 1: Coluna linkedin_data em clients
    const { error: cErr } = await supabase.from('clients').select('linkedin_data').limit(1);
    if (cErr) console.error("❌ ERRO OSINT (clients):", cErr.message);
    else console.log("✅ OSINT Clients: Coluna 'linkedin_data' confirmada.");

    // Teste 2: Coluna market_data em rei_projects
    const { error: pErr } = await supabase.from('rei_projects').select('market_data').limit(1);
    if (pErr) console.error("❌ ERRO OSINT (projetos):", pErr.message);
    else console.log("✅ OSINT Projects: Coluna 'market_data' confirmada.");

    // Teste 3: Coluna start_date em orqflow_tasks
    const { error: tErr } = await supabase.from('orqflow_tasks').select('start_date').limit(1);
    if (tErr) console.error("❌ ERRO Tarefas:", tErr.message);
    else console.log("✅ Tarefas Orqflow: Coluna 'start_date' confirmada.");

    // Teste 4: Nova tabela orqflow_task_attachments
    const { error: aErr } = await supabase.from('orqflow_task_attachments').select('id').limit(1);
    if (aErr) console.error("❌ ERRO Anexos:", aErr.message);
    else console.log("✅ Tabela de Anexos: 'orqflow_task_attachments' confirmada e responsiva.");
    
    console.log("--- TELEMETRIA CONCLUÍDA ---");
}

test();
