import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, TrendingUp, BarChart, Users2, Database, DollarSign } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { submitPublicDiagnostic } from "@/api/publicDiagnostic";
import { DiagnosticLayout } from '@/components/diagnostics/DiagnosticLayout';
import { DiagnosticForm, DiagnosticFormData } from '@/components/diagnostics/DiagnosticForm';
import { ScoreGauge } from '@/components/diagnostics/ScoreGauge';
import { MetricCard } from '@/components/diagnostics/MetricCard';
import { DiagnosticActionSection } from '@/components/diagnostics/DiagnosticActionSection';
import { BenchmarkBar } from '@/components/diagnostics/BenchmarkBar';
import { CallDiagnosticModal } from '@/components/diagnostics/CallDiagnosticModal';
import { QuestionProgressBar } from '@/components/diagnostics/QuestionProgressBar';
import { ShareButtons } from '@/components/diagnostics/ShareButtons';
import { getDiagnosticInsights } from '@/utils/diagnosticMapping';
import { analyzeDiagnosticAI, DiagnosticAnalysisResult } from '@/api/diagnosticAnalysis';

// Questions centered on "Growth Maturity" - 7 dimensões, total = 100pts
const QUESTIONS = [
    {
        id: 1,
        question: "Como você define sua estratégia de aquisição hoje?",
        options: [
            { label: "Previsível e multicanal (Inbound + Outbound + Ads)", score: 16 },
            { label: "Dependente de um único canal (Ex: só Ads ou só Indicação)", score: 8 },
            { label: "Oscilante, sem processos claros", score: 4 },
            { label: "Passiva (espero o cliente vir)", score: 0 }
        ],
        log: "Multicanalidade é a única defesa contra o aumento do custo de mídia."
    },
    {
        id: 2,
        question: "Você sabe exatamente quanto paga por um cliente (CAC)?",
        options: [
            { label: "Sim, por canal e acompanho semanalmente", score: 16 },
            { label: "Tenho uma média geral", score: 8 },
            { label: "Tenho uma ideia, mas não meço", score: 4 },
            { label: "Não faço ideia", score: 0 }
        ],
        log: "Se você não mede por canal, está queimando dinheiro no lugar errado."
    },
    {
        id: 3,
        question: "Como é seu processo de vendas?",
        options: [
            { label: "CRM estruturado com etapas, playbooks e automação", score: 16 },
            { label: "Uso CRM, mas depende muito do vendedor", score: 8 },
            { label: "Uso planilhas ou controle manual", score: 4 },
            { label: "Não tenho processo definido", score: 0 }
        ],
        log: "Processo vence talento. Sem playbook, sua receita depende de 'heróis'."
    },
    {
        id: 4,
        question: "Sua retenção (LTV) é monitorada?",
        options: [
            { label: "Sim, temos ações ativas de CS e upsell", score: 16 },
            { label: "Acompanhamos apenas o Churn (cancelamentos)", score: 8 },
            { label: "Só percebemos quando o cliente sai", score: 4 },
            { label: "Não monitoramos", score: 0 }
        ],
        log: "Reter custa 5x menos que adquirir. Upsell é lucro líquido."
    },
    {
        id: 5,
        question: "Seu time de Growth/Marketing tem metas de receita?",
        options: [
            { label: "Sim, respondem por pipeline e receita gerada", score: 16 },
            { label: "Medimos métricas de vaidade (likes, seguidores)", score: 8 },
            { label: "Não tem metas definidas", score: 0 },
            { label: "Não tenho time de marketing", score: 0 }
        ],
        log: "Metas de vaidade não enchem o caixa da empresa."
    },
    {
        id: 6,
        question: "Como é sua estratégia de conteúdo e inbound marketing?",
        options: [
            { label: "Estratégia editorial ativa com SEO, blog e materiais ricos", score: 10 },
            { label: "Postamos nas redes sociais de forma esporádica", score: 5 },
            { label: "Não temos produção de conteúdo regular", score: 2 },
            { label: "Não investimos em conteúdo", score: 0 }
        ],
        log: "Conteúdo é o único ativo de marketing que valoriza com o tempo."
    },
    {
        id: 7,
        question: "Como você utiliza dados para tomar decisões de crescimento?",
        options: [
            { label: "Dashboards em tempo real com KPIs claros (CAC, LTV, Churn)", score: 10 },
            { label: "Relatórios mensais em planilha ou BI básico", score: 5 },
            { label: "Olho métricas esporadicamente quando surge problema", score: 2 },
            { label: "Decisões baseadas em intuição", score: 0 }
        ],
        log: "Sem dados, você está dirigindo no escuro."
    }
];

