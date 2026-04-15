/**
 * task-templates.ts
 *
 * Fonte da verdade para toda a estrutura de sprints e tarefas
 * por tipo de projeto e duracao.
 *
 * tipo x duracao → temas das sprints + tarefas por sprint
 *
 * Regras de negocio embutidas:
 * - consulting 30d / 60d → free tier (add-on do plano anual)
 * - consulting 90d / 180d / 360d → paid
 * - site 30d / 60d → paid
 * - linkedin 90d / 180d / 360d → paid
 * - founder 90d / 180d / 360d → paid
 * - crm_ops 30d / 60d / 90d → paid
 *
 * Combinacoes validas:
 *   consulting: 30, 60, 90, 180, 360
 *   site:       30, 60
 *   linkedin:   90, 180, 360
 *   founder:    90, 180, 360
 *   crm_ops:    30, 60, 90
 */

// ─── Tipos base ───────────────────────────────────────────────────────────

export type ProjectType = 'consulting' | 'site' | 'linkedin' | 'crm_ops';
export type DurationDays = 30 | 60 | 90 | 180 | 360;
export type Tier = 'free' | 'paid';

export interface TaskTemplate {
  name: string;
  description: string;
  priority: 1 | 2 | 3 | 4; // 1=urgent 2=high 3=normal 4=low
  tag: string;              // categoria visual
}

export interface SprintTemplate {
  index: number;
  theme: string;
  goal: string;
  tasks: TaskTemplate[];
}

export interface ProjectTemplate {
  type: ProjectType;
  duration_days: DurationDays;
  tier: Tier;
  sprint_count: number;
  sprints: SprintTemplate[];
}

// ─── Tarefas recorrentes (entram em toda sprint de todo projeto) ───────────

export const RECURRING_TASKS: TaskTemplate[] = [
  {
    name: '[RECORRENTE] Check-in semanal com cliente',
    description: `## Recorrente: toda semana\n\n- [ ] Enviar pauta 24h antes\n- [ ] Atualizar dashboard antes da call\n- [ ] Registrar decisoes e proximos passos\n- [ ] Atualizar tarefas no ClickUp apos call`,
    priority: 3,
    tag: 'recorrente',
  },
  {
    name: '[REVIEW] Sprint Review e planejamento da proxima',
    description: `## Fechamento de sprint\n\n- [ ] Comparar entregas vs meta\n- [ ] Registrar impedimentos que ocorreram\n- [ ] Calcular velocidade (tarefas concluidas / total)\n- [ ] Documentar aprendizados\n- [ ] Planejar proxima sprint com o cliente`,
    priority: 2,
    tag: 'review',
  },
];

// ─── Tarefas comuns: review trimestral e renovacao ────────────────────────

function quarterlyReviewTask(sprintIndex: number): TaskTemplate {
  return {
    name: `[QUARTERLY] Review Trimestral - Q${Math.floor(sprintIndex / 3)}`,
    description: `## Review de ${sprintIndex * 30} dias de projeto\n\n- [ ] Resultados vs OKRs do trimestre\n- [ ] Recalibrar estrategia para proximo trimestre\n- [ ] Apresentar relatorio ao cliente\n- [ ] Planejar proximos 3 meses`,
    priority: 1,
    tag: 'quarterly',
  };
}

function renewalTask(): TaskTemplate {
  return {
    name: '[RENOVACAO] Preparar proposta de renovacao ou expansao',
    description: `## Fechamento do ciclo\n\n- [ ] Relatorio de resultados do periodo completo\n- [ ] ROI calculado e documentado\n- [ ] Proposta de renovacao ou upgrade preparada\n- [ ] Call de fechamento agendada com decisor\n\n**Esta tarefa deve ser iniciada 15 dias antes do fim do contrato.**`,
    priority: 1,
    tag: 'renovacao',
  };
}

// ===========================================================================
// CONSULTING 360
// ===========================================================================

const CONSULTING_SPRINT_THEMES: Record<number, string> = {
  1:  'Diagnostico e Fundacao',
  2:  'Ativacao dos Motores',
  3:  'Primeiros Resultados',
  4:  'Escala de Canais',
  5:  'Otimizacao de Funil',
  6:  'Consolidacao',
  7:  'Expansao de Publico',
  8:  'Automacao Avancada',
  9:  'Diversificacao de Canais',
  10: 'Performance e Eficiencia',
  11: 'Expansao e Novos Mercados',
  12: 'Revenue Review Anual',
};

