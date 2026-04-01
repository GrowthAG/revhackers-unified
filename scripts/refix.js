import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env' });
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);
async function fixAll() {
  const { data: proposals } = await supabase.from('proposals').select('*').ilike('client_name', '%Obras Online%');
  for (let p of proposals) {
    let crm_data = typeof p.crm_data === 'string' ? JSON.parse(p.crm_data) : (p.crm_data || {});
    if (!crm_data.live_proposal) crm_data.live_proposal = {};

    crm_data.live_proposal.cases = [
      { company: 'Anhembi Morumbi', metric: 'Volume de Leads Qualificados', before: 'Estagnado', after: '+ 150%', trend: 'up', insight: 'Implementação de CRM e Geração de Demanda Avançada gerando salto expressivo.' },
      { company: 'SaaS Funnels', metric: 'Motor de Aquisição', before: '100% Outbound', after: 'Hub Pred.', trend: 'up', insight: 'O CEO dependia puramente de outbound. Estruturamos o hub de conversão All-in-One.' },
      { company: 'ENICS (Eventos)', metric: 'Ingressos', before: 'Zero (Lançamento)', after: '3.000 Sold Out', trend: 'up', insight: 'Sold Out absoluto: 3.000 ingressos vendidos em 30 dias através de funil proprietário.' }
    ];
    crm_data.live_proposal.platform_cost = 'Custo Zero';
    crm_data.live_proposal.cases_headline = 'Cases de Sucesso.';
    
    // Inject pricing and CRM
    await supabase.from('proposals').update({ 
      crm_data: crm_data,
      setup_fee: '5000',
      installment_value: '5000'
    }).eq('id', p.id);
  }
}
fixAll();
