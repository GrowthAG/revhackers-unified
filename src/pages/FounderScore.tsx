import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    ArrowRight, Star, Linkedin, Users, Trophy, Target,
    Briefcase, Calendar, MapPin, Award, ArrowUpRight, Check
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import PageLayout from '@/components/layout/PageLayout';
import Section from '@/components/ui/Section';

const FounderScore = () => {
    const { toast } = useToast();
    const [step, setStep] = useState<'input' | 'analyzing' | 'results'>('input');
    const [linkedinUrl, setLinkedinUrl] = useState('');
    const [analysisProgress, setAnalysisProgress] = useState(0);

    // Mock Data State
    const [mockProfile, setMockProfile] = useState<any>(null);

    const handleStartAnalysis = (e: React.FormEvent) => {
        e.preventDefault();

        const cleanUrl = linkedinUrl.trim().toLowerCase();
        if (!cleanUrl.includes('linkedin.com')) {
            toast({
                variant: "destructive",
                title: "URL Inválida",
                description: "Cole o link completo do perfil (ex: linkedin.com/in/seu-nome)."
            });
            return;
        }

        setStep('analyzing');

        // Simulate Proxycurl API Latency
        let progress = 0;
        const interval = setInterval(() => {
            progress += Math.floor(Math.random() * 15);
            if (progress > 100) progress = 100;
            setAnalysisProgress(progress);

            if (progress >= 100) {
                clearInterval(interval);
                setTimeout(() => {
                    generateMockProfile();
                    setStep('results');
                }, 800);
            }
        }, 300);
    };

    const generateMockProfile = () => {
        // In a real scenario, this would come from the API
        setMockProfile({
            name: "Founder Exemplo",
            role: "CEO & Founder",
            company: "Tech Company",
            location: "São Paulo, Brasil",
            followers: 12450,
            connections: 500,
            experience: 12, // years
            score: 78,
            topSkills: ["Liderança", "Growth Hacking", "Estratégia"],
            recentActivity: "High"
        });
    };

    return (
        <PageLayout>
            {/* STEP 1: INPUT */}
            {step === 'input' && (
                <Section variant="light" className="min-h-[100dvh] flex flex-col justify-center bg-white">
                    <div className="container-custom max-w-4xl mx-auto text-center">
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-zinc-100 rounded-full mb-8">
                            <Linkedin className="w-4 h-4 text-[#0077b5]" />
                            <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">
                                LinkedIn Profile Analytics
                            </span>
                        </div>

                        <h1 className="text-5xl md:text-7xl font-black mb-8 tracking-tighter text-black uppercase leading-[0.9]">
                            Founder<br /><span className="text-zinc-400">Authority Score</span>
                        </h1>
                        <p className="text-xl text-zinc-500 mb-12 leading-relaxed max-w-xl mx-auto">
                            Analise a força da sua marca pessoal usando inteligência de dados do seu LinkedIn.
                        </p>

                        <form onSubmit={handleStartAnalysis} className="max-w-xl mx-auto relative group">
                            <div className="flex shadow-2xl shadow-zinc-200">
                                <div className="bg-zinc-100 flex items-center px-4 border-y border-l border-zinc-200">
                                    <Linkedin className="w-5 h-5 text-zinc-400" />
                                </div>
                                <Input
                                    placeholder="linkedin.com/in/seu-perfil"
                                    className="bg-white border-zinc-200 text-black h-16 rounded-none focus:border-black text-lg transition-all focus:ring-0 placeholder:text-zinc-300 font-medium border-l-0"
                                    value={linkedinUrl}
                                    onChange={(e) => setLinkedinUrl(e.target.value)}
                                    required
                                />
                                <Button type="submit" className="bg-black text-white px-8 h-16 rounded-none font-bold uppercase tracking-widest text-xs hover:bg-zinc-800 transition-all">
                                    Analisar
                                </Button>
                            </div>
                            <p className="text-[10px] text-zinc-400 mt-4 font-mono uppercase tracking-wider">
                                *Usamos dados públicos via API de Enriquecimento
                            </p>
                        </form>
                    </div>
                </Section>
            )}

            {/* STEP 2: ANALYZING SIMULATION */}
            {step === 'analyzing' && (
                <Section variant="light" className="min-h-[100dvh] flex flex-col justify-center bg-white">
                    <div className="container-custom max-w-md mx-auto text-center">
                        <div className="mb-8 relative w-24 h-24 mx-auto">
                            <svg className="animate-spin w-full h-full text-zinc-200" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            <div className="absolute inset-0 flex items-center justify-center font-mono font-bold text-xs">
                                {analysisProgress}%
                            </div>
                        </div>
                        <h2 className="text-xl font-bold text-black mb-2 animate-pulse">
                            Extraindo dados do perfil...
                        </h2>
                        <p className="text-sm text-zinc-400 font-mono">
                            Verificando histórico, conexões e autoridade.
                        </p>
                    </div>
                </Section>
            )}

            {/* STEP 3: DASHBOARD RESULTS (SURGICAL V2) */}
            {step === 'results' && mockProfile && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="w-full max-w-7xl mx-auto py-12 px-4 md:px-8"
                >
                    {/* HEADER */}
                    <div className="flex flex-col md:flex-row items-center justify-between mb-12 border-b border-zinc-200 pb-8">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <div className="text-[#0077b5]">
                                    <Linkedin className="w-5 h-5" />
                                </div>
                                <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">
                                    Perfil Integrado
                                </span>
                            </div>
                            <h2 className="text-3xl font-bold text-black tracking-tight mb-2">
                                {mockProfile.name}
                            </h2>
                            <p className="text-sm text-zinc-500 font-mono flex items-center gap-2">
                                {mockProfile.role} <span className="text-zinc-300">|</span> {mockProfile.location}
                            </p>
                        </div>
                        <div className="mt-6 md:mt-0 flex gap-4">
                            <Button
                                onClick={() => window.open(linkedinUrl, '_blank')}
                                variant="outline"
                                className="border-zinc-200 hover:bg-zinc-50 h-12 px-6 rounded-full text-xs font-bold uppercase tracking-widest"
                            >
                                Ver Perfil <ArrowUpRight className="ml-2 w-3 h-3" />
                            </Button>
                            <Button
                                className="bg-black text-white hover:bg-zinc-800 h-12 px-8 rounded-full text-xs font-bold uppercase tracking-widest shadow-lg"
                            >
                                Plano de Autoridade
                            </Button>
                        </div>
                    </div>

                    {/* DASHBOARD GRID */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                        {/* SCORE CARD */}
                        <div className="lg:col-span-4">
                            <div className="bg-white border border-zinc-200 p-8 h-full rounded-2xl shadow-sm relative overflow-hidden flex flex-col justify-center items-center text-center">
                                <span className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-6">Founder Authority Score</span>

                                <div className="relative mb-8">
                                    <div className="text-9xl font-black tracking-tighter text-black leading-none">
                                        {mockProfile.score}
                                    </div>
                                    <div className="absolute -right-4 -top-2 bg-[#0077b5] text-white text-[10px] font-bold px-2 py-1 rounded-full">
                                        TOP 15%
                                    </div>
                                </div>

                                <div className="w-full bg-zinc-100 h-2 rounded-full overflow-hidden mb-4">
                                    <div className="bg-[#0077b5] h-full rounded-full" style={{ width: `${mockProfile.score}%` }}></div>
                                </div>

                                <p className="text-sm text-zinc-500 leading-relaxed max-w-xs">
                                    Sua autoridade digital é <strong className="text-black">Alta</strong>. Você está posicionado como uma referência no setor de tecnologia.
                                </p>
                            </div>
                        </div>

                        {/* METRICS GRID */}
                        <div className="lg:col-span-8 flex flex-col gap-8">

                            {/* Key Stats */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="bg-zinc-50 border border-zinc-200 p-6 rounded-xl">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Users className="w-4 h-4 text-zinc-400" />
                                        <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Seguidores</span>
                                    </div>
                                    <div className="text-3xl font-bold text-black">{mockProfile.followers.toLocaleString()}</div>
                                </div>
                                <div className="bg-zinc-50 border border-zinc-200 p-6 rounded-xl">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Calendar className="w-4 h-4 text-zinc-400" />
                                        <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Experiência</span>
                                    </div>
                                    <div className="text-3xl font-bold text-black">{mockProfile.experience} Anos</div>
                                </div>
                                <div className="bg-zinc-50 border border-zinc-200 p-6 rounded-xl">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Trophy className="w-4 h-4 text-zinc-400" />
                                        <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Skills Top</span>
                                    </div>
                                    <div className="flex flex-wrap gap-1 mt-1">
                                        {mockProfile.topSkills.map((s: string) => (
                                            <span key={s} className="bg-white border border-zinc-200 px-2 py-1 rounded text-[10px] font-bold text-zinc-600">
                                                {s}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Detailed Analysis */}
                            <div className="bg-white border border-zinc-200 rounded-2xl p-8 shadow-sm flex-1">
                                <h3 className="text-sm font-bold text-black uppercase tracking-wide mb-6 flex items-center gap-2">
                                    <Target className="w-4 h-4" />
                                    Análise de Posicionamento
                                </h3>

                                <div className="space-y-6">
                                    <div className="flex gap-4 items-start">
                                        <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center shrink-0 mt-1">
                                            <Check className="w-4 h-4 text-green-600" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-sm text-black">Headline Otimizada</h4>
                                            <p className="text-xs text-zinc-500 mt-1">
                                                Sua headline "{mockProfile.role}" contém as palavras-chave corretas para seu nicho.
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex gap-4 items-start">
                                        <div className="w-8 h-8 rounded-full bg-yellow-100 flex items-center justify-center shrink-0 mt-1">
                                            <ArrowUpRight className="w-4 h-4 text-yellow-600" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-sm text-black">Oportunidade de Conteúdo</h4>
                                            <p className="text-xs text-zinc-500 mt-1">
                                                Sua frequência de postagem pode melhorar. Founders Top 1% postam 3x por semana.
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex gap-4 items-start">
                                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center shrink-0 mt-1">
                                            <Award className="w-4 h-4 text-blue-600" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-sm text-black">Social Proof Elevada</h4>
                                            <p className="text-xs text-zinc-500 mt-1">
                                                Com {mockProfile.followers.toLocaleString()} seguidores, você já tem a base para lançar comunidades ou produtos High Ticket.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>
                </motion.div>
            )}
        </PageLayout>
    );
};

export default FounderScore;
