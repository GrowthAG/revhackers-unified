import { Target, Code, Crown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { createReiProject } from '@/api/reiProjects';
import { REIType } from '@/types/rei';
import PageLayout from '@/components/layout/PageLayout';
import Section from '@/components/ui/Section';

const ReiHubPage = () => {
    const navigate = useNavigate();
    const { toast } = useToast();
    const [creatingProject, setCreatingProject] = useState(false);

    const handleSelectType = async (type: REIType) => {
        setCreatingProject(true);

        try {
            // Criar projeto REI
            const project = await createReiProject({
                type: type,
                client_email: 'test@test.com',
                client_name: 'Test Client',
                analyst_email: 'analyst@test.com',
                status: 'pending',
                quarter: getCurrentQuarter(),
                year: new Date().getFullYear(),
                next_rei_date: getNextQuarterDate()
            });

            toast({
                title: "Projeto criado!",
                description: "Redirecionando para o diagnóstico...",
                className: "bg-revgreen border-none text-black"
            });

            // Redirecionar para wizard
            navigate(`/rei/wizard?projectId=${project.id}`);
        } catch (error) {
            console.error('Erro ao criar projeto:', error);
            toast({
                title: "Erro",
                description: "Não foi possível criar o projeto. Tente novamente.",
                variant: "destructive"
            });
        } finally {
            setCreatingProject(false);
        }
    };

    // Helper: Calcular quarter atual
    const getCurrentQuarter = (): 'Q1' | 'Q2' | 'Q3' | 'Q4' => {
        const month = new Date().getMonth() + 1;
        if (month <= 3) return 'Q1';
        if (month <= 6) return 'Q2';
        if (month <= 9) return 'Q3';
        return 'Q4';
    };

    // Helper: Calcular data do próximo quarter
    const getNextQuarterDate = (): string => {
        const now = new Date();
        const currentQuarter = getCurrentQuarter();
        const year = now.getFullYear();

        const quarterEndDates = {
            Q1: new Date(year, 2, 31),  // 31 de março
            Q2: new Date(year, 5, 30),  // 30 de junho
            Q3: new Date(year, 8, 30),  // 30 de setembro
            Q4: new Date(year, 11, 31)  // 31 de dezembro
        };

        return quarterEndDates[currentQuarter].toISOString();
    };

    return (
        <PageLayout>
            <Section variant="light" className="py-20 bg-white min-h-screen">
                <div className="container-custom">
                    {/* Header */}
                    <div className="mb-24 text-center">
                        <div className="w-20 h-1 bg-black mx-auto mb-8"></div>
                        <h1 className="text-5xl md:text-7xl font-black text-black mb-3 uppercase tracking-[0.2em]">
                            REI HUB
                        </h1>
                        <p className="text-xs text-zinc-500 uppercase tracking-[0.3em] font-bold">
                            Revenue Engine Intelligence
                        </p>
                    </div>

                    {/* REI Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-0 border-t border-l border-zinc-200 max-w-6xl mx-auto">
                        {/* Card 1: Consultoria */}
                        <div
                            onClick={() => !creatingProject && handleSelectType('consulting')}
                            className={`bg-white border-r border-b border-zinc-200 hover:bg-zinc-50 transition-all duration-300 p-10 flex flex-col group h-[320px] justify-between ${creatingProject ? 'opacity-50 cursor-wait' : 'cursor-pointer'}`}
                        >
                            <div>
                                <div className="w-12 h-12 border border-zinc-200 flex items-center justify-center mb-8 group-hover:border-black transition-colors">
                                    <Target className="w-5 h-5 text-zinc-400 group-hover:text-black transition-colors" />
                                </div>
                                <h3 className="text-lg font-black text-black mb-2 uppercase tracking-[0.2em]">Consultoria 360º</h3>
                                <p className="text-zinc-500 text-[10px] uppercase tracking-widest font-bold">
                                    Diagnóstico Completo
                                </p>
                            </div>
                            <div className="flex justify-end">
                                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400 group-hover:text-black transition-colors flex items-center gap-2">
                                    {creatingProject ? 'Criando...' : 'Iniciar'} <span className="text-lg leading-none">→</span>
                                </span>
                            </div>
                        </div>

                        {/* Card 2: Dev & Design */}
                        <div
                            onClick={() => !creatingProject && handleSelectType('dev')}
                            className={`bg-white border-r border-b border-zinc-200 hover:bg-zinc-50 transition-all duration-300 p-10 flex flex-col group h-[320px] justify-between ${creatingProject ? 'opacity-50 cursor-wait' : 'cursor-pointer'}`}
                        >
                            <div>
                                <div className="w-12 h-12 border border-zinc-200 flex items-center justify-center mb-8 group-hover:border-black transition-colors">
                                    <Code className="w-5 h-5 text-zinc-400 group-hover:text-black transition-colors" />
                                </div>
                                <h3 className="text-lg font-black text-black mb-2 uppercase tracking-[0.2em]">Dev Web & Design</h3>
                                <p className="text-zinc-500 text-[10px] uppercase tracking-widest font-bold">
                                    Briefing Técnico
                                </p>
                            </div>
                            <div className="flex justify-end">
                                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400 group-hover:text-black transition-colors flex items-center gap-2">
                                    {creatingProject ? 'Criando...' : 'Iniciar'} <span className="text-lg leading-none">→</span>
                                </span>
                            </div>
                        </div>

                        {/* Card 3: Founder Growth */}
                        <div
                            onClick={() => !creatingProject && handleSelectType('founder')}
                            className={`bg-white border-r border-b border-zinc-200 hover:bg-zinc-50 transition-all duration-300 p-10 flex flex-col group h-[320px] justify-between ${creatingProject ? 'opacity-50 cursor-wait' : 'cursor-pointer'}`}
                        >
                            <div>
                                <div className="w-12 h-12 border border-zinc-200 flex items-center justify-center mb-8 group-hover:border-black transition-colors">
                                    <Crown className="w-5 h-5 text-zinc-400 group-hover:text-black transition-colors" />
                                </div>
                                <h3 className="text-lg font-black text-black mb-2 uppercase tracking-[0.2em]">Founder Growth</h3>
                                <p className="text-zinc-500 text-[10px] uppercase tracking-widest font-bold">
                                    Personal Branding
                                </p>
                            </div>
                            <div className="flex justify-end">
                                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400 group-hover:text-black transition-colors flex items-center gap-2">
                                    {creatingProject ? 'Criando...' : 'Iniciar'} <span className="text-lg leading-none">→</span>
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </Section>
        </PageLayout>
    );
};

export default ReiHubPage;
