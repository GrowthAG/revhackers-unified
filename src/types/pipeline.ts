// Pipeline stages in order - from first contact to conclusion
export const PIPELINE_STAGES = [
  'lead_inbound',
  'lead_qualified',
  'diagnostic_done',
  'proposal_draft',
  'proposal_sent',
  'proposal_viewed',
  'negotiation',
  'won',
  'onboarding',
  'active',
  'completed',
  'lost',
  'churned',
] as const;

export type PipelineStage = typeof PIPELINE_STAGES[number];

// Stage category groupings
export type StageCategory = 'diagnostico' | 'vendas' | 'execucao' | 'encerrado';

// Stage metadata for UI rendering
export interface StageConfig {
  key: PipelineStage;
  label: string;
  labelShort: string;
  category: StageCategory;
  color: string; // zinc shades or #00CC6A only
  icon: string; // lucide-react icon name
  description: string;
  allowedTransitions: PipelineStage[];
}

export const STAGE_CONFIGS: Record<PipelineStage, StageConfig> = {
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
    label: 'Diagnostico Realizado',
    labelShort: 'Diagnosticado',
    category: 'diagnostico',
    color: 'zinc-600',
    icon: 'ClipboardCheck',
    description: 'REI preenchido e score de maturidade calculado',
    allowedTransitions: ['proposal_draft', 'lost'],
  },
  proposal_draft: {
    key: 'proposal_draft',
    label: 'Proposta em Elaboracao',
    labelShort: 'Rascunho',
    category: 'vendas',
    color: 'zinc-500',
    icon: 'FileEdit',
    description: 'Plano estrategico sendo gerado ou revisado pelo analista',
    allowedTransitions: ['proposal_sent', 'lost'],
  },
  proposal_sent: {
    key: 'proposal_sent',
    label: 'Proposta Enviada',
    labelShort: 'Enviada',
    category: 'vendas',
    color: 'zinc-600',
    icon: 'Send',
    description: 'Link do plano enviado ao cliente, aguardando abertura',
    allowedTransitions: ['proposal_viewed', 'negotiation', 'lost'],
  },
  proposal_viewed: {
    key: 'proposal_viewed',
    label: 'Proposta Visualizada',
    labelShort: 'Vista',
    category: 'vendas',
    color: 'zinc-700',
    icon: 'Eye',
    description: 'Cliente abriu e visualizou o plano estrategico',
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
    category: 'execucao',
    color: '#00CC6A',
    icon: 'Trophy',
    description: 'Contrato assinado, projeto aprovado pelo cliente',
    allowedTransitions: ['onboarding'],
  },
  onboarding: {
    key: 'onboarding',
    label: 'Onboarding',
    labelShort: 'Onboarding',
    category: 'execucao',
    color: 'zinc-700',
    icon: 'Rocket',
    description: 'Kickoff realizado, acessos e materiais sendo coletados',
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
  lost: {
    key: 'lost',
    label: 'Perdido',
    labelShort: 'Perdido',
    category: 'encerrado',
    color: 'zinc-300',
    icon: 'XCircle',
    description: 'Lead ou oportunidade perdida antes do fechamento',
    allowedTransitions: ['lead_inbound'],
  },
  churned: {
    key: 'churned',
    label: 'Churned',
    labelShort: 'Churn',
    category: 'encerrado',
    color: 'zinc-300',
    icon: 'UserMinus',
    description: 'Cliente cancelou durante a execucao do projeto',
    allowedTransitions: ['lead_inbound'],
  },
};

// Category metadata for grouping stages in the UI
export const STAGE_CATEGORIES: Record<StageCategory, { label: string; stages: PipelineStage[] }> = {
  diagnostico: {
    label: 'Diagnostico',
    stages: ['lead_inbound', 'lead_qualified', 'diagnostic_done'],
  },
  vendas: {
    label: 'Vendas',
    stages: ['proposal_draft', 'proposal_sent', 'proposal_viewed', 'negotiation'],
  },
  execucao: {
    label: 'Execucao',
    stages: ['won', 'onboarding', 'active', 'completed'],
  },
  encerrado: {
    label: 'Encerrado',
    stages: ['lost', 'churned'],
  },
};

// Lead sources - where the opportunity originated
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

// Opportunity data enriched from meeting analysis or AI
export interface OpportunityData {
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

// Pipeline stage change event for audit trail
export interface StageChangeEvent {
  id: string;
  rei_project_id: string;
  from_stage: PipelineStage | null;
  to_stage: PipelineStage;
  changed_at: string;
  changed_by?: string;
  notes?: string;
}

// Funnel metrics for dashboard aggregation
export interface FunnelMetrics {
  stage_counts: Record<PipelineStage, number>;
  conversion_rates: {
    from: PipelineStage;
    to: PipelineStage;
    rate: number; // 0-100
  }[];
  total_pipeline_value: number;
  avg_days_per_stage: Record<PipelineStage, number>;
}

// Helper: check if a stage transition is valid
export function isValidTransition(from: PipelineStage, to: PipelineStage): boolean {
  const config = STAGE_CONFIGS[from];
  return config.allowedTransitions.includes(to);
}

// Helper: get numeric index for stage ordering
export function getStageIndex(stage: PipelineStage): number {
  return PIPELINE_STAGES.indexOf(stage);
}

// Helper: get category for a stage
export function getStageCategory(stage: PipelineStage): StageCategory {
  return STAGE_CONFIGS[stage].category;
}
