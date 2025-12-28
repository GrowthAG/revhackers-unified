import { Target, Code, Crown, ArrowRight, ArrowLeft } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { createReiProject } from '@/api/reiProjects';
import { REIType } from '@/types/rei';
import PageLayout from '@/components/layout/PageLayout';
import Section from '@/components/ui/Section';
import { useAuth } from '@/contexts/AuthContext';
import { motion } from 'framer-motion';

const ReiHubPage = () => {
    const navigate = useNavigate();
    const { toast } = useToast();
    const { user, userProfile } = useAuth(); // Get user context for header
    const [creatingProject, setCreatingProject] = useState(false);
    const [firstName, setFirstName] = useState<string>('');

    // Set first name for header
    useEffect(() => {
        if (userProfile?.full_name) {
            const first = userProfile.full_name.split(' ')[0];
            setFirstName(first);
        } else if (user?.email) {
            const emailName = user.email.split('@')[0];
            setFirstName(emailName);
        }
    }, [user, userProfile]);

    const handleSelectType = async (type: REIType) => {
        setCreatingProject(true);

        try {
            // Criar projeto REI
            const project = await createReiProject({
                type: type,
                client_email: user?.email || 'test@test.com', // Use logged user email or fallback
                client_name: userProfile?.full_name || 'Test Client',
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

    // Animation variants matching Admin Hub
    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const itemAnim = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 }
    };

    return (
        <PageLayout>
            <div className="min-h-screen bg-white pt-40 pb-20 relative overflow-hidden">
                {/* Decorative Background Elements */}
                <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:24px_24px] opacity-20 pointer-events-none" />

                <div className="container-custom max-w-6xl mx-auto relative z-10">

                    {/* Header - Unified with Admin Hub */}
                    <div className="flex flex-col md:flex-row justify-between items-end mb-12 border-b border-black/10 pb-8">
                        <div>
                            <div className="flex items-center gap-3 mb-4">
                                <Link to="/admin" className="flex items-center gap-2 group cursor-pointer transition-colors">
                                    <div className="w-8 h-8 rounded-full bg-zinc-100 border border-zinc-200 flex items-center justify-center group-hover:border-black group-hover:bg-black transition-all">
                                        <ArrowLeft className="w-4 h-4 text-zinc-400 group-hover:text-white transition-colors" />
                                    </div>
                                    <span className="text-[10px] uppercase tracking-widest font-bold text-zinc-400 group-hover:text-black transition-colors">Voltar ao Hub</span>
                                </Link>
                            </div>
                            <h1 className="text-3xl md:text-4xl font-black text-black tracking-tighter uppercase leading-none">
                                REI <span className="text-zinc-400">HUB</span>
                            </h1>
                            <p className="text-zinc-400 text-sm font-medium mt-4 tracking-wide uppercase">
                                Revenue Engine Intelligence
                            </p>
                        </div>
                        <div className="flex flex-col items-end mt-6 md:mt-0">
                            <p className="text-right text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-400 mb-1">
                                Logado como
                            </p>
                            <p className="text-xl font-bold text-black border-l-2 border-revgreen pl-4">
                                {firstName}
                            </p>
                        </div>
                    </div>

                    {/* REI Cards - Updated Grid & Motion */}
                    <motion.div
                        variants={container}
                        initial="hidden"
                        animate="show"
                        className="grid grid-cols-1 md:grid-cols-3 gap-6"
                    >
                        {/* Card 1: Consultoria */}
                        <motion.div
                            variants={itemAnim}
                            whileHover={{ y: -4, transition: { duration: 0.2 } }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => !creatingProject && handleSelectType('consulting')}
                            className={`group bg-white p-10 relative border border-zinc-100 hover:border-black transition-colors duration-300 z-0 hover:z-10 hover:shadow-xl shadow-sm flex flex-col justify-between h-[340px] ${creatingProject ? 'opacity-50 cursor-wait' : 'cursor-pointer'}`}
                        >
                            <div>
                                <div className="w-14 h-14 bg-zinc-50 border border-zinc-100 flex items-center justify-center group-hover:bg-black group-hover:border-black transition-all duration-300 mb-8">
                                    <Target className="w-6 h-6 text-zinc-400 group-hover:text-white transition-colors duration-300" />
                                </div>
                                <h3 className="text-xl font-black text-black mb-3 uppercase tracking-tight group-hover:translate-x-1 transition-transform duration-300">Consultoria 360º</h3>
                                <p className="text-xs text-zinc-400 font-medium uppercase tracking-widest leading-relaxed group-hover:text-zinc-600 transition-colors">
                                    Diagnóstico Completo
                                </p>
                            </div>
                            <div className="relative mt-auto flex justify-end">
                                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400 group-hover:text-black transition-colors flex items-center gap-2">
                                    {creatingProject ? 'Criando...' : 'Iniciar'} <ArrowRight className="w-4 h-4" />
                                </span>
                            </div>
                        </motion.div>

                        {/* Card 2: Dev & Design */}
                        <motion.div
                            variants={itemAnim}
                            whileHover={{ y: -4, transition: { duration: 0.2 } }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => !creatingProject && handleSelectType('dev')}
                            className={`group bg-white p-10 relative border border-zinc-100 hover:border-black transition-colors duration-300 z-0 hover:z-10 hover:shadow-xl shadow-sm flex flex-col justify-between h-[340px] ${creatingProject ? 'opacity-50 cursor-wait' : 'cursor-pointer'}`}
                        >
                            <div>
                                <div className="w-14 h-14 bg-zinc-50 border border-zinc-100 flex items-center justify-center group-hover:bg-black group-hover:border-black transition-all duration-300 mb-8">
                                    <Code className="w-6 h-6 text-zinc-400 group-hover:text-white transition-colors duration-300" />
                                </div>
                                <h3 className="text-xl font-black text-black mb-3 uppercase tracking-tight group-hover:translate-x-1 transition-transform duration-300">Dev Web & Design</h3>
                                <p className="text-xs text-zinc-400 font-medium uppercase tracking-widest leading-relaxed group-hover:text-zinc-600 transition-colors">
                                    Briefing Técnico
                                </p>
                            </div>
                            <div className="relative mt-auto flex justify-end">
                                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400 group-hover:text-black transition-colors flex items-center gap-2">
                                    {creatingProject ? 'Criando...' : 'Iniciar'} <ArrowRight className="w-4 h-4" />
                                </span>
                            </div>
                        </motion.div>

                        {/* Card 3: Founder Growth */}
                        <motion.div
                            variants={itemAnim}
                            whileHover={{ y: -4, transition: { duration: 0.2 } }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => !creatingProject && handleSelectType('founder')}
                            className={`group bg-white p-10 relative border border-zinc-100 hover:border-black transition-colors duration-300 z-0 hover:z-10 hover:shadow-xl shadow-sm flex flex-col justify-between h-[340px] ${creatingProject ? 'opacity-50 cursor-wait' : 'cursor-pointer'}`}
                        >
                            <div>
                                <div className="w-14 h-14 bg-zinc-50 border border-zinc-100 flex items-center justify-center group-hover:bg-black group-hover:border-black transition-all duration-300 mb-8">
                                    <Crown className="w-6 h-6 text-zinc-400 group-hover:text-white transition-colors duration-300" />
                                </div>
                                <h3 className="text-xl font-black text-black mb-3 uppercase tracking-tight group-hover:translate-x-1 transition-transform duration-300">Founder Growth</h3>
                                <p className="text-xs text-zinc-400 font-medium uppercase tracking-widest leading-relaxed group-hover:text-zinc-600 transition-colors">
                                    Personal Branding
                                </p>
                            </div>
                            <div className="relative mt-auto flex justify-end">
                                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400 group-hover:text-black transition-colors flex items-center gap-2">
                                    {creatingProject ? 'Criando...' : 'Iniciar'} <ArrowRight className="w-4 h-4" />
                                </span>
                            </div>
                        </motion.div>
                    </motion.div>
                </div>
            </div>
        </PageLayout>
    );
};

export default ReiHubPage;
