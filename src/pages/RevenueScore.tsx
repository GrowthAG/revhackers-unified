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
            // Consolidate rich data into answers JSONB
            const richAnswers = {
                ...leadForm,
                question_scores: answers,
                generated_at: new Date().toISOString()
            };

            const { error } = await supabase.from('diagnostics').insert([
                {
                    email: leadForm.email,
                    score: score,
                    answers: richAnswers,
                    user_id: user?.id,
                    type: 'revenue'
                }
            ]);

            if (error) throw error;

            setStep('results');
            toast({
                className: "bg-revgreen border-none text-black",
                title: "Diagnóstico Salvo!",
                description: "Seu relatório de Receita está pronto."
            });
        } catch (error: any) {
            console.error('Error saving diagnostic:', error);
            toast({
                variant: "destructive",
                title: "Erro ao salvar",
                description: "Não foi possível salvar seu diagnóstico. Tente novamente."
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
            <Section variant="dark" className="min-h-[100dvh] flex flex-col justify-center py-[5rem] relative overflow-hidden">
                <div className="container-custom max-w-5xl mx-auto relative z-10 w-full">

                    {/* STEP 1: QUESTIONS */}
                    {step === 'questions' && (
                        <div className="max-w-4xl mx-auto">
                            {/* Progress Header */}
                            <div className="mb-12">
                                <div className="flex justify-between items-end mb-4">
                                    <div className="space-y-1">
                                        <span className="text-revgreen text-xs font-mono-tech uppercase tracking-widest">Diagnóstico em Andamento</span>
                                        <h2 className="text-white text-lg font-medium">Termômetro de Crescimento</h2>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-4xl font-bold text-white tracking-tighter">{Math.round(((currentQ) / QUESTIONS.length) * 100)}%</span>
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
                                        <div className="mb-10">
                                            <span className="inline-block text-gray-500 text-xs font-mono-tech mb-4 uppercase tracking-wider">
                                                Fator {QUESTIONS[currentQ].id}
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
                    )}

                    {/* STEP 2: LEAD CAPTURE */}
                    {step === 'lead-capture' && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="max-w-md mx-auto"
                        >
                            <div className="bg-black/60 border border-white/10 rounded-2xl p-8 backdrop-blur-xl relative overflow-hidden">
                                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-revgreen/50 to-transparent"></div>

                                <div className="text-center mb-8">
                                    <h2 className="text-2xl font-bold text-white mb-2">Análise Concluída</h2>
                                    <p className="text-gray-400 text-sm">
                                        Nossa IA processou seus dados. Preencha seus dados corporativos para acessar o dashboard estratégico.
                                    </p>
                                </div>

                                <form onSubmit={handleLeadSubmit} className="space-y-4">
                                    <div className="space-y-2">
                                        <Label className="text-[11px] font-mono-tech text-gray-400 uppercase tracking-wider">Nome Completo</Label>
                                        <Input
                                            required
                                            className="bg-white/5 border-white/10 text-white h-11 focus:border-revgreen/50"
                                            value={leadForm.name}
                                            onChange={e => setLeadForm({ ...leadForm, name: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-[11px] font-mono-tech text-gray-400 uppercase tracking-wider">E-mail Corporativo</Label>
                                        <Input
                                            required
                                            type="email"
                                            className="bg-white/5 border-white/10 text-white h-11 focus:border-revgreen/50"
                                            value={leadForm.email}
                                            onChange={e => setLeadForm({ ...leadForm, email: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-[11px] font-mono-tech text-gray-400 uppercase tracking-wider">Nome da Empresa</Label>
                                        <Input
                                            required
                                            className="bg-white/5 border-white/10 text-white h-11 focus:border-revgreen/50"
                                            value={leadForm.company}
                                            onChange={e => setLeadForm({ ...leadForm, company: e.target.value })}
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label className="text-[11px] font-mono-tech text-gray-400 uppercase tracking-wider">WhatsApp</Label>
                                            <Input
                                                required
                                                type="tel"
                                                className="bg-white/5 border-white/10 text-white h-11 focus:border-revgreen/50"
                                                value={leadForm.phone}
                                                onChange={e => setLeadForm({ ...leadForm, phone: e.target.value })}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-[11px] font-mono-tech text-gray-400 uppercase tracking-wider">Cargo</Label>
                                            <Select onValueChange={val => setLeadForm({ ...leadForm, role: val })}>
                                                <SelectTrigger className="bg-white/5 border-white/10 text-white h-11 focus:ring-revgreen/50">
                                                    <SelectValue placeholder="Selecione" />
                                                </SelectTrigger>
                                                <SelectContent className="bg-black border-white/10 text-white">
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
                                        className="w-full bg-revgreen text-black hover:bg-revgreen/90 h-12 mt-4 font-bold tracking-widest uppercase text-xs shadow-[0_0_20px_rgba(34,197,94,0.1)] hover:shadow-[0_0_30px_rgba(34,197,94,0.3)] transition-all"
                                    >
                                        {isSubmitting ? 'Gerando Relatório...' : 'Desbloquear Resultado'}
                                    </Button>
                                </form>
                            </div>
                        </motion.div>
                    )}

                    {/* STEP 3: RESULTS */}
                    {step === 'results' && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="w-full"
                        >
                            <div className="text-center mb-6">
                                <h3 className="text-sm font-mono-tech text-gray-400 uppercase tracking-[0.3em] bg-white/5 inline-block px-4 py-2 rounded-full border border-white/5">
                                    Resultado Oficial
                                </h3>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">

                                {/* Chart Card */}
                                <div className="lg:col-span-5 bg-black border border-white/10 rounded-2xl p-8 flex flex-col items-center justify-center relative shadow-2xl">
                                    <div className="absolute top-6 left-6 text-xs font-mono-tech text-gray-400 uppercase tracking-widest">Revenue Score</div>

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
                                                    <Cell key="score" fill={score >= 60 ? '#00FF00' : '#333'} />
                                                    <Cell key="gap" fill="#1a1a1a" />
                                                </Pie>
                                            </PieChart>
                                        </ResponsiveContainer>

                                        {/* Score Center Text */}
                                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
                                            <div className="text-6xl md:text-7xl font-bold text-white tracking-tighter">{score}</div>
                                            <div className="text-sm text-gray-400 font-mono-tech mt-1">PONTOS</div>
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
                                        <div className="text-xs font-mono-tech text-revgreen uppercase tracking-widest mb-4">Diagnóstico Operacional</div>
                                        <h2 className="text-3xl font-bold text-white mb-4 leading-tight">{result.headline}</h2>
                                        <p className="text-gray-300 font-light leading-relaxed mb-8">{result.msg}</p>

                                        <Button
                                            className="bg-revgreen text-black hover:bg-revgreen/90 rounded-sm px-8 h-12 uppercase tracking-widest font-bold text-xs w-full md:w-auto"
                                            onClick={() => window.open('https://api.whatsapp.com/send?phone=5511999999999&text=Fiz%20o%20teste%20de%20Receita%20e%20deu%20nota%20' + score + ',%20quero%20escalar.', '_blank')}
                                        >
                                            Agendar Plano de Escala <ArrowRight className="ml-2 w-4 h-4" />
                                        </Button>
                                    </div>

                                    {/* Metrics Breakdown */}
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div className="bg-[#0A0A0A] border border-white/5 rounded-xl p-5">
                                            <div className="flex justify-between mb-2">
                                                <span className="text-xs text-gray-400 font-mono-tech uppercase">Previsibilidade</span>
                                                <span className={answers[0] > 10 ? "text-revgreen text-xs" : "text-gray-500 text-xs"}>{answers[0] > 10 ? 'ALTA' : 'BAIXA'}</span>
                                            </div>
                                            <div className="w-full bg-white/5 h-1 rounded-full overflow-hidden">
                                                <div className={`h-full ${answers[0] > 10 ? 'bg-revgreen' : 'bg-red-900'}`} style={{ width: answers[0] > 10 ? '100%' : '30%' }}></div>
                                            </div>
                                        </div>
                                        <div className="bg-[#0A0A0A] border border-white/5 rounded-xl p-5">
                                            <div className="flex justify-between mb-2">
                                                <span className="text-xs text-gray-400 font-mono-tech uppercase">Dependência</span>
                                                <span className={answers[4] > 10 ? "text-revgreen text-xs" : "text-gray-500 text-xs"}>{answers[4] > 10 ? 'BAIXA' : 'ALTA'}</span>
                                            </div>
                                            <div className="w-full bg-white/5 h-1 rounded-full overflow-hidden">
                                                <div className={`h-full ${answers[4] > 10 ? 'bg-revgreen' : 'bg-red-900'}`} style={{ width: answers[4] > 10 ? '100%' : '30%' }}></div>
                                            </div>
                                        </div>
                                        <div className="bg-[#0A0A0A] border border-white/5 rounded-xl p-5">
                                            <div className="flex justify-between mb-2">
                                                <span className="text-xs text-gray-400 font-mono-tech uppercase">Dados</span>
                                                <span className={answers[2] > 10 ? "text-revgreen text-xs" : "text-gray-500 text-xs"}>{answers[2] > 10 ? 'OK' : 'RUIM'}</span>
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
export default RevenueScore;