const CONSULTING_S1_PAID: TaskTemplate[] = [
  {
    name: '[META] Objetivo da Sprint 1',
    description: `## Meta\nEntregar o Diagnostico 360 aprovado e a estrategia validada pelo cliente.\n\n- [ ] Diagnostico completo entregue\n- [ ] Alavancas priorizadas\n- [ ] Estrategia aprovada em call\n- [ ] Sprint 2 planejada`,
    priority: 1, tag: 'meta',
  },
  {
    name: '[ACESSO] Coletar acessos de todas as plataformas',
    description: `- [ ] Meta Ads (conta + BM)\n- [ ] Google Ads\n- [ ] GA4 + Search Console\n- [ ] GoHighLevel (sub-conta)\n- [ ] Instagram / LinkedIn\n\n**Entregavel:** planilha de acessos confirmada`,
    priority: 1, tag: 'setup',
  },
  {
    name: '[ACESSO] Instalar stack de tracking',
    description: `- [ ] GTM instalado e publicado\n- [ ] GA4 com eventos customizados (scroll, CTA, form submit)\n- [ ] Meta Pixel + Conversions API\n- [ ] Microsoft Clarity\n- [ ] Validar no GA4 DebugView`,
    priority: 2, tag: 'setup',
  },
  {
    name: '[DIAGNOSTICO] Auditar campanhas pagas (90 dias)',
    description: `- [ ] CPL por canal e campanha\n- [ ] ROAS e CPA\n- [ ] Top 3 criativos e bottom 3\n- [ ] Analise de publicos (overlap, saturacao)\n- [ ] Funil topo -> fundo`,
    priority: 2, tag: 'diagnostico',
  },
  {
    name: '[DIAGNOSTICO] Auditar funil organico',
    description: `- [ ] Palavras-chave posicionadas (Search Console)\n- [ ] Paginas de maior trafego e maior bounce\n- [ ] Backlink profile\n- [ ] Core Web Vitals\n- [ ] Top 5 conteudos por trafego`,
    priority: 2, tag: 'diagnostico',
  },
  {
    name: '[DIAGNOSTICO] Auditar CRM e pipeline comercial',
    description: `- [ ] Taxa de conversao por etapa\n- [ ] Tempo medio em cada etapa\n- [ ] Motivos de perda mais frequentes\n- [ ] Velocidade do primeiro contato\n- [ ] Volume de leads por canal`,
    priority: 2, tag: 'diagnostico',
  },
  {
    name: '[DIAGNOSTICO] Benchmark de 3 concorrentes diretos',
    description: `Para cada concorrente:\n- [ ] Posicionamento e proposta de valor\n- [ ] Canais de aquisicao ativos\n- [ ] Estimativa de trafego (SemRush/Similarweb)\n- [ ] Criativos e angulos de copy recentes\n\n**Entregavel:** tabela comparativa`,
    priority: 3, tag: 'diagnostico',
  },
  {
    name: '[DIAGNOSTICO] Entrega: Relatorio 360 - MILESTONE',
    description: `- [ ] Resumo executivo (1 pagina)\n- [ ] Diagnostico por pilar (Pago / Organico / CRM)\n- [ ] Benchmark\n- [ ] Top 3 alavancas priorizadas\n- [ ] Proximo passo recomendado\n- [ ] Review interno\n- [ ] Apresentacao e aprovacao pelo cliente`,
    priority: 1, tag: 'milestone',
  },
  {
    name: '[ESTRATEGIA] Definir ICP e segmentacao primaria',
    description: `- [ ] Perfil demografico (cargo, empresa, setor, porte)\n- [ ] Top 3-5 dores\n- [ ] Objecoes frequentes\n- [ ] Canais onde o ICP vive\n- [ ] Vocabulario: como ele descreve o problema`,
    priority: 2, tag: 'estrategia',
  },
  {
    name: '[ESTRATEGIA] Aprovar estrategia com cliente - CHECKPOINT',
    description: `## Agenda da call\n- [ ] Apresentar diagnostico (20 min)\n- [ ] Apresentar 3 alavancas priorizadas\n- [ ] Validar budget e recursos disponiveis\n- [ ] Definir KRs para os proximos 90 dias\n- [ ] Aprovar inicio da execucao\n\n**Entregavel:** ata + estrategia assinada`,
    priority: 1, tag: 'checkpoint',
  },
];

const CONSULTING_S1_FREE: TaskTemplate[] = [
  {
    name: '[META] Objetivo da Sprint 1 - Consultoria Free',
    description: `## Meta\nEntregar diagnostico express e 1 recomendacao executada no periodo.\n\n- [ ] Diagnostico rapido concluido\n- [ ] 1 alavanca identificada e em execucao\n- [ ] Relatorio de recomendacoes entregue\n- [ ] Conversa de upgrade para plano 90/180/360 realizada`,
    priority: 1, tag: 'meta',
  },
  {
    name: '[ACESSO] Coletar acessos essenciais',
    description: `- [ ] Meta Ads ou Google Ads (o principal ativo do cliente)\n- [ ] GA4\n- [ ] GoHighLevel (se aplicavel)\n\n**Entregavel:** acessos confirmados em ate 48h`,
    priority: 1, tag: 'setup',
  },
  {
    name: '[DIAGNOSTICO] Diagnostico Express - canais prioritarios',
    description: `Focar nos 2 canais de maior impacto imediato:\n- [ ] Canal principal de aquisicao\n- [ ] Principal gargalo do funil\n- [ ] 1 oportunidade de quick win identificada\n\n**Entregavel:** Relatorio de Diagnostico Express (1 pagina)`,
    priority: 1, tag: 'diagnostico',
  },
  {
    name: '[EXECUCAO] Quick win: primeira acao implementada',
    description: `Com base no diagnostico express, implementar 1 melhoria de alto impacto:\n\n- [ ] Quick win identificado e aprovado pelo cliente\n- [ ] Implementado\n- [ ] Resultado medido e documentado`,
    priority: 1, tag: 'execucao',
  },
  {
    name: '[ENTREGA] Relatorio de Recomendacoes - MILESTONE',
    description: `- [ ] Diagnostico express resumido\n- [ ] Quick win executado e resultado\n- [ ] Proximo passo: o que aconteceria com 90/180/360 dias\n\n**Objetivo:** esta tarefa existe para embasar a conversa de upgrade`,
    priority: 1, tag: 'milestone',
  },
  {
    name: '[UPSELL] Apresentar proposta de continuidade - IMPORTANTE',
    description: `## Esta tarefa e estrategica\nO free tier e o inicio da relacao, nao o fim.\n\n- [ ] Preparar proposta de 90/180/360 dias com base no diagnostico\n- [ ] Apresentar ROI projetado com base no que foi visto\n- [ ] Enviar proposta formal pelo Hub\n\n**Meta:** converter o cliente free em cliente pago`,
    priority: 1, tag: 'upsell',
  },
];

const CONSULTING_S2: TaskTemplate[] = [
  {
    name: '[META] Objetivo da Sprint 2',
    description: `## Meta\nPrimeiros canais ativos gerando dados reais.\n\n- [ ] Pelo menos 2 pilares em execucao\n- [ ] Primeiros leads organicos ou pagos gerados\n- [ ] CRM com fluxo basico configurado`,
    priority: 1, tag: 'meta',
  },
  {
    name: '[PAGO] Estruturar e ativar campanhas de topo de funil',
    description: `- [ ] Definir estrutura de campanhas (awareness + conversao)\n- [ ] Criar publicos customizados e lookalike\n- [ ] Produzir criativos: 3 formatos x 2 angulos\n- [ ] Ativar campanhas\n- [ ] Monitoramento diario na semana 1`,
    priority: 2, tag: 'trafego',
  },
  {
    name: '[ORGANICO] Publicar primeiros conteudos otimizados',
    description: `- [ ] 8 conteudos publicados no mes (blog / LinkedIn / Instagram)\n- [ ] Linkbuilding interno executado\n- [ ] Primeira analise de engajamento`,
    priority: 2, tag: 'organico',
  },
  {
    name: '[CRM] Configurar pipeline e fluxo basico de leads',
    description: `- [ ] Pipeline de vendas definitivo no GHL\n- [ ] Automacao: lead capturado -> primeiro contato (< 5 min)\n- [ ] Sequencia de nurture para leads frios\n- [ ] Treinar time comercial`,
    priority: 2, tag: 'crm',
  },
  {
    name: '[ANALISE] Relatorio de performance da Sprint 2',
    description: `- [ ] CPL por canal\n- [ ] Leads gerados (pago + organico)\n- [ ] Taxa de conversao do pipeline\n- [ ] Comparativo com meta da sprint`,
    priority: 2, tag: 'analise',
  },
];

