import React, { useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import {
  UserPlus, UserCheck, ClipboardCheck, FileEdit, Send, Eye,
  MessageSquare, Trophy, Rocket, Activity, CheckCircle2,
  XCircle, UserMinus, RefreshCw, Plus, ChevronRight,
  Flame, AlertTriangle, Phone, Target, Zap, BarChart3,
  CalendarCheck, ShieldAlert, TrendingUp, Clock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import AdminLayout from '@/components/layout/AdminLayout';
import { LeadWarRoomSheet } from '@/components/rei/LeadWarRoomSheet';
import { FastLeadDrawer } from '@/components/rei/FastLeadDrawer';
import { DealClosingModal } from '@/components/admin/DealClosingModal';
import {
  PipelineStage,
  STAGE_CONFIGS,
  STAGE_CATEGORIES,
  OpportunityData,
  LEAD_SOURCE_LABELS,
  LeadSource,
} from '@/types/pipeline';
import { advanceStage } from '@/services/PipelineService';
import { useToast } from '@/hooks/use-toast';

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
  created_at: string;
  updated_at: string;
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
}

// ---- Helpers ----

function daysSince(iso: string | null): number {
  if (!iso) return 0;
  return Math.floor((Date.now() - new Date(iso).getTime()) / 86400000);
}

function formatCurrency(val: number): string {
  if (!val) return '-';
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency', currency: 'BRL', maximumFractionDigits: 0,
  }).format(val);
}

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
  <div className="bg-white border border-zinc-200 rounded-2xl shadow-sm p-5">
    <p className="text-[10px] font-black uppercase tracking-[0.25em] text-zinc-400 mb-1">{label}</p>
    <p className="text-2xl font-black text-zinc-900 tracking-tight">{value}</p>
    {sub && <p className="text-[11px] font-medium text-zinc-400 mt-0.5">{sub}</p>}
  </div>
);

