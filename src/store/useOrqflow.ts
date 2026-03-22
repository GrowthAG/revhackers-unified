import { create } from 'zustand';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export type TaskStatus = 'backlog' | 'todo' | 'doing' | 'review' | 'done' | 'archived';

export interface OrqTask {
  id: string;
  project_id: string;
  sprint_id: string | null;
  title: string;
  content: any; // jsonb
  status: TaskStatus;
  priority: string;
  assignee_id: string | null;
  start_date?: string | null;
  due_date: string | null;
  position_order: number;
  estimated_hours?: number; // Epic 6
}

export type TimeLog = {
  id: string;
  task_id: string;
  user_id: string;
  start_time: string;
  end_time: string | null;
  duration_seconds: number;
};

interface OrqflowState {
  tasks: Record<string, OrqTask>; // O(1) Lookup. ID -> Task
  kanbanColumns: Record<TaskStatus, string[]>; // Status -> Array of Task IDs
  sprints: any[]; // Global Sprints for the active project
  workspaceUsers: any[]; // List of available members
  isLoading: boolean;
  activeTimer: { logId: string, taskId: string, startTime: string } | null;
  
  // Actions
  // Actions
  fetchSprints: (projectId: string) => Promise<void>;
  fetchWorkspaceUsers: () => Promise<void>;
  fetchTasks: (projectId: string, sprintId?: string | null) => Promise<void>;
  moveTask: (taskId: string, newStatus: TaskStatus, newIndex: number) => Promise<void>;
  createTask: (projectId: string, sprintId: string | null, title: string, status: TaskStatus) => Promise<void>;
  updateTask: (taskId: string, updates: Partial<OrqTask>) => Promise<void>;
  deleteTask: (taskId: string) => Promise<void>;
  
  startTimer: (taskId: string) => Promise<void>;
  stopTimer: () => Promise<void>;
  
  // Realtime Engine
  realtimeChannel: any | null;
  subscribeToTasks: (projectId: string) => void;
  unsubscribeFromTasks: () => void;
}

