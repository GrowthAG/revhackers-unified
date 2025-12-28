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
import { submitPublicDiagnostic } from "@/api/publicDiagnostic";
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

            await submitPublicDiagnostic(
                { ...leadForm },
                { linkedin_url: linkedinUrl, individual_answers: answers },
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
                description: "Seu diagnóstico de autoridade foi processado."
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

            {step === 'start' && (
                <Section variant="light" className="min-h-[100dvh] flex flex-col justify-center py-[5rem] relative overflow-hidden bg-white">
                    <div className="container-custom max-w-5xl mx-auto relative z-10 w-full text-center">
                        <div className="max-w-3xl mx-auto">
                            <h1 className="text-5xl md:text-7xl font-bold mb-8 tracking-tighter text-black">
                                <span className="text-slate-400">Founder</span> Authority Score
                            </h1>
                            <p className="text-xl text-slate-500 mb-12 leading-relaxed">
                                Descubra o nível de influência e autoridade do seu perfil.
                                Analisamos seu ecossistema digital em segundos.
                            </p>

                            <form onSubmit={handleStart} className="max-w-md mx-auto space-y-4">
                                <Input
                                    placeholder="Seu Perfil LinkedIn (URL)"
                                    className="bg-slate-50 border-slate-200 text-black h-14 rounded-xl text-center focus:border-black"
                                    value={linkedinUrl}
                                    onChange={(e) => setLinkedinUrl(e.target.value)}
                                    required
                                />
                                <Button type="submit" className="w-full bg-black text-white hover:bg-slate-900 h-14 font-bold tracking-widest uppercase text-xs rounded-xl">
                                    Iniciar Análise Grátis <ArrowRight className="ml-2 w-4 h-4" />
                                </Button>
                            </form>
                        </div>
                    </div>
                </Section>
            )}

            {(step === 'questions' || step === 'lead-capture') && (
                <Section variant="light" className="min-h-[100dvh] flex flex-col justify-center py-[5rem] relative overflow-hidden bg-white">
                    <div className="container-custom max-w-5xl mx-auto relative z-10 w-full">
                        {step === 'questions' && (
                            <div className="max-w-4xl mx-auto">
                                <div className="mb-12">
                                    <div className="flex justify-between items-end mb-4">
                                        <div className="space-y-1">
                                            <span className="text-black text-xs font-mono-tech uppercase tracking-widest font-bold">Análise de Autoridade</span>
                                            <h2 className="text-slate-500 text-lg font-medium">Extraindo Dados de Perfil...</h2>
                                        </div>
                                        <div className="text-right">
                                            <span className="text-4xl font-bold text-black tracking-tighter">{Math.round((currentQ / QUESTIONS.length) * 100)}%</span>
                                        </div>
                                    </div>
                                    <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                                        <motion.div
                                            className="h-full bg-black"
                                            initial={{ width: 0 }}
                                            animate={{ width: `${(currentQ / QUESTIONS.length) * 100}%` }}
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
                                            className="bg-white"
                                        >
                                            <h2 className="text-3xl md:text-5xl font-bold text-black mb-10 tracking-tight leading-tight">
                                                {QUESTIONS[currentQ].question}
                                            </h2>
                                            <div className="grid grid-cols-1 gap-3">
                                                {QUESTIONS[currentQ].options.map((opt, idx) => (
                                                    <button
                                                        key={idx}
                                                        onClick={() => handleAnswer(opt.score)}
                                                        className="group flex items-center p-6 text-left bg-white border border-slate-200 rounded-xl hover:border-black hover:bg-slate-50 transition-all font-medium"
                                                    >
                                                        <div className="mr-6 w-10 h-10 rounded-full border border-slate-200 flex items-center justify-center group-hover:border-black group-hover:bg-black group-hover:text-white transition-all font-mono-tech text-sm">
                                                            {String.fromCharCode(65 + idx)}
                                                        </div>
                                                        <span className="text-lg text-slate-600 group-hover:text-black">{opt.label}</span>
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
                                <div className="bg-white border border-slate-200 rounded-3xl p-10 shadow-sm">
                                    <div className="text-center mb-10">
                                        <h2 className="text-2xl font-black text-black mb-2 tracking-tighter uppercase">RELATÓRIO AUTORIZADO</h2>
                                        <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest">
                                            Identificação obrigatória para acesso aos dados.
                                        </p>
                                    </div>

                                    <form onSubmit={handleLeadSubmit} className="space-y-4">
                                        <div className="space-y-1">
                                            <Label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">NOME COMPLETO</Label>
                                            <Input
                                                required
                                                className="bg-white border-zinc-200 text-black h-12 rounded-none focus:border-black transition-all"
                                                value={leadForm.name}
                                                onChange={e => setLeadForm({ ...leadForm, name: e.target.value })}
                                                placeholder="NOME E SOBRENOME"
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <Label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">E-MAIL CORPORATIVO</Label>
                                            <Input
                                                required
                                                type="email"
                                                className="bg-white border-zinc-200 text-black h-12 rounded-none focus:border-black transition-all"
                                                value={leadForm.email}
                                                onChange={e => setLeadForm({ ...leadForm, email: e.target.value })}
                                                placeholder="EX: NOME@EMPRESA.COM"
                                            />
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-1">
                                                <Label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">EMPRESA</Label>
                                                <Input
                                                    required
                                                    className="bg-white border-zinc-200 text-black h-12 rounded-none focus:border-black transition-all"
                                                    value={leadForm.company}
                                                    onChange={e => setLeadForm({ ...leadForm, company: e.target.value })}
                                                    placeholder="ORGANIZAÇÃO"
                                                />
                                            </div>
                                            <div className="space-y-1">
                                                <Label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">CARGO</Label>
                                                <Select onValueChange={val => setLeadForm({ ...leadForm, role: val })}>
                                                    <SelectTrigger className="bg-white border-zinc-200 text-black h-12 rounded-none focus:ring-0">
                                                        <SelectValue placeholder="SELECIONAR" />
                                                    </SelectTrigger>
                                                    <SelectContent className="bg-white border-zinc-200 text-black rounded-none">
                                                        <SelectItem value="vp">VP / C-Level</SelectItem>
                                                        <SelectItem value="diretor">Diretor(a)</SelectItem>
                                                        <SelectItem value="gerente">Gerente</SelectItem>
                                                        <SelectItem value="outros">Outros</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>

                                        <div className="space-y-1">
                                            <Label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">WHATSAPP</Label>
                                            <Input
                                                required
                                                type="tel"
                                                className="bg-white border-zinc-200 text-black h-12 rounded-none focus:border-black transition-all"
                                                value={leadForm.phone}
                                                onChange={e => setLeadForm({ ...leadForm, phone: e.target.value })}
                                                placeholder="+55"
                                            />
                                        </div>

                                        <Button
                                            type="submit"
                                            disabled={isSubmitting}
                                            className="w-full bg-black text-white hover:bg-revgreen hover:text-black h-14 mt-6 font-bold tracking-[0.2em] uppercase text-[10px] rounded-none shadow-none transition-all duration-300"
                                        >
                                            {isSubmitting ? 'Gerando Relatório...' : 'Baixar Dashboard de Autoridade'}
                                        </Button>
                                    </form>
                                </div>
                            </motion.div>
                        )}
                    </div>
                </Section>
            )}

            {step === 'results' && (
                <div className="min-h-screen bg-black text-white py-20">
                    <div className="container-custom max-w-6xl mx-auto">
                        <div className="flex justify-center mb-12">
                            <span className="bg-white/5 border border-white/10 px-6 py-2 rounded-full text-[10px] font-mono-tech uppercase tracking-[0.4em] text-gray-400">
                                Resultado Oficial
                            </span>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                            <div className="lg:col-span-5 bg-[#0a0a0a] border border-white/5 rounded-3xl p-12 flex flex-col items-center justify-center relative shadow-2xl">
                                <div className="absolute top-8 left-8 text-[10px] font-mono-tech text-gray-500 uppercase tracking-widest">Authority Score</div>

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
                                        <div className="text-xs text-gray-500 font-mono-tech mt-2 tracking-widest uppercase">Indice</div>
                                    </div>
                                </div>

                                <div className="mt-4 text-center">
                                    <div className="text-revgreen text-sm font-mono-tech font-bold uppercase tracking-widest">
                                        {score >= 80 ? 'Líder de Categoria' : score >= 50 ? 'Autoridade Emergente' : 'Invisibilidade Digital'}
                                    </div>
                                </div>
                            </div>

                            <div className="lg:col-span-7 bg-[#0a0a0a] border border-white/5 rounded-3xl p-12 flex flex-col justify-between shadow-2xl">
                                <div>
                                    <span className="text-revgreen text-xs font-mono-tech uppercase tracking-widest font-bold block mb-4">Análise de IA de Perfil</span>
                                    <h2 className="text-5xl font-bold text-white mb-6 leading-tight tracking-tight uppercase">{result.title}</h2>
                                    <p className="text-gray-400 text-xl font-light leading-relaxed mb-10 max-w-xl">
                                        {result.msg}
                                    </p>
                                </div>

                                <Button
                                    className="bg-revgreen text-black hover:bg-revgreen/90 rounded-xl px-10 h-16 uppercase tracking-widest font-bold text-xs w-full lg:w-auto shadow-[0_0_30px_rgba(34,197,94,0.2)]"
                                    onClick={() => window.open('https://api.whatsapp.com/send?phone=5511999999999&text=Dashboard:%20Founder%20Authority', '_blank')}
                                >
                                    Solicitar Auditoria de Perfil <ArrowRight className="ml-3 w-4 h-4" />
                                </Button>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                            {[
                                { label: 'Engajamento', val: answers[0] > 10 ? 'Alto' : 'Baixo', color: answers[0] > 10 ? 'bg-revgreen' : 'bg-red-500' },
                                { label: 'Reputação', val: answers[1] > 10 ? 'Alta' : 'Em Construção', color: answers[1] > 10 ? 'bg-revgreen' : 'bg-red-500' },
                                { label: 'Reach (Alcance)', val: answers[2] > 10 ? 'Global' : 'Local', color: answers[2] > 10 ? 'bg-revgreen' : 'bg-red-500' }
                            ].map((item, idx) => (
                                <div key={idx} className="bg-[#0a0a0a] border border-white/5 rounded-2xl p-6">
                                    <div className="flex justify-between items-center mb-3">
                                        <span className="text-[10px] font-mono-tech text-gray-500 uppercase tracking-widest">{item.label}</span>
                                        <span className={`text-[10px] font-mono-tech uppercase font-bold ${item.val === 'Alto' || item.val === 'Alta' || item.val === 'Global' ? 'text-revgreen' : 'text-red-500'}`}>
                                            {item.val}
                                        </span>
                                    </div>
                                    <div className="w-full bg-white/5 h-1 rounded-full overflow-hidden">
                                        <div className={`h-full ${item.color}`} style={{ width: item.val === 'Alto' || item.val === 'Alta' || item.val === 'Global' ? '100%' : '30%' }}></div>
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

export default FounderScore;
