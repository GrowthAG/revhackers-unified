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
import { BenchmarkBar } from '@/components/diagnostics/BenchmarkBar';
import { DiagnosticBookingModal } from '@/components/diagnostics/DiagnosticBookingModal';
import { QuestionProgressBar } from '@/components/diagnostics/QuestionProgressBar';
import { ShareButtons } from '@/components/diagnostics/ShareButtons';
import { getDiagnosticInsights } from '@/utils/diagnosticMapping';
import SEO from '@/components/shared/SEO';
import { analyzeDiagnosticAI, DiagnosticAnalysisResult } from '@/api/diagnosticAnalysis';

// Questions centered on "REI CRM (RevOps)" - 5 dimensões, total = 100pts
const QUESTIONS = [
    {
        id: 1,
        question: "Seja honesto: Qual é a relação real do seu time comercial com o CRM hoje?",
        options: [
            { label: "É a única fonte da verdade, automação total", score: 20 },
            { label: "Eles usam, mas atualizam como obrigação no fim do dia", score: 10 },
            { label: "Odeiam. Tem muita informação no caderno e WhatsApp", score: 5 },
            { label: "Comercial não usa CRM", score: 0 }
        ],
        log: "Um CRM desatualizado é apenas uma planilha muito cara."
    },
    {
        id: 2,
        question: "Quando um lead 'levanta a mão' pedindo contato, em quanto tempo ele é atendido?",
        options: [
            { label: "< 5 minutos, roleta automatizada para o SDR livre", score: 20 },
            { label: "No mesmo dia, em algumas horas", score: 10 },
            { label: "Pode demorar mais de 24h dependendo da demanda", score: 5 },
            { label: "Depende de quem estiver olhando o email de contato", score: 0 }
        ],
        log: "Depois de 5 minutos, a chance de conversão cai em 80%."
    },
    {
        id: 3,
        question: "Quais atributos objetivos qualificam um lead como pronto para o seu time comercial (MQL para SQL)?",
        options: [
            { label: "Aplicamos matriz BANT/SPIN. Vendas só recebe lead no perfil de Budget e Momento", score: 20 },
            { label: "Temos critérios básicos (tamanho, cargo), mas às vezes passam leads fora", score: 10 },
            { label: "O Marketing envia qualquer um que baixe um material ou levante a mão", score: 5 },
            { label: "Não existe qualificação. Caiu no form ou Zap, o vendedor tenta fechar", score: 0 }
        ],
        log: "Conversar com curiosos e leads desqualificados é o dinheiro mais caro que a sua empresa queima hoje."
    },
    {
        id: 4,
        question: "Como funciona o Acordo de Nível de Serviço (SLA) entre a atração (MKT) e fechamento (Vendas)?",
        options: [
            { label: "SLA assinado. Vendas tem tempo limite para abordar e reportar perda por etapa", score: 20 },
            { label: "Combinado de boca. MKT reclama de Vendas e Vendas de MKT", score: 10 },
            { label: "Não tem SLA, usamos canais separados e só nos falaremos via mensagem", score: 5 },
            { label: "Não existe divisão. Tenta-se anunciar de dia e ser vendedor à noite", score: 0 }
        ],
        log: "Guerra ou silos entre marketing e vendas chegam a custar 20% da receita anual das empresas B2B."
    },
    {
        id: 5,
        question: "Como a meta anual agressiva da empresa foi desdobrada estruturalmente para as Vendas?",
        options: [
            { label: "Até o nível diário. O AE e BDR sabem as ligações/propostas requeridas no dia", score: 20 },
            { label: "Temos metas mensais claras, mas o volume diário flutua por instinto", score: 10 },
            { label: "Apenas metas gerais e trimestrais (ex: 'faturar mais do que o mês passado')", score: 5 },
            { label: "Nossa meta restringe-se a conseguir lucro ou pagar os custos fixos operacionais", score: 0 }
        ],
        log: "Esperança não é estratégia comercial. Meta que não é fracionada até a atividade diária torna-se inatingível de se administrar."
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
    const [hasSubmittedLead, setHasSubmittedLead] = useState(false);
    const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
    const [selectedOption, setSelectedOption] = useState<number | null>(null);
    const [showLog, setShowLog] = useState(false);
    const [analysisResult, setAnalysisResult] = useState<DiagnosticAnalysisResult | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const insights = getDiagnosticInsights('revenue', score);
    const currentQData = QUESTIONS[currentQ];

    // Estado do Protocolo e Logs
    const handleAnswer = (optionScore: number, optionIdx: number) => {
        if (selectedOption !== null) return;
        setSelectedOption(optionIdx);
        setShowLog(true);

        const newScore = score + optionScore;
        setScore(newScore);
        const updatedAnswers = [...answers, optionScore];
        setAnswers(updatedAnswers);

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

            await submitPublicDiagnostic(
                { ...data, phone: '' },
                { answers, diagnostic_type: 'revenue', source: 'revenue-score', analysis: analysisResult },
                score,
                {
                    level: resultMap.title,
                    description: resultMap.msg,
                    action: "Diagnóstico de Receita",
                    color: "revgreen"
                },
                'score_captured'
            );

            setHasSubmittedLead(true);
            toast({
                className: "bg-zinc-900 border-zinc-800 text-white",
                title: "DIAGNÓSTICO PROCESSADO",
                description: "Seu relatório oficial foi gerado."
            });
            
            setIsAnalyzing(true);
            setStep('results');
            analyzeDiagnosticAI('revenue', answers, score)
                .then(result => setAnalysisResult(result))
                .catch(() => {})
                .finally(() => setIsAnalyzing(false));

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
        <>
        <SEO
            title="Score de Revenue - Diagnóstico de Operação Comercial"
            description="Avalie a maturidade da sua operação de revenue B2B em 5 perguntas. Diagnóstico gratuito com análise de IA sobre pipeline, CRM e processos comerciais."
            canonical="https://revhackers.com.br/score-revenue"
            breadcrumbs={[
                { name: "Home", url: "https://revhackers.com.br/" },
                { name: "Diagnósticos", url: "https://revhackers.com.br/diagnostico" },
                { name: "Score Revenue", url: "https://revhackers.com.br/score-revenue" }
            ]}
        />
        <DiagnosticLayout
            title={step === 'results' ? "" : "Diagnóstico CRM"}
            subtitle={step === 'results' ? "" : "Identifique oportunidades de melhoria no seu processo de CRM, com automacoes e IA"}
            variant={step === 'results' ? 'dark' : 'light'}
            centered={step === 'results'}
            hideHeader={step === 'results'}
            headerVariant="default"
        >
            {/* BACKDROP DE SEGURANÇA */}
            {step === 'results' && <div className="fixed inset-0 bg-black -z-50 pointer-events-none" />}

            {step === 'questions' && (
                <div className="max-w-2xl animate-fade-in w-full mx-auto">
                    <QuestionProgressBar current={currentQ} total={QUESTIONS.length} variant="light" />
                    <div className="space-y-4 mt-4">
                        <div className="flex justify-between items-center text-xxs font-mono text-zinc-400 uppercase tracking-widest font-black border-b border-zinc-100 pb-2">
                            <span>Questão {currentQ + 1} de {QUESTIONS.length}</span>
                            <span>ID: 0{currentQ + 1}</span>
                        </div>

                        <div className="space-y-4">
                            <h2 className="text-2xl md:text-3xl font-black text-black tracking-tighter leading-tight">
                                {QUESTIONS[currentQ].question}
                            </h2>

                            <div className="grid grid-cols-1 gap-2">
                                {currentQData.options.map((opt, idx) => (
                                    <button
                                        key={idx}
                                        disabled={selectedOption !== null}
                                        onClick={() => handleAnswer(opt.score, idx)}
                                        className={`group relative flex items-center gap-4 p-4 text-left transition-all duration-300 border ${selectedOption === idx
                                            ? "bg-zinc-900 text-white border-zinc-900 scale-[1.01]"
                                            : "bg-white border-zinc-200 text-zinc-900 hover:border-zinc-400 hover:bg-zinc-50"
                                            } ${selectedOption !== null && selectedOption !== idx ? "opacity-40" : "opacity-100"}`}
                                    >
                                        <div className={`w-6 h-6 flex-shrink-0 flex items-center justify-center text-xxs font-mono font-bold border rounded transition-colors ${selectedOption === idx
                                            ? "bg-white text-zinc-900 border-white"
                                            : "bg-zinc-100 border-zinc-200 text-zinc-500 group-hover:border-zinc-400 group-hover:text-zinc-900"
                                            }`}>
                                            {String.fromCharCode(65 + idx)}
                                        </div>
                                        <span className="text-sm font-medium">
                                            {opt.label}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Log strip - fixed bottom */}
                    <AnimatePresence>
                        {showLog && currentQData.log && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 20 }}
                                className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-zinc-100 px-4 py-3"
                            >
                                <p className="text-xs font-medium text-zinc-500 text-center max-w-2xl mx-auto">
                                    <span className="text-black font-bold mr-2">Análise:</span>{currentQData.log}
                                </p>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            )}

            {step === 'results' && (
                <>
                    {/* GATE OVERLAY - Padronizado Side-by-Side */}
                    {!hasSubmittedLead && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-sm p-4 overflow-y-auto animate-in fade-in duration-500">
                            <div className="bg-black border border-zinc-900 p-8 w-full max-w-4xl flex flex-col md:flex-row items-center md:items-stretch gap-8 md:gap-12 shadow-sm relative overflow-hidden my-auto max-h-[90vh]">
                                {/* Coluna Esquerda: Teaser */}
                                <div className="flex-1 flex flex-col items-center justify-center text-center space-y-6 md:border-r border-zinc-900 md:pr-12">
                                    <div className="inline-flex items-center gap-2 bg-zinc-950 px-3 py-1 border border-zinc-900">
                                        <div className={`w-1.5 h-1.5 ${teaserScore >= 50 ? 'bg-revgreen' : 'bg-zinc-900'}`}></div>
                                        <span className="text-2xs font-mono font-bold text-zinc-500 tracking-wider uppercase">Análise Finalizada</span>
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

                        {/* DASHBOARD HEADLINE */}
                        <div className="mb-12 text-center animate-in fade-in slide-in-from-bottom-4 duration-1000 max-w-4xl mx-auto pt-8">
                            <div className="inline-flex items-center gap-2 mb-4 bg-zinc-900 border border-zinc-800 px-3 py-1">
                                <span className="w-1.5 h-1.5 bg-revgreen"></span>
                                <span className="text-xxs font-mono font-bold text-zinc-400 uppercase tracking-widest">Status: Finalizado</span>
                            </div>
                            <h1 className="text-4xl md:text-6xl font-black text-white tracking-tighter mb-2">
                                Diagnóstico <span className="text-zinc-600">CRM</span>
                            </h1>
                            <p className="text-zinc-500 font-medium max-w-xl mx-auto">
                                Deep dive na sua infraestrutura de Revenue e Vendas.
                            </p>
                        </div>

                        {/* HERO: Score + AI Archetype */}
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch animate-in fade-in duration-700">
                            <div className="lg:col-span-4">
                                <ScoreGauge
                                    score={score}
                                    label="Maturidade Comercial"
                                    description="Índice de eficiência de receita."
                                />
                            </div>

                            <div className="lg:col-span-8 flex flex-col">
                                <div className="border border-zinc-900 p-8 bg-zinc-950 h-full flex flex-col justify-center">
                                    {isAnalyzing ? (
                                        <div className="flex flex-col items-center justify-center gap-4 py-8">
                                            <div className="w-6 h-6 border-2 border-revgreen border-t-transparent animate-spin" />
                                            <div className="text-center space-y-1">
                                                <span className="block text-xs font-mono text-zinc-300 uppercase tracking-widest">IA Processando Análise</span>
                                                <span className="block text-xxs font-mono text-zinc-600 uppercase tracking-widest">Aguarde alguns segundos...</span>
                                            </div>
                                        </div>
                                    ) : analysisResult ? (
                                        <>
                                            <div className="flex items-center gap-2 mb-4">
                                                <span className="text-xxs font-black uppercase tracking-[0.25em] text-[#00CC6A] bg-[#00CC6A]/10 px-3 py-1.5">
                                                    {analysisResult.archetype}
                                                </span>
                                            </div>
                                            <p className="text-white text-lg font-medium leading-relaxed">
                                                {analysisResult.headline}
                                            </p>
                                        </>
                                    ) : (
                                        <div className="flex flex-col justify-center py-8">
                                            <p className="text-zinc-400 text-sm font-mono uppercase tracking-widest text-center">
                                                Análise será gerada após identificação
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* SCORE BREAKDOWN: 1 card per question */}
                        <div className="mt-8">
                            <div className="flex items-center gap-2 mb-4">
                                <div className="w-1 h-1 bg-zinc-600" />
                                <span className="text-xxs font-black uppercase tracking-[0.25em] text-zinc-500">Score por Dimensão</span>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                                {QUESTIONS.map((q, i) => {
                                    const qScore = answers[i] || 0;
                                    const maxScore = Math.max(...q.options.map(o => o.score));
                                    const pct = maxScore > 0 ? (qScore / maxScore) * 100 : 0;
                                    return (
                                        <div key={q.id} className="border border-zinc-900 p-4 bg-zinc-950">
                                            <div className="flex justify-between items-start mb-3">
                                                <span className="text-2xs font-bold text-zinc-500 uppercase tracking-widest leading-tight max-w-[80%]">
                                                    {q.question.length > 30 ? q.question.slice(0, 30) + '...' : q.question}
                                                </span>
                                                <div className={`w-1.5 h-1.5 flex-shrink-0 ${pct >= 80 ? 'bg-revgreen' : pct >= 50 ? 'bg-zinc-400' : 'bg-zinc-700'}`} />
                                            </div>
                                            <div className="text-2xl font-black text-white tracking-tight">
                                                {qScore}<span className="text-zinc-600 text-sm font-bold">/{maxScore}</span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* WHITE SECTION: AI Analysis + Benchmark */}
                        <div className="w-[100vw] relative left-[50%] right-[50%] -ml-[50vw] bg-white px-4 md:px-0 py-20 mt-16 border-t border-zinc-200 animate-fade-in duration-1000 delay-500">
                            <div className="max-w-6xl mx-auto space-y-16">

                                {/* AI STRENGTHS vs GAPS */}
                                {analysisResult && (
                                    <section>
                                        <div className="space-y-6 mb-12 text-center md:text-left">
                                            <div className="inline-block bg-black text-white px-4 py-1.5 text-2xs font-mono uppercase tracking-[0.5em] font-black">
                                                DIAGNÓSTICO_DE_RECEITA
                                            </div>
                                            <h2 className="text-5xl md:text-7xl font-black text-black tracking-tighter leading-none">
                                                {analysisResult.archetype}
                                            </h2>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
                                            <div className="border border-zinc-200 p-8 bg-zinc-50">
                                                <h4 className="text-xxs font-black uppercase tracking-[0.25em] text-zinc-900 mb-6 flex items-center gap-2">
                                                    <div className="w-2 h-2 bg-revgreen" />
                                                    Superpoderes
                                                </h4>
                                                <div className="space-y-4">
                                                    {analysisResult.strengths.map((s, i) => (
                                                        <div key={i} className="flex gap-3">
                                                            <span className="text-revgreen font-bold text-sm mt-0.5">✓</span>
                                                            <p className="text-zinc-900 text-sm font-medium leading-relaxed">{s}</p>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            <div className="border border-zinc-200 p-8 bg-white">
                                                <h4 className="text-xxs font-black uppercase tracking-[0.25em] text-zinc-900 mb-6 flex items-center gap-2">
                                                    <div className="w-2 h-2 bg-zinc-900" />
                                                    Gaps Críticos
                                                </h4>
                                                <div className="space-y-4">
                                                    {analysisResult.gaps.map((g, i) => (
                                                        <div key={i} className="flex gap-3">
                                                            <span className="text-zinc-400 font-bold text-sm mt-0.5">✗</span>
                                                            <p className="text-zinc-700 text-sm font-medium leading-relaxed">{g}</p>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="border-l-4 border-[#00CC6A] bg-zinc-50 p-8 mb-16">
                                            <h4 className="text-xxs font-black uppercase tracking-[0.25em] text-zinc-500 mb-3">
                                                Ação Imediata Recomendada
                                            </h4>
                                            <p className="text-zinc-900 text-base font-semibold leading-relaxed">
                                                {analysisResult.immediateAction}
                                            </p>
                                        </div>
                                    </section>
                                )}

                                {/* Skeleton while AI processes */}
                                {isAnalyzing && !analysisResult && (
                                    <section>
                                        <div className="space-y-6 mb-12 text-center md:text-left">
                                            <div className="inline-block bg-black text-white px-4 py-1.5 text-2xs font-mono uppercase tracking-[0.5em] font-black">
                                                DIAGNÓSTICO_DE_RECEITA
                                            </div>
                                            <div className="flex items-center gap-3 mt-2">
                                                <div className="w-4 h-4 border-2 border-zinc-900 border-t-transparent rounded-full animate-spin flex-shrink-0" />
                                                <span className="text-sm font-mono text-zinc-500 uppercase tracking-widest">IA gerando sua análise personalizada...</span>
                                            </div>
                                            <div className="h-14 md:h-20 bg-zinc-100 animate-pulse rounded w-2/3" />
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
                                            <div className="border border-zinc-100 p-8 bg-zinc-50 space-y-4">
                                                <div className="h-3 bg-zinc-200 animate-pulse rounded w-28" />
                                                <div className="space-y-2 pt-2">
                                                    <div className="h-3 bg-zinc-200 animate-pulse rounded w-full" />
                                                    <div className="h-3 bg-zinc-200 animate-pulse rounded w-4/5" />
                                                    <div className="h-3 bg-zinc-200 animate-pulse rounded w-3/5" />
                                                </div>
                                            </div>
                                            <div className="border border-zinc-100 p-8 bg-white space-y-4">
                                                <div className="h-3 bg-zinc-200 animate-pulse rounded w-28" />
                                                <div className="space-y-2 pt-2">
                                                    <div className="h-3 bg-zinc-200 animate-pulse rounded w-full" />
                                                    <div className="h-3 bg-zinc-200 animate-pulse rounded w-4/5" />
                                                    <div className="h-3 bg-zinc-200 animate-pulse rounded w-3/5" />
                                                </div>
                                            </div>
                                        </div>
                                        <div className="border-l-4 border-zinc-200 bg-zinc-50 p-8">
                                            <div className="h-3 bg-zinc-200 animate-pulse rounded w-48 mb-4" />
                                            <div className="space-y-2">
                                                <div className="h-3 bg-zinc-200 animate-pulse rounded w-full" />
                                                <div className="h-3 bg-zinc-200 animate-pulse rounded w-4/5" />
                                            </div>
                                        </div>
                                    </section>
                                )}

                                {/* Fallback if no AI */}
                                {!isAnalyzing && !analysisResult && (
                                    <section>
                                        <div className="space-y-6 mb-12 text-center md:text-left">
                                            <div className="inline-block bg-black text-white px-4 py-1.5 text-2xs font-mono uppercase tracking-[0.5em] font-black">
                                                DIAGNÓSTICO_DE_RECEITA
                                            </div>
                                            <h2 className="text-5xl md:text-7xl font-black text-black tracking-tighter leading-none italic">
                                                {insights.title.split(' ')[0]} <span className="text-zinc-500">{insights.title.split(' ').slice(1).join(' ')}</span>
                                            </h2>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 mb-16">
                                            <div className="space-y-6 border-l border-zinc-200 pl-8">
                                                <h4 className="text-sm font-black text-black uppercase tracking-widest flex items-center gap-3">
                                                    <div className="w-1.5 h-1.5 bg-black " /> Perspectiva Técnica
                                                </h4>
                                                <p className="text-zinc-900 text-base leading-relaxed font-semibold">{insights.description}</p>
                                            </div>
                                            <div className="space-y-6 border-l border-zinc-200 pl-8">
                                                <h4 className="text-sm font-black text-black uppercase tracking-widest flex items-center gap-3">
                                                    <div className="w-1.5 h-1.5 bg-black " /> Plano de Ação
                                                </h4>
                                                <p className="text-zinc-900 text-base leading-relaxed font-semibold">
                                                    Sua prioridade estratégica agora é: <strong className="bg-[#00CC6A]/20 px-1 text-black">{insights.action}</strong>.
                                                </p>
                                            </div>
                                        </div>
                                    </section>
                                )}

                                {/* BENCHMARK */}
                                <BenchmarkBar userScore={score} type="revenue" variant="light" />

                                <DiagnosticActionSection
                                    title="Destrave sua Receita."
                                    subtitle="Agende um diagnóstico gratuito com um especialista para desenhar seu plano de ação."
                                    onCtaClick={() => setIsBookingModalOpen(true)}
                                />

                                <DiagnosticBookingModal
                                    isOpen={isBookingModalOpen}
                                    onClose={() => setIsBookingModalOpen(false)}
                                    diagnosticType="revenue"
                                />

                                {/* Fallback MoFu CTA */}
                                <div className="mt-8 mb-16 flex flex-col items-center justify-center text-center px-4">
                                    <span className="text-xxs font-mono text-zinc-400 uppercase tracking-widest mb-4">MUITO CEDO PARA UMA DEEP-DIVE CALL?</span>
                                    <button onClick={() => window.open('https://revhackers.com.br/')} className="text-xs font-semibold text-white bg-zinc-900 border border-zinc-700 px-6 py-3 hover:bg-zinc-800 transition-colors uppercase tracking-widest">Baixe o Playbook REI CRM (Grátis)</button>
                                </div>

                                {/* Share + PDF */}
                                <div className="flex justify-center pt-8">
                                    <ShareButtons score={score} type="Revenue" />
                                </div>

                                <div className="pt-8 text-center">
                                    <span className="text-xxs font-mono font-bold text-zinc-300 uppercase tracking-[0.3em]">
                                        RevHackers // Intelligence Unit
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </DiagnosticLayout>
        </>
    );
};

export default RevenueScore;
