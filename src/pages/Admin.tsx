import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import AdminLayout from '@/components/layout/AdminLayout';
import { useReiProjects } from '@/hooks/useReiProjects';
import {
  LayoutDashboard,
  ArrowUpRight,
  Plus,
  Folder,
  Clock,
  CheckCircle2,
  Loader2,
  MoreHorizontal
} from "lucide-react";
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

const Admin = () => {
  const { user, userProfile } = useAuth();
  const navigate = useNavigate();
  const { projects, loading } = useReiProjects();
  const [firstName, setFirstName] = useState<string>('');

  useEffect(() => {
    if (userProfile?.full_name) {
      setFirstName(userProfile.full_name.split(' ')[0]);
    } else if (user?.email) {
      setFirstName(user.email.split('@')[0]);
    }
  }, [user, userProfile]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Loader2 className="w-5 h-5 text-black animate-spin" />
      </div>
    );
  }

  // Metrics
  const activeProjects = projects?.filter(p => p.status === 'active').length || 0;
  const completedProjects = projects?.filter(p => p.status === 'completed').length || 0;
  const pendingProjects = projects?.filter(p => p.status === 'pending').length || 0;
  const totalProjects = projects?.length || 0;
  const operationalProjects = projects?.filter(p => p.status !== 'completed' && p.status !== 'archived') || [];

  return (
    <AdminLayout>
      <div className="min-h-screen bg-white font-sans selection:bg-zinc-200">
        <div className="max-w-[1600px] mx-auto p-8 lg:p-20 space-y-24">

          {/* Header */}
          <header className="flex items-end justify-between border-b border-zinc-100 pb-12">
            <div className="space-y-4">
              <h1 className="text-7xl font-black tracking-ultratight text-black uppercase leading-none">
                CENTRAL_OPS
              </h1>
              <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-[0.3em]">
                // SISTEMA DE CONTROLE DE RECEITA // v2.0
              </p>
            </div>
            <Button
              onClick={() => navigate('/admin/rei/novo')}
              className="bg-zinc-900 hover:bg-black text-white h-9 px-4 text-[12px] font-medium rounded-lg shadow-sm transition-all"
            >
              <Plus className="w-3.5 h-3.5 mr-2" />
              Novo Projeto
            </Button>
          </header>

          {/* Metrics Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard
              label="Projetos Totais"
              value={totalProjects}
              icon={Folder}
            />
            <MetricCard
              label="Em Execução"
              value={activeProjects}
              icon={Clock}
              highlight
            />
            <MetricCard
              label="Kickoff / Setup"
              value={pendingProjects}
              icon={ArrowUpRight}
            />
            <MetricCard
              label="Concluídos"
              value={completedProjects}
              icon={CheckCircle2}
            />
          </div>

          {/* Main Content Area */}
          <div className="space-y-8">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-4">
              <h2 className="text-[10px] font-black text-black uppercase tracking-[0.4em]">
                PROJETOS_ATIVOS
              </h2>
            </div>

            {operationalProjects.length > 0 ? (
              <div className="border border-zinc-100 divide-y divide-zinc-100 overflow-hidden">
                {operationalProjects.map((project) => (
                  <ProjectRow key={project.id} project={project} navigate={navigate} />
                ))}
              </div>
            ) : (
              <EmptyState navigate={navigate} />
            )}
          </div>

        </div>
      </div>
    </AdminLayout>
  );
};

// --- Subcomponents ---

const MetricCard = ({ label, value, icon: Icon, highlight = false }: any) => (
  <div className="bg-white p-8 border border-zinc-100 flex flex-col justify-between h-48 transition-all hover:border-black group">
    <div className="flex items-center justify-between mb-4">
      <span className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] font-mono">// {label.toUpperCase().replace(' ', '_')}</span>
    </div>
    <div className="flex items-baseline gap-2">
      <span className="text-7xl font-black tracking-ultratight text-black leading-none">{value}</span>
      {highlight && value > 0 && <span className="flex h-3 w-3 rounded-full bg-revgreen animate-pulse" />}
    </div>
  </div>
);

const ProjectRow = ({ project, navigate }: any) => (
  <div
    onClick={() => navigate(`/admin/rei/${project.id}`)}
    className="group flex items-center justify-between p-8 hover:bg-zinc-50 transition-all cursor-pointer bg-white"
  >
    <div className="flex items-center gap-8">
      <div className="w-12 h-12 border border-zinc-100 flex items-center justify-center text-zinc-400 group-hover:bg-black group-hover:text-white transition-all">
        <Folder className="w-5 h-5" strokeWidth={1} />
      </div>
      <div>
        <h3 className="text-[13px] font-bold text-black">{project.client_name || 'Projeto sem nome'}</h3>
        <p className="text-[11px] text-black font-bold mt-0.5 flex items-center gap-1.5 opacity-60">
          {project.status === 'active' ? (
            <span className="inline-flex items-center gap-1 text-black font-black">
              <span className="w-1.5 h-1.5 rounded-full bg-revgreen" /> Em Execução
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-black/40">
              <span className="w-1.5 h-1.5 rounded-full bg-zinc-300" /> Pendente
            </span>
          )}
          <span className="text-zinc-300">•</span>
          <span>Q{project.quarter}/{project.year}</span>
        </p>
      </div>
    </div>

    <div className="flex items-center gap-3">
      <Button
        variant="outline"
        onClick={(e) => { e.stopPropagation(); navigate(`/admin/jornada/${project.id}`); }}
        className="h-8 text-[10px] font-black uppercase tracking-widest text-zinc-600 border-zinc-200 hover:bg-black hover:text-white hover:border-black transition-all px-4 rounded-none"
      >
        Ver Jornada
      </Button>
      <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-400 hover:text-zinc-900 opacity-0 group-hover:opacity-100 transition-opacity">
        <MoreHorizontal className="w-4 h-4" />
      </Button>
    </div>
  </div>
);

const EmptyState = ({ navigate }: any) => (
  <div className="bg-white rounded-xl border border-dashed border-zinc-200 p-12 flex flex-col items-center justify-center text-center">
    <div className="w-12 h-12 bg-zinc-50 rounded-xl flex items-center justify-center mb-4">
      <Folder className="w-6 h-6 text-zinc-300" />
    </div>
    <h3 className="text-sm font-semibold text-zinc-900 mb-1">Sem projetos ativos</h3>
    <p className="text-[12px] text-zinc-500 max-w-xs mx-auto mb-6">
      Comece criando um novo projeto para gerenciar o onboarding e ciclo de vida do cliente.
    </p>
    <Button
      variant="outline"
      onClick={() => navigate('/admin/rei/novo')}
      className="bg-white border-2 border-zinc-100 text-black hover:bg-black hover:text-white shadow-sm h-10 px-6 text-[11px] font-black uppercase tracking-widest rounded-none transition-all"
    >
      Iniciar Primeiro Projeto
    </Button>
  </div>
);

export default Admin;
