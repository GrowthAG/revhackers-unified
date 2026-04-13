import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env' });

const supabase = createClient(
  process.env.VITE_SUPABASE_URL || '',
  process.env.VITE_SUPABASE_ANON_KEY || ''
);

async function run() {
  console.log('Fetching Sarah Penido project...');
  const { data: projects, error: fetchErr } = await supabase
    .from('rei_projects')
    .select('id, client_company, client_name')
    .ilike('client_name', '%Sara%');

  if (fetchErr) {
    console.error('Error fetching project:', fetchErr);
    return;
  }

  if (!projects || projects.length === 0) {
    console.error('Sarah Penido project not found.');
    return;
  }

  const sarahProject = projects[0];
  console.log(`Found project: ${sarahProject.id} (${sarahProject.client_name})`);

  const { data: plans, error: planErr } = await supabase
    .from('strategic_plans')
    .select('id, diagnostic_data, manual_overrides')
    .eq('rei_project_id', sarahProject.id);

  if (planErr) {
    console.error('Error fetching strategic plan:', planErr);
    return;
  }

  if (!plans || plans.length === 0) {
    console.error('No strategic plan found for Sarah Penido.');
    return;
  }

  const plan = plans[0];
  console.log(`Found plan ID: ${plan.id}. Updating manual overrides...`);

  const existingOverrides = plan.manual_overrides || {};

  // Inject the specific content from prints
  const newOverrides = {
    ...existingOverrides,
    diagnostic_data: {
      ...(existingOverrides.diagnostic_data || {}),
      context_mirror: {
        segment: 'Arquitetura / Varejo Físico',
        objective: 'Centralizar receita e criar previsibilidade',
        maturity: 'Inicial (Agendor, automações básicas, stack solta)',
        restrictions: 'Volume vs Capacidade de Atendimento Lenta'
      },
      executive_summary: {
        context: 'A empresa atua em arquitetura comercial B2B, intermediando arquitetos com empreendedores de diversos segmentos. Hoje tem maturidade operacional inicial, usa Agendor como CRM central, automações básicas e stack desconexa.',
        problem: 'O gargalo central é a operação de receita fragmentada: 1 pessoa faz SDR e closer, a cadência está caótica, não existe lead scoring e a passagem de bastão é descrita como frustrante. O custo de não agir é alto: perda de velocidade, dados sujos, deals sem motivo claro de perda e dependência crítica de uma única pessoa.',
        solution: 'A RevHackers irá conduzir um projeto técnico de CRM Ops ao longo de 30 dias, com centralização no Funnels, revisão dos funis de vendas e afiliados, definição de automações, especialmente na passagem de bastão e implementação de uma governança semanal orientada a dados. A condução seguirá etapas de embarque, kickoff, estruturação, adoção, revisão e expansão, com definição de SLA, padronização de campos obrigatórios, criação de painéis e rotinas de higiene de dados.',
        expected_outcome: 'O objetivo é manter o CAC real em R$ 900 com mais previsibilidade, elevar a taxa de conversão acima dos 7% atuais, reduzir perdas por ghosting e ICP ruim e levar o preenchimento obrigatório do CRM para acima de 95% em 30 dias.'
      },
      signals: [
        {
          text: 'CAC atual de R$ 900, abaixo do benchmark médio do segmento de R$ 1.980.',
          impact: 'A empresa já adquire clientes com eficiência 54,5% melhor que a média de mercado, o que precisa ser preservado ao centralizar a operação.'
        },
        {
          text: 'Ciclo médio de vendas de 7 dias, muito abaixo do benchmark de 41 dias.',
          impact: 'Existe velocidade comercial rara no segmento, mas sem governança ela pode virar perda de qualidade e retrabalho.'
        },
        {
          text: '01 pessoa fazendo sdr e closer dentro da operação.',
          impact: 'Concentração total do funil em uma pessoa aumenta risco de gargalo, queda de resposta e limitação direta de escala.'
        },
        {
          text: 'Cadência comercial caótica.',
          impact: 'Cadência desorganizada aumenta ghosting, reduz taxa de conversão e impede leitura real de estagnação por etapa.'
        },
        {
          text: 'Passagem de bastão ruim apontada.',
          impact: 'A passagem de bastão ruim eleva retrabalho interno, piora experiência do cliente e aumenta risco de churn ligado a onboarding deficiente.'
        },
        {
          text: 'Qualificação de leads quase inexistente.',
          impact: 'Sem filtro de entrada, o time gasta capacidade escassa em leads ruins e contamina a taxa de conversão real.'
        },
        {
          text: 'Governança de dados não existe.',
          impact: 'Ninguém cuida da higiene de dados, criando risco crítico de decisão errada e previsão de receita falsa.'
        },
        {
          text: 'SLA de resposta ao lead invisível.',
          impact: 'A velocidade de resposta parece boa pela percepção empírica, mas precisa sair do empirismo ou achismo para o contexto de um dado dentro do CRM auditável.'
        }
      ],
      risks: [
        {
          text: 'Dependência operacional de uma única pessoa para prospecção e fechamento.',
          mitigation: 'Separar responsabilidades por etapa no Funnels, criar tarefas automáticas por estágio, limitando a operação baseada na memória.'
        },
        {
          text: 'Ausência de critérios claros de qualificação (ICP, motivo de perda, origem).',
          mitigation: 'Implementar campos obrigatórios no CRM em etapas específicas, forçando a coleta de dados antes do envio de proposta.'
        },
        {
          text: 'Inexistência de SLA para velocidade de reposta e passagem de bastão.',
          mitigation: 'Automatizar alertas de leads parados por etapa de dias e criar workflows de e-mails para propostas não respondidas entre SDR/Closer e Pós-Venda.'
        },
        {
          text: 'Perda de previsibilidade de receita devido a dados fragmentados.',
          mitigation: 'Implementar rituais de acompanhamento e auditoria de pipeline semanais, reduzindo risco de deals ociosos sem follow-up.'
        },
        {
          text: 'Risco de redução da percepção de valor do lead.',
          mitigation: 'Implementar comunicação sistemática no pipeline de vendas (SPO) para garantir proximidade com potenciais parcerias.'
        },
        {
          text: 'Risco de erro no cálculo do CAC real e LTV:CAC.',
          mitigation: 'Conectar funil da RD/Active com Funnels e garantir tagueamento ponta a ponta nas fontes de tráfego, eliminando métricas soltas.'
        }
      ],
      decisions: [
        {
          title: 'Centralizar toda operação no Funnels',
          recommendation: 'Migrar do Agendor/ClickUp para um CRM unificado com pipeline de oportunidades e área de vendas separada de acompanhamento, reduzindo perda de informação em integrações gambiarra.',
          basedOn: ['Sinais Estratégicos', 'Causa Raiz']
        },
        {
          title: 'Cortar operação comercial baseada em memória',
          recommendation: 'Forçar preenchimento de campos obrigatórios do CRM definindo processos que travam caso não cumpridos.',
          basedOn: ['Volume', 'Conversão']
        },
        {
          title: 'Estruturar o funil de indicações de vendas a partir das imobiliárias ou corretores',
          recommendation: 'Criar funil específico de afiliados no Funnels com disparo de material, formulário automático de recomendação para parceiros.',
          basedOn: ['Modelagem']
        },
        {
          title: 'Desenhar passagem de bastão escalável',
          recommendation: 'Mapear a transição entre SDR/Closer/Onboarding, automatizando registro de expectativas para liberar tempo.',
          basedOn: ['Custos']
        }
      ],
      current: [
        'Operação com uma pessoa dependendo da memória.',
        'Ausência de campos obrigatórios de qualificação.',
        'Cadência improvisada por WhatsApp e ligação.',
        'Passagem de bastão complexa, gerando desgaste interno e frustração.',
        'Sem governança clara sobre higiene do CRM ou métricas validadas de perda.'
      ],
      future: [
        'CRM centralizado coordenando as responsabilidades de SDR, Closer e CS.',
        'Avanço no funil bloqueado sem critérios objetivos preenchidos.',
        'Cadência guiada, rastreada com alertas por SLA em tarefas agendadas.',
        'Onboarding automático com passagem de bastão documentada no CRM.',
        'Revisão periódica (weekly) guiada por dados confiáveis do pipeline validadas.'
      ],
      thesis_statement: 'Para centralizar a operação de receita sem perder a velocidade comercial que já existe, precisamos construir Máquina de Receita com CRM, cadência e passagem de bastão disciplinados para um negócio de arquitetura comercial que hoje ainda depende demais de uma única pessoa.',
      thesis_pillars: [
        {
          title: 'Centralização do Funil e do ICP',
          description: 'Estruturar o funil no CRM com campos obrigatórios e critérios claros de qualificação, evoluindo o perfil ideal de cliente (ICP) com base nos dados reais da operação. O objetivo é reduzir desperdício com leads fora do perfil, aumentar a eficiência do time e proteger a taxa de conversão.',
          actions: [
            'Criar pontuação de leads por nicho, porte, urgência, número de unidades e aderência ao varejo físico.',
            'Bloquear avanço para proposta sem preenchimento de ICP, decisor econômico e necessidade do projeto.',
            'Medir taxa de conversão por origem e por perfil qualificado já na primeira quinzena.'
          ]
        },
        {
          title: 'Cadência Comercial e Passagem de Bastão Estruturadas',
          description: 'Estruturar a cadência comercial e a passagem de bastão entre etapas com critérios claros, automações e registro no CRM, reduzindo dependência operacional, retrabalho e perda de informação ao longo do processo.',
          actions: [
            'Automatizar alertas para lead sem contato, proposta sem resposta e negócio parado por etapa.',
            'Criar formulário interno de passagem de bastão disparado no fechamento do negócio.',
            'Acompanhar tempo médio por etapa e taxa de resposta em revisão semanal.'
          ]
        },
        {
          title: 'Gestão de Receita e Previsibilidade',
          description: 'Criar visibilidade das métricas comerciais no CRM e estruturar rotinas de acompanhamento, permitindo evoluir a previsibilidade de receita e reduzir a dependência de controles manuais.',
          actions: [
            'Definir responsável nominal pela higiene de dados e rotina de auditoria semanal.',
            'Implantar painel com conversão, estagnação, motivos de perda, preenchimento do CRM e previsão de receita.',
            'Documentar o Manual Operacional para reduzir dependência da pessoa que hoje concentra SDR e closer.'
          ]
        }
      ]
    },
    persona_data: {
      ...(existingOverrides.persona_data || {}),
      industry_trends: [
        'Expansão do varejo de saúde, beleza e franquias com padronização arquitetônica multiunidade: Redes de farmácias, clínicas de estética, cosméticos e franquias seguem expandindo no Brasil com necessidade de replicar layout, experiência de marca e eficiência operacional em várias unidades. Para uma operação como a da Sarah Penido, isso aumenta a demanda por intermediação entre empreendedores e arquitetos com capacidade de entregar projeto padronizado, aprovação rápida e implantação escalável.'
      ]
    },
    premises_data: {
      ...(existingOverrides.premises_data || {}),
      context: 'Operação B2B de arquitetura comercial com foco em varejo físico (farmácias, cosméticos e negócios com múltiplas unidades)\nMRR atual de R$ 75.000, ticket médio de R$ 8.000, CAC atual de R$ 900, ciclo de 7 dias e taxa de conversão de 7%.\nUma única pessoa faz SDR e closer, com cadência caótica e passagem de bastão ruim.\nPerdas por ICP ruim, ghosting, verba, prazo e motivo vazio mostram falha de qualificação e governança.',
      tech_stack: 'Agendor como estrutura atual e Funnels como camada central de operação de receita.\nUnificação dos canais de entrada (formulários e bot de qualificação) em um único fluxo de registro no CRM.\nRastreamento obrigatório de origem, etapa, decisor econômico, motivo de perda e dados de fechamento no CRM.\nAutomação prioritária para alertas de leads parados, propostas sem retorno e passagem de bastão para o pós-venda.',
      short_term_goals: 'Alcançar mais de 95% de preenchimento obrigatório do CRM em até 30 dias.\nReduzir perdas por leads fora do perfil com critérios de qualificação (lead scoring) e filtro antes do envio de proposta.\nImplantar revisão semanal do pipeline com leitura de estagnação por etapa e previsão de receita confiável.\nImplantar revisão semanal do pipeline com análise de estagnação por etapa e evolução da previsibilidade de receita.',
      mutual_commitments: [
        'Reuniões de Kickoff e Onboarding — Revisão, alinhamento, definição de prioridades e táticas',
        'Disponibilização de materiais e aprovações em até 48h',
        'Compartilhamento de acessos (CRM, Ads e Analytics)',
        'Compartilhamento de resultados para fechamento do loop de atribuição.'
      ]
    }
  };

  const { error: updateErr } = await supabase
    .from('strategic_plans')
    .update({ manual_overrides: newOverrides })
    .eq('id', plan.id);

  if (updateErr) {
    console.error('Error updating plan:', updateErr);
  } else {
    console.log('Sarah Penido Strategic Plan successfully updated with manual overrides!');
  }
}

run();
