import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Star, Mic, Users, Trophy, Target, Linkedin, CheckCircle2 } from 'lucide-react';
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

// Questions centered on "Authority & Market Positioning"
const QUESTIONS = [
    {
        id: 1,
        icon: <Users className="w-8 h-8 text-revgreen" />,
        question: "Como você é visto no seu mercado hoje?",
        options: [
            { label: "Sou a referência nº 1 (Top of Mind)", score: 20 },
            { label: "Sou conhecido, mas divido atenção com outros", score: 10 },
            { label: "Apenas meus clientes me conhecem", score: 5 },
            { label: "Sou o 'segredo mais bem guardado' (ninguém conhece)", score: 0 }
        ]
    },
    {
        id: 2,
        icon: <Mic className="w-8 h-8 text-revgreen" />,
        question: "Com que frequência você é convidado para palestrar/podcasts?",
        options: [
            { label: "Toda semana / Tenho que recusar convites", score: 20 },
            { label: "Uma vez por mês", score: 10 },
            { label: "Raramente / Só se eu pedir", score: 5 },
            { label: "Nunca fui convocado", score: 0 }
        ]
    },
    {
        id: 3,
        icon: <Target className="w-8 h-8 text-revgreen" />,
        question: "Seu conteúdo gera vendas ou apenas 'curtidas'?",
        options: [
            { label: "Vendas diretas. Posto e o cliente chama.", score: 20 },
            { label: "Gera leads, mas desqualificados", score: 10 },
            { label: "Apenas engajamento (lives, likes) sem dinheiro", score: 5 },
            { label: "Não produzo conteúdo / Fantasma digital", score: 0 }
        ]
    },
    {
        id: 4,
        icon: <Trophy className="w-8 h-8 text-revgreen" />,
        question: "Você cobra mais caro que a concorrência?",
        options: [
            { label: "Sim, sou o mais caro e fecho fácil", score: 20 },
            { label: "Cobro a média do mercado", score: 10 },
            { label: "Preciso dar desconto para fechar", score: 0 },
            { label: "Sou a opção 'barata'", score: 0 }
        ]
    },
    {
        id: 5,
        icon: <Star className="w-8 h-8 text-revgreen" />,
        question: "Você tem um 'Sistema Próprio' ou Metodologia nomeada?",
        options: [
            { label: "Sim, tenho meu método proprietário e registrado", score: 20 },
            { label: "Tenho um jeito de fazer, mas sem nome", score: 10 },
            { label: "Uso métodos de mercado (ex: Agile, Canvas)", score: 5 },
            { label: "Vendo horas de serviço genérico", score: 0 }
        ]
    }
];

type Step = 'start' | 'questions' | 'lead-capture' | 'results';

