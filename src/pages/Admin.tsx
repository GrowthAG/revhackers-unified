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
        <div className="max-w-7xl mx-auto p-8 space-y-12">

          {/* Header */}
          <header className="flex items-end justify-between border-b border-zinc-100 pb-6">
            <div className="space-y-1">
              <h1 className="text-sm font-semibold tracking-tight text-zinc-900 leading-none">
                Central de Operações
              </h1>
              <p className="text-[11px] text-zinc-400 font-medium uppercase tracking-wider">
                Controle de Receita & Projetos
              </p>
            </div>
            <Button
              onClick={() => navigate('/admin/rei/novo')}
              className="bg-zinc-900 hover:bg-black text-white h-9 px-4 text-[10px] font-bold uppercase tracking-widest rounded-xl shadow-sm transition-all"
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
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-2">
                <div className="w-1 h-1 rounded-full bg-[#00CC6A]/50" />
                Projetos Ativos
              </h2>
            </div>

            {operationalProjects.length > 0 ? (
              <div className="space-y-2">
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
  <div className="bg-white p-6 border border-zinc-100 rounded-xl flex flex-col justify-between h-32 transition-all hover:border-zinc-300 group shadow-sm">
    <div className="flex items-center justify-between mb-2">
      <span className="text-[10px] font-black text-zinc-300 uppercase tracking-widest">{label}</span>
      <Icon className="w-4 h-4 text-zinc-200 group-hover:text-zinc-900 transition-colors" />
    </div>
    <div className="flex items-baseline gap-2">
      <span className="text-3xl font-bold tracking-tight text-zinc-900 leading-none">{value}</span>
      {highlight && value > 0 && <span className="flex h-2 w-2 rounded-full bg-[#00CC6A] animate-pulse" />}
    </div>
  </div>
);

const TYPE_LABELS: Record<string, string> = {
  crm_ops: 'CRM & RevOps',
  CRM_CS_OPS: 'CRM & RevOps',
  funnels_impl: 'Site & Funil',
  founder: 'Founder',
  content_seo: 'SEO',
  consulting: '360\u00ba',
  training: 'Treinamento',
};

const ProjectRow = ({ project, navigate }: any) => {
  const displayName = project.client_company || project.client_name || 'Projeto sem nome';
  const displayInitial = displayName.charAt(0).toUpperCase();
  const typeLabel = TYPE_LABELS[project.type] || project.type || '';
  const duration = (project as any).project_duration || '';

  return (
    <div
      onClick={() => navigate(`/admin/jornada/${project.id}`)}
      className="group flex items-center justify-between p-4 border border-zinc-100 rounded-xl hover:border-zinc-300 transition-all cursor-pointer bg-white shadow-sm hover:shadow-md"
    >
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 bg-zinc-50 rounded-lg flex items-center justify-center text-zinc-300 group-hover:bg-zinc-900 group-hover:text-white transition-all font-bold text-xs">
          {displayInitial}
        </div>
        <div>
          <h3 className="text-xs font-bold text-zinc-900">{displayName}</h3>
          <p className="text-[10px] text-zinc-400 font-medium mt-0.5 flex items-center gap-1.5 uppercase tracking-wider">
            {project.status === 'active' ? (
              <span className="inline-flex items-center gap-1 text-[#00CC6A] font-bold">
                Em Execu\u00e7\u00e3o
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-zinc-400">
                Pendente
              </span>
            )}
            <span className="text-zinc-200">\u2022</span>
            {typeLabel && (
              <>
                <span>{typeLabel}</span>
                <span className="text-zinc-200">\u2022</span>
              </>
            )}
            {duration && (
              <>
                <span>{duration}</span>
                <span className="text-zinc-200">\u2022</span>
              </>
            )}
            <span>Q{project.quarter}/{project.year}</span>
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button
          variant="outline"
          onClick={(e) => { e.stopPropagation(); navigate(`/admin/rei/${project.id}`); }}
          className="h-7 text-[9px] font-bold uppercase tracking-widest text-zinc-400 border-zinc-100 hover:bg-zinc-100 hover:text-zinc-900 hover:border-zinc-200 transition-all px-3 rounded-lg"
          title="Editar dados cadastrais"
        >
          Editar
        </Button>
        <Button variant="ghost" size="icon" className="h-7 w-7 text-zinc-300 hover:text-zinc-900">
          <MoreHorizontal className="w-3.5 h-3.5" />
        </Button>
      </div>
    </div>
  );
};

const EmptyState = ({ navigate }: any) => (
  <div className="bg-zinc-50/30 rounded-xl border border-dashed border-zinc-200 p-12 flex flex-col items-center justify-center text-center">
    <div className="w-10 h-10 bg-white border border-zinc-100 rounded-lg flex items-center justify-center mb-4 shadow-sm">
      <Folder className="w-4 h-4 text-zinc-300" />
    </div>
    <h3 className="text-xs font-bold text-zinc-900 mb-1">Sem projetos ativos</h3>
    <p className="text-[10px] text-zinc-400 max-w-xs mx-auto mb-6 uppercase tracking-wide">
      Inicie um novo projeto para gerenciar o ciclo de vida
    </p>
    <Button
      variant="outline"
      onClick={() => navigate('/admin/rei/novo')}
      className="bg-white border-zinc-100 text-zinc-900 hover:bg-zinc-900 hover:text-white shadow-sm h-9 px-5 text-[10px] font-bold uppercase tracking-widest rounded-xl transition-all"
    >
      Iniciar Projeto
    </Button>
  </div>
);

export default Admin;
