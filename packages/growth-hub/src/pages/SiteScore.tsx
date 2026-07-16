import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ArrowRight, Globe, Zap, Search, Layout, CheckCircle2, Smartphone,
    MousePointerClick, LayoutTemplate, AlertTriangle, AlertCircle,
    Gauge, Activity, Timer, Layers, ShieldCheck, Trophy
} from 'lucide-react';
import { ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from '@/hooks/use-toast';
import { submitPublicDiagnostic } from "@/api/publicDiagnostic";
import PageLayout from '@/components/layout/PageLayout';
import Section from '@/components/ui/Section';
import { useAuth } from '@/contexts/AuthContext';
import PlacesAutocomplete from '@/components/ui/PlacesAutocomplete';

// Questions centered on "Money Left on the Table"
const QUESTIONS = [
    {
        id: 1,
        icon: <Smartphone className="w-8 h-8 text-revgreen" />,
        question: "Como seu site se comporta no celular (Mobile)?",
        options: [
            { label: "Perfeito, carrega rápido e é fácil de usar", score: 20 },
            { label: "Funciona, mas alguns textos ficam pequenos", score: 10 },
            { label: "É apenas uma versão reduzida do Desktop (diferente)", score: 5 },
            { label: "Não funciona bem / Não sei dizer", score: 0 }
        ]
    },
    {
        id: 2,
        icon: <Zap className="w-8 h-8 text-revgreen" />,
        question: "Qual a velocidade de carregamento (sensação)?",
        options: [
            { label: "Instantâneo (piscou, abriu)", score: 20 },
            { label: "Rápido (2-3 segundos)", score: 15 },
            { label: "Lento, dá tempo de tomar um café", score: 0 },
            { label: "Às vezes cai ou trava", score: 0 }
        ]
    },
    {
        id: 3,
        icon: <MousePointerClick className="w-8 h-8 text-revgreen" />,
        question: "É CLARO o que você vende na primeira tela?",
        options: [
            { label: "Sim, tem uma promessa clara e botão de compra", score: 20 },
            { label: "Tem um banner genérico (ex: 'Bem-vindo')", score: 5 },
            { label: "Tem textão institucional ('A empresa foi fundada...')", score: 0 },
            { label: "É confuso, muita informação misturada", score: 0 }
        ]
    },
    {
        id: 4,
        icon: <Search className="w-8 h-8 text-revgreen" />,
        question: "Você consegue saber de onde vêm seus leads?",
        options: [
            { label: "Sim, tenho Pixel, Analytics e UTMs rastreados", score: 20 },
            { label: "Sei mais ou menos (pergunto no WhatsApp)", score: 10 },
            { label: "Tenho Analytics instalado mas não olho", score: 5 },
            { label: "Não faço ideia", score: 0 }
        ]
    },
    {
        id: 5,
        icon: <LayoutTemplate className="w-8 h-8 text-revgreen" />,
        question: "Seu design passa confiança?",
        options: [
            { label: "Sim, é moderno, premium e alinhado à marca", score: 20 },
            { label: "É OK, mas parece um pouco template pronto", score: 10 },
            { label: "Está ultrapassado (cara de 2015)", score: 0 },
            { label: "É amador / Feito pelo 'sobrinho'", score: 0 }
        ]
    }
];

type Step = 'url-input' | 'questions' | 'lead-capture' | 'results';

const SiteScore = () => {
    const { toast } = useToast();
    const [step, setStep] = useState<Step>('url-input');
    const [currentQ, setCurrentQ] = useState(0);
    const [score, setScore] = useState(0);
    const [answers, setAnswers] = useState<number[]>([]);

    // PageSpeed State
    const [targetUrl, setTargetUrl] = useState('');
    const [pageSpeedResult, setPageSpeedResult] = useState<any>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const PSI_API_KEY = 'AIzaSyDQmXtGdZZFQcwAzOOwGQOyawcotLG7C_A';

    // Lead Form State
    const [leadForm, setLeadForm] = useState({
        name: '',
        email: '',
        phone: '',
        company: '',
        role: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const runPageSpeed = async (url: string) => {
        setIsAnalyzing(true);
        try {
            let formattedUrl = url.trim();
            if (!formattedUrl.startsWith('http')) {
                formattedUrl = `https://${formattedUrl}`;
            }

            const apiUrl = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(formattedUrl)}&key=${PSI_API_KEY}&strategy=mobile&category=performance&category=seo&category=accessibility&category=best-practices&locale=pt-BR`;

            const response = await fetch(apiUrl);
            const data = await response.json();

            if (data.error) {
                console.error("PageSpeed API Error:", data.error);
                setPageSpeedResult({ error: true });
            } else {
                setPageSpeedResult(data);
            }
        } catch (error) {
            console.error("PageSpeed API Fetch Error:", error);
            setPageSpeedResult({ error: true });
        } finally {
            setIsAnalyzing(false);
        }
    };

    // Helper to extract top opportunities
    const getOpportunities = (data: any) => {
        if (!data?.lighthouseResult?.audits) return [];

        const audits = data.lighthouseResult.audits;
        const auditRefs = data.lighthouseResult.categories.performance?.auditRefs || [];

        return auditRefs
            .filter((ref: any) => ref.group === 'load-opportunities' && audits[ref.id].score !== null && audits[ref.id].score < 0.9)
            .map((ref: any) => audits[ref.id])
            .sort((a: any, b: any) => (b.details?.overallSavingsMs || 0) - (a.details?.overallSavingsMs || 0))
            .slice(0, 4);
    };

    const getMetrics = (data: any) => {
        if (!data?.lighthouseResult?.audits) return null;
        const a = data.lighthouseResult.audits;
        return {
            lcp: a['largest-contentful-paint'],
            cls: a['cumulative-layout-shift'],
            fcp: a['first-contentful-paint'],
            tbt: a['total-blocking-time'],
            si: a['speed-index']
        };
    };

    const renderMetricCard = (label: string, metric: any, icon: React.ReactNode) => {
        if (!metric) return null;

        let color = 'text-green-500';
        let bg = 'bg-green-500/5 border-green-500/10';

        if (metric.score < 0.5) {
            color = 'text-red-500';
            bg = 'bg-red-500/5 border-red-500/10';
        } else if (metric.score < 0.9) {
            color = 'text-yellow-500';
            bg = 'bg-yellow-500/5 border-yellow-500/10';
        }

        return (
            <div className={`p-4 rounded-xl border ${bg} flex flex-col justify-between h-32`}>
                <div className="flex justify-between items-start">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-zinc-500">{label}</span>
                    <div className={`${color} opacity-80`}>{icon}</div>
                </div>
                <div>
                    <div className={`text-2xl font-black ${color} tracking-tight`}>
                        {metric.displayValue}
                    </div>
                    <div className="text-[10px] text-zinc-400 mt-1 leading-tight line-clamp-2">
                        {metric.title}
                    </div>
                </div>
            </div>
        );
    };

    const handleUrlSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!targetUrl) return;

        runPageSpeed(targetUrl);
        setStep('questions');
    };

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

    const handleLeadSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!leadForm.role || !leadForm.company) {
            toast({
                variant: "destructive",
                title: "Campos Obrigatórios",
                description: "Por favor preencha empresa e cargo."
            });
            return;
        }

        setIsSubmitting(true);

        try {
            const WEBHOOK_URL = 'https://services.leadconnectorhq.com/hooks/oFTw9DcsKRUj6xCiq4mb/webhook-trigger/a35d7d7a-ad2b-47cc-920e-15f1837b6ec7';

            const result = getResult();

            // Prepare payload with PageSpeed data if available
            const payload = {
                ...leadForm,
                site_url: targetUrl,
                score,
                individual_answers: answers,
                level: result.title,
                result: result,
                pageSpeed: pageSpeedResult ? {
                    score: pageSpeedResult.lighthouseResult?.categories?.performance?.score * 100,
                    lcp: pageSpeedResult.lighthouseResult?.audits['largest-contentful-paint']?.displayValue,
                    cls: pageSpeedResult.lighthouseResult?.audits['cumulative-layout-shift']?.displayValue,
                    fcp: pageSpeedResult.lighthouseResult?.audits['first-contentful-paint']?.displayValue,
                } : 'Not Available'
            };

            await submitPublicDiagnostic(
                { ...leadForm },
                { individual_answers: answers, pageSpeed: payload.pageSpeed },
                score,
                {
                    level: result.title,
                    title: result.headline,
                    description: result.msg,
                    action: 'Auditoria',
                    color: 'revgreen'
                },
                WEBHOOK_URL
            );

            setStep('results');
            toast({
                className: "bg-black border border-white/10 text-white",
                title: "RELATÓRIO AUTORIZADO",
                description: "Seu diagnóstico de performance foi processado."
            });
        } catch (error: any) {
            console.error('Error sending diagnostic:', error);
            toast({
                variant: "destructive",
                title: "Erro ao processar",
                description: "Não foi possível processar seu diagnóstico. Tente novamente."
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const getResult = () => {
        if (score >= 90) return {
            headline: "MÁQUINA DE ESCALA VALIDADA",
            title: "Excelência Digital",
            color: "text-revgreen",
            msg: "Seu ecossistema está tecnicamente impecável. Você tem a base exata que os líderes de mercado usam para escalar sem desperdício."
        };
        if (score >= 60) return {
            headline: "POTENCIAL TRAVADO POR FRICÇÃO",
            title: "Potencial Oculto",
            color: "text-white",
            msg: "Você tem bons fundamentos, mas gargalos técnicos invisíveis estão encarecendo seu CPA e matando a conversão silenciosamente."
        };
        return {
            headline: "VAZAMENTO DE RECEITA CRÍTICO",
            title: "Risco Operacional",
            color: "text-gray-500",
            msg: "Sua estrutura atual é um balde furado. Investir em tráfego agora é queimar dinheiro. A prioridade zero deve ser estancar esses erros."
        };
    };

    const result = getResult();

    const chartData = [
        { name: 'Score', value: score },
        { name: 'Gap', value: 100 - score }
    ];

    return (
        <PageLayout>
            <Section variant="light" className="min-h-[100dvh] flex flex-col justify-center py-[5rem] relative overflow-hidden bg-white">
                <div className="container-custom max-w-5xl mx-auto relative z-10 w-full">

                    {/* STEP 1: URL INPUT (Surgical Minimalism) */}
                    {step === 'url-input' && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="max-w-md mx-auto"
                        >
                            <div className="bg-white p-0 md:p-8">
                                <div className="text-center mb-12">
                                    <h2 className="text-3xl font-bold text-black mb-4 tracking-tight uppercase leading-none">
                                        Diagnóstico Técnico
                                    </h2>
                                    <p className="text-zinc-500 text-[10px] font-mono uppercase tracking-[0.2em]">
                                        Insira seu site para análise em tempo real
                                    </p>
                                </div>

                                <form onSubmit={handleUrlSubmit} className="space-y-6">
                                    <div className="space-y-1">
                                        <Label className="text-[10px] font-bold text-black uppercase tracking-widest pl-1">URL do Site</Label>
                                        <div className="flex gap-0">
                                            <div className="flex items-center justify-center bg-zinc-100 border-y border-l border-zinc-200 px-4 text-[10px] font-mono font-bold text-zinc-500">
                                                HTTPS://
                                            </div>
                                            <Input
                                                required
                                                className="bg-zinc-50 border-zinc-200 text-black h-14 focus:border-black focus:ring-0 rounded-none transition-all placeholder:text-zinc-300 font-medium flex-1"
                                                value={targetUrl.replace('https://', '').replace('http://', '')}
                                                onChange={e => setTargetUrl(e.target.value)}
                                                placeholder="seusite.com.br"
                                            />
                                        </div>
                                    </div>

                                    <Button
                                        type="submit"
                                        className="w-full bg-black text-white hover:bg-zinc-800 h-14 mt-8 font-bold tracking-[0.2em] uppercase text-[10px] rounded-none shadow-none transition-all duration-300 border border-black"
                                    >
                                        Iniciar Análise
                                    </Button>

                                    <p className="text-center text-[10px] text-zinc-400 font-mono mt-4">
                                        *A análise rodará em segundo plano enquanto você responde.
                                    </p>
                                </form>
                            </div>
                        </motion.div>
                    )}

                    {step === 'questions' && (
                        <div className="max-w-4xl mx-auto">

                            {/* Surgical Minimalist Header */}
                            <div className="mb-20">
                                <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-6">
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-2">
                                            <span className="w-1.5 h-1.5 bg-black rounded-full"></span>
                                            <span className="text-[10px] font-mono font-medium uppercase tracking-[0.2em] text-zinc-500">
                                                Live Diagnostic
                                            </span>
                                        </div>
                                        <h1 className="text-3xl md:text-5xl font-bold text-black uppercase tracking-tight leading-none">
                                            Análise de<br />Infraestrutura
                                        </h1>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-5xl font-light text-black tracking-tighter leading-none">
                                            {Math.round((currentQ / QUESTIONS.length) * 100)}<span className="text-lg text-zinc-400 font-normal">%</span>
                                        </div>
                                    </div>
                                </div>
                                {/* Ultra-thin Progress Line */}
                                <div className="w-full bg-zinc-100 h-px">
                                    <motion.div
                                        className="h-full bg-black"
                                        initial={{ width: 0 }}
                                        animate={{ width: `${((currentQ) / QUESTIONS.length) * 100}%` }}
                                        transition={{ duration: 0.3, ease: "linear" }}
                                    />
                                </div>
                            </div>

                            <div className="min-h-[400px]">
                                <AnimatePresence mode='wait'>
                                    <motion.div
                                        key={currentQ}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        <div className="mb-12">
                                            <span className="block text-[10px] font-mono text-zinc-400 mb-4 uppercase tracking-widest">
                                                0{QUESTIONS[currentQ].id} / 0{QUESTIONS.length}
                                            </span>
                                            <h2 className="text-2xl md:text-4xl font-medium text-black leading-tight">
                                                {QUESTIONS[currentQ].question}
                                            </h2>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-zinc-100 border border-zinc-100">
                                            {QUESTIONS[currentQ].options.map((opt, idx) => (
                                                <button
                                                    key={idx}
                                                    onClick={() => handleAnswer(opt.score)}
                                                    className="group relative flex flex-col items-start p-8 text-left bg-white hover:bg-zinc-50 transition-colors duration-200 outline-none"
                                                >
                                                    <div className="mb-6 w-6 h-6 flex items-center justify-center border border-zinc-200 text-[10px] font-mono text-zinc-400 group-hover:border-black group-hover:text-black transition-colors rounded-none">
                                                        {String.fromCharCode(65 + idx)}
                                                    </div>

                                                    <span className="text-sm md:text-base font-normal text-zinc-600 group-hover:text-black transition-colors leading-relaxed">
                                                        {opt.label}
                                                    </span>

                                                    {/* Selection Indicator Line */}
                                                    <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-black group-hover:w-full transition-all duration-300" />
                                                </button>
                                            ))}
                                        </div>
                                    </motion.div>
                                </AnimatePresence>
                            </div>
                        </div>
                    )}

                    {/* STEP 2: LEAD CAPTURE - SURGICAL MINIMALISM */}
                    {step === 'lead-capture' && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="max-w-md mx-auto"
                        >
                            <div className="bg-white p-0 md:p-8">
                                <div className="text-center mb-12">
                                    <h2 className="text-3xl font-bold text-black mb-4 tracking-tight uppercase leading-none">
                                        Relatório Autorizado
                                    </h2>
                                    <p className="text-zinc-500 text-[10px] font-mono uppercase tracking-[0.2em]">
                                        Identificação obrigatória
                                    </p>
                                </div>

                                <form onSubmit={handleLeadSubmit} className="space-y-6">
                                    <div className="space-y-1">
                                        <Label className="text-[10px] font-bold text-black uppercase tracking-widest pl-1">Nome Completo</Label>
                                        <Input
                                            required
                                            className="bg-zinc-50 border-zinc-200 text-black h-14 focus:border-black focus:ring-0 rounded-none transition-all placeholder:text-zinc-300 font-medium"
                                            value={leadForm.name}
                                            onChange={e => setLeadForm({ ...leadForm, name: e.target.value })}
                                            placeholder="Digite seu nome"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="text-[10px] font-bold text-black uppercase tracking-widest pl-1">E-mail Corporativo</Label>
                                        <Input
                                            required
                                            type="email"
                                            className="bg-zinc-50 border-zinc-200 text-black h-14 focus:border-black focus:ring-0 rounded-none transition-all placeholder:text-zinc-300 font-medium"
                                            value={leadForm.email}
                                            onChange={e => setLeadForm({ ...leadForm, email: e.target.value })}
                                            placeholder="nome@empresa.com"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="text-[10px] font-bold text-black uppercase tracking-widest pl-1">Empresa / Localização</Label>
                                        <PlacesAutocomplete
                                            apiKey={PSI_API_KEY}
                                            className="bg-zinc-50 border-zinc-200 text-black h-14 focus:border-black focus:ring-0 rounded-none transition-all placeholder:text-zinc-300 font-medium"
                                            defaultValue={leadForm.company}
                                            onAddressSelect={(address) => setLeadForm({ ...leadForm, company: address.formatted.split(',')[0] })}
                                            onChange={(val) => setLeadForm({ ...leadForm, company: val })}
                                            placeholder="Buscar empresa automaticamente..."
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1">
                                            <Label className="text-[10px] font-bold text-black uppercase tracking-widest pl-1">WhatsApp</Label>
                                            <Input
                                                required
                                                type="tel"
                                                className="bg-zinc-50 border-zinc-200 text-black h-14 focus:border-black focus:ring-0 rounded-none transition-all placeholder:text-zinc-300 font-medium"
                                                value={leadForm.phone}
                                                onChange={e => setLeadForm({ ...leadForm, phone: e.target.value })}
                                                placeholder="(00) 00000-0000"
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <Label className="text-[10px] font-bold text-black uppercase tracking-widest pl-1">Cargo</Label>
                                            <Select onValueChange={val => setLeadForm({ ...leadForm, role: val })}>
                                                <SelectTrigger className="bg-zinc-50 border-zinc-200 text-black h-14 focus:border-black focus:ring-0 rounded-none transition-all font-medium">
                                                    <SelectValue placeholder="Selecione" />
                                                </SelectTrigger>
                                                <SelectContent className="bg-white border-zinc-200 text-black rounded-none">
                                                    <SelectItem value="vp">VP / C-Level</SelectItem>
                                                    <SelectItem value="diretor">Diretor(a)</SelectItem>
                                                    <SelectItem value="gerente">Gerente</SelectItem>
                                                    <SelectItem value="vendedor">Vendedor(a)</SelectItem>
                                                    <SelectItem value="analista">Analista</SelectItem>
                                                    <SelectItem value="growth">Growth / Mkt</SelectItem>
                                                    <SelectItem value="outros">Outros</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>

                                    <Button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="w-full bg-black text-white hover:bg-zinc-800 h-14 mt-8 font-bold tracking-[0.2em] uppercase text-[10px] rounded-none shadow-none transition-all duration-300 border border-black"
                                    >
                                        {isSubmitting ? 'Processando...' : 'Liberar Relatório Oficial'}
                                    </Button>
                                </form>
                            </div>
                        </motion.div>
                    )}

                    {/* STEP 3: RESULTS - SURGICAL DASHBOARD */}
                    {step === 'results' && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="w-full max-w-7xl mx-auto py-12"
                        >
                            {/* HEADER */}
                            <div className="flex flex-col md:flex-row items-center justify-between mb-12 border-b border-zinc-200 pb-8">
                                <div>
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className={`w-2 h-2 rounded-full ${isAnalyzing ? 'bg-yellow-400 animate-pulse' : 'bg-green-500'}`}></div>
                                        <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">
                                            {isAnalyzing ? 'Diagnóstico em Andamento' : 'Diagnóstico Finalizado'}
                                        </span>
                                    </div>
                                    <h2 className="text-3xl font-bold text-black tracking-tight mb-2">
                                        Relatório de Performance
                                    </h2>
                                    <p className="text-sm text-zinc-500 font-mono">
                                        {targetUrl.replace(/https?:\/\//, '').replace(/\/$/, '')}
                                    </p>
                                </div>
                                <div className="mt-6 md:mt-0">
                                    <Button
                                        onClick={() => window.open('https://api.whatsapp.com/send?phone=5511999999999&text=Quero%20falar%20com%20um%20especialista%20sobre%20meu%20site', '_blank')}
                                        className="bg-revgreen text-black hover:bg-revgreen/90 font-bold text-xs uppercase tracking-widest h-12 px-8 rounded-full shadow-lg hover:shadow-xl transition-all"
                                    >
                                        Falar com Especialista
                                    </Button>
                                </div>
                            </div>

                            {/* MAIN DASHBOARD GRID */}
                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                                {/* 1. SCORE CARD (3 Cols) */}
                                <div className="lg:col-span-3">
                                    <div className="bg-white border border-zinc-200 p-8 h-full flex flex-col items-center justify-center text-center relative overflow-hidden rounded-2xl shadow-sm">
                                        <div className="mb-6">
                                            <Globe className="w-6 h-6 text-zinc-400 mx-auto mb-2" />
                                            <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-500">Google PageSpeed</h3>
                                        </div>

                                        {isAnalyzing ? (
                                            <div className="animate-spin w-16 h-16 border-4 border-zinc-100 border-t-black rounded-full" />
                                        ) : (
                                            <div className="relative">
                                                <span className={`text-8xl font-black tracking-tighter leading-none ${!pageSpeedResult?.lighthouseResult ? 'text-zinc-200' :
                                                    (pageSpeedResult.lighthouseResult.categories.performance.score * 100) >= 90 ? 'text-green-500' :
                                                        (pageSpeedResult.lighthouseResult.categories.performance.score * 100) >= 50 ? 'text-yellow-500' : 'text-red-500'
                                                    }`}>
                                                    {pageSpeedResult?.lighthouseResult ? Math.round(pageSpeedResult.lighthouseResult.categories.performance.score * 100) : '-'}
                                                </span>
                                            </div>
                                        )}

                                        <div className="mt-8 pt-8 border-t border-zinc-100 w-full">
                                            <div className="flex justify-between items-center text-xs">
                                                <span className="text-zinc-500">Score Estratégico</span>
                                                <span className="font-bold text-black">{score}/100</span>
                                            </div>
                                            <div className="w-full bg-zinc-100 h-1.5 rounded-full mt-2 overflow-hidden">
                                                <div className="bg-black h-full rounded-full" style={{ width: `${score}%` }}></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* 2. METRICS & DETAILS (9 Cols) */}
                                <div className="lg:col-span-9 flex flex-col gap-8">

                                    {/* Core Vitals Row */}
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        {[
                                            { id: 'LCP', label: 'Carregamento', key: 'lcp', Icon: Timer },
                                            { id: 'TBT', label: 'Interatividade', key: 'tbt', Icon: MousePointerClick },
                                            { id: 'CLS', label: 'Estabilidade', key: 'cls', Icon: Layout },
                                            { id: 'Speed Index', label: 'Velocidade', key: 'si', Icon: Gauge },
                                        ].map((metric) => {
                                            const val = pageSpeedResult ? getMetrics(pageSpeedResult)?.[metric.key] : null;
                                            const Icon = metric.Icon;

                                            return (
                                                <div key={metric.id} className="bg-white border border-zinc-200 p-6 rounded-xl shadow-sm hover:border-black/20 transition-colors">
                                                    <div className="flex items-center gap-2 mb-3">
                                                        <Icon className="w-4 h-4 text-zinc-400" />
                                                        <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">{metric.id}</span>
                                                    </div>
                                                    <div className="text-2xl font-bold text-black font-mono">
                                                        {val?.displayValue || '-'}
                                                    </div>
                                                    <div className="text-[10px] text-zinc-400 mt-1 truncate">
                                                        {metric.label}
                                                    </div>
                                                </div>
                                            )
                                        })}
                                    </div>

                                    {/* Actionable Insights Grid */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 h-full">
                                        {/* Priorities List */}
                                        <div className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm flex flex-col">
                                            <div className="flex items-center justify-between mb-6">
                                                <h3 className="text-sm font-bold text-black uppercase tracking-wide flex items-center gap-2">
                                                    <AlertTriangle className="w-4 h-4 text-red-500" />
                                                    Correções Críticas
                                                </h3>
                                            </div>

                                            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-3 max-h-[300px]">
                                                {pageSpeedResult?.lighthouseResult && getOpportunities(pageSpeedResult).length > 0 ? (
                                                    getOpportunities(pageSpeedResult).slice(0, 5).map((opp: any, idx: number) => (
                                                        <div key={idx} className="p-4 bg-zinc-50 rounded-lg border border-zinc-100 flex justify-between items-start group hover:bg-zinc-100 transition-colors">
                                                            <div>
                                                                <h4 className="font-bold text-xs text-black mb-1">{opp.title}</h4>
                                                                <p className="text-[10px] text-zinc-500 line-clamp-1">{opp.description?.split('[')[0]}</p>
                                                            </div>
                                                            <span className="bg-white px-2 py-1 rounded border border-zinc-200 text-[10px] font-mono font-bold text-red-600 whitespace-nowrap ml-2">
                                                                -{Math.round((opp.details?.overallSavingsMs || 0) / 100) / 10}s
                                                            </span>
                                                        </div>
                                                    ))
                                                ) : (
                                                    <div className="h-full flex items-center justify-center text-center text-zinc-400 text-xs p-8 border border-dashed border-zinc-200 rounded-lg">
                                                        {isAnalyzing ? 'Identificando gargalos de performance...' : 'Nenhum problema crítico encontrado.'}
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Overall Health & Strategy */}
                                        <div className="bg-zinc-50 border border-zinc-200 rounded-2xl p-8 flex flex-col justify-between">
                                            <div>
                                                <h3 className="text-lg font-bold text-black mb-2">Diagnóstico Final</h3>
                                                <p className="text-sm text-zinc-500 leading-relaxed mb-6">
                                                    {result.msg}
                                                </p>

                                                <div className="space-y-3">
                                                    <div className="flex justify-between items-center p-3 bg-white rounded-lg border border-zinc-200">
                                                        <span className="text-xs font-bold uppercase text-zinc-500">SEO Técnico</span>
                                                        <span className="font-mono text-sm font-bold">{pageSpeedResult && pageSpeedResult.lighthouseResult ? Math.round(pageSpeedResult.lighthouseResult.categories.seo.score * 100) : 0}%</span>
                                                    </div>
                                                    <div className="flex justify-between items-center p-3 bg-white rounded-lg border border-zinc-200">
                                                        <span className="text-xs font-bold uppercase text-zinc-500">Acessibilidade</span>
                                                        <span className="font-mono text-sm font-bold">{pageSpeedResult && pageSpeedResult.lighthouseResult ? Math.round(pageSpeedResult.lighthouseResult.categories.accessibility.score * 100) : 0}%</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <Button className="w-full mt-6 bg-black text-white hover:bg-zinc-800 rounded-lg h-12 text-xs font-bold uppercase tracking-widest shadow-lg transition-all" onClick={() => window.open('https://revhackers.com/agendar', '_blank')}>
                                                Receber Plano de Ação
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}


                </div>
            </Section>
        </PageLayout>
    );
};

export default SiteScore;