const CONSULTING_S3: TaskTemplate[] = [
  {
    name: '[META] Objetivo da Sprint 3',
    description: `## Meta\nPrimeiros resultados mensuráveis e funil otimizado.\n\n- [ ] CPL abaixo da meta definida\n- [ ] Pipeline com dados suficientes para otimizacao\n- [ ] Conteudo gerando trafego organico crescente`,
    priority: 1, tag: 'meta',
  },
  {
    name: '[OTIMIZACAO] A/B test de criativos e copys',
    description: `- [ ] Identificar top 3 anuncios (CTR + conversao)\n- [ ] Criar variacoes do hook e visual\n- [ ] Rodar teste por 14 dias\n- [ ] Pausar bottom 30% e escalar top performers`,
    priority: 2, tag: 'trafego',
  },
  {
    name: '[OTIMIZACAO] Otimizar funil de conversao',
    description: `- [ ] Mapear drop-offs do funil no GA4\n- [ ] Propor e implementar 3 melhorias na landing/site\n- [ ] Melhorar velocidade de resposta do pipeline\n- [ ] Ajustar sequencia de nurture com base em dados`,
    priority: 2, tag: 'funil',
  },
  {
    name: '[CONTEUDO] Dobrar producao de conteudo de autoridade',
    description: `- [ ] 12 conteudos publicados no mes\n- [ ] 2 conteudos de alto valor (case, guia, comparativo)\n- [ ] Distribuicao ativa (grupos, newsletters, parcerias)`,
    priority: 3, tag: 'organico',
  },
];

// ===========================================================================
// ===========================================================================
// CRM OPS - FUNNELS CS (30d / 60d)
// Esteira de adocao e onboarding de software para clientes do plano Funnels.
// Foco: A2P compliance, configuracao tecnica GHL, billing, quick wins do CS.
// ===========================================================================

const CRM_FUNNELS_SPRINT_THEMES: Record<number, string> = {
  1: '[FUNNELS] Setup, Compliance e Primeiros Resultados',
  2: '[FUNNELS] Automacoes, CS e Expansao',
};

const CRM_FUNNELS_S1: TaskTemplate[] = [
  {
    name: '[META] Objetivo da Sprint 1 - Funnels CS Onboarding',
    description: `## Meta\nPlataforma configurada, compliance aprovado e cliente operando com independencia basica.\n\n- [ ] Sub-conta GHL ativa e configurada\n- [ ] A2P 10DLC aprovado (ou em analise)\n- [ ] Pipeline basico criado\n- [ ] Cliente treinado no basico\n- [ ] Primeiro quick win entregue`,
    priority: 1, tag: '[funnels-cs]',
  },
  {
    name: '[COMPLIANCE] Registro A2P 10DLC - OBRIGATORIO',
    description: `## A2P 10DLC e Twilio Compliance\nSem este registro, SMS e bloqueado pelas operadoras. Iniciar no dia 1.\n\n- [ ] Coletar dados legais da empresa (CNPJ, nome legal, endereco)\n- [ ] Preencher Brand Registration no GHL (Settings > Phone > A2P)\n- [ ] Criar Campaign Registration com caso de uso correto (Marketing, Mixed)\n- [ ] Vincular numero ao campaign\n- [ ] Aguardar aprovacao (2-5 dias uteis)\n- [ ] Testar envio de SMS apos aprovacao\n\n**ATENCAO:** enquanto em analise, usar apenas chamadas de voz. Nao enviar SMS antes da aprovacao.`,
    priority: 1, tag: '[funnels-cs]',
  },
  {
    name: '[SETUP] Configurar sub-conta GHL do cliente',
    description: `- [ ] Criar sub-conta no GoHighLevel\n- [ ] Configurar dominio personalizado\n- [ ] Configurar SMTP (email de envio)\n- [ ] Instalar snippet de rastreamento no site do cliente\n- [ ] Configurar numero de telefone Twilio (voz + SMS)\n- [ ] Verificar DNS e deliverability (SPF, DKIM, DMARC)\n- [ ] Habilitar WhatsApp Integration (se aplicavel)\n\n**Entregavel:** checklist de setup concluido`,
    priority: 1, tag: '[funnels-cs]',
  },
  {
    name: '[BILLING] Configurar Wallet e metodo de pagamento do cliente',
    description: `## Wallet GHL - Custo Operacional\nO cliente precisa entender e configurar os custos de uso da plataforma.\n\n- [ ] Explicar estrutura de custo: SMS (~R$0,08/msg), MMS, Voice (~R$0,06/min), Email (~0,001/email)\n- [ ] Configurar cartao de credito na Wallet do cliente\n- [ ] Definir limite de recarga automatica (recomendado: USD 20 trigger + USD 50 recarga)\n- [ ] Configurar alerta de saldo baixo\n- [ ] Documentar quem na empresa e responsavel pelo billing\n\n**Evitar surpresas:** cliente sem saldo = SMS parado = leads perdidos.`,
    priority: 1, tag: '[funnels-cs]',
  },
  {
    name: '[CRM] Criar pipeline de vendas basico',
    description: `- [ ] Entrevistar cliente (30 min): como funciona o processo de vendas hoje\n- [ ] Mapear etapas canonicas do pipeline\n- [ ] Criar pipeline no GHL com etapas e campos obrigatorios\n- [ ] Configurar motivos de perda\n- [ ] Testar fluxo end-to-end: lead entra -> aparece no pipeline`,
    priority: 2, tag: '[funnels-cs]',
  },
  {
    name: '[AUTOMACAO] Resposta automatica ao lead (< 5 min)',
    description: `- [ ] Email de boas-vindas imediato\n- [ ] SMS de primeiro contato (so ativar apos aprovacao A2P)\n- [ ] Notificacao interna para responsavel pelo lead\n- [ ] Testar fluxo completo\n\n**SLA de CS:** o cliente deve receber primeiro contato em menos de 5 minutos.`,
    priority: 1, tag: '[funnels-cs]',
  },
  {
    name: '[TREINAMENTO] Sessao de onboarding com o cliente (60 min)',
    description: `- [ ] Mostrar como usar o pipeline (registrar atividade, mover deals)\n- [ ] Mostrar como enviar email/SMS manualmente\n- [ ] Mostrar relatorios basicos\n- [ ] Entregar guia rapido em PDF\n- [ ] Q&A ao vivo\n\n**Entregavel:** gravacao da sessao + guia PDF`,
    priority: 2, tag: '[funnels-cs]',
  },
  {
    name: '[QUICK WIN] Primeira campanha ou automacao ativa - MILESTONE',
    description: `Entregar um resultado concreto na Sprint 1:\n\n- [ ] Identificar o quick win de maior impacto imediato (com cliente)\n- [ ] Implementar: campanha de reativacao, sequencia de follow-up, ou integracao de formulario\n- [ ] Medir resultado (leads gerados, respostas, conversoes)\n- [ ] Documentar e apresentar ao cliente\n\n**Objetivo:** o cliente precisa ver valor antes do fim do primeiro mes.`,
    priority: 1, tag: '[funnels-cs]',
  },
];

