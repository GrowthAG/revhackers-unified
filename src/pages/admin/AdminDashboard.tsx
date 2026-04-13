import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, Cell
} from 'recharts';
import {
  FolderKanban, AlertTriangle, CheckCircle2, Plus, ChevronRight,
  Clock, Zap, Users, TrendingUp, Circle, FileText, ArrowUpRight,
  Calendar, Target, Activity, Radar, BarChart3, BookOpen
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import AdminLayout from '@/components/layout/AdminLayout';
import { OrphanedRecordingsAlert } from '@/components/admin/OrphanedRecordingsAlert';
import { DashboardSkeleton } from '@/components/ui/skeleton';

// ─── Types ────────────────────────────────────────────────────────────────────

interface KpiData {
  activeProjects: number;
  totalTasks: number;
  overdueTasks: number;
  approvedPlans: number;
  doneTasks: number;
  reviewTasks: number;
}

interface ProjectHealth {
  id: string;
  name: string;
  type: string;
  status: string;
  totalTasks: number;
  doneTasks: number;
  overdueTasks: number;
  lastActivity: string | null;
}

interface UpcomingTask {
  id: string;
  title: string;
  projectName: string;
  projectId: string;
  dueDate: string;
  priority: string;
  status: string;
}

interface ActivityItem {
  id: string;
  text: string;
  time: string;
  type: 'comment' | 'task' | 'plan';
}

interface VelocityPoint {
  day: string;
  concluidas: number;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const TYPE_LABELS: Record<string, string> = {
  consulting: '360',
  founder: 'LinkedIn',
  dev: 'Site',
  crm_ops: 'RevOps',
  funnels_impl: 'Funis',
};

const PRIORITY_ORDER: Record<string, number> = {
  urgent: 0, high: 1, medium: 2, low: 3,
};

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'agora';
  if (m < 60) return `${m}min atras`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h atras`;
  const d = Math.floor(h / 24);
  return `${d}d atras`;
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
}

function greeting(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Bom dia';
  if (h < 18) return 'Boa tarde';
  return 'Boa noite';
}

// ─── Sub-components ───────────────────────────────────────────────────────────

const TypeBadge = ({ type }: { type: string }) => (
  <span className="text-2xs font-black uppercase tracking-widest bg-zinc-100 text-zinc-500 px-2 py-0.5 rounded">
    {TYPE_LABELS[type] ?? type}
  </span>
);

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-zinc-950 text-white text-xs font-bold px-3 py-2 ">
      <p className="text-zinc-400 mb-0.5">{label}</p>
      <p className="text-[#00CC6A]">{payload[0].value} concluidas</p>
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────

export const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();

  const [userName, setUserName] = useState('');
  const [approvedPlansCount, setApprovedPlansCount] = useState(0);
  const [projects, setProjects] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [activity, setActivity] = useState<ActivityItem[]>([]);
  const [velocity, setVelocity] = useState<VelocityPoint[]>([]);
  const [deals, setDeals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAll();
  }, []);

  const loadAll = async () => {
    setLoading(true);
    try {
      await Promise.all([
        loadProfile(),
        loadProjects(),
        loadTasks(),
        loadActivity(),
        loadVelocity(),
        loadPlans(),
        loadDeals(),
      ]);
    } finally {
      setLoading(false);
    }
  };

  const loadProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name, name')
      .eq('id', user.id)
      .single();
    const name = profile?.full_name || profile?.name || user.email?.split('@')[0] || '';
    setUserName(name.split(' ')[0]);
  };

  const loadProjects = async () => {
    const { data } = await supabase
      .from('rei_projects')
      .select('id, client_name, client_company, trade_name, type, status, created_at, updated_at')
      .eq('status', 'active')
      .order('updated_at', { ascending: false });
    setProjects(data || []);
  };

  const loadTasks = async () => {
    const { data } = await supabase
      .from('orqflow_tasks')
      .select('id, project_id, status, due_date, title, priority, updated_at')
      .not('status', 'eq', 'archived');
    setTasks(data || []);
  };

  const loadPlans = async () => {
    const { count } = await supabase
      .from('strategic_plans')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'approved');
    setApprovedPlansCount(count || 0);
  };

  const loadDeals = async () => {
    const { data } = await (supabase
      .from('opportunities') as any)
      .select('id, status')
      .neq('status', 'won')
      .neq('status', 'lost');
    setDeals(data || []);
  };

  const loadActivity = async () => {
    const { data: comments } = await supabase
      .from('orqflow_task_comments')
      .select('id, task_id, created_at, content')
      .order('created_at', { ascending: false })
      .limit(8);

    const items: ActivityItem[] = (comments || []).map(c => ({
      id: c.id,
      text: 'Novo comentario em tarefa',
      time: relativeTime(c.created_at),
      type: 'comment' as const,
    }));
    setActivity(items);
  };

  const loadVelocity = async () => {
    // Last 7 days of completed tasks
    const days: VelocityPoint[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dayStr = d.toLocaleDateString('pt-BR', { weekday: 'short' });
      const iso = d.toISOString().split('T')[0];

      const { count } = await supabase
        .from('orqflow_tasks')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'done')
        .gte('updated_at', iso + 'T00:00:00')
        .lte('updated_at', iso + 'T23:59:59');

      days.push({ day: dayStr, concluidas: count || 0 });
    }
    setVelocity(days);
  };

  // Derived metrics
  const derived = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    const todayStart = today + 'T00:00:00';
    const todayEnd = today + 'T23:59:59';

    const active = projects.filter(p => p.status === 'active').length;
    const done = tasks.filter(t => t.status === 'done').length;
    const review = tasks.filter(t => t.status === 'review').length;
    const overdue = tasks.filter(t =>
      t.due_date && t.due_date < todayStart && t.status !== 'done'
    ).length;

    // Copilot engine: Determine if there is a global alert
    // If overdue tasks > 20% of total tasks, or if there is any critical delay
    const isCritical = overdue > 0;
    const copilotMessage = isCritical 
      ? `${overdue} tarefa${overdue > 1 ? 's atrasadas exigem' : ' atrasada exige'} intervenção imediata da operação.` 
      : 'Todos os sistemas operacionais e pipeline dentro da normalidade.';

    // Project health matrix
    const health: ProjectHealth[] = projects.map(p => {
      const ptasks = tasks.filter(t => t.project_id === p.id);
      const pdone = ptasks.filter(t => t.status === 'done').length;
      const poverdue = ptasks.filter(t =>
        t.due_date && t.due_date < todayStart && t.status !== 'done'
      ).length;
      const lastUpdated = ptasks.reduce((acc, t) => {
        return t.updated_at > acc ? t.updated_at : acc;
      }, p.updated_at || p.created_at);

      return {
        id: p.id,
        name: p.trade_name || p.client_company || p.client_name,
        type: p.type,
        status: p.status,
        totalTasks: ptasks.length,
        doneTasks: pdone,
        overdueTasks: poverdue,
        lastActivity: lastUpdated,
      };
    });

    // Upcoming tasks - next 7 days, sorted by priority + date
    const in7 = new Date();
    in7.setDate(in7.getDate() + 7);
    const in7Str = in7.toISOString();

    const upcomingRaw = tasks
      .filter(t => t.due_date && t.due_date >= todayStart && t.due_date <= in7Str && t.status !== 'done')
      .sort((a, b) => {
        const pa = PRIORITY_ORDER[a.priority] ?? 99;
        const pb = PRIORITY_ORDER[b.priority] ?? 99;
        if (pa !== pb) return pa - pb;
        return a.due_date < b.due_date ? -1 : 1;
      })
      .slice(0, 8)
      .map(t => {
        const proj = projects.find(p => p.id === t.project_id);
        return {
          id: t.id,
          title: t.title,
          projectName: proj?.trade_name || proj?.client_company || proj?.client_name || '-',
          projectId: t.project_id,
          dueDate: t.due_date,
          priority: t.priority,
          status: t.status,
        };
      });

    return {
      kpi: { 
        activeProjects: active, 
        activeDeals: deals.length,
        totalTasks: tasks.length, 
        overdueTasks: overdue, 
        doneTasks: done, 
        reviewTasks: review, 
        approvedPlans: approvedPlansCount 
      },
      health: health.slice(0, 6),
      upcoming: upcomingRaw,
      copilotMessage,
      isCritical
    };
  }, [projects, tasks, approvedPlansCount, deals]);

  if (loading) {
    return (
      <AdminLayout>
        <DashboardSkeleton />
      </AdminLayout>
    );
  }

  const velocityTotal = velocity.reduce((s, v) => s + v.concluidas, 0);

  return (
    <AdminLayout>
    <div className="min-h-screen bg-white">

      {/* ── HEADER - Greeting + KPIs (fundo branco) ──────────────────── */}
      <div className="border-b border-zinc-100 px-8 md:px-12 pt-10 pb-0">
        <div className="max-w-7xl mx-auto">

          {/* Greeting */}
          <div className="flex items-start justify-between gap-6 mb-8">
            <div>
              <p className="text-xxs font-black uppercase tracking-[0.25em] text-zinc-400 mb-2">
                {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' })}
              </p>
              <h1 className="text-4xl md:text-5xl font-black text-zinc-900 tracking-tight leading-[1.05]">
                {greeting()}{userName ? `, ${userName}` : ''}.
              </h1>
              <p className="text-sm font-medium text-zinc-400 mt-2">
                {derived.isCritical 
                  ? <span className="text-red-500 font-bold">{derived.copilotMessage}</span>
                  : 'Tudo em dia. Nenhuma ação crítica.'}
              </p>
            </div>
            <button
              onClick={() => navigate('/admin/rei/novo')}
              className="shrink-0 inline-flex items-center gap-2 bg-zinc-950 hover:bg-zinc-800 text-white font-black uppercase tracking-widest text-xxs  h-10 px-5 transition-colors"
            >
              <Plus className="w-4 h-4" /> Novo Projeto
            </button>
          </div>

          {/* KPI Strip - Vendas + Execução */}
          <div className="grid grid-cols-2 md:grid-cols-4 border-t border-zinc-100">
            {[
              { n: derived.kpi.activeProjects, label: 'Projetos Ativos',    sub: 'operações em andamento',            color: 'text-zinc-900' },
              { n: derived.kpi.activeDeals,    label: 'Pipeline Ativo',     sub: 'oportunidades abertas',          color: 'text-zinc-900' },
              { n: derived.kpi.overdueTasks,   label: 'Atrasadas',          sub: 'requerem atenção',                  color: derived.kpi.overdueTasks > 0 ? 'text-red-500' : 'text-zinc-900' },
              { n: velocityTotal,              label: 'Velocidade',         sub: 'entregas nos últimos 7d',              color: 'text-[#00CC6A]' },
            ].map(({ n, label, sub, color }, i) => (
              <div key={label} className={cn(
                'py-6 flex flex-col gap-1',
                i > 0 && 'pl-6 border-l border-zinc-100',
              )}>
                <span className={cn('text-5xl font-black tracking-tight leading-none tabular-nums', color)}>{n}</span>
                <span className="text-xxs font-black uppercase tracking-widest text-zinc-400 mt-1">{label}</span>
                <span className="text-tiny font-medium text-zinc-400">{sub}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── ZONA CLARA - Conteudo ───────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-8 md:px-12 py-10">

        {/* Orphaned Recordings Alert */}
        <div className="mb-8">
          <OrphanedRecordingsAlert />
        </div>

        {/* Global Copilot Alert (If Critical) */}
        {derived.isCritical && (
          <div className="mb-8 bg-zinc-50 border border-zinc-200 flex items-start p-5 gap-4">
            <div className="w-10 h-10 bg-zinc-950 text-white flex items-center justify-center shrink-0">
              <Radar className="w-5 h-5" />
            </div>
            <div className="pt-0.5">
              <h3 className="text-xxs font-black uppercase text-zinc-900 tracking-[0.25em] mb-1">RevOps Copilot</h3>
              <p className="text-sm font-medium text-zinc-600">{derived.copilotMessage}</p>
            </div>
          </div>
        )}

        {/* ── Quick Access - 3 colunas (inspirado no Hub Notion) ───── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-10">
          {[
            { icon: FolderKanban, label: 'Projetos',    path: '/admin/projects' },
            { icon: BarChart3,    label: 'Pipeline',     path: '/admin/pipeline' },
            { icon: BookOpen,     label: 'Materiais',    path: '/admin/materials' },
            { icon: Users,        label: 'Clientes',     path: '/admin/clients' },
          ].map(({ icon: Icon, label, path }) => (
            <button
              key={path}
              onClick={() => navigate(path)}
              className="bg-zinc-50 hover:bg-zinc-100 p-4 text-left transition-colors group"
            >
              <div className="w-9 h-9 bg-white border border-zinc-200 rounded-lg flex items-center justify-center mb-2.5">
                <Icon className="w-4 h-4 text-zinc-900" />
              </div>
              <span className="text-xs font-bold text-zinc-700 group-hover:text-zinc-900">
                {label}
              </span>
            </button>
          ))}
        </div>

        {/* ── Divider ───────────────────────────────────────────── */}
        <div className="flex items-center gap-3 mb-10">
          <div className="h-[2px] flex-1 bg-zinc-100" />
          <span className="text-xxs font-black uppercase tracking-[0.25em] text-zinc-300">Operacao</span>
          <div className="h-[2px] flex-1 bg-zinc-100" />
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">

          {/* LEFT - Projetos + Velocidade (2/3) */}
          <div className="xl:col-span-2 space-y-8">

            {/* Saude dos Projetos */}
            <div className="border border-zinc-200 overflow-hidden">
              <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100">
                <h2 className="text-xxs font-black uppercase tracking-[0.25em] text-zinc-900">Saude dos Projetos</h2>
                <button
                  onClick={() => navigate('/admin/rei')}
                  className="text-xxs font-black uppercase tracking-widest text-zinc-400 hover:text-zinc-900 flex items-center gap-1 transition-colors"
                >
                  Ver todos <ArrowUpRight className="w-3 h-3" />
                </button>
              </div>

              {derived.health.length === 0 ? (
                <div className="px-6 py-12 text-center">
                  <div className="w-12 h-12 bg-zinc-50 border border-zinc-200 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <FolderKanban className="w-5 h-5 text-zinc-300" />
                  </div>
                  <p className="text-sm font-bold text-zinc-900 mb-0.5">Nenhum projeto ativo</p>
                  <p className="text-xs font-medium text-zinc-400">Crie um projeto para comecar.</p>
                </div>
              ) : (
                <div className="divide-y divide-zinc-50">
                  {derived.health.map(proj => {
                    const pct = proj.totalTasks === 0 ? 0 : Math.round((proj.doneTasks / proj.totalTasks) * 100);
                    return (
                      <div
                        key={proj.id}
                        onClick={() => navigate(`/admin/projects/${proj.id}`)}
                        className="flex items-center gap-4 px-6 py-4 hover:bg-zinc-50 cursor-pointer transition-colors group"
                      >
                        <div className={cn(
                          'w-2 h-2 shrink-0',
                          proj.status === 'active' ? 'bg-[#00CC6A]' : 'bg-zinc-200',
                        )} />

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-sm font-black text-zinc-900 truncate">{proj.name}</span>
                            <TypeBadge type={proj.type} />
                            {proj.overdueTasks > 0 && (
                              <span className="text-2xs font-black uppercase tracking-widest text-red-500 bg-red-50 border border-red-100 px-1.5 py-0.5">
                                {proj.overdueTasks} atrasada{proj.overdueTasks > 1 ? 's' : ''}
                              </span>
                            )}
                          </div>
                          {proj.totalTasks === 0 ? (
                            <div className="mt-1">
                               <span className="text-2xs font-black uppercase tracking-wider bg-zinc-900 text-white px-2 py-0.5">Setup Pendente</span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-3">
                              <div className="flex-1 h-1.5 bg-zinc-100 overflow-hidden">
                                <div
                                  className="h-full transition-all duration-700"
                                  style={{ width: `${pct}%`, backgroundColor: pct === 100 ? '#00CC6A' : '#18181b' }}
                                />
                              </div>
                              <span className="text-xxs font-black text-zinc-400 shrink-0 tabular-nums w-16 text-right">
                                {proj.doneTasks}/{proj.totalTasks}
                              </span>
                            </div>
                          )}
                        </div>

                        <ArrowUpRight className="w-3.5 h-3.5 text-zinc-300 group-hover:text-zinc-600 transition-colors shrink-0" />
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Velocidade */}
            <div className="border border-zinc-200 p-6">
              <div className="flex items-baseline justify-between mb-6">
                <h2 className="text-xxs font-black uppercase tracking-[0.25em] text-zinc-900">Velocidade - 7 Dias</h2>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-black text-zinc-900 tabular-nums">{velocityTotal}</span>
                  <span className="text-xxs font-black uppercase tracking-widest text-zinc-400 ml-1">concluidas</span>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={120}>
                <BarChart data={velocity} margin={{ top: 0, right: 0, left: -32, bottom: 0 }} barSize={28}>
                  <XAxis
                    dataKey="day"
                    tick={{ fontSize: 9, fontWeight: 700, fill: '#a1a1aa' }}
                    axisLine={false} tickLine={false}
                  />
                  <YAxis allowDecimals={false} tick={false} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f4f4f5' }} />
                  <Bar dataKey="concluidas" radius={[4, 4, 0, 0]}>
                    {velocity.map((entry, i) => (
                      <Cell key={i} fill={entry.concluidas > 0 ? '#18181b' : '#f4f4f5'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* RIGHT - Agenda + Atividade (1/3) */}
          <div className="space-y-6">

            {/* Proximos 7 dias */}
            <div className="border border-zinc-200 overflow-hidden">
              <div className="flex items-center gap-2 px-5 py-4 border-b border-zinc-100">
                <h2 className="text-xxs font-black uppercase tracking-[0.25em] text-zinc-900">Proximos 7 Dias</h2>
              </div>

              {derived.upcoming.length === 0 ? (
                <div className="px-5 py-8 text-center">
                  <div className="w-10 h-10 bg-zinc-50 border border-zinc-200 rounded-lg flex items-center justify-center mx-auto mb-2.5">
                    <Calendar className="w-4 h-4 text-zinc-300" />
                  </div>
                  <p className="text-xs font-bold text-zinc-900 mb-0.5">Nenhuma entrega</p>
                  <p className="text-tiny font-medium text-zinc-400">nos proximos 7 dias.</p>
                </div>
              ) : (
                <div className="divide-y divide-zinc-50">
                  {derived.upcoming.map(task => (
                    <div
                      key={task.id}
                      onClick={() => navigate(`/admin/projects/${task.projectId}`)}
                      className="px-5 py-3.5 hover:bg-zinc-50 cursor-pointer transition-colors group flex items-start justify-between gap-3"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-zinc-900 truncate leading-snug">{task.title}</p>
                        <p className="text-xxs font-medium text-zinc-400 mt-0.5 truncate">{task.projectName}</p>
                      </div>
                      <div className="shrink-0 text-right">
                        <p className="text-xxs font-black text-zinc-500 tabular-nums">{formatDate(task.dueDate)}</p>
                        {task.priority === 'urgent' && (
                          <span className="text-3xs font-black uppercase tracking-widest text-red-500">urgente</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Atividade Recente */}
            <div className="border border-zinc-200 overflow-hidden">
              <div className="px-5 py-4 border-b border-zinc-100">
                <h2 className="text-xxs font-black uppercase tracking-[0.25em] text-zinc-900">Atividade Recente</h2>
              </div>
              {activity.length === 0 ? (
                <div className="px-5 py-8 text-center text-xs font-medium text-zinc-400">
                  Nenhuma atividade recente.
                </div>
              ) : (
                <div className="divide-y divide-zinc-50">
                  {activity.slice(0, 5).map(item => (
                    <div key={item.id} className="px-5 py-3 flex items-center gap-3">
                      <div className="w-1.5 h-1.5 bg-zinc-300 shrink-0" />
                      <p className="flex-1 text-xs font-medium text-zinc-600 truncate">{item.text}</p>
                      <span className="text-xxs font-bold text-zinc-400 shrink-0">{item.time}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        </div>
      </div>
    </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
