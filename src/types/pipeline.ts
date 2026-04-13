// ============================================================================
// OPPORTUNITY STAGES (sales lifecycle)
// ============================================================================

export const OPPORTUNITY_STAGES = [
  'lead_inbound',
  'lead_qualified',
  'diagnostic_done',
  'proposal_draft',
  'proposal_sent',
  'proposal_viewed',
  'negotiation',
  'won',
  'lost',
] as const;

export type OpportunityStage = typeof OPPORTUNITY_STAGES[number];

// ============================================================================
// PROJECT STAGES (execution lifecycle - starts after won)
// ============================================================================

export const PROJECT_STAGES = [
  'onboarding',
  'active',
  'completed',
  'churned',
] as const;

export type ProjectStage = typeof PROJECT_STAGES[number];

// ============================================================================
// UNIFIED TYPE (backward compat - used during migration)
// ============================================================================

export const PIPELINE_STAGES = [
  ...OPPORTUNITY_STAGES,
  'onboarding',
  'active',
  'completed',
  'churned',
] as const;

export type PipelineStage = typeof PIPELINE_STAGES[number];

// ============================================================================
// STAGE CATEGORIES
// ============================================================================

export type OpportunityCategory = 'diagnostico' | 'vendas' | 'fechamento';
export type ProjectCategory = 'execucao' | 'encerrado';
export type StageCategory = OpportunityCategory | ProjectCategory | 'encerrado';

// ============================================================================
// STAGE CONFIGS - OPPORTUNITY
// ============================================================================

export interface StageConfig {
  key: PipelineStage;
  label: string;
  labelShort: string;
  category: StageCategory;
  color: string;
  icon: string;
  description: string;
  allowedTransitions: PipelineStage[];
}

export const OPPORTUNITY_STAGE_CONFIGS: Record<OpportunityStage, StageConfig> = {
  lead_inbound: {
    key: 'lead_inbound',
    label: 'Lead Inbound',
    labelShort: 'Inbound',
    category: 'diagnostico',
    color: 'zinc-400',
    icon: 'UserPlus',
    description: 'Lead captado via formulario, diagnostico ou indicacao',
    allowedTransitions: ['lead_qualified', 'lost'],
  },
  lead_qualified: {
    key: 'lead_qualified',
    label: 'Lead Qualificado',
    labelShort: 'Qualificado',
    category: 'diagnostico',
    color: 'zinc-500',
    icon: 'UserCheck',
    description: 'Lead com perfil validado e interesse confirmado',
    allowedTransitions: ['diagnostic_done', 'lost'],
  },
  diagnostic_done: {
    key: 'diagnostic_done',
    label: 'Lead com Diagnostico',
    labelShort: 'Diagnosticado',
    category: 'diagnostico',
    color: 'zinc-600',
    icon: 'ClipboardCheck',
    description: 'Lead preencheu o diagnostico publico. Dados prontos para qualificacao.',
    allowedTransitions: ['proposal_draft', 'lost'],
  },
  proposal_draft: {
    key: 'proposal_draft',
    label: 'Em Elaboração',
    labelShort: 'Elaboração',
    category: 'vendas',
    color: 'zinc-500',
    icon: 'FileEdit',
    description: 'Proposta sendo gerada ou revisada pelo analista',
    allowedTransitions: ['proposal_sent', 'lost'],
  },
  proposal_sent: {
    key: 'proposal_sent',
    label: 'Proposta Enviada',
    labelShort: 'Enviada',
    category: 'vendas',
    color: 'zinc-600',
    icon: 'Send',
    description: 'Link da proposta enviado ao cliente, aguardando abertura',
    allowedTransitions: ['proposal_viewed', 'negotiation', 'lost'],
  },
  proposal_viewed: {
    key: 'proposal_viewed',
    label: 'Proposta Visualizada',
    labelShort: 'Vista',
    category: 'vendas',
    color: 'zinc-700',
    icon: 'Eye',
    description: 'Cliente abriu e visualizou a proposta',
    allowedTransitions: ['negotiation', 'won', 'lost'],
  },
  negotiation: {
    key: 'negotiation',
    label: 'Em Negociacao',
    labelShort: 'Negociacao',
    category: 'vendas',
    color: 'zinc-800',
    icon: 'MessageSquare',
    description: 'Discussao ativa sobre escopo, prazo ou investimento',
    allowedTransitions: ['won', 'lost'],
  },
  won: {
    key: 'won',
    label: 'Fechado',
    labelShort: 'Fechado',
    category: 'fechamento',
    color: '#00CC6A',
    icon: 'Trophy',
    description: 'Contrato assinado, projeto aprovado pelo cliente',
    allowedTransitions: [],
  },
  lost: {
    key: 'lost',
    label: 'Perdido',
    labelShort: 'Perdido',
    category: 'encerrado',
    color: 'zinc-300',
    icon: 'XCircle',
    description: 'Oportunidade perdida antes do fechamento',
    allowedTransitions: ['lead_inbound'],
  },
};

