import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { getProjectSprints, getSprintTasks, updateTaskStatus, createTask, updateTask, deleteTask } from '@/api/sprintSystem';
import { ProjectSprint, ProjectTask, TaskStatus, TaskPriority } from '@/types/sprint-system';
import { TaskCard } from '@/components/sprint/TaskCard';
import {
    DndContext,
    DragEndEvent,
    DragOverEvent,
    DragOverlay,
    DragStartEvent,
    PointerSensor,
    useSensor,
    useSensors,
    closestCorners,
} from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { DroppableColumn } from '@/components/sprint/DroppableColumn';
import { Loader2, Plus, Zap, Filter, Calendar as CalendarIcon, CheckCircle2, MoreHorizontal, Trash2, X, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from '@/components/ui/scroll-area';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
    SheetFooter,
    SheetClose
} from "@/components/ui/sheet"
import { TaskDetailsSheet } from './TaskDetailsSheet';


const COLUMNS: { id: TaskStatus; label: string; color: string; bgColor: string }[] = [
    { id: 'backlog', label: 'BACKLOG', color: 'text-zinc-800', bgColor: 'bg-transparent' },
    { id: 'todo', label: 'EM ABERTO', color: 'text-zinc-800', bgColor: 'bg-transparent' },
    { id: 'in_progress', label: 'TRABALHANDO', color: 'text-zinc-800', bgColor: 'bg-transparent' },
    { id: 'review', label: 'REVIEW', color: 'text-zinc-800', bgColor: 'bg-transparent' },
    { id: 'blocked', label: 'BLOQUEADO', color: 'text-zinc-800', bgColor: 'bg-transparent' },
    { id: 'done', label: 'CONCLUÍDO', color: 'text-zinc-800', bgColor: 'bg-transparent' },
];