const CRM_FUNNELS_S2: TaskTemplate[] = [
  {
    name: '[META] Objetivo da Sprint 2 - Expansao Funnels CS',
    description: `## Meta\nCliente operando com independencia, automacoes rodando e metricas definidas.\n\n- [ ] Pelo menos 3 automacoes ativas\n- [ ] Dashboard de metricas configurado\n- [ ] Equipe operando sem suporte constante\n- [ ] Conversa de expansao ou renovacao realizada`,
    priority: 1, tag: '[funnels-cs]',
  },
  {
    name: '[AUTOMACAO] Sequencia de nurture para leads frios',
    description: `- [ ] Definir criterio de lead frio (X dias sem interacao)\n- [ ] Criar sequencia de 3-5 emails de nurture\n- [ ] Configurar SMS de reativacao (apos aprovacao A2P)\n- [ ] Automacao de limpeza de leads inativos\n- [ ] Testar e ativar`,
    priority: 2, tag: '[funnels-cs]',
  },
  {
    name: '[AUTOMACAO] Follow-up automatico por etapa do pipeline',
    description: `- [ ] Para cada etapa: tarefa automatica para vendedor\n- [ ] Escalonamento: se nao moveu em X dias, notifica gestor\n- [ ] Templates de email por etapa\n- [ ] Lembrete de follow-up recorrente`,
    priority: 2, tag: '[funnels-cs]',
  },
  {
    name: '[RELATORIO] Dashboard de metricas e CS Review',
    description: `- [ ] Volume de leads por canal\n- [ ] Taxa de conversao por etapa\n- [ ] Performance das automacoes (open rate, click rate)\n- [ ] Receita em pipeline vs fechada\n- [ ] Apresentar ao cliente em call de CS Review\n\n**Entregavel:** relatorio mensal + call de 30 min`,
    priority: 2, tag: '[funnels-cs]',
  },
  {
    name: '[CS] Conversa de expansao ou renovacao - IMPORTANTE',
    description: `## Fim do ciclo Funnels\nAvaliar o proximo passo comercial com o cliente.\n\n- [ ] Preparar relatorio de resultados dos 60 dias\n- [ ] Identificar gargalos que o produto Funnels nao resolve\n- [ ] Apresentar opcoes: renovar CS, upgrade para RevHackers Consulting, ou encerrar\n- [ ] Enviar proposta formal se houver interesse de expansao\n\n**Meta:** identificar oportunidade de upsell para plano RevHackers 90/180/360d.`,
    priority: 1, tag: '[funnels-cs]',
  },
];

// ===========================================================================
// CRM OPS - REVHACKERS HANDS-ON (90d+)
// Consultoria de RevOps completa: estrategia, implementacao e documentacao.
// ===========================================================================

const CRM_RH_SPRINT_THEMES: Record<number, string> = {
  1: '[RH] Diagnostico e Configuracao do CRM',
  2: '[RH] Automacoes e Processos de Revenue',
  3: '[RH] Otimizacao, Documentacao e Handoff',
};

const CRM_RH_S1: TaskTemplate[] = [
  {
    name: '[META] Objetivo da Sprint 1 - Setup CRM',
    description: `## Meta\nCRM configurado, pipeline definido e equipe treinada no basico.\n\n- [ ] Pipeline de vendas mapeado e criado no GHL\n- [ ] Campos customizados configurados\n- [ ] Integracao com site/formularios ativa\n- [ ] Equipe com acesso e treinamento basico`,
    priority: 1, tag: 'meta',
  },
  {
    name: '[ACESSO] Configurar sub-conta GHL do cliente',
    description: `- [ ] Criar sub-conta no GoHighLevel\n- [ ] Configurar dominio e SMTP\n- [ ] Instalar snippet de tracking no site\n- [ ] Configurar numero de telefone (se aplicavel)\n- [ ] Verificar DNS e deliverability`,
    priority: 1, tag: 'setup',
  },
  {
    name: '[CRM] Mapear e criar pipeline de vendas',
    description: `- [ ] Entrevistar equipe comercial (processo atual)\n- [ ] Definir etapas canonicas do pipeline\n- [ ] Criar pipeline no GHL com automacoes de movimentacao\n- [ ] Definir campos obrigatorios por etapa\n- [ ] Configurar motivos de perda`,
    priority: 1, tag: 'crm',
  },
  {
    name: '[CRM] Configurar captura de leads',
    description: `- [ ] Formularios de captura (site, landing pages)\n- [ ] Integracao com fontes de leads (Facebook Lead Ads, Google Forms)\n- [ ] Webhook de entrada mapeado\n- [ ] Lead scoring basico (se aplicavel)\n- [ ] Teste end-to-end: lead entra -> aparece no pipeline`,
    priority: 2, tag: 'crm',
  },
  {
    name: '[TREINAMENTO] Onboarding da equipe no CRM',
    description: `- [ ] Sessao de treinamento (60-90 min)\n- [ ] Documentacao de uso entregue\n- [ ] Processo: como registrar atividades\n- [ ] Processo: como mover deals entre etapas\n- [ ] Q&A e duvidas resolvidas`,
    priority: 2, tag: 'treinamento',
  },
  {
    name: '[DIAGNOSTICO] Relatorio de gaps operacionais - MILESTONE',
    description: `- [ ] Mapeamento do processo atual vs ideal\n- [ ] Gaps identificados (dados, processos, pessoas)\n- [ ] Plano de automacoes recomendadas\n- [ ] Apresentacao ao cliente\n\n**Entregavel:** Relatorio de gaps + plano aprovado`,
    priority: 1, tag: 'milestone',
  },
];

