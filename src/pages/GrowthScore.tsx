import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, BarChart2, Zap, RefreshCcw, Share2, Briefcase, CheckCircle2, Check, Database, Layout } from 'lucide-react';
import { ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import PageLayout from '@/components/layout/PageLayout';
import Section from '@/components/ui/Section';
import { useToast } from '@/hooks/use-toast';
import { submitPublicDiagnostic } from "@/api/publicDiagnostic";

// --- TYPES ---
type Dimension = 'revenue' | 'process' | 'data' | 'tech';

interface Option {
    text: string;
    points: number;
    dimensions: Record<Dimension, number>;
}

interface Question {
    id: number;
    question: string;
    subtext?: string;
    options: Option[];
}

const QUESTIONS: Question[] = [
    {
        id: 1,
        question: "Se você precisasse demitir seu melhor vendedor hoje, o que aconteceria com sua receita no próximo mês?",
        subtext: "Teste de Dependência vs. Processo",
        options: [
            { text: "Cairia drasticamente (>30%). Dependemos do talento individual.", points: 0, dimensions: { revenue: 2, process: 0, data: 2, tech: 0 } },
            { text: "Cairia um pouco, mas temos outros performando bem.", points: 5, dimensions: { revenue: 5, process: 4, data: 4, tech: 2 } },
            { text: "Quase nada. O processo traz os leads e o playbook converte.", points: 10, dimensions: { revenue: 9, process: 10, data: 8, tech: 6 } }
        ]
    },
    {
        id: 2,
        question: "Como sua equipe define quem deve ser abordado (prospectado) hoje?",
        options: [
            { text: "Feeling / Intuição. Cada um faz sua lista.", points: 0, dimensions: { revenue: 2, process: 1, data: 0, tech: 0 } },
            { text: "Listas frias compradas ou geradas sem filtro profundo.", points: 3, dimensions: { revenue: 4, process: 3, data: 3, tech: 2 } },
            { text: "Scoring comportamental (quem acessou o site/abriu e-mail).", points: 7, dimensions: { revenue: 7, process: 7, data: 8, tech: 7 } },
            { text: "Inteligência preditiva e sinais de intenção claros.", points: 10, dimensions: { revenue: 10, process: 9, data: 10, tech: 9 } }
        ]
    },
    {
        id: 3,
        question: "Seu crescimento de receita atual é Linear ou Exponencial?",
        options: [
            { text: "Linear. Para vender mais, preciso de mais vendedores.", points: 2, dimensions: { revenue: 4, process: 4, data: 2, tech: 1 } },
            { text: "Alavancado. Consigo vender mais mantendo a mesma equipe.", points: 8, dimensions: { revenue: 8, process: 7, data: 6, tech: 9 } },
            { text: "Exponencial. A tecnologia vende enquanto dormimos.", points: 10, dimensions: { revenue: 10, process: 8, data: 8, tech: 10 } }
        ]
    },
    {
        id: 4,
        question: "Você sabe exatamente quanto custa para adquirir um cliente (CAC) e quanto ele deixa (LTV) por canal?",
        options: [
            { text: "Não tenho esses números claros.", points: 0, dimensions: { revenue: 0, process: 0, data: 0, tech: 0 } },
            { text: "Sei o geral da empresa, mas não por canal.", points: 5, dimensions: { revenue: 6, process: 4, data: 5, tech: 3 } },
            { text: "Tenho dashboards em tempo real com esses dados.", points: 10, dimensions: { revenue: 10, process: 8, data: 10, tech: 8 } }
        ]
    },
    {
        id: 5,
        question: "Suas ferramentas de Marketing e Vendas conversam entre si?",
        options: [
            { text: "Não. São silos separados.", points: 0, dimensions: { revenue: 2, process: 0, data: 0, tech: 0 } },
            { text: "Exportamos planilhas de um para o outro manualmente.", points: 3, dimensions: { revenue: 5, process: 3, data: 3, tech: 2 } },
            { text: "Integração nativa/automática. O dado flui sozinho.", points: 10, dimensions: { revenue: 9, process: 8, data: 9, tech: 10 } }
        ]
    },
    {
        id: 6,
        question: "Você possui um Playbook de Vendas documentado e atualizado?",
        options: [
            { text: "Não. O conhecimento está na cabeça das pessoas.", points: 0, dimensions: { revenue: 3, process: 0, data: 1, tech: 0 } },
            { text: "Temos algo antigo que ninguém lê.", points: 2, dimensions: { revenue: 4, process: 2, data: 2, tech: 1 } },
            { text: "Sim, é a bíblia da operação e usamos nos treinamentos.", points: 10, dimensions: { revenue: 9, process: 10, data: 7, tech: 5 } }
        ]
    },
    {
        id: 7,
        question: "Como você lida com Leads que não compram agora?",
        options: [
            { text: "São descartados/esquecidos ('Lixo').", points: 0, dimensions: { revenue: 1, process: 1, data: 0, tech: 0 } },
            { text: "Recebem e-mails marketing genéricos.", points: 4, dimensions: { revenue: 5, process: 4, data: 3, tech: 4 } },
            { text: "Entram em fluxos de nutrição segmentados e automáticos.", points: 10, dimensions: { revenue: 9, process: 8, data: 8, tech: 10 } }
        ]
    },
    {
        id: 8,
        question: "Seu site é um cartão de visitas ou uma máquina de vendas?",
        options: [
            { text: "Institucional. Só diz quem somos.", points: 2, dimensions: { revenue: 3, process: 2, data: 0, tech: 4 } },
            { text: "Bonito, mas converte pouco.", points: 5, dimensions: { revenue: 5, process: 4, data: 3, tech: 6 } },
            { text: "Otimizado para conversão, com tracking e copy persuasiva.", points: 10, dimensions: { revenue: 10, process: 7, data: 9, tech: 9 } }
        ]
    }
];

const GrowthScore = () => {
    const { toast } = useToast();
    const [currentQ, setCurrentQ] = useState(0);
    const [step, setStep] = useState<'start' | 'questions' | 'lead-capture' | 'results'>('start');

    // Lead Form State
    const [leadForm, setLeadForm] = useState({
        name: '',
        email: '',
        phone: '',
        company: '',
        role: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Scores State
    const [scores, setScores] = useState<Record<Dimension, number>>({
        revenue: 0, process: 0, data: 0, tech: 0
    });
    const [totalPoints, setTotalPoints] = useState(0);

    const handleAnswer = (option: Option) => {
        setScores(prev => ({
            revenue: prev.revenue + option.dimensions.revenue,
            process: prev.process + option.dimensions.process,
            data: prev.data + option.dimensions.data,
            tech: prev.tech + option.dimensions.tech
        }));
        setTotalPoints(prev => prev + option.points);

        if (currentQ < QUESTIONS.length - 1) {
            setTimeout(() => setCurrentQ(prev => prev + 1), 250);
        } else {
            setStep('lead-capture');
        }
    };

    const maxPossbilePoints = QUESTIONS.reduce((acc, q) => acc + Math.max(...q.options.map(o => o.points)), 0) || 100;
    const percentage = Math.round((totalPoints / maxPossbilePoints) * 100);

    const getDiagnosis = (pct: number) => {
        if (pct < 40) return { title: "Fase de Sobrevivência", color: "text-black", msg: "Sua operação depende demais de esforço manual." };
        if (pct < 70) return { title: "Fase de Tração Manual", color: "text-gray-500", msg: "Você cresce, mas com dores e falta de processo." };
        return { title: "Fase de Escala (Revenue Ops)", color: "text-revgreen", msg: "Sua base é sólida e pronta para escala." };
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

            const result = getDiagnosis(percentage);

            await submitPublicDiagnostic(
                { ...leadForm },
                { individual_scores: scores, total_points: totalPoints },
                percentage,
                {
                    level: result.title,
                    title: result.title,
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
                description: "Seu diagnóstico de growth foi processado."
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

    return (
        <PageLayout>
            {step === 'start' && (
                <Section variant="light" className="min-h-[100dvh] flex flex-col justify-center py-[5rem] relative overflow-hidden bg-white">
                    {/* Background Grid */}
                    <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] opacity-20 pointer-events-none" />

                    <div className="container-custom max-w-5xl mx-auto text-center relative z-10 w-full">
                        <div className="max-w-3xl mx-auto">
                            <div className="inline-flex items-center gap-2 px-3 py-1 bg-zinc-100 rounded-full mb-8">
                                <span className="w-2 h-2 rounded-full bg-black animate-pulse"></span>
                                <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-500">
                                    Diagnóstico de Growth
                                </span>
                            </div>

                            <h1 className="text-5xl md:text-7xl font-black mb-8 tracking-tighter text-black uppercase leading-[0.9]">
                                Growth<br /><span className="text-zinc-400">Strategy Score</span>
                            </h1>
                            <p className="text-xl text-zinc-500 mb-12 leading-relaxed max-w-2xl mx-auto">
                                Avalie a maturidade da sua escala e descubra pontos cegos na sua operação.
                            </p>

                            <Button onClick={() => setStep('questions')} className="w-full md:w-auto bg-black text-white px-12 h-16 rounded-none font-bold tracking-[0.2em] uppercase text-xs transition-all hover:scale-[1.02] active:scale-[0.98]">
                                Iniciar Diagnóstico <ArrowRight className="ml-2 w-4 h-4" />
                            </Button>
                        </div>
                    </div>
                </Section>
            )}

            {step === 'questions' && (
                <Section variant="light" className="min-h-[100dvh] bg-white flex flex-col justify-center">
                    <div className="container-custom max-w-4xl mx-auto">

                        {/* Surgical Minimalist Header */}
                        <div className="mb-20">
                            <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-6">
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2">
                                        <span className="w-1.5 h-1.5 bg-black rounded-full"></span>
                                        <span className="text-[10px] font-mono font-medium uppercase tracking-[0.2em] text-zinc-500">
                                            Live Simulation
                                        </span>
                                    </div>
                                    <h1 className="text-3xl md:text-5xl font-bold text-black uppercase tracking-tight leading-none">
                                        Growth<br />Strategy
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

                                <div className="grid grid-cols-1 gap-px bg-zinc-100 border border-zinc-100">
                                    {QUESTIONS[currentQ].options.map((opt, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => handleAnswer(opt)}
                                            className="group relative flex items-center p-6 md:p-8 text-left bg-white hover:bg-zinc-50 transition-colors duration-200 outline-none"
                                        >
                                            <div className="mr-8 w-6 h-6 flex items-center justify-center border border-zinc-200 text-[10px] font-mono text-zinc-400 group-hover:border-black group-hover:text-black transition-colors rounded-none shrink-0">
                                                {String.fromCharCode(65 + idx)}
                                            </div>

                                            <span className="text-base text-zinc-600 group-hover:text-black transition-colors leading-relaxed">
                                                {opt.text}
                                            </span>

                                            {/* Selection Indicator Line */}
                                            <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-black group-hover:w-full transition-all duration-300" />
                                        </button>
                                    ))}
                                </div>
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </Section>
            )}

            {step === 'lead-capture' && (
                <Section variant="light" className="min-h-[100dvh] bg-white flex flex-col justify-center">
                    <div className="container-custom max-w-md mx-auto">
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
                                    <Label className="text-[10px] font-bold text-black uppercase tracking-widest pl-1">Empresa</Label>
                                    <Input
                                        required
                                        className="bg-zinc-50 border-zinc-200 text-black h-14 focus:border-black focus:ring-0 rounded-none transition-all placeholder:text-zinc-300 font-medium"
                                        value={leadForm.company}
                                        onChange={e => setLeadForm({ ...leadForm, company: e.target.value })}
                                        placeholder="Nome da organização"
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
                                                <SelectItem value="diretor">Diretor</SelectItem>
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
                    </div>
                </Section>
            )}

            {step === 'results' && (
                <div className="min-h-screen bg-black text-white py-20 flex flex-col items-center">
                    <div className="container-custom max-w-4xl text-center">
                        <div className="relative w-64 h-64 mx-auto mb-10">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie data={[{ value: percentage }, { value: Math.max(0, 100 - percentage) }]} cx="50%" cy="50%" innerRadius="85%" outerRadius="100%" startAngle={90} endAngle={-270} dataKey="value" stroke="none">
                                        <Cell fill="#03FC3B" /><Cell fill="#222" />
                                    </Pie>
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                                <div className="text-7xl font-bold">{percentage}</div>
                                <div className="text-[10px] uppercase font-mono-tech text-gray-400">Pontos</div>
                            </div>
                        </div>
                        <h2 className="text-5xl font-bold mb-6 uppercase tracking-tighter">{getDiagnosis(percentage).title}</h2>
                        <p className="text-xl text-gray-400 mb-12 max-w-2xl mx-auto leading-relaxed">{getDiagnosis(percentage).msg}</p>
                        <Button className="bg-revgreen text-black px-10 h-16 rounded-xl font-bold uppercase text-xs shadow-[0_0_30px_rgba(34,197,94,0.2)]" onClick={() => window.open('https://api.whatsapp.com/send?phone=5511999999999&text=Growth Score', '_blank')}>Agendar Auditoria <ArrowRight className="ml-2 w-4 h-4" /></Button>
                    </div>
                </div>
            )}
        </PageLayout>
    );
};

export default GrowthScore;
