/**
 * Base de Conhecimento — Frameworks Estratégicos
 *
 * Conceitos extraídos de livros de referência que informam a geração
 * de planos estratégicos pela IA. Esses frameworks são injetados
 * no prompt do GPT-4o para garantir que os planos sejam fundamentados
 * em metodologias comprovadas.
 *
 * Fontes:
 * - "Onboarding Orquestrado" — Donna Weber
 * - "Receita Previsível" — Aaron Ross & Marylou Tyler
 * - "Rápido e Devagar" — Daniel Kahneman
 * - "Customer Success" — Dan Steinman, Lincoln Murphy & Nick Mehta
 * - "The Trusted Advisor" — David Maister
 */

// ─── Onboarding Orquestrado (Donna Weber) ─────────────────────────────
// A metodologia que fundamenta toda a jornada de onboarding da RevHackers
export const ONBOARDING_ORQUESTRADO = {
  source: 'Onboarding Orquestrado — Donna Weber',

  // As 6 Etapas do Onboarding Orquestrado
  stages: [
    {
      name: 'Embarque',
      phase: 'Pré-venda',
      description: 'Começa antes do fechamento. Alinhar expectativas, definir sucesso e preparar a transição de vendas para CS.',
      keyActions: [
        'Definir resultados de negócio desejados pelo cliente',
        'Mapear stakeholders e decisores',
        'Criar Plano de Sucesso inicial com visão do cliente',
        'Identificar riscos de implementação antecipadamente',
      ],
    },
    {
      name: 'Passagem de Bastão',
      phase: 'Transição Vendas → CS',
      description: 'Transferência estruturada de contexto entre vendas e equipe de implementação. O momento mais crítico e mais negligenciado.',
      keyActions: [
        'Reunião formal de handoff com vendas + CS + cliente',
        'Documentar tudo que foi prometido na venda',
        'Transferir Plano de Sucesso para equipe de implementação',
        'Confirmar cronograma e expectativas com o cliente',
      ],
    },
    {
      name: 'Kickoff',
      phase: 'Semana 1',
      description: 'Sessão de alinhamento formal. Define escopo, cronograma, papéis e o primeiro "quick win" para gerar momentum.',
      keyActions: [
        'Apresentar equipe e papéis (RACI)',
        'Validar objetivos de negócio e métricas de sucesso',
        'Definir cronograma detalhado dos primeiros 30 dias',
        'Coletar acessos, credenciais e informações técnicas',
        'Estabelecer cadência de comunicação (semanal/quinzenal)',
      ],
    },
    {
      name: 'Adoção',
      phase: 'Semana 2-8',
      description: 'Implementação técnica + treinamento + primeiros resultados. O objetivo é levar o cliente ao "primeiro valor" o mais rápido possível.',
      keyActions: [
        'Configurar infraestrutura técnica (CRM, tracking, automações)',
        'Treinar equipe do cliente nos processos e ferramentas',
        'Monitorar adoção real (não apenas treinamento dado)',
        'Celebrar marcos e quick wins para manter engajamento',
        'Ajustar plano com base no feedback do uso real',
      ],
    },
    {
      name: 'Revisão',
      phase: 'Mês 2-3',
      description: 'Avaliar progresso vs. objetivos. Identificar gaps, ajustar estratégia e preparar para autonomia do cliente.',
      keyActions: [
        'Revisão formal de OKRs e métricas definidas no kickoff',
        'Comparar resultados reais vs. projeções iniciais',
        'Identificar gargalos de adoção e planejar correções',
        'Atualizar Plano de Sucesso com aprendizados',
        'Iniciar transição para modo de suporte/governança',
      ],
    },
    {
      name: 'Expansão',
      phase: 'Mês 3+',
      description: 'Transição para crescimento contínuo. O cliente opera com autonomia e a relação evolui para expansão e renovação.',
      keyActions: [
        'Documentar playbook operacional para o cliente',
        'Entregar relatório de resultados consolidado',
        'Identificar oportunidades de expansão (upsell/cross-sell)',
        'Estabelecer cadência de revisão trimestral',
        'Gerar caso de sucesso para pipeline da agência',
      ],
    },
  ],

  // Insights fundamentais
  keyInsights: [
    'Mais da metade do churn está vinculado a onboarding e atendimento deficientes — custa US$136B/ano nos EUA.',
    'Onboarding NÃO é implementação técnica. É a jornada completa de levar o cliente ao sucesso.',
    'A janela crítica são os primeiros 90 dias — depois disso o padrão de uso está definido.',
    'Remorso do comprador afeta 82% das pessoas — o onboarding é o antídoto.',
    'A esperança não é uma estratégia. Planeje cada etapa com entregáveis concretos.',
    'O Plano de Sucesso deve incluir: visão do cliente, resultados desejados, cronograma, papéis e responsabilidades.',
  ],
};