const FounderScore = () => {
    const { toast } = useToast();
    const [step, setStep] = useState<Step>('start');
    const [linkedinUrl, setLinkedinUrl] = useState('');

    // Question State
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

    const handleStart = (e: React.FormEvent) => {
        e.preventDefault();
        if (!linkedinUrl.includes('linkedin.com')) {
            toast({
                variant: "destructive",
                title: "URL Inválida",
                description: "Por favor, insira um link válido do LinkedIn."
            });
            return;
        }
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

    const { user } = useAuth();

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
            // "answers" column stores the rich metadata since we don't know if specific columns exist
            const richAnswers = {
                ...leadForm,
                linkedin_url: linkedinUrl,
                question_scores: answers,
                generated_at: new Date().toISOString()
            };

            const { error } = await supabase.from('diagnostics').insert([
                {
                    // Core fields identified by user
                    email: leadForm.email,
                    score: score,
                    answers: richAnswers,
                    user_id: user?.id, // Link to auth user if valid
                    type: 'founder' // Discriminator
                }
            ]);

            if (error) throw error;

            setStep('results');
            toast({
                className: "bg-revgreen border-none text-black",
                title: "Diagnóstico Salvo!",
                description: "Seu relatório de Founder Led Growth está desbloqueado."
            });
        } catch (error: any) {
            console.error('Error saving diagnostic:', error);

            // Fallback: If 'type' column doesn't exist, try without it? 
            // Or if 'user_id' fails? 
            // For now, we assume the user's schema description is accurate.

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
            headline: "REFERÊNCIA DE MERCADO",
            title: "Líder de Mercado",
            color: "text-revgreen",
            msg: "Sua marca pessoal é um ativo valioso que gera negócios passivamente. O desafio agora é evitar a diluição e criar equity real (sair da operação sem perder a força)."
        };
        if (score >= 50) return {
            headline: "AUTORIDADE OCULTA",
            title: "Potencial Não Explorado",
            color: "text-white",
            msg: "Você entrega muito resultado, mas o mercado não percebe todo o seu valor. Você está deixando dinheiro na mesa para concorrentes inferiores que fazem mais barulho."
        };
        return {
            headline: "INVISIBILIDADE DIGITAL",
            title: "Commodity",
            color: "text-gray-500",
            msg: "Sem um diferencial claro ou metodologia proprietária, você é forçado a brigar por preço. Sua prioridade nº 1 deve ser sair da 'vala comum' e se tornar único."
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

                    {/* STEP 1: START (LINKEDIN) */}
                    {step === 'start' && (
                        <div className="max-w-2xl mx-auto text-center">
                            <div className="mb-12">
                                <span className="inline-block py-1 px-3 rounded-full bg-revgreen/10 border border-revgreen/20 text-[10px] font-mono-tech text-revgreen uppercase tracking-widest mb-6">Founder Led Growth</span>
                                <h1 className="text-4xl md:text-6xl font-medium text-white mb-6 tracking-tight">
                                    Diagnóstico de Autoridade
                                </h1>
                                <p className="text-gray-400 text-lg leading-relaxed max-w-xl mx-auto">
                                    Descubra se seu posicionamento atual está atraindo ou repelindo grandes clientes. Insira seu perfil para começar.
                                </p>
                            </div>

                            <form onSubmit={handleStart} className="max-w-md mx-auto space-y-4">
                                <div className="space-y-2 text-left">
                                    <Label className="text-xs font-mono-tech text-revgreen uppercase tracking-widest pl-1">Seu Perfil do LinkedIn</Label>

                                    <div className="flex items-center h-14 w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-within:ring-1 focus-within:ring-revgreen/50 focus-within:border-revgreen/50 transition-all hover:bg-white/10">
                                        <span className="text-gray-500 font-medium select-none mr-1 flex items-center gap-2">
                                            <span className="bg-[#0077b5] rounded-sm p-0.5"><Linkedin className="w-3 h-3 text-white fill-white" /></span>
                                            linkedin.com/in/
                                        </span>
                                        <input
                                            className="flex-1 bg-transparent border-none text-white placeholder:text-gray-600 focus:outline-none h-full"
                                            placeholder="seu-usuario"
                                            value={linkedinUrl}
                                            onChange={(e) => setLinkedinUrl(e.target.value)}
                                            required
                                        />
                                    </div>
                                    <p className="text-[10px] text-gray-500 pl-1">Cole o link completo ou apenas seu usuário.</p>
                                </div>
                                <Button type="submit" className="w-full h-12 bg-revgreen text-black hover:bg-revgreen/90 uppercase font-bold tracking-widest text-xs">
                                    Iniciar Análise <ArrowRight className="ml-2 w-4 h-4" />
                                </Button>
                            </form>
                        </div>
                    )}

                    {/* STEP 2: QUESTIONS */}
                    {step === 'questions' && (
                        <div className="max-w-4xl mx-auto">
                            {/* Progress Header */}
                            <div className="mb-12">
                                <div className="flex justify-between items-end mb-4">
                                    <div className="space-y-1">
                                        <span className="text-revgreen text-xs font-mono-tech uppercase tracking-widest">Analisando Perfil</span>
                                        <h2 className="text-white text-lg font-medium">Founder Led Growth</h2>
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

                    {/* STEP 3: LEAD CAPTURE */}
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

                    {/* STEP 4: RESULTS */}
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
                                    <div className="absolute top-6 left-6 text-xs font-mono-tech text-gray-400 uppercase tracking-widest">Authority Score</div>

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
                                        <div className="text-xs font-mono-tech text-revgreen uppercase tracking-widest mb-4">Relatório de Branding</div>
                                        <h2 className="text-3xl font-bold text-white mb-4 leading-tight">{result.headline}</h2>
                                        <div className="p-4 bg-white/5 rounded-lg border border-white/10 mb-6">
                                            <div className="flex items-center gap-3 mb-2">
                                                <Linkedin className="w-5 h-5 text-[#0077b5]" />
                                                <span className="text-sm text-gray-300 font-medium">Perfil Analisado:</span>
                                            </div>
                                            <p className="text-revgreen text-sm truncate">{linkedinUrl}</p>
                                        </div>
                                        <p className="text-gray-300 font-light leading-relaxed mb-8">{result.msg}</p>

                                        <Button
                                            className="bg-revgreen text-black hover:bg-revgreen/90 rounded-sm px-8 h-12 uppercase tracking-widest font-bold text-xs w-full md:w-auto"
                                            onClick={() => window.open('https://api.whatsapp.com/send?phone=5511999999999&text=Fiz%20o%20teste%20de%20Founder%20e%20deu%20nota%20' + score + ',%20quero%20mais%20autoridade.', '_blank')}
                                        >
                                            Solicitar Plano de Branding <ArrowRight className="ml-2 w-4 h-4" />
                                        </Button>
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
export default FounderScore;
