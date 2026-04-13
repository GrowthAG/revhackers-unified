import React from 'react';
import { Target, Activity, CheckCircle2 } from 'lucide-react';

interface ProjectOsContainerProps {
  projectId: string;
}

export const ProjectOsContainer: React.FC<ProjectOsContainerProps> = ({ projectId }) => {
  // O Código de micro-tasks ("Frankenstein") foi deletado.
  // Aqui receberemos futuramente Webhooks do ClickUp com os Milestones!

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-4rem)] bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-white overflow-hidden p-8">
      
      <div className="max-w-4xl mx-auto w-full space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white mb-2">Engenharia de Receita</h1>
          <p className="text-zinc-500 dark:text-zinc-400">
            Acompanhamento Executivo de Integração e Milestones Estratégicos.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 rounded-lg shadow-sm flex flex-col gap-3">
             <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
                <Target className="w-5 h-5" />
                <h3 className="font-semibold">O Norte (Estratégia)</h3>
             </div>
             <p className="text-sm text-zinc-600 dark:text-zinc-400">
               Playbook gerado e aprovado. Time técnico operando a arquitetura no backoffice.
             </p>
          </div>

          <div className="border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 rounded-lg shadow-sm flex flex-col gap-3">
             <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
                <Activity className="w-5 h-5" />
                <h3 className="font-semibold">Status de Tracionamento</h3>
             </div>
             <p className="text-sm text-zinc-600 dark:text-zinc-400">
               Fase 1 (Onboarding e Configuração de CRM) em andamento pela equipe de CS.
             </p>
          </div>

          <div className="border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 rounded-lg shadow-sm flex flex-col gap-3">
             <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="w-5 h-5" />
                <h3 className="font-semibold">Última Entrega</h3>
             </div>
             <p className="text-sm text-zinc-600 dark:text-zinc-400">
               Auditoria Comercial e Mapeamento de Funil concluídos com sucesso.
             </p>
          </div>
        </div>

        {/* Placeholder para a barra de progresso lida do ClickUp no futuro */}
        <div className="mt-8 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 rounded-lg shadow-sm">
          <div className="flex items-center justify-between mb-4">
             <h3 className="font-semibold">Progresso da Arquitetura Principal</h3>
             <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400">Em andamento (Traction)</span>
          </div>
          <div className="w-full bg-zinc-100 dark:bg-zinc-800 rounded-full h-2.5">
            <div className="bg-zinc-900 dark:bg-white h-2.5 rounded-full" style={{ width: '35%' }}></div>
          </div>
          <p className="text-xs text-zinc-500 mt-4">
             Nota: As tarefas granulares estão sob responsabilidade da tropa técnica. Este painel reflete exclusivamente os marcos executivos do projeto.
          </p>
        </div>
      </div>

    </div>
  );
};
