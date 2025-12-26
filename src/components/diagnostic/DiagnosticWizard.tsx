
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { diagnosticQuestions, calculateMaturityLevel, QuizOption } from '@/data/diagnosticQuestions';
import { ArrowRight, Check, RefreshCcw, Trophy } from 'lucide-react';
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

    const handleLeadSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Here you would send data to your CRM/Webhook
        console.log('Quiz Completed:', { answers, leadData });

        toast({
            title: "Diagnóstico Concluído!",
            description: "Gerando seu relatório personalizado...",
        });

        setShowLeadForm(false);
        setShowResult(true);
        if (onComplete) onComplete();
    };

    const calculateScore = () => {
        return Object.values(answers).reduce((acc, curr) => acc + curr.score, 0);
    };

    const restartQuiz = () => {
        setCurrentStep(0);
        setAnswers({});
        setShowLeadForm(false);
        setShowResult(false);
    };

    if (showResult) {
        const totalScore = calculateScore();
        const result = calculateMaturityLevel(totalScore);

        return (
            <Card className="bg-black border border-white/20 p-8 md:p-12 text-center animate-fade-in-up">
                <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Trophy className="h-10 w-10 text-revgreen" />
                </div>

                <h2 className="text-3xl font-bold text-white mb-2">Seu Nível de Maturidade</h2>
                <div className={`text-4xl md:text-5xl font-bold ${result.color} mb-6 tracking-tight`}>
                    {result.level}
                </div>

                <p className="text-gray-400 text-lg mb-8 max-w-xl mx-auto">
                    {result.description}
                </p>

                <div className="bg-white/5 border border-white/10 rounded-xl p-6 mb-8">
                    <h4 className="text-white font-medium mb-2 uppercase text-xs tracking-widest">Recomendação Prioritária</h4>
                    <p className="text-xl text-revgreen font-bold">{result.action}</p>
                </div>

                <div className="flex flex-col md:flex-row gap-4 justify-center">
                    <Button
                        onClick={() => navigate('/agenda-diagnostico')}
                        className="bg-revgreen text-black hover:bg-white font-bold h-12 px-8 uppercase tracking-wide text-xs"
                    >
                        Agendar Sessão Estratégica
                    </Button>
                    <Button
                        variant="outline"
                        onClick={restartQuiz}
                        className="border-white/20 text-white hover:bg-white/10 h-12 px-8 uppercase tracking-wide text-xs"
                    >
                        <RefreshCcw className="mr-2 h-4 w-4" /> Refazer Teste
                    </Button>
                </div>
            </Card>
        );
    }

    if (showLeadForm) {
        return (
            <Card className="bg-white p-8 md:p-12 animate-fade-in border-t-4 border-revgreen shadow-2xl">
                <div className="text-center mb-8">
                    <h3 className="text-2xl font-bold text-black mb-2">Quase lá!</h3>
                    <p className="text-gray-600">
                        Preencha seus dados para desbloquear seu SCORE e receber o plano de ação.
                    </p>
                </div>

                <form onSubmit={handleLeadSubmit} className="space-y-4 max-w-md mx-auto">
                    <div className="space-y-2">
                        <Label htmlFor="name" className="text-black">Nome Completo</Label>
                        <Input
                            id="name"
                            required
                            placeholder="Ex: João Silva"
                            value={leadData.name}
                            onChange={e => setLeadData(prev => ({ ...prev, name: e.target.value }))}
                            className="bg-gray-50 border-gray-200 focus:border-revgreen text-black"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="email" className="text-black">Email Corporativo</Label>
                        <Input
                            id="email"
                            type="email"
                            required
                            placeholder="joao@empresa.com"
                            value={leadData.email}
                            onChange={e => setLeadData(prev => ({ ...prev, email: e.target.value }))}
                            className="bg-gray-50 border-gray-200 focus:border-revgreen text-black"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="company" className="text-black">Nome da Empresa</Label>
                        <Input
                            id="company"
                            required
                            placeholder="Ex: Minha Empresa Ltda"
                            value={leadData.company}
                            onChange={e => setLeadData(prev => ({ ...prev, company: e.target.value }))}
                            className="bg-gray-50 border-gray-200 focus:border-revgreen text-black"
                        />
                    </div>

                    <Button type="submit" className="w-full bg-revgreen text-black font-bold h-12 uppercase tracking-wide hover:bg-black hover:text-white transition-all mt-4">
                        Ver Meu Resultado <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                </form>
            </Card>
        );
    }

    return (
        <div className="w-full max-w-3xl mx-auto">
            {/* Progress Bar */}
            <div className="mb-8">
                <div className="flex justify-between text-xs uppercase tracking-widest text-gray-500 mb-2 font-mono-tech">
                    <span>Passo {currentStep + 1} de {totalSteps}</span>
                    <span>{Math.round(progress)}%</span>
                </div>
                <div className="h-1 w-full bg-gray-200 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-revgreen transition-all duration-500 ease-out"
                        style={{ width: `${progress}%` }}
                    />
                </div>
            </div>

            {/* Question Card */}
            <Card className="bg-white p-8 md:p-10 shadow-xl border border-gray-100 min-h-[400px] flex flex-col justify-center animate-fade-in relative overflow-hidden">
                {/* Category Tag */}
                <div className="absolute top-6 right-6">
                    <span className="text-[10px] uppercase tracking-widest font-bold text-gray-300 border border-gray-100 px-2 py-1 rounded-sm">
                        {currentQuestion.category}
                    </span>
                </div>

                <h3 className="text-2xl md:text-3xl font-bold text-black mb-8 leading-tight">
                    {currentQuestion.text}
                </h3>

                <div className="grid gap-3">
                    {currentQuestion.options.map((option) => (
                        <button
                            key={option.id}
                            onClick={() => handleOptionSelect(option)}
                            className="group flex items-center p-4 text-left border rounded-lg hover:border-revgreen hover:bg-revgreen/5 transition-all duration-200"
                        >
                            <div className="h-6 w-6 rounded-full border-2 border-gray-300 group-hover:border-revgreen mr-4 flex items-center justify-center flex-shrink-0">
                                <div className="h-2.5 w-2.5 rounded-full bg-revgreen opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                            <span className="text-gray-700 font-medium group-hover:text-black">
                                {option.label}
                            </span>
                        </button>
                    ))}
                </div>

                {currentStep > 0 && (
                    <button
                        onClick={() => setCurrentStep(prev => prev - 1)}
                        className="mt-8 text-xs text-gray-400 hover:text-gray-600 underline text-center"
                    >
                        Voltar para pergunta anterior
                    </button>
                )}
            </Card>
        </div>
    );
};

export default DiagnosticWizard;