const CRM_RH_S2: TaskTemplate[] = [
  {
    name: '[META] Objetivo da Sprint 2 - Automacoes',
    description: `## Meta\nProcessos repetitivos automatizados, equipe focada em vender.\n\n- [ ] Pelo menos 5 automacoes ativas\n- [ ] Tempo de resposta ao lead < 5 minutos\n- [ ] Follow-up automatico configurado`,
    priority: 1, tag: 'meta',
  },
  {
    name: '[AUTOMACAO] Resposta automatica ao lead (< 5 min)',
    description: `- [ ] Email de boas-vindas automatico\n- [ ] SMS/WhatsApp de primeiro contato (se aplicavel)\n- [ ] Notificacao interna para vendedor responsavel\n- [ ] Roteirizacao de lead por regiao/produto\n\n**SLA:** lead recebe primeiro contato em < 5 minutos`,
    priority: 1, tag: 'automacao',
  },
  {
    name: '[AUTOMACAO] Sequencia de nurture para leads frios',
    description: `- [ ] Definir criterios de lead frio (X dias sem interacao)\n- [ ] Criar sequencia de 5-7 emails de nurture\n- [ ] Configurar trigger de reativacao\n- [ ] Automacao de limpeza (leads mortos apos 90 dias)`,
    priority: 2, tag: 'automacao',
  },
  {
    name: '[AUTOMACAO] Follow-up automatico por etapa do pipeline',
    description: `- [ ] Para cada etapa: definir tarefa automatica para vendedor\n- [ ] Escalonamento: se nao moveu em X dias, notifica gestor\n- [ ] Template de email por etapa\n- [ ] Lembrete de follow-up recorrente`,
    priority: 2, tag: 'automacao',
  },
  {
    name: '[RELATORIO] Dashboard de metricas do pipeline',
    description: `- [ ] Volume de leads por canal\n- [ ] Taxa de conversao por etapa\n- [ ] Tempo medio em cada etapa\n- [ ] Receita em pipeline vs fechada\n- [ ] Performance por vendedor\n\n**Entregavel:** dashboard no GHL ou Google Data Studio`,
    priority: 2, tag: 'analise',
  },
];

const CRM_RH_S3: TaskTemplate[] = [
  {
    name: '[META] Objetivo da Sprint 3 - Otimizacao e Handoff',
    description: `## Meta\nCRM rodando autonomo, equipe independente, documentacao completa.\n\n- [ ] Todos os processos documentados\n- [ ] Equipe operando sem suporte\n- [ ] Metricas de baseline definidas\n- [ ] Handoff formal concluido`,
    priority: 1, tag: 'meta',
  },
  {
    name: '[OTIMIZACAO] Refinar processos com base em dados',
    description: `- [ ] Analisar 60 dias de dados do pipeline\n- [ ] Identificar gargalos (etapas com maior drop-off)\n- [ ] Ajustar automacoes com base em performance\n- [ ] Otimizar templates de email (open rate / reply rate)`,
    priority: 2, tag: 'otimizacao',
  },
  {
    name: '[TREINAMENTO] Sessao avancada com a equipe',
    description: `- [ ] Relatorios e como interpretar\n- [ ] Como ajustar automacoes simples\n- [ ] Troubleshooting comum\n- [ ] Boas praticas de higiene de dados`,
    priority: 2, tag: 'treinamento',
  },
  {
    name: '[DOCUMENTACAO] Manual de operacoes do CRM - MILESTONE',
    description: `- [ ] Documentar todos os fluxos e automacoes\n- [ ] Playbook de vendas (scripts e templates)\n- [ ] Checklist de onboarding de novo vendedor\n- [ ] FAQ de problemas comuns\n\n**Entregavel:** documento compartilhado + video gravado`,
    priority: 1, tag: 'milestone',
  },
  {
    name: '[HANDOFF] Entrega formal e metricas de baseline',
    description: `- [ ] Relatorio de resultados dos 90 dias\n- [ ] Metricas de baseline registradas\n- [ ] Call de handoff com gestor\n- [ ] Acesso admin transferido\n- [ ] Proposta de suporte continuado (se aplicavel)`,
    priority: 1, tag: 'handoff',
  },
];

// ===========================================================================
// SITE
// ===========================================================================

const SITE_S1: TaskTemplate[] = [
  {
    name: '[META] Objetivo da Sprint 1',
    description: `## Meta\nDesign aprovado, copy aprovada e ambiente de dev configurado.\n\n- [ ] Wireframe aprovado\n- [ ] Design high-fi aprovado\n- [ ] Copy de todas as secoes aprovada\n- [ ] Ambiente pronto para desenvolvimento`,
    priority: 1, tag: 'meta',
  },
  {
    name: '[DISCOVERY] Briefing completo do projeto',
    description: `- [ ] Objetivo principal da pagina\n- [ ] Publico-alvo e dor principal\n- [ ] CTA principal e secundario\n- [ ] Tom de voz e restricoes\n- [ ] Integracao necessaria (CRM, email, WhatsApp)\n\n**Entregavel:** documento de briefing assinado`,
    priority: 1, tag: 'discovery',
  },
  {
    name: '[DISCOVERY] Benchmark: 5 referencias aprovadas',
    description: `- [ ] Pesquisar 10 referencias\n- [ ] Selecionar 5 com justificativa\n- [ ] Apresentar e coletar feedback do cliente\n\n**Entregavel:** moodboard aprovado com anotacoes`,
    priority: 2, tag: 'discovery',
  },
  {
    name: '[DISCOVERY] Arquitetura de informacao e copy',
    description: `- [ ] Mapear secoes e hierarquia\n- [ ] Headlines, subheadlines e CTAs por secao\n- [ ] Aprovacao interna de copy\n- [ ] Aprovacao do cliente\n\n**Entregavel:** copy aprovada em documento compartilhado`,
    priority: 1, tag: 'discovery',
  },
  {
    name: '[DESIGN] Wireframe low-fi (estrutura)',
    description: `- [ ] Desktop (1440px)\n- [ ] Mobile (375px)\n- [ ] Todas as secoes mapeadas\n- [ ] Aprovacao pelo cliente (call de 30 min)`,
    priority: 2, tag: 'design',
  },
  {
    name: '[DESIGN] Prototipo high-fi no Figma - MILESTONE',
    description: `- [ ] Desktop completo\n- [ ] Mobile completo\n- [ ] Hover states documentados\n- [ ] Export de assets preparado\n- [ ] Aprovacao final registrada`,
    priority: 1, tag: 'milestone',
  },
  {
    name: '[SETUP] Configurar ambiente de desenvolvimento',
    description: `- [ ] Definir stack (Vite / Next.js / Wordpress)\n- [ ] Criar repositorio no GitHub\n- [ ] Configurar deploy pipeline\n- [ ] Dominio de preview configurado`,
    priority: 2, tag: 'setup',
  },
];

