import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getAllActiveTasks, getAllActiveProjects } from '@/api/sprintSystem';
import { getAllLibraries } from '@/api/knowledge';
import AdminLayout from '@/components/layout/AdminLayout';
import {
    Bar,
    BarChart,
    CartesianGrid,
    Cell,
    Pie,
    PieChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
    Legend
} from "recharts";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, Filter, X, LayoutDashboard, ArrowRight, Activity, Users, Book, Folder, FileText } from "lucide-react";
import { format } from "date-fns";
import { useNavigate } from 'react-router-dom';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

const GlobalDashboard = () => {
    const navigate = useNavigate();
    const { data: tasks, isLoading: loadingTasks } = useQuery({
        queryKey: ['global-tasks'],
        queryFn: getAllActiveTasks,
        staleTime: 1000 * 60 * 5
    });

    const { data: projects, isLoading: loadingProjects } = useQuery({
        queryKey: ['global-projects'],
        queryFn: getAllActiveProjects,
        staleTime: 1000 * 60 * 5
    });

    const { data: libraries, isLoading: loadingLibs } = useQuery({
        queryKey: ['global-libraries'],
        queryFn: getAllLibraries,
        staleTime: 1000 * 60 * 30
    });

    // Active Sprints (extracted from Projects)
    const activeSprints = useMemo(() => {
        if (!projects) return [];
        return projects.flatMap(p => p.sprints || [])
            .filter(s => s.status === 'active')
            .slice(0, 3); // Top 3
    }, [projects]);

    const [filterMember, setFilterMember] = useState<string | null>(null);
    const [filterStatus, setFilterStatus] = useState<string | null>(null);

    // --- Process Data ---

    const workloadData = useMemo(() => {
        if (!tasks) return [];
        const workload: Record<string, { name: string, count: number, id: string, avatar: string }> = {};
        tasks.forEach(task => {
            const assigneeId = task.assignee_id || 'unassigned';
            const assigneeName = task.assignee?.full_name || 'Não atribuído';
            const assigneeAvatar = task.assignee?.avatar_url || '';

            if (!workload[assigneeId]) {
                workload[assigneeId] = {
                    name: assigneeName === 'Não atribuído' ? 'Não atribuído' : assigneeName.split(' ')[0],
                    count: 0,
                    id: assigneeId,
                    avatar: assigneeAvatar
                };
            }
            workload[assigneeId].count += 1;
        });
        return Object.values(workload).sort((a, b) => b.count - a.count);
    }, [tasks]);

    const statusData = useMemo(() => {
        if (!tasks) return [];
        const statusCount: Record<string, number> = { todo: 0, in_progress: 0, review: 0, done: 0 };
        tasks.forEach(task => {
            if (statusCount[task.status] !== undefined) statusCount[task.status] += 1;
        });
        return [
            { name: 'A Fazer', value: statusCount.todo, fill: '#E4E4E7', status: 'todo' }, // Zinc-200
            { name: 'Em Progresso', value: statusCount.in_progress, fill: '#18181B', status: 'in_progress' }, // Zinc-950 (Black)
            { name: 'Revisão', value: statusCount.review, fill: '#A1A1AA', status: 'review' } // Zinc-400
        ].filter(item => item.value > 0);
    }, [tasks]);

    const filteredTasks = useMemo(() => {
        if (!tasks) return [];
        return tasks.filter(task => {
            const matchesMember = filterMember ? (task.assignee_id || 'unassigned') === filterMember : true;
            const matchesStatus = filterStatus ? task.status === filterStatus : true;
            return matchesMember && matchesStatus;
        });
    }, [tasks, filterMember, filterStatus]);

    // Custom Tick for Avatar on X-Axis
    const CustomAvatarTick = ({ x, y, payload }: any) => {
        const member = workloadData.find(m => m.name === payload.value || m.id === payload.value);

        const avatarUrl = member?.avatar;
        const fallback = member?.name?.substring(0, 2).toUpperCase() || "??";
        const isSelected = filterMember === member?.id;

        return (
            <foreignObject x={x - 16} y={y + 5} width={32} height={32} style={{ overflow: 'visible' }}>
                <div
                    title={member?.name}
                    className={`h-8 w-8 rounded-full border-2 overflow-hidden flex items-center justify-center bg-zinc-100 cursor-pointer transition-all ${isSelected ? 'border-zinc-900 ring-2 ring-zinc-200 scale-110' : 'border-white shadow-sm hover:scale-110'
                        }`}
                >
                    {avatarUrl ? (
                        <img src={avatarUrl} alt={member?.name} className="h-full w-full object-cover" />
                    ) : (
                        <span className="text-[9px] font-bold text-zinc-500">{fallback}</span>
                    )}
                </div>
            </foreignObject>
        );
    };

    const statusTotal = useMemo(() => {
        return statusData.reduce((acc, curr) => acc + curr.value, 0);
    }, [statusData]);

    if (loadingTasks || loadingProjects) {
        return (
            <div className="h-screen flex items-center justify-center bg-zinc-50">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="h-8 w-8 animate-spin text-zinc-900" />
                    <p className="text-xs font-mono text-zinc-400 tracking-widest uppercase">Carregando Dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <AdminLayout>
            <div className="min-h-screen bg-zinc-50 font-sans text-zinc-900 pb-20">

                {/* HEADER */}
                <header className="bg-white border-b border-zinc-200 sticky top-0 z-10">
                    <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="h-8 w-8 bg-black flex items-center justify-center rounded-sm">
                                <LayoutDashboard className="h-4 w-4 text-white" />
                            </div>
                            <div>
                                <h1 className="text-sm font-bold uppercase tracking-widest text-zinc-900 leading-none mb-1">
                                    Dashboard
                                </h1>
                                <p className="text-[10px] text-zinc-400 font-medium">Visão Operacional Global</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <Badge variant="outline" className="rounded-none border-zinc-200 text-zinc-500 font-mono text-[10px] px-3 py-1">
                                {tasks?.length || 0} TAREFAS ATIVAS
                            </Badge>
                            <Badge variant="outline" className="rounded-none border-zinc-200 text-zinc-500 font-mono text-[10px] px-3 py-1">
                                {projects?.length || 0} PROJETOS
                            </Badge>
                        </div>
                    </div>
                </header>

                <main className="max-w-7xl mx-auto px-6 py-12 space-y-8">

                    {/* METRICS ROW */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <MetricCard
                            label="Carga de Trabalho"
                            value={workloadData.length.toString()}
                            subtypes="Membros Ativos"
                            icon={<Users className="w-4 h-4 text-zinc-400" />}
                        />
                        <MetricCard
                            label="Velocidade Média"
                            value="12.4"
                            subtypes="Pontos / Sprint"
                            icon={<Activity className="w-4 h-4 text-zinc-400" />}
                        />
                        <MetricCard
                            label="Em Progresso"
                            value={statusData.find(s => s.status === 'in_progress')?.value.toString() || "0"}
                            subtypes="Tarefas Ativas"
                            highlight
                            icon={<Loader2 className="w-4 h-4 text-white" />}
                        />
                        <div className="bg-zinc-900 p-6 flex flex-col justify-between text-white cursor-pointer hover:bg-zinc-800 transition-colors group" onClick={() => navigate('/admin/rei')}>
                            <div className="flex justify-between items-start">
                                <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Diagnósticos</span>
                                <ArrowRight className="w-4 h-4 text-zinc-500 group-hover:text-white transition-colors" />
                            </div>
                            <div>
                                <p className="text-3xl font-bold mb-1">{projects?.length || 0}</p>
                                <p className="text-xs text-zinc-400">Projetos Monitorados</p>
                            </div>
                        </div>
                    </div>


                    {/* SECOND ROW: Docs & Sprints */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* DOCS / WIKI (Notion Style) */}
                        <div className="bg-white border border-zinc-200 p-6 flex flex-col h-[300px]">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-2">
                                    <Book className="w-4 h-4 text-zinc-400" />
                                    <h3 className="text-sm font-bold uppercase tracking-widest text-zinc-900">Base de Conhecimento</h3>
                                </div>
                                <Button variant="ghost" size="sm" className="h-6 text-[10px]" onClick={() => navigate('/admin/knowledge')}>
                                    Ver tudo <ArrowRight className="w-3 h-3 ml-1" />
                                </Button>
                            </div>
                            <div className="flex-1 overflow-y-auto space-y-2 pr-2">
                                {loadingLibs ? (
                                    <div className="flex items-center justify-center h-full"><Loader2 className="animate-spin w-4 h-4" /></div>
                                ) : libraries?.length === 0 ? (
                                    <div className="text-center text-zinc-400 text-xs py-8">Nenhuma biblioteca criada.</div>
                                ) : (
                                    libraries?.map(lib => (
                                        <div
                                            key={lib.id}
                                            className="group flex items-center justify-between p-3 rounded-md hover:bg-zinc-50 border border-transparent hover:border-zinc-100 cursor-pointer transition-all"
                                            onClick={() => navigate(`/admin/knowledge/${lib.id}`)}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="h-8 w-8 bg-zinc-100 rounded-sm flex items-center justify-center text-zinc-500 group-hover:bg-white group-hover:shadow-sm transition-all">
                                                    <Folder className="w-4 h-4" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-zinc-900">{lib.name}</p>
                                                    <p className="text-[10px] text-zinc-400">{format(new Date(lib.created_at), 'dd MMM, yyyy')}</p>
                                                </div>
                                            </div>
                                            <ArrowRight className="w-3 h-3 text-zinc-300 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
                                        </div>
                                    ))
                                )}
                                {/* Mock Item if Empty for Preview */}
                                {(!libraries || libraries.length === 0) && (
                                    <div className="group flex items-center justify-between p-3 rounded-md hover:bg-zinc-50 border border-transparent hover:border-zinc-100 cursor-pointer transition-all opacity-60">
                                        <div className="flex items-center gap-3">
                                            <div className="h-8 w-8 bg-zinc-100 rounded-sm flex items-center justify-center text-zinc-500">
                                                <FileText className="w-4 h-4" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-zinc-900">Manual de RevOps</p>
                                                <p className="text-[10px] text-zinc-400">Exemplo de documentação</p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* ACTIVE SPRINTS */}
                        <div className="bg-white border border-zinc-200 p-6 flex flex-col h-[300px]">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-2">
                                    <Activity className="w-4 h-4 text-zinc-400" />
                                    <h3 className="text-sm font-bold uppercase tracking-widest text-zinc-900">Sprints Ativos</h3>
                                </div>
                            </div>
                            <div className="flex-1 overflow-y-auto space-y-3">
                                {activeSprints.length === 0 ? (
                                    <div className="text-center text-zinc-400 text-xs py-8">Nenhum sprint ativo no momento.</div>
                                ) : (
                                    activeSprints.map(sprint => (
                                        <div key={sprint.id} className="border border-zinc-100 bg-zinc-50/50 p-4 rounded-sm">
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-xs font-bold uppercase text-zinc-700">{sprint.title}</span>
                                                <Badge variant="outline" className="bg-white text-[9px] h-5 border-zinc-200 text-zinc-500">
                                                    ATIVO
                                                </Badge>
                                            </div>
                                            <div className="flex items-center justify-between text-[10px] text-zinc-500 mb-3">
                                                <span>Início: {format(new Date(sprint.start_date), 'dd/MM')}</span>
                                                <span>Fim: {format(new Date(sprint.end_date), 'dd/MM')}</span>
                                            </div>
                                            {/* Mini Progress Bar (Mock for visual) */}
                                            <div className="h-1 w-full bg-zinc-200 rounded-full overflow-hidden">
                                                <div className="h-full bg-zinc-900 w-[65%]"></div>
                                            </div>
                                        </div>
                                    ))
                                )}
                                {/* Mock Item if Empty */}
                                {activeSprints.length === 0 && (
                                    <div className="border border-zinc-100 bg-zinc-50/50 p-4 rounded-sm opacity-60">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-xs font-bold uppercase text-zinc-700">Sprint 24.1: Growth Engine</span>
                                            <Badge variant="outline" className="bg-white text-[9px] h-5 border-zinc-200 text-zinc-500">
                                                SIMULAÇÃO
                                            </Badge>
                                        </div>
                                        <div className="h-1 w-full bg-zinc-200 rounded-full overflow-hidden mt-2">
                                            <div className="h-full bg-zinc-900 w-[45%]"></div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* CHARTS ROW */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* WORKLOAD CHART (Avatar Updated) */}
                        <div className="lg:col-span-2 bg-white border border-zinc-200 p-6">
                            <div className="flex items-center justify-between mb-2">
                                <div>
                                    <h3 className="text-sm font-bold uppercase tracking-widest text-zinc-900">Carga de Trabalho</h3>
                                </div>
                                {filterMember && (
                                    <Button variant="ghost" size="sm" onClick={() => setFilterMember(null)} className="h-6 text-[10px] gap-2">
                                        Limpar <X className="w-3 h-3" />
                                    </Button>
                                )}
                            </div>
                            <div className="h-[250px] w-full pt-4">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={workloadData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f4f4f5" />
                                        <XAxis
                                            dataKey="name"
                                            axisLine={false}
                                            tickLine={false}
                                            tick={<CustomAvatarTick />}
                                            interval={0}
                                        />
                                        <YAxis
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{ fontSize: 10, fill: '#a1a1aa' }}
                                        />
                                        <Tooltip
                                            cursor={{ fill: '#F4F4F5' }}
                                            contentStyle={{
                                                backgroundColor: 'white',
                                                border: '1px solid #e4e4e7',
                                                borderRadius: '8px',
                                                padding: '8px 12px',
                                                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                                            }}
                                            formatter={(value: number, name: string) => [
                                                `${value} tarefa${value !== 1 ? 's' : ''}`,
                                                'Carga'
                                            ]}
                                        />
                                        <Bar
                                            dataKey="count"
                                            radius={[4, 4, 0, 0]}
                                            barSize={40}
                                            onClick={(data) => setFilterMember(data.id === filterMember ? null : data.id)}
                                        >
                                            {workloadData.map((entry, index) => (
                                                <Cell
                                                    key={`cell-${index}`}
                                                    fill={entry.id === filterMember ? '#18181B' : '#E4E4E7'}
                                                    className="cursor-pointer hover:opacity-80 transition-opacity"
                                                />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* STATUS CHART */}
                        <div className="bg-white border border-zinc-200 p-6">
                            <div className="flex items-center justify-between mb-8">
                                <div>
                                    <h3 className="text-sm font-bold uppercase tracking-widest text-zinc-900">Status</h3>
                                </div>
                            </div>
                            <div className="h-[200px] w-full relative">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={statusData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60}
                                            outerRadius={80}
                                            paddingAngle={5}
                                            dataKey="value"
                                            onClick={(data) => setFilterStatus(data.status === filterStatus ? null : data.status)}
                                        >
                                            {statusData.map((entry, index) => (
                                                <Cell
                                                    key={`cell-${index}`}
                                                    fill={entry.fill}
                                                    className="cursor-pointer hover:opacity-80 stroke-white stroke-2"
                                                />
                                            ))}
                                        </Pie>
                                        <Tooltip
                                            contentStyle={{
                                                backgroundColor: '#fff',
                                                borderRadius: '8px',
                                                color: '#18181B',
                                                border: '1px solid #e4e4e7',
                                                fontSize: '11px',
                                                fontWeight: 'bold',
                                                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                                            }}
                                        />
                                    </PieChart>
                                </ResponsiveContainer>
                                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                    <div className="text-center">
                                        <p className="text-3xl font-bold text-zinc-900 leading-none">{statusTotal}</p>
                                        <p className="text-[9px] uppercase font-black text-zinc-400 tracking-widest mt-1">Total</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* TASKS LIST */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-4 border-b border-zinc-200 pb-4">
                            <div className="h-8 w-8 bg-zinc-100 flex items-center justify-center text-zinc-400 font-mono text-xs">01</div>
                            <h2 className="text-lg font-bold">Tarefas Prioritárias</h2>
                            {(filterMember || filterStatus) && (
                                <Badge variant="secondary" className="ml-auto flex gap-2 cursor-pointer hover:bg-zinc-200" onClick={() => { setFilterMember(null); setFilterStatus(null) }}>
                                    Filtros Ativos <X className="w-3 h-3" />
                                </Badge>
                            )}
                        </div>

                        <div className="bg-white border border-zinc-200">
                            <div className="grid grid-cols-12 gap-4 p-4 border-b border-zinc-100 bg-zinc-50/50 text-[10px] font-bold uppercase tracking-widest text-zinc-500">
                                <div className="col-span-5">Tarefa / Projeto</div>
                                <div className="col-span-3">Responsável</div>
                                <div className="col-span-2">Status</div>
                                <div className="col-span-2 text-right">Deadline</div>
                            </div>

                            <div className="divide-y divide-zinc-100">
                                {filteredTasks.length === 0 ? (
                                    <div className="p-12 text-center text-zinc-400 text-sm">
                                        Nenhuma tarefa encontrada com os filtros atuais.
                                    </div>
                                ) : (
                                    filteredTasks.map(task => (
                                        <div
                                            key={task.id}
                                            className="grid grid-cols-12 gap-4 p-4 items-center hover:bg-zinc-50 transition-colors group cursor-pointer"
                                            onClick={() => {
                                                if (task.project?.id) {
                                                    navigate(`/admin/projects/${task.project.id}?tab=execucao`);
                                                }
                                            }}
                                        >
                                            <div className="col-span-5">
                                                <p className="font-medium text-sm text-zinc-900 group-hover:text-black mb-1">{task.title}</p>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-[10px] px-1.5 py-0.5 bg-zinc-100 text-zinc-500 rounded-sm font-mono">
                                                        {task.project?.name || 'Geral'}
                                                    </span>
                                                    {task.project?.client?.name && (
                                                        <span className="text-[10px] text-zinc-400">• {task.project.client.name}</span>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="col-span-3 flex items-center gap-2">
                                                <Avatar className="h-6 w-6 rounded-full border border-zinc-100">
                                                    <AvatarImage src={task.assignee?.avatar_url || ''} />
                                                    <AvatarFallback className="text-[9px] bg-zinc-100 text-zinc-600">
                                                        {task.assignee?.full_name?.substring(0, 2).toUpperCase() || 'UN'}</AvatarFallback>
                                                </Avatar>
                                                <span className="text-xs text-zinc-600">{task.assignee?.full_name || 'Não atribuído'}</span>
                                            </div>
                                            <div className="col-span-2">
                                                <StatusBadge status={task.status} />
                                            </div>
                                            <div className="col-span-2 text-right">
                                                <span className="text-xs font-mono text-zinc-500">
                                                    {task.due_date ? format(new Date(task.due_date), 'dd/MM') : '-'}
                                                </span>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </AdminLayout>
    );
};

// --- SUBCOMPONENTS ---

const MetricCard = ({ label, value, subtypes, highlight = false, icon }: any) => (
    <div className={`p-6 flex flex-col justify-between border ${highlight
        ? 'bg-zinc-900 border-zinc-900 text-white'
        : 'bg-white border-zinc-200 text-zinc-900'
        }`}>
        <div className="flex justify-between items-start">
            <span className={`text-[10px] font-bold uppercase tracking-widest ${highlight ? 'text-zinc-500' : 'text-zinc-400'}`}>
                {label}
            </span>
            {icon}
        </div>
        <div className="mt-4">
            <p className="text-3xl font-bold mb-1">{value}</p>
            <p className={`text-xs ${highlight ? 'text-zinc-500' : 'text-zinc-400'}`}>{subtypes}</p>
        </div>
    </div>
);

const StatusBadge = ({ status }: { status: string }) => {
    const styles = {
        todo: "bg-zinc-100 text-zinc-600 border-zinc-200",
        in_progress: "bg-blue-50 text-blue-700 border-blue-200",
        review: "bg-yellow-50 text-yellow-700 border-yellow-200",
        done: "bg-green-50 text-green-700 border-green-200",
    };

    const labels = {
        todo: "A FAZER",
        in_progress: "EM EXECUÇÃO",
        review: "REVISÃO",
        done: "CONCLUÍDO"
    };

    return (
        <span className={`text-[9px] font-bold px-2 py-1 rounded-sm border uppercase tracking-wide ${styles[status as keyof typeof styles] || styles.todo}`}>
            {labels[status as keyof typeof labels] || status}
        </span>
    );
};

export default GlobalDashboard;