// ============================================================================
// STAGE CONFIGS - PROJECT
// ============================================================================

export const PROJECT_STAGE_CONFIGS: Record<ProjectStage, StageConfig> = {
  onboarding: {
    key: 'onboarding',
    label: 'Onboarding',
    labelShort: 'Onboarding',
    category: 'execucao',
    color: 'zinc-700',
    icon: 'Rocket',
    description: 'REI realizado, acessos e materiais sendo coletados',
    allowedTransitions: ['active'],
  },
  active: {
    key: 'active',
    label: 'Em Execucao',
    labelShort: 'Ativo',
    category: 'execucao',
    color: 'zinc-900',
    icon: 'Activity',
    description: 'Projeto em andamento com entregas programadas',
    allowedTransitions: ['completed', 'churned'],
  },
  completed: {
    key: 'completed',
    label: 'Concluido',
    labelShort: 'Concluido',
    category: 'execucao',
    color: 'zinc-400',
    icon: 'CheckCircle2',
    description: 'Todas as entregas finalizadas, projeto encerrado com sucesso',
    allowedTransitions: [],
  },
  churned: {
    key: 'churned',
    label: 'Churned',
    labelShort: 'Churn',
    category: 'encerrado',
    color: 'zinc-300',
    icon: 'UserMinus',
    description: 'Cliente cancelou durante a execucao do projeto',
    allowedTransitions: [],
  },
};

// ============================================================================
// UNIFIED STAGE_CONFIGS (backward compat during migration)
// ============================================================================

export const STAGE_CONFIGS: Record<PipelineStage, StageConfig> = {
  ...OPPORTUNITY_STAGE_CONFIGS,
  ...PROJECT_STAGE_CONFIGS,
};

// ============================================================================
// CATEGORY GROUPINGS
// ============================================================================

export const OPPORTUNITY_CATEGORIES: Record<OpportunityCategory, { label: string; stages: OpportunityStage[] }> = {
  diagnostico: {
    label: 'Diagnostico',
    stages: ['lead_inbound', 'lead_qualified', 'diagnostic_done'],
  },
  vendas: {
    label: 'Vendas',
    stages: ['proposal_draft', 'proposal_sent', 'proposal_viewed', 'negotiation'],
  },
  fechamento: {
    label: 'Fechamento',
    stages: ['won', 'lost'],
  },
};

export const PROJECT_CATEGORIES: Record<ProjectCategory, { label: string; stages: ProjectStage[] }> = {
  execucao: {
    label: 'Execucao',
    stages: ['onboarding', 'active', 'completed'],
  },
  encerrado: {
    label: 'Encerrado',
    stages: ['churned'],
  },
};

// Backward compat
export const STAGE_CATEGORIES: Record<StageCategory, { label: string; stages: PipelineStage[] }> = {
  diagnostico: {
    label: 'Diagnostico',
    stages: ['lead_inbound', 'lead_qualified', 'diagnostic_done'],
  },
  vendas: {
    label: 'Vendas',
    stages: ['proposal_draft', 'proposal_sent', 'proposal_viewed', 'negotiation'],
  },
  fechamento: {
    label: 'Fechamento',
    stages: ['won', 'lost'],
  },
  execucao: {
    label: 'Execucao',
    stages: ['onboarding', 'active', 'completed'],
  },
  encerrado: {
    label: 'Encerrado',
    stages: ['churned'],
  },
};

// ============================================================================
// LEAD SOURCES
// ============================================================================

export const LEAD_SOURCES = [
  'diagnostico_growth',
  'diagnostico_revenue',
  'diagnostico_founder',
  'diagnostico_site',
  'ghl_calendar',
  'referral',
  'cold_outbound',
  'manual',
] as const;

export type LeadSource = typeof LEAD_SOURCES[number];

export const LEAD_SOURCE_LABELS: Record<LeadSource, string> = {
  diagnostico_growth: 'Diagnostico Growth',
  diagnostico_revenue: 'Diagnostico Revenue',
  diagnostico_founder: 'Diagnostico Founder',
  diagnostico_site: 'Diagnostico Site',
  ghl_calendar: 'Agenda GHL',
  referral: 'Indicacao',
  cold_outbound: 'Outbound',
  manual: 'Manual',
};

