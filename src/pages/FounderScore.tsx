import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';
import { submitPublicDiagnostic } from "@/api/publicDiagnostic";
import { ArrowRight, Brain, Target, Users } from 'lucide-react';
import { DiagnosticLayout } from '@/components/diagnostics/DiagnosticLayout';
import { DiagnosticForm, DiagnosticFormData } from '@/components/diagnostics/DiagnosticForm';
import { ScoreGauge } from '@/components/diagnostics/ScoreGauge';
import { MetricCard } from '@/components/diagnostics/MetricCard';

// Questions centered on "Founder Maturity"
const QUESTIONS = [
    {
        id: 1,
        question: "Qual o seu nível de envolvimento operacional hoje?",
        options: [
            { label: "Totalmente estratégico (Apenas direção e cultura)", score: 20 },
            { label: "Híbrido (Estratégia + Vendas/Key Accounts)", score: 15 },
            { label: "Operacional (Apago incêndios diariamente)", score: 5 },
            { label: "Eu sou a operação (Eu faço tudo)", score: 0 }
        ]
    },
    {
        id: 2,
        question: "Como você toma decisões de crescimento?",
        options: [
            { label: "Baseado em dados e relatórios financeiros (DRE/Fluxo)", score: 20 },
            { label: "Mistura de dados básicos e intuição", score: 10 },
            { label: "Totalmente na intuição / Feeling de mercado", score: 5 },
            { label: "Sigo o que os concorrentes fazem", score: 0 }
        ]
    },
    {
        id: 3,
        question: "Qual sua clareza sobre o próximo nível de escala?",
        options: [
            { label: "Plano claro, metas definidas e recursos alocados", score: 20 },
            { label: "Sei onde quero chegar, mas não como", score: 10 },
            { label: "Tenho apenas metas de faturamento", score: 5 },
            { label: "Sobrevivendo um dia de cada vez", score: 0 }
        ]
    },
    {
        id: 4,
        question: "Sua estrutura de liderança atual:",
        options: [
            { label: "Líderes autônomos para cada área core", score: 20 },
            { label: "Alguns líderes, mas centralizo decisões finais", score: 10 },
            { label: "Não tenho líderes, apenas executores", score: 5 },
            { label: "Sócios operam tudo", score: 0 }
        ]
    },
    {
        id: 5,
        question: "Qual sua relação com o time de vendas?",
        options: [
            { label: "Acompanho indicadores semanas (cobrança de meta)", score: 20 },
            { label: "Participo de fechamentos complexos", score: 10 },
            { label: "Eu sou o melhor vendedor da empresa", score: 5 },
            { label: "Vendas acontecem passivamente (Indicação)", score: 0 }
        ]
    }
];

type Step = 'start' | 'questions' | 'lead-capture' | 'results';

