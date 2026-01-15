
import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { APP_CONFIG } from "@/config/constants";
import PageLayout from '@/components/layout/PageLayout';
import REIProjectCard from '@/components/rei/REIProjectCard';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Home, TrendingUp, AlertCircle } from 'lucide-react';
import { REIProject, getProjectsNeedingAttention, groupProjectsByQuarter } from '@/lib/reiQuarterlySystem';

// Mock data - em produção virá do Supabase
const mockProjects: REIProject[] = [
    {
        id: '1',
        clientName: 'BT Digital',
        clientEmail: 'contato@btdigital.com',
        lastREIDate: new Date('2024-10-01'),
        nextREIDate: new Date('2025-01-01'),
        quarter: 'Q1',
        year: 2025,
        status: 'active',
        analystEmail: APP_CONFIG.EMAILS.ANALYST
    },
    {
        id: '2',
        clientName: 'Tikpag',
        clientEmail: 'growth@tikpag.com',
        lastREIDate: new Date('2024-06-30'),
        nextREIDate: new Date('2024-12-24'),
        quarter: 'Q4',
        year: 2024,
        status: 'active',
        analystEmail: APP_CONFIG.EMAILS.ANALYST
    },
    {
        id: '3',
        clientName: 'Tegra',
        clientEmail: 'marketing@tegra.com',
        lastREIDate: new Date('2024-03-31'),
        nextREIDate: new Date('2024-12-19'),
        quarter: 'Q4',
        year: 2024,
        status: 'active',
        analystEmail: APP_CONFIG.EMAILS.ANALYST
    },
];

const REIDashboard = () => {
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');
    const [projects] = useState<REIProject[]>(mockProjects);

    const filteredProjects = useMemo(() => {
        if (!searchQuery.trim()) return projects;
        const query = searchQuery.toLowerCase();
        return projects.filter(p =>
            p.clientName.toLowerCase().includes(query) ||
            p.clientEmail.toLowerCase().includes(query)
        );
    }, [projects, searchQuery]);

    const projectsNeedingAttention = useMemo(() =>
        getProjectsNeedingAttention(filteredProjects),
        [filteredProjects]
    );

    const projectsByQuarter = useMemo(() =>
        groupProjectsByQuarter(filteredProjects),
        [filteredProjects]
    );

    const stats = useMemo(() => {
        const overdue = filteredProjects.filter(p => {
            const days = Math.floor((p.nextREIDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
            return days < 0;
        }).length;

        const pending = filteredProjects.filter(p => {
            const days = Math.floor((p.nextREIDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
            return days >= 0 && days <= 30;
        }).length;

        const today = filteredProjects.filter(p => {
            const days = Math.floor((p.nextREIDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
            return days === 0;
        }).length;

        return {
            total: filteredProjects.length,
            overdue,
            pending,
            today
        };
    }, [filteredProjects]);

    return (
        <PageLayout>
            <div className="min-h-screen bg-gray-50 pt-16 pb-20">
                <div className="container mx-auto px-4 max-w-7xl">
                    {/* Header */}
                    <div className="mb-12">
                        <div className="flex items-center gap-4 mb-6">
                            <Button
                                variant="outline"
                                onClick={() => navigate('/dashboard')}
                                className="border-gray-300 text-gray-700 hover:bg-gray-50"
                            >
                                <Home className="mr-2 h-4 w-4" /> Voltar ao Hub
                            </Button>
                            <div className="flex items-center gap-2">
                                <TrendingUp className="h-5 w-5 text-gray-700" />
                                <span className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    REI Quarterly Management
                                </span>
                            </div>
                        </div>

                        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                            Dashboard de Projetos REI
                        </h1>
                        <p className="text-xl text-gray-600 max-w-3xl mb-4">
                            Gerencie as renovações trimestrais de diagnósticos dos clientes
                        </p>

                        {/* Info Box */}
                        <div className="bg-blue-50 border-l-4 border-blue-400 p-4 max-w-3xl rounded-r-lg">
                            <div className="flex items-start gap-3">
                                <div className="flex-shrink-0">
                                    <svg className="h-5 w-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-blue-900 mb-1">O que é REI?</p>
                                    <p className="text-sm text-blue-800">
                                        <strong>Revenue Excellence Initiative</strong> - Diagnóstico trimestral que mapeia a operação comercial do cliente, identifica gargalos e oportunidades de crescimento.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                        <div className="bg-white border-2 border-gray-200 rounded-xl p-6">
                            <p className="text-gray-600 text-sm font-medium mb-2">Total de Projetos</p>
                            <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
                        </div>
                        <div className="bg-white border-2 border-red-200 rounded-xl p-6">
                            <p className="text-red-700 text-sm font-medium mb-2">Atrasados</p>
                            <p className="text-3xl font-bold text-red-700">{stats.overdue}</p>
                        </div>
                        <div className="bg-white border-2 border-yellow-200 rounded-xl p-6">
                            <p className="text-yellow-700 text-sm font-medium mb-2">Atenção Necessária</p>
                            <p className="text-3xl font-bold text-yellow-700">{stats.pending}</p>
                        </div>
                        <div className="bg-white border-2 border-green-200 rounded-xl p-6">
                            <p className="text-green-700 text-sm font-medium mb-2">Em Dia</p>
                            <p className="text-3xl font-bold text-green-700">{stats.today}</p>
                        </div>
                    </div>

                    {/* Search */}
                    <div className="mb-8 relative max-w-md">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <Input
                            type="search"
                            placeholder="Buscar cliente..."
                            className="pl-10 bg-white border-gray-300 text-gray-900 placeholder:text-gray-500 h-12"
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                        />
                    </div>

                    {/* Alerts Section */}
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
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">Todos os Projetos</h2>
                        {Object.entries(projectsByQuarter)
                            .sort(([a], [b]) => b.localeCompare(a))
                            .map(([quarter, quarterProjects]) => (
                                <div key={quarter} className="mb-8">
                                    <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center gap-2">
                                        <span className="bg-gray-200 px-3 py-1 rounded-lg">{quarter}</span>
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {quarterProjects.map(project => (
                                            <REIProjectCard key={project.id} project={project} />
                                        ))}
                                    </div>
                                </div>
                            ))}
                    </div>
                </div>
            </div>
        </PageLayout>
    );
};

export default REIDashboard;