const SITE_S2: TaskTemplate[] = [
  {
    name: '[META] Objetivo da Sprint 2',
    description: `## Meta\nSite ao ar com tracking completo e Core Web Vitals no verde.\n\n- [ ] Site publicado em producao\n- [ ] Todos os eventos de tracking disparando\n- [ ] LCP < 2.5s, CLS < 0.1\n- [ ] Primeiras conversoes registradas`,
    priority: 1, tag: 'meta',
  },
  {
    name: '[DEV] Desenvolvimento responsivo mobile-first',
    description: `- [ ] Todas as secoes implementadas (desktop + mobile)\n- [ ] Formularios com validacao\n- [ ] Integracao com CRM / GHL\n- [ ] Animacoes e microinteracoes`,
    priority: 1, tag: 'desenvolvimento',
  },
  {
    name: '[TRACKING] Instalar stack de analytics',
    description: `- [ ] GTM com triggers corretos\n- [ ] GA4: scroll, clique CTA, form submit\n- [ ] Meta Pixel + Conversions API\n- [ ] Clarity (heatmap)\n- [ ] Testar todos os eventos`,
    priority: 1, tag: 'tracking',
  },
  {
    name: '[QA] Quality Assurance cross-browser',
    description: `- [ ] Chrome (desktop e mobile)\n- [ ] Safari (Mac + iOS)\n- [ ] Firefox\n- [ ] Android (Chrome mobile)\n- [ ] Core Web Vitals (Lighthouse)\n- [ ] Checagem de links quebrados\n- [ ] Formularios testados end-to-end`,
    priority: 1, tag: 'qa',
  },
  {
    name: '[LAUNCH] Go-live - MILESTONE',
    description: `- [ ] DNS configurado e SSL ativo\n- [ ] Redirects 301 configurados\n- [ ] Sitemap enviado ao Search Console\n- [ ] Go-live executado\n- [ ] Monitoramento 48h pos-lancamento\n- [ ] Relatorio de lancamento enviado ao cliente`,
    priority: 1, tag: 'milestone',
  },
  {
    name: '[OTIMIZACAO] Ajustes pos-lancamento',
    description: `- [ ] Analise dos primeiros dados do Clarity (heatmap)\n- [ ] Ajustes de UX com base nos dados\n- [ ] Velocidade de carregamento revisada\n- [ ] Feedback do cliente incorporado`,
    priority: 2, tag: 'otimizacao',
  },
];

// ===========================================================================
// LINKEDIN (Marca Pessoal - Producao de Conteudo)
// ===========================================================================

const LINKEDIN_SPRINT_THEMES: Record<number, string> = {
  1:  'Posicionamento e Base Editorial',
  2:  'Distribuicao e Consistencia',
  3:  'Analise e Ajuste de Rota',
  4:  'Escala de Alcance',
  5:  'Diversificacao de Formatos',
  6:  'Consolidacao de Autoridade',
  7:  'Expansao de Comunidade',
  8:  'Parcerias e Co-criacao',
  9:  'Novos Formatos e Canais',
  10: 'Performance e Eficiencia',
  11: 'Expansao de Rede Estrategica',
  12: 'Review Anual de Marca',
};

const LINKEDIN_S1: TaskTemplate[] = [
  {
    name: '[META] Objetivo da Sprint 1',
    description: `## Meta\nPosicionamento definido, perfil otimizado e primeiros 12 posts publicados.\n\n- [ ] Posicionamento e narrativa fundadora aprovados\n- [ ] Perfil LinkedIn com score alto\n- [ ] 12 posts publicados no mes\n- [ ] Banco de 30 pautas criado`,
    priority: 1, tag: 'meta',
  },
  {
    name: '[MARCA] Workshop de posicionamento (90 min)',
    description: `## Sessao de 60-90 min\n\n- [ ] Por que voce fundou essa empresa?\n- [ ] Qual o grande resultado entregue (proof point)?\n- [ ] Para quem especificamente?\n- [ ] Qual o angulo unico?\n- [ ] O que te diferencia e quais sao suas credenciais?\n\n**Entregavel:** Documento de Posicionamento e Narrativa Fundadora (1 pagina)`,
    priority: 1, tag: 'posicionamento',
  },
  {
    name: '[MARCA] Definir ICP, tom de voz e pilares de autoridade',
    description: `## ICP\n- [ ] Cargo, setor, porte do seguidor ideal\n- [ ] Top 3 dores que o founder resolve\n\n## Pilares de autoridade\n- [ ] Pillar 1: Expertise técnica\n- [ ] Pillar 2: Gestão / Liderança\n- [ ] Pillar 3: Opinião forte sobre o mercado`,
    priority: 1, tag: 'posicionamento',
  },
  {
    name: '[MARCA] Otimizar presenca digital completa - MILESTONE',
    description: `- [ ] Foto (fundo limpo, olho na camera) e banner profissional\n- [ ] Headline: quem ajuda + como + resultado\n- [ ] About: historia da fundacao + credenciais + CTA\n- [ ] Bio para eventos e PR (3 versoes: curta, media, longa)\n- [ ] Aprovado e publicado`,
    priority: 1, tag: 'milestone',
  },
  {
    name: '[CONTEUDO] Plano editorial e banco de pautas do mes',
    description: `## Mix de formatos\n- [ ] Posts de opiniao forte e bastidores\n- [ ] Historias de resultado e cases\n- [ ] Banco com 30 ideias de hooks\n- [ ] 12 pautas aprovadas`,
    priority: 2, tag: 'conteudo',
  },
  {
    name: '[PRODUCAO] Semana 1: 3 posts escritos, aprovados e publicados',
    description: `Para cada post:\n- [ ] Rascunho escrito\n- [ ] Review interno (hook + corpo + CTA)\n- [ ] Aprovacao do cliente (max 24h)\n- [ ] Publicado no horario de pico\n- [ ] Metricas coletadas em 24h`,
    priority: 2, tag: 'producao',
  },
  {
    name: '[PRODUCAO] Semana 2: 3 posts escritos, aprovados e publicados',
    description: `- [ ] Rascunhos escritos\n- [ ] Review interno\n- [ ] Aprovacao do cliente\n- [ ] Publicados\n- [ ] Analise da semana 1: qual formato performou melhor?`,
    priority: 2, tag: 'producao',
  },
  {
    name: '[PRODUCAO] Semana 3: 3 posts escritos, aprovados e publicados',
    description: `- [ ] Rascunhos escritos\n- [ ] Review interno\n- [ ] Aprovacao do cliente\n- [ ] Publicados\n- [ ] Ajuste de pauta com base nos dados das semanas anteriores`,
    priority: 2, tag: 'producao',
  },
  {
    name: '[PRODUCAO] Semana 4: 3 posts escritos, aprovados e publicados',
    description: `- [ ] Rascunhos escritos\n- [ ] Review interno\n- [ ] Aprovacao do cliente\n- [ ] Publicados\n- [ ] Relatorio de performance do mes`,
    priority: 2, tag: 'producao',
  },
];