// ============================================================================
// DATA INTERFACES
// ============================================================================

export interface Stakeholder {
  id: string;
  name: string;
  email: string;
  role: string;
  type: 'decision_maker' | 'influencer' | 'champion' | 'blocker' | 'other';
}

export interface OpportunityData {
  stakeholders?: Stakeholder[];
  score_fechamento: number;
  sinais_compra: string[];
  objecoes_detectadas: string[];
  investimento_estimado: {
    range_min: number;
    range_max: number;
    justificativa: string;
  };
  sentimento: 'positivo' | 'neutro' | 'negativo';
  score_engajamento: number;
  enriched_at?: string;
}

export interface Opportunity {
  id: string;
  client_name: string;
  client_email: string | null;
  client_company: string | null;
  client_site: string | null;
  client_logo: string | null;
  trade_name: string | null;
  type: string;
  lead_source: LeadSource | null;
  source: string | null;
  pipeline_stage: OpportunityStage;
  diagnostico_id: string | null;
  opportunity_data: OpportunityData | null;
  enrichment_data: any | null;
  meeting_recording_id: string | null;
  analyst_email: string;
  organization_id: string | null;
  client_id: string | null;
  rei_project_id: string | null;
  won_at: string | null;
  lost_at: string | null;
  lost_reason: string | null;
  created_at: string;
  updated_at: string;
}

// ============================================================================
// STAGE CHANGE EVENTS
// ============================================================================

export interface OpportunityStageEvent {
  id: string;
  opportunity_id: string;
  from_stage: OpportunityStage | null;
  to_stage: OpportunityStage;
  changed_at: string;
  changed_by?: string;
  notes?: string;
}

export interface ProjectStageEvent {
  id: string;
  rei_project_id: string;
  from_stage: ProjectStage | null;
  to_stage: ProjectStage;
  changed_at: string;
  changed_by?: string;
  notes?: string;
}

// Backward compat
export interface StageChangeEvent {
  id: string;
  rei_project_id?: string;
  opportunity_id?: string;
  from_stage: PipelineStage | null;
  to_stage: PipelineStage;
  changed_at: string;
  changed_by?: string;
  notes?: string;
}

// ============================================================================
// FUNNEL METRICS
// ============================================================================

export interface OpportunityFunnelMetrics {
  stage_counts: Record<OpportunityStage, number>;
  conversion_rates: {
    from: OpportunityStage;
    to: OpportunityStage;
    rate: number;
  }[];
  total_pipeline_value: number;
  avg_days_per_stage: Record<OpportunityStage, number>;
}

export interface ProjectFunnelMetrics {
  stage_counts: Record<ProjectStage, number>;
  avg_days_per_stage: Record<ProjectStage, number>;
}

// Backward compat
export interface FunnelMetrics {
  stage_counts: Record<PipelineStage, number>;
  conversion_rates: {
    from: PipelineStage;
    to: PipelineStage;
    rate: number;
  }[];
  total_pipeline_value: number;
  avg_days_per_stage: Record<PipelineStage, number>;
}

// ============================================================================
// HELPERS
// ============================================================================

export function isValidOpportunityTransition(from: OpportunityStage, to: OpportunityStage): boolean {
  const config = OPPORTUNITY_STAGE_CONFIGS[from];
  return config.allowedTransitions.includes(to);
}

export function isValidProjectTransition(from: ProjectStage, to: ProjectStage): boolean {
  const config = PROJECT_STAGE_CONFIGS[from];
  return config.allowedTransitions.includes(to);
}

// Backward compat
export function isValidTransition(from: PipelineStage, to: PipelineStage): boolean {
  const config = STAGE_CONFIGS[from];
  return config?.allowedTransitions?.includes(to) ?? false;
}

export function getStageIndex(stage: PipelineStage): number {
  return PIPELINE_STAGES.indexOf(stage);
}

export function getStageCategory(stage: PipelineStage): StageCategory {
  return STAGE_CONFIGS[stage]?.category ?? 'encerrado';
}

export function isOpportunityStage(stage: string): stage is OpportunityStage {
  return (OPPORTUNITY_STAGES as readonly string[]).includes(stage);
}

export function isProjectStage(stage: string): stage is ProjectStage {
  return (PROJECT_STAGES as readonly string[]).includes(stage);
}
