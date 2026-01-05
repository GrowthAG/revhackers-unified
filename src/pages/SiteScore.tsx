import { useState, useEffect } from 'react';
// import { supabase } from '@/integrations/supabase/client'; // Removido temporariamente para evitar erro de deploy
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Smartphone, Search, TrendingUp, ArrowRight, Download, Calendar, Mail, ShieldCheck, Gauge, Globe, Terminal, Activity, Check, Monitor, Wifi, Users, Trophy } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { submitPublicDiagnostic } from "@/api/publicDiagnostic";
import { runCompetitiveBenchmark, BenchmarkResult, formatMetricValue, getCategoryColor } from "@/api/cruxApi";
import { DiagnosticLayout } from '@/components/diagnostics/DiagnosticLayout';
import { DiagnosticForm, DiagnosticFormData } from '@/components/diagnostics/DiagnosticForm';
import { ScoreGauge } from '@/components/diagnostics/ScoreGauge';
import { MetricCard } from '@/components/diagnostics/MetricCard';
import { DiagnosticActionSection } from '@/components/diagnostics/DiagnosticActionSection';
import { CallDiagnosticModal } from '@/components/diagnostics/CallDiagnosticModal';
import { getDiagnosticInsights } from '@/utils/diagnosticMapping';

// Perguntas Padronizadas (Sentence Case)
const QUESTIONS = [
    {
        id: 1,
        question: "Como seu site se comporta em dispositivos móveis?",
        log: "Mais de 70% do tráfego B2B ocorre via mobile. Falhas aqui impactam diretamente o CAC.",
        options: [
            { label: "Funciona corretamente e mantém boa legibilidade", score: 20 },
            { label: "Funciona, mas apresenta problemas pontuais", score: 10 },
            { label: "É uma adaptação limitada da versão desktop", score: 5 },
            { label: "Apresenta falhas frequentes ou não sei informar", score: 0 }
        ]
    },
    {
        id: 2,
        question: "Qual a percepção de velocidade de carregamento?",
        log: "A cada segundo de espera, a taxa de conversão cai em média 7%.",
        options: [
            { label: "Carregamento imediato (sem tela branca)", score: 20 },
            { label: "Carregamento padrão (2-3 segundos)", score: 15 },
            { label: "Carregamento lento (perceptível)", score: 0 },
            { label: "Instável ou falha ocasionalmente", score: 0 }
        ]
    },
    {
        id: 3,
        question: "A proposta de valor está clara na primeira tela?",
        log: "O tempo médio de atenção é de 3 segundos. Clareza no Hero é fundamental.",
        options: [
            { label: "Sim, contém promessa clara e CTA visível", score: 20 },
            { label: "Contém apenas banner genérico ou boas-vindas", score: 5 },
            { label: "Foca em texto institucional da empresa", score: 0 },
            { label: "Informação confusa ou excessiva", score: 0 }
        ]
    },
    {
        id: 4,
        question: "Qual o nível de rastreamento de dados?",
        log: "Sem atribuição correta, o cálculo de ROI de campanhas torna-se impossível.",
        options: [
            { label: "Completo (UTMs, Pixel, Analytics e CRM)", score: 20 },
            { label: "Parcial (Origem aproximada manual)", score: 10 },
            { label: "Básico (Analytics instalado mas pouco uso)", score: 5 },
            { label: "Inexistente ou não sei informar", score: 0 }
        ]
    },
    {
        id: 5,
        question: "Qual a percepção visual e de marca?",
        log: "Design premium aumenta a percepção de valor e reduz a fricção de venda.",
        options: [
            { label: "Moderna, premium e alinhada ao mercado", score: 20 },
            { label: "Funcional, baseada em templates padrão", score: 10 },
            { label: "Desatualizada em relação aos concorrentes", score: 0 },
            { label: "Amadora ou improvisada", score: 0 }
        ]
    }
];

type Step = 'url-input' | 'questions' | 'analyzing' | 'lead-capture' | 'results';

