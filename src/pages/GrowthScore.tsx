import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, TrendingUp, BarChart, Users2, Database, DollarSign } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { submitPublicDiagnostic } from "@/api/publicDiagnostic";
import { DiagnosticLayout } from '@/components/diagnostics/DiagnosticLayout';
import { DiagnosticForm, DiagnosticFormData } from '@/components/diagnostics/DiagnosticForm';
import { ScoreGauge } from '@/components/diagnostics/ScoreGauge';
import { MetricCard } from '@/components/diagnostics/MetricCard';

// Questions centered on "Growth Maturity"
const QUESTIONS = [
    {
        id: 1,
        question: "Como você define sua estratégia de aquisição hoje?",
        options: [
            { label: "Previsível e multicanal (Inbound + Outbound + Ads)", score: 20 },
            { label: "Dependente de um único canal (Ex: só Ads ou só Indicação)", score: 10 },
            { label: "Oscilante, sem processos claros", score: 5 },
            { label: "Passiva (espero o cliente vir)", score: 0 }
        ]
    },
    {
        id: 2,
        question: "Você sabe exatamente quanto paga por um cliente (CAC)?",
        options: [
            { label: "Sim, por canal e acompanho semanalmente", score: 20 },
            { label: "Tenho uma média geral", score: 10 },
            { label: "Tenho uma ideia, mas não meço", score: 5 },
            { label: "Não faço ideia", score: 0 }
        ]
    },
    {
        id: 3,
        question: "Como é seu processo de vendas?",
        options: [
            { label: "CRM estruturado com etapas, playbooks e automação", score: 20 },
            { label: "Uso CRM, mas depende muito do vendedor", score: 10 },
            { label: "Uso planilhas ou controle manual", score: 5 },
            { label: "Não tenho processo definido", score: 0 }
        ]
    },
    {
        id: 4,
        question: "Sua retenção (LTV) é monitorada?",
        options: [
            { label: "Sim, temos ações ativas de CS e upsell", score: 20 },
            { label: "Acompanhamos apenas o Churn (cancelamentos)", score: 10 },
            { label: "Só percebemos quando o cliente sai", score: 5 },
            { label: "Não monitoramos", score: 0 }
        ]
    },
    {
        id: 5,
        question: "Seu time de Growth/Marketing tem metas de receita?",
        options: [
            { label: "Sim, respondem por pipeline e receita gerada", score: 20 },
            { label: "Respondem por Leads/MQLs", score: 10 },
            { label: "Respondem por atividades (posts, emails)", score: 5 },
            { label: "Não têm metas claras", score: 0 }
        ]
    }
];

type Step = 'start' | 'questions' | 'lead-capture' | 'results';

