import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { X, Clock, User, Tags, AlignLeft, Calendar, FileText, Play, Square, Loader2, Link2, Trash2 } from 'lucide-react';
import { OrqflowEditor } from './editor/OrqflowEditor';
import { TaskComments } from './TaskComments';
import { TaskAttachments } from './TaskAttachments';
import { TaskDependencies } from './TaskDependencies';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useOrqflowStore, TaskStatus } from '@/store/useOrqflow';
import { toast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';

interface TaskModalProps {
  taskId: string | null;
  onClose: () => void;
}

export const TaskModal: React.FC<TaskModalProps> = ({ taskId, onClose }) => {
  const { tasks, updateTask, activeTimer, startTimer, stopTimer, deleteTask, sprints, workspaceUsers } = useOrqflowStore();
  const allTasks = tasks;
  const task = taskId ? tasks[taskId] : null;
  const [localTitle, setLocalTitle] = useState('');
  const [totalTrackedSecs, setTotalTrackedSecs] = useState(0);
  const [isTimerLoading, setIsTimerLoading] = useState(true);
  const [generatingLink, setGeneratingLink] = useState(false);
  const [isDeletingTask, setIsDeletingTask] = useState(false);

  // Computed state for active tracker for this very task
  const isThisTaskTracking = activeTimer?.taskId === taskId;

  useEffect(() => {
    if (taskId) {
      // Async IIFE to fetch tracked time immediately when modal opens
      (async () => {
        setIsTimerLoading(true);
        try {
          const { data, error } = await supabase
            .from('orqflow_time_logs')
            .select('duration_seconds')
            .eq('task_id', taskId);
          
          if (!error && data) {
            const sum = data.reduce((acc, curr) => acc + (curr.duration_seconds || 0), 0);
            setTotalTrackedSecs(sum);
          }
        } catch (e) {
          console.error("Failed to load time logs", e);
        } finally {
          setIsTimerLoading(false);
        }
      })();
    }
  }, [taskId, activeTimer]); // re-trigger fetch if timer stops (activeTimer changes)

  useEffect(() => {
    if (task) {
      setLocalTitle(task.title);
    }
  }, [task?.title]);

  // Remover Toast antigo do '/Documento'
  // Renderizado nativamente via Modal

  const handlePropertyChange = async (key: string, value: any) => {
    if (!taskId) return;
    await updateTask(taskId, { [key]: value });
  };

  const handleUpdateContent = async (newContent: any) => {
    if (!taskId) return;
    await updateTask(taskId, { content: newContent });
    // update_at will be handled by DB auto-trigger or omitted for now to keep speed
  };

  const handleGenerateMagicLink = async () => {
    if (!taskId) return;
    setGeneratingLink(true);
    try {
      // Obter usuario autenticado para audit trail
      const { data: { user } } = await supabase.auth.getUser();

      const { data, error } = await supabase
        .from('orqflow_magic_links' as any)
        .insert({
          task_id: taskId,
          status: 'pending',
          expires_at: new Date(Date.now() + 72 * 60 * 60 * 1000).toISOString(), // 72h
          created_by: user?.id ?? null,
        })
        .select()
        .single();

      if (error) throw error;

      const token = (data as any)?.token;
      const link = `${window.location.origin}/approve/${token}`;
      await navigator.clipboard.writeText(link);
      toast({ title: 'Link de Aprovacao Copiado', description: 'Valido por 72h. O cliente aprova sem precisar fazer login.' });
    } catch(e: any) {
      toast({ title: 'Erro ao gerar link', description: e.message, variant: 'destructive' });
    } finally {
      setGeneratingLink(false);
    }
  };

  if (!taskId) return null;

  // Render modal overlay
  return (
    <>
      {/* Dark overlay backdrop */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex justify-end transition-opacity"
        onClick={onClose}
      />
      
      {/* Slide-over Right Panel (Linear/Notion style) */}
      <div 
        className="fixed inset-y-0 right-0 w-full md:w-[800px] max-w-full bg-white dark:bg-zinc-950 border-l border-zinc-200 dark:border-zinc-800 shadow-sm z-50 flex flex-col transform transition-transform animate-in slide-in-from-right duration-300"
      >
        {!task ? (
          <div className="flex-1 flex items-center justify-center text-zinc-500">
            Carregando inteligência da tarefa...
          </div>
        ) : (
          <>
            {/* Header: Breadcrumbs & Actions */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-200 dark:border-zinc-800/60 sticky top-0 bg-white/90 dark:bg-zinc-950/90 backdrop-blur-md z-10">
              <div className="flex items-center gap-2 text-sm text-zinc-500 font-medium">
                <span className="uppercase text-[10px] tracking-wider bg-zinc-100 dark:bg-zinc-800 px-2 py-1 rounded text-zinc-600 dark:text-zinc-300">
                  {task.status}
                </span>
                <span className="text-zinc-400 dark:text-zinc-600">/</span>
                <span className="truncate max-w-[200px] text-zinc-800 dark:text-zinc-300">{task.title}</span>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={handleGenerateMagicLink}
                  disabled={generatingLink}
                  className="px-3 py-1.5 flex items-center gap-2 text-xs font-bold text-zinc-700 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 hover:text-black dark:hover:text-white rounded-md transition-colors border border-zinc-200 dark:border-zinc-700 disabled:opacity-50"
                  title="Gerar Link Mágico de Aprovação (Zero-Login)"
                >
                  {generatingLink ? <Loader2 className="w-4 h-4 animate-spin" /> : <Link2 className="w-4 h-4 text-emerald-400" />}
                  CLIENT HANDOFF
                </button>
                  <button 
                    onClick={() => setIsDeletingTask(true)}
                    className="p-1.5 rounded-md text-red-500/70 hover:text-red-500 hover:bg-red-500/10 transition-colors"
                    title="Destruir Tarefa"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                <div className="w-[1px] h-4 bg-zinc-200 dark:bg-zinc-800 mx-1" />
                <button 
                  onClick={onClose}
                  className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-md text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Scrollable Body */}
            <div className="flex-1 overflow-y-auto hide-scrollbar">
              <div className="px-8 py-6 max-w-3xl mx-auto">
                
                {/* Task Title */}
                <input 
                  type="text" 
                  value={localTitle}
                  onChange={(e) => setLocalTitle(e.target.value)}
                  onBlur={() => {
                     if(localTitle !== task.title) handlePropertyChange('title', localTitle);
                  }}
                  className="w-full text-3xl font-bold bg-transparent border-none outline-none text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-700 mb-8"
                  placeholder="Título da Tarefa"
                />

                {/* Properties Grid (Custom Fields skeleton) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8 mb-10 py-4 border-t border-b border-zinc-200 dark:border-zinc-800/50">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 text-sm text-zinc-500 w-32 shrink-0">
                      <User className="w-4 h-4" /> Responsável
                    </div>
                    <div className="flex items-center gap-2 w-full max-w-[200px]">
                      <div className="w-6 h-6 shrink-0 rounded-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-[10px] flex items-center justify-center font-bold text-zinc-600 dark:text-zinc-300">
                        {task.assignee_id ? (workspaceUsers.find((u) => u.id === task.assignee_id)?.full_name?.substring(0,2).toUpperCase() || 'AT') : '--'}
                      </div>
                      <select 
                        value={task.assignee_id || ''}
                        onChange={(e) => handlePropertyChange('assignee_id', e.target.value || null)}
                        className="w-full text-sm text-zinc-700 dark:text-zinc-300 bg-transparent px-1 py-1 rounded outline-none hover:bg-zinc-100 dark:hover:bg-zinc-800/50 cursor-pointer truncate"
                      >
                        <option value="">Não Atribuído</option>
                        {workspaceUsers.map((u) => (
                          <option key={u.id} value={u.id}>
                            {u.full_name || u.email || 'Usuário'}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 text-sm text-zinc-500 w-32">
                      <Calendar className="w-4 h-4" /> Datas
                    </div>
                    <div className="flex flex-col gap-2 w-full max-w-[200px]">
                       {/* INÍCIO */}
                       <div className="flex items-center justify-between w-full group">
                         <span className="text-[10px] uppercase font-bold text-zinc-400 truncate pr-2">Início</span>
                         <input 
                           type="date"
                           value={task.start_date ? task.start_date.split('T')[0] : ''}
                           onChange={(e) => handlePropertyChange('start_date', e.target.value || null)}
                           className="w-[125px] text-sm text-zinc-700 dark:text-zinc-300 bg-transparent hover:bg-zinc-100 dark:hover:bg-zinc-800/50 rounded px-1.5 py-0.5 outline-none focus:ring-1 focus:ring-zinc-300 dark:focus:ring-zinc-700 cursor-pointer border border-transparent hover:border-zinc-200 dark:hover:border-zinc-700 transition-colors"
                         />
                       </div>

                       {/* PRAZO/FIM */}
                       <div className="flex items-center justify-between w-full group">
                         <span className="text-[10px] uppercase font-bold text-zinc-400 truncate pr-2">Prazo</span>
                         <input 
                           type="date"
                           value={task.due_date ? task.due_date.split('T')[0] : ''}
                           onChange={(e) => handlePropertyChange('due_date', e.target.value || null)}
                           className="w-[125px] text-sm text-zinc-700 dark:text-zinc-300 bg-transparent hover:bg-zinc-100 dark:hover:bg-zinc-800/50 rounded px-1.5 py-0.5 outline-none focus:ring-1 focus:ring-zinc-300 dark:focus:ring-zinc-700 cursor-pointer border border-transparent hover:border-zinc-200 dark:hover:border-zinc-700 transition-colors"
                         />
                       </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 text-sm text-zinc-500 w-32">
                      <Tags className="w-4 h-4" /> Prioridade
                    </div>
                    <select 
                      value={task.priority || 'medium'}
                      onChange={(e) => handlePropertyChange('priority', e.target.value)}
                      className="text-sm font-semibold uppercase text-zinc-700 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800/50 px-2 py-0.5 rounded border border-zinc-200 dark:border-zinc-700/50 outline-none focus:ring-1 focus:ring-revhackers cursor-pointer"
                    >
                      <option value="low">Baixa</option>
                      <option value="medium">Média</option>
                      <option value="high">Alta</option>
                      <option value="urgent">Urgente</option>
                    </select>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 text-sm text-zinc-500 w-32">
                      <Clock className="w-4 h-4" /> Tracker Real
                    </div>
                    <div className="flex items-center gap-2">
                       {isThisTaskTracking ? (
                         <button 
                           onClick={stopTimer}
                           className="flex items-center gap-1.5 px-3 py-1 bg-red-900/40 text-red-500 hover:bg-red-900/60 hover:text-red-400 rounded-md transition-colors text-xs font-bold border border-red-900/60"
                           title="Parar Auditoria"
                         >
                           <Square className="w-3 h-3 fill-current" /> GRAVANDO
                         </button>
                       ) : (
                         <button 
                           onClick={() => taskId && startTimer(taskId)}
                           disabled={activeTimer !== null}
                           className="flex items-center gap-1.5 px-3 py-1 bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 hover:text-black dark:hover:text-white rounded-md transition-colors text-xs font-bold disabled:opacity-50 disabled:cursor-not-allowed border border-zinc-200 dark:border-transparent"
                           title={activeTimer ? 'Você tem outra tarefa rodando no timer.' : 'Iniciar rastreamento contábil'}
                         >
                           <Play className="w-3 h-3 fill-current" /> PLAY
                         </button>
                       )}
                       
                       <div className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 px-2 flex items-center gap-1">
                          {isTimerLoading ? (
                             <Loader2 className="w-3 h-3 animate-spin text-zinc-600" />
                          ) : (
                             <>
                               {totalTrackedSecs > 0 ? (totalTrackedSecs / 3600).toFixed(2) : '0'} 
                               <span className="text-xs font-normal text-zinc-500 lowercase">horas</span>
                             </>
                          )}
                       </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 text-sm text-zinc-500 w-32">
                      <Clock className="w-4 h-4 opacity-50" /> Est. P/ Cliente
                    </div>
                    <div className="flex items-center gap-1 w-24">
                       <input 
                         type="number" 
                         min="0"
                         step="0.5"
                         value={task.estimated_hours || ''}
                         onChange={(e) => handlePropertyChange('estimated_hours', parseFloat(e.target.value) || 0)}
                         className="w-12 text-sm text-zinc-700 dark:text-zinc-300 px-1 py-1 hover:bg-zinc-100 dark:hover:bg-zinc-800 focus:bg-white dark:focus:bg-zinc-800 rounded transition-colors bg-transparent border-none outline-none focus:ring-1 ring-revhackers"
                         placeholder="0"
                         style={{ MozAppearance: 'textfield' }}
                       />
                       <span className="text-xs text-zinc-500">hr</span>
                    </div>
                  </div>
                </div>

                {/* Rich Text Editor */}
                <div className="mb-4 flex items-center gap-2 text-zinc-700 dark:text-zinc-400 border-b border-zinc-200 dark:border-zinc-800 pb-2">
                  <AlignLeft className="w-5 h-5" />
                  <h3 className="font-semibold text-lg text-zinc-900 dark:text-zinc-100">Detalhes & Documentação</h3>
                </div>
                
                <div className="pb-6">
                  <OrqflowEditor
                    projectId={task.project_id}
                    initialContent={task.content}
                    onChange={handleUpdateContent}
                  />
                </div>

                {/* Dependencies */}
                <TaskDependencies
                  taskId={task.id}
                  projectId={task.project_id}
                  allTasks={allTasks}
                />

                {/* Attachments */}
                <TaskAttachments taskId={task.id} />

                {/* Chat & Comments */}
                <div className="pb-24">
                  <TaskComments taskId={task.id} workspaceUsers={workspaceUsers} />
                </div>

              </div>
            </div>
          </>
        )}
      </div>
      
      {/* Bulletproof Delete Task Modal */}
      <AlertDialog open={isDeletingTask} onOpenChange={setIsDeletingTask}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirma a exclusão desta Tarefa?</AlertDialogTitle>
            <AlertDialogDescription>
              Essa ação é irreversível. O banco de dados descartará todos os documentos, metas e informações de entrega atrelados a ela.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => {
                if (taskId) { // Ensure taskId is not null before deleting
                  deleteTask(taskId);
                  onClose();
                }
              }} 
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Destruir Tarefa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
