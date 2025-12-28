import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, TrendingUp, BarChart, Users2, Database, DollarSign, Lock, CheckCircle2 } from 'lucide-react';
import { ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import PageLayout from '@/components/layout/PageLayout';
import Section from '@/components/ui/Section';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { submitPublicDiagnostic } from "@/api/publicDiagnostic";

// Questions centered on "Revenue Maturity & Scale"
const QUESTIONS = [
    {
        id: 1,
        icon: <TrendingUp className="w-8 h-8 text-revgreen" />,
        question: "Sua receita é previsível?",
        options: [
            { label: "Sim, sei exatamente quanto vou faturar mês que vem", score: 20 },
            { label: "Mais ou menos, oscila mas tem base", score: 10 },
            { label: "Não, vivo de altos e baixos (montanha-russa)", score: 5 },
            { label: "Dependo da sorte ou de indicações aleatórias", score: 0 }
        ]
    },
    {
        id: 2,
        icon: <Users2 className="w-8 h-8 text-revgreen" />,
        question: "Quem vende na sua empresa?",
        options: [
            { label: "Tenho um time de vendas estruturado (SDR + Closer)", score: 20 },
            { label: "Eu (Founder) e mais um vendedor", score: 10 },
            { label: "Apenas eu (Founder) vendo tudo", score: 5 },
            { label: "Ninguém vende ativamente (vendas passivas)", score: 0 }
        ]
    },
    {
        id: 3,
        icon: <Database className="w-8 h-8 text-revgreen" />,
        question: "Você usa CRM?",
        options: [
            { label: "Sim, tudo registrado e com automações", score: 20 },
            { label: "Sim, mas usamos mal / falta atualizar", score: 10 },
            { label: "Uso planilha de Excel / Trello", score: 5 },
            { label: "Uso caderno ou cabeça", score: 0 }
        ]
    },
    {
        id: 4,
        icon: <BarChart className="w-8 h-8 text-revgreen" />,
        question: "Qual sua taxa de conversão de Lead para Cliente?",
        options: [
            { label: "Sei exatamente (acompanho semanalmente)", score: 20 },
            { label: "Tenho uma ideia aproximada", score: 10 },
            { label: "Não sei", score: 0 },
            { label: "Não meço nada", score: 0 }
        ]
    },
    {
        id: 5,
        icon: <DollarSign className="w-8 h-8 text-revgreen" />,
        question: "Se você (Founder) viajar por 30 dias, a empresa cresce?",
        options: [
            { label: "Sim, continua batendo meta sem mim", score: 20 },
            { label: "Mantém, mas não cresce", score: 10 },
            { label: "Cai o faturamento", score: 5 },
            { label: "A empresa para/quebra", score: 0 }
        ]
    }
];

type Step = 'questions' | 'lead-capture' | 'results';

const RevenueScore = () => {
    const { toast } = useToast();
    const { user } = useAuth();
    const [step, setStep] = useState<Step>('questions');

    const [currentQ, setCurrentQ] = useState(0);
    const [score, setScore] = useState(0);
    const [answers, setAnswers] = useState<number[]>([]);

    // Lead Form State
    const [leadForm, setLeadForm] = useState({
        name: '',
        email: '',
        phone: '',
        company: '',
        role: ''
    });
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

            await submitPublicDiagnostic(
                leadForm,
                {}, // We should ideally pass answers here
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
                description: "Seu diagnóstico de infraestrutura de receita foi processado."
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
        if (score >= 85) return {
            headline: "MÁQUINA DE VENDAS VALIDADA",
            title: "Operação Escalável",
            color: "text-revgreen",
            msg: "Você construiu um sistema que não depende de sorte. O foco agora é eficiência marginal (CAC/LTV) e expansão de canais."
        };
        if (score >= 50) return {
            headline: "GARGALO OPERACIONAL DETECTADO",
            title: "Tração sem Escala",
            color: "text-white",
            msg: "Você tem tração, mas sua operação depende de esforço manual ou heroísmo. Para crescer 10x, é preciso automatizar processos."
        };
        return {
            headline: "RISCO DE QUEBRA ALTO",
            title: "Caos Artesanal",
            color: "text-gray-400",
            msg: "Se você parar, o dinheiro para. Sua receita é imprevisível. O risco de burnout ou quebra é altíssimo sem processos."
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

                    {step === 'questions' && (
                        <div className="max-w-4xl mx-auto">
                            {/* Progress Header */}
                            <div className="mb-12">
                                <div className="flex justify-between items-end mb-4">
                                    <div className="space-y-1">
                                        <span className="text-black text-xs font-mono-tech uppercase tracking-widest font-bold">Diagnóstico de Receita</span>
                                        <h2 className="text-slate-500 text-lg font-medium">Análise de Maturidade</h2>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-4xl font-bold text-black tracking-tighter">{Math.round((currentQ / QUESTIONS.length) * 100)}%</span>
                                        <span className="text-slate-400 text-xs block font-mono-tech uppercase">Concluído</span>
                                    </div>
                                </div>
                                <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                                    <motion.div
                                        className="h-full bg-black"
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
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        transition={{ duration: 0.3 }}
                                        className="bg-white rounded-2xl p-0 relative"
                                    >
                                        <div className="mb-10">
                                            <span className="inline-block text-slate-400 text-xs font-mono-tech mb-4 uppercase tracking-wider">
                                                Pergunta {QUESTIONS[currentQ].id} de {QUESTIONS.length}
                                            </span>
                                            <h2 className="text-3xl md:text-5xl font-bold text-black leading-tight tracking-tight">
                                                {QUESTIONS[currentQ].question}
                                            </h2>
                                        </div>

                                        <div className="grid grid-cols-1 gap-3">
                                            {QUESTIONS[currentQ].options.map((opt, idx) => (
                                                <button
                                                    key={idx}
                                                    onClick={() => handleAnswer(opt.score)}
                                                    className="group flex items-center p-6 text-left bg-white border border-slate-200 rounded-xl hover:border-black hover:bg-slate-50 transition-all duration-200"
                                                >
                                                    <div className="mr-6 w-10 h-10 rounded-full border border-slate-200 flex items-center justify-center group-hover:border-black group-hover:bg-black group-hover:text-white transition-all font-mono-tech text-sm">
                                                        {String.fromCharCode(65 + idx)}
                                                    </div>
                                                    <span className="text-lg text-slate-600 group-hover:text-black transition-colors font-medium">{opt.label}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </motion.div>
                                </AnimatePresence>
                            </div>
                        </div>
                    )}

                    {step === 'lead-capture' && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="max-w-md mx-auto"
                        >
                            <div className="bg-white border border-slate-200 rounded-3xl p-10 shadow-sm relative overflow-hidden">
                                <div className="text-center mb-10">
                                    <h2 className="text-2xl font-black text-black mb-2 tracking-tighter uppercase">RELATÓRIO AUTORIZADO</h2>
                                    <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest">
                                        Identificação obrigatória para download dos dados.
                                    </p>
                                </div>

                                <form onSubmit={handleLeadSubmit} className="space-y-4">
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">NOME COMPLETO</Label>
                                        <Input
                                            required
                                            className="bg-white border-zinc-200 text-black h-12 focus:border-black rounded-none transition-all placeholder:text-zinc-300"
                                            value={leadForm.name}
                                            onChange={e => setLeadForm({ ...leadForm, name: e.target.value })}
                                            placeholder="NOME E SOBRENOME"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">E-MAIL CORPORATIVO</Label>
                                        <Input
                                            required
                                            type="email"
                                            className="bg-white border-zinc-200 text-black h-12 focus:border-black rounded-none transition-all placeholder:text-zinc-300"
                                            value={leadForm.email}
                                            onChange={e => setLeadForm({ ...leadForm, email: e.target.value })}
                                            placeholder="EX: NOME@EMPRESA.COM"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">NOME DA EMPRESA</Label>
                                        <Input
                                            required
                                            className="bg-white border-zinc-200 text-black h-12 focus:border-black rounded-none transition-all placeholder:text-zinc-300"
                                            value={leadForm.company}
                                            onChange={e => setLeadForm({ ...leadForm, company: e.target.value })}
                                            placeholder="NOME DA ORGANIZAÇÃO"
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">WHATSAPP</Label>
                                            <Input
                                                required
                                                type="tel"
                                                className="bg-white border-zinc-200 text-black h-12 focus:border-black rounded-none transition-all placeholder:text-zinc-300"
                                                value={leadForm.phone}
                                                onChange={e => setLeadForm({ ...leadForm, phone: e.target.value })}
                                                placeholder="+55"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">CARGO</Label>
                                            <Select onValueChange={val => setLeadForm({ ...leadForm, role: val })}>
                                                <SelectTrigger className="bg-white border-zinc-200 text-black h-12 rounded-none focus:ring-0">
                                                    <SelectValue placeholder="SELECIONAR" />
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
                                        className="w-full bg-black text-white hover:bg-revgreen hover:text-black h-14 mt-6 font-bold tracking-[0.2em] uppercase text-[10px] rounded-none transition-all duration-300"
                                    >
                                        {isSubmitting ? 'Gerando Relatório...' : 'Baixar Dashboard Estratégico'}
                                    </Button>
                                </form>
                            </div>
                        </motion.div>
                    )}
                </div>
            </Section>

            {step === 'results' && (
                <div className="min-h-screen bg-black text-white py-20">
                    <div className="container-custom max-w-6xl mx-auto">
                        <div className="flex justify-center mb-12">
                            <span className="bg-white/5 border border-white/10 px-6 py-2 rounded-full text-[10px] font-mono-tech uppercase tracking-[0.4em] text-gray-400">
                                Resultado Oficial
                            </span>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
                            {/* Score Circle Card */}
                            <div className="lg:col-span-5 bg-[#0a0a0a] border border-white/5 rounded-3xl p-12 flex flex-col items-center justify-center relative shadow-2xl">
                                <div className="absolute top-8 left-8 text-[10px] font-mono-tech text-gray-500 uppercase tracking-widest">Revenue Score</div>

                                <div className="relative w-72 h-72 my-8">
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
                                                <Cell key="score" fill="#22c55e" />
                                                <Cell key="gap" fill="#111" />
                                            </Pie>
                                        </PieChart>
                                    </ResponsiveContainer>
                                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
                                        <div className="text-8xl font-bold text-white tracking-tighter leading-none">{score}</div>
                                        <div className="text-xs text-gray-500 font-mono-tech mt-2 tracking-widest uppercase">Pontos</div>
                                    </div>
                                </div>

                                <div className="mt-4 text-center">
                                    <div className="text-revgreen text-sm font-mono-tech font-bold uppercase tracking-widest">
                                        {score >= 80 ? 'Operação Escalável' : score >= 50 ? 'Potencial de Tração' : 'Risco Operacional'}
                                    </div>
                                </div>
                            </div>

                            {/* Info Card */}
                            <div className="lg:col-span-7 bg-[#0a0a0a] border border-white/5 rounded-3xl p-12 flex flex-col justify-between shadow-2xl">
                                <div>
                                    <span className="text-revgreen text-xs font-mono-tech uppercase tracking-widest font-bold block mb-4">Diagnóstico Operacional</span>
                                    <h2 className="text-5xl font-bold text-white mb-6 leading-tight tracking-tight uppercase">{result.title}</h2>
                                    <p className="text-gray-400 text-xl font-light leading-relaxed mb-10 max-w-xl">
                                        {result.msg}
                                    </p>
                                </div>

                                <Button
                                    className="bg-revgreen text-black hover:bg-revgreen/90 rounded-xl px-10 h-16 uppercase tracking-widest font-bold text-xs w-full lg:w-auto shadow-[0_0_30px_rgba(34,197,94,0.2)] transition-all"
                                    onClick={() => window.open('https://api.whatsapp.com/send?phone=5511999999999&text=Dashboard:%20Revenue%20Score', '_blank')}
                                >
                                    Agendar Plano de Escala <ArrowRight className="ml-3 w-4 h-4" />
                                </Button>
                            </div>
                        </div>

                        {/* Metric Bars (Bottom row) */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                            {[
                                { label: 'Previsibilidade', val: answers[0] > 10 ? 'Alta' : 'Baixa', color: answers[0] > 10 ? 'bg-revgreen' : 'bg-red-500' },
                                { label: 'Dependência', val: answers[4] > 10 ? 'Baixa' : 'Alta', color: answers[4] > 10 ? 'bg-revgreen' : 'bg-red-500' },
                                { label: 'Dados', val: answers[2] > 10 ? 'OK' : 'Crítico', color: answers[2] > 10 ? 'bg-revgreen' : 'bg-red-500' }
                            ].map((item, idx) => (
                                <div key={idx} className="bg-[#0a0a0a] border border-white/5 rounded-2xl p-6">
                                    <div className="flex justify-between items-center mb-3">
                                        <span className="text-[10px] font-mono-tech text-gray-500 uppercase tracking-widest">{item.label}</span>
                                        <span className={`text-[10px] font-mono-tech uppercase font-bold ${item.val === 'Alta' || (item.val === 'Baixa' && idx === 1) || item.val === 'OK' ? 'text-revgreen' : 'text-red-500'}`}>
                                            {item.val}
                                        </span>
                                    </div>
                                    <div className="w-full bg-white/5 h-1 rounded-full overflow-hidden">
                                        <div className={`h-full ${item.color}`} style={{ width: item.val === 'Alta' || (item.val === 'Baixa' && idx === 1) || item.val === 'OK' ? '100%' : '30%' }}></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </PageLayout>
    );
};
export default RevenueScore;