const LINKEDIN_S2: TaskTemplate[] = [
  {
    name: '[META] Objetivo da Sprint 2',
    description: `## Meta\nRitmo de publicacao estabelecido, dados suficientes para otimizar e primeiras interacoes de PR.\n\n- [ ] 12 posts publicados\n- [ ] Engajamento medio > 2%\n- [ ] Iniciado contato com jornalistas/podcasters\n- [ ] Newsletter lancada (se no escopo)`,
    priority: 1, tag: 'meta',
  },
  {
    name: '[ANALISE] O que performou na Sprint 1',
    description: `- [ ] Top 3 posts (impressoes + engajamento)\n- [ ] Bottom 3 posts (o que nao funcionou)\n- [ ] Qual pilar tem melhor resposta\n- [ ] Qual formato performa mais (texto / carrossel / historia)\n\n**Decisao:** ajustar distribuicao de formatos para o mes`,
    priority: 1, tag: 'analise',
  },
  {
    name: '[PR] Iniciar outreach para podcasts e midia',
    description: `- [ ] Lista de 10 podcasts relevantes no nicho\n- [ ] Lista de 5 newsletters de mercado\n- [ ] Draft de pitch personalizado para cada\n- [ ] Enviar primeiros convites\n- [ ] Follow-up em 7 dias`,
    priority: 2, tag: 'pr',
  },
  {
    name: '[CRESCIMENTO] Estrategia de comentarios e conexoes',
    description: `- [ ] Definir 20 contas onde o ICP esta (criadores, empresas, grupos)\n- [ ] Comentar ativamente 30 min/dia nos conteudos certos\n- [ ] 10 conexoes estrategicas por semana com mensagem personalizada\n- [ ] Registrar conexoes feitas`,
    priority: 2, tag: 'crescimento',
  },
  {
    name: '[PRODUCAO] 12 posts do mes (aprovados e publicados)',
    description: `Distribuicao ajustada com base nos dados da Sprint 1:\n- [ ] Posts escritos, aprovados e agendados\n- [ ] Horario de publicacao consistente\n- [ ] Metricas coletadas por post`,
    priority: 2, tag: 'producao',
  },
];

const LINKEDIN_S3: TaskTemplate[] = [
  {
    name: '[META] Objetivo da Sprint 3',
    description: `## Meta\n90 dias de resultado mensuravel e primeira aparicao de PR.\n\n- [ ] Crescimento de seguidores acima da meta\n- [ ] Inbound leads gerados organicamente\n- [ ] Pelo menos 1 participacao em podcast/midia confirmada`,
    priority: 1, tag: 'meta',
  },
  {
    name: '[ANALISE] Review de 90 dias - MILESTONE',
    description: `## Relatorio trimestral\n- [ ] Crescimento de seguidores (mes a mes)\n- [ ] Evolucao de engajamento\n- [ ] Posts com melhor performance\n- [ ] Leads ou oportunidades geradas\n- [ ] Aprendizados e ajuste de estrategia\n\n**Apresentar ao cliente em call de fechamento**`,
    priority: 1, tag: 'milestone',
  },
  {
    name: '[PR] Confirmar e preparar primeira aparicao publica',
    description: `- [ ] Participacao confirmada (podcast / evento / webinar)\n- [ ] Talking points preparados e ensaiados\n- [ ] Kit de divulgacao preparado\n- [ ] Post-aparicao: clip cortado e distribuido nas redes`,
    priority: 1, tag: 'pr',
  },
  {
    name: '[CONTEUDO] Artigo de autoridade (long-form)',
    description: `- [ ] Tema escolhido (baseado no pilar mais forte)\n- [ ] Artigo escrito (1500-3000 palavras)\n- [ ] Publicado no LinkedIn ou blog pessoal\n- [ ] Distribuido em newsletter e redes`,
    priority: 2, tag: 'conteudo',
  },
  {
    name: '[PRODUCAO] 12 posts do mes',
    description: `- [ ] Posts escritos, aprovados e agendados\n- [ ] Incluir conteudo sobre a aparicao publica ou novo formato\n- [ ] Metricas coletadas`,
    priority: 2, tag: 'producao',
  },
];



// ===========================================================================
// Funcao principal: retorna o template completo por tipo + duracao
// ===========================================================================

