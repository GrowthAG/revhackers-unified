import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';
import { submitPublicDiagnostic } from "@/api/publicDiagnostic";
import { ArrowRight, BarChart, DollarSign, Target, Briefcase } from 'lucide-react';
import { DiagnosticLayout } from '@/components/diagnostics/DiagnosticLayout';
import { DiagnosticForm, DiagnosticFormData } from '@/components/diagnostics/DiagnosticForm';
import { ScoreGauge } from '@/components/diagnostics/ScoreGauge';
import { MetricCard } from '@/components/diagnostics/MetricCard';

// Questions centered on "Revenue Maturity"
const QUESTIONS = [
    {
        id: 1,
        question: "Previsibilidade de Receita",
        options: [
            { label: "Receita Recorrente (MRR) domina o faturamento (>80%)", score: 20 },
            { label: "Misto entre recorrente e projetos pontuais", score: 10 },
            { label: "Dependente de grandes contratos sazonais", score: 5 },
            { label: "Venda única / Não previsível", score: 0 }
        ]
    },
    {
        id: 2,
        question: "Como é a estrutura do time comercial?",
        options: [
            { label: "Especializado (SDR, Closer, CS separados)", score: 20 },
            { label: "Vendedores fazem tudo (Prospecção ao Fechamento)", score: 10 },
            { label: "Apenas fundadores vendem", score: 0 },
            { label: "Não existe time comercial ativo", score: 0 }
        ]
    },
    {
        id: 3,
        question: "Qual sua taxa de conversão média (Leads -> Vendas)?",
        options: [
            { label: "Acima de 20% (Alta eficiência)", score: 20 },
            { label: "Entre 5% e 15% (Padrão de mercado)", score: 10 },
            { label: "Abaixo de 5% (Baixa eficiência)", score: 0 },
            { label: "Não monitoramos", score: 0 }
        ]
    },
    {
        id: 4,
        question: "Uso de CRM e Tecnologia",
        options: [
            { label: "CRM integrado com Marketing e Automação total", score: 20 },
            { label: "CRM usado apenas para registro básico", score: 10 },
            { label: "Planilhas ou Caderno", score: 0 },
            { label: "Nenhuma ferramenta", score: 0 }
        ]
    },
    {
        id: 5,
        question: "Ciclo de Vendas Médio",
        options: [
            { label: "Rápido (< 30 dias)", score: 20 },
            { label: "Médio (30-90 dias)", score: 10 },
            { label: "Longo (> 90 dias)", score: 5 },
            { label: "Imprevisível", score: 0 }
        ]
    }
];

type Step = 'start' | 'questions' | 'lead-capture' | 'results';

