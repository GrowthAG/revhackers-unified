import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';
import { submitPublicDiagnostic } from "@/api/publicDiagnostic";
import { ArrowRight, BarChart, DollarSign, Target, Briefcase, TrendingUp, Users } from 'lucide-react';
import { DiagnosticLayout } from '@/components/diagnostics/DiagnosticLayout';
import { DiagnosticForm, DiagnosticFormData } from '@/components/diagnostics/DiagnosticForm';
import { ScoreGauge } from '@/components/diagnostics/ScoreGauge';
import { MetricCard } from '@/components/diagnostics/MetricCard';
import { DiagnosticActionSection } from '@/components/diagnostics/DiagnosticActionSection';
import { CallDiagnosticModal } from '@/components/diagnostics/CallDiagnosticModal';
import { getDiagnosticInsights } from '@/utils/diagnosticMapping';

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
        ],
        log: "A previsibilidade reduz drasticamente o risco do Equity."
    },
    {
        id: 2,
        question: "Como é a estrutura do time comercial?",
        options: [
            { label: "Especializado (SDR, Closer, CS separados)", score: 20 },
            { label: "Vendedores fazem tudo (Prospecção ao Fechamento)", score: 10 },
            { label: "Apenas fundadores vendem", score: 0 },
            { label: "Não existe time comercial ativo", score: 0 }
        ],
        log: "Especialização é o primeiro passo para escalar vendas outbound."
    },
    {
        id: 3,
        question: "Qual sua taxa de conversão média (Leads -> Vendas)?",
        options: [
            { label: "Acima de 20% (Alta eficiência)", score: 20 },
            { label: "Entre 5% e 15% (Padrão de mercado)", score: 10 },
            { label: "Abaixo de 5% (Baixa eficiência)", score: 0 },
            { label: "Não monitoramos", score: 0 }
        ],
        log: "Conversão baixa indica problemas de qualificação ou oferta."
    },
    {
        id: 4,
        question: "Uso de CRM e Tecnologia",
        options: [
            { label: "CRM integrado com Marketing e Automação total", score: 20 },
            { label: "CRM usado apenas para registro básico", score: 10 },
            { label: "Planilhas ou Caderno", score: 0 },
            { label: "Nenhuma ferramenta", score: 0 }
        ],
        log: "Sem CRM integrado, seus dados estão desconexos e inoperantes."
    },
    {
        id: 5,
        question: "Ciclo de Vendas Médio",
        options: [
            { label: "Rápido (< 30 dias)", score: 20 },
            { label: "Médio (30-90 dias)", score: 10 },
            { label: "Longo (> 90 dias)", score: 5 },
            { label: "Imprevisível", score: 0 }
        ],
        log: "Ciclos longos sem nutrição automatizada geram 'Pipeline Fantasma'."
    }
];

type Step = 'start' | 'questions' | 'lead-capture' | 'results';

