import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env') });
const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const { data: proposals, error } = await supabase
    .from('proposals')
    .select('id, client_name, slug, crm_data')
    .ilike('client_name', '%Obras Online%');

  if (error || !proposals?.length) {
    console.error('Error fetching proposals:', error);
    process.exit(1);
  }

  for (const proposal of proposals) {
    let crm_data = proposal.crm_data || {};
    if (!crm_data.live_proposal) crm_data.live_proposal = {};

    // 1. Deliverables
    crm_data.live_proposal.deliverables = [
      {
        category: 'Conteúdo & Geração (LinkedIn)',
        items: [
          'Founder-Led Growth no LinkedIn',
          '2 Publicações/Semana no perfil do Founder',
          'Criação de 1 Lead Magnet Rico / mês (12 no ano)',
          'Páginas focadas exclusivas para Downloads'
        ]
      },
      {
        category: 'Máquina Funnels (Automação)',
        items: [
          'Integração oficial WhatsApp API via Funnels',
          'E-mails transacionais e nutrição no Funnels',
          'Automações conectadas aos downloads de materiais',
          'Retenção de Engajamento 100% no ecossistema Funnels'
        ]
      },
      {
        category: 'Hand-off & Integração Zoho',
        items: [
          'Integração de Oportunidades Funnels <> Zoho CRM',
          'Zero interferência: vocês continuam operando o Zoho',
          'Nós cuidamos da engenharia do Funnels do zero',
          'Alinhamento visando migração total ao Funnels no futuro'
        ]
      }
    ];

    // 2. Comparisons
    crm_data.live_proposal.comparisons = [
      { tool: 'Ferramentas E-mail Avulsas (RD/Active)', oldCost: 'R$ 450/mês', newTool: 'Funnels: E-mails Transacionais & Nutrição' },
      { tool: 'Agendadores soltos (Calendly)', oldCost: 'R$ 80/mês', newTool: 'Funnels: Agendamento Imersivo' },
      { tool: 'Automações via Zapier / Make', oldCost: 'R$ 574/mês', newTool: 'Funnels: Workflows de Engajamento Nativos' },
      { tool: 'Chatbots Terceirizados (Manychat)', oldCost: 'R$ 150/mês', newTool: 'Funnels: WhatsApp API Oficial' },
      { tool: 'Silos de Dados sem Integração', oldCost: 'Ineficiência Máxima', newTool: 'Integração de Continuidade Funnels <> Zoho' }
    ];
    crm_data.live_proposal.comparison_old_total = '> R$ 15.000 / ano';

    // 3. Cases
    crm_data.live_proposal.cases = [
      {
        company: 'Obras Online (Seu Benchmark Final)',
        metric: 'Geração Inbound via LinkedIn',
        before: 'Desconectada',
        after: 'Máquina Escalável',
        trend: 'up',
        insight: 'Com a máquina girando os 12 lead magnets anuais, os curiosos viram oportunidades quentes direto no Zoho.'
      },
      {
        company: 'Cases do Site (ENICS)',
        metric: 'Venda Rápida B2B',
        before: 'Estagnada',
        after: '3 Mil Vendas',
        trend: 'up',
        insight: 'Motor de remarketing dinâmico e workflows de conversão via API Oficial do WhatsApp no Funnels.'
      },
      {
        company: 'Cases do Site (Cruzeiro do Sul)',
        metric: 'Volume B2B',
        before: 'Alta Fricção',
        after: '47K Leads',
        trend: 'up',
        insight: 'Ecossistema resolvido de ponta a ponta: páginas de alta navegação e funis integrados nativamente.'
      }
    ];

    // 4. Roadmap (IMPORTANT: using "roadmap", not "sprints")
    crm_data.live_proposal.roadmap = [
      {
        duration: 'Mês 1 a 3',
        phase: 'Piloto Funnels & LinkedIn Founder-Led',
        description: 'Start no LinkedIn do Founder (2 posts/semana). Desenvolvimento do 1º Lead Magnet e da página de Mídia para download. Setup da API oficial do WhatsApp no Funnels.',
        deliverables: ['Página de Download de Materiais', 'Setup Funnels WhatsApp API']
      },
      {
        duration: 'Mês 4 a 6',
        phase: 'Workflows de Nutrição e Repasse Zoho',
        description: 'O volume de downloads de materiais ricos alimenta os workflows da Funnels. O lead passa por e-mails transacionais e engajamentos do WhatsApp, e quando se torna oportunidade, cai direto no ZOHO da equipe comercial de vocês.',
        deliverables: ['Integração Oportunidades Funnels <> Zoho', 'Workflows E-mail/WPP']
      },
      {
        duration: 'Mês 7 a 9',
        phase: 'Escalada da Esteira de Conteúdo',
        description: 'Chegamos ao marco de metade dos Lead Magnets do ano rodando. A máquina de atração orgânica já retroalimenta a base de dados do Funnels sem custo de tráfego dependente.',
        deliverables: ['Consolidação da Autoridade B2B', 'Aumento de Leads Inbound']
      },
      {
        duration: 'Mês 10 a 12',
        phase: 'Maximização B2B e Absorção Tecnológica',
        description: 'Os 12 Lead Magnets estão ativos cruzando dados. Com o processo de vendas maduro dentro do Zoho e sendo alimentado magicamente pelas lógicas do Funnels, avaliaremos em conjunto o avanço para absorção 100% da operação pelo próprio Funnels.',
        deliverables: ['Auditoria de Migração Funnels', 'Ecossistema 100% Operacional']
      }
    ];

    crm_data.live_proposal.roadmap_headline = 'Cronograma de 12 Meses';
    crm_data.live_proposal.roadmap_subheadline = 'Os passos lógicos para tracionar via LinkedIn gerando repasses consistentes para o Zoho.';

    await supabase.from('proposals').update({ crm_data }).eq('id', proposal.id);
    console.log(`Updated proposal: ${proposal.slug}`);
  }
}

run();