export function getProjectTemplate(
  type: ProjectType,
  duration_days: DurationDays,
): ProjectTemplate {
  const sprint_count = duration_days / 30;
  const tier: Tier =
    type === 'consulting' && duration_days <= 60 ? 'free' : 'paid';

  const sprints: SprintTemplate[] = [];

  // ── CONSULTING ────────────────────────────────────────────────────────
  if (type === 'consulting') {
    for (let i = 0; i < sprint_count; i++) {
      const index = i + 1;
      const theme = CONSULTING_SPRINT_THEMES[index] ?? `Ciclo ${index}`;

      let tasks: TaskTemplate[];
      if (index === 1) {
        tasks = tier === 'free' ? CONSULTING_S1_FREE : CONSULTING_S1_PAID;
      } else if (index === 2) {
        tasks = CONSULTING_S2;
      } else if (index === 3) {
        tasks = CONSULTING_S3;
      } else {
        tasks = [
          {
            name: `[META] Objetivo da Sprint ${index}`,
            description: `## Meta da Sprint ${index}: ${theme}\n\nA ser definida com base no planejamento estrategico e nos resultados das sprints anteriores.\n\n- [ ] Meta especifica definida com o cliente\n- [ ] KRs mensuráveis acordados`,
            priority: 1, tag: 'meta',
          },
          {
            name: `[EXECUCAO] Tarefas da Sprint ${index}`,
            description: `Tarefas a serem definidas com base nos resultados das sprints anteriores e no plano estrategico. Esta tarefa sera complementada pelas tarefas geradas pela IA.`,
            priority: 2, tag: 'execucao',
          },
        ];
      }

      // Review trimestral: toda sprint 3, 6, 9, 12
      if (index % 3 === 0 && index > 1) {
        tasks = [...tasks, quarterlyReviewTask(index)];
      }

      // Sprint final: renovacao
      if (index === sprint_count && sprint_count > 1) {
        tasks = [...tasks, renewalTask()];
      }

      sprints.push({
        index,
        theme,
        goal: `Sprint ${index}: ${theme}`,
        tasks: [...tasks, ...RECURRING_TASKS],
      });
    }
  }

  // ── CRM OPS ──────────────────────────────────────────────────────────
  // Bifurcacao de rota:
  //   duration_days <= 60 -> Funnels CS (adocao de software, quick wins)
  //   duration_days >= 90 -> RevHackers Hands-On (consultoria completa de RevOps)
  if (type === 'crm_ops') {
    const isFunnelsCS = duration_days <= 60;

    for (let i = 0; i < sprint_count; i++) {
      const index = i + 1;

      let theme: string;
      let tasks: TaskTemplate[];

      if (isFunnelsCS) {
        theme = CRM_FUNNELS_SPRINT_THEMES[index] ?? `[FUNNELS] Ciclo CS ${index}`;
        if (index === 1) tasks = CRM_FUNNELS_S1;
        else if (index === 2) tasks = CRM_FUNNELS_S2;
        else {
          tasks = [{
            name: `[META] Objetivo da Sprint ${index}`,
            description: `## Meta: ${theme}\n\nA ser definida com base nos dados do CS e feedback do cliente.`,
            priority: 1, tag: '[funnels-cs]',
          }];
        }
      } else {
        theme = CRM_RH_SPRINT_THEMES[index] ?? `[RH] Ciclo CRM ${index}`;
        if (index === 1) tasks = CRM_RH_S1;
        else if (index === 2) tasks = CRM_RH_S2;
        else if (index === 3) tasks = CRM_RH_S3;
        else {
          tasks = [{
            name: `[META] Objetivo da Sprint ${index}`,
            description: `## Meta: ${theme}\n\nA ser definida com base nos dados do CRM e performance do pipeline.`,
            priority: 1, tag: '[revhackers-hands-on]',
          }];
        }
      }

      // Sprint final: renovacao
      if (index === sprint_count && sprint_count > 1) {
        tasks = [...tasks, renewalTask()];
      }

      sprints.push({
        index,
        theme,
        goal: `Sprint ${index}: ${theme}`,
        tasks: [...tasks, ...RECURRING_TASKS],
      });
    }
  }

  // ── SITE ──────────────────────────────────────────────────────────────
  if (type === 'site') {
    for (let i = 0; i < sprint_count; i++) {
      const index = i + 1;
      const tasks = index === 1 ? SITE_S1 : SITE_S2;
      const theme = index === 1 ? 'Discovery e Design' : 'Desenvolvimento e Launch';

      sprints.push({
        index,
        theme,
        goal: `Sprint ${index}: ${theme}`,
        tasks: [...tasks, ...RECURRING_TASKS],
      });
    }
  }

  // ── LINKEDIN ──────────────────────────────────────────────────────────
  if (type === 'linkedin') {
    for (let i = 0; i < sprint_count; i++) {
      const index = i + 1;
      const theme = LINKEDIN_SPRINT_THEMES[index] ?? `Ciclo ${index}`;

      let tasks: TaskTemplate[];
      if (index === 1) tasks = LINKEDIN_S1;
      else if (index === 2) tasks = LINKEDIN_S2;
      else if (index === 3) tasks = LINKEDIN_S3;
      else {
        tasks = [
          {
            name: `[META] Objetivo da Sprint ${index}`,
            description: `## Meta: ${theme}\n\nA ser refinada com base na performance dos meses anteriores.\n\n- [ ] Meta de seguidores / engajamento / leads definida\n- [ ] Formatos prioritarios do mes escolhidos`,
            priority: 1, tag: 'meta',
          },
          {
            name: '[PRODUCAO] 12 posts do mes (aprovados e publicados)',
            description: `- [ ] Pautas definidas com base nos dados anteriores\n- [ ] Posts escritos e aprovados\n- [ ] Publicados no horario de pico\n- [ ] Metricas coletadas`,
            priority: 2, tag: 'producao',
          },
        ];
      }

      // Review trimestral
      if (index % 3 === 0) {
        tasks = [...tasks, quarterlyReviewTask(index)];
      }

      // Sprint final
      if (index === sprint_count && sprint_count > 1) {
        tasks = [
          ...tasks,
          {
            name: '[RENOVACAO] Review anual de marca e proposta de continuidade',
            description: `## Fechamento do ciclo de LinkedIn\n\n- [ ] Relatorio completo: seguidores, engajamento, leads gerados\n- [ ] Comparativo: antes vs depois\n- [ ] Proposta de renovacao com novos objetivos\n- [ ] Call de fechamento com o cliente`,
            priority: 1, tag: 'renovacao',
          },
        ];
      }

      sprints.push({
        index,
        theme,
        goal: `Sprint ${index}: ${theme}`,
        tasks: [...tasks, ...RECURRING_TASKS],
      });
    }
  }



  return { type, duration_days, tier, sprint_count, sprints };
}