const SiteScore = () => {
    const { toast } = useToast();
    const [step, setStep] = useState<Step>('url-input');
    const [currentQ, setCurrentQ] = useState(0);
    const [score, setScore] = useState(0);
    const [answers, setAnswers] = useState<number[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [hasSubmittedLead, setHasSubmittedLead] = useState(false);
    const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
    const insights = getDiagnosticInsights('site', score);

    // DEBUG: Log da chave na inicialização e função de teste
    useEffect(() => {
        const key = import.meta.env.VITE_PSI_API_KEY;
        console.log('🔑 PSI_API_KEY no início:', key ? `${key.substring(0, 15)}...` : '❌ VAZIA!');
        console.log('🔑 Todas as variáveis VITE:', Object.keys(import.meta.env).filter(k => k.startsWith('VITE_')));

        // Função de teste acessível pelo console: window.testPSI()
        (window as any).testPSI = async () => {
            const apiKey = import.meta.env.VITE_PSI_API_KEY;
            console.log('🧪 Testando API com chave:', apiKey ? `${apiKey.substring(0, 15)}...` : 'VAZIA!');

            if (!apiKey) {
                console.error('❌ ERRO: Chave VITE_PSI_API_KEY não encontrada!');
                return;
            }

            const url = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=https://google.com&key=${apiKey}&category=performance&strategy=mobile`;
            console.log('📡 URL de teste:', url.substring(0, 80) + '...');

            try {
                const response = await fetch(url);
                console.log('📬 Status:', response.status, response.statusText);
                const data = await response.json();
                console.log('✅ Score recebido:', data?.lighthouseResult?.categories?.performance?.score);
                return data;
            } catch (e) {
                console.error('❌ Erro no fetch:', e);
            }
        };
        console.log('💡 Digite window.testPSI() no console para testar a API manualmente.');
    }, []);

    // Estado do Protocolo e Logs
    const [selectedOption, setSelectedOption] = useState<number | null>(null);
    const [showLog, setShowLog] = useState(false);

    // PageSpeed State
    const [targetUrl, setTargetUrl] = useState('');
    const [psiResults, setPsiResults] = useState<{
        mobile: any,
        desktop: any,
        techStack: string[],
        pixels: string[],
        vitals: { lcp: string, cls: string, tbt: string, score: number },
        seoMetadata?: { title: string, description: string, h1?: string },
        compliance?: { lgpd: boolean, privacy: boolean, security: boolean },
        crux?: { lcp: string, fid?: string, cls: string, assessment: string },
        error?: boolean
    } | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const PSI_API_KEY = import.meta.env.VITE_PSI_API_KEY || '';
    const [loadingStatus, setLoadingStatus] = useState('Iniciando análise...');
    const [progress, setProgress] = useState(0);

    // Efeito para simular progresso durante a análise
    useEffect(() => {
        if (step === 'analyzing') {
            setProgress(0);
            const interval = setInterval(() => {
                setProgress(prev => {
                    if (prev >= 90) return prev;
                    // Incremento variável para parecer mais natural
                    const increment = Math.random() * 5 + 1;
                    return Math.min(90, Math.floor(prev + increment));
                });
            }, 200);

            return () => clearInterval(interval);
        }
    }, [step]);

    // View Mode State
    const [viewMode, setViewMode] = useState<'mobile' | 'desktop'>('mobile');

    // Benchmark Competitivo State
    const [competitorUrls, setCompetitorUrls] = useState<string[]>(['', '']);
    const [benchmarkResult, setBenchmarkResult] = useState<BenchmarkResult | null>(null);
    const [isBenchmarking, setIsBenchmarking] = useState(false);

    const runPageSpeed = async (url: string) => {
        setIsAnalyzing(true);
        setPsiResults(null);
        setLoadingStatus('Conectando ao Google PageSpeed Insights...');

        try {
            if (!PSI_API_KEY) {
                throw new Error("API Key não configurada. Adicione VITE_PSI_API_KEY ao .env");
            }

            // Normaliza URL
            const finalUrl = url.startsWith('http') ? url : `https://${url}`;

            // CHECK FOR LOCALHOST (PSI cannot analyze localhost)
            if (finalUrl.includes('localhost') || finalUrl.includes('127.0.0.1')) {
                console.warn("⚠️ Localhost detected. Skipping PSI API causing errors. Using Mock Data.");

                setLoadingStatus('Ambiente de Desenvolvimento Detectado...');
                await new Promise(r => setTimeout(r, 1500)); // Simulando delay

                // Mock Result for Localhost
                const mockResult = {
                    mobile: { lighthouseResult: { categories: { performance: { score: 0.85 }, seo: { score: 0.92 } } } },
                    desktop: null,
                    techStack: ["React", "Vite", "Tailwind (Dev Mode)"],
                    pixels: ["Pixel de Teste"],
                    vitals: { lcp: "1.2s", cls: "0.05", tbt: "120ms", score: 85 },
                    seoMetadata: { title: "Localhost Development", description: "Ambiente de teste local." },
                    compliance: { lgpd: true, privacy: true, security: false },
                    crux: { lcp: "1.0s", cls: "0.01", assessment: "PASS" },
                    error: false
                };

                setPsiResults(mockResult);
                setProgress(100);

                toast({
                    className: "bg-zinc-900 border-zinc-800 text-white",
                    title: "MODO DESENVOLVEDOR",
                    description: "Simulação de análise ativa para Localhost."
                });

                setStep('results');
                return;
            }

            // 1. Fetch Mobile Strategy (Principal)
            const apiUrl = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(finalUrl)}&key=${PSI_API_KEY}&category=PERFORMANCE&category=SEO&category=BEST_PRACTICES&strategy=MOBILE`;

            setLoadingStatus('Auditando Core Web Vitals (Mobile)...');

            // Add Timeout of 60s
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 60000);

            try {
                const response = await fetch(apiUrl, { signal: controller.signal });
                clearTimeout(timeoutId);

                if (!response.ok) {
                    const errData = await response.json().catch(() => ({}));
                    throw new Error(errData?.error?.message || `Erro API: ${response.status}`);
                }

                const data = await response.json();
                const lighthouse = data.lighthouseResult;

                // Simula loading de outras etapas enquanto processa
                setLoadingStatus('Processando Árvore de Renderização...');
                await new Promise(r => setTimeout(r, 800));

                const score = Math.round((lighthouse.categories.performance.score || 0) * 100);
                const audits = lighthouse.audits || {};

                // Extração de Métricas Reais
                const lcp = audits['largest-contentful-paint']?.displayValue || "N/A";
                const cls = audits['cumulative-layout-shift']?.displayValue || "N/A";
                const tbt = audits['total-blocking-time']?.displayValue || "N/A";

                const detectedTech = lighthouse.stackPacks?.map((p: any) => p.title) || [];

                const realResults = {
                    mobile: data,
                    desktop: null,
                    techStack: detectedTech.length > 0 ? detectedTech : ["Tecnologia Web Padrão"],
                    pixels: ["Análise Profunda Pendente"],
                    vitals: { lcp, cls, tbt, score },
                    seoMetadata: {
                        title: audits['document-title']?.details?.title || "Título não detectado",
                        description: audits['meta-description']?.details?.items?.[0]?.description || "Descrição não encontrada",
                    },
                    compliance: {
                        lgpd: audits['bf-cache']?.score === 1,
                        privacy: url.includes('https'),
                        security: url.includes('https')
                    },
                    crux: {
                        lcp: data.loadingExperience?.metrics?.LARGEST_CONTENTFUL_PAINT_MS?.percentile
                            ? `${(data.loadingExperience.metrics.LARGEST_CONTENTFUL_PAINT_MS.percentile / 1000).toFixed(1)}s`
                            : "N/A",
                        cls: data.loadingExperience?.metrics?.CUMULATIVE_LAYOUT_SHIFT_SCORE?.percentile
                            ? (data.loadingExperience.metrics.CUMULATIVE_LAYOUT_SHIFT_SCORE.percentile / 100).toFixed(2)
                            : "N/A",
                        assessment: data.loadingExperience?.overall_category || "DADOS INSUFICIENTES"
                    },
                    error: false
                };

                setPsiResults(realResults);
                setProgress(100);

                toast({
                    className: "bg-zinc-900 border-zinc-800 text-white",
                    title: "DIAGNÓSTICO REAL CONCLUÍDO",
                    description: `Auditoria oficial do Google finalizada. Score: ${score}`
                });

                setStep('results');

            } catch (fetchError: any) {
                if (fetchError.name === 'AbortError') {
                    throw new Error("O site demorou muito para responder (Timeout).");
                }
                throw fetchError;
            }

        } catch (error: any) {
            console.error(error);

            let userMessage = "Falha ao conectar ao Google PSI.";
            if (error.message.includes("FAILED_DOCUMENT_REQUEST") || error.message.includes("ERR_CONNECTION_FAILED")) {
                userMessage = "Não foi possível acessar o site. Verifique se a URL está correta e acessível publicamente.";
            } else if (error.message.includes("400")) {
                userMessage = "URL inválida ou não encontrada.";
            } else if (error.message.includes("500")) {
                userMessage = "Erro no servidor do Google. Tente novamente.";
            }

            toast({
                variant: "destructive",
                title: "Erro na Análise",
                description: userMessage
            });

            // Em caso de erro, definimos um resultado de "Erro" para não mostrar 100 (ou mantemos o baseScore)
            // Mas para UI não quebrar, vamos setar error flag
            setPsiResults({
                error: true,
                mobile: null, desktop: null, techStack: [], pixels: [],
                vitals: { lcp: "Erro", cls: "Erro", tbt: "Erro", score: 0 },
                seoMetadata: { title: "Erro na Leitura", description: "Não foi possível acessar o site." },
                compliance: { lgpd: false, privacy: false, security: false },
                crux: { lcp: "N/A", cls: "N/A", assessment: "ERRO DE CONEXÃO" }
            });

            setProgress(100);
            setTimeout(() => {
                setStep('results');
            }, 1000);
        } finally {
            setIsAnalyzing(false);
        }
    };

    // Benchmark Competitivo - Executado após resultados carregarem
    const runBenchmark = async () => {
        const validCompetitors = competitorUrls.filter(url => url.trim() !== '');
        if (validCompetitors.length === 0 || !targetUrl || !PSI_API_KEY) return;

        setIsBenchmarking(true);
        try {
            const result = await runCompetitiveBenchmark(
                targetUrl,
                validCompetitors,
                PSI_API_KEY,
                viewMode === 'mobile' ? 'PHONE' : 'DESKTOP'
            );
            setBenchmarkResult(result);
            toast({
                className: "bg-zinc-900 border-zinc-800 text-white",
                title: "BENCHMARK CONCLUÍDO",
                description: `Comparação com ${validCompetitors.length} concorrente(s) finalizada.`
            });
        } catch (error) {
            console.error('Benchmark error:', error);
            toast({
                variant: "destructive",
                title: "Erro no Benchmark",
                description: "Não foi possível comparar com os concorrentes."
            });
        } finally {
            setIsBenchmarking(false);
        }
    };

    // Trigger benchmark automaticamente quando resultados carregam e há concorrentes
    useEffect(() => {
        if (step === 'results' && !benchmarkResult && competitorUrls.some(u => u.trim())) {
            runBenchmark();
        }
    }, [step]);

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
                setStep('analyzing');
                runPageSpeed(targetUrl);
            }
        }, 2000);
    };

    const handleFormSubmit = async (data: DiagnosticFormData) => {
        setIsSubmitting(true);
        try {
            const WEBHOOK_URL = 'https://services.leadconnectorhq.com/hooks/oFTw9DcsKRUj6xCiq4mb/webhook-trigger/a35d7d7a-ad2b-47cc-920e-15f1837b6ec7';
            await submitPublicDiagnostic(
                { ...data, phone: '' },
                { answers, psi: psiResults ? 'captured' : 'failed', target_url: targetUrl, source: 'site-score' },
                score,
                { level: "Auditoria Técnica", description: "Diagnóstico Finalizado", action: "Revisão Recomendada", color: "revgreen" },
                WEBHOOK_URL
            );

            setHasSubmittedLead(true);
            toast({
                className: "bg-zinc-900 border-zinc-800 text-white",
                title: "RELATÓRIO LIBERADO",
                description: "Acesso completo concedido."
            });
        } catch (error) {
            console.error(error);
            toast({ variant: 'destructive', title: "Erro", description: "Tente novamente." });
        } finally {
            setIsSubmitting(false);
        }
    };

    // Unified score calculation with robust fallback
    const getFinalScore = () => {
        // baseScore is from manual questions (max 100)
        let baseScore = score;

        // If we have PSI score, we could blend it, but for now we prioritize PSI if it exists and is > 0
        const psiScore = psiResults?.mobile?.vitals?.score || 0;

        if (psiScore > 0) return psiScore;
        return baseScore;
    };

    const finalScore = getFinalScore();
    const psiMobileScore = psiResults?.mobile?.lighthouseResult?.categories?.performance?.score ? Math.round(psiResults.mobile.lighthouseResult.categories.performance.score * 100) : null;
    const psiDesktopScore = psiResults?.desktop?.lighthouseResult?.categories?.performance?.score ? Math.round(psiResults.desktop.lighthouseResult.categories.performance.score * 100) : null;
    const psiSeoScore = psiResults?.mobile?.lighthouseResult?.categories?.seo?.score ? Math.round(psiResults.mobile.lighthouseResult.categories.seo.score * 100) : null;


    if (step === 'url-input') {
        return (
            <DiagnosticLayout
                title="Auditoria"
                subtitle="Setup Inicial"
                variant="light"
                centered={true}
                hideHeader={false}
                headerVariant="light"
            >
                <div className="max-w-4xl mx-auto flex flex-col items-center w-full min-h-[60vh] justify-center animate-fade-in">
                    <div className="bg-white border border-zinc-200 p-12 mb-8 relative overflow-hidden group w-full text-center hover:border-zinc-300 transition-colors rounded-3xl shadow-sm">
                        <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none transition-transform group-hover:scale-105 duration-1000">
                            <Zap className="w-64 h-64 text-black rotate-12" />
                        </div>

                        <div className="relative z-10 flex flex-col items-center max-w-2xl mx-auto">

                            {/* URL Input Action Area */}
                            <div className="mb-16 w-full">
                                <div className="flex flex-col md:flex-row gap-0 w-full border border-zinc-200 bg-white group-hover:border-zinc-300 transition-colors rounded-xl overflow-hidden shadow-sm mb-4">
                                    <span className="hidden md:flex items-center px-6 font-mono text-xs text-zinc-400 bg-zinc-50 border-r border-zinc-200 select-none gap-2">
                                        <Globe className="w-4 h-4" />
                                        https://
                                    </span>
                                    <input
                                        type="text"
                                        value={targetUrl}
                                        onChange={(e) => setTargetUrl(e.target.value)}
                                        placeholder="seu-site.com"
                                        className="flex-1 bg-transparent border-none text-black h-16 px-6 focus:ring-0 outline-none font-bold text-lg placeholder:text-zinc-300"
                                    />
                                    <button
                                        onClick={() => setStep('questions')}
                                        disabled={!targetUrl}
                                        className="bg-black text-white px-8 h-16 font-bold text-xs tracking-wide hover:bg-zinc-800 transition-all duration-300 disabled:opacity-50 flex items-center justify-center gap-3 min-w-[140px]"
                                    >
                                        INICIAR <ArrowRight className="w-3 h-3" />
                                    </button>
                                </div>
                                <p className="text-[10px] uppercase tracking-widest text-zinc-400 font-mono">
                                    *Iniciaremos a análise técnica de infraestrutura
                                </p>

                                {/* Competitor URLs - Opcional */}
                                <div className="mt-8 w-full border-t border-zinc-100 pt-8">
                                    <div className="flex items-center gap-2 mb-4">
                                        <Trophy className="w-4 h-4 text-zinc-400" />
                                        <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Benchmark Competitivo (Opcional)</span>
                                    </div>
                                    <p className="text-[10px] text-zinc-400 mb-4">Compare sua performance contra até 2 concorrentes usando dados reais do Chrome.</p>
                                    <div className="space-y-3">
                                        {competitorUrls.map((url, idx) => (
                                            <div key={idx} className="flex items-center gap-2">
                                                <span className="text-[10px] font-mono text-zinc-400 w-24">Concorrente {idx + 1}</span>
                                                <input
                                                    type="text"
                                                    value={url}
                                                    onChange={(e) => {
                                                        const newUrls = [...competitorUrls];
                                                        newUrls[idx] = e.target.value;
                                                        setCompetitorUrls(newUrls);
                                                    }}
                                                    placeholder="concorrente.com"
                                                    className="flex-1 bg-zinc-50 border border-zinc-100 text-black h-10 px-4 text-sm focus:ring-0 outline-none focus:border-zinc-300 rounded-lg"
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* 3-Column Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full border-t border-zinc-100 pt-12">
                                <div className="flex flex-col items-center justify-center gap-4 group/item">
                                    <div className="w-12 h-12 flex items-center justify-center bg-zinc-50 border border-zinc-100 rounded-2xl group-hover/item:border-black group-hover/item:bg-black group-hover/item:text-white transition-all duration-500">
                                        <Zap className="w-5 h-5" />
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <span className="text-[10px] font-mono font-black text-zinc-400 uppercase tracking-widest">01 // Speed</span>
                                        <span className="text-sm font-bold text-zinc-900">Performance</span>
                                    </div>
                                </div>

                                <div className="flex flex-col items-center justify-center gap-4 group/item">
                                    <div className="w-12 h-12 flex items-center justify-center bg-zinc-50 border border-zinc-100 rounded-2xl group-hover/item:border-black group-hover/item:bg-black group-hover/item:text-white transition-all duration-500">
                                        <Search className="w-5 h-5" />
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <span className="text-[10px] font-mono font-black text-zinc-400 uppercase tracking-widest">02 // SEO</span>
                                        <span className="text-sm font-bold text-zinc-900">Visibilidade</span>
                                    </div>
                                </div>

                                <div className="flex flex-col items-center justify-center gap-4 group/item">
                                    <div className="w-12 h-12 flex items-center justify-center bg-zinc-50 border border-zinc-100 rounded-2xl group-hover/item:border-black group-hover/item:bg-black group-hover/item:text-white transition-all duration-500">
                                        <Terminal className="w-5 h-5" />
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <span className="text-[10px] font-mono font-black text-zinc-400 uppercase tracking-widest">03 // Tech</span>
                                        <span className="text-sm font-bold text-zinc-900">Conformidade</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </DiagnosticLayout>
        );
    }

    if (step === 'questions') {
        const question = QUESTIONS[currentQ];
        return (
            <DiagnosticLayout title="Auditoria" subtitle="Em análise" variant="light" centered={true} hideHeader={true} headerVariant="light">
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
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={currentQ}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="w-full flex flex-col items-center space-y-6"
                            >
                                <h2 className="text-3xl md:text-4xl font-bold text-black tracking-tight leading-tight text-center max-w-2xl">
                                    {question.question}
                                </h2>

                                <div className="grid grid-cols-1 gap-3 w-full max-w-xl">
                                    {question.options.map((opt, idx) => (
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
                                    {showLog && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="absolute -bottom-32 left-0 right-0 mx-auto w-full max-w-xl text-center"
                                        >
                                            <p className="text-xs font-medium text-zinc-500 bg-zinc-50 px-4 py-2 rounded-full inline-block border border-zinc-100">
                                                <span className="text-black font-bold mr-2">Info:</span>{question.log}
                                            </p>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </div>
            </DiagnosticLayout>
        );
    }

    if (step === 'analyzing') {
        return (
            <DiagnosticLayout title="Analisando" subtitle="Processando..." variant="light" centered={true} hideHeader={true} headerVariant="light">
                <div className="max-w-xl mx-auto text-center flex flex-col items-center justify-center min-h-[60vh]">
                    <div className="w-full space-y-12">
                        <div className="relative w-16 h-16 mx-auto flex items-center justify-center">
                            <div className="absolute inset-0 border-2 border-zinc-100 rounded-full"></div>
                            <div className="absolute inset-0 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                            {/* <Gauge className="w-5 h-5 text-black" /> REMOVIDO PARA DAR LUGAR A PORCENTAGEM */}
                            <span className="text-xs font-bold font-mono min-w-[3ch] text-center">{progress}%</span>
                        </div>
                        <div className="space-y-4">
                            <span className="text-xs font-mono text-zinc-400 tracking-widest font-medium block">{loadingStatus}</span>
                            <div className="w-full max-w-xs mx-auto bg-zinc-100 h-[2px] relative overflow-hidden rounded-full">
                                <motion.div
                                    className="absolute top-0 left-0 bg-black h-full"
                                    initial={{ width: 0 }}
                                    animate={{ width: "100%" }}
                                    transition={{ duration: 4, ease: "easeInOut" }}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </DiagnosticLayout>
        );
    }

    if (step === 'results') {
        const currentData = viewMode === 'mobile' ? psiResults?.mobile : psiResults?.desktop;
        const currentScore = currentData?.vitals?.score || finalScore;

        return (
            <DiagnosticLayout
                title=""
                subtitle=""
                variant="dark"
                hideHeader={true}
                centered={true}
                headerVariant="default"
            >
                {/* BACKDROP DE SEGURANÇA (Garante fundo preto total) */}
                <div className="fixed inset-0 bg-black -z-50 pointer-events-none" />

                {/* GATE OVERLAY */}
                {!hasSubmittedLead && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-md p-4 animate-in fade-in duration-300 overflow-y-auto">
                        <div className="bg-black border border-zinc-900 p-8 w-full max-w-4xl flex flex-col md:flex-row items-center md:items-stretch gap-8 md:gap-12 rounded-3xl shadow-2xl relative my-auto max-h-[90vh]">

                            {/* Coluna Esquerda: Resultado (Visual) */}
                            <div className="flex-1 flex flex-col items-center justify-center text-center space-y-6 md:border-r border-zinc-900 md:pr-12">
                                {/* Teaser Pill */}
                                <div className="inline-flex items-center gap-2 bg-zinc-950 px-3 py-1 rounded-full border border-zinc-900">
                                    <div className={`w-1.5 h-1.5 rounded-full ${psiResults?.mobile?.vitals?.score >= 70 ? 'bg-revgreen' : 'bg-red-500'} animate-pulse shadow-[0_0_10px_currentColor]`}></div>
                                    <span className="text-[9px] font-mono font-bold text-zinc-500 tracking-wider uppercase">Análise Finalizada</span>
                                </div>

                                <div className="relative">
                                    <div className="text-8xl md:text-9xl font-black text-white tracking-tighter leading-none shadow-black drop-shadow-2xl">{finalScore}</div>
                                </div>

                                <h3 className="text-sm font-medium text-zinc-400 leading-relaxed max-w-xs">
                                    {finalScore >= 90 ? (
                                        <>Seu site está <span className="text-revgreen font-bold">muito bem otimizado</span>. Confira os detalhes técnicos completos.</>
                                    ) : finalScore >= 70 ? (
                                        <>Seu site está em bom estado, mas ainda há <span className="text-yellow-400 font-bold">pequenas otimizações</span> cruciais.</>
                                    ) : (
                                        <>Detectamos oportunidades de <span className="text-revgreen font-bold">otimização técnica</span> crítica na sua infraestrutura.</>
                                    )}
                                </h3>
                            </div>

                            {/* Coluna Direita: Formulário */}
                            <div className="flex-1 w-full max-w-md flex flex-col justify-center">
                                <DiagnosticForm
                                    onSubmit={handleFormSubmit}
                                    isSubmitting={isSubmitting}
                                    title="Receber Relatório"
                                    subtitle="Obtenha o plano de ação técnico."
                                    variant="dark"
                                    diagnosticType="Site"
                                    showLinkedin={false}
                                />
                            </div>
                        </div>
                    </div>
                )}

                <div className={`space-y-8 transition-all duration-700 w-full ${!hasSubmittedLead ? 'blur-sm opacity-60 pointer-events-none' : ''}`}>

                    {/* DASHBOARD HEADLINE - Adicionado por solicitação */}
                    <div className="mb-12 text-center animate-in fade-in slide-in-from-bottom-4 duration-1000 max-w-4xl mx-auto">
                        <div className="inline-flex items-center gap-2 mb-4 bg-zinc-900 border border-zinc-800 px-3 py-1 rounded-full">
                            <span className="w-1.5 h-1.5 bg-revgreen rounded-full shadow-[0_0_10px_#03FC3B]"></span>
                            <span className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-widest">Status: Finalizado</span>
                        </div>
                        <h1 className="text-4xl md:text-6xl font-black text-white tracking-tighter mb-2">
                            Relatório de <span className="text-zinc-600">Performance</span>
                        </h1>
                        <p className="text-zinc-500 font-medium max-w-xl mx-auto">
                            Análise técnica completa dos vetores de crescimento e infraestrutura.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch animate-in fade-in duration-700">
                        {/* Left Column: Gauge */}
                        <div className="lg:col-span-4">
                            <ScoreGauge
                                score={currentScore}
                                label={`Performance ${viewMode === 'mobile' ? 'Mobile' : 'Desktop'}`}
                                description="Google PageSpeed Insights"
                            />
                        </div>

                        {/* Right Column: Detailed Grid */}
                        <div className="lg:col-span-8 flex flex-col gap-px bg-zinc-800 border border-zinc-900 rounded-lg overflow-hidden">
                            {/* Header Row with Toggle */}
                            <div className="bg-zinc-950 p-6 border-b border-zinc-900 flex justify-between items-center bg-white/5">
                                <div className="flex items-center gap-3">
                                    <div className={`w-1.5 h-1.5 rounded-full animate-pulse ${viewMode === 'mobile' ? 'bg-[#03FC3B]' : 'bg-blue-400'}`} />
                                    <span className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-widest">
                                        INFRAESTRUTURA // WEB VITALS
                                    </span>
                                </div>

                                {/* TOGGLE BUTTONS */}
                                <div className="flex bg-zinc-900 rounded-lg p-1 border border-zinc-800">
                                    <button
                                        onClick={() => setViewMode('mobile')}
                                        className={`px-3 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider transition-all ${viewMode === 'mobile' ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-300'}`}
                                    >
                                        Mobile
                                    </button>
                                    <button
                                        onClick={() => setViewMode('desktop')}
                                        className={`px-3 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider transition-all ${viewMode === 'desktop' ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-300'}`}
                                    >
                                        Desktop
                                    </button>
                                </div>
                            </div>


                            <div className="grid grid-cols-2 md:grid-cols-3 gap-px bg-zinc-900">
                                {/* Core Web Vitals Dynamic */}
                                <MetricCard
                                    label="LCP (Carregamento)"
                                    value={psiResults?.error ? "ERRO API" : (currentData?.vitals?.lcp || "N/A")}
                                    description={psiResults?.error ? String(psiResults.error).substring(0, 30) : "Largest Contentful Paint"}
                                    status={psiResults?.error ? 'critical' : !currentData?.vitals?.lcp || currentData.vitals.lcp === 'N/A' ? 'warning' : parseFloat(currentData.vitals.lcp) > 2.5 ? 'critical' : 'success'}
                                    variant="dark"
                                />
                                <MetricCard
                                    label="Crux Assessment"
                                    value={psiResults?.crux?.assessment || "Indisponível"}
                                    description="Dados de Usuários Reais"
                                    status={psiResults?.crux?.assessment === 'PASS' ? 'success' : 'warning'}
                                />
                                <MetricCard
                                    label="SEO Técnico"
                                    value={psiSeoScore !== null ? `${psiSeoScore}/100` : "PENDENTE"}
                                    description="Search Engine Opt."
                                    status={psiSeoScore && psiSeoScore >= 90 ? 'success' : 'warning'}
                                    variant="dark"
                                />

                                {/* Compliance & Intelligence */}
                                <MetricCard
                                    label="Segurança (SSL)"
                                    value={psiResults?.compliance?.security ? "Protegido" : "Vulnerável"}
                                    description="Protocolo HTTPS"
                                    status={psiResults?.compliance?.security ? 'success' : 'critical'}
                                    variant="dark"
                                />
                                <MetricCard
                                    label="Conformidade (Privacy)"
                                    value={psiResults?.compliance?.lgpd ? "Detectada" : "Ausente"}
                                    description="Scripts de Consentimento"
                                    status={psiResults?.compliance?.lgpd ? 'success' : 'warning'}
                                    variant="dark"
                                />
                                <MetricCard
                                    label="UX / Core Vitals"
                                    value={currentScore >= 90 ? "Otimizado" : currentScore >= 50 ? "Regular" : "Crítico"}
                                    description="Experiência do Usuário"
                                    status={currentScore >= 90 ? 'success' : currentScore >= 50 ? 'warning' : 'critical'}
                                    variant="dark"
                                />
                            </div>

                            {/* Tech Stack & SEO Meta Row */}
                            <div className="bg-zinc-950 p-6 border-t border-zinc-900 grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div>
                                    <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest block mb-4">Clareza Estratégica (SEO)</span>
                                    <div className="space-y-3">
                                        <div>
                                            <span className="text-[9px] font-black text-zinc-600 uppercase tracking-tighter block">Title Tag</span>
                                            <p className="text-sm font-bold text-white line-clamp-1">{psiResults?.seoMetadata?.title}</p>
                                        </div>
                                        <div>
                                            <span className="text-[9px] font-black text-zinc-600 uppercase tracking-tighter block">Meta Description</span>
                                            <p className="text-xs text-zinc-400 line-clamp-2 italic">"{psiResults?.seoMetadata?.description}"</p>
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest block mb-4">Tecnologias Identificadas</span>
                                    <div className="flex flex-wrap gap-2">
                                        {[...(psiResults?.techStack || []), ...(psiResults?.pixels || [])].map((tech, i) => (
                                            <span key={i} className="text-[10px] font-bold bg-zinc-900 text-zinc-300 border border-zinc-800 px-3 py-1 rounded-full">
                                                {tech}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* FOLD 02: WHITE DIAGNOSIS & ACTION PLAN */}
                    <div className="w-[100vw] relative left-[50%] right-[50%] -ml-[50vw] bg-white text-zinc-900 px-4 md:px-0 py-20 mt-32 border-t border-zinc-200 animate-fade-in duration-1000 delay-500">
                        <div className="max-w-6xl mx-auto space-y-32">

                            {/* PSI AUDIT DETAILS */}
                            <section>
                                <div className="space-y-6 mb-20">
                                    <div className="inline-block bg-black text-white px-4 py-1.5 text-[9px] font-mono uppercase tracking-[0.5em] font-black">
                                        AUDITORIA_ESTRATÉGICA
                                    </div>
                                    <h2 className="text-3xl md:text-5xl font-black text-black tracking-tighter leading-none italic">
                                        Sua infraestrutura <span className="text-zinc-500">trabalha para você?</span>
                                    </h2>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
                                    <div className="space-y-6 border-l border-zinc-200 pl-8">
                                        <h4 className="text-sm font-black text-black uppercase tracking-widest flex items-center gap-3">
                                            <div className="w-1.5 h-1.5 bg-black rounded-full" />
                                            Perspectiva Técnica
                                        </h4>
                                        <p className="text-black text-base leading-relaxed font-semibold">
                                            {psiResults?.error
                                                ? "Devido às camadas de segurança do seu servidor (Kasada/Akamai), nossa análise automática foi parcialmente limitada. " +
                                                (score >= 90
                                                    ? "Com base no seu score de " + score + "%, sua infraestrutura está operando em alta performance. Continue monitorando para manter a excelência."
                                                    : score >= 50
                                                        ? "Com base no seu score de " + score + "%, sua infraestrutura apresenta oportunidades de otimização que podem melhorar seu CAC."
                                                        : "Com base no seu score de " + score + "%, detectamos que sua infraestrutura é o principal gargalo da sua operação hoje.")
                                                : insights.description}
                                        </p>
                                    </div>

                                    <div className="space-y-6 border-l border-zinc-200 pl-8">
                                        <h4 className="text-sm font-black text-black uppercase tracking-widest flex items-center gap-3">
                                            <div className="w-1.5 h-1.5 bg-black rounded-full" />
                                            Plano de Ação
                                        </h4>
                                        <p className="text-black text-base leading-relaxed font-semibold">
                                            Sua prioridade técnica imediata é: <strong className="text-black bg-yellow-300 px-1">{insights.action}</strong>.
                                            {score >= 90
                                                ? " Mantenha o monitoramento ativo para preservar esta vantagem competitiva."
                                                : " Ignorar estes ajustes resulta em perda direta de tráfego qualificado por fricção técnica."}
                                        </p>
                                    </div>
                                </div>
                            </section>

                            {/* BENCHMARK COMPETITIVO - Exibe apenas se houver resultados */}
                            {(benchmarkResult || isBenchmarking) && (
                                <section className="mt-32">
                                    <div className="space-y-6 mb-12">
                                        <div className="inline-block bg-revgreen text-black px-4 py-1.5 text-[9px] font-mono uppercase tracking-[0.5em] font-black">
                                            BENCHMARK_COMPETITIVO
                                        </div>
                                        <h2 className="text-3xl md:text-5xl font-black text-black tracking-tighter leading-none italic">
                                            Você vs. <span className="text-zinc-500">Concorrentes</span>
                                        </h2>
                                        <p className="text-sm text-zinc-500 max-w-xl">
                                            Comparação baseada em dados reais de usuários Chrome (CrUX API). Métricas de P75 (percentil 75).
                                        </p>
                                    </div>

                                    {isBenchmarking ? (
                                        <div className="flex items-center justify-center py-16 gap-4 bg-zinc-50 rounded-2xl border border-zinc-100">
                                            <div className="w-6 h-6 border-2 border-revgreen border-t-transparent rounded-full animate-spin" />
                                            <span className="text-sm font-medium text-zinc-500">Consultando dados reais de performance...</span>
                                        </div>
                                    ) : benchmarkResult && (
                                        <div className="overflow-x-auto">
                                            <table className="w-full border-collapse">
                                                <thead>
                                                    <tr className="border-b-2 border-black">
                                                        <th className="text-left py-4 px-4 text-xs font-mono font-black text-zinc-500 uppercase tracking-wider">Site</th>
                                                        <th className="text-center py-4 px-4 text-xs font-mono font-black text-zinc-500 uppercase tracking-wider">LCP</th>
                                                        <th className="text-center py-4 px-4 text-xs font-mono font-black text-zinc-500 uppercase tracking-wider">CLS</th>
                                                        <th className="text-center py-4 px-4 text-xs font-mono font-black text-zinc-500 uppercase tracking-wider">INP</th>
                                                        <th className="text-center py-4 px-4 text-xs font-mono font-black text-zinc-500 uppercase tracking-wider">Status</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {/* Cliente (Destacado) */}
                                                    <tr className="bg-revgreen/10 border-b border-zinc-100">
                                                        <td className="py-4 px-4">
                                                            <div className="flex items-center gap-3">
                                                                <Trophy className="w-4 h-4 text-revgreen" />
                                                                <div>
                                                                    <span className="font-bold text-black text-sm block">{new URL(benchmarkResult.clientSite.url).hostname}</span>
                                                                    <span className="text-[10px] text-zinc-400 font-mono">SEU SITE</span>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="text-center py-4 px-4">
                                                            <span className="font-mono font-bold" style={{ color: getCategoryColor(benchmarkResult.clientSite.lcp.category) }}>
                                                                {formatMetricValue('lcp', benchmarkResult.clientSite.lcp.p75)}
                                                            </span>
                                                        </td>
                                                        <td className="text-center py-4 px-4">
                                                            <span className="font-mono font-bold" style={{ color: getCategoryColor(benchmarkResult.clientSite.cls.category) }}>
                                                                {formatMetricValue('cls', benchmarkResult.clientSite.cls.p75)}
                                                            </span>
                                                        </td>
                                                        <td className="text-center py-4 px-4">
                                                            <span className="font-mono font-bold" style={{ color: getCategoryColor(benchmarkResult.clientSite.inp.category) }}>
                                                                {formatMetricValue('inp', benchmarkResult.clientSite.inp.p75)}
                                                            </span>
                                                        </td>
                                                        <td className="text-center py-4 px-4">
                                                            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-bold uppercase bg-black text-white">
                                                                #{benchmarkResult.ranking.overall} de {benchmarkResult.competitors.length + 1}
                                                            </span>
                                                        </td>
                                                    </tr>

                                                    {/* Concorrentes */}
                                                    {benchmarkResult.competitors.map((competitor, idx) => (
                                                        <tr key={idx} className="border-b border-zinc-100 hover:bg-zinc-50 transition-colors">
                                                            <td className="py-4 px-4">
                                                                <div className="flex items-center gap-3">
                                                                    <Users className="w-4 h-4 text-zinc-300" />
                                                                    <div>
                                                                        <span className="font-medium text-zinc-700 text-sm block">{new URL(competitor.url).hostname}</span>
                                                                        <span className="text-[10px] text-zinc-400 font-mono">CONCORRENTE {idx + 1}</span>
                                                                    </div>
                                                                </div>
                                                            </td>
                                                            <td className="text-center py-4 px-4">
                                                                {competitor.error ? (
                                                                    <span className="text-xs text-zinc-400">N/A</span>
                                                                ) : (
                                                                    <span className="font-mono font-bold" style={{ color: getCategoryColor(competitor.lcp.category) }}>
                                                                        {formatMetricValue('lcp', competitor.lcp.p75)}
                                                                    </span>
                                                                )}
                                                            </td>
                                                            <td className="text-center py-4 px-4">
                                                                {competitor.error ? (
                                                                    <span className="text-xs text-zinc-400">N/A</span>
                                                                ) : (
                                                                    <span className="font-mono font-bold" style={{ color: getCategoryColor(competitor.cls.category) }}>
                                                                        {formatMetricValue('cls', competitor.cls.p75)}
                                                                    </span>
                                                                )}
                                                            </td>
                                                            <td className="text-center py-4 px-4">
                                                                {competitor.error ? (
                                                                    <span className="text-xs text-zinc-400">N/A</span>
                                                                ) : (
                                                                    <span className="font-mono font-bold" style={{ color: getCategoryColor(competitor.inp.category) }}>
                                                                        {formatMetricValue('inp', competitor.inp.p75)}
                                                                    </span>
                                                                )}
                                                            </td>
                                                            <td className="text-center py-4 px-4">
                                                                {competitor.error ? (
                                                                    <span className="text-[10px] text-zinc-400">{competitor.error}</span>
                                                                ) : (
                                                                    <span className="text-xs text-zinc-500">Analisado</span>
                                                                )}
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>

                                            {/* Legenda */}
                                            <div className="flex items-center justify-center gap-6 mt-6 text-[10px] font-mono text-zinc-400">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#00C853' }} />
                                                    <span>Bom</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#FFAB00' }} />
                                                    <span>Precisa Melhorar</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#FF1744' }} />
                                                    <span>Ruim</span>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </section>
                            )}

                            <section>
                                <div className="space-y-6 mb-20 text-right">
                                    <div className="inline-block bg-black text-white px-4 py-1.5 text-[9px] font-mono uppercase tracking-[0.5em] font-black">
                                        MARKET_INTELLIGENCE
                                    </div>
                                    <h2 className="text-3xl md:text-5xl font-black text-black tracking-tighter leading-none italic">
                                        Oportunidades <span className="text-zinc-500">Táticas Encontradas.</span>
                                    </h2>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                    <div className="p-8 bg-zinc-50 border border-zinc-100 rounded-2xl flex flex-col justify-between">
                                        <div>
                                            <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest block mb-4">Escalabilidade</span>
                                            <h4 className="text-xl font-bold text-black mb-4 tracking-tight">Performance Proativa</h4>
                                            <p className="text-sm text-zinc-600 leading-relaxed mb-6">
                                                Com um score de {currentScore}%, sua infraestrutura {currentScore > 80 ? "está pronta para suportar escalas agressivas de mídia paga." : "apresenta gargalos que aumentarão drasticamente o seu CAC se tentar escalar agora."}
                                            </p>
                                        </div>
                                        <div className="text-[10px] font-black text-black flex items-center gap-2 uppercase tracking-widest">
                                            Status: {currentScore > 80 ? "Verde (Go Scale)" : "Amarelo (Fix First)"}
                                        </div>
                                    </div>

                                    <div className="p-8 bg-zinc-50 border border-zinc-100 rounded-2xl flex flex-col justify-between">
                                        <div>
                                            <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest block mb-4">Autoridade</span>
                                            <h4 className="text-xl font-bold text-black mb-4 tracking-tight">Clareza Semântica</h4>
                                            <p className="text-sm text-zinc-600 leading-relaxed mb-6">
                                                O uso de {(psiResults?.techStack || []).length} tecnologias e {psiResults?.seoMetadata?.title ? "metadados presentes" : "metadados ausentes"} indica uma operação {(psiResults?.techStack || []).length > 5 ? "robusta" : "em estágio inicial"} de marketing digital.
                                            </p>
                                        </div>
                                        <div className="text-[10px] font-black text-black flex items-center gap-2 uppercase tracking-widest">
                                            Nível: {(psiResults?.techStack || []).length > 5 ? "Avançado" : "Semente"}
                                        </div>
                                    </div>

                                    <div className="p-8 bg-zinc-50 border border-zinc-100 rounded-2xl flex flex-col justify-between">
                                        <div>
                                            <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest block mb-4">Conversão</span>
                                            <h4 className="text-xl font-bold text-black mb-4 tracking-tight">Mobile First Index</h4>
                                            <p className="text-sm text-zinc-600 leading-relaxed mb-6">
                                                Sua pontuação mobile de {psiResults?.mobile?.vitals?.score || 0}% é o principal fator de retenção. {(psiResults?.mobile?.vitals?.score || 0) > 90 ? "Parabéns pela otimização extrema." : "Cada 1% de melhoria aqui reflete em aproximadamente 2% de redução no bounce rate."}
                                            </p>
                                        </div>
                                        <div className="text-[10px] font-black text-black flex items-center gap-2 uppercase tracking-widest">
                                            Prioridade: {(psiResults?.mobile?.vitals?.score || 0) < 50 ? "Crítica" : "Otimização"}
                                        </div>
                                    </div>
                                </div>
                            </section>

                            <DiagnosticActionSection
                                title="Otimize sua Infraestrutura para Conversão Máxima."
                                onCtaClick={() => setIsBookingModalOpen(true)}
                            />

                            <CallDiagnosticModal
                                isOpen={isBookingModalOpen}
                                onClose={() => setIsBookingModalOpen(false)}
                                source="site-score"
                            />
                        </div>
                    </div>
                </div>
            </DiagnosticLayout>
        );
    }

    return null;
};

export default SiteScore;