export const useOrqflowStore = create<OrqflowState>((set, get) => ({
  tasks: {},
  kanbanColumns: {
    backlog: [],
    todo: [],
    doing: [],
    review: [],
    done: [],
    archived: []
  },
  sprints: [],
  workspaceUsers: [],
  isLoading: false,
  activeTimer: null,
  realtimeChannel: null,

  fetchSprints: async (projectId) => {
    try {
      const { data, error } = await supabase
        .from('orqflow_sprints')
        .select('*')
        .eq('project_id', projectId)
        .order('start_date', { ascending: false });
        
      if (error) throw error;
      set({ sprints: data || [] });
    } catch (e: any) {
      toast({ title: 'Erro nos Ciclos', description: 'Não foi possível ler as sprints', variant: 'destructive' });
    }
  },

  fetchWorkspaceUsers: async () => {
    try {
      // Typically you fetch profiles or workspace members here.
      const { data, error } = await supabase.from('profiles').select('*');
      if (error) throw error;
      set({ workspaceUsers: data || [] });
    } catch (e: any) {
      console.error("Failed to fetch workspace users", e);
    }
  },

  fetchTasks: async (projectId, sprintId) => {
    set({ isLoading: true });
    try {
      let query = supabase
        .from('orqflow_tasks')
        .select('*')
        .eq('project_id', projectId)
        .order('position_order', { ascending: true });

      if (sprintId) {
        query = query.eq('sprint_id', sprintId);
      }

      const { data, error } = await query;
      if (error) throw error;

      // Normalization Engine
      const tasksMap: Record<string, OrqTask> = {};
      const cols: Record<TaskStatus, string[]> = { backlog: [], todo: [], doing: [], review: [], done: [], archived: [] };

      (data as OrqTask[]).forEach((task) => {
        tasksMap[task.id] = task;
        if (cols[task.status]) cols[task.status].push(task.id);
      });

      set({ tasks: tasksMap, kanbanColumns: cols });
    } catch (e: any) {
      toast({ title: 'Database Sync Failed', description: e.message, variant: 'destructive' });
    } finally {
      set({ isLoading: false });
    }
  },

  moveTask: async (taskId, newStatus, newIndex) => {
    const { tasks, kanbanColumns } = get();
    const task = tasks[taskId];
    if (!task) return;

    const oldStatus = task.status;
    const isSameColumn = oldStatus === newStatus;

    // Captura snapshot do estado anterior para rollback preciso
    const previousTasks = tasks;
    const previousColumns = kanbanColumns;

    // 1. Optimistic UI Update
    const newTasksMap = { ...tasks, [taskId]: { ...task, status: newStatus } };

    const sourceCol = [...(kanbanColumns[oldStatus] || [])];
    const targetCol = [...(kanbanColumns[newStatus] || [])];

    if (isSameColumn) {
      const oldIndex = sourceCol.indexOf(taskId);
      sourceCol.splice(oldIndex, 1);
      sourceCol.splice(newIndex, 0, taskId);
      set({ tasks: newTasksMap, kanbanColumns: { ...kanbanColumns, [oldStatus]: sourceCol } });
    } else {
      const oldIndex = sourceCol.indexOf(taskId);
      sourceCol.splice(oldIndex, 1);
      targetCol.splice(newIndex, 0, taskId);
      set({ tasks: newTasksMap, kanbanColumns: { ...kanbanColumns, [oldStatus]: sourceCol, [newStatus]: targetCol } });
    }

    // 2. Persist to DB
    try {
      const { error } = await supabase
        .from('orqflow_tasks')
        .update({ status: newStatus, position_order: newIndex })
        .eq('id', taskId);

      if (error) throw error;
    } catch (e: any) {
      // Rollback imediato para o snapshot anterior - sem piscar
      set({ tasks: previousTasks, kanbanColumns: previousColumns });
      toast({ title: 'Erro ao mover tarefa', description: 'Nao foi possivel salvar. O estado foi revertido.', variant: 'destructive' });
    }
  },

  createTask: async (projectId, sprintId, title, status) => {
    try {
      // 1. Achar o max position order para a nova task nascer no fim
      const currentCols = get().kanbanColumns[status];
      const position = currentCols.length * 1000;

      const { data, error } = await supabase
        .from('orqflow_tasks')
        .insert({
          project_id: projectId,
          sprint_id: sprintId,
          title,
          status,
          position_order: position,
          priority: 'medium',
          content: {}
        })
        .select()
        .single();
        
      if (error) throw error;
      
      const newTask = data as OrqTask;
      const { tasks, kanbanColumns } = get();
      
      set({
        tasks: { ...tasks, [newTask.id]: newTask },
        kanbanColumns: {
          ...kanbanColumns,
          [status]: [...kanbanColumns[status], newTask.id]
        }
      });
      
      toast({ title: "Tarefa criada", description: "Adicionada ao projeto com sucesso." });
      
    } catch (e: any) {
      toast({ title: 'Database Insert Failed', description: e.message, variant: 'destructive' });
    }
  },

  updateTask: async (taskId, updates) => {
    const { tasks } = get();
    const task = tasks[taskId];
    if (!task) return;

    // 1. Optimistic Update
    set({
      tasks: { ...tasks, [taskId]: { ...task, ...updates } }
    });

    // 2. Persist
    try {
      const { error } = await supabase
        .from('orqflow_tasks')
        .update(updates)
        .eq('id', taskId);

      if (error) throw error;
    } catch (e: any) {
      toast({ title: 'Update Failed', description: 'Não foi possível salvar os dados da tarefa.', variant: 'destructive' });
      // Revert optimistic update
      set({
        tasks: { ...tasks, [taskId]: task }
      });
    }
  },

  deleteTask: async (taskId) => {
    try {
      const { error } = await supabase.from('orqflow_tasks').delete().eq('id', taskId);
      if (error) throw error;
      
      const { tasks } = get();
      const newTasks = { ...tasks };
      delete newTasks[taskId];
      set({ tasks: newTasks });
      
      toast({ title: 'Tarefa Deletada', description: 'Registro apagado da Sprint atual.' });
    } catch (e: any) {
      toast({ title: 'Erro Crítico', description: 'Não foi possível apagar a tarefa.', variant: 'destructive' });
    }
  },

  startTimer: async (taskId) => {
    const { activeTimer } = get();
    if (activeTimer) {
      toast({ title: 'Atenção', description: 'Você já tem um tracker rodando.', variant: 'default' });
      return;
    }

    try {
      // Mock user_id for now if auth is not ready
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({ title: 'Erro de Sessão', description: 'Você precisa estar logado para rastrear tempo.', variant: 'destructive' });
        return;
      }

      const { data, error } = await supabase
        .from('orqflow_time_logs')
        .insert({
          task_id: taskId,
          user_id: user.id,
          start_time: new Date().toISOString()
        })
        .select()
        .single();
        
      if (error) throw error;

      set({ 
        activeTimer: { 
          logId: data.id, 
          taskId: data.task_id, 
          startTime: data.start_time 
        } 
      });
      toast({ title: 'Timer Iniciado', description: 'Seus honorários estão sendo auditados.' });
      
    } catch (e: any) {
       toast({ title: 'Erro', description: e.message, variant: 'destructive' });
    }
  },

  stopTimer: async () => {
    const { activeTimer } = get();
    if (!activeTimer) return;

    try {
      const endTime = new Date();
      const startTime = new Date(activeTimer.startTime);
      const durationSeconds = Math.floor((endTime.getTime() - startTime.getTime()) / 1000);

      const { error } = await supabase
        .from('orqflow_time_logs')
        .update({
          end_time: endTime.toISOString(),
          duration_seconds: durationSeconds
        })
        .eq('id', activeTimer.logId);

      if (error) throw error;

      set({ activeTimer: null });
      toast({ title: 'Timer Parado', description: `${Math.floor(durationSeconds/60)} minutos acumulados e salvos no banco.` });

    } catch (e: any) {
       toast({ title: 'Erro ao Parar', description: e.message, variant: 'destructive' });
    }
  },

  subscribeToTasks: (projectId) => {
    const { realtimeChannel, unsubscribeFromTasks } = get();
    
    // Prevent duplicate subscriptions
    if (realtimeChannel) unsubscribeFromTasks();

    const channel = supabase.channel(`public:orqflow_tasks:project_id=${projectId}`)
      .on(
        'postgres_changes',
        {
          event: '*', // Listen to INSERT, UPDATE, DELETE
          schema: 'public',
          table: 'orqflow_tasks',
          filter: `project_id=eq.${projectId}`
        },
        (payload) => {
          const state = get();
          const { tasks, kanbanColumns } = state;

          if (payload.eventType === 'INSERT') {
            const newTask = payload.new as OrqTask;
            const newKanbanCols = { ...kanbanColumns };
            
            // Only push if it's not already there (protection)
            if (newKanbanCols[newTask.status] && !newKanbanCols[newTask.status].includes(newTask.id)) {
                newKanbanCols[newTask.status] = [...newKanbanCols[newTask.status], newTask.id];
            }
            
            set({ 
              tasks: { ...tasks, [newTask.id]: newTask },
              kanbanColumns: newKanbanCols
            });
            
          } else if (payload.eventType === 'UPDATE') {
            const updatedTask = payload.new as OrqTask;
            const oldTask = tasks[updatedTask.id];
            const newKanbanCols = { ...kanbanColumns };
            
            // Se mudou de status, remova da antiga e adicione na nova
            if (oldTask && oldTask.status !== updatedTask.status) {
                if (newKanbanCols[oldTask.status]) {
                    newKanbanCols[oldTask.status] = newKanbanCols[oldTask.status].filter(id => id !== updatedTask.id);
                }
                if (newKanbanCols[updatedTask.status] && !newKanbanCols[updatedTask.status].includes(updatedTask.id)) {
                    // Coloca no topo ou no final? O realtime costuma colocar no array.
                    newKanbanCols[updatedTask.status] = [...newKanbanCols[updatedTask.status], updatedTask.id];
                }
            }

            set({ 
              tasks: { ...tasks, [updatedTask.id]: updatedTask },
              kanbanColumns: newKanbanCols
            });
            
          } else if (payload.eventType === 'DELETE') {
            const deletedId = payload.old.id;
            const newTasks = { ...tasks };
            const oldTask = newTasks[deletedId];
            const newKanbanCols = { ...kanbanColumns };

            if (oldTask && newKanbanCols[oldTask.status]) {
                 newKanbanCols[oldTask.status] = newKanbanCols[oldTask.status].filter(id => id !== deletedId);
            }

            delete newTasks[deletedId];
            
            set({ 
                tasks: newTasks,
                kanbanColumns: newKanbanCols
            });
          }
        }
      )
      .subscribe();

    set({ realtimeChannel: channel });
  },

  unsubscribeFromTasks: () => {
    const { realtimeChannel } = get();
    if (realtimeChannel) {
      supabase.removeChannel(realtimeChannel);
      set({ realtimeChannel: null });
    }
  }

}));
