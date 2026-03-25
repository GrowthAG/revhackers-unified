import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Share2, Download, AlertTriangle, TrendingUp, Rocket, CheckCircle2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import PageLayout from '@/components/layout/PageLayout';
import Section from '@/components/ui/Section';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export default function PublicDiagnosticResult() {
    const { id } = useParams();
    const [result, setResult] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadResult = async () => {
            if (!id) return;

            try {
                const { data, error } = await supabase
                    .from('rei_responses')
                    .select('*, project:rei_projects(*)')
                    .eq('id', id)
                    .single();

                if (error) throw error;

                const project = data.project as any;
                const responses = data.responses as any;
                const details = responses?.result_details || {};

                setResult({
                    id: data.id,
                    created_at: data.created_at,
                    empresa: project?.client_name || 'Empresa',
                    tipo_diagnostico: responses?.diagnostic_type || data.source || 'Diagnóstico',
                    score: data.total_score,
                    nivel_maturidade: data.maturity_level,
                    detalhes_resultado: details,
                    respostas: responses
                });
            } catch (error) {
                console.error('Erro ao carregar resultado:', error);
            } finally {
                setLoading(false);
            }
        };

        loadResult();
    }, [id]);

    if (loading) {
        return (
            <PageLayout>
                <Section className="min-h-screen bg-zinc-50 flex items-center justify-center">
                    <div className="flex flex-col items-center gap-4">
                        <div className="w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                        <div className="text-zinc-500 text-xs font-mono animate-pulse uppercase tracking-widest">
                            Calculando Score...
                        </div>
                    </div>
                </Section>
            </PageLayout>
        );
    }

    if (!result) {
        return (
            <PageLayout>
                <Section className="min-h-screen bg-zinc-50 flex items-center justify-center">
                    <div className="text-center">
                        <h2 className="text-xl font-black text-black mb-4">Relatório não encontrado</h2>
                        <Link to="/" className="text-revgreen hover:underline text-sm font-bold uppercase tracking-wide">
                            Voltar para a Home
                        </Link>
                    </div>
                </Section>
            </PageLayout>
        );
    }

    // Logic for Dynamic CTA & Content
    const score = result.score;
    let ctaText = "Falar com Especialista";
    let ctaIcon = <Rocket className="w-5 h-5 ml-2" />;

    if (score < 40) {
        ctaText = `Solicitar Correção De ${result.tipo_diagnostico?.split(' ').pop() || 'Processo'}`;
        ctaIcon = <AlertTriangle className="w-5 h-5 ml-2" />;
    } else if (score < 70) {
        ctaText = "Acelerar Otimização Agora";
        ctaIcon = <TrendingUp className="w-5 h-5 ml-2" />;
    } else {
        ctaText = "Escalar Estrutura de Vendas";
        ctaIcon = <Rocket className="w-5 h-5 ml-2" />;
    }

    const details = result.detalhes_resultado || {};
    // Fallback description if missing
    const description = details.description || "Análise completa da operação de receita baseada nas respostas fornecidas.";

    return (
        <PageLayout>
            <Section className="min-h-screen pt-32 pb-20 bg-zinc-50">
                <div className="container-custom max-w-6xl mx-auto">

                    {/* Top Actions */}
                    <div className="mb-12 flex items-center justify-between">
                        <Link to="/" className="inline-flex items-center text-xs font-bold text-zinc-400 hover:text-black transition-colors uppercase tracking-widest">
                            <ArrowLeft className="w-3 h-3 mr-2" /> Voltar
                        </Link>
                        <div className="text-[10px] font-mono font-bold text-zinc-300 uppercase tracking-[0.3em]">
                            Resultado da Análise
                        </div>
                        <div className="flex gap-4">
                            <button className="text-zinc-400 hover:text-black transition-colors">
                                <Share2 className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                        {/* SCORE CARD (Left) */}
                        <Card className="lg:col-span-5 bg-zinc-950 text-white border border-zinc-900 rounded-2xl p-10 flex flex-col items-center justify-center relative shadow-sm overflow-hidden min-h-[400px]">
                            {/* Top accent line */}
                            <div className="absolute top-0 left-0 w-full h-[2px] bg-[#00CC6A]" />

                            <div className="relative z-10 text-center">
                                {/* Circular Progress Mockup */}
                                <div className="w-48 h-48 rounded-full border-[6px] border-zinc-800 flex items-center justify-center mb-8 relative">
                                    <div
                                        className="absolute inset-0 rounded-full border-[6px] border-revgreen border-l-transparent border-b-transparent rotate-45"
                                        style={{ transform: `rotate(${Math.max(45, (score * 3.6) - 45)}deg)` }} // Very simplistic rotation logic for visual
                                    />
                                    <div className="flex flex-col items-center">
                                        <span className="text-7xl font-black text-white tracking-tighter leading-none">{score}</span>
                                        <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest mt-2">Pontos</span>
                                    </div>
                                </div>

                                <div className="inline-block px-4 py-1.5 bg-zinc-900 rounded text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400 border border-zinc-800">
                                    Nível de Maturidade
                                </div>
                                <h3 className="text-2xl font-black text-revgreen uppercase tracking-tight mt-4 max-w-xs mx-auto">
                                    {result.nivel_maturidade}
                                </h3>
                            </div>
                        </Card>

                        {/* CONTEXT CARD (Right) */}
                        <Card className="lg:col-span-7 bg-zinc-950 text-white border border-zinc-900 rounded-2xl p-10 flex flex-col justify-between shadow-sm relative overflow-hidden min-h-[400px]">

                            <div className="relative z-10">
                                <div className="flex items-center gap-3 mb-6">
                                    <span className="text-[10px] font-bold text-revgreen uppercase tracking-[0.25em]">
                                        Relatório Executivo
                                    </span>
                                    <div className="h-px bg-zinc-800 flex-1" />
                                    <span className="text-[10px] font-mono text-zinc-600">
                                        {new Date(result.created_at).toLocaleDateString('pt-BR')}
                                    </span>
                                </div>

                                <h2 className="text-3xl md:text-5xl font-black text-white mb-6 uppercase leading-[0.9] tracking-tighter">
                                    {details.title || result.nivel_maturidade}
                                </h2>

                                <p className="text-zinc-300 text-lg leading-relaxed mb-8 border-l-2 border-revgreen pl-6">
                                    {description}
                                </p>

                                <div className="bg-zinc-900/50 p-6 rounded-lg border border-zinc-800">
                                    <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                                        <CheckCircle2 className="w-3 h-3 text-revgreen" /> Ação Recomendada
                                    </h4>
                                    <p className="text-white font-medium">
                                        {details.action}
                                    </p>
                                </div>
                            </div>

                            <div className="mt-8 relative z-10">
                                <Button
                                    className="w-full h-16 bg-zinc-900 hover:bg-zinc-800 text-white text-sm md:text-base font-black uppercase tracking-widest rounded-xl border border-zinc-800 transition-all"
                                    onClick={() => window.open(`https://api.whatsapp.com/send?phone=5511999999999&text=Olá, fiz o diagnóstico da ${result.empresa} e meu score foi ${score}. Gostaria de entender o plano de ação: ${ctaText}`, '_blank')}
                                >
                                    {ctaText} {ctaIcon}
                                </Button>
                                <p className="text-center text-[10px] text-zinc-500 uppercase tracking-widest mt-4">
                                    Falar diretamente com Consultor Sênior
                                </p>
                            </div>
                        </Card>
                    </div>

                    {/* Footer Metrics (Mockup for Visual Balance) */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                        <Card className="bg-black border border-zinc-800 p-4 rounded-lg flex items-center justify-between">
                            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Processo</span>
                            <span className="text-xs font-bold text-revgreen">ANÁLISE OK</span>
                        </Card>
                        <Card className="bg-black border border-zinc-800 p-4 rounded-lg flex items-center justify-between">
                            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Dados</span>
                            <span className={score > 50 ? "text-xs font-bold text-revgreen" : "text-xs font-bold text-zinc-400"}>
                                {score > 50 ? 'CONFIÁVEL' : 'ATENÇÃO'}
                            </span>
                        </Card>
                        <Card className="bg-black border border-zinc-800 p-4 rounded-lg flex items-center justify-between">
                            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Tech</span>
                            <span className="text-xs font-bold text-zinc-300">-----</span>
                        </Card>
                        <Card className="bg-black border border-zinc-800 p-4 rounded-lg flex items-center justify-between">
                            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Pessoas</span>
                            <span className="text-xs font-bold text-revgreen">ATIVO</span>
                        </Card>
                    </div>

                </div>
            </Section>
        </PageLayout>
    );
}
