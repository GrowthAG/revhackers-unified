import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle2, ArrowRight, LayoutDashboard, Target, Database, BrainCircuit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import PageLayout from '@/components/layout/PageLayout';
import Section from '@/components/ui/Section';

const SchedulingSuccess = () => {
    const navigate = useNavigate();

    return (
        <PageLayout>
            <Section variant="light" className="min-h-screen bg-white flex items-center justify-center py-20">
                <div className="container-custom max-w-4xl mx-auto">

                    {/* Hero Confirmation */}
                    <div className="text-center mb-16 animate-in fade-in slide-in-from-bottom-4 duration-700">
                        <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
                            <CheckCircle2 className="w-10 h-10 text-green-600" />
                        </div>
                        <h1 className="text-4xl md:text-5xl font-black text-black tracking-tighter mb-4">
                            Agendamento Confirmado
                        </h1>
                        <p className="text-xl text-zinc-500 max-w-2xl mx-auto leading-relaxed">
                            Sua sessão de Planejamento Estratégico está reservada. Nossos consultores já estão analisando seus dados.
                        </p>
                    </div>

                    {/* Educational / Connection Section */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-16">
                        <div className="bg-zinc-50 p-8 border border-zinc-200 rounded-sm">
                            <h3 className="text-lg font-black uppercase tracking-wide mb-6 flex items-center gap-2">
                                <BrainCircuit className="w-5 h-5" /> Por que pedimos tantos dados?
                            </h3>
                            <div className="space-y-6">
                                <div className="flex gap-4">
                                    <div className="w-10 h-10 bg-white border border-zinc-200 flex items-center justify-center shrink-0">
                                        <Database className="w-5 h-5 text-zinc-400" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-sm uppercase tracking-wide mb-1">Diagnóstico de GTM</h4>
                                        <p className="text-xs text-zinc-500 leading-relaxed">
                                            Suas respostas sobre funil, canais e vendas alimentam nossa matriz de Go-To-Market. Identificamos gargalos invisíveis antes da reunião.
                                        </p>
                                    </div>
                                </div>
                                <div className="flex gap-4">
                                    <div className="w-10 h-10 bg-white border border-zinc-200 flex items-center justify-center shrink-0">
                                        <Target className="w-5 h-5 text-zinc-400" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-sm uppercase tracking-wide mb-1">Personalização do Plano</h4>
                                        <p className="text-xs text-zinc-500 leading-relaxed">
                                            Não usamos templates genéricos. O "Raio-X de Receita" gerado define exatamente quais estratégias (ABM, Inbound, Outbound) funcionam para <strong>seu</strong> ICP.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="relative">
                            <div className="absolute top-0 left-0 w-full h-full bg-zinc-100 -z-10 rounded-full blur-3xl opacity-50"></div>
                            <h3 className="text-3xl font-bold tracking-tight mb-4">
                                O que acontece agora?
                            </h3>
                            <p className="text-zinc-600 mb-8 leading-relaxed">
                                Na reunião, não perderemos tempo com perguntas básicas. Iremos direto para a apresentação do seu <strong>Roadmap de Crescimento</strong>, desenhado com base nos inputs que você forneceu.
                            </p>

                            <div className="p-4 bg-black text-white text-sm font-medium leading-relaxed mb-8 border-l-4 border-revgreen">
                                "Dados sem contexto são ruído. Dados com estratégia são lucro."
                            </div>

                            <Button
                                onClick={() => navigate('/rei')}
                                className="bg-black hover:bg-zinc-800 text-white rounded-none px-8 py-6 uppercase tracking-widest font-bold text-xs w-full md:w-auto"
                            >
                                Voltar para o Hub <LayoutDashboard className="ml-2 w-4 h-4" />
                            </Button>
                        </div>
                    </div>

                </div>
            </Section>
        </PageLayout>
    );
};

export default SchedulingSuccess;
