
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';
import { submitPublicDiagnostic } from "@/api/publicDiagnostic";
import { analyzeFounderProfileAI, FounderAnalysisResult } from "@/api/founderAnalysis";
import { Brain, ArrowRight, Users, Loader2, AlertTriangle } from 'lucide-react';
import { DiagnosticLayout } from '@/components/diagnostics/DiagnosticLayout';
import { DiagnosticForm, DiagnosticFormData } from '@/components/diagnostics/DiagnosticForm';
import { ScoreGauge } from '@/components/diagnostics/ScoreGauge';
import { MetricCard } from '@/components/diagnostics/MetricCard';
import { DiagnosticActionSection } from '@/components/diagnostics/DiagnosticActionSection';
import { DiagnosticBookingModal } from '@/components/diagnostics/DiagnosticBookingModal';
import DiagnosticBookingEmbed from '@/components/diagnostics/DiagnosticBookingEmbed';
import { getDiagnosticInsights } from '@/utils/diagnosticMapping';
import SEO from '@/components/shared/SEO';

// Questions centered on "Founder Authority & Bottleneck" - 4 dimensões, total = 100pts
const QUESTIONS = [
    {
        id: 1,
        question: "Quantas horas da sua semana são dedicadas a 'apagar incêndios' em tarefas operacionais?",
        options: [
            { label: "Quase zero. Atuo na estratégia (CEO de fato)", score: 25 },
            { label: "20-40% do tempo. Ainda controlo entregas críticas", score: 15 },
            { label: "A empresa para se eu tirar 15 dias de férias", score: 5 },
            { label: "100%. Eu sou o produto/serviço.", score: 0 }
        ],
        log: "O verdadeiro valor do founder não é a força bruta, é o poder de alavancagem."
    },
    {
        id: 2,
        question: "Quando um cliente B2B decide pesquisar o seu nome (não o da empresa), o que ele encontra?",
        options: [
            { label: "Uma máquina de influência: Materiais ricos, tese validada", score: 25 },
            { label: "Um perfil do LinkedIn atualizado e arrumado", score: 15 },
            { label: "Citações tímidas na página Institucional", score: 5 },
            { label: "Basicamente o fantasma do Orkut. Zero presença.", score: 0 }
        ],
        log: "Pessoas compram de pessoas. Sua autoridade reduz o atrito e abaixa o CAC da empresa."
    },
    {
        id: 3,
        question: "Seu esforço nas Redes Sociais gera tapinhas nas costas ou Pipeline de Vendas?",
        options: [
            { label: "Post gera leads qualificados e mensagens no Inbox para fechar", score: 25 },
            { label: "Engajamento ok, reputação sobe, mas vendas são raras", score: 15 },
            { label: "Tenho likes de colegas e funcionários apenas", score: 5 },
            { label: "Só tenho tempo de repostar artes da empresa", score: 0 }
        ],
        log: "Autoridade que não se traduz em captação de receita é apenas ego digital."
    },
    {
        id: 4,
        question: "Você vende um serviço 'como o do concorrente', ou possui uma metodologia proprietária inconfundível?",
        options: [
            { label: "Temos um framework único para resolver a dor, somos incomparáveis", score: 25 },
            { label: "Temos um bom pitch, mas o produto final é padrão de mercado", score: 15 },
            { label: "Diferenciamos por ter 'mais qualidade e atendimento'", score: 5 },
            { label: "A guerra é 100% no preço (Commodity)", score: 0 }
        ],
        log: "Sem fosso competitivo ('Moat'), você é forçado a ceder desconto para liderar mercado."
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

    const [hasSubmittedLead, setHasSubmittedLead] = useState(false);
    const [isBookingModalOpen, setIsBookingModalOpen] = useState(false); // Kept for types, unused if modal removed

    // Data Enrichment State
    const [linkedinUrl, setLinkedinUrl] = useState('');
    const [analysisResult, setAnalysisResult] = useState<FounderAnalysisResult | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [selectedOption, setSelectedOption] = useState<number | null>(null);
    const [showLog, setShowLog] = useState(false);

    const currentQData = QUESTIONS[currentQ];

    const handleStartDiagnostic = (url: string) => {
        if (!url) return;
        setLinkedinUrl(url);
        setStep('questions');
    };

    const handleAnswer = (optionScore: number, optionIdx: number) => {
        if (selectedOption !== null) return;
        setSelectedOption(optionIdx);
        setShowLog(true);

        const newScore = score + optionScore;
        const updatedAnswers = [...answers, optionScore];

        setScore(newScore);
        setAnswers(updatedAnswers);

        // Add visual delay for "Quiz Effect"
        setTimeout(() => {
            setShowLog(false);
            setSelectedOption(null);
            if (currentQ < QUESTIONS.length - 1) {
                setCurrentQ(prev => prev + 1);
            } else {
                setStep('results');
            }
        }, 1500);
    };

    const handleFormSubmit = async (data: DiagnosticFormData) => {
        setIsSubmitting(true);
        try {
            const result = getResultMap(score);

            // Merge Manual Data with Enriched Data
            const enrichedData = {
                ...data,
                linkedin: linkedinUrl,
                ...(analysisResult || {})
            };

            await submitPublicDiagnostic(
                { ...enrichedData, phone: '' },
                { answers, diagnostic_type: 'founder', analysis: analysisResult, source: 'founder-score' },
                score,
                {
                    level: result.title,
                    description: result.msg,
                    action: "Agendar Call de Diagnóstico",
                    color: "revgreen"
                },
                'score_captured'
            );

            setHasSubmittedLead(true);
            toast({
                className: "bg-zinc-900 border-zinc-800 text-white",
                title: "DIAGNÓSTICO PROCESSADO",
                description: "Análise de perfil Founder gerada."
            });

            setIsAnalyzing(true);
            setStep('results');
            
            analyzeFounderProfileAI(linkedinUrl, answers, score)
                .then(result => {
                    setAnalysisResult(result);
                })
                .catch(err => console.error(err))
                .finally(() => setIsAnalyzing(false));

        } catch (error) {
            console.error(error);
            toast({ variant: 'destructive', title: "Erro", description: "Tente novamente." });
        } finally {
            setIsSubmitting(false);
        }
    };

    const getResultMap = (s: number) => {
        if (s >= 80) return { title: "CEO Estrategista", msg: "Você opera como um CEO de verdade, focado no futuro e na cultura." };
        if (s >= 50) return { title: "CEO Híbrido", msg: "Você equilibra pratos entre operação e estratégia. O risco de burnout existe." };
        return { title: "CEO Operacional", msg: "Você é o gargalo. A empresa não cresce além da sua capacidade de horas." };
    };

    // Score calculation logic
    const getFinalScore = () => {
        return score; // O score agora é derivado puramente das respostas validadas
    };

    const finalScore = getFinalScore();
    const resultDetails = getResultMap(finalScore);
    const insights = getDiagnosticInsights('founder', finalScore);

    if (step === 'start') {
        return (
            <>
            <SEO
                title="Diagnóstico Founder - Avalie sua Autoridade Digital B2B"
                description="Descubra se você é um CEO Estrategista ou um Gargalo Operacional. Diagnóstico gratuito com análise de IA sobre autoridade, posicionamento e liderança."
                canonical="https://revhackers.com.br/score-founder"
                breadcrumbs={[
                    { name: "Home", url: "https://revhackers.com.br/" },
                    { name: "Diagnósticos", url: "https://revhackers.com.br/diagnostico" },
                    { name: "Score Founder", url: "https://revhackers.com.br/score-founder" }
                ]}
            />
            <DiagnosticLayout
                title="Diagnóstico Founder"
                subtitle="Analise e entenda como transformar o seu perfil do LinkedIn em um canal ativo de geracao de demanda"
                showGovernanceFooter={false}
                variant="light"
            >
                <div className="max-w-2xl mx-auto w-full">
                    <div className="flex flex-col md:flex-row gap-0 w-full border border-zinc-200 bg-white overflow-hidden mb-3">
                        <span className="hidden md:flex items-center px-5 font-mono text-xs text-zinc-400 bg-zinc-50 border-r border-zinc-200 select-none whitespace-nowrap">
                            linkedin.com/in/
                        </span>
                        <input
                            type="text"
                            value={linkedinUrl}
                            onChange={(e) => setLinkedinUrl(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleStartDiagnostic(linkedinUrl)}
                            placeholder="seu-perfil"
                            className="flex-1 bg-transparent border-none text-black h-14 px-5 focus:ring-0 outline-none font-bold text-base placeholder:text-zinc-300"
                        />
                        <button
                            onClick={() => handleStartDiagnostic(linkedinUrl)}
                            disabled={!linkedinUrl}
                            className="bg-black text-white px-8 h-14 font-black text-xs tracking-widest uppercase hover:bg-zinc-800 transition-colors disabled:opacity-40 flex items-center justify-center gap-2 whitespace-nowrap"
                        >
                            {isAnalyzing ? <Loader2 className="w-4 h-4 animate-spin" /> : <>INICIAR <ArrowRight className="w-3 h-3" /></>}
                        </button>
                    </div>
                    <p className="text-xxs uppercase tracking-widest text-zinc-400 font-mono">
                        Usaremos IA para analisar seu perfil. Perfis com alta privacidade podem ter coleta limitada.
                    </p>
                </div>
            </DiagnosticLayout>
            </>
        );
    }

    return (
        <>
        <SEO
            title="Diagnóstico Founder - Avalie sua Autoridade Digital B2B"
            description="Descubra se você é um CEO Estrategista ou um Gargalo Operacional. Diagnóstico gratuito com análise de IA."
            canonical="https://revhackers.com.br/score-founder"
        />
        <DiagnosticLayout
            title={step === 'results' ? "" : "Diagnóstico Founder"}
            subtitle={step === 'results' ? "" : "Analise e entenda como transformar o seu perfil do LinkedIn em um canal ativo de geracao de demanda"}
            variant={step === 'results' ? 'dark' : 'light'}
            centered={step === 'results'}
            hideHeader={step === 'results'}
            headerVariant="default"
        >
            {/* BACKDROP DE SEGURANÇA (Garante fundo preto total nos resultados) */}
            {step === 'results' && <div className="fixed inset-0 bg-black -z-50 pointer-events-none" />}
            {step === 'questions' && (
                <div className="max-w-2xl mx-auto flex flex-col w-full px-4 md:px-0">

                    {/* Header Clean */}
                    <div className="w-full flex items-center justify-between mb-4 border-b border-zinc-100 pb-2">
                        <div className="flex items-center gap-3">
                            <span className="w-2 h-2 bg-black rounded-full animate-pulse"></span>
                            <span className="text-xs font-mono font-medium text-zinc-500 tracking-wider">Protocolo de Diagnóstico</span>
                        </div>
                        <span className="text-xs font-mono font-medium text-zinc-400">0{currentQ + 1} / 0{QUESTIONS.length}</span>
                    </div>

                    <div className="w-full animate-fade-in flex flex-col">
    
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={currentQ}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="w-full flex flex-col space-y-4"
                            >
                                <h2 className="text-2xl md:text-3xl font-black text-black tracking-tight leading-tight max-w-2xl">
                                    {QUESTIONS[currentQ].question}
                                </h2>

                                <div className="grid grid-cols-1 gap-2 w-full">
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
                            </motion.div>
                        </AnimatePresence>
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
                                    <span className="text-black font-bold mr-2">Insight:</span>{currentQData.log}
                                </p>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            )}

            {step === 'results' && (
                <>
                    {/* GATE OVERLAY */}
                    {!hasSubmittedLead && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-sm p-4 overflow-y-auto animate-in fade-in duration-500">
                            <div className="bg-black border border-zinc-900 p-8 w-full max-w-4xl flex flex-col md:flex-row items-center md:items-stretch gap-8 md:gap-12 shadow-sm relative overflow-hidden my-auto max-h-[90vh]">
                                {/* Coluna Esquerda: Teaser */}
                                <div className="flex-1 flex flex-col items-center justify-center text-center space-y-6 md:border-r border-zinc-900 md:pr-12">
                                    <div className="inline-flex items-center gap-2 bg-zinc-950 px-3 py-1 border border-zinc-800">
                                        <div className={`w-1.5 h-1.5 ${finalScore >= 70 ? 'bg-zinc-200' : finalScore >= 40 ? 'bg-zinc-400' : 'bg-zinc-600'} animate-pulse`}></div>
                                        <span className="text-2xs font-mono font-bold text-zinc-400 tracking-wider uppercase">Análise Finalizada</span>
                                    </div>

                                    <div className="relative">
                                        <div className="text-8xl md:text-9xl font-black text-white tracking-tighter leading-none">{finalScore}</div>
                                    </div>

                                    <h3 className="text-sm font-medium text-zinc-400 leading-relaxed max-w-xs">
                                        Detectamos inconsistências críticas entre sua <span className="text-white font-bold">autoridade digital</span> e sua operação real.
                                    </h3>
                                </div>

                                {/* Coluna Direita: Formulário */}
                                <div className="flex-1 w-full max-w-md flex flex-col justify-center">
                                    <DiagnosticForm
                                        onSubmit={handleFormSubmit}
                                        isSubmitting={isSubmitting}
                                        title="Receber Relatório"
                                        subtitle="Score Blended: Respostas + Autoridade LinkedIn."
                                        variant="dark"
                                        showLinkedin={false}
                                        diagnosticType="Founder"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    <div className={`space-y-0 transition-all duration-700 ${!hasSubmittedLead ? 'blur-sm opacity-60 pointer-events-none' : ''}`}>

                        {/* DASHBOARD HEADLINE - Padronizado */}
                        <div className="mb-12 text-center animate-in fade-in slide-in-from-bottom-4 duration-1000 max-w-4xl mx-auto pt-8">
                            <div className="inline-flex items-center gap-2 mb-4 bg-zinc-900 border border-zinc-800 px-3 py-1 ">
                                <span className="w-1.5 h-1.5 bg-white "></span>
                                <span className="text-xxs font-mono font-bold text-zinc-400 uppercase tracking-widest">Status: Finalizado</span>
                            </div>
                            <h1 className="text-4xl md:text-6xl font-black text-white tracking-tighter mb-2">
                                Diagnóstico <span className="text-zinc-600">Founder</span>
                            </h1>
                            <p className="text-zinc-500 font-medium max-w-xl mx-auto">
                                Análise de posicionamento digital e alinhamento estratégico.
                            </p>
                        </div>


                        <div className="space-y-32">
                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch animate-fade-in duration-1000">
                                <div className="lg:col-span-4">
                                    <ScoreGauge
                                        score={finalScore}
                                        label="Founder Authority"
                                        description="Índice de autoridade e liberdade digital."
                                    />
                                </div>

                                <div className="lg:col-span-8 flex flex-col justify-center bg-zinc-900/50 border border-zinc-800 p-8 md:p-12 relative overflow-hidden">
                                    {/* AI Archetype Card */}
                                    {analysisResult ? (
                                        <div className="relative z-10 space-y-6">
                                            <div className="inline-flex items-center gap-2 bg-zinc-800 px-3 py-1 border border-zinc-700">
                                                <Brain className="w-3 h-3 text-zinc-300" />
                                                <span className="text-xxs font-mono font-bold text-zinc-300 uppercase tracking-widest">
                                                    Arquétipo Identificado
                                                </span>
                                            </div>

                                            <div>
                                                <h2 className="text-4xl md:text-5xl font-black text-white tracking-tighter mb-2">
                                                    {analysisResult.archetype.toUpperCase()}
                                                </h2>
                                                <p className="text-xl text-zinc-400 font-medium italic border-l-2 border-zinc-600 pl-4">
                                                    "{analysisResult.headline}"
                                                </p>
                                            </div>

                                            <p className="text-zinc-300 text-sm md:text-base leading-relaxed max-w-2xl bg-black/40 p-6 border border-zinc-800">
                                                {analysisResult.analysis}
                                            </p>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
                                                <div>
                                                    <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                                                        <span className="w-1.5 h-1.5 bg-zinc-300 "></span> Vantagens Competitivas
                                                    </h4>
                                                    <ul className="space-y-2">
                                                        {analysisResult.strengths.map((s, i) => (
                                                            <li key={i} className="text-white text-sm font-medium flex items-center gap-2">
                                                                <span className="text-zinc-600">0{i + 1}</span> {s}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                                <div>
                                                    <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                                                        <span className="w-1.5 h-1.5 bg-zinc-400"></span> Pontos Cegos
                                                    </h4>
                                                    <ul className="space-y-2">
                                                        {analysisResult.blindSpots.map((s, i) => (
                                                            <li key={i} className="text-white text-sm font-medium flex items-center gap-2">
                                                                <AlertTriangle className="w-3 h-3 text-zinc-500" /> {s}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex items-center justify-center h-full">
                                            <div className="flex flex-col items-center gap-4 text-zinc-500">
                                                <Loader2 className="w-8 h-8 animate-spin" />
                                                <span className="text-xs font-mono uppercase tracking-widest">Processando Inteligência...</span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>



                        {/* WHITE CONTENT SECTION */}
                        <div className="w-[100vw] relative left-[50%] right-[50%] -ml-[50vw] bg-white text-zinc-900 px-4 md:px-0 py-20 mt-32 border-t border-zinc-200">
                            <div className="max-w-6xl mx-auto">
                                {/* AI Branding Analysis */}
                                {analysisResult && (analysisResult.brandingGaps?.length || analysisResult.actionableInsight) ? (
                                    <section>
                                        <div className="space-y-6 mb-12 text-center md:text-left">
                                            <div className="inline-block bg-black text-white px-4 py-1.5 text-2xs font-mono uppercase tracking-[0.5em] font-black">
                                                DIAGNÓSTICO_DE_AUTORIDADE
                                            </div>
                                            <h2 className="text-5xl md:text-7xl font-black text-black tracking-tighter leading-none">
                                                {analysisResult.archetype}
                                            </h2>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
                                            {/* Branding Gaps */}
                                            <div className="border border-zinc-200 p-8 bg-white">
                                                <h4 className="text-xxs font-black uppercase tracking-[0.25em] text-zinc-900 mb-6 flex items-center gap-2">
                                                    <div className="w-2 h-2 bg-zinc-900" />
                                                    Gaps de Posicionamento
                                                </h4>
                                                <div className="space-y-4">
                                                    {(analysisResult.brandingGaps || []).map((g, i) => (
                                                        <div key={i} className="flex gap-3">
                                                            <span className="text-zinc-400 font-bold text-sm mt-0.5">✗</span>
                                                            <p className="text-zinc-700 text-sm font-medium leading-relaxed">{g}</p>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Perspectiva Técnica */}
                                            <div className="border border-zinc-200 p-8 bg-zinc-50">
                                                <h4 className="text-xxs font-black uppercase tracking-[0.25em] text-zinc-900 mb-6 flex items-center gap-2">
                                                    <div className="w-2 h-2 bg-revgreen" />
                                                    Perspectiva Técnica
                                                </h4>
                                                <p className="text-zinc-900 text-sm font-medium leading-relaxed">
                                                    {insights.description}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Actionable Insight Card */}
                                        {analysisResult.actionableInsight && (
                                            <div className="border-l-4 border-[#00CC6A] bg-zinc-50 rounded-r-2xl p-8 mb-16">
                                                <h4 className="text-xxs font-black uppercase tracking-[0.25em] text-zinc-500 mb-3">
                                                    Ação Imediata Recomendada
                                                </h4>
                                                <p className="text-zinc-900 text-base font-semibold leading-relaxed">
                                                    {analysisResult.actionableInsight}
                                                </p>
                                            </div>
                                        )}
                                    </section>
                                ) : (
                                    <section>
                                        <div className="space-y-6 mb-20 text-center md:text-left">
                                            <div className="inline-block bg-black text-white px-4 py-1.5 text-2xs font-mono uppercase tracking-[0.5em] font-black">
                                                DIAGNÓSTICO_DE_AUTORIDADE
                                            </div>
                                            <h2 className="text-5xl md:text-7xl font-black text-black tracking-tighter leading-none italic">
                                                {insights.title.split(' ')[0]} <span className="text-zinc-500">{insights.title.split(' ').slice(1).join(' ')}</span>
                                            </h2>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 mb-32 text-left">
                                            <div className="space-y-6 border-l border-zinc-200 pl-8">
                                                <h4 className="text-sm font-black !text-black uppercase tracking-widest flex items-center gap-3">
                                                    <div className="w-1.5 h-1.5 bg-black " />
                                                    Perspectiva Técnica
                                                </h4>
                                                <p className="!text-zinc-900 text-base leading-relaxed font-semibold">
                                                    {insights.description}
                                                </p>
                                            </div>

                                            <div className="space-y-6 border-l border-zinc-200 pl-8">
                                                <h4 className="text-sm font-black !text-black uppercase tracking-widest flex items-center gap-3">
                                                    <div className="w-1.5 h-1.5 bg-black " />
                                                    Plano de Ação
                                                </h4>
                                                <p className="!text-zinc-900 text-base leading-relaxed font-semibold">
                                                    Sua prioridade estratégica agora é: <strong className="!text-black bg-[#00CC6A]/20 px-1">{insights.action}</strong>.
                                                    O custo de ignorar este ajuste é a perda de autoridade para concorrentes menos qualificados porém mais barulhentos.
                                                </p>
                                            </div>
                                        </div>
                                    </section>
                                )}

                                {/* PREMISSAS SECTION */}
                                <section>
                                    <div className="space-y-6 mb-20">
                                        <div className="inline-block bg-black text-white px-4 py-1.5 text-2xs font-mono uppercase tracking-[0.5em] font-black">
                                            PREMISSAS_DE_ALINHAMENTO
                                        </div>
                                        <h2 className="text-5xl md:text-7xl font-black text-black tracking-tighter leading-none italic">
                                            Sua marca pessoal <span className="text-zinc-500">vende ou dorme?</span>
                                        </h2>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        {QUESTIONS.slice(0, 4).map((q, idx) => {
                                            const userAnswerScore = answers[idx];
                                            const userAnswerData = q.options.find(o => o.score === userAnswerScore);
                                            
                                            // Status based on performance (0-20 scale per question)
                                            const isCritical = userAnswerScore < 10;
                                            
                                            return (
                                                <div key={idx} className="bg-zinc-50 p-8 border border-zinc-200 hover:border-black transition-all duration-300 flex flex-col h-full">
                                                    <div className="flex items-start justify-between mb-4">
                                                        <h4 className="text-tiny font-black !text-black uppercase tracking-widest flex items-center gap-3">
                                                            <div className={`w-1.5 h-1.5 ${isCritical ? 'bg-red-500' : 'bg-black'}`} />
                                                            Pilar 0{idx + 1}
                                                        </h4>
                                                        {isCritical && <span className="text-2xs bg-red-100 text-red-600 px-2 py-0.5 font-bold uppercase tracking-widest">Crítico</span>}
                                                    </div>
                                                    
                                                    <h3 className="text-sm font-bold text-zinc-900 mb-3">{q.question}</h3>
                                                    
                                                    <div className="mb-4 bg-white border border-zinc-100 p-3 text-xs font-medium text-zinc-600">
                                                        <span className="block text-xxs text-zinc-400 uppercase tracking-widest mb-1">Seu Diagnóstico:</span>
                                                        "{userAnswerData?.label || 'Não Respondido'}"
                                                    </div>
                                                    
                                                    <div className="mt-auto border-t border-zinc-200 pt-4">
                                                        <p className="!text-zinc-900 text-xs leading-relaxed font-semibold">
                                                            Atenção: <span className="font-normal text-zinc-600">{q.log}</span>
                                                        </p>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </section>

                                {/* Final CTA Area - Standardized */}
                                <div className="mt-20">
                                    <DiagnosticActionSection
                                        title="Retome o Controle."
                                        subtitle="Agende um diagnóstico gratuito com um especialista para desenhar seu plano de ação e descentralizar."
                                        onCtaClick={() => setIsBookingModalOpen(true)}
                                    />

                                    <DiagnosticBookingModal
                                        isOpen={isBookingModalOpen}
                                        onClose={() => setIsBookingModalOpen(false)}
                                        diagnosticType="founder"
                                    />

                                    {/* Fallback MoFu CTA */}
                                    <div className="mt-8 mb-16 flex flex-col items-center justify-center text-center px-4">
                                        <span className="text-xxs font-mono text-zinc-400 uppercase tracking-widest mb-4">MUITO CEDO PARA UMA DEEP-DIVE CALL?</span>
                                        <button onClick={() => window.open('https://revhackers.com.br/')} className="text-xs font-semibold text-white bg-zinc-900 border border-zinc-700 px-6 py-3 hover:bg-zinc-800 transition-colors uppercase tracking-widest">Baixe o Playbook de Authority (Grátis)</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </DiagnosticLayout >
        </>
    );
};

export default FounderScore;
