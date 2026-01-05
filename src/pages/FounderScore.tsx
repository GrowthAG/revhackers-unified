
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';
import { submitPublicDiagnostic } from "@/api/publicDiagnostic";
import { analyzeFounderProfileAI, FounderAnalysisResult } from "@/api/founderAnalysis";
import { Brain, ArrowRight, Target, Users, Linkedin, Loader2, AlertTriangle } from 'lucide-react';
import { DiagnosticLayout } from '@/components/diagnostics/DiagnosticLayout';
import { DiagnosticForm, DiagnosticFormData } from '@/components/diagnostics/DiagnosticForm';
import { ScoreGauge } from '@/components/diagnostics/ScoreGauge';
import { MetricCard } from '@/components/diagnostics/MetricCard';
import { DiagnosticActionSection } from '@/components/diagnostics/DiagnosticActionSection';
import { getDiagnosticInsights } from '@/utils/diagnosticMapping';

// Questions centered on "Founder Led Sales & Authority"
const QUESTIONS = [
    {
        id: 1,
        question: "Como você classificaria seu Perfil no LinkedIn hoje?",
        options: [
            { label: "É uma 'Sales Letter': Converte visitantes em reuniões sozinho.", score: 20 },
            { label: "É um currículo digital bem feito, mas passivo.", score: 10 },
            { label: "Desatualizado ou incompleto (Vitrine abandonada).", score: 5 },
            { label: "Não tenho perfil ou não uso.", score: 0 }
        ],
        log: "Seu perfil é sua landing page pessoal. Ignore-o e perca dinheiro."
    },
    {
        id: 2,
        question: "Qual sua constância de produção de conteúdo?",
        options: [
            { label: "Consistente (3-5x/semana) com estratégia editorial clara.", score: 20 },
            { label: "Esporádico (Posto quando dá vontade ou sobra tempo).", score: 10 },
            { label: "Raro (Menos de 2x por mês).", score: 5 },
            { label: "Apenas repostagens ou conteúdo institucional chato.", score: 0 }
        ],
        log: "Constância gera confiança. Confiança gera vendas."
    },
    {
        id: 3,
        question: "Você produz 'Material Rico' (Ebooks, Frameworks, Playbooks)?",
        options: [
            { label: "Sim, empacoto meu conhecimento em ativos proprietários.", score: 20 },
            { label: "Apenas textos curtos ou artigos de opinião.", score: 10 },
            { label: "Tenho vontade, mas nunca parei para escrever.", score: 5 },
            { label: "Não, acho que conteúdo longo não funciona.", score: 0 }
        ],
        log: "Conteúdo denso (Long-Form) separa especialistas de amadores."
    },
    {
        id: 4,
        question: "Seus posts enchem a agenda do comercial?",
        options: [
            { label: "Sim, geramos reuniões qualificadas toda semana via Content.", score: 20 },
            { label: "Geram engajamento (likes/comentários), mas poucas vendas.", score: 10 },
            { label: "Tenho visibilidade, mas zero conversão em receita.", score: 5 },
            { label: "Não sei mensurar ou não geram nada.", score: 0 }
        ],
        log: "Engajamento sem conversão é apenas massagem no ego."
    },
    {
        id: 5,
        question: "Como o mercado percebe sua autoridade?",
        options: [
            { label: "Sou visto como referência/especialista no meu nicho.", score: 20 },
            { label: "Sou conhecido apenas pela minha rede próxima.", score: 10 },
            { label: "Sou 'mais um' na multidão.", score: 5 },
            { label: "Sou invisível para o mercado.", score: 0 }
        ],
        log: "Autoridade é a moeda mais forte da nova economia."
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

        setIsAnalyzing(true);

        // Simulation: "Scanning Profile..."
        setTimeout(() => {
            setIsAnalyzing(false);

            toast({
                className: "bg-zinc-900 border-zinc-800 text-white",
                title: "PERFIL LOCALIZADO",
                description: "Iniciando protocolo de diagnóstico de profundidade."
            });

            setStep('questions');
        }, 2000);
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
            if (currentQ < QUESTIONS.length - 1) {
                setShowLog(false);
                setSelectedOption(null);
                setCurrentQ(prev => prev + 1);
            } else {
                // FINAL DO QUIZ: Acionar IA
                setShowLog(false);
                setIsAnalyzing(true);

                // Chamada à API Gemini
                analyzeFounderProfileAI(linkedinUrl, updatedAnswers, newScore)
                    .then(result => {
                        setAnalysisResult(result);
                        setStep('results');

                        toast({
                            className: "bg-zinc-900 border-zinc-800 text-white",
                            title: "ANÁLISE DE IA CONCLUÍDA",
                            description: "Perfil comportamental gerado com sucesso."
                        });
                    })
                    .catch(err => {
                        console.error(err);
                        setStep('results'); // Avança mesmo com erro (vai usar mock)
                    })
                    .finally(() => setIsAnalyzing(false));
            }
        }, 1500);
    };

    const handleFormSubmit = async (data: DiagnosticFormData) => {
        setIsSubmitting(true);
        try {
            const result = getResultMap(score);
            const WEBHOOK_URL = 'https://services.leadconnectorhq.com/hooks/oFTw9DcsKRUj6xCiq4mb/webhook-trigger/a35d7d7a-ad2b-47cc-920e-15f1837b6ec7';

            // Merge Manual Data with Enriched Data
            const enrichedData = {
                ...data,
                linkedin: linkedinUrl,
                ...(analysisResult || {})
            };

            await submitPublicDiagnostic(
                { ...enrichedData, phone: '' },
                { answers, analysis: analysisResult, source: 'founder-score' },
                score,
                {
                    level: result.title,
                    description: result.msg,
                    action: "Agendar Call de Diagnóstico",
                    color: "revgreen"
                },
                WEBHOOK_URL
            );

            setHasSubmittedLead(true);
            toast({
                className: "bg-zinc-900 border-zinc-800 text-white",
                title: "DIAGNÓSTICO PROCESSADO",
                description: "Análise de perfil Founder gerada."
            });
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
            <DiagnosticLayout
                title="Diagnóstico de Founder"
                subtitle="Identifique se você é um CEO Estrategista ou um Gargalo Operacional."
                showGovernanceFooter={false}
                variant="light"
            >
                <div className="max-w-4xl mx-auto flex flex-col items-center">
                    <div className="bg-white border border-zinc-200 p-12 mb-8 relative overflow-hidden group w-full text-center hover:border-zinc-300 transition-colors rounded-3xl shadow-sm">
                        <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none transition-transform group-hover:scale-105 duration-1000">
                            <Brain className="w-64 h-64 text-black rotate-12" />
                        </div>

                        <div className="relative z-10 flex flex-col items-center max-w-2xl mx-auto">

                            {/* LinkedIn Input Action Area */}
                            <div className="mb-16 w-full">
                                <div className="flex flex-col md:flex-row gap-0 w-full border border-zinc-200 bg-white group-hover:border-zinc-300 transition-colors rounded-xl overflow-hidden shadow-sm mb-4">
                                    <span className="hidden md:flex items-center px-6 font-mono text-xs text-zinc-400 bg-zinc-50 border-r border-zinc-200 select-none gap-2">
                                        <Linkedin className="w-4 h-4" />
                                        linkedin.com/in/
                                    </span>
                                    <input
                                        type="text"
                                        value={linkedinUrl}
                                        onChange={(e) => setLinkedinUrl(e.target.value)}
                                        placeholder="seu-perfil"
                                        className="flex-1 bg-transparent border-none text-black h-16 px-6 focus:ring-0 outline-none font-bold text-lg placeholder:text-zinc-300"
                                    />
                                    <button
                                        onClick={() => handleStartDiagnostic(linkedinUrl)}
                                        disabled={!linkedinUrl}
                                        className="bg-black text-white px-8 h-16 font-bold text-xs tracking-wide hover:bg-zinc-800 transition-all duration-300 disabled:opacity-50 flex items-center justify-center gap-3 min-w-[140px]"
                                    >
                                        {isAnalyzing ? <Loader2 className="w-4 h-4 animate-spin" /> : <>ANALISAR <ArrowRight className="w-3 h-3" /></>}
                                    </button>
                                </div>
                                <p className="text-[10px] uppercase tracking-widest text-zinc-400 font-mono">
                                    *Usaremos IA para enriquecer seu perfil via Perplexity.
                                    <span className="block mt-1 opacity-60">Perfis com alta privacidade podem sofrer restrições na coleta de dados biográficos.</span>
                                </p>
                            </div>

                            {/* 3-Column Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full border-t border-zinc-100 pt-12">
                                <div className="flex flex-col items-center justify-center gap-4 group/item">
                                    <div className="w-12 h-12 flex items-center justify-center bg-zinc-50 border border-zinc-100 rounded-2xl group-hover/item:border-black group-hover/item:bg-black group-hover/item:text-white transition-all duration-500">
                                        <Brain className="w-5 h-5" />
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <span className="text-[10px] font-mono font-black text-zinc-400 uppercase tracking-widest">01 // Mindset</span>
                                        <span className="text-sm font-bold text-zinc-900">Mentalidade de Escala</span>
                                    </div>
                                </div>

                                <div className="flex flex-col items-center justify-center gap-4 group/item">
                                    <div className="w-12 h-12 flex items-center justify-center bg-zinc-50 border border-zinc-100 rounded-2xl group-hover/item:border-black group-hover/item:bg-black group-hover/item:text-white transition-all duration-500">
                                        <Target className="w-5 h-5" />
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <span className="text-[10px] font-mono font-black text-zinc-400 uppercase tracking-widest">02 // Decision</span>
                                        <span className="text-sm font-bold text-zinc-900">Tomada de Decisão</span>
                                    </div>
                                </div>

                                <div className="flex flex-col items-center justify-center gap-4 group/item">
                                    <div className="w-12 h-12 flex items-center justify-center bg-zinc-50 border border-zinc-100 rounded-2xl group-hover/item:border-black group-hover/item:bg-black group-hover/item:text-white transition-all duration-500">
                                        <Users className="w-5 h-5" />
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <span className="text-[10px] font-mono font-black text-zinc-400 uppercase tracking-widest">03 // Leadership</span>
                                        <span className="text-sm font-bold text-zinc-900">Gestão de Liderança</span>
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>
                </div>
            </DiagnosticLayout>
        );
    }

    return (
        <DiagnosticLayout
            title={step === 'results' ? "" : "Founder Score"}
            subtitle={step === 'results' ? "" : "Diagnóstico de Autoridade & Posicionamento"}
            variant={step === 'results' ? 'dark' : 'light'}
            centered={step === 'results'}
            hideHeader={step === 'results'}
            headerVariant={step === 'results' ? 'default' : 'light'}
        >
            {/* BACKDROP DE SEGURANÇA (Garante fundo preto total nos resultados) */}
            {step === 'results' && <div className="fixed inset-0 bg-black -z-50 pointer-events-none" />}
            {step === 'questions' && (
                <div className="max-w-3xl mx-auto flex flex-col items-center w-full min-h-[60vh] justify-center px-4 md:px-0">

                    {/* Header Clean */}
                    <div className="w-full flex items-center justify-between mb-8 border-b border-zinc-100 pb-2">
                        <div className="flex items-center gap-3">
                            <span className="w-2 h-2 bg-black rounded-full animate-pulse"></span>
                            <span className="text-xs font-mono font-medium text-zinc-500 tracking-wider">Protocolo de Diagnóstico</span>
                        </div>
                        <span className="text-xs font-mono font-medium text-zinc-400">0{currentQ + 1} / 0{QUESTIONS.length}</span>
                    </div>

                    <div className="w-full animate-fade-in flex flex-col items-center relative">
                        {/* Background Analysis Indicator - Adjusted Position */}
                        {isAnalyzing && (
                            <div className="absolute -top-12 right-0 flex items-center gap-2 bg-zinc-50 px-3 py-1 rounded-full border border-zinc-100 animate-pulse">
                                <Loader2 className="w-3 h-3 text-revgreen animate-spin" />
                                <span className="text-[10px] font-mono font-bold text-zinc-500 uppercase">Enriquecendo Perfil LinkedIn...</span>
                            </div>
                        )}

                        <AnimatePresence mode="wait">
                            <motion.div
                                key={currentQ}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="w-full flex flex-col items-center space-y-6"
                            >
                                <h2 className="text-3xl md:text-4xl font-bold text-black tracking-tight leading-tight text-center max-w-2xl">
                                    {QUESTIONS[currentQ].question}
                                </h2>

                                <div className="grid grid-cols-1 gap-3 w-full max-w-xl">
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
                            </motion.div>
                        </AnimatePresence>

                        {/* Minimal Log */}
                        <AnimatePresence>
                            {showLog && currentQData.log && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="absolute -bottom-32 left-0 right-0 mx-auto w-full max-w-xl text-center"
                                >
                                    <p className="text-xs font-medium text-zinc-500 bg-zinc-50 px-4 py-2 rounded-full inline-block border border-zinc-100">
                                        <span className="text-black font-bold mr-2">Insight:</span>{currentQData.log}
                                    </p>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            )}

            {step === 'results' && (
                <>
                    {/* GATE OVERLAY */}
                    {!hasSubmittedLead && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-sm p-4 overflow-y-auto animate-in fade-in duration-500">
                            <div className="bg-black border border-zinc-900 p-8 w-full max-w-4xl flex flex-col md:flex-row items-center md:items-stretch gap-8 md:gap-12 rounded-3xl shadow-2xl relative overflow-hidden my-auto max-h-[90vh]">
                                {/* Coluna Esquerda: Teaser */}
                                <div className="flex-1 flex flex-col items-center justify-center text-center space-y-6 md:border-r border-zinc-900 md:pr-12">
                                    <div className="inline-flex items-center gap-2 bg-zinc-950 px-3 py-1 rounded-full border border-zinc-900">
                                        <div className={`w-1.5 h-1.5 rounded-full ${finalScore >= 70 ? 'bg-revgreen' : finalScore >= 40 ? 'bg-yellow-500' : 'bg-red-500'} animate-pulse shadow-[0_0_10px_currentColor]`}></div>
                                        <span className="text-[9px] font-mono font-bold text-zinc-500 tracking-wider uppercase">Análise Finalizada</span>
                                    </div>

                                    <div className="relative">
                                        <div className="text-8xl md:text-9xl font-black text-white tracking-tighter leading-none shadow-black drop-shadow-2xl">{finalScore}</div>
                                    </div>

                                    <h3 className="text-sm font-medium text-zinc-400 leading-relaxed max-w-xs">
                                        Detectamos inconsistências críticas entre sua <span className="text-revgreen font-bold text-white">autoridade digital</span> e sua operação real.
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
                            <div className="inline-flex items-center gap-2 mb-4 bg-zinc-900 border border-zinc-800 px-3 py-1 rounded-full">
                                <span className="w-1.5 h-1.5 bg-revgreen rounded-full shadow-[0_0_10px_#03FC3B]"></span>
                                <span className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-widest">Status: Finalizado</span>
                            </div>
                            <h1 className="text-4xl md:text-6xl font-black text-white tracking-tighter mb-2">
                                Relatório de <span className="text-zinc-600">Autoridade</span>
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

                                <div className="lg:col-span-8 flex flex-col justify-center bg-zinc-900/50 border border-zinc-800 rounded-3xl p-8 md:p-12 relative overflow-hidden">
                                    {/* AI Archetype Card */}
                                    {analysisResult ? (
                                        <div className="relative z-10 space-y-6">
                                            <div className="inline-flex items-center gap-2 bg-revgreen/10 px-3 py-1 rounded-full border border-revgreen/20">
                                                <Brain className="w-3 h-3 text-revgreen" />
                                                <span className="text-[10px] font-mono font-bold text-revgreen uppercase tracking-widest">
                                                    Arquétipo Identificado
                                                </span>
                                            </div>

                                            <div>
                                                <h2 className="text-4xl md:text-5xl font-black text-white tracking-tighter mb-2">
                                                    {analysisResult.archetype.toUpperCase()}
                                                </h2>
                                                <p className="text-xl text-zinc-400 font-medium italic border-l-2 border-revgreen pl-4">
                                                    "{analysisResult.headline}"
                                                </p>
                                            </div>

                                            <p className="text-zinc-300 text-sm md:text-base leading-relaxed max-w-2xl bg-black/40 p-6 rounded-xl border border-zinc-800">
                                                {analysisResult.analysis}
                                            </p>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
                                                <div>
                                                    <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                                                        <span className="w-1.5 h-1.5 bg-revgreen rounded-full"></span> Superpoderes
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
                                                        <span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span> Pontos Cegos
                                                    </h4>
                                                    <ul className="space-y-2">
                                                        {analysisResult.blindSpots.map((s, i) => (
                                                            <li key={i} className="text-white text-sm font-medium flex items-center gap-2">
                                                                <AlertTriangle className="w-3 h-3 text-red-500" /> {s}
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
                                {/* Standardized Personalization Section */}
                                <section>
                                    <div className="space-y-6 mb-20 text-center md:text-left">
                                        <div className="inline-block bg-black text-white px-4 py-1.5 text-[9px] font-mono uppercase tracking-[0.5em] font-black">
                                            DIAGNÓSTICO_DE_AUTORIDADE
                                        </div>
                                        <h2 className="text-5xl md:text-7xl font-black text-black tracking-tighter leading-none italic">
                                            {insights.title.split(' ')[0]} <span className="text-zinc-500">{insights.title.split(' ').slice(1).join(' ')}</span>
                                        </h2>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-16 mb-32 text-left">
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
                                                Sua prioridade estratégica agora é: <strong className="!text-black bg-yellow-300 px-1">{insights.action}</strong>.
                                                O custo de ignorar este ajuste é a perda de autoridade para concorrentes menos qualificados porém mais barulhentos.
                                            </p>
                                        </div>
                                    </div>
                                </section>

                                {/* PREMISSAS SECTION */}
                                <section>
                                    <div className="space-y-6 mb-20">
                                        <div className="inline-block bg-black text-white px-4 py-1.5 text-[9px] font-mono uppercase tracking-[0.5em] font-black">
                                            PREMISSAS_DE_ALINHAMENTO
                                        </div>
                                        <h2 className="text-5xl md:text-7xl font-black text-black tracking-tighter leading-none italic">
                                            Sua marca pessoal <span className="text-zinc-500">vende ou dorme?</span>
                                        </h2>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="bg-zinc-50 p-8 rounded-2xl border border-zinc-200 hover:border-black transition-all duration-300">
                                            <h4 className="text-sm font-black !text-black uppercase tracking-widest flex items-center gap-3 mb-4">
                                                <div className="w-1.5 h-1.5 bg-black rounded-full" />
                                                O "Custo da Invisibilidade"
                                            </h4>
                                            <p className="!text-zinc-900 text-base leading-relaxed font-semibold">
                                                Se você não publica, o mercado assume que você fechou ou estagnou. Identificamos que sua presença digital não reflete a qualidade real da sua entrega. Você está deixando dinheiro na mesa por "timidez estratégica".
                                            </p>
                                        </div>
                                        <div className="bg-zinc-50 p-8 rounded-2xl border border-zinc-200 hover:border-black transition-all duration-300">
                                            <h4 className="text-sm font-black !text-black uppercase tracking-widest flex items-center gap-3 mb-4">
                                                <div className="w-1.5 h-1.5 bg-black rounded-full" />
                                                Métricas de Vaidade
                                            </h4>
                                            <p className="!text-zinc-900 text-base leading-relaxed font-semibold">
                                                Likes não pagam boletos. O diagnóstico aponta que seu conteúdo (quando existe) não tem "Call to Value" claro. Precisamos transformar leitores em leads qualificados, não apenas fãs.
                                            </p>
                                        </div>
                                        <div className="bg-zinc-50 p-8 rounded-2xl border border-zinc-200 hover:border-black transition-all duration-300">
                                            <h4 className="text-sm font-black !text-black uppercase tracking-widest flex items-center gap-3 mb-4">
                                                <div className="w-1.5 h-1.5 bg-black rounded-full" />
                                                Autoridade Proprietária
                                            </h4>
                                            <p className="!text-zinc-900 text-base leading-relaxed font-semibold">
                                                Falta "Intellectual Property" (IP). Você vende serviços, mas deveria vender Metodologia. Sem frameworks visuais e materiais ricos, você é uma commodity comparável por preço.
                                            </p>
                                        </div>
                                        <div className="bg-zinc-50 p-8 rounded-2xl border border-zinc-200 hover:border-black transition-all duration-300">
                                            <h4 className="text-sm font-black !text-black uppercase tracking-widest flex items-center gap-3 mb-4">
                                                <div className="w-1.5 h-1.5 bg-black rounded-full" />
                                                Máquina de Inbound
                                            </h4>
                                            <p className="!text-zinc-900 text-base leading-relaxed font-semibold">
                                                O objetivo final não é ser "famoso", é ter previsibilidade. Sua operação de Founder Led Sales precisa sair do "post aleatório" para um Sistema de Distribuição que enche a agenda de vendas sozinho.
                                            </p>
                                        </div>
                                    </div>
                                </section>

                                {/* Final CTA Area - Standardized */}
                                <div className="mt-20">
                                    <DiagnosticActionSection
                                        title="Transforme esse diagnóstico em plano de ação de 30 dias."
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </DiagnosticLayout >
    );
};

export default FounderScore;
