import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import AdminLayout from '@/components/layout/AdminLayout';
import { Plus, ChevronRight, AlertTriangle, Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getDisplayName } from '@/lib/projectUtils';

// ─── Constants ────────────────────────────────────────────────────────────────

const TYPE_LABELS: Record<string, string> = {
  consulting: '360',
  founder: 'LinkedIn',
  dev: 'Site',
  crm_ops: 'RevOps',
  funnels_impl: 'Funis',
};

const STAGE_CONFIG: Record<string, { label: string; color: string }> = {
  lead_inbound:    { label: 'Lead',           color: 'text-zinc-400 border border-zinc-200' },
  lead_qualified:  { label: 'Qualificado',    color: 'text-zinc-500 border border-zinc-200' },
  diagnostic_done: { label: 'Diagnóstico',    color: 'text-zinc-600 border border-zinc-200' },
  proposal_draft:  { label: 'Em Elaboração',  color: 'text-zinc-600 border border-zinc-200 bg-zinc-50' },
  proposal_sent:   { label: 'Proposta Env.',  color: 'text-zinc-700 border border-zinc-300 bg-zinc-50' },
  proposal_viewed: { label: 'Visualizada',    color: 'text-zinc-800 border border-zinc-300 bg-zinc-100' },
  negotiation:     { label: 'Negociação',     color: 'text-zinc-900 border border-zinc-400 bg-zinc-100' },
  won:             { label: 'Aguard. Onb.',   color: 'text-white bg-zinc-900' },
  onboarding:      { label: 'Onboarding',     color: 'text-white bg-zinc-900' },
  active:          { label: 'Ativo',          color: 'text-white bg-[#00CC6A]' },
  completed:       { label: 'Concluído',      color: 'text-zinc-400 bg-transparent border border-zinc-200' },
  churned:         { label: 'Churn',          color: 'text-white bg-red-600' },
  lost:            { label: 'Perdido',        color: 'text-zinc-500 border border-zinc-200 line-through' },
};

const PRE_SALE  = ['lead_inbound','lead_qualified','diagnostic_done','proposal_draft','proposal_sent','proposal_viewed','negotiation'];
const EXECUTION = ['won','onboarding','active','completed'];
const CLOSED    = ['churned']; // Removed 'lost' as it's a lead concept

type FilterKey = 'todos' | 'execucao' | 'encerrado';

// ─── Component ────────────────────────────────────────────────────────────────