const RevenueScore = () => {
    const { toast } = useToast();
    const [step, setStep] = useState<Step>('questions');
    const [currentQ, setCurrentQ] = useState(0);
    const [score, setScore] = useState(0);
    const [answers, setAnswers] = useState<number[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
    const [selectedOption, setSelectedOption] = useState<number | null>(null);
    const [showLog, setShowLog] = useState(false);
    const insights = getDiagnosticInsights('revenue', score);
    const currentQData = QUESTIONS[currentQ];

    const [hasSubmittedLead, setHasSubmittedLead] = useState(false);

    // Estado do Protocolo e Logs
    const handleAnswer = (optionScore: number, optionIdx: number) => {
        if (selectedOption !== null) return;
        setSelectedOption(optionIdx);
        setShowLog(true);

        const newScore = score + optionScore;
        setScore(newScore);
        setAnswers([...answers, optionScore]);

        setTimeout(() => {
            if (currentQ < QUESTIONS.length - 1) {
                setShowLog(false);
                setSelectedOption(null);
                setCurrentQ(prev => prev + 1);
            } else {
                setStep('results');
            }
        }, 2000);
    };

    const handleFormSubmit = async (data: DiagnosticFormData) => {
        setIsSubmitting(true);
        try {
            const resultMap = getResultMap(score);
            // Default Webhook Layout
            const WEBHOOK_URL = 'https://services.leadconnectorhq.com/hooks/oFTw9DcsKRUj6xCiq4mb/webhook-trigger/a35d7d7a-ad2b-47cc-920e-15f1837b6ec7';

            await submitPublicDiagnostic(
                { ...data, phone: '' },
                { answers, source: 'revenue-score' },
                score,
                {
                    level: resultMap.title,
                    description: resultMap.msg,
                    action: "Diagnóstico de Receita",
                    color: "revgreen"
                },
                WEBHOOK_URL
            );

            setHasSubmittedLead(true);
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
        if (s >= 50) return { title: "Em Construção", msg: "Existent processos, mas a dependência manual é alta." };
        return { title: "Risco Operacional", msg: "Falta de processos claros compromete o crescimento." };
    };

    const resultMap = getResultMap(score);
    const teaserScore = score;

    return (
        <DiagnosticLayout
            title={step === 'results' ? "" : "Revenue Score"}
            subtitle={step === 'results' ? "" : "Diagnóstico de Eficiência de Receita (RevOps)"}
            variant={step === 'results' ? 'dark' : 'light'}
            centered={step === 'results'}
            hideHeader={step === 'results'}
            headerVariant={step === 'results' ? 'default' : 'light'}
        >
            {/* BACKDROP DE SEGURANÇA */}
            {step === 'results' && <div className="fixed inset-0 bg-black -z-50 pointer-events-none" />}

            {step === 'questions' && (
                <div className="max-w-4xl animate-fade-in w-full mx-auto">
                    <div className="space-y-6">
                        <div className="flex justify-between items-center text-[10px] font-mono text-zinc-400 uppercase tracking-widest font-black border-b border-zinc-100 pb-2">
                            <span>Questão {currentQ + 1} de {QUESTIONS.length}</span>
                            <span>ID: 0{currentQ + 1}</span>
                        </div>

                        <div className="space-y-6 relative">
                            <h2 className="text-3xl md:text-4xl font-black text-black tracking-tighter leading-tight">
                                {QUESTIONS[currentQ].question}
                            </h2>

                            <div className="grid grid-cols-1 gap-3 max-w-xl mx-auto">
                                {currentQData.options.map((opt, idx) => (
                                    <button
                                        key={idx}
                                        disabled={selectedOption !== null}
                                        onClick={() => handleAnswer(opt.score, idx)}
                                        className={`group relative flex items-center gap-5 p-5 text-left transition-all duration-300 rounded-xl border ${selectedOption === idx
                                            ? "bg-[#03FC3B] text-black border-[#03FC3B] shadow-[0_0_15px_rgba(3,252,59,0.4)] scale-[1.02]"
                                            : "bg-white border-zinc-200 text-zinc-900 hover:border-black hover:text-black hover:shadow-md"
                                            } ${selectedOption !== null && selectedOption !== idx ? "opacity-40" : "opacity-100"}`}
                                    >
                                        <div className={`w-6 h-6 flex items-center justify-center text-[10px] font-mono font-bold border rounded transition-colors ${selectedOption === idx
                                            ? "bg-white text-black border-white"
                                            : "bg-zinc-50 border-zinc-100 text-zinc-400 group-hover:border-black group-hover:text-black"
                                            }`}>
                                            {String.fromCharCode(65 + idx)}
                                        </div>
                                        <span className="text-sm font-medium">
                                            {opt.label}
                                        </span>
                                    </button>
                                ))}
                            </div>

                            {/* Minimal Log */}
                            <AnimatePresence>
                                {showLog && currentQData.log && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="absolute -bottom-32 left-0 right-0 mx-auto w-full max-w-xl text-center"
                                    >
                                        <p className="text-xs font-medium text-zinc-500 bg-zinc-50 px-4 py-2 rounded-full inline-block border border-zinc-100">
                                            <span className="text-black font-bold mr-2">Análise:</span>{currentQData.log}
                                        </p>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </div>
            )}

            {step === 'results' && (
                <>
                    {/* GATE OVERLAY - Padronizado Side-by-Side */}
                    {!hasSubmittedLead && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-sm p-4 overflow-y-auto animate-in fade-in duration-500">
                            <div className="bg-black border border-zinc-900 p-8 w-full max-w-4xl flex flex-col md:flex-row items-center md:items-stretch gap-8 md:gap-12 rounded-3xl shadow-2xl relative overflow-hidden my-auto max-h-[90vh]">
                                {/* Coluna Esquerda: Teaser */}
                                <div className="flex-1 flex flex-col items-center justify-center text-center space-y-6 md:border-r border-zinc-900 md:pr-12">
                                    <div className="inline-flex items-center gap-2 bg-zinc-950 px-3 py-1 rounded-full border border-zinc-900">
                                        <div className={`w-1.5 h-1.5 rounded-full ${teaserScore >= 50 ? 'bg-revgreen' : 'bg-red-500'} animate-pulse shadow-[0_0_10px_currentColor]`}></div>
                                        <span className="text-[9px] font-mono font-bold text-zinc-500 tracking-wider uppercase">Análise Finalizada</span>
                                    </div>

                                    <div className="relative">
                                        <div className="text-8xl md:text-9xl font-black text-white tracking-tighter leading-none shadow-black drop-shadow-2xl">{teaserScore}</div>
                                    </div>

                                    <h3 className="text-sm font-medium text-zinc-400 leading-relaxed max-w-xs">
                                        Detectamos vazamentos de <span className="text-revgreen font-bold">eficiência financeira</span> na sua operação de receita.
                                    </h3>
                                </div>

                                {/* Coluna Direita: Formulário */}
                                <div className="flex-1 w-full max-w-md flex flex-col justify-center">
                                    <DiagnosticForm
                                        onSubmit={handleFormSubmit}
                                        isSubmitting={isSubmitting}
                                        title="Receber Relatório"
                                        subtitle="Obtenha o plano de ação financeiro."
                                        variant="dark"
                                        diagnosticType="Revenue"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    <div className={`space-y-0 transition-all duration-700 ${!hasSubmittedLead ? 'blur-sm opacity-60 pointer-events-none' : ''}`}>

                        {/* DASHBOARD HEADLINE - Padronizado */}
                        <div className="mb-12 text-center animate-in fade-in slide-in-from-bottom-4 duration-1000 max-w-4xl mx-auto pt-8">
                            <div className="inline-flex items-center gap-2 mb-4 bg-zinc-900 border border-zinc-800 px-3 py-1 rounded-full">
                                <span className="w-1.5 h-1.5 bg-revgreen rounded-full shadow-[0_0_10px_#03FC3B]"></span>
                                <span className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-widest">Status: Finalizado</span>
                            </div>
                            <h1 className="text-4xl md:text-6xl font-black text-white tracking-tighter mb-2">
                                Relatório de <span className="text-zinc-600">Receita</span>
                            </h1>
                            <p className="text-zinc-500 font-medium max-w-xl mx-auto">
                                Diagnóstico da eficiência do funil e arquitetura de receita.
                            </p>
                        </div>

                        {/* FOLD 01: DARK METRICS (Directly on Dark Bg) */}
                        <div className="w-full max-w-6xl mx-auto mt-12 md:mt-20 mb-32 z-10 relative">
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
                                            variant="light"
                                        />
                                        <MetricCard
                                            label="Eficiência"
                                            value={answers[2] > 10 ? ">20%" : "<5%"}
                                            description="Taxa de Conversão"
                                            status={answers[2] > 10 ? 'success' : 'critical'}
                                            variant="light"
                                        />
                                        <MetricCard
                                            label="Estrutura"
                                            value={answers[1] === 20 ? "Espec." : "Genérica"}
                                            description="Especialização do Time"
                                            status={answers[1] > 10 ? 'success' : 'warning'}
                                            variant="light"
                                        />
                                        <MetricCard
                                            label="Tecnologia"
                                            value={answers[3] > 10 ? "CRM+" : "Manual"}
                                            description="Stack de Vendas"
                                            status={answers[3] > 10 ? 'success' : 'critical'}
                                            variant="light"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* FOLD 02: WHITE CTA SECTION */}
                        <div className="w-[100vw] relative left-[50%] right-[50%] -ml-[50vw] bg-white text-zinc-900 px-4 md:px-0 py-20 border-t border-zinc-200">
                            <div className="max-w-6xl mx-auto">
                                <section className="pt-12">
                                    <div className="space-y-6 mb-20 text-center md:text-left">
                                        <div className="inline-block bg-black text-white px-4 py-1.5 text-[9px] font-mono uppercase tracking-[0.5em] font-black">
                                            DIAGNÓSTICO_DE_RECEITA
                                        </div>
                                        <h2 className="text-5xl md:text-7xl font-black text-black tracking-tighter leading-none italic">
                                            {insights.title.split(' ')[0]} <span className="text-zinc-500">{insights.title.split(' ').slice(1).join(' ')}</span>
                                        </h2>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-16 mb-32">
                                        <div className="space-y-6 border-l border-zinc-200 pl-8">
                                            <h4 className="text-sm font-black !text-black uppercase tracking-widest flex items-center gap-3">
                                                <div className="w-1.5 h-1.5 bg-black rounded-full" />
                                                Perspectiva Técnica
                                            </h4>
                                            <p className="!text-zinc-900 text-base leading-relaxed font-semibold">
                                                {insights.description}
                                            </p>
                                        </div>

                                        <div className="space-y-6 border-l border-zinc-200 pl-8">
                                            <h4 className="text-sm font-black !text-black uppercase tracking-widest flex items-center gap-3">
                                                <div className="w-1.5 h-1.5 bg-black rounded-full" />
                                                Plano de Ação
                                            </h4>
                                            <p className="!text-zinc-900 text-base leading-relaxed font-semibold">
                                                Sua prioridade estratégica agora é: <strong className="bg-yellow-300 px-1 !text-black">{insights.action}</strong>.
                                                O custo de ignorar este ajuste é a erosão silenciosa da sua margem operacional.
                                            </p>
                                        </div>
                                    </div>

                                    <DiagnosticActionSection
                                        title="Transforme esse diagnóstico em plano de ação."
                                        onCtaClick={() => setIsBookingModalOpen(true)}
                                    />
                                </section>

                                <CallDiagnosticModal
                                    isOpen={isBookingModalOpen}
                                    onClose={() => setIsBookingModalOpen(false)}
                                    source="revenue-score"
                                />
                            </div>
                        </div>
                    </div>
                </>
            )}
        </DiagnosticLayout>
    );
};

export default RevenueScore;
