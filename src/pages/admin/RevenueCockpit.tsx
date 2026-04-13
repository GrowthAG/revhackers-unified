import React, { useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import {
  UserPlus, UserCheck, ClipboardCheck, FileEdit, Send, Eye,
  MessageSquare, Trophy, Rocket, Activity, CheckCircle2,
  XCircle, UserMinus, RefreshCw, Plus, ChevronRight,
  Flame, AlertTriangle, Phone, Target, Zap, BarChart3,
  CalendarCheck, ShieldAlert, TrendingUp, Clock, Radar,
  LayoutList, Columns3, Filter, X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import AdminLayout from '@/components/layout/AdminLayout';
import { LeadWarRoomSheet } from '@/components/rei/LeadWarRoomSheet';
import { FastLeadDrawer } from '@/components/rei/FastLeadDrawer';
import { DealClosingModal } from '@/components/admin/DealClosingModal';
import {
  PipelineStage,
  OpportunityStage,
  ProjectStage,
  STAGE_CONFIGS,
  OPPORTUNITY_STAGE_CONFIGS,
  PROJECT_STAGE_CONFIGS,
  STAGE_CATEGORIES,
  OpportunityData,
  LEAD_SOURCE_LABELS,
  LeadSource,
} from '@/types/pipeline';
import { advanceStage } from '@/services/PipelineService';
import { advanceOpportunityStage } from '@/api/opportunities';
import { useToast } from '@/hooks/use-toast';
import { PipelineSkeleton } from '@/components/ui/skeleton';

// ---- Icon map (lucide) keyed by STAGE_CONFIGS.icon string ----
const ICON_MAP: Record<string, React.ElementType> = {
  UserPlus, UserCheck, ClipboardCheck, FileEdit, Send, Eye,
  MessageSquare, Trophy, Rocket, Activity, CheckCircle2,
  XCircle, UserMinus,
};

function stageIcon(stage: PipelineStage): React.ElementType {
  return ICON_MAP[STAGE_CONFIGS[stage].icon] || Activity;
}

// ---- Types ----

interface ProjectRow {
  id: string;
  client_name: string;
  client_company: string | null;
  trade_name: string | null;
  type: string;
  status: string;
  pipeline_stage: PipelineStage | null;
  lead_source: string | null;
  opportunity_data: OpportunityData | null;
  enrichment_data: any | null;
  created_at: string;
  updated_at: string;
  // Onboarding
  onboarding_phase: number | null;
  onboarding_phase_entered_at: string | null;
  // Joined
  maturity_pct: number;
  rei_score: number;
  // Plan
  plan_status: string | null;
  // Tasks
  total_tasks: number;
  done_tasks: number;
  overdue_tasks: number;
  // Derived
  display_name: string;
  days_in_stage: number;
  days_in_phase: number;
  // Diagnostico (joined from opportunities query)
  diagnostico_score?: number | null;
  diagnostico_tipo?: string | null;
}

// ---- Helpers ----

import { getDisplayName, formatCurrency, getDaysSince } from '@/lib/projectUtils';

function pipelineValue(projects: ProjectRow[]): number {
  return projects.reduce((sum, p) => {
    const opp = p.opportunity_data;
    if (!opp?.investimento_estimado) return sum;
    const avg = (opp.investimento_estimado.range_min + opp.investimento_estimado.range_max) / 2;
    return sum + avg;
  }, 0);
}

// ---- Stage grouping ----

const DIAGNOSTICO_STAGES: PipelineStage[] = ['lead_inbound', 'lead_qualified', 'diagnostic_done'];
const VENDAS_STAGES: PipelineStage[] = ['proposal_draft', 'proposal_sent', 'proposal_viewed', 'negotiation'];
const EXECUCAO_STAGES: PipelineStage[] = ['won', 'onboarding', 'active', 'completed'];

// ---- Sub-components ----

const MetricCard = ({ label, value, sub }: { label: string; value: string | number; sub?: string }) => (
  <div className="bg-white border border-zinc-200 p-6 flex flex-col justify-between hover:border-zinc-400 transition-colors duration-300 group">
    <p className="text-xs font-black uppercase tracking-widest text-zinc-500 mb-2 group-hover:text-zinc-700 transition-colors">{label}</p>
    <div>
      <p className="text-3xl font-black text-zinc-900 tracking-tight">{value}</p>
      {sub && <p className="text-xs font-medium text-zinc-400 mt-1">{sub}</p>}
    </div>
  </div>
);

const FunnelBar = ({ label, count, max, accent }: { label: string; count: number; max: number; accent?: boolean }) => {
  const pct = max > 0 ? (count / max) * 100 : 0;
  return (
    <div className="flex items-center gap-3">
      <span className="text-xxs font-black uppercase tracking-widest text-zinc-500 w-24 text-right shrink-0">
        {label}
      </span>
      <div className="flex-1 h-3 bg-zinc-100 overflow-hidden rounded-r-sm">
        <div
          className="h-full transition-all duration-1000 ease-in-out"
          style={{
            width: `${Math.max(pct, count > 0 ? 4 : 0)}%`,
            backgroundColor: accent ? '#00CC6A' : '#18181b',
          }}
        />
      </div>
      <span className={cn('text-sm font-black w-8', count === 0 ? 'text-zinc-300' : 'text-zinc-900')}>
        {count}
      </span>
    </div>
  );
};

const StageBadge = ({ stage }: { stage: PipelineStage }) => {
  const config = STAGE_CONFIGS[stage];
  const isWon = stage === 'won';
  return (
    <span className={cn(
      'text-2xs font-black uppercase tracking-widest px-2 py-0.5 inline-flex items-center gap-1',
      isWon
        ? 'bg-[#00CC6A]/10 text-zinc-900 border border-[#00CC6A]/30'
        : 'bg-zinc-100 text-zinc-500 border border-zinc-200',
    )}>
      {config.labelShort}
    </span>
  );
};

const RevOpsCopilot = ({
  activeTab,
  vendas,
  diagnostico,
  execucao,
}: {
  activeTab: 'vendas' | 'projetos';
  vendas: ProjectRow[];
  diagnostico: ProjectRow[];
  execucao: ProjectRow[];
}) => {
  let insight = '';
  let type: 'alert' | 'success' | 'neutral' = 'neutral';

  // Heurística de Vendas
  if (activeTab === 'vendas') {
    const stagnant = vendas.filter(v => v.pipeline_stage === 'proposal_sent' && v.days_in_stage > 7);
    if (stagnant.length > 0) {
      const riskValue = pipelineValue(stagnant);
      insight = `Atenção Crítica: Você tem ${stagnant.length} proposta(s) parada(s) há mais de 7 dias. Risco estimado de ${formatCurrency(riskValue)} de vazamento no pipeline.`;
      type = 'alert';
    } else if (diagnostico.length < 3) {
      insight = 'Topo do Funil reduzido: Apenas captação orgânica insuficiente para bater metas de fechamento. Aumente geração de Inbound.';
      type = 'alert';
    } else {
      const biggestDeal = vendas.reduce((max, v) => {
        const val = pipelineValue([v]);
        const mVal = pipelineValue([max]);
        return val > mVal ? v : max;
      }, vendas[0]);

      if (biggestDeal && pipelineValue([biggestDeal]) > 0) {
        insight = `Ação Ouro: A oportunidade "${biggestDeal.display_name}" tem o maior impacto esperado atual (${formatCurrency(pipelineValue([biggestDeal]))}). Dê máxima atenção em follow-up hoje.`;
        type = 'success';
      } else {
        insight = 'Pipeline de Vendas operando dentro da normalidade rotineira. Explore prospecção outbound (Hunting).';
        type = 'neutral';
      }
    }
  } 
  // Heurística de Execução
  else {
    const churnRisk = execucao.find(p => p.pipeline_stage === 'onboarding' && p.overdue_tasks > 0 && p.days_in_stage > 10);
    if (churnRisk) {
      insight = `Risco de Atrito/Churn: O projeto "${churnRisk.display_name}" travou no Onboarding há ${churnRisk.days_in_stage} dias com tarefas crônicas atrasadas.`;
      type = 'alert';
    } else {
      const totalOverdue = execucao.reduce((sum, p) => sum + p.overdue_tasks, 0);
      if (totalOverdue === 0 && execucao.length > 0) {
        insight = `Excepcional: Todos os ${execucao.length} projetos base ativos estão 100% em dia. TTV (Time-to-Value) acelerado e retenção blindada.`;
        type = 'success';
      } else if (totalOverdue > 5) {
        insight = `Queda de Velocidade: A base total acumula ${totalOverdue} tarefas pendentes. Realoque os times de backoffice para destravar a infra.`;
        type = 'alert';
      } else {
         insight = 'Acompanhamento base operando sem gargalos de serviço catastróficos sistêmicos.';
         type = 'neutral';
      }
    }
  }

  return (
    <div className="bg-white border border-zinc-200 p-6 flex items-start gap-4 mb-10 relative overflow-hidden">
      {/* Accent line */}
      <div className={cn(
        "absolute top-0 left-0 w-1 h-full",
        type === 'alert' ? 'bg-zinc-900' : type === 'success' ? 'bg-[#00CC6A]' : 'bg-zinc-200'
      )} />
      
      <div className="mt-0.5 shrink-0">
        <Radar className={cn(
          "w-5 h-5",
          type === 'alert' ? 'text-zinc-900' : type === 'success' ? 'text-[#00CC6A]' : 'text-zinc-400'
        )} />
      </div>
      <div>
        <h4 className="flex items-center gap-2 text-xxs font-black uppercase tracking-[0.25em] text-zinc-900 mb-2">
          CRO Copilot Analytics
          {type === 'alert' && (
            <span className="text-3xs font-black uppercase tracking-widest text-white bg-zinc-900 px-1.5 py-0.5">
              Attention
            </span>
          )}
        </h4>
        <p className="text-sm font-medium text-zinc-500 leading-relaxed max-w-4xl">{insight}</p>
      </div>
    </div>
  );
};

const StageActionButton = ({
  label,
  onClick,
  loading,
  variant = 'default',
}: {
  label: string;
  onClick: () => void;
  loading?: boolean;
  variant?: 'default' | 'accent' | 'danger';
}) => (
  <button
    onClick={(e) => { e.stopPropagation(); onClick(); }}
    disabled={loading}
    className={cn(
      'text-2xs font-black uppercase tracking-widest px-2.5 py-1 border transition-all disabled:opacity-50',
      variant === 'accent' && 'bg-[#00CC6A]/10 text-zinc-900 border-[#00CC6A]/30 hover:bg-[#00CC6A]/20',
      variant === 'danger' && 'bg-zinc-100 text-zinc-400 border-zinc-200 hover:text-zinc-600',
      variant === 'default' && 'border-zinc-200 bg-transparent text-zinc-900 hover:bg-zinc-950 hover:text-white hover:border-zinc-950',
    )}
  >
    {loading ? '...' : label}
  </button>
);

// ---- Lead Row (Diagnostico section) ----

const DiagnosticoRow = ({
  project,
  onAction,
  onOpenWarRoom,
  onCreateProposal,
  transitioning,
}: {
  project: ProjectRow;
  onAction: (id: string, stage: PipelineStage) => void;
  onOpenWarRoom: (p: ProjectRow) => void;
  onCreateProposal?: (opportunityId: string) => void;
  transitioning: string | null;
}) => {
  const Icon = stageIcon(project.pipeline_stage || 'lead_inbound');
  const source = project.lead_source as LeadSource | null;
  return (
    <div
      onClick={() => onOpenWarRoom(project)}
      className="bg-white border border-zinc-200 p-4 cursor-pointer hover:border-zinc-400 transition-all group"
    >
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 bg-zinc-50 border border-zinc-200 flex items-center justify-center shrink-0">
          <Icon className="w-4 h-4 text-zinc-900" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-sm font-black text-zinc-900 truncate">{project.display_name}</span>
            <StageBadge stage={project.pipeline_stage || 'lead_inbound'} />
          </div>
          <div className="flex items-center gap-3 text-xxs font-medium text-zinc-400">
            {source && <span>{LEAD_SOURCE_LABELS[source] || source}</span>}
            {project.maturity_pct > 0 && <span>Score: {project.maturity_pct}%</span>}
            <span>{project.days_in_stage}d neste estagio</span>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <select
            onClick={(e) => e.stopPropagation()}
            onChange={(e) => onAction(project.id, e.target.value as PipelineStage)}
            value={project.pipeline_stage || 'lead_inbound'}
            disabled={transitioning === project.id}
            className="text-xs font-black uppercase tracking-widest text-zinc-700 bg-zinc-50 border border-zinc-200 outline-none p-1.5 focus:border-zinc-900 cursor-pointer disabled:opacity-50"
          >
            <option value="lead_inbound">Lead Inbound</option>
            <option value="lead_qualified">Qualificado</option>
            <option value="diagnostic_done">Lead com Diagnostico</option>
            <option value="lost">Desqualificado / Perdido</option>
          </select>
          {project.pipeline_stage === 'diagnostic_done' && onCreateProposal && (
            <StageActionButton
              label="Criar Novo Deal Room"
              variant="accent"
              onClick={() => onCreateProposal(project.id)}
              loading={transitioning === project.id}
            />
          )}
          <ChevronRight className="w-3.5 h-3.5 text-zinc-300 group-hover:text-zinc-600 transition-colors" />
        </div>
      </div>
    </div>
  );
};

// ---- Opportunity Row (Vendas section) ----

const VendasRow = ({
  project,
  onAction,
  onOpenWarRoom,
  onSendProposal,
  transitioning,
}: {
  project: ProjectRow;
  onAction: (id: string, stage: PipelineStage) => void;
  onOpenWarRoom: (p: ProjectRow) => void;
  onSendProposal?: (opportunityId: string) => void;
  transitioning: string | null;
}) => {
  const Icon = stageIcon(project.pipeline_stage || 'proposal_draft');
  const opp = project.opportunity_data;
  const investMin = opp?.investimento_estimado?.range_min || 0;
  const investMax = opp?.investimento_estimado?.range_max || 0;
  const investAvg = investMin && investMax ? (investMin + investMax) / 2 : 0;

  return (
    <div
      onClick={() => onOpenWarRoom(project)}
      className="bg-white border border-zinc-200 p-4 cursor-pointer hover:border-zinc-400 transition-all group"
    >
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 bg-zinc-50 border border-zinc-200 flex items-center justify-center shrink-0 mt-0.5">
          <Icon className="w-4 h-4 text-zinc-900" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-black text-zinc-900 truncate">{project.display_name}</span>
            <StageBadge stage={project.pipeline_stage || 'proposal_draft'} />
          </div>
          <div className="grid grid-cols-4 gap-3 mt-2">
            <div>
              <p className="text-2xs font-black uppercase tracking-widest text-zinc-400">Fechamento</p>
              <p className="text-sm font-black text-zinc-900">{opp?.score_fechamento ?? '-'}%</p>
            </div>
            <div>
              <p className="text-2xs font-black uppercase tracking-widest text-zinc-400">Objeções</p>
              <p className="text-sm font-black text-zinc-900">{opp?.objecoes_detectadas?.length ?? 0}</p>
            </div>
            <div>
              <p className="text-2xs font-black uppercase tracking-widest text-zinc-400">Sinais</p>
              <p className="text-sm font-black text-zinc-900">{opp?.sinais_compra?.length ?? 0}</p>
            </div>
            <div>
              <p className="text-2xs font-black uppercase tracking-widest text-zinc-400">Investimento</p>
              <p className="text-sm font-black text-zinc-900">{investAvg > 0 ? formatCurrency(investAvg) : '-'}</p>
            </div>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1.5 shrink-0">
          <select
            onClick={(e) => e.stopPropagation()}
            onChange={(e) => {
              if (e.target.value === 'lost') {
                if (window.confirm(`Deseja mesmo arquivar "${project.display_name}" como PERDIDO?`)) {
                  onAction(project.id, 'lost');
                } else {
                  e.target.value = project.pipeline_stage || 'proposal_draft';
                }
              } else {
                onAction(project.id, e.target.value as PipelineStage);
              }
            }}
            value={project.pipeline_stage || 'proposal_draft'}
            disabled={transitioning === project.id}
            className="text-xs font-black uppercase tracking-widest text-zinc-700 bg-zinc-50 border border-zinc-200 outline-none p-1.5 focus:border-zinc-900 cursor-pointer disabled:opacity-50"
          >
            <option value="proposal_draft">Em Elaboração</option>
            <option value="proposal_sent">Enviada</option>
            <option value="proposal_viewed">Visualizada</option>
            <option value="negotiation">Em Negociação</option>
            <option value="won">Fechar Venda (Won)</option>
            <option value="lost">Perdido</option>
          </select>
          {project.pipeline_stage === 'proposal_draft' && onSendProposal && (
            <StageActionButton
              label="Enviar Link (Público)"
              onClick={() => onSendProposal(project.id)}
              loading={transitioning === project.id}
            />
          )}
          <span className="text-xxs font-medium text-zinc-400 mt-0.5">{project.days_in_stage}d</span>
        </div>
      </div>
    </div>
  );
};

// ---- Project Row (Execucao section) ----

const ExecucaoRow = ({
  project,
  onAction,
  transitioning,
}: {
  project: ProjectRow;
  onAction: (id: string, stage: PipelineStage) => void;
  transitioning: string | null;
}) => {
  const navigate = useNavigate();
  const Icon = stageIcon(project.pipeline_stage || 'active');
  const pctDone = project.total_tasks > 0 ? Math.round((project.done_tasks / project.total_tasks) * 100) : 0;

  const PHASE_LABELS: Record<number, string> = {
    1: 'Fase 01: Diagnostico',
    2: 'Fase 02: Agendamento',
    3: 'Fase 03: Planejamento',
    4: 'Fase 04: Go Live',
  };
  const phase = project.onboarding_phase || 1;
  const daysInPhase = project.days_in_phase || 0;
  const isStuck = daysInPhase > 10 && project.pipeline_stage !== 'active' && project.pipeline_stage !== 'completed';

  return (
    <div
      onClick={() => navigate(`/admin/projects/${project.id}`)}
      className="bg-white border border-zinc-200 p-4 cursor-pointer hover:border-zinc-400 transition-all group"
    >
      <div className="flex items-center gap-3">
        <div className={cn(
          'w-9 h-9 flex items-center justify-center shrink-0',
          project.pipeline_stage === 'won'
            ? 'border border-[#00CC6A]/20'
            : 'bg-zinc-50 border border-zinc-200',
        )}>
          <Icon className={cn(
            'w-4 h-4',
            project.pipeline_stage === 'won' ? 'text-[#00CC6A]' : 'text-zinc-900',
          )} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="text-sm font-black text-zinc-900 truncate">{project.display_name}</span>
            <StageBadge stage={project.pipeline_stage || 'active'} />
            {project.pipeline_stage !== 'won' && project.pipeline_stage !== 'completed' && (
              <span className="text-[10px] font-black uppercase tracking-widest text-[#00CC6A] bg-[#00CC6A]/10 px-2 py-0.5">
                {PHASE_LABELS[phase] || `Fase ${phase}`}
              </span>
            )}
            {isStuck && (
              <span className="text-[10px] font-black uppercase tracking-widest text-zinc-900 bg-zinc-100 border border-zinc-300 px-2 py-0.5 flex items-center gap-1">
                <AlertTriangle className="w-2.5 h-2.5" />
                Parado {daysInPhase}d
              </span>
            )}
          </div>
          <div className="flex items-center gap-4 mt-1">
            <div className="flex items-center gap-1.5">
              <div className="w-20 h-1.5 bg-zinc-100 overflow-hidden">
                <div
                  className="h-full bg-zinc-900 transition-all"
                  style={{ width: `${pctDone}%` }}
                />
              </div>
              <span className="text-xxs font-black text-zinc-500">{pctDone}%</span>
            </div>
            <span className="text-xxs font-medium text-zinc-400">
              {project.done_tasks}/{project.total_tasks} tarefas
            </span>
            {project.overdue_tasks > 0 && (
              <span className="text-xxs font-black text-zinc-900 flex items-center gap-0.5">
                <AlertTriangle className="w-2.5 h-2.5" /> {project.overdue_tasks} atrasada(s)
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {project.pipeline_stage === 'won' && (
            <StageActionButton
              label="Iniciar Jornada"
              variant="accent"
              onClick={() => navigate(`/admin/projects/${project.id}/jornada`)}
              loading={false}
            />
          )}
          <select
            onClick={(e) => e.stopPropagation()}
            onChange={(e) => onAction(project.id, e.target.value as PipelineStage)}
            value={project.pipeline_stage || 'active'}
            disabled={transitioning === project.id}
            className="text-xs font-black uppercase tracking-widest text-zinc-700 bg-zinc-50 border border-zinc-200 outline-none p-1.5 focus:border-zinc-900 cursor-pointer disabled:opacity-50"
          >
            <option value="won">Aguardando Onboarding</option>
            <option value="onboarding">Em Onboarding</option>
            <option value="active">Em Execução (Ativo)</option>
            <option value="completed">Concluído</option>
            <option value="churned">Churn / Pausado</option>
          </select>
          <ChevronRight className="w-3.5 h-3.5 text-zinc-300 group-hover:text-zinc-600 transition-colors" />
        </div>
      </div>
    </div>
  );
};

// ---- Section Header (inline, for left-aligned admin headers) ----

const SectionTitle = ({
  eyebrow,
  title,
  description,
  count,
}: {
  eyebrow: string;
  title: string;
  description?: string;
  count?: number;
}) => (
  <div className="mb-6">
    <p className="text-xxs font-black uppercase tracking-[0.25em] text-zinc-400 mb-2">{eyebrow}</p>
    <div className="flex items-baseline gap-3">
      <h2 className="text-3xl font-black tracking-tight text-zinc-900">{title}</h2>
      {count !== undefined && (
        <span className="text-lg font-black text-zinc-300">{count}</span>
      )}
    </div>
    {description && (
      <p className="text-body font-medium text-zinc-500 mt-1 leading-relaxed">{description}</p>
    )}
  </div>
);

// ═══════════════════════════════════════════════════════════════════════════════
// ── Main Component ───────────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════

export const RevenueCockpit: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [transitioning, setTransitioning] = useState<string | null>(null);

  // Tab navigation
  const [activeTab, setActiveTab] = useState<'vendas' | 'projetos' | 'network'>('vendas');
  // Sub-view mode for vendas tab (Notion-style multi-view)
  const [vendasView, setVendasView] = useState<'list' | 'kanban' | 'followups'>('list');

  // Filters
  const [filterSource, setFilterSource] = useState<string | null>(null);
  const [filterMinDays, setFilterMinDays] = useState<number | null>(null);
  const [filterMinInvestment, setFilterMinInvestment] = useState<number | null>(null);
  const activeFilterCount = [filterSource, filterMinDays, filterMinInvestment].filter(Boolean).length;
  const clearFilters = () => { setFilterSource(null); setFilterMinDays(null); setFilterMinInvestment(null); };

  // War Room sheet state
  const [warRoomOpen, setWarRoomOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState<ProjectRow | null>(null);

  // Fast Lead Drawer state
  const [leadDrawerOpen, setLeadDrawerOpen] = useState(false);

  // Deal Closing state
  const [dealClosingModalOpen, setDealClosingModalOpen] = useState(false);
  const [selectedLeadForClosing, setSelectedLeadForClosing] = useState<ProjectRow | null>(null);

  // ---- Data loading (React Query) ----

  // OPPORTUNITIES: leads + vendas (pre-sale)
  const { data: opportunities = [], isLoading: loadingOpps, refetch: refetchOpps } = useQuery({
    queryKey: ['revenue-opportunities'],
    queryFn: async () => {
      const { data: rawOpps, error } = await supabase
        .from('opportunities')
        .select(`
          id, client_name, client_company, trade_name, type, pipeline_stage,
          lead_source, opportunity_data, enrichment_data, diagnostico_id,
          created_at, updated_at,
          diagnosticos ( score, tipo )
        `)
        .neq('pipeline_stage', 'won')
        .order('updated_at', { ascending: false });

      if (error) throw error;
      if (!rawOpps?.length) return [];

      return (rawOpps as any[]).map((opp: any) => ({
        id: opp.id,
        client_name: opp.client_name,
        client_company: opp.client_company,
        trade_name: opp.trade_name,
        type: opp.type,
        status: 'opportunity',
        pipeline_stage: opp.pipeline_stage || 'lead_inbound',
        lead_source: opp.lead_source || null,
        opportunity_data: opp.opportunity_data || null,
        enrichment_data: opp.enrichment_data || null,
        created_at: opp.created_at,
        updated_at: opp.updated_at,
        maturity_pct: 0,
        rei_score: 0,
        plan_status: null,
        total_tasks: 0,
        done_tasks: 0,
        overdue_tasks: 0,
        display_name: getDisplayName({ trade_name: opp.trade_name, client_company: opp.client_company, client_name: opp.client_name }),
        days_in_stage: getDaysSince(opp.updated_at),
        // Diagnostico data (joined)
        diagnostico_score: opp.diagnosticos?.score || null,
        diagnostico_tipo: opp.diagnosticos?.tipo || null,
      } as ProjectRow));
    }
  });

  // PROJECTS: execucao (post-sale)
  const { data: projects = [], isLoading: loadingProjects, refetch: refetchProjects } = useQuery({
    queryKey: ['revenue-projects'],
    queryFn: async () => {
      const { data: rawProjects, error } = await supabase
        .from('rei_projects')
        .select('id, client_name, client_company, trade_name, type, status, pipeline_stage, created_at, updated_at, onboarding_phase, onboarding_phase_entered_at')
        .in('pipeline_stage', ['won', 'onboarding', 'active', 'completed'])
        .order('updated_at', { ascending: false });

      if (error) throw error;
      if (!rawProjects?.length) return [];

      const ids = rawProjects.map(p => p.id);

      // Tasks for execution projects
      const { data: tasks } = await supabase
        .from('orqflow_tasks')
        .select('id, project_id, status, due_date')
        .in('project_id', ids)
        .not('status', 'eq', 'archived');

      const todayIso = new Date().toISOString();

      return rawProjects.map((proj: any) => {
        const ptasks = tasks?.filter(t => t.project_id === proj.id) || [];
        const done = ptasks.filter(t => t.status === 'done').length;
        const overdue = ptasks.filter(t => t.due_date && t.due_date < todayIso && t.status !== 'done').length;

        return {
          id: proj.id,
          client_name: proj.client_name,
          client_company: proj.client_company,
          trade_name: proj.trade_name,
          type: proj.type,
          status: proj.status,
          pipeline_stage: proj.pipeline_stage || 'active',
          lead_source: null,
          opportunity_data: null,
          created_at: proj.created_at,
          updated_at: proj.updated_at,
          maturity_pct: 0,
          rei_score: 0,
          plan_status: null,
          display_name: getDisplayName({ trade_name: proj.trade_name, client_company: proj.client_company, client_name: proj.client_name }),
          days_in_stage: getDaysSince(proj.updated_at),
          onboarding_phase: proj.onboarding_phase || 1,
          onboarding_phase_entered_at: proj.onboarding_phase_entered_at || proj.created_at,
          days_in_phase: getDaysSince(proj.onboarding_phase_entered_at || proj.updated_at),
        } as ProjectRow;
      });
    }
  });

  const loading = loadingOpps || loadingProjects;
  const loadAll = () => { refetchOpps(); refetchProjects(); };

  // ---- Stage transition handler ----

  const handleAdvance = useCallback(async (entityId: string, newStage: PipelineStage) => {
    // Check if this is an opportunity (pre-sale) or project (execution)
    const isOpp = opportunities.some(o => o.id === entityId);

    if (newStage === 'won' && isOpp) {
      const opp = opportunities.find(x => x.id === entityId);
      if (opp) {
        setSelectedLeadForClosing(opp);
        setDealClosingModalOpen(true);
        return;
      }
    }

    setTransitioning(entityId);

    let result;
    if (isOpp) {
      // Advance opportunity stage
      result = await advanceOpportunityStage(entityId, newStage as any);
    } else {
      // Advance project stage
      result = await advanceStage(entityId, newStage);
    }

    setTransitioning(null);

    if (!result.success) {
      toast({ title: 'Erro na transicao', description: result.error, variant: 'destructive' });
      return;
    }

    toast({
      title: 'Estagio atualizado',
      description: `Movido para ${STAGE_CONFIGS[newStage].label}`,
    });

    queryClient.invalidateQueries({ queryKey: ['revenue-opportunities'] });
    queryClient.invalidateQueries({ queryKey: ['revenue-projects'] });
  }, [queryClient, toast, opportunities]);

  // ---- Open War Room ----

  const openWarRoom = useCallback((p: ProjectRow) => {
    setSelectedLead(p);
    setWarRoomOpen(true);
  }, []);

  // ---- Send Proposal (copy link + advance stage) ----

  const handleSendProposal = useCallback(async (opportunityId: string) => {
    setTransitioning(opportunityId);
    try {
      // Find linked proposal
      const { data: proposals } = await supabase
        .from('proposals')
        .select('id, slug')
        .eq('opportunity_id', opportunityId)
        .order('created_at', { ascending: false })
        .limit(1);

      if (proposals && proposals.length > 0) {
        const slug = proposals[0].slug;
        const url = `${window.location.origin}/p/${slug}`;

        // Copy to clipboard
        await navigator.clipboard.writeText(url);

        // Update proposal status to sent
        await supabase
          .from('proposals')
          .update({ status: 'sent' })
          .eq('id', proposals[0].id);

        // Advance opportunity stage
        await advanceOpportunityStage(opportunityId, 'proposal_sent' as any, 'Proposta enviada ao cliente');

        toast({
          title: 'Link copiado e proposta enviada',
          description: `Link da proposta copiado para a area de transferencia`,
        });

        queryClient.invalidateQueries({ queryKey: ['revenue-opportunities'] });
      } else {
        toast({
          title: 'Nenhuma proposta encontrada',
          description: 'Crie uma proposta primeiro antes de enviar.',
          variant: 'destructive',
        });
      }
    } catch (err: any) {
      toast({ title: 'Erro', description: err.message, variant: 'destructive' });
    } finally {
      setTransitioning(null);
    }
  }, [toast, queryClient]);

  // ---- Grouped data ----

  const applyFilters = useCallback((items: ProjectRow[]) => {
    let result = items;
    if (filterSource) {
      result = result.filter(p => (p.lead_source || 'manual') === filterSource);
    }
    if (filterMinDays) {
      result = result.filter(p => p.days_in_stage >= filterMinDays);
    }
    if (filterMinInvestment) {
      result = result.filter(p => {
        const inv = (p.opportunity_data as any)?.investment || 0;
        return inv >= filterMinInvestment;
      });
    }
    return result;
  }, [filterSource, filterMinDays, filterMinInvestment]);

  const diagnostico = useMemo(
    () => applyFilters(opportunities.filter(p => p.pipeline_stage && DIAGNOSTICO_STAGES.includes(p.pipeline_stage))),
    [opportunities, applyFilters],
  );

  const vendas = useMemo(
    () => applyFilters(opportunities.filter(p => p.pipeline_stage && VENDAS_STAGES.includes(p.pipeline_stage))),
    [opportunities, applyFilters],
  );

  const network = useMemo(
    () => opportunities.filter(p => p.pipeline_stage === 'lost'),
    [opportunities],
  );

  const execucao = useMemo(
    () => projects.filter(p => p.pipeline_stage && EXECUCAO_STAGES.includes(p.pipeline_stage)),
    [projects],
  );

  // ---- Aggregate metrics ----

  const totalPipelineValue = useMemo(() => pipelineValue(vendas), [vendas]);

  const stageCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    // Count from opportunities (pre-sale)
    for (const o of opportunities) {
      const s = o.pipeline_stage || 'unknown';
      counts[s] = (counts[s] || 0) + 1;
    }
    // Count from projects (execution)
    for (const p of projects) {
      const s = p.pipeline_stage || 'unknown';
      counts[s] = (counts[s] || 0) + 1;
    }
    return counts;
  }, [opportunities, projects]);

  const maxStageCount = useMemo(() => {
    return Math.max(...Object.values(stageCounts), 1);
  }, [stageCounts]);

  // Lead source breakdown
  const sourceBreakdown = useMemo(() => {
    const map: Record<string, number> = {};
    diagnostico.forEach(p => {
      const src = p.lead_source || 'manual';
      map[src] = (map[src] || 0) + 1;
    });
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  }, [diagnostico]);

  // Win rate (based on execution projects vs lost opportunities)
  const winRate = useMemo(() => {
    const wonCount = projects.filter(p => EXECUCAO_STAGES.includes(p.pipeline_stage as PipelineStage)).length;
    const lostCount = opportunities.filter(p => p.pipeline_stage === 'lost').length;
    const total = wonCount + lostCount;
    return total > 0 ? Math.round((wonCount / total) * 100) : 0;
  }, [projects, opportunities]);

  // Avg days in vendas stages
  const avgDaysVendas = useMemo(() => {
    if (vendas.length === 0) return 0;
    return Math.round(vendas.reduce((s, p) => s + p.days_in_stage, 0) / vendas.length);
  }, [vendas]);

  // Overdue count for execucao
  const totalOverdue = useMemo(
    () => execucao.reduce((s, p) => s + p.overdue_tasks, 0),
    [execucao],
  );

  // WbD Metrics: Activation Rate
  const activationRate = useMemo(() => {
    if (execucao.length === 0) return 0;
    const activeProjects = execucao.filter(p => p.done_tasks > 0).length;
    return Math.round((activeProjects / execucao.length) * 100);
  }, [execucao]);

  // Follow-ups: deals stagnant >3 days needing action
  const followups = useMemo(
    () => [...diagnostico, ...vendas].filter(p => p.days_in_stage >= 3).sort((a, b) => b.days_in_stage - a.days_in_stage),
    [diagnostico, vendas],
  );

  // WbD Metrics: Avg days in execution (TTV proxy)
  const avgTTV = useMemo(() => {
    if (execucao.length === 0) return 0;
    return Math.round(execucao.reduce((s, p) => s + p.days_in_stage, 0) / execucao.length);
  }, [execucao]);

  // ---- Loading state ----

  if (loading) {
    return (
      <AdminLayout>
        <PipelineSkeleton />
      </AdminLayout>
    );
  }

  // ════════════════════════════════════════════════════════════════════════════
  // ── Render ──────────────────────────────────────────────────────────────────
  // ════════════════════════════════════════════════════════════════════════════

  return (
    <>
      <AdminLayout>
        <div className="min-h-screen bg-white">
          <div className="max-w-[1400px] mx-auto px-6 md:px-10 lg:px-14 py-8">

            {/* ── Top bar ─────────────────────────────────────────────────── */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-10 pb-8 border-b border-zinc-100">
              <div>
                <p className="text-xxs font-black uppercase tracking-[0.25em] text-zinc-400 mb-3">
                  Cockpit de Receita
                </p>
                <h1 className="text-5xl md:text-6xl font-black text-zinc-900 tracking-tight leading-[1.05]">
                  Pipeline
                </h1>
              </div>
              <div className="flex gap-2 shrink-0">
                <button
                  onClick={() => loadAll()}
                  className="w-10 h-10 border border-zinc-200 flex items-center justify-center hover:bg-zinc-50 transition-colors"
                >
                  <RefreshCw className="w-4 h-4 text-zinc-500" />
                </button>
                {activeTab === 'vendas' && (
                  <Button
                    onClick={() => setLeadDrawerOpen(true)}
                    className="border border-zinc-200 bg-transparent text-zinc-900 hover:bg-zinc-950 hover:text-white hover:border-zinc-950 font-black uppercase tracking-widest text-xs rounded-none h-10 px-6 flex items-center gap-2 transition-colors"
                  >
                    <Plus className="w-4 h-4" /> <span>Novo Lead</span>
                  </Button>
                )}
              </div>
            </div>

            {/* ── KPI Row ─────────────────────────────────────────────────── */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-5 mb-10">
              {activeTab === 'vendas' ? (
                <>
                  <MetricCard label="Qualified Leads" value={diagnostico.length} sub="Topo de funil (Inbound & Outbound)" />
                  <MetricCard label="Active Deals" value={vendas.length} sub={totalPipelineValue > 0 ? `${formatCurrency(totalPipelineValue)} no Pipe real` : 'Pipeline vazio'} />
                  <MetricCard label="Average Cycle" value={`${avgDaysVendas}d`} sub="Dias médios em negociação" />
                  <MetricCard label="Win Rate" value={`${winRate}%`} sub="Conversão histórica apurada" />
                </>
              ) : (
                <>
                  <MetricCard label="Active Portfolio" value={execucao.length} sub="Projetos vivos na base" />
                  <MetricCard label="Activation Rate" value={`${activationRate}%`} sub="Engajamento inicial Pós-Venda" />
                  <MetricCard label="Time-To-Value" value={`${avgTTV}d`} sub="Dias médios até ativação" />
                  <MetricCard label="Overdue Risk" value={totalOverdue} sub={totalOverdue > 0 ? "Tarefas cronicamente atrasadas" : "Gargalo zero"} />
                </>
              )}
            </div>

            {/* ── Tab Navigator ───────────────────────────────────────── */}
            <div className="flex flex-wrap items-center gap-0 mb-8 border-b border-zinc-200">
              <button
                onClick={() => setActiveTab('vendas')}
                className={cn(
                  'px-6 py-3 text-xs font-black uppercase tracking-[0.15em] border-b-2 transition-all',
                  activeTab === 'vendas'
                    ? 'border-zinc-900 text-zinc-900'
                    : 'border-transparent text-zinc-400 hover:text-zinc-600',
                )}
              >
                Pipeline de Vendas
              </button>
              <button
                onClick={() => setActiveTab('projetos')}
                className={cn(
                  'px-6 py-3 text-xs font-black uppercase tracking-[0.15em] border-b-2 transition-all flex items-center gap-2',
                  activeTab === 'projetos'
                    ? 'border-zinc-900 text-zinc-900'
                    : 'border-transparent text-zinc-400 hover:text-zinc-600',
                )}
              >
                Projeção de Projetos
                {totalOverdue > 0 && (
                  <span className={cn(
                    "w-4 h-4 text-[10px] font-black flex items-center justify-center rounded-sm leading-none",
                    activeTab === 'projetos' ? "bg-zinc-900 text-white" : "bg-zinc-200 text-zinc-500"
                  )}>
                    {totalOverdue}
                  </span>
                )}
              </button>
              <button
                onClick={() => setActiveTab('network')}
                className={cn(
                  'px-6 py-3 text-xs font-black uppercase tracking-[0.15em] border-b-2 transition-all flex items-center gap-2',
                  activeTab === 'network'
                    ? 'border-zinc-900 text-zinc-900'
                    : 'border-transparent text-zinc-400 hover:text-zinc-600',
                )}
              >
                Base de Contatos
                {network.length > 0 && (
                  <span className={cn(
                    "w-auto px-1.5 h-4 text-[10px] font-black flex items-center justify-center rounded-sm leading-none",
                    activeTab === 'network' ? "bg-zinc-100 text-zinc-600" : "bg-zinc-50 text-zinc-400"
                  )}>
                    {network.length}
                  </span>
                )}
              </button>
            </div>

            {/* ── Copilot Engine ────────────────────────────────────────── */}
            <RevOpsCopilot 
              activeTab={activeTab as 'vendas' | 'projetos'} 
              diagnostico={diagnostico} 
              vendas={vendas} 
              execucao={execucao} 
            />

            {/* ── Sub-view switcher (vendas tab only, Notion-style) ──── */}
            {activeTab === 'vendas' && (
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-1 border border-zinc-200 p-0.5">
                  {([
                    { key: 'list' as const,      icon: LayoutList, label: 'Lista' },
                    { key: 'kanban' as const,     icon: Columns3,  label: 'Kanban' },
                    { key: 'followups' as const,  icon: Filter,    label: `Follow-ups${followups.length > 0 ? ` (${followups.length})` : ''}` },
                  ]).map(({ key, icon: VIcon, label }) => (
                    <button
                      key={key}
                      onClick={() => setVendasView(key)}
                      className={cn(
                        'flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold transition-colors',
                        vendasView === key
                          ? 'bg-zinc-900 text-white'
                          : 'text-zinc-400 hover:text-zinc-600',
                      )}
                    >
                      <VIcon className="w-3.5 h-3.5" />
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* ── Filter Bar (vendas tab) ─────────────────────────── */}
            {activeTab === 'vendas' && (
              <div className="flex flex-wrap items-center gap-2 mb-6">
                {/* Source filter */}
                <select
                  value={filterSource || ''}
                  onChange={(e) => setFilterSource(e.target.value || null)}
                  className={cn(
                    'text-xs font-bold border px-3 py-1.5 transition-colors cursor-pointer',
                    filterSource
                      ? 'bg-zinc-900 text-white border-zinc-900'
                      : 'text-zinc-400 border-zinc-200 hover:bg-zinc-50'
                  )}
                >
                  <option value="">Fonte do Lead</option>
                  {Object.entries(LEAD_SOURCE_LABELS).map(([key, label]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </select>
                {/* Days filter */}
                <select
                  value={filterMinDays || ''}
                  onChange={(e) => setFilterMinDays(e.target.value ? Number(e.target.value) : null)}
                  className={cn(
                    'text-xs font-bold border px-3 py-1.5 transition-colors cursor-pointer',
                    filterMinDays
                      ? 'bg-zinc-900 text-white border-zinc-900'
                      : 'text-zinc-400 border-zinc-200 hover:bg-zinc-50'
                  )}
                >
                  <option value="">Dias no Estagio</option>
                  <option value="3">3+ dias</option>
                  <option value="7">7+ dias</option>
                  <option value="14">14+ dias</option>
                  <option value="30">30+ dias</option>
                </select>
                {/* Investment filter */}
                <select
                  value={filterMinInvestment || ''}
                  onChange={(e) => setFilterMinInvestment(e.target.value ? Number(e.target.value) : null)}
                  className={cn(
                    'text-xs font-bold border px-3 py-1.5 transition-colors cursor-pointer',
                    filterMinInvestment
                      ? 'bg-zinc-900 text-white border-zinc-900'
                      : 'text-zinc-400 border-zinc-200 hover:bg-zinc-50'
                  )}
                >
                  <option value="">Investimento</option>
                  <option value="0">Qualquer</option>
                  <option value="5000">R$5k+</option>
                  <option value="15000">R$15k+</option>
                  <option value="50000">R$50k+</option>
                </select>
                {activeFilterCount > 0 && (
                  <button
                    onClick={clearFilters}
                    className="flex items-center gap-1 text-xs font-bold text-zinc-400 hover:text-zinc-900 px-2 py-1.5 transition-colors"
                  >
                    <X className="w-3 h-3" />
                    Limpar ({activeFilterCount})
                  </button>
                )}
              </div>
            )}

            {/* ── Funnel Visualization ──────────────────────────────── */}
            {vendasView === 'list' && (
              <div className="bg-white border border-zinc-200 p-5 mb-10">
                <div className="flex items-center gap-2 mb-4">
                  <BarChart3 className="w-4 h-4 text-zinc-400" />
                  <p className="text-xxs font-black uppercase tracking-[0.25em] text-zinc-500">
                    {activeTab === 'vendas' ? 'Funil de Vendas' : 'Funil de Execução'}
                  </p>
                </div>
                <div className="space-y-2">
                  {activeTab === 'vendas' ? (
                    <>
                      {DIAGNOSTICO_STAGES.map(s => (
                        <FunnelBar key={s} label={STAGE_CONFIGS[s].labelShort} count={stageCounts[s] || 0} max={maxStageCount} />
                      ))}
                      {VENDAS_STAGES.map(s => (
                        <FunnelBar key={s} label={STAGE_CONFIGS[s].labelShort} count={stageCounts[s] || 0} max={maxStageCount} />
                      ))}
                    </>
                  ) : (
                    EXECUCAO_STAGES.map(s => (
                      <FunnelBar
                        key={s}
                        label={STAGE_CONFIGS[s].labelShort}
                        count={stageCounts[s] || 0}
                        max={maxStageCount}
                        accent={s === 'won'}
                      />
                    ))
                  )}
                </div>
              </div>
            )}

            {/* ══════════════════════════════════════════════════════════ */}
            {/* ── VENDAS: LIST VIEW (default) ──────────────────────── */}
            {/* ══════════════════════════════════════════════════════════ */}

            {/* ── SECTION 1: DIAGNOSTICO ──────────────────────────────────────── */}
            {activeTab === 'vendas' && vendasView === 'list' && <div className="mb-14">
              <SectionTitle
                eyebrow="Top de Funil"
                title="Diagnóstico"
                description="Leads captados, qualificados e diagnosticados"
                count={diagnostico.length}
              />

              {/* Source breakdown */}
              {sourceBreakdown.length > 0 && (
                <div className="flex flex-wrap gap-3 mb-5">
                  {sourceBreakdown.map(([src, count]) => (
                    <div key={src} className="flex items-center gap-1.5 bg-zinc-50 border border-zinc-200 px-3 py-1.5">
                      <span className="text-xxs font-black uppercase tracking-widest text-zinc-500">
                        {LEAD_SOURCE_LABELS[src as LeadSource] || src}
                      </span>
                      <span className="text-xxs font-black text-zinc-900">{count}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Stage sub-groups */}
              {DIAGNOSTICO_STAGES.map(stage => {
                const stageProjects = diagnostico.filter(p => p.pipeline_stage === stage);
                if (stageProjects.length === 0) return null;
                return (
                  <div key={stage} className="mb-6">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-1.5 h-1.5 bg-zinc-400" />
                      <p className="text-xxs font-black uppercase tracking-widest text-zinc-500">
                        {STAGE_CONFIGS[stage].label}
                      </p>
                      <span className="text-xxs font-medium text-zinc-300">{stageProjects.length}</span>
                    </div>
                    <div className="space-y-3">
                      {stageProjects.map(p => (
                        <DiagnosticoRow
                          key={p.id}
                          project={p}
                          onAction={handleAdvance}
                          onOpenWarRoom={openWarRoom}
                          onCreateProposal={(oppId) => navigate(`/admin/proposals/new?opportunity_id=${oppId}`)}
                          transitioning={transitioning}
                        />
                      ))}
                    </div>
                  </div>
                );
              })}

              {diagnostico.length === 0 && (
                <div className="bg-white border-2 border-dashed border-zinc-200 py-14 text-center">
                  <UserPlus className="w-7 h-7 text-zinc-300 mx-auto mb-2" />
                  <p className="text-sm font-black text-zinc-400">Nenhum lead no funil</p>
                  <p className="text-xs font-medium text-zinc-300 mt-1">Crie um novo lead para comecar.</p>
                </div>
              )}
            </div>}

            {/* ── SECTION 2: VENDAS (list view) ──────────────────────────────── */}
            {activeTab === 'vendas' && vendasView === 'list' && <div className="mb-14">
              <SectionTitle
                eyebrow="Meio de Funil"
                title="Vendas"
                description={`${vendas.length} oportunidade${vendas.length !== 1 ? 's' : ''} em negociação | Pipeline: ${formatCurrency(totalPipelineValue)}`}
                count={vendas.length}
              />

              {/* Stage sub-groups */}
              {VENDAS_STAGES.map(stage => {
                const stageProjects = vendas.filter(p => p.pipeline_stage === stage);
                if (stageProjects.length === 0) return null;
                return (
                  <div key={stage} className="mb-6">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-1.5 h-1.5 bg-zinc-500" />
                      <p className="text-xxs font-black uppercase tracking-widest text-zinc-500">
                        {STAGE_CONFIGS[stage].label}
                      </p>
                      <span className="text-xxs font-medium text-zinc-300">{stageProjects.length}</span>
                    </div>
                    <div className="space-y-3">
                      {stageProjects.map(p => (
                        <VendasRow
                          key={p.id}
                          project={p}
                          onAction={handleAdvance}
                          onOpenWarRoom={openWarRoom}
                          onSendProposal={handleSendProposal}
                          transitioning={transitioning}
                        />
                      ))}
                    </div>
                  </div>
                );
              })}

              {vendas.length === 0 && (
                <div className="bg-white border-2 border-dashed border-zinc-200 py-14 text-center">
                  <Send className="w-7 h-7 text-zinc-300 mx-auto mb-2" />
                  <p className="text-sm font-black text-zinc-400">Nenhuma oportunidade ativa</p>
                  <p className="text-xs font-medium text-zinc-300 mt-1">Mova leads qualificados para vendas.</p>
                </div>
              )}
            </div>}

            {/* ══════════════════════════════════════════════════════════ */}
            {/* ── VENDAS: KANBAN VIEW ──────────────────────────────── */}
            {/* ══════════════════════════════════════════════════════════ */}
            {activeTab === 'vendas' && vendasView === 'kanban' && (
              <div className="mb-14">
                <div className="overflow-x-auto -mx-6 md:-mx-10 lg:-mx-14 px-6 md:px-10 lg:px-14">
                  <div className="flex gap-4 min-w-max pb-4">
                    {[...DIAGNOSTICO_STAGES, ...VENDAS_STAGES].map(stage => {
                      const stageItems = [...diagnostico, ...vendas].filter(p => p.pipeline_stage === stage);
                      const isVendasStage = VENDAS_STAGES.includes(stage);
                      return (
                        <div key={stage} className="w-[280px] shrink-0">
                          {/* Column header */}
                          <div className="flex items-center gap-2 mb-3 px-1">
                            <div className={cn(
                              'w-2 h-2 rounded-full',
                              isVendasStage ? 'bg-zinc-900' : 'bg-zinc-400',
                            )} />
                            <span className="text-xs font-black uppercase tracking-widest text-zinc-500">
                              {STAGE_CONFIGS[stage].labelShort}
                            </span>
                            <span className="text-xs text-zinc-300 ml-auto">{stageItems.length}</span>
                          </div>

                          {/* Cards */}
                          <div className="space-y-2">
                            {stageItems.length === 0 ? (
                              <div className="border border-dashed border-zinc-200 p-4 text-center">
                                <p className="text-xxs font-medium text-zinc-300">Vazio</p>
                              </div>
                            ) : (
                              stageItems.map(p => {
                                const opp = p.opportunity_data;
                                const investAvg = opp?.investimento_estimado
                                  ? (opp.investimento_estimado.range_min + opp.investimento_estimado.range_max) / 2
                                  : 0;
                                return (
                                  <div
                                    key={p.id}
                                    onClick={() => openWarRoom(p)}
                                    className="bg-white border border-zinc-200 p-3 hover:shadow-sm transition-shadow cursor-pointer"
                                  >
                                    <p className="text-sm font-bold text-zinc-900 truncate mb-1">{p.display_name}</p>
                                    <div className="flex items-center justify-between">
                                      <span className="text-xxs font-medium text-zinc-400">
                                        {p.days_in_stage}d neste estagio
                                      </span>
                                      {investAvg > 0 && (
                                        <span className="text-xxs font-black text-zinc-600">
                                          {formatCurrency(investAvg)}
                                        </span>
                                      )}
                                    </div>
                                    {p.days_in_stage >= 5 && (
                                      <div className="mt-2 flex items-center gap-1">
                                        <Clock className="w-3 h-3 text-zinc-400" />
                                        <span className="text-xxs font-bold text-zinc-500">Precisa de follow-up</span>
                                      </div>
                                    )}
                                  </div>
                                );
                              })
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* ══════════════════════════════════════════════════════════ */}
            {/* ── VENDAS: FOLLOW-UPS VIEW ──────────────────────────── */}
            {/* ══════════════════════════════════════════════════════════ */}
            {activeTab === 'vendas' && vendasView === 'followups' && (
              <div className="mb-14">
                <SectionTitle
                  eyebrow="Acao Necessaria"
                  title="Follow-ups Hoje"
                  description="Leads e oportunidades parados ha 3+ dias sem movimentacao"
                  count={followups.length}
                />

                {followups.length === 0 ? (
                  <div className="bg-white border-2 border-dashed border-zinc-200 py-14 text-center">
                    <CheckCircle2 className="w-7 h-7 text-[#00CC6A] mx-auto mb-2" />
                    <p className="text-sm font-black text-zinc-900">Tudo em dia</p>
                    <p className="text-xs font-medium text-zinc-400 mt-1">Nenhum lead precisa de follow-up agora.</p>
                  </div>
                ) : (
                  <div className="border border-zinc-200 overflow-hidden">
                    {/* Table header */}
                    <div className="grid grid-cols-12 gap-4 px-5 py-3 border-b border-zinc-100 bg-zinc-50">
                      <div className="col-span-4 text-xxs font-black uppercase tracking-widest text-zinc-400">Lead</div>
                      <div className="col-span-2 text-xxs font-black uppercase tracking-widest text-zinc-400">Estagio</div>
                      <div className="col-span-2 text-xxs font-black uppercase tracking-widest text-zinc-400">Dias Parado</div>
                      <div className="col-span-2 text-xxs font-black uppercase tracking-widest text-zinc-400">Investimento</div>
                      <div className="col-span-2 text-xxs font-black uppercase tracking-widest text-zinc-400">Acao</div>
                    </div>
                    {/* Table rows */}
                    <div className="divide-y divide-zinc-50">
                      {followups.map(p => {
                        const opp = p.opportunity_data;
                        const investAvg = opp?.investimento_estimado
                          ? (opp.investimento_estimado.range_min + opp.investimento_estimado.range_max) / 2
                          : 0;
                        return (
                          <div
                            key={p.id}
                            onClick={() => openWarRoom(p)}
                            className="grid grid-cols-12 gap-4 px-5 py-3.5 hover:bg-zinc-50 cursor-pointer transition-colors items-center"
                          >
                            <div className="col-span-4">
                              <p className="text-sm font-bold text-zinc-900 truncate">{p.display_name}</p>
                              <p className="text-xxs font-medium text-zinc-400 truncate mt-0.5">
                                {p.lead_source ? LEAD_SOURCE_LABELS[p.lead_source as LeadSource] || p.lead_source : '-'}
                              </p>
                            </div>
                            <div className="col-span-2">
                              <StageBadge stage={p.pipeline_stage || 'lead_inbound'} />
                            </div>
                            <div className="col-span-2">
                              <span className={cn(
                                'text-sm font-black tabular-nums',
                                p.days_in_stage >= 7 ? 'text-zinc-900' : 'text-zinc-500',
                              )}>
                                {p.days_in_stage}d
                              </span>
                            </div>
                            <div className="col-span-2">
                              <span className="text-sm font-bold text-zinc-600">
                                {investAvg > 0 ? formatCurrency(investAvg) : '-'}
                              </span>
                            </div>
                            <div className="col-span-2">
                              <button
                                onClick={(e) => { e.stopPropagation(); openWarRoom(p); }}
                                className="text-xxs font-black uppercase tracking-widest text-zinc-500 hover:text-zinc-900 transition-colors"
                              >
                                Abrir Dossie
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ── Funnel for Projetos tab ──────────────────────────── */}
            {activeTab === 'projetos' && (
              <div className="bg-white border border-zinc-200 p-5 mb-10">
                <div className="flex items-center gap-2 mb-4">
                  <BarChart3 className="w-4 h-4 text-zinc-400" />
                  <p className="text-xxs font-black uppercase tracking-[0.25em] text-zinc-500">Funil de Execução</p>
                </div>
                <div className="space-y-2">
                  {EXECUCAO_STAGES.map(s => (
                    <FunnelBar
                      key={s}
                      label={STAGE_CONFIGS[s].labelShort}
                      count={stageCounts[s] || 0}
                      max={maxStageCount}
                      accent={s === 'won'}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* ── SECTION 3: EXECUÇÃO ────────────────────────────────────────── */}
            {activeTab === 'projetos' && <div className="mb-14">
              <SectionTitle
                eyebrow="Projeção de Projetos"
                title="Execução"
                description={`${execucao.length} projeto${execucao.length !== 1 ? 's' : ''} em andamento`}
                count={execucao.length}
              />

              {/* Execucao KPIs foram movidos para o Top Bar */}

              {/* Stage sub-groups */}
              {EXECUCAO_STAGES.map(stage => {
                const stageProjects = execucao.filter(p => p.pipeline_stage === stage);
                if (stageProjects.length === 0) return null;
                return (
                  <div key={stage} className="mb-6">
                    <div className="flex items-center gap-2 mb-3">
                      <div className={cn(
                        'w-1.5 h-1.5 ',
                        stage === 'won' ? 'bg-[#00CC6A]' : 'bg-zinc-600',
                      )} />
                      <p className="text-xxs font-black uppercase tracking-widest text-zinc-500">
                        {STAGE_CONFIGS[stage].label}
                      </p>
                      <span className="text-xxs font-medium text-zinc-300">{stageProjects.length}</span>
                    </div>
                    <div className="space-y-3">
                      {stageProjects.map(p => (
                        <ExecucaoRow
                          key={p.id}
                          project={p}
                          onAction={handleAdvance}
                          transitioning={transitioning}
                        />
                      ))}
                    </div>
                  </div>
                );
              })}

              {execucao.length === 0 && (
                <div className="bg-white border-2 border-dashed border-zinc-200 py-14 text-center">
                  <Rocket className="w-7 h-7 text-zinc-300 mx-auto mb-2" />
                  <p className="text-sm font-black text-zinc-400">Nenhum projeto em execução</p>
                  <p className="text-xs font-medium text-zinc-300 mt-1">Feche vendas para iniciar projetos.</p>
                </div>
              )}
            </div>}
            {/* ── SECTION 4: NETWORK / CONTATOS ────────────────────────────────────────── */}
            {activeTab === 'network' && <div className="mb-14">
              <SectionTitle
                eyebrow="Network"
                title="Base de Contatos"
                description={`Lista de contatos e empresas que não estão com negociações ativas no funil.`}
                count={network.length}
              />
              
              <div className="bg-white border border-zinc-200">
                {network.length > 0 ? (
                  <div className="divide-y divide-zinc-100">
                    {network.map(contact => (
                      <div key={contact.id} className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-zinc-50 transition-colors group cursor-pointer" onClick={() => navigate(`/admin/projects/${contact.id}`)}>
                        <div className="flex flex-col md:flex-row md:items-center gap-4">
                          <div className="w-10 h-10 bg-zinc-100 flex items-center justify-center shrink-0">
                            <UserMinus className="w-5 h-5 text-zinc-400" />
                          </div>
                          <div>
                            <h4 className="text-sm font-black text-zinc-900 uppercase tracking-tight">{contact.display_name}</h4>
                            <p className="text-xxs font-bold uppercase tracking-widest text-zinc-400 mt-0.5">{contact.type} • Estagnado há {contact.days_in_stage}d</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-2xs font-black uppercase tracking-widest bg-zinc-100 text-zinc-500 px-2 py-1">
                            Lead Perdido
                          </span>
                          <Button
                            variant="ghost"
                            onClick={(e) => {
                              e.stopPropagation();
                              if(window.confirm('Deseja reativar este lead no funil em "Diagnóstico"?')) {
                                handleAdvance(contact.id, 'lead_inbound');
                              }
                            }}
                            className="bg-zinc-100 hover:bg-black text-zinc-500 hover:text-white rounded-sm h-8 px-3 text-2xs font-black uppercase tracking-widest transition-all"
                          >
                            Reativar Info
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-20 text-center">
                    <UserCheck className="w-8 h-8 text-zinc-200 mx-auto mb-3" />
                    <p className="text-xs font-black text-zinc-400 uppercase tracking-widest">Nenhum contato arquivado</p>
                  </div>
                )}
              </div>
            </div>}

          </div>
        </div>
      </AdminLayout>

      {/* War Room Sheet - Lead Dossie */}
      <LeadWarRoomSheet
        lead={selectedLead ? {
          id: selectedLead.id,
          name: selectedLead.display_name,
          company: selectedLead.client_company || selectedLead.client_name,
          type: selectedLead.type,
          urgencyScore: 0,
          maturityPct: selectedLead.maturity_pct,
          nextAction: STAGE_CONFIGS[selectedLead.pipeline_stage || 'lead_inbound'].description,
          daysSinceActivity: selectedLead.days_in_stage,
          status: selectedLead.status,
        } : null}
        open={warRoomOpen}
        onClose={() => { setWarRoomOpen(false); setSelectedLead(null); }}
        onQualified={loadAll}
      />

      {/* Fast Lead Drawer (Novo Lead) */}
      <FastLeadDrawer
        open={leadDrawerOpen}
        onClose={() => setLeadDrawerOpen(false)}
        onSuccess={loadAll}
      />

      <DealClosingModal
        isOpen={dealClosingModalOpen}
        onClose={() => { setDealClosingModalOpen(false); setSelectedLeadForClosing(null); }}
        opportunity={selectedLeadForClosing}
        onSuccess={loadAll}
      />
    </>
  );
};

export default RevenueCockpit;
