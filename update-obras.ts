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

  if (error || !data?.length) {
    console.error('Error fetching proposals:', error);
    process.exit(1);
  }

  const proposal = data[0];
  const crm_data = proposal.crm_data || {};
  if (!crm_data.live_proposal) crm_data.live_proposal = {};

  // Update Deliverables
  crm_data.live_proposal.deliverables = [
    {
      category: 'Inbound & Outbound Híbrido',
      items: [
        'LinkedIn Founder-led Growth (2 posts/semana)',
        '1 Lead Magnet Rico / mês (12 no ano)',
        'Automações e Nutrição de Materiais Ricos',
        'Criação de Landing Pages de Captura'
      ]
    },
    {
      category: 'Máquina B2B (Funnels & Zoho)',
      items: [
        'Engajamento via WhatsApp e Emails Transacionais no Funnels',
        'Configuração da API Oficial do WhatsApp na Funnels',
        'Hand-off de Oportunidades Integrado via Zoho CRM',
        'Onboarding da Operação Atual (Rumo a 100% Funnels no Futuro)'
      ]
    },
    {
      category: 'Governança & Tracking',
      items: [
        'Mapeamento Comportamental dos Leads',
        'Dashboards de Métricas de Criação vs. Conversão',
        'Estratégia de Aquisição Multicanal Sincronizada',
        'Monitoramento de Qualificação de Leads (Lead Scoring)'
      ]
    }
  ];

  // Update Comparisons
  crm_data.live_proposal.comparisons = [
    { tool: 'Ferramentas de Postagem (Buffer/Hootsuite)', oldCost: 'R$ 200/mês' },
    { tool: 'Ferramentas Avulsas de Automação (Make/Zapier)', oldCost: 'R$ 574/mês' },
    { tool: 'Ferramentas de E-mail (ActiveCampaign/Mailchimp)', oldCost: 'R$ 450/mês' },
    { tool: 'CRM Desconectado das Redes', oldCost: 'R$ 300/mês' },
    { tool: 'Múltiplas Faturas e Silos de Dados', oldCost: 'Incalculável/mês' }
  ];
  crm_data.live_proposal.comparison_old_total = '> R$ 18.288 / ano';

  // Update Cases
  crm_data.live_proposal.cases = [
    {
      company: 'Broas Online (Benchmark Futuro)',
      metric: 'Geração Inbound via LinkedIn',
      before: 'Esforço Manual',
      after: 'Máquina Escalável',
      trend: 'up',
      insight: 'Estratégia de prospectar através da marca do Founder com 12 materiais ricos rodando na máquina.'
    },
    {
      company: 'Cases do Site (ENICS)',
      metric: 'Venda Rápida B2B',
      before: 'Estagnada',
      after: '3 Mil Vendas',
      trend: 'up',
      insight: 'Motor de remarketing dinâmico multicanal e disparo ativo com API Oficial do WhatsApp.'
    },
    {
      company: 'Cases do Site (Universidade Cruzeiro do Sul)',
      metric: 'Multidisciplinar B2B',
      before: 'Alta Fricção',
      after: '47K Leads',
      trend: 'up',
      insight: 'Redução drástica do custo de aquisição unificando o ataque de ponta a ponta.'
    }
  ];

  // Update Roadmap sprints (we have 12 months)
  crm_data.live_proposal.sprints = [
    { title: 'Setup da IA e Integração Inicial (Zoho & Funnels)', description: 'Mapeamos o fluxo ideal. A Funnels assume engajamento e marketing (WhatsApp/Email), integrando oportunidades perfeitamente com a operação no Zoho.' },
    { title: 'Tração Híbrida Founder-Led', description: 'Ativação do calendário editorial do Founder: 2 publicações semanais e lançamento do 1º material rico mensal para capturar contatos.' },
    { title: 'Automações de Engajamento e Nutrição', description: 'Máquina ligada: todo lead que baixa os materiais passa pelas automações de disparo de WhatsApp e e-mail via Funnels, mapeando temperatura.' },
    { title: 'Maturidade Omnichannel (Rumo a 100% Funnels)', description: 'Após 12 meses (12 Lead Magnets rodando), os processos internos estarão amadurecidos e a avaliação se o ecossistema Funnels absorve toda a operação será clara.' }
  ];

  const { error: updErr } = await supabase.from('proposals').update({ crm_data }).eq('id', proposal.id);
  if (updErr) {
    console.error('Error updating:', updErr);
    process.exit(1);
  }
  
  console.log('Successfully updated latest Obras Online proposal:', proposal.slug);
}

run();
