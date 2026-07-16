
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { diagnosticQuestions, calculateMaturityLevel, QuizOption } from '@/data/diagnosticQuestions';
import { ArrowRight, Check, RefreshCcw, Trophy, Loader2, ArrowLeft, Target, Rocket } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

interface DiagnosticWizardProps {
    onComplete?: () => void;
}

const DiagnosticWizard = ({ onComplete }: DiagnosticWizardProps) => {
    const [currentStep, setCurrentStep] = useState(0);
    const [answers, setAnswers] = useState<Record<string, QuizOption>>({});
    const [showLeadForm, setShowLeadForm] = useState(false);
    const [showResult, setShowResult] = useState(false);
    const [leadData, setLeadData] = useState({ name: '', email: '', company: '' });
    const { toast } = useToast();
    const navigate = useNavigate();

    const currentQuestion = diagnosticQuestions[currentStep];
    const totalSteps = diagnosticQuestions.length;
    const progress = ((currentStep + 1) / totalSteps) * 100;

    const handleOptionSelect = (option: QuizOption) => {
        setAnswers(prev => ({ ...prev, [currentQuestion.id]: option }));

        if (currentStep < totalSteps - 1) {
            setTimeout(() => setCurrentStep(prev => prev + 1), 300);
        } else {
            setShowLeadForm(true);
        }
    };

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [resultId, setResultId] = useState<string | null>(null);

    const handleLeadSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        const totalScore = calculateScore();
        const result = calculateMaturityLevel(totalScore);

        try {
            const { response } = await import('@/api/publicDiagnostic').then(m =>
                m.submitPublicDiagnostic(leadData, answers, totalScore, result)
            );

            setResultId(response.id);
            toast({
                title: "DIAGNÓSTICO PROCESSADO",
                description: "Seu relatório de inteligência foi gerado.",
                className: "bg-black text-white border-zinc-800"
            });

            setShowLeadForm(false);
            setShowResult(true);
            if (onComplete) onComplete();
        } catch (error) {
            console.error('Submission error:', error);
            toast({
                title: "ERRO DE PROCESSAMENTO",
                description: "Não foi possível conectar ao servidor de dados.",
                variant: "destructive"
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const restartQuiz = () => {
        setCurrentStep(0);
        setAnswers({});
        setShowLeadForm(false);
        setShowResult(false);
        setResultId(null);
    };

    const calculateScore = () => {
        return Object.values(answers).reduce((acc, curr) => acc + curr.score, 0);
    };

    // --- RENDER RESULTS ---
    if (showResult) {
        const totalScore = calculateScore();
        const result = calculateMaturityLevel(totalScore);

        return (
            <Card className="bg-black border border-zinc-800 p-8 md:p-12 text-center animate-in fade-in zoom-in-95 duration-500 rounded-xl shadow-2xl relative overflow-hidden max-w-2xl mx-auto">
                {/* Background FX */}
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-revgreen to-transparent" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-zinc-900/40 via-transparent to-transparent pointer-events-none" />

                <div className="relative z-10">
                    <div className="w-24 h-24 bg-zinc-900 border border-zinc-800 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner">
                        <Trophy className="h-10 w-10 text-revgreen" />
                    </div>

                    <h2 className="text-sm font-bold text-zinc-500 uppercase tracking-[0.2em] mb-4">Resultado da Análise</h2>
                    <h3 className={`text-4xl md:text-5xl font-black ${result.color} mb-6 tracking-tighter uppercase leading-none`}>
                        {result.level}
                    </h3>

                    <p className="text-zinc-400 text-lg mb-10 max-w-lg mx-auto leading-relaxed border-l-2 border-zinc-800 pl-4">
                        {result.description}
                    </p>

                    <div className="bg-zinc-900/50 border border-zinc-800 p-6 mb-10 rounded-lg text-left">
                        <h4 className="flex items-center gap-2 text-revgreen font-bold mb-3 uppercase text-xs tracking-widest">
                            <Target className="w-4 h-4" /> Recomendação Tática
                        </h4>
                        <p className="text-white font-medium leading-relaxed">{result.action}</p>
                    </div>

                    <div className="grid gap-4">
                        <Button
                            onClick={() => navigate('/agenda-diagnostico')}
                            className="w-full bg-revgreen text-black hover:bg-revgreen/90 font-black h-16 uppercase tracking-widest text-xs rounded shadow-[0_0_20px_rgba(35,255,50,0.2)] transition-all transform hover:-translate-y-1"
                        >
                            Agendar Sessão Estratégica <ArrowRight className="ml-2 w-4 h-4" />
                        </Button>

                        {resultId && (
                            <Button
                                variant="ghost"
                                onClick={() => {
                                    const url = `${window.location.origin}/diagnostico/resultado/${resultId}`;
                                    window.open(url, '_blank');
                                }}
                                className="w-full text-zinc-500 hover:text-white hover:bg-zinc-900 font-bold uppercase tracking-widest text-[10px] h-12"
                            >
                                <Rocket className="mr-2 h-3 w-3" /> Ver Relatório Completo
                            </Button>
                        )}

                        <Button
                            variant="link"
                            onClick={restartQuiz}
                            className="text-zinc-600 hover:text-zinc-400 text-[10px] uppercase tracking-widest"
                        >
                            <RefreshCcw className="mr-2 h-3 w-3" /> Refazer Análise
                        </Button>
                    </div>
                </div>
            </Card>
        );
    }

    // --- RENDER LEAD FORM ---
    if (showLeadForm) {
        return (
            <Card className="bg-black border border-zinc-800 p-8 md:p-12 animate-in slide-in-from-right-8 duration-500 rounded-xl shadow-2xl max-w-xl mx-auto relative overflow-hidden">
                <div className="absolute top-0 right-0 p-6 opacity-5">
                    <Rocket className="w-32 h-32 text-white" />
                </div>

                <div className="relative z-10">
                    <div className="mb-10 border-b border-zinc-800 pb-6">
                        <h3 className="text-2xl font-black text-white mb-2 uppercase tracking-tighter">Analise Concluída</h3>
                        <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest">
                            Para gerar seu relatório detalhado, identifique-se abaixo.
                        </p>
                    </div>

                    <form onSubmit={handleLeadSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="name" className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Nome Completo</Label>
                            <Input
                                id="name"
                                required
                                placeholder="Seu nome"
                                value={leadData.name}
                                onChange={e => setLeadData(prev => ({ ...prev, name: e.target.value }))}
                                className="bg-zinc-900 border-zinc-800 text-white h-14 focus:border-revgreen focus:ring-0 rounded-lg transition-all placeholder:text-zinc-700 text-lg"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Email Corporativo</Label>
                            <Input
                                id="email"
                                type="email"
                                required
                                placeholder="voce@empresa.com"
                                value={leadData.email}
                                onChange={e => setLeadData(prev => ({ ...prev, email: e.target.value }))}
                                className="bg-zinc-900 border-zinc-800 text-white h-14 focus:border-revgreen focus:ring-0 rounded-lg transition-all placeholder:text-zinc-700 text-lg"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="company" className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Empresa</Label>
                            <Input
                                id="company"
                                required
                                placeholder="Nome da sua empresa"
                                value={leadData.company}
                                onChange={e => setLeadData(prev => ({ ...prev, company: e.target.value }))}
                                className="bg-zinc-900 border-zinc-800 text-white h-14 focus:border-revgreen focus:ring-0 rounded-lg transition-all placeholder:text-zinc-700 text-lg"
                            />
                        </div>

                        <Button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full bg-white hover:bg-revgreen text-black font-black h-16 uppercase tracking-widest text-xs rounded shadow-lg transition-all mt-4 transform hover:-translate-y-1"
                        >
                            {isSubmitting ? (
                                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Gerando Relatório...</>
                            ) : (
                                <>Acessar Resultado <ArrowRight className="ml-2 h-4 w-4" /></>
                            )}
                        </Button>

                        <p className="text-[10px] text-zinc-600 text-center uppercase tracking-wider">
                            🔒  Seus dados estão seguros e não serão compartilhados.
                        </p>
                    </form>
                </div>
            </Card>
        );
    }

    // --- RENDER QUESTIONS ---
    return (
        <div className="w-full max-w-3xl mx-auto">
            {/* Progress Header */}
            <div className="mb-8 flex items-end justify-between">
                <div>
                    <span className="text-[10px] font-bold text-revgreen uppercase tracking-widest bg-revgreen/10 px-2 py-1 rounded">
                        Etapa 0{currentStep + 1}
                    </span>
                </div>
                <div className="flex flex-col items-end">
                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1">
                        Progresso
                    </span>
                    <div className="w-32 h-1 bg-zinc-200 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-black transition-all duration-500 ease-out"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                </div>
            </div>

            {/* Question Card */}
            <Card className="bg-black text-white p-8 md:p-12 shadow-2xl border border-zinc-800 rounded-xl min-h-[450px] flex flex-col justify-center animate-in slide-in-from-bottom-4 relative overflow-hidden group">
                {/* Decorative Grid */}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />

                <div className="relative z-10">
                    <div className="mb-8">
                        <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em] mb-2 block">
                            {currentQuestion.category}
                        </span>
                        <h3 className="text-2xl md:text-4xl font-black text-white leading-tight tracking-tight">
                            {currentQuestion.text}
                        </h3>
                    </div>

                    <div className="grid gap-3">
                        {currentQuestion.options.map((option, idx) => (
                            <button
                                key={option.id}
                                onClick={() => handleOptionSelect(option)}
                                className="group flex items-center p-5 text-left border border-zinc-800 bg-zinc-900/50 hover:bg-revgreen hover:border-revgreen hover:text-black transition-all duration-300 rounded-lg"
                            >
                                <span className="mr-5 w-8 h-8 flex items-center justify-center border border-zinc-700 bg-black text-zinc-400 text-xs font-mono font-bold rounded group-hover:bg-black group-hover:text-revgreen group-hover:border-black transition-all">
                                    {String.fromCharCode(65 + idx)}
                                </span>
                                <span className="text-base md:text-lg text-zinc-300 font-medium group-hover:text-black transition-colors">
                                    {option.label}
                                </span>
                            </button>
                        ))}
                    </div>

                    {currentStep > 0 && (
                        <div className="mt-8 pt-6 border-t border-zinc-900 flex justify-start">
                            <button
                                onClick={() => setCurrentStep(prev => prev - 1)}
                                className="flex items-center text-[10px] uppercase tracking-widest font-bold text-zinc-600 hover:text-white transition-colors"
                            >
                                <ArrowLeft className="mr-2 w-3 h-3" /> Voltar
                            </button>
                        </div>
                    )}
                </div>
            </Card>
        </div>
    );
};

export default DiagnosticWizard;