const GrowthScore = () => {
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
            // Default Webhook Layout
            const WEBHOOK_URL = 'https://services.leadconnectorhq.com/hooks/oFTw9DcsKRUj6xCiq4mb/webhook-trigger/a35d7d7a-ad2b-47cc-920e-15f1837b6ec7';

            await submitPublicDiagnostic(
                { ...data, phone: '' }, // No phone collected
                { answers },
                score,
                {
                    level: result.title,
                    description: result.msg
                },
                WEBHOOK_URL
            );

            setStep('results');
            toast({
                className: "bg-zinc-900 border-zinc-800 text-white",
                title: "DIAGNÓSTICO PROCESSADO",
                description: "Seu relatório oficial foi gerado."
            });
        } catch (error) {
            console.error(error);
            toast({
                variant: 'destructive',
                title: "Erro de Processamento",
                description: "Tente novamente."
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const getResultMap = (s: number) => {
        if (s >= 80) return { title: "Growth Machine", msg: "Operação madura e escalável." };
        if (s >= 50) return { title: "Tração Manual", msg: "Crescimento depende de esforço excessivo." };
        return { title: "Estágio Inicial", msg: "Processos fundamentais ausentes." };
    };

    const result = getResultMap(score);

    // Initial Start Screen using Shared Layout structure but custom content for Landing
    if (step === 'start') {
        return (
            <DiagnosticLayout
                title="Growth Maturity Score"
                subtitle="Avaliação técnica de processos de aquisição, retenção e dados."
                showGovernanceFooter={false}
                variant="light"
            >
                <div className="max-w-xl">
                    <div className="bg-zinc-50 border border-zinc-200 p-8 mb-8 rounded-lg">
                        <ul className="space-y-4">
                            <li className="flex items-start gap-3">
                                <TrendingUp className="w-5 h-5 text-black mt-0.5" />
                                <div>
                                    <span className="text-black text-sm font-bold block">Aquisição & Canais</span>
                                    <span className="text-zinc-600 text-xs">Dependência vs. Multicanalidade</span>
                                </div>
                            </li>
                            <li className="flex items-start gap-3">
                                <Database className="w-5 h-5 text-black mt-0.5" />
                                <div>
                                    <span className="text-black text-sm font-bold block">Maturidade de Dados</span>
                                    <span className="text-zinc-600 text-xs">CAC, LTV e Atribuição</span>
                                </div>
                            </li>
                            <li className="flex items-start gap-3">
                                <Users2 className="w-5 h-5 text-black mt-0.5" />
                                <div>
                                    <span className="text-black text-sm font-bold block">Alinhamento de Time</span>
                                    <span className="text-zinc-600 text-xs">Metas de Receita vs. Vaidade</span>
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
            title="Growth Maturity Score"
            subtitle="Avaliação técnica de processos de aquisição, retenção e dados."
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
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch animate-in fade-in duration-700">
                    {/* Left Column: Synthetic Score */}
                    <div className="lg:col-span-4">
                        <ScoreGauge
                            score={score}
                            label="Maturidade de Growth"
                            description="Índice sintético baseado nas respostas declaradas."
                        />
                    </div>

                    {/* Right Column: Detailed Breakdown */}
                    <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-4">
                        <MetricCard
                            label="Processo de Vendas"
                            value={answers[2] > 10 ? "Estruturado" : "Ad-Hoc"}
                            description="Nível de Automação"
                            status={answers[2] > 10 ? 'success' : 'critical'}
                        />
                        <MetricCard
                            label="Analytcs & Dados"
                            value={answers[1] > 10 ? "Clear" : "Dark"}
                            description="Visibilidade de CAC"
                            status={answers[1] > 10 ? 'success' : 'warning'}
                        />
                        <MetricCard
                            label="Arquitetura de Canais"
                            value={answers[0] > 10 ? "Omni" : "Single"}
                            description="Dependência"
                            status={answers[0] > 10 ? 'success' : 'warning'}
                        />
                        <MetricCard
                            label="Retenção"
                            value={answers[3] > 10 ? "Ativa" : "Passiva"}
                            description="Estratégia de LTV"
                            status={answers[3] > 10 ? 'success' : 'critical'}
                        />
                    </div>

                    <div className="lg:col-span-12 mt-8 p-8 border border-zinc-900 bg-zinc-950/50">
                        <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-6 border-b border-zinc-800 pb-4">
                            Diagnóstico de Motor de Crescimento
                        </h3>

                        <div className="space-y-8">
                            <div>
                                <span className="text-xs font-mono text-red-500 uppercase tracking-widest mb-2 block">
                                    01. O Problema Real
                                </span>
                                <p className="text-zinc-300 leading-relaxed text-sm md:text-base">
                                    Sua operação de crescimento carece de <strong className="text-white">previsibilidade científica</strong>.
                                    Você vive de "picos e vales", dependendo de indicação, sorte ou esforço heróico para bater meta.
                                    Sem um motor de aquisição validado, você não controla seu destino—o mercado controla você.
                                </p>
                            </div>

                            <div>
                                <span className="text-xs font-mono text-red-500 uppercase tracking-widest mb-2 block">
                                    02. O Custo da Incerteza
                                </span>
                                <p className="text-zinc-300 leading-relaxed text-sm md:text-base">
                                    A falta de previsibilidade impede investimentos ousados e contratações de peso.
                                    Você está deixando dinheiro na mesa todos os meses por não ter um sistema que transforma R$ 1,00 investido em R$ 5,00 retornados de forma consistente.
                                </p>
                            </div>

                            <div className="pt-6 border-t border-zinc-900 flex flex-col items-center">
                                <p className="text-zinc-400 text-xs mb-4 uppercase tracking-widest">Solução Definitiva</p>
                                <a
                                    href="https://cal.com/revhackers/diagnostico"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="bg-revgreen text-black px-8 py-4 rounded-sm font-bold uppercase tracking-wider hover:bg-white transition-all text-sm w-full md:w-auto text-center"
                                >
                                    Construir Máquina de Vendas
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </DiagnosticLayout>
    );
};

export default GrowthScore;
