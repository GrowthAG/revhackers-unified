import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, CheckCircle2, AlertTriangle, Smartphone, Zap, MousePointerClick, Search, LayoutTemplate } from 'lucide-react';
import { ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import PageLayout from '@/components/layout/PageLayout';
import Section from '@/components/ui/Section';

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

const SiteScore = () => {
    const { toast } = useToast();
    const [currentQ, setCurrentQ] = useState(0);
    const [score, setScore] = useState(0);
    const [finished, setFinished] = useState(false);
    const [answers, setAnswers] = useState<number[]>([]);

    const handleAnswer = (optionScore: number) => {
        const newScore = score + optionScore;
        setScore(newScore);
        setAnswers([...answers, optionScore]);

        if (currentQ < QUESTIONS.length - 1) {
            setTimeout(() => setCurrentQ(prev => prev + 1), 250);
        } else {
            setFinished(true);
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
            <Section variant="dark" className="min-h-[100dvh] flex flex-col justify-center py-[5rem] relative overflow-hidden">
                <div className="container-custom max-w-5xl mx-auto relative z-10 w-full">

                    {!finished ? (
                        <div className="max-w-4xl mx-auto">

                            {/* Progress Header */}
                            <div className="mb-12">
                                <div className="flex justify-between items-end mb-4">
                                    <div className="space-y-1">
                                        <span className="text-revgreen text-xs font-mono-tech uppercase tracking-widest">Diagnóstico em Andamento</span>
                                        <h2 className="text-white text-lg font-medium">Análise de Infraestrutura</h2>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-4xl font-bold text-white tracking-tighter">{Math.round((currentQ / QUESTIONS.length) * 100)}%</span>
                                        <span className="text-gray-500 text-xs block font-mono-tech uppercase">Concluído</span>
                                    </div>
                                </div>
                                <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
                                    <motion.div
                                        className="h-full bg-revgreen shadow-[0_0_15px_rgba(34,197,94,0.5)]"
                                        initial={{ width: 0 }}
                                        animate={{ width: `${((currentQ) / QUESTIONS.length) * 100}%` }}
                                        transition={{ duration: 0.5 }}
                                    />
                                </div>
                            </div>

                            <div className="min-h-[400px]">
                                <AnimatePresence mode='wait'>
                                    <motion.div
                                        key={currentQ}
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        transition={{ duration: 0.3 }}
                                        className="bg-black/40 border border-white/10 rounded-2xl p-8 md:p-12 backdrop-blur-sm relative overflow-hidden"
                                    >
                                        {/* Background Detail */}
                                        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
                                            {QUESTIONS[currentQ].icon}
                                        </div>

                                        <div className="mb-10">
                                            <span className="inline-block text-gray-500 text-xs font-mono-tech mb-4 uppercase tracking-wider">
                                                Pergunta {QUESTIONS[currentQ].id} de {QUESTIONS.length}
                                            </span>
                                            <h2 className="text-3xl md:text-4xl font-medium text-white leading-tight">
                                                {QUESTIONS[currentQ].question}
                                            </h2>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {QUESTIONS[currentQ].options.map((opt, idx) => (
                                                <button
                                                    key={idx}
                                                    onClick={() => handleAnswer(opt.score)}
                                                    className="group flex flex-col items-start p-6 text-left bg-white/5 border border-white/10 rounded-xl hover:border-revgreen hover:bg-revgreen/[0.05] transition-all duration-300 relative overflow-hidden"
                                                >
                                                    <div className="absolute top-0 left-0 w-1 h-full bg-revgreen opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                                                    <div className="mb-3 w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-revgreen/20 transition-colors">
                                                        <span className="text-xs font-mono-tech text-gray-400 group-hover:text-revgreen ml-[1px]">{String.fromCharCode(65 + idx)}</span>
                                                    </div>

                                                    <span className="text-base text-gray-300 group-hover:text-white transition-colors">{opt.label}</span>
                                                </button>
                                            ))}
                                        </div>

                                    </motion.div>
                                </AnimatePresence>
                            </div>
                        </div>
                    ) : (
                        /* Dashboard SaaS Result */
                        <motion.div
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="w-full"
                        >
                            <div className="text-center mb-6">
                                <h3 className="text-sm font-mono-tech text-gray-400 uppercase tracking-[0.3em] bg-white/5 inline-block px-4 py-2 rounded-full border border-white/5">
                                    Resultado da Análise
                                </h3>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">

                                {/* Chart Card */}
                                <div className="lg:col-span-5 bg-black border border-white/10 rounded-2xl p-8 flex flex-col items-center justify-center relative shadow-2xl">
                                    <div className="absolute top-6 left-6 text-xs font-mono-tech text-gray-400 uppercase tracking-widest">Performance Score</div>

                                    <div className="relative w-64 h-64 md:w-80 md:h-80 my-8">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <PieChart>
                                                <Pie
                                                    data={chartData}
                                                    cx="50%"
                                                    cy="50%"
                                                    innerRadius="85%"
                                                    outerRadius="100%"
                                                    startAngle={90}
                                                    endAngle={-270}
                                                    dataKey="value"
                                                    stroke="none"
                                                >
                                                    <Cell key="score" fill={score >= 60 ? '#00FF00' : '#333'} /> {/* Hardcoded bright green for max visibility */}
                                                    <Cell key="gap" fill="#1a1a1a" />
                                                </Pie>
                                            </PieChart>
                                        </ResponsiveContainer>

                                        {/* Score Center Text */}
                                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
                                            <div className="text-6xl md:text-7xl font-bold text-white tracking-tighter">{score}</div>
                                            <div className="text-sm text-gray-400 font-mono-tech mt-1">TOTAL</div>
                                        </div>
                                    </div>

                                    <div className={`text-center ${result.color} text-lg font-medium tracking-wide uppercase`}>
                                        {result.title}
                                    </div>
                                </div>

                                {/* Report Card */}
                                <div className="lg:col-span-7 flex flex-col gap-6">
                                    {/* Main Diagnosis */}
                                    <div className="bg-[#0A0A0A] border border-white/10 rounded-2xl p-8 md:p-10 flex-1">
                                        <div className="text-xs font-mono-tech text-revgreen uppercase tracking-widest mb-4">Relatório Executivo</div>
                                        <h2 className="text-3xl font-bold text-white mb-4 leading-tight">{result.headline}</h2>
                                        <p className="text-gray-300 font-light leading-relaxed mb-8">{result.msg}</p>

                                        <Button
                                            className="bg-revgreen text-black hover:bg-revgreen/90 rounded-sm px-8 h-12 uppercase tracking-widest font-bold text-xs w-full md:w-auto"
                                            onClick={() => window.open('https://api.whatsapp.com/send?phone=5511999999999&text=Score:%20' + score, '_blank')}
                                        >
                                            Solicitar Correção Técnica <ArrowRight className="ml-2 w-4 h-4" />
                                        </Button>
                                    </div>

                                    {/* Metrics Breakdown */}
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div className="bg-[#0A0A0A] border border-white/5 rounded-xl p-5">
                                            <div className="flex justify-between mb-2">
                                                <span className="text-xs text-gray-400 font-mono-tech uppercase">Mobile</span>
                                                <span className={answers[0] > 10 ? "text-revgreen text-xs" : "text-gray-500 text-xs"}>{answers[0] > 10 ? 'OK' : 'ERR'}</span>
                                            </div>
                                            <div className="w-full bg-white/5 h-1 rounded-full overflow-hidden">
                                                <div className={`h-full ${answers[0] > 10 ? 'bg-revgreen' : 'bg-red-900'}`} style={{ width: answers[0] > 10 ? '100%' : '30%' }}></div>
                                            </div>
                                        </div>
                                        <div className="bg-[#0A0A0A] border border-white/5 rounded-xl p-5">
                                            <div className="flex justify-between mb-2">
                                                <span className="text-xs text-gray-400 font-mono-tech uppercase">Speed</span>
                                                <span className={answers[1] > 10 ? "text-revgreen text-xs" : "text-gray-500 text-xs"}>{answers[1] > 10 ? 'OK' : 'ERR'}</span>
                                            </div>
                                            <div className="w-full bg-white/5 h-1 rounded-full overflow-hidden">
                                                <div className={`h-full ${answers[1] > 10 ? 'bg-revgreen' : 'bg-red-900'}`} style={{ width: answers[1] > 10 ? '100%' : '30%' }}></div>
                                            </div>
                                        </div>
                                        <div className="bg-[#0A0A0A] border border-white/5 rounded-xl p-5">
                                            <div className="flex justify-between mb-2">
                                                <span className="text-xs text-gray-400 font-mono-tech uppercase">Offer</span>
                                                <span className={answers[2] > 10 ? "text-revgreen text-xs" : "text-gray-500 text-xs"}>{answers[2] > 10 ? 'OK' : 'ERR'}</span>
                                            </div>
                                            <div className="w-full bg-white/5 h-1 rounded-full overflow-hidden">
                                                <div className={`h-full ${answers[2] > 10 ? 'bg-revgreen' : 'bg-red-900'}`} style={{ width: answers[2] > 10 ? '100%' : '30%' }}></div>
                                            </div>
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