const SprintBoard = ({ embedded = false, projectName, projectId: propProjectId }: { embedded?: boolean; projectName?: string; projectId?: string }) => {
    const { id: paramId } = useParams(); // In unified view, projectId is in URL
    const projectId = propProjectId || paramId;
    const { toast } = useToast();

    const [sprints, setSprints] = useState<ProjectSprint[]>([]);
    const [currentSprint, setCurrentSprint] = useState<ProjectSprint | null>(null);
    const [tasks, setTasks] = useState<ProjectTask[]>([]);
    const [loading, setLoading] = useState(true);

    // CRUD State
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [newTaskTitle, setNewTaskTitle] = useState('');
    const [newTaskPriority, setNewTaskPriority] = useState<TaskPriority>('medium');

    const [isEditOpen, setIsEditOpen] = useState(false);
    const [selectedTask, setSelectedTask] = useState<ProjectTask | null>(null);
    const [editTitle, setEditTitle] = useState('');
    const [editDescription, setEditDescription] = useState('');

    // Drag and Drop
    const [activeTaskId, setActiveTaskId] = useState<string | null>(null);
    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: { distance: 8 },
        })
    );

    useEffect(() => {
        if (projectId) loadSprints();
    }, [projectId]);

    useEffect(() => {
        if (currentSprint) loadTasks(currentSprint.id);
    }, [currentSprint]);

    const loadSprints = async () => {
        try {
            setLoading(true);
            const data = await getProjectSprints(projectId!);
            setSprints(data);

            // Auto-select active or first sprint
            const active = data.find(s => s.status === 'active');
            if (active) setCurrentSprint(active);
            else if (data.length > 0) setCurrentSprint(data[0]);

        } catch (error) {
            console.error("Failed to load sprints", error);
            toast({ title: "Erro ao carregar sprints", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    const loadTasks = async (sprintId: string) => {
        try {
            const data = await getSprintTasks(sprintId);
            setTasks(data);
        } catch (error) {
            console.error("Failed to load tasks", error);
        }
    };



    const handleConfigSprints = async () => {
        try {
            setLoading(true);
            const currentMonth = new Date().toLocaleString('pt-BR', { month: 'long' });
            const capitalizedMonth = currentMonth.charAt(0).toUpperCase() + currentMonth.slice(1);

            // "O titulo da sprint dev ser sempre o nome do projeto e o nome do mes"
            const sprintTitle = projectName ? `${projectName} - ${capitalizedMonth}` : `Sprint 1: ${capitalizedMonth}`;

            // Create Sprint Manually to ensure Title is correct without redeploying Edge Function
            const { data: sprint, error: sprintError } = await supabase
                .from('project_sprints')
                .insert({
                    project_id: projectId,
                    title: sprintTitle,
                    type: 'planning',
                    status: 'active',
                    goals: ['Realizar Diagnóstico Profundo', 'Definir OKRs', 'Aprovar Plano de Ação'],
                    start_date: new Date().toISOString(),
                    end_date: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).toISOString()
                })
                .select()
                .single();

            if (sprintError) throw sprintError;

            // Define Initial Tasks (mirrored from backend logic)
            const initialTasks = [
                { title: 'Reunião de Kickoff (Gravada)', status: 'done', priority: 'high', description: 'Reunião inicial realizada.' },
                { title: 'Preencher Diagnóstico Técnico', status: 'todo', priority: 'high', description: 'Coletar acessos e stack tecnológica.' },
                { title: 'Análise de Concorrentes (IA)', status: 'todo', priority: 'medium', description: 'Rodar agente de análise de mercado.' },
                { title: 'Definição de Personas (ICP)', status: 'todo', priority: 'high', description: 'Mapear dores e gatilhos de compra.' },
                { title: 'Aprovação do Plano Estratégico', status: 'backlog', priority: 'urgent', description: 'Validar roadmap com o cliente (Link Mágico).' },
            ];

            // Create Tasks
            const tasksToInsert = initialTasks.map((task, index) => ({
                sprint_id: sprint.id,
                project_id: projectId,
                title: task.title,
                description: task.description,
                status: task.status as TaskStatus,
                priority: task.priority as TaskPriority,
                position: index,
                visible_to_client: true
            }));

            const { error: tasksError } = await supabase
                .from('project_tasks')
                .insert(tasksToInsert);

            if (tasksError) throw tasksError;

            toast({ title: "Sprint Iniciada!", description: sprintTitle });
            loadSprints();
        } catch (error) {
            console.error("Failed to start sprint:", error);
            toast({ title: "Erro ao criar sprint", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    // --- CRUD HANDLERS ---

    const handleCreateTask = async () => {
        if (!newTaskTitle.trim() || !currentSprint || !projectId) return;

        try {
            const newTaskPayload: Partial<ProjectTask> = {
                title: newTaskTitle,
                priority: newTaskPriority,
                status: 'backlog',
                sprint_id: currentSprint.id,
                project_id: projectId,
                position: tasks.length * 100 // primitive positioning
            };

            const created = await createTask(newTaskPayload);
            setTasks(prev => [...prev, created]); // Optimistic-ish add
            toast({ title: "Tarefa criada!" });

            // Reset & Close
            setNewTaskTitle('');
            setIsCreateOpen(false);
        } catch (error) {
            toast({ title: "Erro ao criar tarefa", variant: "destructive" });
        }
    };

    const handleUpdateTask = async () => {
        if (!selectedTask) return;

        try {
            // Only update fields that changed (simplified here)
            const updates = {
                title: editTitle,
                description: editDescription
            };

            await updateTask(selectedTask.id, updates);

            // Update local state
            setTasks(prev => prev.map(t => t.id === selectedTask.id ? { ...t, ...updates } : t));
            toast({ title: "Tarefa atualizada" });
            setIsEditOpen(false);
        } catch (error) {
            toast({ title: "Erro ao atualizar", variant: "destructive" });
        }
    };

    const handleDeleteTask = async () => {
        if (!selectedTask || !confirm("Tem certeza que deseja excluir esta tarefa?")) return;

        try {
            await deleteTask(selectedTask.id);
            setTasks(prev => prev.filter(t => t.id !== selectedTask.id));
            toast({ title: "Tarefa excluída" });
            setIsEditOpen(false);
        } catch (error) {
            toast({ title: "Erro ao excluir", variant: "destructive" });
        }
    }

    const handleStatusChange = async (taskId: string, newStatus: TaskStatus) => {
        // Optimistic update
        const task = tasks.find(t => t.id === taskId);
        if (!task) return;

        const previousStatus = task.status;

        setTasks(prev => prev.map(t =>
            t.id === taskId ? { ...t, status: newStatus } : t
        ));

        try {
            await updateTaskStatus(taskId, newStatus);
            toast({ title: "Status atualizado" });
        } catch (error) {
            // Revert on error
            setTasks(prev => prev.map(t =>
                t.id === taskId ? { ...t, status: previousStatus } : t
            ));
            toast({ title: "Falha ao atualizar", variant: "destructive" });
        }
    };

    // Drag and Drop Handlers
    const handleDragStart = (event: DragStartEvent) => {
        setActiveTaskId(event.active.id as string);
    };

    const handleDragEnd = (event: DragEndEvent) => {
        setActiveTaskId(null);
        const { active, over } = event;

        if (!over) return;

        const taskId = active.id as string;
        const overId = over.id as string;

        // Check if dropped on a column
        const targetColumn = COLUMNS.find(col => col.id === overId);
        if (targetColumn) {
            const task = tasks.find(t => t.id === taskId);
            if (task && task.status !== targetColumn.id) {
                handleStatusChange(taskId, targetColumn.id);
            }
        }
    };

    const openEditTask = (task: ProjectTask) => {
        setSelectedTask(task);
        setEditTitle(task.title);
        setEditDescription(task.description || '');
        setIsEditOpen(true);
    };

    if (loading && !currentSprint) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="animate-spin text-zinc-300" />
            </div>
        );
    }

    if (sprints.length === 0) {
        return (

            <div className="flex flex-col items-center justify-center h-[50vh] text-center p-8 border border-zinc-100 rounded-[2.5rem] bg-white shadow-sm">
                <div className="w-16 h-16 bg-zinc-950 rounded-2xl flex items-center justify-center shadow-lg mb-6">
                    <Zap className="w-8 h-8 text-revgreen" />
                </div>
                <h3 className="text-2xl font-black uppercase tracking-tighter text-zinc-900">Sprint Não Inicializada</h3>
                <p className="text-sm text-zinc-400 max-w-sm mt-3 mb-8 font-medium">
                    O centro de operações está aguardando o comando de inicialização. <br />
                    Comece o projeto agora.
                </p>
                <Button
                    onClick={handleConfigSprints}
                    disabled={loading}
                    className="bg-black text-white px-10 py-6 rounded-full font-black uppercase tracking-[0.2em] text-[10px] hover:bg-zinc-800 transition-all shadow-xl hover:scale-105"
                >
                    {loading ? <Loader2 className="animate-spin mr-3" /> : <Zap size={14} className="mr-3 text-revgreen" />}
                    Configurar Centro de Comando
                </Button>
            </div>
        );
    }

    return (
        <div className={embedded ? "h-full flex flex-col" : "p-8 h-screen flex flex-col"}>
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <div className="flex items-center gap-4">
                    <Select
                        value={currentSprint?.id}
                        onValueChange={(val) => setCurrentSprint(sprints.find(s => s.id === val) || null)}
                    >
                        <SelectTrigger className="w-[280px] h-10 bg-white border-zinc-200 font-medium">
                            <SelectValue placeholder="Selecione a Sprint" />
                        </SelectTrigger>
                        <SelectContent>
                            {sprints.map(s => (
                                <SelectItem key={s.id} value={s.id}>
                                    {s.title} {s.status === 'active' && '(Ativa)'}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    {currentSprint && currentSprint.status === 'active' && (
                        <Badge variant="secondary" className="bg-zinc-900 text-white rounded-full px-4 border-0 text-[9px] font-black uppercase tracking-widest">
                            Em Andamento
                        </Badge>
                    )}
                </div>

                <div className="flex items-center gap-3">
                    <Button variant="outline" size="sm" className="h-9 border-zinc-100 bg-white text-zinc-400 font-black uppercase tracking-[0.2em] text-[9px] rounded-lg px-4 hover:border-black hover:text-black transition-all">
                        <Filter size={12} className="mr-2" />
                        Protocolos de Filtro
                    </Button>

                    <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                        <DialogTrigger asChild>
                            <Button size="sm" className="h-9 bg-black text-white rounded-full font-bold uppercase tracking-widest text-[10px] hover:bg-zinc-800">
                                <Plus size={14} className="mr-2" />
                                Nova Operação
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="bg-white border-zinc-100 rounded-[2rem] p-10">
                            <DialogHeader className="space-y-4">
                                <DialogTitle className="text-3xl font-black uppercase tracking-tighter">Nova Operação</DialogTitle>
                                <DialogDescription className="text-zinc-500 font-bold uppercase tracking-widest text-[10px]">
                                    Inicializar uma nova unidade de execução no backlog da sprint.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-6 py-8">
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Protocolo de Título</Label>
                                    <Input
                                        placeholder="Ex: Otimizar LTV Engine..."
                                        value={newTaskTitle}
                                        onChange={(e) => setNewTaskTitle(e.target.value)}
                                        className="text-3xl font-black border-none px-0 h-auto shadow-none focus-visible:ring-0 placeholder:text-zinc-100 tracking-tight"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Nível de Prioridade</Label>
                                    <Select
                                        value={newTaskPriority}
                                        onValueChange={(val: TaskPriority) => setNewTaskPriority(val)}
                                    >
                                        <SelectTrigger className="h-12 border-zinc-100 bg-zinc-50 focus:border-black transition-all rounded-xl">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="low">Baixa</SelectItem>
                                            <SelectItem value="medium">Média</SelectItem>
                                            <SelectItem value="high">Alta</SelectItem>
                                            <SelectItem value="urgent">Urgente</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <DialogFooter className="gap-3">
                                <Button variant="ghost" onClick={() => setIsCreateOpen(false)} className="px-8 text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-black">
                                    Abortar
                                </Button>
                                <Button onClick={handleCreateTask} className="bg-black text-white px-10 rounded-full font-black uppercase tracking-widest text-[10px] hover:bg-zinc-800">
                                    Inicializar Tarefa
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            {/* Sprint Goals / Info */}
            {currentSprint && currentSprint.goals && currentSprint.goals.length > 0 && (
                <div className="mb-10 p-6 bg-white border border-zinc-100 rounded-2xl flex flex-wrap gap-4 items-center">
                    <div className="flex items-center gap-2 text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] shrink-0 border-r border-zinc-100 pr-6 mr-2">
                        <Target size={14} /> Metas Globais
                    </div>
                    {currentSprint.goals.map((goal, idx) => (
                        <div key={idx} className="flex items-center gap-3 text-xs font-black text-black uppercase tracking-tight bg-zinc-50 px-4 py-2 rounded-lg border border-zinc-100 transition-all hover:border-zinc-300">
                            <CheckCircle2 size={14} className="text-black" />
                            {goal}
                        </div>
                    ))}
                </div>
            )}

            {/* Board Area */}
            <DndContext
                sensors={sensors}
                collisionDetection={closestCorners}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
            >
                <div className="flex-1 -mx-8 overflow-x-auto overflow-y-hidden bg-zinc-50 border-t border-zinc-200">
                    <div className="flex h-full min-w-max p-8 gap-0 items-start">
                        {COLUMNS.map(col => {
                            const colTasks = tasks.filter(t => t.status === col.id);
                            return (
                                <DroppableColumn
                                    key={col.id}
                                    id={col.id}
                                    label={col.label}
                                    tasks={colTasks}
                                    color={col.color}
                                    bgColor={col.bgColor}
                                    isActiveDrag={!!activeTaskId}
                                    onStatusChange={handleStatusChange}
                                    onTaskClick={openEditTask}
                                    onAddClick={() => setIsCreateOpen(true)}
                                />
                            );
                        })}
                    </div>
                </div>

                {/* Drag Overlay */}
                <DragOverlay>
                    {activeTaskId && (
                        <div className="opacity-80 rotate-3 scale-105">
                            <TaskCard
                                task={tasks.find(t => t.id === activeTaskId)!}
                                onStatusChange={() => { }}
                                onClick={() => { }}
                            />
                        </div>
                    )}
                </DragOverlay>
            </DndContext>

            {/* Edit Task Modal (Dialog) */}
            <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                {isEditOpen && selectedTask && (
                    <TaskDetailsSheet
                        task={selectedTask}
                        onUpdate={async (id, updates) => {
                            // Optimistic update local state
                            setTasks(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
                            setSelectedTask(prev => prev ? { ...prev, ...updates } : null);
                            // Server update
                            await updateTask(id, updates);
                        }}
                        onDelete={handleDeleteTask}
                        onClose={() => setIsEditOpen(false)}
                    />
                )}
            </Dialog>
        </div>
    );
};

export default SprintBoard;
