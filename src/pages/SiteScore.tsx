import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Smartphone, Search, Monitor, ArrowRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { submitPublicDiagnostic } from "@/api/publicDiagnostic";
import { DiagnosticLayout } from '@/components/diagnostics/DiagnosticLayout';
import { DiagnosticForm, DiagnosticFormData } from '@/components/diagnostics/DiagnosticForm';
import { ScoreGauge } from '@/components/diagnostics/ScoreGauge';
import { MetricCard } from '@/components/diagnostics/MetricCard';
import { TechStackCard } from '@/components/diagnostics/TechStackCard';

// Questions centered on "Money Left on the Table"
const QUESTIONS = [
    {
        id: 1,
        question: "Como seu site se comporta em dispositivos móveis?",
        options: [
            { label: "Funciona corretamente e mantém boa legibilidade", score: 20 },
            { label: "Funciona, mas apresenta problemas pontuais de leitura ou layout", score: 10 },
            { label: "É uma adaptação limitada da versão desktop", score: 5 },
            { label: "Apresenta falhas frequentes ou não sei informar", score: 0 }
        ]
    },
    {
        id: 2,
        question: "Qual a percepção de velocidade de carregamento?",
        options: [
            { label: "Carregamento imediato (sem tela branca perceptível)", score: 20 },
            { label: "Carregamento padrão (2-3 segundos de espera)", score: 15 },
            { label: "Carregamento lento (usuário percebe a demora)", score: 0 },
            { label: "Instável ou falha ocasionalmente", score: 0 }
        ]
    },
    {
        id: 3,
        question: "A proposta de valor está clara na primeira tela (Hero)?",
        options: [
            { label: "Sim, contém promessa clara e chamada para ação (CTA)", score: 20 },
            { label: "Contém apenas banner genérico ou boas-vindas", score: 5 },
            { label: "Foca em texto institucional ou histórico da empresa", score: 0 },
            { label: "Informação confusa ou excessiva", score: 0 }
        ]
    },
    {
        id: 4,
        question: "Qual o nível de rastreamento de origem de tráfego?",
        options: [
            { label: "Completo (UTMs, Pixel, Analytics e CRM integrados)", score: 20 },
            { label: "Parcial (Sei a origem aproximada manualmente)", score: 10 },
            { label: "Básico (Analytics instalado mas pouco utilizado)", score: 5 },
            { label: "Inexistente ou não sei informar", score: 0 }
        ]
    },
    {
        id: 5,
        question: "Qual a percepção visual e de marca?",
        options: [
            { label: "Alinhada com a identidade moderna e premium da marca", score: 20 },
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

    // PageSpeed State
    const [targetUrl, setTargetUrl] = useState('');
    const [psiResults, setPsiResults] = useState<{ mobile: any, desktop: any } | null>(null);
    const [activeTab, setActiveTab] = useState<'mobile' | 'desktop'>('mobile');
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const PSI_API_KEY = 'AIzaSyDQmXtGdZZFQcwAzOOwGQOyawcotLG7C_A';
    const [loadingStatus, setLoadingStatus] = useState('Iniciando análise...');

    // Simulate Progress
    const simulateProgress = () => {
        const stages = [
            'Resolving DNS...',
            'Connecting to Lighthouse Servers...',
            'Emulating Moto G Power...',
            'Parsing DOM Tree...',
            'Calculating Layout Shift...',
            'Analyzing Network Requests...',
            'Compiling Diagnostics...'
        ];
        let currentStage = 0;
        const interval = setInterval(() => {
            const stageIndex = (currentStage + 1) % stages.length;
            currentStage = stageIndex;
            setLoadingStatus(stages[stageIndex]);
        }, 800);
        return interval;
    };

    const runPageSpeed = async (url: string) => {
        setIsAnalyzing(true);
        setPsiResults(null);
        const progressInterval = simulateProgress();

        try {
            let formattedUrl = url.trim();
            if (!formattedUrl.startsWith('http')) {
                formattedUrl = `https://${formattedUrl}`;
            }

            const categories = '&category=performance&category=seo&category=accessibility&category=best-practices';
            const mobileUrl = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(formattedUrl)}&key=${PSI_API_KEY}&strategy=mobile${categories}&locale=pt-BR`;
            const desktopUrl = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(formattedUrl)}&key=${PSI_API_KEY}&strategy=desktop${categories}&locale=pt-BR`;

            const [mobileRes, desktopRes] = await Promise.all([
                fetch(mobileUrl).then(r => r.json()),
                fetch(desktopUrl).then(r => r.json())
            ]);

            clearInterval(progressInterval);
            setLoadingStatus('Finalizando...');

            setPsiResults({
                mobile: mobileRes,
                desktop: desktopRes
            });

        } catch (error) {
            console.error("PageSpeed API Fetch Error:", error);
            clearInterval(progressInterval);
        } finally {
            setIsAnalyzing(false);
            setStep('lead-capture');
        }
    };

    const handleUrlSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setStep('questions');
    };

    const handleAnswer = (optionScore: number) => {
        const newScore = score + optionScore;
        setScore(newScore);
        setAnswers([...answers, optionScore]);

        if (currentQ < QUESTIONS.length - 1) {
            setTimeout(() => setCurrentQ(prev => prev + 1), 250);
        } else {
            setStep('analyzing');
            runPageSpeed(targetUrl);
        }
    };

    const handleFormSubmit = async (data: DiagnosticFormData) => {
        setIsSubmitting(true);

        try {
            const pageSpeedScore = psiResults?.mobile?.lighthouseResult?.categories?.performance?.score
                ? Math.round(psiResults.mobile.lighthouseResult.categories.performance.score * 100)
                : 0;

            const resultMsg = pageSpeedScore > 80
                ? "Infraestrutura otimizada. O foco deve ser refino de conversão."
                : "Gargalos técnicos detectados. Performance impacta diretamente seu CAC.";

            // Default Webhook
            const WEBHOOK_URL = 'https://services.leadconnectorhq.com/hooks/oFTw9DcsKRUj6xCiq4mb/webhook-trigger/a35d7d7a-ad2b-47cc-920e-15f1837b6ec7';

            await submitPublicDiagnostic(
                { ...data, phone: '' },
                { answers, psi: psiResults ? 'captured' : 'failed' },
                score, // Self assessment score
                {
                    level: "Technical Analysis",
                    description: resultMsg
                },
                WEBHOOK_URL
            );

            setStep('results');
            toast({
                className: "bg-zinc-900 border-zinc-800 text-white",
                title: "DIAGNÓSTICO PROCESSADO",
                description: "Seu relatório técnico foi gerado."
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

    // --- ENHANCED STACK DETECTION LOGIC (NETWORK SCANNING) ---
    const detectStack = () => {
        const mobileResults = psiResults?.mobile?.lighthouseResult;
        const desktopResults = psiResults?.desktop?.lighthouseResult;

        const stack = {
            ads: [] as string[],
            cms: [] as string[],
            analytics: [] as string[],
            crm: [] as string[],
            cdn: [] as string[],
        };

        const collectFrom = (lhResult: any) => {
            if (!lhResult?.audits) return;

            // 1. High-Level Audits
            const thirdParty = lhResult.audits['third-party-summary']?.details?.items || [];
            const jsLibs = lhResult.audits['js-libraries']?.details?.items || [];
            const networkRequests = lhResult.audits['network-requests']?.details?.items || [];

            const hasEntity = (items: any[], term: string) => items.some(i => (i.entity?.name || i.name || '').toLowerCase().includes(term.toLowerCase()));
            const hasUrl = (term: string) => networkRequests.some((req: any) => (req.url || '').toLowerCase().includes(term.toLowerCase()));

            // ADS & PIXELS
            if (hasEntity(thirdParty, 'facebook') || hasUrl('facebook.com/tr') || hasUrl('connect.facebook.net')) stack.ads.push('Meta Pixel');
            if (hasEntity(thirdParty, 'google ads') || hasUrl('googleadservices') || hasUrl('googlesyndication')) stack.ads.push('Google Ads');
            if (hasEntity(thirdParty, 'linkedin') || hasUrl('linkedin.com/insight')) stack.ads.push('LinkedIn Insight');

            // ANALYTICS
            if (hasEntity(thirdParty, 'google analytics') || hasEntity(thirdParty, 'gtm') || hasUrl('googletagmanager.com') || hasUrl('google-analytics.com')) stack.analytics.push('GA4 / GTM');
            if (hasEntity(thirdParty, 'hotjar') || hasUrl('static.hotjar.com')) stack.analytics.push('Hotjar');
            if (hasEntity(thirdParty, 'clarity') || hasUrl('clarity.ms')) stack.analytics.push('Clarity');

            // CMS
            if (hasEntity(jsLibs, 'wordpress') || hasUrl('/wp-content/')) stack.cms.push('WordPress');
            if (hasEntity(jsLibs, 'shopify') || hasUrl('cdn.shopify.com')) stack.cms.push('Shopify');
            if (hasEntity(jsLibs, 'next.js') || hasUrl('_next')) stack.cms.push('Next.js');
            if (hasEntity(jsLibs, 'react')) stack.cms.push('React');

            // CRM
            if (hasEntity(thirdParty, 'hubspot') || hasUrl('js.hs-scripts.com')) stack.crm.push('HubSpot');
            if (hasEntity(thirdParty, 'rd station') || hasUrl('d335luupugsy2.cloudfront.net')) stack.crm.push('RD Station');

            // CDN
            if (hasEntity(thirdParty, 'cloudflare')) stack.cdn.push('Cloudflare');
            if (hasEntity(thirdParty, 'vercel')) stack.cdn.push('Vercel');
        };

        if (mobileResults) collectFrom(mobileResults);
        if (desktopResults) collectFrom(desktopResults);

        // Deduplicate
        Object.keys(stack).forEach(key => {
            stack[key as keyof typeof stack] = Array.from(new Set(stack[key as keyof typeof stack]));
        });

        return stack;
    };

    const stack = psiResults ? detectStack() : { ads: [], cms: [], analytics: [], crm: [], cdn: [] };
    const lighthouse = psiResults ? psiResults[activeTab]?.lighthouseResult : null;
    const performanceScore = lighthouse?.categories?.performance?.score ? Math.round(lighthouse.categories.performance.score * 100) : 0;

    // Core Vitals
    const lcp = lighthouse?.audits['largest-contentful-paint']?.displayValue || '-';
    const cls = lighthouse?.audits['cumulative-layout-shift']?.displayValue || '-';
    const tbt = lighthouse?.audits['total-blocking-time']?.displayValue || '-';

    if (step === 'url-input') {
        return (
            <DiagnosticLayout
                title="Google PageSpeed Analysis"
                subtitle="Análise profunda de Web Vitals e Tech Stack."
                showGovernanceFooter={false}
                variant="light"
            >
                <div className="max-w-xl">
                    <div className="bg-zinc-50 border border-zinc-200 p-8 mb-8 rounded-lg">
                        <div className="mb-6">
                            <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest pl-1 mb-2 block">
                                Digite a URL do Site
                            </label>
                            <div className="flex gap-0">
                                <input
                                    type="text"
                                    value={targetUrl}
                                    onChange={(e) => setTargetUrl(e.target.value)}
                                    placeholder="exemplo.com.br"
                                    className="flex-1 bg-white border border-zinc-200 text-black h-14 px-4 focus:border-black outline-none font-mono text-sm"
                                />
                                <button
                                    onClick={handleUrlSubmit}
                                    disabled={!targetUrl}
                                    className="bg-black text-white px-8 h-14 font-bold uppercase text-xs hover:bg-zinc-800 transition-colors disabled:opacity-50"
                                >
                                    <ArrowRight />
                                </button>
                            </div>
                        </div>



                        <ul className="space-y-4 pt-4 border-t border-zinc-200">
                            <li className="flex items-center gap-3 text-zinc-600 text-xs">
                                <Zap className="w-4 h-4 text-black" /> Core Web Vitals (LCP, CLS, TBT)
                            </li>
                            <li className="flex items-center gap-3 text-zinc-600 text-xs">
                                <Search className="w-4 h-4 text-black" /> Detecção de Stack (CMS, Analytics)
                            </li>
                            <li className="flex items-center gap-3 text-zinc-600 text-xs">
                                <Monitor className="w-4 h-4 text-black" /> Simulação Mobile & Desktop
                            </li>
                        </ul>
                    </div>
                </div>
            </DiagnosticLayout>
        )
    }

    if (step === 'questions') {
        return (
            <DiagnosticLayout title="Google PageSpeed Analysis" subtitle="Contexto Operacional" variant="light">
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
            </DiagnosticLayout>
        );

    }

    if (step === 'analyzing') {
        return (
            <DiagnosticLayout title="Google PageSpeed Analysis" subtitle="Processando Dados..." variant="light">
                <div className="max-w-xl mx-auto">
                    <div className="bg-zinc-50 border border-zinc-200 p-8 mb-8 rounded-lg">
                        <div className="mt-0">
                            <div className="flex justify-between items-end mb-2">
                                <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Status da Análise</span>
                                <span className="text-[10px] font-mono text-black animate-pulse">{loadingStatus}</span>
                            </div>
                            <div className="w-full bg-zinc-200 h-0.5 overflow-hidden">
                                <div className="h-full bg-black w-1/3 animate-[shimmer_2s_infinite_linear]" />
                            </div>
                        </div>
                    </div>
                </div>
            </DiagnosticLayout>
        );
    }

    if (step === 'lead-capture') {
        return (
            <DiagnosticLayout title="Google PageSpeed Analysis" subtitle="Relatório Técnico" variant="light">
                <DiagnosticForm onSubmit={handleFormSubmit} isSubmitting={isSubmitting} />
            </DiagnosticLayout>
        )
    }

    return (
        <DiagnosticLayout
            title="Google PageSpeed Analysis"
            subtitle={`Relatório Técnico para ${targetUrl}`}
            variant="dark"
        >
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch animate-in fade-in duration-700">
                {/* Left Column: Scores */}
                <div className="lg:col-span-4 space-y-4">
                    <ScoreGauge
                        score={performanceScore}
                        label="Lighthouse Score"
                        description="Performance Técnica (Google API)"
                    />
                    <div className="bg-zinc-950 border border-zinc-900 p-6 rounded-lg text-center">
                        <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block mb-1">Auto-Avaliação (Maturidade)</span>
                        <span className="text-2xl font-bold text-white">{score} / 100</span>
                    </div>
                </div>

                {/* Right Column: Detailed Breakdown */}
                <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="md:col-span-2 lg:col-span-3 mb-4 flex justify-end">
                        <div className="flex bg-zinc-900 p-1 rounded-sm">
                            <button onClick={() => setActiveTab('mobile')} className={`px-4 py-1 text-[10px] font-bold uppercase tracking-widest ${activeTab === 'mobile' ? 'bg-white text-black' : 'text-zinc-500'}`}>Mobile</button>
                            <button onClick={() => setActiveTab('desktop')} className={`px-4 py-1 text-[10px] font-bold uppercase tracking-widest ${activeTab === 'desktop' ? 'bg-white text-black' : 'text-zinc-500'}`}>Desktop</button>
                        </div>
                    </div>

                    <MetricCard
                        label="LCP (Carregamento)"
                        value={lcp}
                        description="Largest Contentful Paint"
                        status={performanceScore > 80 ? 'success' : 'warning'}
                    />
                    <MetricCard
                        label="CLS (Estabilidade)"
                        value={cls}
                        description="Cumulative Layout Shift"
                        status={performanceScore > 80 ? 'success' : 'critical'}
                    />
                    <MetricCard
                        label="TBT (Interatividade)"
                        value={tbt}
                        description="Total Blocking Time"
                        status={performanceScore > 80 ? 'success' : 'warning'}
                    />

                    {/* TECH STACK SECTION (The Fix for User Request) */}
                    <TechStackCard
                        category="Analytics & Dados"
                        items={stack.analytics}
                        status={stack.analytics.length > 0 ? 'detected' : 'missing'}
                    />
                    <TechStackCard
                        category="Marketing Pixels"
                        items={stack.ads}
                        status={stack.ads.length > 0 ? 'detected' : 'missing'}
                    />
                    <TechStackCard
                        category="CMS / Libs"
                        items={stack.cms}
                        status='detected'
                    />
                </div>

                <div className="lg:col-span-12 mt-8 p-8 border border-zinc-900 bg-zinc-950/50">
                    <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-6 border-b border-zinc-800 pb-4">
                        Diagnóstico de Infraestrutura
                    </h3>

                    <div className="space-y-8">
                        <div>
                            <span className="text-xs font-mono text-red-500 uppercase tracking-widest mb-2 block">
                                01. O Problema Real
                            </span>
                            <p className="text-zinc-300 leading-relaxed text-sm md:text-base">
                                Sua infraestrutura digital apresenta sinais claros de <strong className="text-white">fricção técnica</strong>.
                                Latência no carregamento e ausência de rastreamento avançado não são apenas "detalhes de TI"—são gargalos de receita.
                                O usuário moderno não espera; ele abandona. Sua página está bloqueando a conversão antes mesmo do lead ler sua oferta.
                            </p>
                        </div>

                        <div>
                            <span className="text-xs font-mono text-red-500 uppercase tracking-widest mb-2 block">
                                02. Impacto Financeiro (O Custo Oculto)
                            </span>
                            <p className="text-zinc-300 leading-relaxed text-sm md:text-base">
                                Existe um custo invisível acontecendo agora: você está pagando por tráfego que não converte por falha estrutural.
                                Cada 100ms de atraso reduz sua conversão em até 7%. Basicamente, <strong className="text-white">você está queimando budget de mídia</strong> para enviar pessoas a um ambiente que não está otimizado para fechar negócios.
                            </p>
                        </div>

                        <div className="pt-6 border-t border-zinc-900 flex flex-col items-center">
                            <p className="text-zinc-400 text-xs mb-4 uppercase tracking-widest">Ação Corretiva Imediata</p>
                            <a
                                href="https://cal.com/revhackers/diagnostico"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="bg-revgreen text-black px-8 py-4 rounded-sm font-bold uppercase tracking-wider hover:bg-white transition-all text-sm w-full md:w-auto text-center"
                            >
                                Agendar Otimização de Infraestrutura
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </DiagnosticLayout>
    );

};

export default SiteScore;