const RevenueScore = () => {
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
                { ...data, phone: '' },
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
        if (s >= 80) return { title: "Máquina de Receita", msg: "Operação madura, previsível e escalável." };
        if (s >= 50) return { title: "Em Construção", msg: "Existem processos, mas a dependência manual é alta." };
        return { title: "Risco Operacional", msg: "Falta de processos claros compromete o crescimento." };
    };

    const result = getResultMap(score);

    if (step === 'start') {
        return (
            <DiagnosticLayout
                title="Revenue Score"
                subtitle="Diagnóstico de Maturidade Comercial e Previsibilidade."
                showGovernanceFooter={false}
                variant="light"
            >
                <div className="max-w-xl">
                    <div className="bg-zinc-50 border border-zinc-200 p-8 mb-8 rounded-lg">
                        <ul className="space-y-4">
                            <li className="flex items-start gap-3">
                                <DollarSign className="w-5 h-5 text-black mt-0.5" />
                                <div>
                                    <span className="text-black text-sm font-bold block">Qualidade de Receita</span>
                                    <span className="text-zinc-600 text-xs">Recorrência vs pontual</span>
                                </div>
                            </li>
                            <li className="flex items-start gap-3">
                                <Target className="w-5 h-5 text-black mt-0.5" />
                                <div>
                                    <span className="text-black text-sm font-bold block">Eficiência de Funil</span>
                                    <span className="text-zinc-600 text-xs">Taxas de conversão e ciclo de vendas</span>
                                </div>
                            </li>
                            <li className="flex items-start gap-3">
                                <Briefcase className="w-5 h-5 text-black mt-0.5" />
                                <div>
                                    <span className="text-black text-sm font-bold block">Estrutura de Time</span>
                                    <span className="text-zinc-600 text-xs">Especialização e indicadores</span>
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
            title="Revenue Score"
            subtitle="Diagnóstico de Maturidade Comercial"
            variant={step === 'results' ? 'dark' : 'light'}
            centered={step !== 'results'}
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
                <div className="animate-in fade-in duration-700">
                    {/* First Fold: Metrics Dashboard */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch mb-32">
                        {/* Left Column: Synthetic Score */}
                        <div className="lg:col-span-4">
                            <ScoreGauge
                                score={score}
                                label="Maturidade Comercial"
                                description="Índice de eficiência de receita."
                            />
                        </div>

                        {/* Right Column: Detailed Breakdown */}
                        <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-4">
                            <MetricCard
                                label="Previsibilidade"
                                value={answers[0] > 10 ? "Alta" : "Variável"}
                                description="Recorrência de Receita"
                                status={answers[0] > 10 ? 'success' : 'warning'}
                            />
                            <MetricCard
                                label="Eficiência"
                                value={answers[2] > 10 ? ">20%" : "<5%"}
                                description="Taxa de Conversão"
                                status={answers[2] > 10 ? 'success' : 'critical'}
                            />
                            <MetricCard
                                label="Estrutura"
                                value={answers[1] === 20 ? "Espec." : "Genérica"}
                                description="Especialização do Time"
                                status={answers[1] > 10 ? 'success' : 'warning'}
                            />
                            <MetricCard
                                label="Tecnologia"
                                value={answers[3] > 10 ? "CRM+" : "Manual"}
                                description="Stack de Vendas"
                                status={answers[3] > 10 ? 'success' : 'critical'}
                            />
                        </div>
                    </div>

                    {/* Second Fold: High-Conversion CTA */}
                    <div className="border-t border-zinc-900 pt-24 pb-12">
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
                            <div className="lg:col-span-7">
                                <span className="text-revgreen font-mono text-xs uppercase tracking-[0.2em] mb-4 block">
                                    Próximos Passos
                                </span>
                                <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
                                    Transforme esse diagnóstico em <span className="text-zinc-500">plano de ação.</span>
                                </h2>
                                <p className="text-lg text-zinc-400 font-light leading-relaxed mb-8 max-w-xl">
                                    Dados sem ação são apenas números. Nossa equipe de engenharia de receita pode auditar esses pontos cegos e implementar a infraestrutura necessária em 30 dias.
                                </p>

                                <ul className="space-y-4 mb-10">
                                    <li className="flex items-center gap-3 text-zinc-300">
                                        <div className="w-1.5 h-1.5 bg-revgreen rounded-full" />
                                        <span>Auditoria profunda do seu CRM e processos.</span>
                                    </li>
                                    <li className="flex items-center gap-3 text-zinc-300">
                                        <div className="w-1.5 h-1.5 bg-revgreen rounded-full" />
                                        <span>Definição de metas de conversão realistas.</span>
                                    </li>
                                    <li className="flex items-center gap-3 text-zinc-300">
                                        <div className="w-1.5 h-1.5 bg-revgreen rounded-full" />
                                        <span>Roadmap técnico de implementação.</span>
                                    </li>
                                </ul>

                                <a
                                    href="https://cal.com/revhackers/diagnostico"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-3 bg-revgreen text-black px-8 py-5 rounded-sm font-bold uppercase tracking-wider hover:bg-white hover:scale-105 transition-all duration-300 text-sm"
                                >
                                    Agendar Debriefing
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                                </a>
                                <p className="text-zinc-600 text-xs mt-4">
                                    * Sessão gratuita de 30min para qualificação.
                                </p>
                            </div>

                            {/* Visual/Trust Element */}
                            <div className="lg:col-span-5 bg-zinc-900/50 border border-zinc-800 p-8 rounded-sm relative overflow-hidden group hover:border-zinc-700 transition-colors">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-revgreen/10 rounded-full blur-[80px] pointer-events-none" />

                                <h3 className="text-xl font-bold text-white mb-2">Engenharia de Receita</h3>
                                <p className="text-zinc-500 text-sm mb-8">Nossa metodologia proprietária.</p>

                                <div className="space-y-6">
                                    <div className="flex justify-between items-center border-b border-zinc-800 pb-4">
                                        <span className="text-zinc-400 text-sm">Design de Processos</span>
                                        <span className="text-revgreen font-mono text-xs">V2.0</span>
                                    </div>
                                    <div className="flex justify-between items-center border-b border-zinc-800 pb-4">
                                        <span className="text-zinc-400 text-sm">Automação & IA</span>
                                        <span className="text-revgreen font-mono text-xs">ACTIVE</span>
                                    </div>
                                    <div className="flex justify-between items-center border-b border-zinc-800 pb-4">
                                        <span className="text-zinc-400 text-sm">Data Warehouse</span>
                                        <span className="text-revgreen font-mono text-xs">CONNECTED</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </DiagnosticLayout >
    );
};

export default RevenueScore;
