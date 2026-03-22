import React, { useState, useEffect } from 'react';
import { KanbanSquare, List, Calendar, ChevronRight, Trash2, Sparkles, Loader2 } from 'lucide-react';
import { KanbanView } from './views/KanbanView';
import { ListView } from './views/ListView';
import { GanttView } from './views/GanttView';
import { TaskModal } from './TaskModal';
import { useOrqflowStore } from '@/store/useOrqflow';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';

interface ProjectOsContainerProps {
  projectId: string;
}

export const ProjectOsContainer: React.FC<ProjectOsContainerProps> = ({ projectId }) => {
  const [activeView, setActiveView] = useState<'kanban' | 'list' | 'gantt'>('kanban');
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null);
  const { fetchTasks, subscribeToTasks, unsubscribeFromTasks, sprints, fetchSprints, fetchWorkspaceUsers } = useOrqflowStore();
  const { tasks: currentTasks } = useOrqflowStore();
  const [activeTab, setActiveTab] = useState<'board' | 'list' | 'gantt' | 'documents'>('board');
  const [selectedSprint, setSelectedSprint] = useState<string>('all');
  const [isSprintModalOpen, setIsSprintModalOpen] = useState(false);
  const [isDeletingSprint, setIsDeletingSprint] = useState<string | null>(null);
  const [isCreatingSprint, setIsCreatingSprint] = useState(false);
  const [newSprintName, setNewSprintName] = useState("");
  const [isGeneratingTasks, setIsGeneratingTasks] = useState(false);
  
  useEffect(() => {
    if (projectId) {
      fetchSprints(projectId);
      fetchWorkspaceUsers();
    }
  }, [projectId, fetchSprints, fetchWorkspaceUsers]);

  const handleCreateSprint = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!newSprintName.trim()) return;

    try {
      const { data, error } = await supabase
        .from('orqflow_sprints')
        .insert({
          project_id: projectId,
          name: newSprintName,
          status: 'planned',
          start_date: new Date().toISOString(),
          end_date: new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString()
        })
        .select()
        .single();
      
      if (error) throw error;
      // Refresh global sprints
      fetchSprints(projectId);
      setSelectedSprint(data.id);
      setIsCreatingSprint(false);
      setNewSprintName('');
      toast({ title: 'Sprint Iniciada', description: `O ciclo ${newSprintName} foi aberto.` });
    } catch (e: any) {
      toast({ title: 'Erro ao criar', description: e.message, variant: 'destructive' });
    }
  };

  const handleDeleteSprint = async () => {
    if (!isDeletingSprint) return;

    try {
       const { error } = await supabase.from('orqflow_sprints').delete().eq('id', isDeletingSprint);
       if (error) throw error;
       
       toast({ title: "Ciclo Destruído" });
       fetchSprints(projectId);
       setSelectedSprint('all');
       toast({ title: 'Sprint Destruída', description: 'Ciclo e tarefas filhas limpas do banco.' });
    } catch (e: any) {
       toast({ title: 'Erro Crítico', description: 'Ocorreu um erro ao excluir a Sprint.', variant: 'destructive' });
    } finally {
       setIsDeletingSprint(null);
    }
  };

  useEffect(() => {
    if (projectId) {
      subscribeToTasks(projectId);
      return () => unsubscribeFromTasks();
    }
  }, [projectId]);

  useEffect(() => {
    // Engine Central: Dispara o fetch 1 única vez para carregar o Mapa (O(1)) na RAM
    if (projectId) {
      fetchTasks(projectId, selectedSprint === 'all' ? null : selectedSprint);
    }
  }, [projectId, selectedSprint, fetchTasks]);

  const handleGenerateTasks = async (withSprints = false) => {
    const { tasks } = useOrqflowStore.getState();
    const existingCount = Object.keys(tasks).length;

    if (existingCount > 0) {
      const confirmed = window.confirm(
        `Este projeto ja tem ${existingCount} tarefa(s). Deseja gerar novas tarefas em adicao as existentes?`
      );
      if (!confirmed) return;
    }

    setIsGeneratingTasks(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-project-tasks', {
        body: {
          projectId,
          sprintId: selectedSprint === 'all' ? null : selectedSprint,
          createSprints: withSprints,
          overwrite: existingCount > 0,
        }
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      if (data?.skipped) {
        toast({ title: 'Tarefas ja existem', description: data.message, variant: 'default' });
        return;
      }

      const sprintMsg = data?.sprints_created > 0 ? ` + ${data.sprints_created} ciclos criados.` : '';
      toast({
        title: 'Tarefas geradas com sucesso',
        description: `${data?.inserted} tarefas criadas com briefing personalizado para ${data?.client}.${sprintMsg}`,
      });

      // Realtime ja hidrata o Kanban via subscribeToTasks - forcamos fetch para garantir
      fetchTasks(projectId, selectedSprint === 'all' ? null : selectedSprint);
    } catch (e: any) {
      toast({
        title: 'Erro na geracao de tarefas',
        description: e.message || 'Nao foi possivel conectar com o gerador de IA.',
        variant: 'destructive',
      });
    } finally {
      setIsGeneratingTasks(false);
    }
  };

  // Todo: Fetch sprints from DB and tasks associated with them.
  // We'll mock for the skeleton architecture first.

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-4rem)] bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-white overflow-hidden">
      {/* OS Header - Minimalist */}
      <div className="px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 flex-none z-10">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold flex items-center gap-2">
            Workspace 
            <ChevronRight className="w-4 h-4 text-zinc-400 dark:text-zinc-500" />
            <div className="flex items-center border border-zinc-200 dark:border-zinc-800 rounded-md bg-white dark:bg-zinc-900 shadow-sm ml-2">
              <select 
                value={selectedSprint || 'all'}
                onChange={(e) => setSelectedSprint(e.target.value)}
                className="bg-transparent text-sm font-medium focus:outline-none appearance-none outline-none py-1.5 pl-3 pr-8 w-64 text-zinc-900 dark:text-zinc-200 cursor-pointer"
              >
                <option value="all">Visão Global (Todas Sprints)</option>
                {sprints.map(s => (
                  <option key={s.id} value={s.id}>{s.name} {s.status === 'active' ? '🟢' : ''}</option>
                ))}
              </select>
              {isCreatingSprint ? (
                <form onSubmit={handleCreateSprint} className="flex items-center border-l border-r border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800">
                  <input
                    type="text"
                    value={newSprintName}
                    onChange={(e) => setNewSprintName(e.target.value)}
                    placeholder="Nome da Sprint..."
                    className="w-32 bg-transparent text-xs px-2 py-1 outline-none text-zinc-900 dark:text-white"
                    autoFocus
                    onBlur={() => {
                      if(!newSprintName) setIsCreatingSprint(false);
                    }}
                  />
                  <button type="submit" className="text-xs font-bold px-2 py-1.5 text-revhackers hover:bg-zinc-200 dark:hover:bg-zinc-700">OK</button>
                </form>
              ) : (
                <button 
                  onClick={() => setIsCreatingSprint(true)}
                  className="px-3 py-1.5 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white transition-colors border-l border-r border-zinc-200 dark:border-zinc-700"
                  title="Nova Sprint"
                >
                  <span className="font-bold">+</span>
                </button>
              )}
              {selectedSprint && selectedSprint !== 'all' && (
                <button 
                  onClick={() => setIsDeletingSprint(selectedSprint)}
                  className="px-3 py-1.5 bg-zinc-100 dark:bg-zinc-800 hover:bg-red-100 dark:hover:bg-red-900/50 text-zinc-500 hover:text-red-500 dark:hover:text-red-400 rounded-r transition-colors"
                  title="Destruir Sprint e Tarefas"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
              {(!selectedSprint || selectedSprint === 'all') && (
                <div className="px-3 py-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-r"></div>
              )}
            </div>
          </h2>
          
          {/* Gerar Tarefas com IA */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleGenerateTasks(false)}
              disabled={isGeneratingTasks}
              title="Gerar tarefas com briefing personalizado baseado no REI e plano estrategico"
              className="flex items-center gap-2 px-3 py-1.5 bg-zinc-900 dark:bg-white hover:bg-zinc-700 dark:hover:bg-zinc-100 text-white dark:text-zinc-900 text-[11px] font-black uppercase tracking-widest rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isGeneratingTasks
                ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                : <Sparkles className="w-3.5 h-3.5" />
              }
              {isGeneratingTasks ? 'Gerando...' : 'Gerar com IA'}
            </button>
            <button
              onClick={() => handleGenerateTasks(true)}
              disabled={isGeneratingTasks}
              title="Gerar tarefas E criar ciclos automaticamente por fase do roadmap"
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#00CC6A]/10 hover:bg-[#00CC6A]/20 text-[#00CC6A] border border-[#00CC6A]/30 text-[11px] font-black uppercase tracking-widest rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isGeneratingTasks
                ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                : <Sparkles className="w-3.5 h-3.5" />
              }
              + Ciclos
            </button>
          </div>

          <div className="flex items-center border border-zinc-200 dark:border-zinc-800 rounded-lg p-1 bg-zinc-100 dark:bg-zinc-900/80 shadow-inner">
            <button
              onClick={() => setActiveView('kanban')}
              className={`p-1.5 rounded-md flex items-center justify-center transition-all ${
                activeView === 'kanban' 
                  ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-sm ring-1 ring-zinc-200 dark:ring-zinc-700' 
                  : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-300'
              }`}
            >
              <KanbanSquare className="w-4 h-4" />
            </button>
            <button 
              onClick={() => setActiveView('list')}
              className={`p-1.5 rounded-md flex items-center justify-center transition-all ${
                activeView === 'list' 
                  ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-sm ring-1 ring-zinc-200 dark:ring-zinc-700' 
                  : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-300'
              }`}
            >
              <List className="w-4 h-4" />
            </button>
            <button 
              onClick={() => setActiveView('gantt')}
              className={`p-1.5 rounded-md flex items-center justify-center transition-all ${
                activeView === 'gantt' 
                  ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-sm ring-1 ring-zinc-200 dark:ring-zinc-700' 
                  : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-300'
              }`}
            >
            <Calendar className="w-4 h-4" /> Timeline
            </button>
          </div>
        </div>
      </div>

      {/* OS Canvas Body */}
      <div className="flex-1 overflow-hidden relative bg-white dark:bg-zinc-950">
         {activeView === 'kanban' && <KanbanView projectId={projectId} sprintId={selectedSprint} onTaskClick={setActiveTaskId} />}
         {activeView === 'list' && <ListView projectId={projectId} sprintId={selectedSprint} onTaskClick={setActiveTaskId} />}
         {activeView === 'gantt' && <GanttView projectId={projectId} sprintId={selectedSprint} />}
      </div>

      {/* Task Single Page Modal Overlay */}
      {activeTaskId && (
        <TaskModal 
          taskId={activeTaskId} 
          onClose={() => setActiveTaskId(null)} 
        />
      )}

      {/* Bulletproof Delete Sprint Modal */}
      <AlertDialog open={!!isDeletingSprint} onOpenChange={(open) => !open && setIsDeletingSprint(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirma a exclusão (Destruição) da Sprint?</AlertDialogTitle>
            <AlertDialogDescription>
              Essa ação é irreversível e vai deletar o Ciclo atual juntamente com todas as tarefas atribuídas a ele. O banco de dados fará a cascata de forma permanente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteSprint} className="bg-red-600 hover:bg-red-700 text-white">Estou Ciente, Destruir Sprint</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
