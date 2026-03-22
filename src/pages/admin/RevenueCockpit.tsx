import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import {
  Phone, Send, Zap, AlertTriangle, CheckCircle2,
  ChevronRight, Plus, Target,
  ArrowUpRight, BarChart3, Flame,
  RefreshCw, Activity
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import AdminLayout from '@/components/layout/AdminLayout';
import { LeadWarRoomSheet } from '@/components/rei/LeadWarRoomSheet';

// ─── Types ────────────────────────────────────────────────────────────────────

type Stage =
  | 'lead'
  | 'diagnosticado'
  | 'proposta_enviada'
  | 'proposta_vista'
  | 'aprovado'
  | 'em_execucao'
  | 'concluido';

interface Opportunity {
  id: string;
  name: string;
  company: string;
  type: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  // REI
  maturityPct: number;
  reiScore: number;
  reiCompletedAt: string | null;
  // Plan
  planStatus: string | null;
  planSentAt: string | null;
  planViewedAt: string | null;
  planApprovedAt: string | null;
  // Tasks
  totalTasks: number;
  doneTasks: number;
  overdueTasks: number;
  // Derived
  stage: Stage;
  urgencyScore: number;
  daysSinceActivity: number;
  nextAction: string;
}

interface PriorityAction {
  id: string;
  icon: React.ElementType;
  label: string;
  detail: string;
  urgency: 'critical' | 'high' | 'medium';
  projectId: string;
}

interface FunnelMetric {
  stage: Stage;
  label: string;
  count: number;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const STAGE_ORDER: Stage[] = [
  'lead', 'diagnosticado', 'proposta_enviada', 'proposta_vista',
  'aprovado', 'em_execucao', 'concluido',
];

const STAGE_LABELS: Record<Stage, string> = {
  lead: 'Lead',
  diagnosticado: 'Diagnosticado',
  proposta_enviada: 'Proposta',
  proposta_vista: 'Proposta Vista',
  aprovado: 'Aprovado',
  em_execucao: 'Em Execucao',
  concluido: 'Concluido',
};

const TYPE_LABELS: Record<string, string> = {
  consulting: '360', founder: 'LinkedIn', dev: 'Site',
  crm_ops: 'RevOps', funnels_impl: 'Funis',
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function detectStage(opp: Partial<Opportunity>): Stage {
  if (opp.status === 'completed') return 'concluido';
  // Projeto marcado como active pelo admin = esta em execucao (fechado e entregando)
  if (opp.status === 'active') return 'em_execucao';
  // Plano aprovado com tarefas = execucao tambem
  if (opp.planStatus === 'approved' && opp.totalTasks && opp.totalTasks > 0) return 'em_execucao';
  if (opp.planStatus === 'approved') return 'aprovado';
  if (opp.planStatus === 'viewed') return 'proposta_vista';
  if (opp.planStatus === 'sent') return 'proposta_enviada';
  if (opp.maturityPct && opp.maturityPct > 0) return 'diagnosticado';
  return 'lead';
}

function calcUrgency(opp: Partial<Opportunity>): number {
  let score = 0;
  const days = opp.daysSinceActivity || 0;

  // Silence is the biggest urgency signal
  score += Math.min(days * 3, 60);

  // Pending proposal with no response = needs followup
  if (opp.planStatus === 'sent' && days > 3) score += 25;
  if (opp.planStatus === 'viewed' && days > 1) score += 20;

  // High maturity with no proposal = opportunity being wasted
  if ((opp.maturityPct || 0) > 75 && !opp.planStatus) score += 30;

  // Delivery at risk = churn risk
  if ((opp.overdueTasks || 0) > 0) score += (opp.overdueTasks || 0) * 10;

  // Approved but no tasks = kickoff missing
  if (opp.planStatus === 'approved' && (opp.totalTasks || 0) === 0) score += 35;

  return Math.min(score, 100);
}

function calcNextAction(opp: Partial<Opportunity>): string {
  if (opp.planStatus === 'approved' && (opp.totalTasks || 0) === 0) return 'Criar kickoff no OrqFlow';
  if ((opp.overdueTasks || 0) > 0) return `Revisar ${opp.overdueTasks} tarefa(s) atrasada(s)`;
  if (opp.planStatus === 'viewed' && (opp.daysSinceActivity || 0) > 1) return 'Followup - proposta vista sem resposta';
  if (opp.planStatus === 'sent' && (opp.daysSinceActivity || 0) > 3) return 'Followup - proposta sem leitura';
  if ((opp.maturityPct || 0) > 75 && !opp.planStatus) return 'Gerar plano estrategico';
  if ((opp.maturityPct || 0) > 0 && !opp.planStatus) return 'Finalizar diagnostico';
  if (!opp.reiCompletedAt) return 'Agendar REI com o cliente';
  return 'Monitorar progresso';
}

function daysSince(iso: string | null): number {
  if (!iso) return 0;
  return Math.floor((Date.now() - new Date(iso).getTime()) / 86400000);
}

function formatCurrency(val: string | null): string {
  if (!val) return '-';
  const n = parseFloat(val.replace(/[^0-9.]/g, ''));
  if (isNaN(n)) return val;
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(n);
}

// ─── Sub-components ───────────────────────────────────────────────────────────

const MaturityArc = ({ pct }: { pct: number }) => {
  const r = 18;
  const circ = 2 * Math.PI * r;
  const filled = (pct / 100) * circ;
  const color = pct >= 75 ? '#00CC6A' : pct >= 40 ? '#18181b' : '#a1a1aa';

  return (
    <div className="relative w-12 h-12 shrink-0">
      <svg viewBox="0 0 44 44" className="w-full h-full -rotate-90">
        <circle cx="22" cy="22" r={r} fill="none" stroke="#f4f4f5" strokeWidth="4" />
        <circle
          cx="22" cy="22" r={r} fill="none"
          stroke={color} strokeWidth="4"
          strokeDasharray={`${filled} ${circ}`}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-[10px] font-black text-zinc-900">{pct}%</span>
      </div>
    </div>
  );
};

const StagePipeline = ({ current }: { current: Stage }) => {
  const idx = STAGE_ORDER.indexOf(current);
  const visible: Stage[] = ['lead', 'diagnosticado', 'aprovado', 'em_execucao', 'concluido'];

  return (
    <div className="flex items-center gap-1">
      {visible.map((s, i) => {
        const sIdx = STAGE_ORDER.indexOf(s);
        const done = sIdx < idx;
        const active = s === current || (current === 'proposta_enviada' && s === 'aprovado') || (current === 'proposta_vista' && s === 'aprovado');
        const isCurrent = sIdx === idx || (current === 'proposta_enviada' && s === 'aprovado') || (current === 'proposta_vista' && s === 'aprovado');

        return (
          <React.Fragment key={s}>
            <div
              title={STAGE_LABELS[s]}
              className={cn(
                'w-1.5 h-1.5 rounded-full transition-all',
                done ? 'bg-[#00CC6A]' :
                isCurrent ? 'w-2 h-2 bg-zinc-900' :
                'bg-zinc-200'
              )}
            />
            {i < visible.length - 1 && (
              <div className={cn('h-px w-3', done ? 'bg-[#00CC6A]' : 'bg-zinc-200')} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};

const UrgencyBar = ({ score }: { score: number }) => (
  <div
    className="absolute left-0 top-0 bottom-0 w-[3px] rounded-l-2xl transition-all"
    style={{
      backgroundColor: score >= 70 ? '#ef4444' : score >= 40 ? '#a1a1aa' : '#e4e4e7',
    }}
  />
);

const OpportunityCard = ({ opp, onClick }: { opp: Opportunity; onClick: () => void }) => (
  <div
    onClick={onClick}
    className="relative bg-white border border-zinc-200 rounded-2xl p-5 cursor-pointer hover:border-zinc-400 hover:shadow-sm transition-all group overflow-hidden"
  >
    <UrgencyBar score={opp.urgencyScore} />

    {/* Header */}
    <div className="flex items-start justify-between gap-3 mb-4 pl-2">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1.5 flex-wrap">
          <span className="text-sm font-black text-zinc-900 truncate">{opp.name}</span>
          <span className="text-[9px] font-black uppercase tracking-widest bg-zinc-100 text-zinc-500 px-2 py-0.5 rounded shrink-0">
            {TYPE_LABELS[opp.type] ?? opp.type}
          </span>
          {opp.urgencyScore >= 70 && (
            <span className="text-[9px] font-black uppercase tracking-widest bg-red-50 text-red-500 border border-red-100 px-2 py-0.5 rounded shrink-0 flex items-center gap-1">
              <Flame className="w-2.5 h-2.5" /> urgente
            </span>
          )}
          {opp.stage === 'aprovado' && (
            <span className="text-[9px] font-black uppercase tracking-widest bg-[#00CC6A]/10 text-[#00CC6A] border border-[#00CC6A]/20 px-2 py-0.5 rounded shrink-0">
              aprovado
            </span>
          )}
        </div>
        <StagePipeline current={opp.stage} />
      </div>
      <MaturityArc pct={opp.maturityPct} />
    </div>

    {/* Stats */}
    <div className="grid grid-cols-3 gap-2 pl-2 mb-4">
      <div>
        <p className="text-[9px] font-black uppercase tracking-widest text-zinc-400">REI Score</p>
        <p className="text-sm font-black text-zinc-900">{opp.maturityPct}%</p>
      </div>
      <div>
        <p className="text-[9px] font-black uppercase tracking-widest text-zinc-400">Etapa</p>
        <p className="text-[10px] font-black text-zinc-700">{STAGE_LABELS[opp.stage]}</p>
      </div>
      <div>
        <p className="text-[9px] font-black uppercase tracking-widest text-zinc-400">Inativo</p>
        <p className={cn('text-sm font-black', opp.daysSinceActivity > 7 ? 'text-red-400' : 'text-zinc-600')}>
          {opp.daysSinceActivity}d
        </p>
      </div>
    </div>

    {/* Next action */}
    <div className="pl-2 flex items-center justify-between border-t border-zinc-100 pt-3">
      <p className="text-[11px] font-bold text-zinc-500 truncate flex-1">{opp.nextAction}</p>
      {opp.stage === 'lead' ? (
        <span className="text-[9px] font-black uppercase tracking-widest text-zinc-400 group-hover:text-zinc-900 bg-zinc-50 border border-zinc-200 px-2 py-0.5 rounded transition-colors shrink-0 ml-2">
          Dossi
        </span>
      ) : (
        <ArrowUpRight className="w-3.5 h-3.5 text-zinc-300 group-hover:text-zinc-700 shrink-0 ml-2 transition-colors" />
      )}
    </div>
  </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────

export const RevenueCockpit: React.FC = () => {
  const navigate = useNavigate();

  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<Stage | 'all'>('all');

  // War Room sheet state
  const [warRoomOpen, setWarRoomOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Opportunity | null>(null);

  useEffect(() => {
    loadAll();
  }, []);

  const loadAll = async () => {
    setLoading(true);
    try {
      // 1. Projects
      const { data: projects } = await supabase
        .from('rei_projects')
        .select('id, client_name, client_company, trade_name, type, status, created_at, updated_at')
        .order('updated_at', { ascending: false });

      if (!projects?.length) { setOpportunities([]); return; }

      const ids = projects.map(p => p.id);

      // 2. REI Responses (latest per project)
      const { data: responses } = await supabase
        .from('rei_responses')
        .select('project_id, maturity_percentage, total_score, completed_at')
        .in('project_id', ids)
        .order('completed_at', { ascending: false });

      // 3. Strategic Plans (latest per project)
      const { data: plans } = await supabase
        .from('strategic_plans')
        .select('rei_project_id, status, sent_at, viewed_at, approved_at')
        .in('rei_project_id', ids)
        .order('created_at', { ascending: false });

      // 4. Tasks (aggregated per project)
      const { data: tasks } = await supabase
        .from('orqflow_tasks')
        .select('id, project_id, status, due_date')
        .in('project_id', ids)
        .not('status', 'eq', 'archived');

      // Build lookup maps
      const responseMap = new Map<string, typeof responses[0]>();
      responses?.forEach(r => { if (!responseMap.has(r.project_id)) responseMap.set(r.project_id, r); });

      const planMap = new Map<string, typeof plans[0]>();
      plans?.forEach(p => { if (!planMap.has(p.rei_project_id)) planMap.set(p.rei_project_id, p); });

      const todayIso = new Date().toISOString();

      // Build opportunities
      const opps: Opportunity[] = projects.map(proj => {
        const rei = responseMap.get(proj.id);
        const plan = planMap.get(proj.id);
        const ptasks = tasks?.filter(t => t.project_id === proj.id) || [];
        const done = ptasks.filter(t => t.status === 'done').length;
        const overdue = ptasks.filter(t => t.due_date && t.due_date < todayIso && t.status !== 'done').length;

        const lastActivity = proj.updated_at || proj.created_at;
        const days = daysSince(lastActivity);

        const partial: Partial<Opportunity> = {
          status: proj.status,
          maturityPct: Math.round(rei?.maturity_percentage ?? 0),
          reiScore: rei?.total_score ?? 0,
          reiCompletedAt: rei?.completed_at ?? null,
          planStatus: plan?.status ?? null,
          planSentAt: plan?.sent_at ?? null,
          planViewedAt: plan?.viewed_at ?? null,
          planApprovedAt: plan?.approved_at ?? null,
          totalTasks: ptasks.length,
          doneTasks: done,
          overdueTasks: overdue,
          daysSinceActivity: days,
        };

        const stage = detectStage(partial);
        const urgencyScore = calcUrgency({ ...partial, stage });
        const nextAction = calcNextAction({ ...partial, stage });

        return {
          id: proj.id,
          name: proj.trade_name || proj.client_company || proj.client_name,
          company: proj.client_company || proj.client_name,
          type: proj.type,
          ...partial,
          stage,
          urgencyScore,
          nextAction,
        } as Opportunity;
      });

      // Sort: critical first, then by urgency score
      opps.sort((a, b) => b.urgencyScore - a.urgencyScore);
      setOpportunities(opps);
    } finally {
      setLoading(false);
    }
  };

  // Priority Actions (auto-generated from signals)
  const priorityActions = useMemo((): PriorityAction[] => {
    const actions: PriorityAction[] = [];

    opportunities.forEach(opp => {
      if (opp.planStatus === 'approved' && opp.totalTasks === 0) {
        actions.push({
          id: `kickoff-${opp.id}`,
          icon: Zap,
          label: `Criar kickoff: ${opp.name}`,
          detail: 'Proposta aprovada sem tarefas criadas',
          urgency: 'critical',
          projectId: opp.id,
        });
      }
      if (opp.overdueTasks > 0) {
        actions.push({
          id: `overdue-${opp.id}`,
          icon: AlertTriangle,
          label: `${opp.overdueTasks} tarefa(s) atrasada(s): ${opp.name}`,
          detail: 'Risco de insatisfacao do cliente',
          urgency: 'critical',
          projectId: opp.id,
        });
      }
      if (opp.planStatus === 'viewed' && opp.daysSinceActivity > 1) {
        actions.push({
          id: `viewed-${opp.id}`,
          icon: Phone,
          label: `Followup: ${opp.name}`,
          detail: `Proposta vista ha ${opp.daysSinceActivity} dias sem resposta`,
          urgency: 'high',
          projectId: opp.id,
        });
      }
      if (opp.planStatus === 'sent' && opp.daysSinceActivity > 3) {
        actions.push({
          id: `sent-${opp.id}`,
          icon: Send,
          label: `Followup: ${opp.name}`,
          detail: `Proposta enviada ha ${opp.daysSinceActivity} dias sem leitura`,
          urgency: 'high',
          projectId: opp.id,
        });
      }
      if (opp.maturityPct >= 75 && !opp.planStatus) {
        actions.push({
          id: `ready-${opp.id}`,
          icon: Target,
          label: `Gerar proposta: ${opp.name}`,
          detail: `REI ${opp.maturityPct}% - pronto para proposta`,
          urgency: 'medium',
          projectId: opp.id,
        });
      }
    });

    return actions
      .sort((a, b) => {
        const order = { critical: 0, high: 1, medium: 2 };
        return order[a.urgency] - order[b.urgency];
      })
      .slice(0, 8);
  }, [opportunities]);

  // Deal Rooms = APENAS pipeline de vendas. Projetos ativos vao para /admin/rei.
  const PIPELINE_STAGES: Stage[] = ['lead', 'diagnosticado', 'proposta_enviada', 'proposta_vista', 'aprovado'];
  const pipeline = useMemo(
    () => opportunities.filter(o => PIPELINE_STAGES.includes(o.stage)),
    [opportunities]
  );

  // Funil - apenas etapas de venda
  const funnel = useMemo((): FunnelMetric[] => {
    const counts = { lead: 0, diagnosticado: 0, proposta_enviada: 0, proposta_vista: 0, aprovado: 0 };
    pipeline.forEach(o => {
      const k = o.stage as keyof typeof counts;
      if (k in counts) counts[k]++;
    });
    return [
      { stage: 'lead',           label: 'Leads',          count: counts.lead },
      { stage: 'diagnosticado',  label: 'Diagnosticados', count: counts.diagnosticado },
      { stage: 'proposta_enviada', label: 'Proposta',     count: counts.proposta_enviada + counts.proposta_vista },
      { stage: 'aprovado',       label: 'Aprovados',      count: counts.aprovado },
    ];
  }, [pipeline]);

  const filtered =
    filter === 'all'
      ? pipeline
      : pipeline.filter(o =>
          filter === 'proposta_enviada'
            ? o.stage === 'proposta_enviada' || o.stage === 'proposta_vista'
            : o.stage === filter
        );

  const critical = pipeline.filter(o => o.urgencyScore >= 70).length;

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-screen bg-white">
          <div className="w-8 h-8 border-2 border-zinc-200 border-t-zinc-900 rounded-full animate-spin" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <>
    <AdminLayout>
    <div className="min-h-screen bg-white">
      <div className="max-w-[1400px] mx-auto px-8 md:px-12 py-12">

        {/* ── Header ───────────────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-10 pb-10 border-b border-zinc-100">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.25em] text-zinc-400 mb-3">Cockpit de Receita</p>
            <h1 className="text-5xl md:text-6xl font-black text-zinc-900 tracking-tight leading-[1.05]">
              {pipeline.length === 0
                ? 'Pipeline vazio'
                : `${pipeline.length} oportunidade${pipeline.length > 1 ? 's' : ''}`}
            </h1>
            <p className="text-[15px] font-medium text-zinc-500 mt-3 leading-relaxed">
              {critical > 0
                ? `${critical} requer${critical > 1 ? 'em' : ''} atencao imediata.`
                : pipeline.length === 0
                ? 'Nenhuma oportunidade ativa. Crie um novo lead para comecar.'
                : 'Pipeline saudavel. Nenhuma acao critica no momento.'}
            </p>
          </div>
          <div className="flex gap-2 shrink-0">
            <button
              onClick={loadAll}
              className="w-10 h-10 border border-zinc-200 rounded-xl flex items-center justify-center hover:bg-zinc-50 transition-colors"
            >
              <RefreshCw className="w-4 h-4 text-zinc-500" />
            </button>
            <Button
              onClick={() => navigate('/admin/rei/novo?lead=true')}
              className="bg-zinc-950 hover:bg-zinc-800 text-white font-black uppercase tracking-widest text-[10px] rounded-xl h-10 px-6 gap-2"
            >
              <Plus className="w-4 h-4" /> Nova Oportunidade
            </Button>
          </div>
        </div>

        {/* ── Three-column layout ───────────────────────────────────────── */}
        <div className="grid grid-cols-1 xl:grid-cols-[280px_1fr_220px] gap-6">

          {/* LEFT - Priority Actions */}
          <div className="space-y-4">
            <div className="bg-white border border-zinc-200 rounded-2xl shadow-sm overflow-hidden">
              <div className="px-5 pt-5 pb-4 border-b border-zinc-100">
                <div className="flex items-center gap-2">
                  <Flame className="w-4 h-4 text-zinc-400" />
                  <h2 className="text-[11px] font-black uppercase tracking-widest text-zinc-900">Acoes Prioritarias</h2>
                </div>
                <p className="text-[10px] text-zinc-400 font-medium mt-1">Calculado por sinais de urgencia</p>
              </div>

              {priorityActions.length === 0 ? (
                <div className="px-5 py-8 text-center">
                  <CheckCircle2 className="w-6 h-6 text-[#00CC6A] mx-auto mb-2" />
                  <p className="text-xs font-bold text-zinc-500">Nenhuma acao urgente.</p>
                </div>
              ) : (
                <div className="divide-y divide-zinc-50">
                  {priorityActions.map(action => {
                    const opp = opportunities.find(o => o.id === action.projectId);
                    const isLead = opp?.stage === 'lead';
                    return (
                    <button
                      key={action.id}
                      onClick={() => {
                        if (isLead && opp) {
                          setSelectedLead(opp);
                          setWarRoomOpen(true);
                        } else {
                          navigate(`/admin/projects/${action.projectId}`);
                        }
                      }}
                      className="w-full text-left px-5 py-3.5 hover:bg-zinc-50 transition-colors group flex items-start gap-3"
                    >
                      <div className={cn(
                        'w-6 h-6 rounded-lg flex items-center justify-center shrink-0 mt-0.5',
                        action.urgency === 'critical' ? 'bg-red-50' :
                        action.urgency === 'high' ? 'bg-zinc-100' : 'bg-zinc-50'
                      )}>
                        <action.icon className={cn(
                          'w-3 h-3',
                          action.urgency === 'critical' ? 'text-red-500' :
                          action.urgency === 'high' ? 'text-zinc-600' : 'text-zinc-400'
                        )} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[11px] font-bold text-zinc-900 leading-snug truncate">{action.label}</p>
                        <p className="text-[10px] text-zinc-400 font-medium mt-0.5 leading-snug">{action.detail}</p>
                      </div>
                      <ChevronRight className="w-3 h-3 text-zinc-300 group-hover:text-zinc-500 shrink-0 mt-1 transition-colors" />
                    </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* CENTER - Cards */}
          <div className="space-y-4">
            {/* Stage filter pills */}
            <div className="flex gap-2 flex-wrap">
              {([
                ['all',            'Todos',          pipeline.length],
                ['lead',           'Leads',          funnel.find(f=>f.stage==='lead')?.count ?? 0],
                ['diagnosticado',  'Diagnosticados', funnel.find(f=>f.stage==='diagnosticado')?.count ?? 0],
                ['proposta_enviada','Proposta',       funnel.find(f=>f.stage==='proposta_enviada')?.count ?? 0],
                ['aprovado',       'Aprovados',      funnel.find(f=>f.stage==='aprovado')?.count ?? 0],
              ] as [Stage | 'all', string, number][])
                .filter(([,, count]) => count > 0)
                .map(([s, label, count]) => (
                  <button
                    key={s}
                    onClick={() => setFilter(s)}
                    className={cn(
                      'text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg border transition-all',
                      filter === s
                        ? 'bg-zinc-950 text-white border-zinc-950'
                        : 'bg-white text-zinc-500 border-zinc-200 hover:border-zinc-400'
                    )}
                  >
                    {label} <span className="opacity-60 font-medium ml-1">{count}</span>
                  </button>
                ))}
            </div>

            {/* Cards grid */}
            {filtered.length === 0 ? (
              <div className="bg-white border-2 border-dashed border-zinc-200 rounded-2xl py-20 text-center">
                <Activity className="w-8 h-8 text-zinc-300 mx-auto mb-3" />
                <p className="text-sm font-black text-zinc-400 mb-1">
                  {pipeline.length === 0 ? 'Pipeline vazio' : 'Nenhuma oportunidade neste filtro'}
                </p>
                <p className="text-xs font-medium text-zinc-300">
                  {pipeline.length === 0 ? 'Crie um novo lead para comecar.' : 'Mude o filtro acima.'}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {filtered.map(opp => (
                  <OpportunityCard
                    key={opp.id}
                    opp={opp}
                    onClick={() => {
                      if (opp.stage === 'lead') {
                        // Lead → abre War Room (dossi de vendas sem mudar de rota)
                        setSelectedLead(opp);
                        setWarRoomOpen(true);
                      } else {
                        // Outros stages → vai direto para o projeto
                        navigate(`/admin/projects/${opp.id}`);
                      }
                    }}
                  />
                ))}
              </div>
            )}
          </div>

          {/* RIGHT - Funnel Metrics */}
          <div className="space-y-4">
            <div className="bg-white border border-zinc-200 rounded-2xl shadow-sm overflow-hidden">
              <div className="px-5 pt-5 pb-4 border-b border-zinc-100 flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-zinc-400" />
                <h2 className="text-[11px] font-black uppercase tracking-widest text-zinc-900">Funil</h2>
              </div>
              <div className="p-5 space-y-3">
                {funnel.map((f, i) => {
                  const maxCount = Math.max(...funnel.map(x => x.count), 1);
                  const pct = (f.count / maxCount) * 100;
                  return (
                    <div key={f.stage}>
                      <div className="flex items-center justify-between mb-1">
                        <button
                          onClick={() => setFilter(f.stage === filter ? 'all' : f.stage)}
                          className="text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:text-zinc-900 transition-colors"
                        >
                          {f.label}
                        </button>
                        <span className={cn(
                          'text-sm font-black',
                          f.count === 0 ? 'text-zinc-300' : 'text-zinc-900'
                        )}>
                          {f.count}
                        </span>
                      </div>
                      <div className="h-1.5 bg-zinc-100 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-700"
                          style={{
                            width: `${pct}%`,
                            backgroundColor: f.stage === 'aprovado' ? '#00CC6A' : '#18181b',
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Score legend */}
            <div className="bg-zinc-950 rounded-2xl p-5 space-y-3">
              <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Score de Urgencia</p>
              {[
                { color: '#ef4444', label: 'Critico (70+)', desc: 'Acao imediata' },
                { color: '#a1a1aa', label: 'Alto (40-69)', desc: 'Acompanhar hoje' },
                { color: '#e4e4e7', label: 'Normal (0-39)', desc: 'Monitorar' },
              ].map(({ color, label, desc }) => (
                <div key={label} className="flex items-center gap-3">
                  <div className="w-1.5 h-6 rounded-full shrink-0" style={{ backgroundColor: color }} />
                  <div>
                    <p className="text-[10px] font-black text-zinc-300">{label}</p>
                    <p className="text-[9px] font-medium text-zinc-600">{desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* REI maturity legend */}
            <div className="bg-white border border-zinc-200 rounded-2xl p-5">
              <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-3">Maturidade REI</p>
              {[
                { color: '#00CC6A', label: '75%+', desc: 'Pronto p/ proposta' },
                { color: '#18181b', label: '40-74%', desc: 'Qualificando' },
                { color: '#a1a1aa', label: '0-39%', desc: 'Fase inicial' },
              ].map(({ color, label, desc }) => (
                <div key={label} className="flex items-center gap-3 mb-2 last:mb-0">
                  <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: color }} />
                  <div className="flex-1 flex items-center justify-between">
                    <span className="text-[10px] font-black text-zinc-500">{label}</span>
                    <span className="text-[10px] font-medium text-zinc-400">{desc}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
    </AdminLayout>

    {/* War Room Sheet - Lead Dossie */}
    <LeadWarRoomSheet
      lead={selectedLead ? {
        id:                selectedLead.id,
        name:              selectedLead.name,
        company:           selectedLead.company,
        type:              selectedLead.type,
        urgencyScore:      selectedLead.urgencyScore,
        maturityPct:       selectedLead.maturityPct,
        nextAction:        selectedLead.nextAction,
        daysSinceActivity: selectedLead.daysSinceActivity,
      } : null}
      open={warRoomOpen}
      onClose={() => { setWarRoomOpen(false); setSelectedLead(null); }}
      onQualified={loadAll}
    />
    </>
  );
};

export default RevenueCockpit;
