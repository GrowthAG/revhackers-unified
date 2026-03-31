import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { reiSections, getInitialFormData, REIFormData, REIField } from '@/data/reiFormData';
import { ArrowRight, ArrowLeft, Check, Trophy, Target, CheckCircle2, TrendingUp, Award } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { calculateREIScore } from '@/lib/reiScoring';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

interface REIWizardProps {
    onComplete?: () => void;
}

const REIWizard = ({ onComplete }: REIWizardProps) => {
    const [stage, setStage] = useState<'welcome' | 'intro' | 'sections' | 'complete'>('welcome');
    const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
    const [formData, setFormData] = useState<REIFormData>(getInitialFormData());
    const { toast } = useToast();
    const navigate = useNavigate();

    const currentSection = reiSections[currentSectionIndex];
    const totalSections = reiSections.length;
    const progress = ((currentSectionIndex + 1) / totalSections) * 100;

    const handleWelcomeSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setStage('intro');
    };

    const startSections = () => {
        setStage('sections');
    };

    const handleFieldChange = (fieldId: keyof REIFormData, value: string) => {
        setFormData(prev => ({ ...prev, [fieldId]: value }));
    };

    const isSectionComplete = () => {
        return currentSection.fields
            .filter(field => field.required)
            .every(field => formData[field.id] && formData[field.id].trim() !== '');
    };

    const handleNext = () => {
        if (currentSectionIndex < totalSections - 1) {
            setCurrentSectionIndex(prev => prev + 1);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
            handleComplete();
        }
    };

    const handleBack = () => {
        if (currentSectionIndex > 0) {
            setCurrentSectionIndex(prev => prev - 1);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const handleComplete = () => {
        toast({
            title: "Diagnóstico REI Concluído!",
            description: `Obrigado, ${formData.responsible}! Nosso time irá analisar as informações da ${formData.company}.`,
        });

        setStage('complete');
        if (onComplete) onComplete();
    };

    const renderField = (field: REIField) => {
        const value = formData[field.id] || '';

        switch (field.type) {
            case 'textarea':
                return (
                    <Textarea
                        id={field.id}
                        value={value}
                        onChange={(e) => handleFieldChange(field.id, e.target.value)}
                        placeholder={field.placeholder}
                        required={field.required}
                        className="min-h-[120px] resize-y"
                    />
                );

            case 'select':
                return (
                    <Select
                        value={value}
                        onValueChange={(val) => handleFieldChange(field.id, val)}
                        required={field.required}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Selecione uma opção" />
                        </SelectTrigger>
                        <SelectContent>
                            {field.options?.map((option) => (
                                <SelectItem key={option.value} value={option.value}>
                                    {option.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                );

            case 'number':
            case 'text':
            default:
                return (
                    <Input
                        id={field.id}
                        type={field.type}
                        value={value}
                        onChange={(e) => handleFieldChange(field.id, e.target.value)}
                        placeholder={field.placeholder}
                        required={field.required}
                    />
                );
        }
    };

    // Welcome Screen
    if (stage === 'welcome') {
        return (
            <div className="min-h-[60vh] flex items-center justify-center py-12">
                <Card className="bg-white border border-zinc-200 p-8 md:p-12 max-w-2xl w-full mx-auto shadow-sm">
                    <div className="text-center mb-8">
                        <div className="w-20 h-20 bg-white flex items-center justify-center mx-auto mb-6 border-2 border-zinc-200 shadow-sm">
                            <img
                                src="https://storage.googleapis.com/msgsndr/oFTw9DcsKRUj6xCiq4mb/media/68eec7ea4ae0e04e5deea3de.jpeg"
                                alt="RevHackers"
                                className="w-12 h-12 object-contain"
                            />
                        </div>
                        <h2 className="text-4xl font-bold text-zinc-900 mb-4">
                            Bem-vindo ao Onboarding REVHACKERS
                        </h2>
                        <p className="text-lg text-zinc-600 max-w-md mx-auto mb-2">
                            <strong>Revenue Excellence Initiative</strong>
                        </p>
                        <p className="text-zinc-600">
                            Vamos mapear sua operação para criar uma estratégia de crescimento personalizada.
                        </p>
                    </div>

                    <form onSubmit={handleWelcomeSubmit} className="space-y-6">
                        <div>
                            <Label htmlFor="company" className="text-zinc-700 font-semibold">Nome da Empresa *</Label>
                            <Input
                                id="company"
                                value={formData.company}
                                onChange={(e) => handleFieldChange('company', e.target.value)}
                                placeholder="Nome da sua empresa"
                                required
                                className="mt-2 h-12 text-lg"
                            />
                        </div>

                        <div>
                            <Label htmlFor="segment" className="text-zinc-700 font-semibold">Segmento de Atuação *</Label>
                            <select
                                id="segment"
                                value={formData.segment}
                                onChange={(e) => handleFieldChange('segment', e.target.value)}
                                required
                                className="mt-2 flex h-12 w-full items-center justify-between border border-zinc-300 bg-white text-zinc-900 px-3 py-2 text-lg focus:outline-none focus:ring-2 focus:ring-revgreen focus:border-revgreen disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                <option value="">Selecione seu segmento</option>
                                <option value="SaaS">SaaS (Software as a Service)</option>
                                <option value="Software House">Software House</option>
                                <option value="Consultoria">Consultoria</option>
                                <option value="Agência">Agência de Marketing/Publicidade</option>
                                <option value="E-commerce B2B">E-commerce B2B</option>
                                <option value="Educação">Educação Corporativa</option>
                                <option value="Saúde">Saúde (HealthTech)</option>
                                <option value="Fintech">Fintech</option>
                                <option value="Logística">Logística e Supply Chain</option>
                                <option value="RH Tech">RH Tech</option>
                                <option value="Cibersegurança">Cibersegurança</option>
                                <option value="Infraestrutura TI">Infraestrutura de TI</option>
                                <option value="Indústria">Indústria/Manufatura</option>
                                <option value="Serviços Profissionais">Serviços Profissionais</option>
                                <option value="Outro">Outro</option>
                            </select>
                        </div>

                        <div>
                            <Label htmlFor="responsible" className="text-zinc-700 font-semibold">Seu Nome *</Label>
                            <Input
                                id="responsible"
                                value={formData.responsible}
                                onChange={(e) => handleFieldChange('responsible', e.target.value)}
                                placeholder="Seu nome completo"
                                required
                                className="mt-2 h-12 text-lg"
                            />
                        </div>

                        <div>
                            <Label htmlFor="email" className="text-zinc-700 font-semibold">Email Profissional *</Label>
                            <Input
                                id="email"
                                type="email"
                                value={formData.email}
                                onChange={(e) => handleFieldChange('email', e.target.value)}
                                placeholder="seu.email@empresa.com"
                                required
                                className="mt-2 h-12 text-lg"
                            />
                        </div>

                        <Button
                            type="submit"
                            className="w-full bg-revgreen text-black hover:bg-revgreen/90 h-14 font-semibold text-lg"
                        >
                            Começar Diagnóstico <ArrowRight className="ml-2 h-5 w-5" />
                        </Button>
                    </form>

                    <p className="text-center text-sm text-zinc-500 mt-6">
                        ⏱️ Tempo estimado: 15-20 minutos
                    </p>
                </Card>
            </div>
        );
    }

    // Intro Screen
    if (stage === 'intro') {
        return (
            <Card className="bg-white border border-zinc-200 p-8 md:p-12 max-w-4xl mx-auto shadow-sm">
                <div className="text-center mb-10">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-zinc-100 border border-zinc-200 text-zinc-700 text-sm font-semibold mb-6">
                        <Target className="w-4 h-4" />
                        Onboarding REVHACKERS
                    </div>

                    <h2 className="text-4xl md:text-5xl font-bold text-zinc-900 mb-6">
                        Bem-vindo, {formData.responsible}! 👋
                    </h2>

                    <p className="text-xl text-zinc-700 mb-4">
                        Vamos iniciar o onboarding da <span className="font-bold text-zinc-900">{formData.company}</span> na REVHACKERS
                    </p>

                    <p className="text-lg text-zinc-600 max-w-2xl mx-auto mb-10">
                        Nas próximas seções, vamos mapear 6 dimensões críticas da sua operação para criar um plano de crescimento personalizado:
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
                    {reiSections.map((section, index) => (
                        <div key={section.id} className="bg-white border border-zinc-200 p-5 hover:border-zinc-300 transition-colors">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-10 h-10 bg-zinc-50 flex items-center justify-center text-2xl">
                                    {section.icon}
                                </div>
                                <span className="text-xs font-semibold text-zinc-500">Seção {index + 1}</span>
                            </div>
                            <h4 className="font-bold text-zinc-900 mb-1">{section.title}</h4>
                            <p className="text-sm text-zinc-600">{section.description}</p>
                        </div>
                    ))}
                </div>

                <div className="bg-zinc-50 border border-zinc-200 p-6 mb-8">
                    <p className="text-center text-zinc-700">
                        <strong className="text-zinc-900">Ao final,</strong> você receberá um plano de ação completo com insights acionáveis e próximos passos para <span className="font-bold text-zinc-900">{formData.company}</span>.
                    </p>
                </div>

                <Button
                    onClick={startSections}
                    className="w-full bg-revgreen text-black hover:bg-revgreen/90 h-14 font-semibold text-lg"
                >
                    Iniciar Onboarding <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
            </Card>
        );
    }

    // Complete Screen
    if (stage === 'complete') {
        const score = calculateREIScore(formData);

        return (
            <div className="max-w-4xl mx-auto space-y-6">
                {/* Score Card */}
                <Card className="bg-white border-2 border-zinc-200 p-8 md:p-12 text-center">
                    <div className="w-20 h-20 bg-white flex items-center justify-center mx-auto mb-6 border-2 border-zinc-200 shadow-sm">
                        <Award className="h-10 w-10 text-revgreen" />
                    </div>

                    <h2 className="text-3xl font-bold text-zinc-900 mb-2">
                        Diagnóstico da {formData.company}
                    </h2>
                    <p className="text-zinc-600 mb-8">
                        Análise concluída por <strong>{formData.responsible}</strong>
                    </p>

                    {/* Score Display */}
                    <div className="bg-white border-2 border-zinc-200 p-8 mb-8">
                        <div className="flex items-center justify-center gap-4 mb-6">
                            <TrendingUp className={`w-8 h-8 ${score.color}`} />
                            <div>
                                <div className="text-sm font-semibold text-zinc-500 uppercase tracking-wide mb-1">
                                    Nível de Maturidade
                                </div>
                                <div className={`text-4xl font-bold ${score.color}`}>
                                    {score.level}
                                </div>
                            </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="mb-6">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-sm font-medium text-zinc-600">Score REI</span>
                                <span className="text-sm font-bold text-zinc-900">{score.percentage}%</span>
                            </div>
                            <div className="w-full bg-zinc-200 h-3">
                                <div
                                    className="bg-revgreen h-3 transition-all duration-500"
                                    style={{ width: `${score.percentage}%` }}
                                />
                            </div>
                            <div className="text-xs text-zinc-500 mt-2">
                                {score.total} de {score.maxScore} pontos
                            </div>
                        </div>

                        <p className="text-zinc-700 text-lg leading-relaxed">
                            {score.description}
                        </p>
                    </div>

                    {/* Recommendations */}
                    <div className="bg-zinc-50 border border-zinc-200 p-6 mb-8 text-left">
                        <h3 className="text-lg font-bold text-zinc-900 mb-4 flex items-center gap-2">
                            <CheckCircle2 className="w-5 h-5 text-revgreen" />
                            Recomendações Prioritárias
                        </h3>
                        <div className="space-y-3">
                            {score.recommendations.map((rec, index) => (
                                <div key={index} className="flex items-start gap-3">
                                    <div className="w-6 h-6 bg-revgreen/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                                        <span className="text-xs font-bold text-revgreen">{index + 1}</span>
                                    </div>
                                    <p className="text-zinc-700">{rec}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Next Steps */}
                    <div className="bg-white border border-zinc-200 p-6 mb-8 text-left">
                        <h3 className="text-lg font-bold text-zinc-900 mb-4">Próximos Passos:</h3>
                        <div className="space-y-3">
                            <div className="flex items-start gap-3">
                                <CheckCircle2 className="w-5 h-5 text-revgreen flex-shrink-0 mt-0.5" />
                                <p className="text-zinc-700">
                                    Nosso time irá analisar as informações da <strong>{formData.company}</strong>
                                </p>
                            </div>
                            <div className="flex items-start gap-3">
                                <CheckCircle2 className="w-5 h-5 text-revgreen flex-shrink-0 mt-0.5" />
                                <p className="text-zinc-700">
                                    Você receberá um relatório detalhado em até 48h
                                </p>
                            </div>
                            <div className="flex items-start gap-3">
                                <CheckCircle2 className="w-5 h-5 text-revgreen flex-shrink-0 mt-0.5" />
                                <p className="text-zinc-700">
                                    Agendaremos uma sessão estratégica para apresentar o plano de ação
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* CTAs */}
                    <div className="flex flex-col md:flex-row gap-4 justify-center">
                        <Button
                            onClick={() => navigate('/booking')}
                            className="bg-revgreen text-black hover:bg-revgreen/90 font-semibold h-12 px-8"
                        >
                            Agendar Sessão Estratégica
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => navigate('/dashboard')}
                            className="border-zinc-300 text-zinc-700 hover:bg-zinc-50 h-12 px-8"
                        >
                            Voltar ao Hub
                        </Button>
                    </div>
                </Card>
            </div>
        );
    }

    // Sections
    return (
        <div className="max-w-4xl mx-auto">
            {/* Progress */}
            <div className="mb-8">
                <div className="flex justify-between items-center mb-3">
                    <span className="text-sm font-medium text-zinc-700">
                        Seção {currentSectionIndex + 1} de {totalSections}
                    </span>
                    <span className="text-sm font-medium text-zinc-700">
                        {Math.round(progress)}% completo
                    </span>
                </div>
                <div className="w-full bg-zinc-200 h-2">
                    <div
                        className="bg-revgreen h-2 transition-all duration-300"
                        style={{ width: `${progress}%` }}
                    />
                </div>
            </div>

            {/* Section Card */}
            <Card className="bg-white border border-zinc-200 p-8 md:p-10">
                {/* Section Header */}
                <div className="mb-8">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 bg-zinc-50 flex items-center justify-center text-3xl">
                            {currentSection.icon}
                        </div>
                        <div>
                            <div className="text-xs font-semibold text-zinc-500 uppercase tracking-wide mb-1">
                                Seção {currentSectionIndex + 1}
                            </div>
                            <h3 className="text-2xl font-bold text-zinc-900">{currentSection.title}</h3>
                        </div>
                    </div>
                    <p className="text-zinc-600">{currentSection.description}</p>
                </div>

                {/* Fields */}
                <div className="space-y-6">
                    {currentSection.fields.map((field) => (
                        <div key={field.id}>
                            <Label htmlFor={field.id} className="text-zinc-700 font-medium mb-2 block">
                                {field.label}
                                {field.required && <span className="text-red-500 ml-1">*</span>}
                            </Label>
                            {renderField(field)}
                            {field.helpText && (
                                <p className="text-sm text-zinc-500 mt-1">{field.helpText}</p>
                            )}
                        </div>
                    ))}
                </div>

                {/* Navigation */}
                <div className="flex justify-between mt-10 pt-8 border-t border-zinc-200">
                    <Button
                        variant="ghost"
                        onClick={handleBack}
                        disabled={currentSectionIndex === 0}
                        className="text-zinc-600 hover:text-zinc-900"
                    >
                        <ArrowLeft className="mr-2 h-4 w-4" /> Anterior
                    </Button>

                    <Button
                        onClick={handleNext}
                        disabled={!isSectionComplete()}
                        className="bg-revgreen text-black hover:bg-revgreen/90 disabled:opacity-50"
                    >
                        {currentSectionIndex === totalSections - 1 ? (
                            <>Finalizar <Check className="ml-2 h-4 w-4" /></>
                        ) : (
                            <>Próxima <ArrowRight className="ml-2 h-4 w-4" /></>
                        )}
                    </Button>
                </div>
            </Card>
        </div>
    );
};

export default REIWizard;
