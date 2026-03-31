// VERSÃO FINAL: 26/12/2025 00:36 - 5 CARDS: Blog, Materiais, Cases, REI, Configurações
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { LayoutDashboard, FileText, Trophy, Download, Settings, Users } from 'lucide-react';
import PageLayout from '@/components/layout/PageLayout';
import Section from '@/components/ui/Section';

const Dashboard = () => {
    const { user, isLoading } = useAuth();
    const navigate = useNavigate();



    useEffect(() => {
        if (!isLoading && !user) {
            navigate('/login');
        }
    }, [user, isLoading, navigate]);

    if (isLoading) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-revgreen border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!user) return null;

    return (
        <PageLayout>
            <Section variant="light" className="py-20 bg-white min-h-screen">
                <div className="container-custom">
                    {/* Header */}
                    <div className="mb-24 text-center">
                        <h1 className="text-5xl md:text-7xl font-black text-black mb-4 uppercase tracking-[0.2em]">
                            REVHACKERS
                        </h1>
                        <p className="text-xs text-zinc-500 uppercase tracking-[0.3em] font-bold">
                            GROWTHHUB
                        </p>
                    </div>

                    {/* Dashboard Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-0 border-t border-l border-zinc-200 max-w-7xl mx-auto">
                        {/* Card 1: Artigos */}
                        <div className="bg-white border-r border-b border-zinc-200 hover:bg-zinc-50 transition-all duration-300 p-10 flex flex-col group h-[320px] justify-between cursor-pointer" onClick={() => navigate('/admin/posts')}>
                            <div>
                                <div className="w-12 h-12 border border-zinc-200 flex items-center justify-center mb-8 group-hover:border-black transition-colors">
                                    <FileText className="w-5 h-5 text-zinc-400 group-hover:text-black transition-colors" />
                                </div>
                                <h3 className="text-lg font-black text-black mb-2 uppercase tracking-[0.2em]">Blog Posts</h3>
                                <p className="text-zinc-500 text-xxs uppercase tracking-widest font-bold">
                                    Gerência, categorias e autores do blog.
                                </p>
                            </div>
                            <div className="flex justify-end">
                                <span className="text-xxs font-black uppercase tracking-[0.3em] text-zinc-400 group-hover:text-black transition-colors flex items-center gap-2">
                                    Acessar <span className="text-lg leading-none">→</span>
                                </span>
                            </div>
                        </div>

                        {/* Card 2: Materiais */}
                        <div className="bg-white border-r border-b border-zinc-200 hover:bg-zinc-50 transition-all duration-300 p-10 flex flex-col group h-[320px] justify-between cursor-pointer" onClick={() => navigate('/admin/materials')}>
                            <div>
                                <div className="w-12 h-12 border border-zinc-200 flex items-center justify-center mb-8 group-hover:border-black transition-colors">
                                    <Download className="w-5 h-5 text-zinc-400 group-hover:text-black transition-colors" />
                                </div>
                                <h3 className="text-lg font-black text-black mb-2 uppercase tracking-[0.2em]">Materiais Ricos</h3>
                                <p className="text-zinc-500 text-xxs uppercase tracking-widest font-bold">
                                    Ebooks, planilhas e whitepapers para download.
                                </p>
                            </div>
                            <div className="flex justify-end">
                                <span className="text-xxs font-black uppercase tracking-[0.3em] text-zinc-400 group-hover:text-black transition-colors flex items-center gap-2">
                                    Acessar <span className="text-lg leading-none">→</span>
                                </span>
                            </div>
                        </div>

                        {/* Card 3: Cases */}
                        <div className="bg-white border-r border-b border-zinc-200 hover:bg-zinc-50 transition-all duration-300 p-10 flex flex-col group h-[320px] justify-between cursor-pointer" onClick={() => navigate('/admin/cases')}>
                            <div>
                                <div className="w-12 h-12 border border-zinc-200 flex items-center justify-center mb-8 group-hover:border-black transition-colors">
                                    <Trophy className="w-5 h-5 text-zinc-400 group-hover:text-black transition-colors" />
                                </div>
                                <h3 className="text-lg font-black text-black mb-2 uppercase tracking-[0.2em]">Cases de Sucesso</h3>
                                <p className="text-zinc-500 text-xxs uppercase tracking-widest font-bold">
                                    Histórias de clientes e resultados alcançados.
                                </p>
                            </div>
                            <div className="flex justify-end">
                                <span className="text-xxs font-black uppercase tracking-[0.3em] text-zinc-400 group-hover:text-black transition-colors flex items-center gap-2">
                                    Acessar <span className="text-lg leading-none">→</span>
                                </span>
                            </div>
                        </div>

                        {/* Card 4: REI */}
                        <div className="bg-white border-r border-b border-zinc-200 hover:bg-zinc-50 transition-all duration-300 p-10 flex flex-col group h-[320px] justify-between cursor-pointer" onClick={() => navigate('/rei-hub')}>
                            <div>
                                <div className="w-12 h-12 border border-zinc-200 flex items-center justify-center mb-8 group-hover:border-black transition-colors">
                                    <LayoutDashboard className="w-5 h-5 text-zinc-400 group-hover:text-black transition-colors" />
                                </div>
                                <h3 className="text-lg font-black text-black mb-2 uppercase tracking-[0.2em]">REI</h3>
                                <p className="text-zinc-500 text-xxs uppercase tracking-widest font-bold">
                                    Revenue Intelligence Hub
                                </p>
                            </div>
                            <div className="flex justify-end">
                                <span className="text-xxs font-black uppercase tracking-[0.3em] text-zinc-400 group-hover:text-black transition-colors flex items-center gap-2">
                                    Acessar <span className="text-lg leading-none">→</span>
                                </span>
                            </div>
                        </div>

                        {/* Card 5: Configurações */}
                        <div className="bg-white border-r border-b border-zinc-200 hover:bg-zinc-50 transition-all duration-300 p-10 flex flex-col group h-[320px] justify-between cursor-pointer" onClick={() => navigate('/admin/settings')}>
                            <div>
                                <div className="w-12 h-12 border border-zinc-200 flex items-center justify-center mb-8 group-hover:border-black transition-colors">
                                    <Settings className="w-5 h-5 text-zinc-400 group-hover:text-black transition-colors" />
                                </div>
                                <h3 className="text-lg font-black text-black mb-2 uppercase tracking-[0.2em]">Configurações</h3>
                                <p className="text-zinc-500 text-xxs uppercase tracking-widest font-bold">
                                    Usuários, equipe e ajustes do sistema.
                                </p>
                            </div>
                            <div className="flex justify-end">
                                <span className="text-xxs font-black uppercase tracking-[0.3em] text-zinc-400 group-hover:text-black transition-colors flex items-center gap-2">
                                    Acessar <span className="text-lg leading-none">→</span>
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </Section>
        </PageLayout>
    );
};

export default Dashboard;
