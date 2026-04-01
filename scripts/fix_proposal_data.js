import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env' });

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function fixAll() {
  const { data: proposals, error: fetchErr } = await supabase
    .from('proposals')
    .select('*')
    .ilike('client_name', '%Obras Online%');

  if (fetchErr) {
    console.error("Error fetching proposals:", fetchErr);
    return;
  }

  console.log(`Found ${proposals.length} Obras Online proposals. Fixing all of them...`);

  for (let p of proposals) {
    console.log(`Fixing Proposal ID: ${p.id}`);

    let crm_data = typeof p.crm_data === 'string' ? JSON.parse(p.crm_data) : (p.crm_data || {});
    if (!crm_data.live_proposal) crm_data.live_proposal = {};

    // 1. Deliverables
    crm_data.live_proposal.deliverables = [
      { category: "Fundação Técnica", items: ["Blueprint de Integração Zorro CRM", "Revisão do Perfil LinkedIn (Wagner)", "Setup do Ambiente RevHackers Funnels", "Mapeamento de Score e Tags de Lead"] },
      { category: "A Máquina Funnels", items: ["Definição de 2 Lead Magnets / Mês", "LPs de Alta Conversão no Funnels", "Playbook de Conteúdo (2 a 3 posts/sem)", "Automação de Qualificação (Funnels)"] },
      { category: "Aceleração & Dados", items: ["Injeção Automática de MQL no Zorro", "Workflows de Nutrição B2B", "Reuniões de Calibragem (Mkt vs Vendas)", "Dashboard de Performance (Docs/Taxas)"] }
    ];

    // 2. Cost Inefficiency
    crm_data.live_proposal.cost_inefficiency_comparison = [
      { tool: 'Hubspot / Pipedrive (Sales CRM)', oldCost: 'R$ 600/mês', newTool: 'CRM B2B com Pipeline Visual e Hand-off' },
      { tool: 'RD Station / ActiveCampaign (Mkt)', oldCost: 'R$ 450/mês', newTool: 'Construtor de Funis de Alta Conversão B2B' },
      { tool: 'Manychat (Instagram DM)', oldCost: 'R$ 150/mês', newTool: 'Robôs Nativos de Qualificação no WhatsApp/DM' },
      { tool: 'Calendly (Agendador Oficial)', oldCost: 'R$ 80/mês', newTool: 'Agendador Inteligente Integrado aos Fluxos' },
      { tool: 'Make / Zapier (Integrações)', oldCost: 'R$ 574/mês', newTool: 'Workflows Nativos + Webhooks sem Limites' }
    ];
    crm_data.live_proposal.comparisons = crm_data.live_proposal.cost_inefficiency_comparison;

    // 3. Cases
    crm_data.live_proposal.cases = [
      { company: 'Anhembi Morumbi', metric: 'Volume de Leads Qualificados', before: 'Estagnado', after: '+ 150%', trend: 'up', insight: 'Implementação de CRM e Geração de Demanda Avançada que gerou um salto expressivo no funil de MQLs.' },
      { company: 'SaaS Funnels', metric: 'Motor de Aquisição', before: '100% Outbound', after: 'Hub Pred.', trend: 'up', insight: 'O CEO dependia puramente de outbound. Estruturamos o hub de conversão All-in-One.' },
      { company: 'ENICS (Eventos)', metric: 'Ingressos', before: 'Zero (Lançamento)', after: '3.000 Sold Out', trend: 'up', insight: 'Sold Out absoluto: 3.000 ingressos vendidos em 30 dias através de funil proprietário.' }
    ];

    crm_data.live_proposal.platform_cost = "Custo Zero";

    // Update DB
    const { error: updateErr } = await supabase
      .from('proposals')
      .update({ crm_data: crm_data })
      .eq('id', p.id);

    if (updateErr) {
      console.error(`Failed to update ${p.id}:`, updateErr);
    } else {
      console.log(`Proposal ${p.id} successfully updated!`);
    }
  }
}

fixAll();
