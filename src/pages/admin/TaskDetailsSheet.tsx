import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DialogContent } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
    Calendar, CheckCircle2, Clock, FileText, Link as LinkIcon,
    MessageSquare, Paperclip, Plus, Send, Trash2, User, X,
    Flag, Zap, Tag, MoreVertical, Layout, Search, Command,
    Maximize2, Minimize2, Share2, Smile, AtSign, ArrowUp, Filter
} from 'lucide-react';
import { ProjectTask, TaskStatus, TaskPriority } from '@/types/sprint-system';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { useRef } from 'react';
import {
    CommandDialog,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
    CommandSeparator,
    CommandShortcut,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";


const TACTICAL_EMOJIS = [
    '⚡', '🚀', '🎯', '📈', '🔥', '💎', '💡', '🛠️',
    '✅', '⏳', '⚠️', '🚨', '🛑', '🔔', '📅', '📎',
    '👍', '👏', '🤝', '🎉', '🌟', '📍', '💬', '📧'
];

interface TaskDetailsSheetProps {
    task: ProjectTask;
    onUpdate: (taskId: string, updates: Partial<ProjectTask>) => void;
    onDelete: (taskId: string) => void;
    onClose: () => void;
}

export const TaskDetailsSheet = ({ task, onUpdate, onDelete, onClose }: TaskDetailsSheetProps) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [title, setTitle] = useState(task.title);
    const [description, setDescription] = useState(task.description || '');
    const [status, setStatus] = useState<TaskStatus>(task.status);
    const [priority, setPriority] = useState<TaskPriority>(task.priority);
    const [assigneeId, setAssigneeId] = useState<string | null>(task.assignee_id || null);
    const [comments, setComments] = useState<any[]>([]);
    const [newComment, setNewComment] = useState('');
    const [isLoadingComments, setIsLoadingComments] = useState(false);
    const [slashOpen, setSlashOpen] = useState(false);
    const [teamMembers, setTeamMembers] = useState<any[]>([]);
    const [projectName, setProjectName] = useState<string>('Growth Agency Sprint');
    const [projectData, setProjectData] = useState<any>(null);
    const [sprintData, setSprintData] = useState<any>(null);

    useEffect(() => {
        setTitle(task.title);
        setDescription(task.description || '');
        setStatus(task.status);
        setPriority(task.priority);
        setAssigneeId(task.assignee_id || null);
        loadComments();
        fetchTeamMembers();
        fetchProjectContext();
    }, [task.id]);

    const fetchProjectContext = async () => {
        const { data: project } = await supabase
            .from('rei_projects')
            .select('*')
            .eq('id', task.project_id)
            .single();

        const { data: sprint } = await supabase
            .from('project_sprints')
            .select('*')
            .eq('id', task.sprint_id)
            .single();

        if (project) {
            setProjectData(project);
            setProjectName(project.client_company || project.client_name);
        }
        if (sprint) setSprintData(sprint);
    };

    const fetchTeamMembers = async () => {
        const { data } = await supabase
            .from('profiles')
            .select('id, full_name, avatar_url, role')
            .eq('is_active', true);
        if (data) setTeamMembers(data);
    };

    useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (e.key === "/" && (e.target as HTMLElement).tagName !== 'INPUT' && (e.target as HTMLElement).tagName !== 'TEXTAREA') {
                e.preventDefault();
                setSlashOpen(true);
            }
        };
        document.addEventListener("keydown", down);
        return () => document.removeEventListener("keydown", down);
    }, []);

    const loadComments = async () => {
        setIsLoadingComments(true);
        const { data } = await supabase
            .from('project_task_comments')
            .select(`
                id, content, created_at,
                user:user_id(id, first_name, last_name, email, avatar_url)
            `)
            .eq('task_id', task.id)
            .order('created_at', { ascending: true });

        setComments(data || []);
        setIsLoadingComments(false);
    };

    const handleSaveTitle = () => {
        if (title !== task.title) onUpdate(task.id, { title });
    };

    const handleSaveDescription = () => {
        if (description !== task.description) onUpdate(task.id, { description });
    };

    const handleSendComment = async () => {
        if (!newComment.trim()) return;
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // Simple detection for / commands in chat
        if (newComment.startsWith('/')) {
            setSlashOpen(true);
            setNewComment('');
            return;
        }

        const { error } = await supabase
            .from('project_task_comments')
            .insert({
                task_id: task.id,
                user_id: user.id,
                content: newComment,
                type: 'chat'
            });

        if (error) {
            toast.error('Erro ao enviar comentário');
        } else {
            setNewComment('');
            loadComments();
        }
    };

    const handleBrainAction = () => {
        toast.info("O Brain está analisando o contexto desta tarefa para gerar automações...", {
            icon: <Zap size={14} className="text-revgreen" />,
        });
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        toast.success(`Protocolo de arquivo '${file.name}' em processo de upload.`);
    };

    const insertEmoji = (emoji: string) => {
        setNewComment(prev => prev + emoji + " ");
    };

    return (
        <DialogContent className="max-w-[98vw] w-full lg:w-[1550px] h-[98vh] p-0 flex flex-col shadow-2xl overflow-hidden border-zinc-200 bg-white rounded-2xl">
            {/* TOP NAVIGATION BAR (Contextual) */}
            <div className="h-10 px-4 border-b border-zinc-100 flex items-center justify-between bg-white shrink-0">
                <div className="flex items-center gap-2 text-[10px] font-black text-zinc-400 group select-none">
                    <Layout size={12} className="text-zinc-300" />
                    <span className="hover:text-black cursor-pointer transition-colors uppercase tracking-widest">{projectData?.client_company || 'S/ Empresa'}</span>
                    <span className="text-zinc-200">/</span>
                    <div className="flex items-center gap-1.5 hover:text-black cursor-pointer transition-colors">
                        <img src="https://storage.googleapis.com/msgsndr/oFTw9DcsKRUj6xCiq4mb/media/6808e4eea2927569eb667113.png" className="h-3 w-auto grayscale brightness-0 opacity-40 mr-1" alt="RevHackers" />
                        <span className="uppercase tracking-widest text-[#222] font-black">{projectData?.type || 'PROJETO'}</span>
                    </div>
                    <span className="text-zinc-200">/</span>
                    <div className="flex items-center gap-1.5 hover:text-black cursor-pointer transition-colors">
                        <Zap size={10} className="text-revgreen fill-revgreen" />
                        <span className="truncate max-w-[200px] uppercase font-black tracking-widest">{sprintData?.title || 'SPRINT'}</span>
                    </div>
                </div>
                <div className="flex items-center gap-4 text-[10px] font-black text-zinc-400">
                    <div className="flex items-center gap-1 hover:text-black cursor-pointer">
                        <Zap size={12} className="text-revgreen" />
                        <span>Pergunte à IA</span>
                    </div>
                    <div className="flex items-center gap-1 hover:text-black cursor-pointer">
                        <Share2 size={12} />
                        <span>Compartilhar</span>
                    </div>
                    <X size={14} className="hover:text-black cursor-pointer" onClick={onClose} />
                </div>
            </div>

            <div className="flex flex-col lg:flex-row flex-1 h-full overflow-hidden">
                {/* LEFT COLUMN: TASK CONTENT */}
                <div className="flex-[3.5] flex flex-col min-h-0 bg-white lg:border-r border-zinc-50 overflow-hidden">
                    <div className="px-6 h-[50px] flex items-center gap-4 bg-white border-b border-zinc-50 select-none">
                        <Button variant="ghost" className="h-8 text-[11px] font-black text-zinc-400 gap-2 hover:bg-zinc-50 rounded-lg">
                            <div className="p-1 bg-zinc-100 rounded text-zinc-500"><CheckCircle2 size={12} /></div>
                            Tarefa <ArrowUp size={10} />
                        </Button>
                        <Separator orientation="vertical" className="h-4" />
                        <div className="flex items-center gap-1 text-[11px] font-bold text-zinc-300">
                            # {task.id.slice(0, 6)}
                        </div>
                    </div>

                    <ScrollArea className="flex-1">
                        <div className="px-8 lg:px-16 py-10 space-y-10 max-w-[1100px] mx-auto">
                            <div className="space-y-4">
                                <Input
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    onBlur={handleSaveTitle}
                                    placeholder="Nome da Tarefa"
                                    className="text-3xl font-black text-zinc-900 tracking-tight leading-tight border-none shadow-none p-0 focus-visible:ring-0 placeholder:text-zinc-100 h-auto"
                                />

                                <div className="bg-zinc-50/50 border border-zinc-100 rounded-xl p-4 flex items-center justify-between group cursor-pointer hover:border-zinc-200 transition-all">
                                    <div className="flex items-center gap-4">
                                        <div className="w-8 h-8 rounded-lg bg-white border border-zinc-100 flex items-center justify-center shadow-sm">
                                            <Zap size={16} className="text-transparent bg-gradient-to-br from-pink-500 via-purple-500 to-blue-500 bg-clip-text" style={{ fill: 'currentColor' }} />
                                        </div>
                                        <div>
                                            <p className="text-[12px] font-bold text-zinc-800">Peça ao Brain para criar um resumo, Gerar subtarefas ou encontrar tarefas semelhantes</p>
                                        </div>
                                    </div>
                                    <X size={14} className="text-zinc-300 hover:text-black" />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-y-10 gap-x-12 pt-4 border-t border-zinc-50 pt-10">
                                {/* Status Slot */}
                                <div className="space-y-2 group">
                                    <div className="flex items-center gap-2 text-[10px] font-black text-zinc-400 uppercase tracking-widest">
                                        <div className="w-1.5 h-1.5 rounded-full bg-zinc-300 group-hover:bg-zinc-800 transition-colors" />
                                        Status
                                    </div>
                                    <Select value={status} onValueChange={(v: TaskStatus) => {
                                        setStatus(v);
                                        onUpdate(task.id, { status: v });
                                    }}>
                                        <SelectTrigger className="border border-zinc-100 bg-zinc-50/50 px-3 h-8 rounded-lg shadow-none focus:ring-0 text-[10px] font-black uppercase tracking-widest text-zinc-600 hover:border-zinc-300 transition-all">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent className="rounded-xl border-zinc-100 shadow-2xl">
                                            <SelectItem value="backlog">Backlog</SelectItem>
                                            <SelectItem value="todo">Em Aberto</SelectItem>
                                            <SelectItem value="in_progress">Trabalhando</SelectItem>
                                            <SelectItem value="review">Review</SelectItem>
                                            <SelectItem value="blocked">Bloqueado</SelectItem>
                                            <SelectItem value="done">Concluído</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Assignee Slot */}
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2 text-[10px] font-black text-zinc-400 uppercase tracking-widest">
                                        <User size={12} />
                                        Responsáveis
                                    </div>
                                    <Select value={assigneeId || 'unassigned'} onValueChange={(val) => {
                                        const newId = val === 'unassigned' ? null : val;
                                        setAssigneeId(newId);
                                        onUpdate(task.id, { assignee_id: newId });
                                    }}>
                                        <SelectTrigger className="border-none bg-transparent h-auto p-0 shadow-none focus:ring-0 w-full hover:bg-zinc-50 transition-colors rounded-lg p-1 group">
                                            <div className="flex items-center gap-2">
                                                <Avatar className="w-6 h-6 border border-zinc-100 grayscale">
                                                    {assigneeId && teamMembers.find(m => m.id === assigneeId)?.avatar_url ? (
                                                        <AvatarImage src={teamMembers.find(m => m.id === assigneeId).avatar_url} />
                                                    ) : (
                                                        <AvatarFallback className="bg-zinc-950 text-white text-[8px] font-black uppercase">
                                                            {assigneeId ? teamMembers.find(m => m.id === assigneeId)?.full_name?.[0] : '?'}
                                                        </AvatarFallback>
                                                    )}
                                                </Avatar>
                                                <span className="text-[11px] font-bold text-zinc-900 uppercase truncate max-w-[120px]">
                                                    {assigneeId ? teamMembers.find(m => m.id === assigneeId)?.full_name : 'Sem Responsável'}
                                                </span>
                                            </div>
                                        </SelectTrigger>
                                        <SelectContent className="rounded-xl border-zinc-100 shadow-2xl">
                                            <SelectItem value="unassigned">Sem Responsável</SelectItem>
                                            {teamMembers.map((member) => (
                                                <SelectItem key={member.id} value={member.id}>
                                                    <div className="flex items-center gap-2">
                                                        <Avatar className="w-5 h-5 border border-zinc-50">
                                                            <AvatarImage src={member.avatar_url} />
                                                            <AvatarFallback className="text-[6px] font-black bg-zinc-950 text-white uppercase">{member.full_name?.[0]}</AvatarFallback>
                                                        </Avatar>
                                                        <span className="text-[10px] font-bold uppercase tracking-tight">{member.full_name}</span>
                                                    </div>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Date Slot */}
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2 text-[10px] font-black text-zinc-400 uppercase tracking-widest">
                                        <Calendar size={12} />
                                        Datas
                                    </div>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <div className="text-[11px] font-bold text-zinc-900 flex items-center gap-2 p-1 hover:bg-zinc-50 rounded-lg cursor-pointer transition-colors">
                                                <Calendar size={14} className="text-zinc-300" />
                                                {task.due_date ? format(new Date(task.due_date), "dd/MM/yy") : 'Vazio'}
                                            </div>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0 border-zinc-100 shadow-2xl rounded-2xl" align="start">
                                            <CalendarComponent
                                                mode="single"
                                                selected={task.due_date ? new Date(task.due_date) : undefined}
                                                onSelect={(date) => onUpdate(task.id, { due_date: date?.toISOString() })}
                                                initialFocus
                                            />
                                        </PopoverContent>
                                    </Popover>
                                </div>

                                {/* Priority Slot */}
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2 text-[10px] font-black text-zinc-400 uppercase tracking-widest">
                                        <Flag size={12} />
                                        Prioridade
                                    </div>
                                    <Select value={priority} onValueChange={(val: TaskPriority) => {
                                        setPriority(val);
                                        onUpdate(task.id, { priority: val });
                                    }}>
                                        <SelectTrigger className="border-none bg-transparent h-auto p-0 shadow-none focus:ring-0 w-full hover:bg-zinc-50 transition-colors rounded-lg p-1 group">
                                            <div className="flex items-center gap-2 text-[11px] font-bold transition-colors">
                                                <Flag size={14} className={cn(
                                                    "text-zinc-200 transition-colors",
                                                    priority === 'urgent' && "text-red-500",
                                                    priority === 'high' && "text-amber-500",
                                                    priority === 'medium' && "text-blue-500"
                                                )} />
                                                <span className="uppercase">{priority === 'urgent' ? 'Urgente' : priority === 'high' ? 'Alta' : priority === 'medium' ? 'Normal' : 'Baixa'}</span>
                                            </div>
                                        </SelectTrigger>
                                        <SelectContent className="rounded-xl border-zinc-100 shadow-2xl">
                                            <SelectItem value="urgent">Urgente</SelectItem>
                                            <SelectItem value="high">Alta</SelectItem>
                                            <SelectItem value="medium">Normal</SelectItem>
                                            <SelectItem value="low">Baixa</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Estimate Slot */}
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2 text-[10px] font-black text-zinc-400 uppercase tracking-widest">
                                        <Clock size={12} />
                                        Estimativa
                                    </div>
                                    <div className="text-[11px] font-bold text-zinc-300 p-1 hover:bg-zinc-50 rounded-lg cursor-pointer transition-colors">
                                        Vazio
                                    </div>
                                </div>

                                {/* Sprint Points Slot */}
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2 text-[10px] font-black text-zinc-400 uppercase tracking-widest">
                                        <AtSign size={12} />
                                        Pontos do Sprint
                                    </div>
                                    <div className="text-[11px] font-bold text-zinc-300 p-1 hover:bg-zinc-50 rounded-lg cursor-pointer transition-colors">
                                        Vazio
                                    </div>
                                </div>
                            </div>

                            <Separator className="bg-zinc-50" />

                            <div className="space-y-6">
                                <Textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    onBlur={handleSaveDescription}
                                    className="min-h-[150px] border-none shadow-none text-[13px] font-medium leading-relaxed p-0 resize-none focus-visible:ring-0 placeholder:text-zinc-200"
                                    placeholder="Click aqui para adicionar uma descrição técnica ou use '/' para comandos..."
                                />
                            </div>

                            <div className="space-y-10 pt-10 border-t border-zinc-50">
                                <div className="space-y-6">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2 text-[11px] font-black text-zinc-400 uppercase tracking-widest cursor-pointer hover:text-black transition-colors">
                                            <ArrowUp size={12} /> Campos personalizados
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <Search size={14} className="text-zinc-300 cursor-pointer hover:text-black transition-colors" />
                                            <Plus size={14} className="text-zinc-300 cursor-pointer hover:text-black transition-colors" />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-4 group">
                                            <div className="flex items-center gap-2 w-32 shrink-0 text-[11px] font-bold text-zinc-500">
                                                <Layout size={12} className="text-zinc-300" />
                                                Cliente
                                                <LinkIcon size={10} className="text-zinc-200 opacity-0 group-hover:opacity-100" />
                                            </div>
                                            <div className="flex-1 text-[11px] font-bold text-zinc-800 p-1 rounded hover:bg-zinc-50 cursor-pointer transition-colors">
                                                {projectData?.client_company || '---'}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4 pt-4">
                                    <div
                                        className="flex items-center gap-3 text-[11px] font-bold text-zinc-500 hover:text-black cursor-pointer transition-colors group"
                                        onClick={() => setSlashOpen(true)}
                                    >
                                        <Plus size={14} className="text-zinc-300 group-hover:text-black" />
                                        <span>Adicionar subtarefa</span>
                                    </div>
                                    <div
                                        className="flex items-center gap-3 text-[11px] font-bold text-zinc-500 hover:text-black cursor-pointer transition-colors group"
                                        onClick={() => setSlashOpen(true)}
                                    >
                                        <LinkIcon size={14} className="text-zinc-300 group-hover:text-black" />
                                        <span>Vincular itens ou adicionar dependências</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-[11px] font-bold text-zinc-500 hover:text-black cursor-pointer transition-colors group">
                                        <CheckCircle2 size={14} className="text-zinc-300 group-hover:text-black" />
                                        <span>Criar checklist</span>
                                    </div>
                                    <div
                                        className="flex items-center gap-3 text-[11px] font-bold text-zinc-500 hover:text-black cursor-pointer transition-colors group"
                                        onClick={() => fileInputRef.current?.click()}
                                    >
                                        <Paperclip size={14} className="text-zinc-300 group-hover:text-black" />
                                        <span>Anexar arquivo</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </ScrollArea>
                </div>

                {/* RIGHT COLUMN: ACTIVITY */}
                <div className="flex-[1.4] flex flex-col bg-white">
                    <div className="px-6 h-[50px] border-b border-zinc-50 bg-white flex items-center justify-between shrink-0 select-none">
                        <h3 className="text-[11px] font-black text-zinc-800 tracking-tight">Activity</h3>
                        <div className="flex items-center gap-3">
                            <Search size={14} className="text-zinc-300 hover:text-zinc-800 cursor-pointer transition-colors" />
                            <div className="flex items-center gap-1 text-zinc-400 hover:text-zinc-800 cursor-pointer transition-colors">
                                <AtSign size={14} />
                                <span className="text-[10px] font-black">2</span>
                            </div>
                            <Filter size={14} className="text-zinc-300 hover:text-zinc-800 cursor-pointer transition-colors" />
                        </div>
                    </div>

                    <ScrollArea className="flex-1 p-6">
                        <div className="space-y-6 font-medium text-[11px] text-zinc-500">
                            <div className="space-y-4">
                                <div className="flex gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-zinc-100 mt-1" />
                                    <div>
                                        <span className="font-bold text-zinc-800">Giulliano Alves</span> criou esta tarefa
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 pl-4 text-zinc-300 cursor-pointer hover:text-zinc-500 transition-colors">
                                    <ArrowUp size={10} /> Mostrar mais
                                </div>
                            </div>

                            {comments.map((comment) => (
                                <div key={comment.id} className="group space-y-2">
                                    <div className="flex items-center gap-2">
                                        <Avatar className="h-6 w-6 border border-zinc-100 shadow-sm border-white">
                                            {comment.user?.avatar_url && <AvatarImage src={comment.user.avatar_url} />}
                                            <AvatarFallback className="text-[8px] font-black bg-zinc-950 text-white uppercase">
                                                {comment.user?.first_name?.[0]}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1 space-y-1">
                                            <div className="flex items-center gap-2">
                                                <span className="text-[11px] font-black text-zinc-900 uppercase tracking-tighter">{comment.user?.first_name || 'Agente'}</span>
                                                <span className="text-[9px] font-bold text-zinc-300 uppercase">{format(new Date(comment.created_at), 'HH:mm', { locale: ptBR })}</span>
                                            </div>
                                            <div className="text-[12px] font-medium text-zinc-600 leading-relaxed bg-zinc-50 p-2 rounded-lg border border-zinc-100/50">
                                                {comment.content.match(/\.(jpeg|jpg|gif|png|webp)$/i) || comment.content.startsWith('https://storage') ? (
                                                    <div className="space-y-2">
                                                        <img
                                                            src={comment.content}
                                                            alt="Attachment"
                                                            className="rounded-lg max-w-full h-auto border border-zinc-200 shadow-sm"
                                                            onError={(e) => {
                                                                (e.target as HTMLImageElement).style.display = 'none';
                                                            }}
                                                        />
                                                        <p className="text-[10px] text-zinc-400 font-mono italic">Protocolo de Imagem Anexado</p>
                                                    </div>
                                                ) : (
                                                    comment.content
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </ScrollArea>

                    <div className="p-4 bg-white border-t border-zinc-50">
                        <div className="bg-zinc-50/50 border border-zinc-100 rounded-xl overflow-hidden focus-within:border-zinc-300 transition-all">
                            <Textarea
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                                placeholder="Escreva um comentário..."
                                className="min-h-[80px] bg-transparent border-0 px-4 py-3 resize-none text-[12px] font-medium focus-visible:ring-0 placeholder:text-zinc-300"
                            />
                            <div className="px-4 py-2 flex items-center justify-between">
                                <div className="flex items-center gap-3 text-zinc-300">
                                    <Plus
                                        size={14}
                                        className="hover:text-black cursor-pointer transition-colors"
                                        onClick={() => setSlashOpen(true)}
                                    />
                                    <Zap
                                        size={14}
                                        className="hover:text-revgreen cursor-pointer transition-colors"
                                        onClick={handleBrainAction}
                                    />
                                    <AtSign
                                        size={14}
                                        className="hover:text-black cursor-pointer transition-colors"
                                        onClick={() => toast.info("Use @ para mencionar especialistas do time.")}
                                    />
                                    <Paperclip
                                        size={14}
                                        className="hover:text-black cursor-pointer transition-colors"
                                        onClick={() => fileInputRef.current?.click()}
                                    />
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Smile
                                                size={14}
                                                className="hover:text-black cursor-pointer transition-colors"
                                            />
                                        </PopoverTrigger>
                                        <PopoverContent side="top" align="end" className="w-[220px] p-2 border-zinc-100 shadow-2xl rounded-xl bg-white">
                                            <div className="grid grid-cols-6 gap-1">
                                                {TACTICAL_EMOJIS.map((emoji) => (
                                                    <button
                                                        key={emoji}
                                                        onClick={() => insertEmoji(emoji)}
                                                        className="h-8 w-8 flex items-center justify-center text-lg hover:bg-zinc-50 rounded-lg transition-colors cursor-pointer"
                                                    >
                                                        {emoji}
                                                    </button>
                                                ))}
                                            </div>
                                        </PopoverContent>
                                    </Popover>
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        className="hidden"
                                        onChange={handleFileUpload}
                                    />
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="flex items-center gap-1 text-[10px] font-bold text-zinc-300">
                                        <MessageSquare size={12} /> 1
                                    </div>
                                    <Button
                                        size="icon"
                                        onClick={handleSendComment}
                                        disabled={!newComment.trim()}
                                        className="h-8 w-8 bg-transparent hover:bg-zinc-100 text-zinc-300 hover:text-black transition-all rounded-lg"
                                    >
                                        <Send size={16} />
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* SLASH COMMAND DIALOG */}
            <CommandDialog open={slashOpen} onOpenChange={setSlashOpen}>
                <CommandInput placeholder="Procure por um comando ou asset..." />
                <CommandList>
                    <CommandEmpty>Nenhum resultado encontrado.</CommandEmpty>
                    <CommandGroup heading="Ações Sugeridas">
                        <CommandItem onSelect={() => setSlashOpen(false)}>
                            <Plus size={14} className="mr-2" />
                            <span>Adicionar Subtarefa</span>
                            <CommandShortcut>⌘S</CommandShortcut>
                        </CommandItem>
                        <CommandItem onSelect={() => setSlashOpen(false)}>
                            <FileText size={14} className="mr-2" />
                            <span>Vincular Documento</span>
                            <CommandShortcut>⌘D</CommandShortcut>
                        </CommandItem>
                        <CommandItem onSelect={() => setSlashOpen(false)}>
                            <Zap size={14} className="mr-2 text-revgreen" />
                            <span>Gerar Roadmap com IA</span>
                        </CommandItem>
                    </CommandGroup>
                    <CommandSeparator />
                    <CommandGroup heading="Ativos e Projetos">
                        <CommandItem onSelect={() => setSlashOpen(false)}>
                            <Layout size={14} className="mr-2" />
                            <span>Vincular Projeto Atual</span>
                        </CommandItem>
                        <CommandItem onSelect={() => setSlashOpen(false)}>
                            <LinkIcon size={14} className="mr-2" />
                            <span>Criar Relacionamento Personalizado</span>
                        </CommandItem>
                    </CommandGroup>
                </CommandList>
            </CommandDialog>
        </DialogContent>
    );
};