const AdminProjects: React.FC = () => {
  const navigate = useNavigate();
  const [search,  setSearch]  = useState('');
  const [filter,  setFilter]  = useState<FilterKey>('todos');

  const { data: projects = [], isLoading } = useQuery({
    queryKey: ['admin-projects-list'],
    queryFn: async () => {
      const { data: raw, error } = await supabase
        .from('rei_projects')
        .select('id, client_name, client_company, trade_name, type, status, pipeline_stage, created_at, updated_at')
        .not('status', 'eq', 'archived')
        .order('updated_at', { ascending: false });

      if (error) throw error;
      if (!raw?.length) return [];

      // Task counts
      const ids = raw.map(p => p.id);
      const { data: tasks } = await supabase
        .from('orqflow_tasks')
        .select('id, project_id, status, due_date')
        .in('project_id', ids)
        .not('status', 'eq', 'archived');

      const nowIso = new Date().toISOString();

      return raw
        .filter((p: any) => !PRE_SALE.includes(p.pipeline_stage || '') && p.pipeline_stage !== 'lost')
        .map(p => {
        const ptasks = (tasks || []).filter(t => t.project_id === p.id);
        return {
          ...p,
          display_name: getDisplayName({ trade_name: p.trade_name, client_company: p.client_company, client_name: p.client_name }),
          tasks: {
            total:   ptasks.length,
            done:    ptasks.filter(t => t.status === 'done').length,
            overdue: ptasks.filter(t => t.due_date && t.due_date < nowIso && t.status !== 'done').length,
          },
        };
      });
    },
  });

  // ── Filtering ──────────────────────────────────────────────────────────────

  const filtered = useMemo(() => {
    let result = projects;
    if (filter === 'execucao')   result = result.filter(p => EXECUTION.includes(p.pipeline_stage || '') || p.status === 'active');
    if (filter === 'encerrado')  result = result.filter(p => CLOSED.includes(p.pipeline_stage || '') || p.status === 'completed');
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(p =>
        p.display_name.toLowerCase().includes(q) ||
        (p.client_name || '').toLowerCase().includes(q) ||
        (p.client_company || '').toLowerCase().includes(q)
      );
    }
    return result;
  }, [projects, filter, search]);

  const counts = useMemo(() => ({
    todos:     projects.length,
    execucao:  projects.filter(p => EXECUTION.includes(p.pipeline_stage || '') || p.status === 'active').length,
    encerrado: projects.filter(p => CLOSED.includes(p.pipeline_stage || '') || p.status === 'completed').length,
  }), [projects]);

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <AdminLayout>
      <div className="min-h-screen bg-white">

        {/* ── Header ──────────────────────────────────────────────────────── */}
        <div className="border-b border-zinc-100 px-8 md:px-12 pt-10 pb-0">
          <div className="max-w-7xl mx-auto">

            <div className="flex items-start justify-between gap-6 mb-8">
              <div>
                <p className="text-xxs font-black uppercase tracking-[0.25em] text-zinc-400 mb-2">Hub</p>
                <h1 className="text-4xl md:text-5xl font-black text-zinc-900 tracking-tight leading-[1.05]">Projetos</h1>
                <p className="text-sm font-medium text-zinc-400 mt-2">
                  {isLoading ? 'Carregando...' : `${projects.length} registros`}
                </p>
              </div>
              <button
                onClick={() => navigate('/admin/rei/novo')}
                className="shrink-0 inline-flex items-center gap-2 bg-zinc-950 hover:bg-zinc-800 text-white font-black uppercase tracking-widest text-xxs h-10 px-5 transition-colors"
              >
                <Plus className="w-4 h-4" /> Novo Projeto
              </button>
            </div>

            {/* Filter tabs */}
            <div className="flex items-center gap-6 border-t border-zinc-100">
              {([
                { key: 'todos',     label: 'Todos' },
                { key: 'execucao',  label: 'Em Execução' },
                { key: 'encerrado', label: 'Encerrados' },
              ] as { key: FilterKey; label: string }[]).map(f => (
                <button
                  key={f.key}
                  onClick={() => setFilter(f.key)}
                  className={cn(
                    'py-4 text-xxs font-black uppercase tracking-widest border-b-2 transition-colors',
                    filter === f.key
                      ? 'border-zinc-900 text-zinc-900'
                      : 'border-transparent text-zinc-400 hover:text-zinc-600'
                  )}
                >
                  {f.label}
                  <span className="ml-1.5 text-zinc-300">{counts[f.key]}</span>
                </button>
              ))}
            </div>

          </div>
        </div>

        {/* ── Content ─────────────────────────────────────────────────────── */}
        <div className="max-w-7xl mx-auto px-8 md:px-12 py-8">

          {/* Search */}
          <div className="flex items-center gap-2 border border-zinc-200 bg-white mb-6 rounded-none">
            <Search className="w-4 h-4 text-zinc-400 ml-4 shrink-0" />
            <input
              type="text"
              placeholder="Buscar por cliente ou empresa..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="flex-1 py-3 pr-4 text-sm font-medium text-zinc-900 placeholder:text-zinc-300 bg-transparent outline-none"
            />
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-24">
              <div className="w-8 h-8 border-2 border-zinc-200 border-t-zinc-900 rounded-full animate-spin" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 border-2 border-dashed border-zinc-300 bg-zinc-50/50 mt-4 text-center">
              <p className="text-xl font-black text-black uppercase tracking-tight mb-2">Nenhum projeto nas trincheiras</p>
              <p className="text-[0.65rem] font-bold text-zinc-500 uppercase tracking-widest">Ajuste os filtros ou inicie uma nova operação no cockpit.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              <div className="flex flex-col gap-2">
                {filtered.map(project => {
                  const pct = project.tasks.total > 0
                    ? Math.round((project.tasks.done / project.tasks.total) * 100)
                    : 0;
                  const stageInfo = STAGE_CONFIG[project.pipeline_stage || project.status || '']
                    || { label: project.status || '-', color: 'text-zinc-400 bg-zinc-100' };
                  const isExecution = EXECUTION.includes(project.pipeline_stage || '') || project.status === 'active';

                  return (
                    <div
                      key={project.id}
                      onClick={() => navigate(`/admin/projects/${project.id}`)}
                      className="flex items-center gap-4 px-6 py-5 bg-white border border-zinc-200 hover:border-black cursor-pointer transition-all hover:-translate-x-0.5 group"
                    >
                      {/* Status dot */}
                      <div className={cn(
                        'w-2 h-2 shrink-0',
                        project.pipeline_stage === 'active' || project.status === 'active'
                          ? 'bg-[#00CC6A]'
                          : 'bg-zinc-200'
                      )} />

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                          <span className="text-sm font-black text-zinc-900 truncate">{project.display_name}</span>
                          <span className="text-2xs font-black uppercase tracking-widest bg-zinc-100 text-zinc-500 px-2 py-0.5 shrink-0">
                            {TYPE_LABELS[project.type] || project.type}
                          </span>
                          <span className={cn('text-2xs font-black uppercase tracking-widest px-2 py-0.5 shrink-0', stageInfo.color)}>
                            {stageInfo.label}
                          </span>
                          {project.tasks.overdue > 0 && (
                            <span className="text-2xs font-black uppercase tracking-widest text-red-500 bg-red-50 border border-red-100 px-1.5 py-0.5 flex items-center gap-1 shrink-0">
                              <AlertTriangle className="w-2.5 h-2.5" />
                              {project.tasks.overdue} atrasada{project.tasks.overdue > 1 ? 's' : ''}
                            </span>
                          )}
                        </div>

                        {isExecution && project.tasks.total > 0 ? (
                          <div className="flex items-center gap-3">
                            <div className="w-32 h-1.5 bg-zinc-100 overflow-hidden">
                              <div
                                className="h-full transition-all"
                                style={{ width: `${pct}%`, backgroundColor: pct === 100 ? '#00CC6A' : '#18181b' }}
                              />
                            </div>
                            <span className="text-xxs font-black text-zinc-400 tabular-nums">
                              {project.tasks.done}/{project.tasks.total} tarefas
                            </span>
                          </div>
                        ) : isExecution ? (
                          <span className="text-2xs font-black uppercase tracking-wider bg-zinc-900 text-white px-2 py-0.5">
                            Setup Pendente
                          </span>
                        ) : (
                          <span className="text-xxs font-medium text-zinc-400">
                            Atualizado {new Date(project.updated_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })}
                          </span>
                        )}
                      </div>

                      <ChevronRight className="w-3.5 h-3.5 text-zinc-300 group-hover:text-zinc-600 transition-colors shrink-0" />
                    </div>
                  );
                })}
              </div>
            </div>
          )}

        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminProjects;