const FounderScore = () => {
    const { toast } = useToast();
    const [step, setStep] = useState<Step>('start');
    const [currentQ, setCurrentQ] = useState(0);
    const [score, setScore] = useState(0);
    const [answers, setAnswers] = useState<number[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleAnswer = (optionScore: number) => {
        const newScore = score + optionScore;
        setScore(newScore);
        setAnswers([...answers, optionScore]);

        if (currentQ < QUESTIONS.length - 1) {
            setTimeout(() => setCurrentQ(prev => prev + 1), 250);
        } else {
            setStep('lead-capture');
        }
    };

    const handleFormSubmit = async (data: DiagnosticFormData) => {
        setIsSubmitting(true);
        try {
            const result = getResultMap(score);
            // Webhook for Founder Score (or generic)
            const WEBHOOK_URL = 'https://services.leadconnectorhq.com/hooks/oFTw9DcsKRUj6xCiq4mb/webhook-trigger/a35d7d7a-ad2b-47cc-920e-15f1837b6ec7';

            await submitPublicDiagnostic(
                { ...data, phone: '' },
                { answers },
                score,
                {
                    level: result.title,
                    description: result.msg,
                    action: "Agendar Call de Diagnóstico",
                    color: "revgreen"
                },
                WEBHOOK_URL
            );

            setStep('results');
            toast({
                className: "bg-zinc-900 border-zinc-800 text-white",
                title: "DIAGNÓSTICO PROCESSADO",
                description: "Análise de perfilFounder gerada."
            });
        } catch (error) {
            console.error(error);
            toast({
                variant: 'destructive',
                title: "Erro",
                description: "Tente novamente."
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const getResultMap = (s: number) => {
        if (s >= 80) return { title: "CEO Estrategista", msg: "Você opera como um CEO de verdade, focado no futuro e na cultura." };
        if (s >= 50) return { title: "CEO Híbrido", msg: "Você equilibra pratos entre operação e estratégia. O risco de burnout existe." };
        return { title: "CEO Operacional", msg: "Você é o gargalo. A empresa não cresce além da sua capacidade de horas." };
    };

    const result = getResultMap(score);

    if (step === 'start') {
        return (
            <DiagnosticLayout
                title="Diagnóstico Founder Led Sales"
                subtitle="Avalie se você é um CEO Estrategista ou um Gargalo Operacional."
                showGovernanceFooter={false}
                variant="light"
            >
                <div className="max-w-xl">
                    <div className="bg-zinc-50 border border-zinc-200 p-8 mb-8 rounded-lg">
                        <ul className="space-y-4">
                            <li className="flex items-start gap-3">
                                <Brain className="w-5 h-5 text-black mt-0.5" />
                                <div>
                                    <span className="text-black text-sm font-bold block">Mentalidade de Escala</span>
                                    <span className="text-zinc-600 text-xs">Estratégia vs. Operação</span>
                                </div>
                            </li>
                            <li className="flex items-start gap-3">
                                <Target className="w-5 h-5 text-black mt-0.5" />
                                <div>
                                    <span className="text-black text-sm font-bold block">Tomada de Decisão</span>
                                    <span className="text-zinc-600 text-xs">Dados vs. Intuição</span>
                                </div>
                            </li>
                            <li className="flex items-start gap-3">
                                <Users className="w-5 h-5 text-black mt-0.5" />
                                <div>
                                    <span className="text-black text-sm font-bold block">Liderança</span>
                                    <span className="text-zinc-600 text-xs">Centralização vs. Autonomia</span>
                                </div>
                            </li>
                        </ul>
                    </div>

                    <button
                        onClick={() => setStep('questions')}
                        className="w-full bg-black text-white hover:bg-zinc-800 h-14 font-bold tracking-[0.2em] uppercase text-xs transition-all flex items-center justify-center gap-2 rounded-none"
                    >
                        Iniciar Análise <ArrowRight className="w-4 h-4" />
                    </button>
                </div>
            </DiagnosticLayout>
        );
    }

    return (
        <DiagnosticLayout
            title="Diagnóstico Founder Led Sales"
            subtitle="Diagnóstico de Liderança"
            variant={step === 'results' ? 'dark' : 'light'}
        >
            {step === 'questions' && (
                <div className="max-w-3xl mx-auto">
                    <div className="mb-12">
                        <div className="flex justify-between items-end mb-4">
                            <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest">
                                Questão {currentQ + 1} de {QUESTIONS.length}
                            </span>
                            <span className="text-[10px] font-mono text-zinc-400">
                                {Math.round(((currentQ) / QUESTIONS.length) * 100)}%
                            </span>
                        </div>
                        <div className="w-full bg-zinc-100 h-px">
                            <motion.div
                                className="h-full bg-black"
                                initial={{ width: 0 }}
                                animate={{ width: `${((currentQ) / QUESTIONS.length) * 100}%` }}
                                transition={{ duration: 0.3 }}
                            />
                        </div>
                    </div>

                    <AnimatePresence mode='wait'>
                        <motion.div
                            key={currentQ}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.3 }}
                        >
                            <h2 className="text-2xl md:text-3xl font-medium text-black mb-12 leading-tight">
                                {QUESTIONS[currentQ].question}
                            </h2>

                            <div className="space-y-px bg-zinc-200 border border-zinc-200">
                                {QUESTIONS[currentQ].options.map((opt, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => handleAnswer(opt.score)}
                                        className="w-full text-left p-6 bg-white hover:bg-zinc-50 transition-colors flex items-center group"
                                    >
                                        <div className="w-8 h-8 flex items-center justify-center border border-zinc-200 text-zinc-400 text-xs mr-6 group-hover:border-black group-hover:text-black transition-colors rounded-sm">
                                            {String.fromCharCode(65 + idx)}
                                        </div>
                                        <span className="text-zinc-600 group-hover:text-black transition-colors text-sm md:text-base font-medium">
                                            {opt.label}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </motion.div>
                    </AnimatePresence>
                </div>
            )}

            {step === 'lead-capture' && (
                <DiagnosticForm
                    onSubmit={handleFormSubmit}
                    isSubmitting={isSubmitting}
                />
            )}

            {step === 'results' && (
                <div className="space-y-32">
                    {/* FOLD 01: DARK DASHBOARD */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch animate-in fade-in slide-in-from-bottom-4 duration-1000">
                        <div className="lg:col-span-4">
                            <ScoreGauge
                                score={score}
                                label="Maturidade Founder Led Sales"
                                description="Nível de pensamento estratégico."
                            />
                        </div>

                        <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-4">
                            <MetricCard
                                label="Operacional"
                                value={answers[0] > 10 ? "Baixo" : "Crítico"}
                                description="Envolvimento no Dia a Dia"
                                status={answers[0] > 10 ? 'success' : 'critical'}
                            />
                            <MetricCard
                                label="Data Driven"
                                value={answers[1] > 10 ? "Sim" : "Não"}
                                description="Uso de Dados"
                                status={answers[1] > 10 ? 'success' : 'warning'}
                            />
                            <MetricCard
                                label="Clareza"
                                value={answers[2] > 10 ? "Alta" : "Confusa"}
                                description="Plano de Longo Prazo"
                                status={answers[2] > 10 ? 'success' : 'warning'}
                            />
                            <MetricCard
                                label="Time"
                                value={answers[3] > 10 ? "Líderes" : "Executores"}
                                description="Senioridade da Equipe"
                                status={answers[3] > 10 ? 'success' : 'critical'}
                            />
                        </div>

                        <div className="lg:col-span-12 mt-8 p-8 border border-zinc-900 bg-zinc-950/40 backdrop-blur-sm">
                            <h3 className="text-[10px] font-black text-revgreen uppercase tracking-[0.3em] mb-6 border-b border-zinc-900 pb-4">
                                Análise de Gargalos Estratégicos
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                                <div>
                                    <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest mb-3 block">01. O Diagnóstico</span>
                                    <p className="text-zinc-300 leading-relaxed text-sm">
                                        Detectamos uma <span className="text-white font-bold">dependência crítica</span> da figura do fundador.
                                        A receita atual é frágil porque está centralizada no seu tempo e energia, criando um teto de vidro intransponível para escala.
                                    </p>
                                </div>
                                <div>
                                    <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest mb-3 block">02. Implicação</span>
                                    <p className="text-zinc-300 leading-relaxed text-sm">
                                        Empresas dependentes do fundador têm valuation 40% menor e são inegociáveis. Para escalar, precisamos <span className="text-white font-bold">industrializar o seu conhecimento</span> em processos de CRM e Automação.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* FOLD 02: WHITE MINIMALIST CTA & PREMISSAS */}
                    <div className="bg-white -mx-6 md:-mx-12 lg:-mx-24 px-6 md:px-12 lg:px-24 py-32 border-t border-zinc-100 animate-in fade-in duration-1000 delay-500">
                        <div className="max-w-5xl mx-auto space-y-24">

                            {/* Premissas Alinhadas Section */}
                            <section className="text-left">
                                <div className="inline-block bg-black text-white px-3 py-1 text-[9px] font-black uppercase tracking-[0.3em] mb-8">
                                    Premissas Alinhadas
                                </div>
                                <h2 className="text-3xl font-black text-zinc-900 tracking-tighter uppercase mb-12">
                                    O que descobrimos sobre sua <span className="text-zinc-400 text-2xl">operação.</span>
                                </h2>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-12">
                                    <div className="space-y-4">
                                        <h4 className="text-sm font-bold text-black uppercase tracking-tight flex items-center gap-2">
                                            <div className="w-1.5 h-1.5 bg-revgreen rounded-full" />
                                            Cultura de Dados
                                        </h4>
                                        <p className="text-zinc-500 text-sm leading-relaxed">
                                            Identificamos que a tomada de decisão ainda é centralizada na intuição do fundador. Para escalar sem quebrar, precisamos implementar dashboards de BI que falem a verdade em tempo real.
                                        </p>
                                    </div>
                                    <div className="space-y-4">
                                        <h4 className="text-sm font-bold text-black uppercase tracking-tight flex items-center gap-2">
                                            <div className="w-1.5 h-1.5 bg-revgreen rounded-full" />
                                            Industrialização de Vendas
                                        </h4>
                                        <p className="text-zinc-500 text-sm leading-relaxed">
                                            Seu time de vendas hoje opera de forma artesanal. O próximo passo é criar um "Playbook de Máquina" onde cada etapa do funil é orquestrada por automação, não por memória.
                                        </p>
                                    </div>
                                    <div className="space-y-4">
                                        <h4 className="text-sm font-bold text-black uppercase tracking-tight flex items-center gap-2">
                                            <div className="w-1.5 h-1.5 bg-revgreen rounded-full" />
                                            Gargalo do Fundador
                                        </h4>
                                        <p className="text-zinc-500 text-sm leading-relaxed">
                                            O CEO ainda é o maior "Growth Hacker" da empresa. Isso é um risco. Precisamos transferir essa inteligência para o CRM e sistemas de IA para liberar sua agenda para fusões e aquisições.
                                        </p>
                                    </div>
                                    <div className="space-y-4">
                                        <h4 className="text-sm font-bold text-black uppercase tracking-tight flex items-center gap-2">
                                            <div className="w-1.5 h-1.5 bg-revgreen rounded-full" />
                                            Infraestrutura Técnica
                                        </h4>
                                        <p className="text-zinc-500 text-sm leading-relaxed">
                                            Sua stack tecnológica atual possui pontos cegos de integração. Vamos unificar o fluxo de dados para que Mkt e Vendas joguem no mesmo time, com o mesmo placar.
                                        </p>
                                    </div>
                                </div>
                            </section>

                            {/* Final CTA Area */}
                            <div className="text-center space-y-12">
                                <div className="space-y-4">
                                    <span className="text-[10px] font-black text-revgreen uppercase tracking-[0.4em]">Próximos Passos Operacionais</span>
                                    <h2 className="text-4xl md:text-6xl font-black text-black tracking-tighter leading-tight">
                                        Construa seu plano <br className="hidden md:block" />
                                        <span className="text-zinc-400 text-3xl md:text-5xl">de 30 dias com o nosso time.</span>
                                    </h2>
                                    <p className="text-zinc-400 text-sm md:text-base max-w-xl mx-auto font-medium leading-relaxed font-mono">
                                        Sessão gratuita de Debriefing Estratégico para detalhamento desses 4 pilares.
                                    </p>
                                </div>

                                <div className="flex flex-col items-center gap-6">
                                    <a
                                        href="https://cal.com/revhackers/diagnostico"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="group relative px-12 py-6 bg-black text-white hover:bg-revgreen hover:text-black font-black uppercase tracking-[0.3em] text-[11px] transition-all duration-300 rounded-none overflow-hidden"
                                    >
                                        <span className="relative z-10 flex items-center gap-2">
                                            AGENDAR DEBRIEFING <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                        </span>
                                    </a>
                                    <div className="flex items-center gap-3 text-[9px] text-zinc-300 uppercase tracking-widest font-black">
                                        <span>Exclusivo para Founders</span>
                                        <div className="w-1 h-1 bg-zinc-200 rounded-full" />
                                        <span>Vagas Limitadas p/ Janeiro</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </DiagnosticLayout>
    );
};

export default FounderScore;