type Step = 'start' | 'questions' | 'lead-capture' | 'results';

const GrowthScore = () => {
    const { toast } = useToast();
    const [step, setStep] = useState<Step>('questions');
    const [currentQ, setCurrentQ] = useState(0);
    const [score, setScore] = useState(0);
    const [answers, setAnswers] = useState<number[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
    const [selectedOption, setSelectedOption] = useState<number | null>(null);
    const [showLog, setShowLog] = useState(false);
    const [analysisResult, setAnalysisResult] = useState<DiagnosticAnalysisResult | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const insights = getDiagnosticInsights('growth', score);
    const currentQData = QUESTIONS[currentQ];

    const [hasSubmittedLead, setHasSubmittedLead] = useState(false);

    const handleAnswer = (optionScore: number, optionIndex: number) => {
        setSelectedOption(optionIndex);
        setShowLog(true);

        const newScore = score + optionScore;
        setScore(newScore);
        const updatedAnswers = [...answers, optionScore];
        setAnswers(updatedAnswers);

        setTimeout(() => {
            setShowLog(false);
            setSelectedOption(null);
            if (currentQ < QUESTIONS.length - 1) {
                setCurrentQ(prev => prev + 1);
            } else {
                // Última pergunta - trigger IA e avançar
                setIsAnalyzing(true);
                analyzeDiagnosticAI('growth', updatedAnswers, newScore)
                    .then(result => setAnalysisResult(result))
                    .catch(() => {}) // Mock é retornado internamente
                    .finally(() => setIsAnalyzing(false));
                setStep('results');
            }
        }, 2000);
    };

    const handleFormSubmit = async (data: DiagnosticFormData) => {
        setIsSubmitting(true);
        try {
            const result = getResultMap(score);

            await submitPublicDiagnostic(
                { ...data, phone: '' }, // No phone collected
                { answers, diagnostic_type: 'growth', source: 'growth-score', analysis: analysisResult },
                score,
                {
                    level: result.title,
                    description: result.msg,
                    action: "Diagnóstico de Growth",
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
    const teaserScore = score;


    return (
        <DiagnosticLayout
            title={step === 'results' ? "" : "Growth Score"}
            subtitle={step === 'results' ? "" : "Diagnóstico Técnico de Crescimento v3.0"}
            variant={step === 'results' ? 'dark' : 'light'}
            hideHeader={step === 'results'}
            centered={step === 'results'}
            headerVariant="default"
        >
            {/* BACKDROP DE SEGURANÇA */}
            {step === 'results' && <div className="fixed inset-0 bg-black -z-50 pointer-events-none" />}
            {step === 'questions' && (
                <div className="max-w-4xl animate-fade-in w-full">
                    <QuestionProgressBar current={currentQ} total={QUESTIONS.length} variant="light" />
                    <div className="space-y-6 mt-6">
                        <div className="flex justify-between items-center text-[10px] font-mono text-zinc-400 uppercase tracking-widest font-black border-b border-zinc-100 pb-2">
                            <span>Questão {currentQ + 1} de {QUESTIONS.length}</span>
                            <span>ID: 0{currentQ + 1}</span>
                        </div>

                        <div className="space-y-6 relative pb-40"> {/* Standardized spacing */}
                            <h2 className="text-3xl md:text-4xl font-black text-black tracking-tighter leading-tight">
                                {currentQData.question}
                            </h2>

                            <div className="grid grid-cols-1 gap-3 max-w-xl mx-auto">
                                {currentQData.options.map((opt, idx) => (
                                    <button
                                        key={idx}
                                        disabled={selectedOption !== null}
                                        onClick={() => handleAnswer(opt.score, idx)}
                                        className={`group relative flex items-center gap-5 p-5 text-left transition-all duration-300 rounded-xl border ${selectedOption === idx
                                            ? "bg-zinc-900 text-white border-zinc-900 scale-[1.01]"
                                            : "bg-white border-zinc-200 text-zinc-900 hover:border-zinc-400 hover:bg-zinc-50"
                                            } ${selectedOption !== null && selectedOption !== idx ? "opacity-40" : "opacity-100"}`}
                                    >
                                        <div className={`w-6 h-6 flex items-center justify-center text-[10px] font-mono font-bold border rounded transition-colors ${selectedOption === idx
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

                            {/* Minimal Log */}
                            <AnimatePresence>
                                {showLog && currentQData.log && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        className="absolute -bottom-32 left-0 right-0 mx-auto w-full max-w-xl text-center"
                                    >
                                        <p className="text-xs font-medium text-zinc-500 bg-zinc-50 px-4 py-2 rounded-full inline-block border border-zinc-100">
                                            <span className="text-black font-bold mr-2">Info:</span>{currentQData.log}
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
                            <div className="bg-black border border-zinc-900 p-8 w-full max-w-4xl flex flex-col md:flex-row items-center md:items-stretch gap-8 md:gap-12 rounded-3xl shadow-sm relative overflow-hidden my-auto max-h-[90vh]">
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
                                        Detectamos oportunidades de <span className="text-revgreen font-bold">otimização crítica</span> na sua operação de growth.
                                    </h3>
                                </div>

                                {/* Coluna Direita: Formulário */}
                                <div className="flex-1 w-full max-w-md flex flex-col justify-center">
                                    <DiagnosticForm
                                        onSubmit={handleFormSubmit}
                                        isSubmitting={isSubmitting}
                                        title="Receber Relatório"
                                        subtitle="Desbloqueie sua análise completa."
                                        variant="dark"
                                        diagnosticType="Growth"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    <div className={`space-y-0 transition-all duration-700 ${!hasSubmittedLead ? 'blur-sm opacity-60 pointer-events-none' : ''}`}>

                        {/* DASHBOARD HEADLINE */}
                        <div className="mb-12 text-center animate-in fade-in slide-in-from-bottom-4 duration-1000 max-w-4xl mx-auto pt-8">
                            <div className="inline-flex items-center gap-2 mb-4 bg-zinc-900 border border-zinc-800 px-3 py-1 rounded-full">
                                <span className="w-1.5 h-1.5 bg-revgreen rounded-full shadow-[0_0_10px_#00CC6A]"></span>
                                <span className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-widest">Status: Finalizado</span>
                            </div>
                            <h1 className="text-4xl md:text-6xl font-black text-white tracking-tighter mb-2">
                                Relatório de <span className="text-zinc-600">Crescimento</span>
                            </h1>
                            <p className="text-zinc-500 font-medium max-w-xl mx-auto">
                                Diagnóstico tático dos vetores de aquisição e expansão.
                            </p>
                        </div>

                        {/* HERO: Score + AI Archetype */}
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch animate-in fade-in duration-700">
                            <div className="lg:col-span-4">
                                <ScoreGauge
                                    score={score}
                                    label="Maturidade de Growth"
                                    description="Índice sintético baseado nas respostas declaradas."
                                />
                            </div>

                            <div className="lg:col-span-8 flex flex-col">
                                {/* AI Archetype Card */}
                                <div className="border border-zinc-900 rounded-2xl p-8 bg-zinc-950 h-full flex flex-col justify-center">
                                    {isAnalyzing || !analysisResult ? (
                                        <div className="flex flex-col items-center justify-center gap-4 py-8">
                                            <div className="w-6 h-6 border-2 border-revgreen border-t-transparent rounded-full animate-spin" />
                                            <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Processando Inteligência...</span>
                                        </div>
                                    ) : (
                                        <>
                                            <div className="flex items-center gap-2 mb-4">
                                                <span className="text-[10px] font-black uppercase tracking-[0.25em] text-zinc-900 bg-zinc-100 px-3 py-1.5 rounded-md">
                                                    {analysisResult.archetype}
                                                </span>
                                            </div>
                                            <p className="text-white text-lg font-medium leading-relaxed mb-0">
                                                {analysisResult.headline}
                                            </p>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* SCORE BREAKDOWN: 1 card per question */}
                        <div className="mt-8">
                            <div className="flex items-center gap-2 mb-4">
                                <div className="w-1 h-1 rounded-full bg-zinc-600" />
                                <span className="text-[10px] font-black uppercase tracking-[0.25em] text-zinc-500">Score por Dimensão</span>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                                {QUESTIONS.map((q, i) => {
                                    const qScore = answers[i] || 0;
                                    const maxScore = Math.max(...q.options.map(o => o.score));
                                    const pct = maxScore > 0 ? (qScore / maxScore) * 100 : 0;
                                    return (
                                        <div key={q.id} className="border border-zinc-900 rounded-xl p-4 bg-zinc-950">
                                            <div className="flex justify-between items-start mb-3">
                                                <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest leading-tight max-w-[80%]">
                                                    {q.question.length > 30 ? q.question.slice(0, 30) + '...' : q.question}
                                                </span>
                                                <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${pct >= 80 ? 'bg-revgreen' : pct >= 50 ? 'bg-zinc-400' : 'bg-zinc-700'}`} />
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
                                            <div className="inline-block bg-black text-white px-4 py-1.5 text-[9px] font-mono uppercase tracking-[0.5em] font-black">
                                                DIAGNÓSTICO_DE_CRESCIMENTO
                                            </div>
                                            <h2 className="text-5xl md:text-7xl font-black text-black tracking-tighter leading-none">
                                                {analysisResult.archetype}
                                            </h2>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
                                            {/* Strengths */}
                                            <div className="border border-zinc-200 rounded-2xl p-8 bg-zinc-50">
                                                <h4 className="text-[10px] font-black uppercase tracking-[0.25em] text-zinc-900 mb-6 flex items-center gap-2">
                                                    <div className="w-2 h-2 rounded-full bg-revgreen" />
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

                                            {/* Gaps */}
                                            <div className="border border-zinc-200 rounded-2xl p-8 bg-white">
                                                <h4 className="text-[10px] font-black uppercase tracking-[0.25em] text-zinc-900 mb-6 flex items-center gap-2">
                                                    <div className="w-2 h-2 rounded-full bg-zinc-900" />
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

                                        {/* Immediate Action Card */}
                                        <div className="border-l-4 border-[#00CC6A] bg-zinc-50 rounded-r-2xl p-8 mb-16">
                                            <h4 className="text-[10px] font-black uppercase tracking-[0.25em] text-zinc-500 mb-3">
                                                Ação Imediata Recomendada
                                            </h4>
                                            <p className="text-zinc-900 text-base font-semibold leading-relaxed">
                                                {analysisResult.immediateAction}
                                            </p>
                                        </div>
                                    </section>
                                )}

                                {/* Fallback if no AI */}
                                {!analysisResult && (
                                    <section>
                                        <div className="space-y-6 mb-12 text-center md:text-left">
                                            <div className="inline-block bg-black text-white px-4 py-1.5 text-[9px] font-mono uppercase tracking-[0.5em] font-black">
                                                DIAGNÓSTICO_DE_CRESCIMENTO
                                            </div>
                                            <h2 className="text-5xl md:text-7xl font-black text-black tracking-tighter leading-none italic">
                                                {insights.title.split(' ')[0]} <span className="text-zinc-500">{insights.title.split(' ').slice(1).join(' ')}</span>
                                            </h2>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 mb-16">
                                            <div className="space-y-6 border-l border-zinc-200 pl-8">
                                                <h4 className="text-sm font-black text-black uppercase tracking-widest flex items-center gap-3">
                                                    <div className="w-1.5 h-1.5 bg-black rounded-full" /> Perspectiva Técnica
                                                </h4>
                                                <p className="text-zinc-900 text-base leading-relaxed font-semibold">{insights.description}</p>
                                            </div>
                                            <div className="space-y-6 border-l border-zinc-200 pl-8">
                                                <h4 className="text-sm font-black text-black uppercase tracking-widest flex items-center gap-3">
                                                    <div className="w-1.5 h-1.5 bg-black rounded-full" /> Plano de Ação
                                                </h4>
                                                <p className="text-zinc-900 text-base leading-relaxed font-semibold">
                                                    Sua prioridade estratégica agora é: <strong className="bg-zinc-200 px-1 text-black">{insights.action}</strong>.
                                                </p>
                                            </div>
                                        </div>
                                    </section>
                                )}

                                {/* BENCHMARK */}
                                <BenchmarkBar userScore={score} type="growth" variant="light" />

                                {/* CTA */}
                                <DiagnosticActionSection
                                    title="Construa sua Máquina de Vendas em 30 dias."
                                    onCtaClick={() => setIsBookingModalOpen(true)}
                                />

                                {/* Share + PDF */}
                                <div className="flex justify-center pt-8">
                                    <ShareButtons score={score} type="Growth" />
                                </div>

                                <div className="pt-8 text-center">
                                    <span className="text-[10px] font-mono font-bold text-zinc-300 uppercase tracking-[0.3em]">
                                        RevHackers // Intelligence Unit
                                    </span>
                                </div>

                                <CallDiagnosticModal
                                    isOpen={isBookingModalOpen}
                                    onClose={() => setIsBookingModalOpen(false)}
                                    source="growth-score"
                                />
                            </div>
                        </div>
                    </div>
                </>
            )}
        </DiagnosticLayout>
    );
};

export default GrowthScore;
