
import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { APP_CONFIG } from "@/config/constants";
import PageLayout from '@/components/layout/PageLayout';
import REIProjectCard from '@/components/rei/REIProjectCard';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, Home, TrendingUp, AlertCircle, Users, Target } from 'lucide-react';
import { REIProject, getProjectsNeedingAttention, groupProjectsByQuarter } from '@/lib/reiQuarterlySystem';

import { useEffect } from 'react';
import { getAllReiProjects } from '@/api/reiProjects';
import LeadWarRoomSheet from '@/components/rei/LeadWarRoomSheet';

const REIDashboard = () => {
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');
    const [projects, setProjects] = useState<REIProject[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Estado da gaveta de vendas
    const [selectedLead, setSelectedLead] = useState<any | null>(null);

    useEffect(() => {
        const loadRealProjects = async () => {
             try {
                 const data = await getAllReiProjects();
                 // Mapeia do banco (snake_case) para a UI (camelCase)
                 const mapped: REIProject[] = data.map(p => ({
                     id: p.id,
                     clientName: p.trade_name || p.client_company || p.client_name,
                     clientEmail: p.client_email,
                     lastREIDate: new Date(p.created_at || new Date().toISOString()),
                     nextREIDate: new Date(p.next_rei_date),
                     quarter: p.quarter as any || 'Q1',
                     year: p.year || new Date().getFullYear(),
                     status: p.status as any,
                     analystEmail: p.analyst_email
                 }));
                 setProjects(mapped);
             } catch (error) {
                 console.error("Erro ao carregar projetos reais", error);
             } finally {
                 setIsLoading(false);
             }
        };
        loadRealProjects();
    }, []);

    const filteredProjects = useMemo(() => {
        if (!searchQuery.trim()) return projects;
        const query = searchQuery.toLowerCase();
        return projects.filter(p =>
            p.clientName.toLowerCase().includes(query) ||
            p.clientEmail.toLowerCase().includes(query)
        );
    }, [projects, searchQuery]);

    const activeClients = useMemo(() => filteredProjects.filter(p => p.status !== 'lead' && p.status !== 'diagnostic'), [filteredProjects]);
    const leadProjects = useMemo(() => filteredProjects.filter(p => p.status === 'lead'), [filteredProjects]);

    const projectsNeedingAttention = useMemo(() =>
        getProjectsNeedingAttention(activeClients),
        [activeClients]
    );

    const projectsByQuarter = useMemo(() =>
        groupProjectsByQuarter(activeClients),
        [activeClients]
    );

    const stats = useMemo(() => {
        const overdue = activeClients.filter(p => {
            const days = Math.floor((p.nextREIDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
            return days < 0;
        }).length;

        const pending = activeClients.filter(p => {
            const days = Math.floor((p.nextREIDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
            return days >= 0 && days <= 30;
        }).length;

        const today = activeClients.filter(p => {
            const days = Math.floor((p.nextREIDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
            return days === 0;
        }).length;

        return {
            total: activeClients.length,
            overdue,
            pending,
            today
        };
    }, [activeClients]);

    return (
        <PageLayout>
            <div className="min-h-screen bg-zinc-50 pt-16 pb-20">
                <div className="container mx-auto px-4 max-w-7xl">
                    {/* Header */}
                    <div className="mb-12">
                        <div className="flex items-center gap-4 mb-6">
                            <Button
                                variant="outline"
                                onClick={() => navigate('/dashboard')}
                                className="border-zinc-300 text-zinc-700 hover:bg-zinc-50"
                            >
                                <Home className="mr-2 h-4 w-4" /> Voltar ao Hub
                            </Button>
                            <div className="flex items-center gap-2">
                                <TrendingUp className="h-5 w-5 text-zinc-700" />
                                <span className="text-xs font-semibold text-zinc-600 uppercase tracking-wider">
                                    REI Quarterly Management
                                </span>
                            </div>
                        </div>

                        <h1 className="text-4xl md:text-5xl font-bold text-zinc-900 mb-4">
                            Dashboard de Projetos REI
                        </h1>
                        <p className="text-xl text-zinc-600 max-w-3xl mb-4">
                            Gerencie as renovações trimestrais de diagnósticos dos clientes
                        </p>

                        {/* Info Box */}
                        <div className="bg-zinc-50 border-l-4 border-zinc-400 p-4 max-w-3xl rounded-r-lg">
                            <div className="flex items-start gap-3">
                                <div className="flex-shrink-0">
                                    <svg className="h-5 w-5 text-zinc-700" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-zinc-900 mb-1">O que é REI?</p>
                                    <p className="text-sm text-zinc-700">
                                        <strong>Revenue Excellence Initiative</strong> - Diagnóstico trimestral que mapeia a operação comercial do cliente, identifica gargalos e oportunidades de crescimento.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                        <div className="bg-white border-2 border-zinc-200 rounded-xl p-6">
                            <p className="text-zinc-600 text-sm font-medium mb-2">Clientes Ativos</p>
                            <p className="text-3xl font-bold text-zinc-900">{stats.total}</p>
                        </div>
                        <div className="bg-white border-2 border-red-200 rounded-xl p-6">
                            <p className="text-red-700 text-sm font-medium mb-2">Atrasados</p>
                            <p className="text-3xl font-bold text-red-700">{stats.overdue}</p>
                        </div>
                        <div className="bg-white border-2 border-yellow-200 rounded-xl p-6">
                            <p className="text-yellow-700 text-sm font-medium mb-2">Atenção Necessária</p>
                            <p className="text-3xl font-bold text-yellow-700">{stats.pending}</p>
                        </div>
                        <div className="bg-white border-2 border-zinc-200 rounded-xl p-6">
                            <p className="text-zinc-700 text-sm font-medium mb-2">Leads (Site)</p>
                            <p className="text-3xl font-bold text-zinc-700">{leadProjects.length}</p>
                        </div>
                    </div>

                    {/* Search */}
                    <div className="mb-8 relative max-w-md">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-zinc-400" />
                        <Input
                            type="search"
                            placeholder="Buscar cliente..."
                            className="pl-10 bg-white border-zinc-300 text-zinc-900 placeholder:text-zinc-500 h-12"
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                        />
                    </div>

                    <Tabs defaultValue="clients" className="w-full">
                        <TabsList className="mb-8 bg-zinc-200/50 p-1 w-full max-w-sm rounded-xl">
                            <TabsTrigger value="clients" className="w-full rounded-lg data-[state=active]:bg-white data-[state=active]:text-black data-[state=active]:shadow-sm">
                                <Users className="w-4 h-4 mr-2" /> Clientes
                            </TabsTrigger>
                            <TabsTrigger value="leads" className="w-full rounded-lg data-[state=active]:bg-zinc-900 data-[state=active]:text-white data-[state=active]:shadow-sm">
                                <Target className="w-4 h-4 mr-2" /> Leads
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="clients" className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            {/* Alerts Section (Only for active clients) */}
                            {projectsNeedingAttention.length > 0 && (
                                <div className="mb-8 bg-yellow-50 border-2 border-yellow-200 rounded-xl p-6">
                                    <div className="flex items-start gap-3 mb-4">
                                        <AlertCircle className="h-6 w-6 text-yellow-600 flex-shrink-0 mt-1" />
                                        <div>
                                            <h2 className="text-lg font-bold text-yellow-900 mb-1">
                                                Ação Necessária ({projectsNeedingAttention.length})
                                            </h2>
                                            <p className="text-sm text-yellow-800">
                                                Os seguintes projetos precisam de atenção imediata
                                            </p>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {projectsNeedingAttention.map(project => (
                                            <REIProjectCard key={project.id} project={project} />
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* All Projects by Quarter */}
                            <div>
                                <h2 className="text-2xl font-bold text-zinc-900 mb-6">Todos os Projetos Ativos</h2>
                                {Object.entries(projectsByQuarter)
                                    .sort(([a], [b]) => b.localeCompare(a))
                                    .map(([quarter, quarterProjects]) => (
                                        <div key={quarter} className="mb-8">
                                            <h3 className="text-lg font-semibold text-zinc-700 mb-4 flex items-center gap-2">
                                                <span className="bg-zinc-200 px-3 py-1 rounded-lg">{quarter}</span>
                                            </h3>
                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                                {quarterProjects.map(project => (
                                                    <REIProjectCard key={project.id} project={project} />
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                            </div>
                        </TabsContent>

                        <TabsContent value="leads" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="mb-6">
                                <h2 className="text-2xl font-bold text-zinc-900 mb-2">Leads de Diagnóstico</h2>
                                <p className="text-zinc-500">Mapeados via Gateway Público (Não convertidos em clientes ainda).</p>
                            </div>
                            
                            {leadProjects.length === 0 ? (
                                <div className="bg-zinc-50 border-2 border-dashed border-zinc-200 rounded-xl p-12 text-center text-zinc-500">
                                    Nenhum lead encontrado com seu filtro atual.
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {leadProjects.map(project => (
                                        <div 
                                            key={project.id} 
                                            className="opacity-90 grayscale-[20%] hover:grayscale-0 transition-all cursor-pointer"
                                            onClick={() => setSelectedLead({
                                                id: project.id,
                                                name: project.clientName,
                                                company: project.clientName,
                                                type: 'funnels_impl', // Fallback
                                                urgencyScore: 50,
                                                maturityPct: 30, // Fallback
                                                nextAction: 'Reunião de Diagnóstico',
                                                daysSinceActivity: Math.floor((new Date().getTime() - project.lastREIDate.getTime()) / (1000 * 60 * 60 * 24))
                                            })}
                                        >
                                            <REIProjectCard project={project} />
                                        </div>
                                    ))}
                                </div>
                            )}
                        </TabsContent>
                    </Tabs>
                </div>
            </div>

            {/* Injeção do War Room Sheet (Drawer de Vendas) */}
            <LeadWarRoomSheet 
                lead={selectedLead} 
                open={!!selectedLead} 
                onClose={() => setSelectedLead(null)} 
                onQualified={() => {
                    // Após qualificar, atualiza a lista
                    window.location.reload();
                }} 
            />
        </PageLayout>
    );
};

export default REIDashboard;