const FunnelBar = ({ label, count, max, accent }: { label: string; count: number; max: number; accent?: boolean }) => {
  const pct = max > 0 ? (count / max) * 100 : 0;
  return (
    <div className="flex items-center gap-3">
      <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500 w-24 text-right shrink-0">
        {label}
      </span>
      <div className="flex-1 h-2 bg-zinc-100 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700"
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
      'text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded inline-flex items-center gap-1',
      isWon
        ? 'bg-[#00CC6A]/10 text-[#00CC6A] border border-[#00CC6A]/20'
        : 'bg-zinc-100 text-zinc-500 border border-zinc-200',
    )}>
      {config.labelShort}
    </span>
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
      'text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg border transition-all disabled:opacity-50',
      variant === 'accent' && 'bg-[#00CC6A]/10 text-[#00CC6A] border-[#00CC6A]/20 hover:bg-[#00CC6A]/20',
      variant === 'danger' && 'bg-zinc-100 text-zinc-400 border-zinc-200 hover:text-zinc-600',
      variant === 'default' && 'bg-zinc-950 text-white border-zinc-950 hover:bg-zinc-800',
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
  transitioning,
}: {
  project: ProjectRow;
  onAction: (id: string, stage: PipelineStage) => void;
  onOpenWarRoom: (p: ProjectRow) => void;
  transitioning: string | null;
}) => {
  const Icon = stageIcon(project.pipeline_stage || 'lead_inbound');
  const source = project.lead_source as LeadSource | null;
  return (
    <div
      onClick={() => onOpenWarRoom(project)}
      className="bg-white border border-zinc-200 rounded-2xl shadow-sm p-4 cursor-pointer hover:border-zinc-400 transition-all group"
    >
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 bg-zinc-50 border border-zinc-200 rounded-xl flex items-center justify-center shrink-0">
          <Icon className="w-4 h-4 text-zinc-900" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-sm font-black text-zinc-900 truncate">{project.display_name}</span>
            <StageBadge stage={project.pipeline_stage || 'lead_inbound'} />
          </div>
          <div className="flex items-center gap-3 text-[10px] font-medium text-zinc-400">
            {source && <span>{LEAD_SOURCE_LABELS[source] || source}</span>}
            {project.maturity_pct > 0 && <span>Score: {project.maturity_pct}%</span>}
            <span>{project.days_in_stage}d neste estagio</span>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {project.pipeline_stage === 'lead_inbound' && (
            <StageActionButton
              label="Qualificar"
              onClick={() => onAction(project.id, 'lead_qualified')}
              loading={transitioning === project.id}
            />
          )}
          {project.pipeline_stage === 'lead_qualified' && (
            <StageActionButton
              label="Agendar Diagnostico"
              onClick={() => onAction(project.id, 'diagnostic_done')}
              loading={transitioning === project.id}
            />
          )}
          {project.pipeline_stage === 'diagnostic_done' && (
            <StageActionButton
              label="Criar Proposta"
              variant="accent"
              onClick={() => onAction(project.id, 'proposal_draft')}
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
  transitioning,
}: {
  project: ProjectRow;
  onAction: (id: string, stage: PipelineStage) => void;
  onOpenWarRoom: (p: ProjectRow) => void;
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
      className="bg-white border border-zinc-200 rounded-2xl shadow-sm p-4 cursor-pointer hover:border-zinc-400 transition-all group"
    >
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 bg-zinc-50 border border-zinc-200 rounded-xl flex items-center justify-center shrink-0 mt-0.5">
          <Icon className="w-4 h-4 text-zinc-900" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-black text-zinc-900 truncate">{project.display_name}</span>
            <StageBadge stage={project.pipeline_stage || 'proposal_draft'} />
          </div>
          <div className="grid grid-cols-4 gap-3 mt-2">
            <div>
              <p className="text-[9px] font-black uppercase tracking-widest text-zinc-400">Fechamento</p>
              <p className="text-sm font-black text-zinc-900">{opp?.score_fechamento ?? '-'}%</p>
            </div>
            <div>
              <p className="text-[9px] font-black uppercase tracking-widest text-zinc-400">Objecoes</p>
              <p className="text-sm font-black text-zinc-900">{opp?.objecoes_detectadas?.length ?? 0}</p>
            </div>
            <div>
              <p className="text-[9px] font-black uppercase tracking-widest text-zinc-400">Sinais</p>
              <p className="text-sm font-black text-zinc-900">{opp?.sinais_compra?.length ?? 0}</p>
            </div>
            <div>
              <p className="text-[9px] font-black uppercase tracking-widest text-zinc-400">Investimento</p>
              <p className="text-sm font-black text-zinc-900">{investAvg > 0 ? formatCurrency(investAvg) : '-'}</p>
            </div>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1.5 shrink-0">
          {project.pipeline_stage === 'proposal_draft' && (
            <StageActionButton
              label="Enviar Proposta"
              onClick={() => onAction(project.id, 'proposal_sent')}
              loading={transitioning === project.id}
            />
          )}
          {project.pipeline_stage === 'proposal_sent' && (
            <StageActionButton
              label="Negociacao"
              onClick={() => onAction(project.id, 'negotiation')}
              loading={transitioning === project.id}
            />
          )}
          {(project.pipeline_stage === 'proposal_viewed' || project.pipeline_stage === 'negotiation') && (
            <StageActionButton
              label="Fechar Venda"
              variant="accent"
              onClick={() => onAction(project.id, 'won')}
              loading={transitioning === project.id}
            />
          )}
          {project.pipeline_stage !== 'won' && (
            <StageActionButton
              label="Perdido"
              variant="danger"
              onClick={() => onAction(project.id, 'lost')}
              loading={transitioning === project.id}
            />
          )}
          <span className="text-[10px] font-medium text-zinc-400 mt-0.5">{project.days_in_stage}d</span>
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

  return (
    <div
      onClick={() => navigate(`/admin/projects/${project.id}`)}
      className="bg-white border border-zinc-200 rounded-2xl shadow-sm p-4 cursor-pointer hover:border-zinc-400 transition-all group"
    >
      <div className="flex items-center gap-3">
        <div className={cn(
          'w-9 h-9 rounded-xl flex items-center justify-center shrink-0',
          project.pipeline_stage === 'won'
            ? 'border border-[#00CC6A]/20 shadow-[0_0_15px_rgba(0,204,106,0.1)]'
            : 'bg-zinc-50 border border-zinc-200',
        )}>
          <Icon className={cn(
            'w-4 h-4',
            project.pipeline_stage === 'won' ? 'text-[#00CC6A]' : 'text-zinc-900',
          )} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-black text-zinc-900 truncate">{project.display_name}</span>
            <StageBadge stage={project.pipeline_stage || 'active'} />
          </div>
          <div className="flex items-center gap-4 mt-1">
            <div className="flex items-center gap-1.5">
              <div className="w-20 h-1.5 bg-zinc-100 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full bg-zinc-900 transition-all"
                  style={{ width: `${pctDone}%` }}
                />
              </div>
              <span className="text-[10px] font-black text-zinc-500">{pctDone}%</span>
            </div>
            <span className="text-[10px] font-medium text-zinc-400">
              {project.done_tasks}/{project.total_tasks} tarefas
            </span>
            {project.overdue_tasks > 0 && (
              <span className="text-[10px] font-black text-red-400 flex items-center gap-0.5">
                <AlertTriangle className="w-2.5 h-2.5" /> {project.overdue_tasks} atrasada(s)
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {project.pipeline_stage === 'won' && (
            <StageActionButton
              label="Iniciar Onboarding"
              onClick={() => onAction(project.id, 'onboarding')}
              loading={transitioning === project.id}
            />
          )}
          {project.pipeline_stage === 'onboarding' && (
            <StageActionButton
              label="Ativar Projeto"
              variant="accent"
              onClick={() => onAction(project.id, 'active')}
              loading={transitioning === project.id}
            />
          )}
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
    <p className="text-[10px] font-black uppercase tracking-[0.25em] text-zinc-400 mb-2">{eyebrow}</p>
    <div className="flex items-baseline gap-3">
      <h2 className="text-3xl font-black tracking-tight text-zinc-900">{title}</h2>
      {count !== undefined && (
        <span className="text-lg font-black text-zinc-300">{count}</span>
      )}
    </div>
    {description && (
      <p className="text-[15px] font-medium text-zinc-500 mt-1 leading-relaxed">{description}</p>
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

  // War Room sheet state
  const [warRoomOpen, setWarRoomOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState<ProjectRow | null>(null);

  // Fast Lead Drawer state
  const [leadDrawerOpen, setLeadDrawerOpen] = useState(false);

  // Deal Closing state
  const [dealClosingModalOpen, setDealClosingModalOpen] = useState(false);
  const [selectedLeadForClosing, setSelectedLeadForClosing] = useState<ProjectRow | null>(null);

  // ---- Data loading (React Query) ----

  const { data: projects = [], isLoading: loading, refetch: loadAll } = useQuery({
    queryKey: ['revenue-projects'],
    queryFn: async () => {
      // 1. Projects with pipeline_stage
      const { data: rawProjects, error } = await supabase
        .from('rei_projects')
        .select('id, client_name, client_company, trade_name, type, status, pipeline_stage, lead_source, opportunity_data, created_at, updated_at')
        .or('status.neq.diagnostic,pipeline_stage.not.is.null')
        .order('updated_at', { ascending: false });

      if (error) throw error;
      if (!rawProjects?.length) return [];

      const ids = rawProjects.map(p => p.id);

      // 2. REI Responses (latest per project)
      const { data: responses } = await supabase
        .from('rei_responses')
        .select('project_id, maturity_percentage, total_score')
        .in('project_id', ids)
        .order('completed_at', { ascending: false });

      // 3. Strategic Plans
      const { data: plans } = await supabase
        .from('strategic_plans')
        .select('rei_project_id, status')
        .in('rei_project_id', ids)
        .order('created_at', { ascending: false });

      // 4. Tasks
      const { data: tasks } = await supabase
        .from('orqflow_tasks')
        .select('id, project_id, status, due_date')
        .in('project_id', ids)
        .not('status', 'eq', 'archived');

      // Build lookup maps
      const responseMap = new Map<string, { maturity_percentage: number; total_score: number }>();
      responses?.forEach(r => {
        if (!responseMap.has(r.project_id)) responseMap.set(r.project_id, r);
      });

      const planMap = new Map<string, { status: string }>();
      plans?.forEach(p => {
        if (!planMap.has(p.rei_project_id)) planMap.set(p.rei_project_id, p);
      });

      const todayIso = new Date().toISOString();

      const rows: ProjectRow[] = rawProjects.map((proj: any) => {
        const rei = responseMap.get(proj.id);
        const plan = planMap.get(proj.id);
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
          pipeline_stage: proj.pipeline_stage || null,
          lead_source: proj.lead_source || null,
          opportunity_data: proj.opportunity_data || null,
          created_at: proj.created_at,
          updated_at: proj.updated_at,
          maturity_pct: Math.round(rei?.maturity_percentage ?? 0),
          rei_score: rei?.total_score ?? 0,
          plan_status: plan?.status ?? null,
          total_tasks: ptasks.length,
          done_tasks: done,
          overdue_tasks: overdue,
          display_name: proj.trade_name || proj.client_company || proj.client_name,
          days_in_stage: daysSince(proj.updated_at),
        };
      });

      return rows;
    }
  });

  // ---- Stage transition handler ----

  const handleAdvance = useCallback(async (projectId: string, newStage: PipelineStage) => {
    if (newStage === 'won') {
      const p = projects.find(x => x.id === projectId);
      if (p) {
        setSelectedLeadForClosing(p);
        setDealClosingModalOpen(true);
        return;
      }
    }

    setTransitioning(projectId);
    const result = await advanceStage(projectId, newStage);
    setTransitioning(null);

    if (!result.success) {
      toast({ title: 'Erro na transicao', description: result.error, variant: 'destructive' });
      return;
    }

    toast({
      title: 'Estagio atualizado',
      description: `Movido para ${STAGE_CONFIGS[newStage].label}`,
    });

    queryClient.invalidateQueries({ queryKey: ['revenue-projects'] });
  }, [queryClient, toast]);

  // ---- Open War Room ----

  const openWarRoom = useCallback((p: ProjectRow) => {
    setSelectedLead(p);
    setWarRoomOpen(true);
  }, []);

  // ---- Grouped data ----

  const diagnostico = useMemo(
    () => projects.filter(p => p.pipeline_stage && DIAGNOSTICO_STAGES.includes(p.pipeline_stage)),
    [projects],
  );

  const vendas = useMemo(
    () => projects.filter(p => p.pipeline_stage && VENDAS_STAGES.includes(p.pipeline_stage)),
    [projects],
  );

  const execucao = useMemo(
    () => projects.filter(p => p.pipeline_stage && EXECUCAO_STAGES.includes(p.pipeline_stage)),
    [projects],
  );

  // ---- Aggregate metrics ----

  const totalPipelineValue = useMemo(() => pipelineValue(vendas), [vendas]);

  const stageCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const p of projects) {
      const s = p.pipeline_stage || 'unknown';
      counts[s] = (counts[s] || 0) + 1;
    }
    return counts;
  }, [projects]);

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

  // Win rate
  const winRate = useMemo(() => {
    const wonCount = projects.filter(p => EXECUCAO_STAGES.includes(p.pipeline_stage as PipelineStage)).length;
    const lostCount = projects.filter(p => p.pipeline_stage === 'lost').length;
    const total = wonCount + lostCount;
    return total > 0 ? Math.round((wonCount / total) * 100) : 0;
  }, [projects]);

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

  // ---- Loading state ----

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-screen bg-white">
          <div className="w-8 h-8 border-2 border-zinc-200 border-t-zinc-900 rounded-full animate-spin" />
        </div>
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
                <p className="text-[10px] font-black uppercase tracking-[0.25em] text-zinc-400 mb-3">
                  Cockpit de Receita
                </p>
                <h1 className="text-5xl md:text-6xl font-black text-zinc-900 tracking-tight leading-[1.05]">
                  Pipeline
                </h1>
              </div>
              <div className="flex gap-2 shrink-0">
                <button
                  onClick={() => loadAll()}
                  className="w-10 h-10 border border-zinc-200 rounded-xl flex items-center justify-center hover:bg-zinc-50 transition-colors"
                >
                  <RefreshCw className="w-4 h-4 text-zinc-500" />
                </button>
                <Button
                  onClick={() => setLeadDrawerOpen(true)}
                  className="bg-zinc-950 hover:bg-zinc-800 text-white font-black uppercase tracking-widest text-[10px] rounded-xl h-10 px-6 gap-2"
                >
                  <Plus className="w-4 h-4" /> Novo Lead
                </Button>
              </div>
            </div>

            {/* ── KPI Row ─────────────────────────────────────────────────── */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <MetricCard label="Leads" value={diagnostico.length} sub="Top de funil" />
              <MetricCard label="Oportunidades" value={vendas.length} sub={`Win rate: ${winRate}%`} />
              <MetricCard label="Projetos Ativos" value={execucao.length} sub={totalOverdue > 0 ? `${totalOverdue} tarefa(s) atrasada(s)` : 'Sem atrasos'} />
              <MetricCard label="Receita Pipeline" value={formatCurrency(totalPipelineValue)} sub={`Media: ${avgDaysVendas}d no estagio`} />
            </div>

            {/* ── Conversion Funnel (horizontal bars) ─────────────────────── */}
            <div className="bg-white border border-zinc-200 rounded-2xl shadow-sm p-5 mb-10">
              <div className="flex items-center gap-2 mb-4">
                <BarChart3 className="w-4 h-4 text-zinc-400" />
                <p className="text-[10px] font-black uppercase tracking-[0.25em] text-zinc-500">Funil Completo</p>
              </div>
              <div className="space-y-2">
                {DIAGNOSTICO_STAGES.map(s => (
                  <FunnelBar key={s} label={STAGE_CONFIGS[s].labelShort} count={stageCounts[s] || 0} max={maxStageCount} />
                ))}
                {VENDAS_STAGES.map(s => (
                  <FunnelBar key={s} label={STAGE_CONFIGS[s].labelShort} count={stageCounts[s] || 0} max={maxStageCount} />
                ))}
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

            {/* ═══════════════════════════════════════════════════════════════ */}
            {/* ── SECTION 1: DIAGNOSTICO (Top Funnel) ─────────────────────── */}
            {/* ═══════════════════════════════════════════════════════════════ */}
            <div className="mb-14">
              <SectionTitle
                eyebrow="Top de Funil"
                title="Diagnostico"
                description="Leads captados, qualificados e diagnosticados"
                count={diagnostico.length}
              />

              {/* Source breakdown */}
              {sourceBreakdown.length > 0 && (
                <div className="flex flex-wrap gap-3 mb-5">
                  {sourceBreakdown.map(([src, count]) => (
                    <div key={src} className="flex items-center gap-1.5 bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-1.5">
                      <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">
                        {LEAD_SOURCE_LABELS[src as LeadSource] || src}
                      </span>
                      <span className="text-[10px] font-black text-zinc-900">{count}</span>
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
                      <div className="w-1.5 h-1.5 rounded-full bg-zinc-400" />
                      <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">
                        {STAGE_CONFIGS[stage].label}
                      </p>
                      <span className="text-[10px] font-medium text-zinc-300">{stageProjects.length}</span>
                    </div>
                    <div className="space-y-3">
                      {stageProjects.map(p => (
                        <DiagnosticoRow
                          key={p.id}
                          project={p}
                          onAction={handleAdvance}
                          onOpenWarRoom={openWarRoom}
                          transitioning={transitioning}
                        />
                      ))}
                    </div>
                  </div>
                );
              })}

              {diagnostico.length === 0 && (
                <div className="bg-white border-2 border-dashed border-zinc-200 rounded-2xl py-14 text-center">
                  <UserPlus className="w-7 h-7 text-zinc-300 mx-auto mb-2" />
                  <p className="text-sm font-black text-zinc-400">Nenhum lead no funil</p>
                  <p className="text-xs font-medium text-zinc-300 mt-1">Crie um novo lead para comecar.</p>
                </div>
              )}
            </div>

            {/* ═══════════════════════════════════════════════════════════════ */}
            {/* ── SECTION 2: VENDAS (Middle Funnel) ───────────────────────── */}
            {/* ═══════════════════════════════════════════════════════════════ */}
            <div className="mb-14">
              <SectionTitle
                eyebrow="Meio de Funil"
                title="Vendas"
                description={`${vendas.length} oportunidade${vendas.length !== 1 ? 's' : ''} em negociacao | Pipeline: ${formatCurrency(totalPipelineValue)}`}
                count={vendas.length}
              />

              {/* Vendas KPIs */}
              {vendas.length > 0 && (
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="bg-zinc-50 border border-zinc-200 rounded-xl p-3">
                    <p className="text-[9px] font-black uppercase tracking-widest text-zinc-400">Pipeline</p>
                    <p className="text-lg font-black text-zinc-900 mt-0.5">{formatCurrency(totalPipelineValue)}</p>
                  </div>
                  <div className="bg-zinc-50 border border-zinc-200 rounded-xl p-3">
                    <p className="text-[9px] font-black uppercase tracking-widest text-zinc-400">Win Rate</p>
                    <p className="text-lg font-black text-zinc-900 mt-0.5">{winRate}%</p>
                  </div>
                  <div className="bg-zinc-50 border border-zinc-200 rounded-xl p-3">
                    <p className="text-[9px] font-black uppercase tracking-widest text-zinc-400">Media Dias</p>
                    <p className="text-lg font-black text-zinc-900 mt-0.5">{avgDaysVendas}d</p>
                  </div>
                </div>
              )}

              {/* Stage sub-groups */}
              {VENDAS_STAGES.map(stage => {
                const stageProjects = vendas.filter(p => p.pipeline_stage === stage);
                if (stageProjects.length === 0) return null;
                return (
                  <div key={stage} className="mb-6">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-zinc-500" />
                      <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">
                        {STAGE_CONFIGS[stage].label}
                      </p>
                      <span className="text-[10px] font-medium text-zinc-300">{stageProjects.length}</span>
                    </div>
                    <div className="space-y-3">
                      {stageProjects.map(p => (
                        <VendasRow
                          key={p.id}
                          project={p}
                          onAction={handleAdvance}
                          onOpenWarRoom={openWarRoom}
                          transitioning={transitioning}
                        />
                      ))}
                    </div>
                  </div>
                );
              })}

              {vendas.length === 0 && (
                <div className="bg-white border-2 border-dashed border-zinc-200 rounded-2xl py-14 text-center">
                  <Send className="w-7 h-7 text-zinc-300 mx-auto mb-2" />
                  <p className="text-sm font-black text-zinc-400">Nenhuma oportunidade ativa</p>
                  <p className="text-xs font-medium text-zinc-300 mt-1">Mova leads qualificados para vendas.</p>
                </div>
              )}
            </div>

            {/* ═══════════════════════════════════════════════════════════════ */}
            {/* ── SECTION 3: EXECUCAO (Active Projects) ───────────────────── */}
            {/* ═══════════════════════════════════════════════════════════════ */}
            <div className="mb-14">
              <SectionTitle
                eyebrow="Projetos"
                title="Execucao"
                description={`${execucao.length} projeto${execucao.length !== 1 ? 's' : ''} em andamento`}
                count={execucao.length}
              />

              {/* Execucao KPIs */}
              {execucao.length > 0 && (
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="bg-zinc-50 border border-zinc-200 rounded-xl p-3">
                    <p className="text-[9px] font-black uppercase tracking-widest text-zinc-400">Tarefas Feitas</p>
                    <p className="text-lg font-black text-zinc-900 mt-0.5">
                      {execucao.reduce((s, p) => s + p.done_tasks, 0)}/{execucao.reduce((s, p) => s + p.total_tasks, 0)}
                    </p>
                  </div>
                  <div className="bg-zinc-50 border border-zinc-200 rounded-xl p-3">
                    <p className="text-[9px] font-black uppercase tracking-widest text-zinc-400">Atrasadas</p>
                    <p className={cn(
                      'text-lg font-black mt-0.5',
                      totalOverdue > 0 ? 'text-zinc-900' : 'text-zinc-300',
                    )}>{totalOverdue}</p>
                  </div>
                  <div className="bg-zinc-50 border border-zinc-200 rounded-xl p-3">
                    <p className="text-[9px] font-black uppercase tracking-widest text-zinc-400">Em Onboarding</p>
                    <p className="text-lg font-black text-zinc-900 mt-0.5">
                      {execucao.filter(p => p.pipeline_stage === 'onboarding').length}
                    </p>
                  </div>
                </div>
              )}

              {/* Stage sub-groups */}
              {EXECUCAO_STAGES.map(stage => {
                const stageProjects = execucao.filter(p => p.pipeline_stage === stage);
                if (stageProjects.length === 0) return null;
                return (
                  <div key={stage} className="mb-6">
                    <div className="flex items-center gap-2 mb-3">
                      <div className={cn(
                        'w-1.5 h-1.5 rounded-full',
                        stage === 'won' ? 'bg-[#00CC6A]' : 'bg-zinc-600',
                      )} />
                      <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">
                        {STAGE_CONFIGS[stage].label}
                      </p>
                      <span className="text-[10px] font-medium text-zinc-300">{stageProjects.length}</span>
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
                <div className="bg-white border-2 border-dashed border-zinc-200 rounded-2xl py-14 text-center">
                  <Rocket className="w-7 h-7 text-zinc-300 mx-auto mb-2" />
                  <p className="text-sm font-black text-zinc-400">Nenhum projeto em execucao</p>
                  <p className="text-xs font-medium text-zinc-300 mt-1">Feche vendas para iniciar projetos.</p>
                </div>
              )}
            </div>

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
        project={selectedLeadForClosing}
        onSuccess={loadAll}
      />
    </>
  );
};

export default RevenueCockpit;
