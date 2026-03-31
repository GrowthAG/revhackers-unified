import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env') });
const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const { data, error } = await supabase
    .from('proposals')
    .select('id, client_name, slug, crm_data')
    .eq('client_name', 'Obras Online')
    .order('created_at', { ascending: false })
    .limit(1);

  if (error || !data?.length) process.exit(1);

  const proposal = data[0];
  const crm_data = proposal.crm_data || {};
  
  if (crm_data.live_proposal?.comparisons) {
      crm_data.live_proposal.comparisons[0].newTool = 'Funnels: Agendamento Automático';
      crm_data.live_proposal.comparisons[1].newTool = 'Funnels: Fluxos de Nutrição (Sem Zapier)';
      crm_data.live_proposal.comparisons[2].newTool = 'Funnels: E-mails Transacionais & Newsletters';
      crm_data.live_proposal.comparisons[3].newTool = 'Zoho CRM: Pipeline Atual + Oportunidades';
      crm_data.live_proposal.comparisons[4].newTool = 'Gestão Centralizada Funnels + Zoho';
  }

  const { error: updErr } = await supabase.from('proposals').update({ crm_data }).eq('id', proposal.id);
  if (updErr) process.exit(1);
  console.log('Successfully updated newTool columns for comparison');
}

run();