// ─── Receita Previsível (Aaron Ross) ──────────────────────────────────
// Fundamenta a estrutura de geração de demanda e pipeline dos planos
export const RECEITA_PREVISIVEL = {
  source: 'Receita Previsível — Aaron Ross & Marylou Tyler',

  // Os 3 Pilares
  pillars: [
    {
      name: 'Geração Previsível de Leads',
      description: 'Não depender de indicações ou do founder. Criar máquina sistemática de geração de oportunidades.',
      framework: 'Seeds (orgânico/referral) + Nets (marketing/inbound) + Spears (outbound/prospecção ativa)',
    },
    {
      name: 'Especialização de Funções',
      description: 'Vendedores não devem prospectar. Criar equipe dedicada de SDRs entre marketing e vendas.',
      framework: 'SDR (prospecção) → AE (fechamento) → CS (gestão de conta)',
    },
    {
      name: 'Sistemas de Vendas Eficazes',
      description: 'Processos documentados, métricas claras e ferramentas adequadas para cada etapa.',
      framework: 'CRM + cadências automatizadas + lead scoring + dashboards de pipeline',
    },
  ],

  // Cold Calling 2.0
  coldCalling2: {
    principle: 'Nunca ligue para quem não te conhece. Email primeiro, telefone depois.',
    steps: [
      'Definir ICP (Ideal Customer Profile) com precisão cirúrgica',
      'Enviar email curto e personalizado pedindo referência interna',
      'Follow-up por telefone apenas após demonstração de interesse',
      'SDR qualifica e agenda — AE fecha',
    ],
  },

  // 7 Erros Fatais
  fatalMistakes: [
    'Ignorar responsabilidade de geração de leads',
    'Atribuir prospecção a Account Executives',
    'Investir pouco em talentos',
    'Não rastrear métricas por etapa do funil',
    'Depender de um único canal de aquisição',
    'Não ter ICP definido',
    'Pular etapas do funil (lead direto para fechamento)',
  ],

  keyInsights: [
    'Receita previsível não é sobre crescer rápido — é sobre crescer de forma sistemática e repetível.',
    'A metodologia levou a Salesforce a ultrapassar US$100M em receita recorrente.',
    'Seeds são os melhores leads (referral), Nets capturam volume (marketing), Spears são cirúrgicos (outbound).',
    'O "Vale da Morte" é a transição de crescimento orgânico para crescimento previsível — a maioria das empresas morre aqui.',
  ],
};

// ─── Rápido e Devagar (Daniel Kahneman) ──────────────────────────────
// Fundamenta como comunicamos valor e estruturamos decisões nos planos
export const RAPIDO_E_DEVAGAR = {
  source: 'Rápido e Devagar: Duas Formas de Pensar — Daniel Kahneman',

  systems: {
    system1: {
      name: 'Sistema 1 — Rápido',
      characteristics: 'Automático, intuitivo, emocional, sem esforço',
      relevance: 'Decisões de compra impulsivas, primeira impressão do plano estratégico, reação ao design do onboarding',
    },
    system2: {
      name: 'Sistema 2 — Devagar',
      characteristics: 'Deliberado, analítico, baseado em regras, requer esforço',
      relevance: 'Análise de ROI, avaliação de OKRs, decisão de aprovação do plano',
    },
  },

  biasesRelevantes: [
    { name: 'Ancoragem', application: 'Primeiro número apresentado define referência. Mostrar benchmark do setor ANTES do diagnóstico.' },
    { name: 'Efeito Halo', application: 'Primeira impressão do kickoff define percepção de todo o projeto. Investir no impacto visual.' },
    { name: 'Aversão à Perda', application: 'Pessoas temem perdas 2x mais que valorizam ganhos. Mostrar o custo de NÃO agir.' },
    { name: 'Viés de Confirmação', application: 'Cliente busca confirmar o que já acredita. Alinhar linguagem do plano com framework dele.' },
    { name: 'Facilidade Cognitiva', application: 'Quanto mais fácil de entender, mais confiável parece. Planos visuais e limpos vencem.' },
  ],

  keyInsights: [
    'Até 95% do tempo estamos no piloto automático (Sistema 1). O plano estratégico precisa ser visualmente claro para o Sistema 1 processar.',
    'Empresas são melhores que indivíduos para evitar vieses — por isso processos estruturados (checklists, reviews) são cruciais.',
    'A dor de perder R$1 é sentida 2x mais do que o prazer de ganhar R$1. Use "custo da inação" no diagnóstico.',
    'Checklist e frameworks reduzem erros cognitivos. Cada etapa do onboarding deve ter checklist explícito.',
  ],
};

// ─── Customer Success (Steinman, Murphy, Mehta) ──────────────────────
export const CUSTOMER_SUCCESS = {
  source: 'Customer Success — Dan Steinman, Lincoln Murphy & Nick Mehta',

  principles: [
    'Customer Success é receita. Retenção e expansão são mais baratos que aquisição.',
    'Segmentar clientes por potencial de valor, não só por receita atual.',
    'Health Score combina dados de uso, engajamento e satisfação para prever churn.',
    'Primeiro valor (Time to First Value) é a métrica mais importante do onboarding.',
    'Proatividade > Reatividade. Intervir antes do cliente reclamar.',
  ],

  healthScoreDimensions: [
    'Adoção do produto (frequência de uso, features ativas)',
    'Engajamento (participação em calls, respostas a emails)',
    'Satisfação (NPS, CSAT, feedback qualitativo)',
    'Resultados de negócio (ROI alcançado vs. prometido)',
    'Relacionamento (acesso a decisores, confiança)',
  ],
};

// ─── Função para gerar contexto de frameworks para o prompt da IA ────
export function generateFrameworkContext(projectType: string): string {
  const sections: string[] = [];

  // Sempre incluir Onboarding Orquestrado (base do produto)
  sections.push(`
FRAMEWORK BASE — ONBOARDING ORQUESTRADO (Donna Weber):
O onboarding segue 6 etapas: ${ONBOARDING_ORQUESTRADO.stages.map(s => s.name).join(' → ')}.
Cada etapa do plano deve mapear para essas fases.
Insight crítico: ${ONBOARDING_ORQUESTRADO.keyInsights[0]}
A janela crítica são os primeiros 90 dias.`);

  // Consulting/CRM: incluir Receita Previsível
  if (['consulting', 'crm_ops', 'funnel'].includes(projectType)) {
    sections.push(`
FRAMEWORK — RECEITA PREVISÍVEL (Aaron Ross):
3 tipos de leads: Seeds (referral) + Nets (inbound) + Spears (outbound).
Especialização: SDR (prospecta) → AE (fecha) → CS (retém).
Erros fatais: atribuir prospecção a vendedores, não ter ICP, depender de um canal.
O plano deve considerar essa estrutura ao propor geração de demanda e pipeline.`);
  }

  // Todos: vieses cognitivos relevantes
  sections.push(`
FRAMEWORK — VIESES COGNITIVOS (Kahneman):
- Aversão à perda: mostre o custo de NÃO agir (2x mais impactante que ganhos).
- Ancoragem: apresente benchmarks do setor ANTES do diagnóstico.
- Facilidade cognitiva: planos visuais e limpos são mais confiáveis.
Use esses vieses para estruturar o diagnóstico e as recomendações.`);

  return sections.join('\n');
}
