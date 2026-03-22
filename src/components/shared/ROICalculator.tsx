import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Calculator, TrendingUp, Target, DollarSign, Mail, Lock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { saveFormData } from '@/utils/formStorage';
import { sendToGHL } from '@/lib/ghlRelay';

interface ROIResult {
  monthlyIncrease: number;
  yearlyIncrease: number;
  roi: number;
  paybackMonths: number;
}

const ROICalculator = () => {
  const [currentRevenue, setCurrentRevenue] = useState(100000);
  const [teamSize, setTeamSize] = useState(5);
  const [conversionRate, setConversionRate] = useState([2.5]);
  const [result, setResult] = useState<ROIResult | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [showContactForm, setShowContactForm] = useState(false);
  const [contactFormSubmitted, setContactFormSubmitted] = useState(false);

  const calculateROI = () => {
    setIsCalculating(true);

    // Simular cálculo com delay para UX
    setTimeout(() => {
      // Baseado em dados reais dos nossos casos
      const conversionImprovement = 0.3; // 30% melhoria média
      const operationalEfficiency = 0.25; // 25% eficiência operacional
      const churnReduction = 0.24; // 24% redução de churn

      const monthlyRevenue = currentRevenue / 12;
      const improvementFactor = 1 + (conversionImprovement + (conversionRate[0] / 100) * 0.5);

      const monthlyIncrease = monthlyRevenue * improvementFactor - monthlyRevenue;
      const yearlyIncrease = monthlyIncrease * 12;

      // Investimento estimado baseado no tamanho da equipe
      const estimatedInvestment = teamSize * 8000; // R$ 8k por pessoa/mês em média
      const roi = (yearlyIncrease / estimatedInvestment) * 100;
      const paybackMonths = estimatedInvestment / monthlyIncrease;

      setResult({
        monthlyIncrease,
        yearlyIncrease,
        roi,
        paybackMonths
      });

      setIsCalculating(false);
      setShowContactForm(true);
    }, 1500);
  };

  const handleContactFormSubmit = () => {
    setContactFormSubmitted(true);
    setShowContactForm(false);
  };

  // Contact form component with callback
  const ContactFormForROI = ({ onSuccess }: { onSuccess: () => void }) => {
    const { toast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
      name: '',
      email: '',
      company: '',
      phone: '',
      industry: '',
      message: '',
      role: '',
    });

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setIsSubmitting(true);

      try {
        const submissionData = {
          ...formData,
          formType: 'roi-calculator',
          source: window.location.href,
          timestamp: new Date().toISOString(),
        };

        // Save to localStorage
        saveFormData(submissionData);

        // Send to GHL relay
        await sendToGHL('roi_calculator', submissionData as Record<string, unknown>);

        toast({
          title: "Sucesso!",
          description: "Suas informações foram enviadas com sucesso.",
        });
        onSuccess();
      } catch (error) {
        console.error('Error submitting form:', error);
        toast({
          title: "Erro",
          description: "Ocorreu um erro ao enviar o formulário. Tente novamente.",
          variant: "destructive",
        });
      } finally {
        setIsSubmitting(false);
      }
    };

    const handleInputChange = (field: string, value: string) => {
      setFormData(prev => ({ ...prev, [field]: value }));
    };

    return (
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <Label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">NOME COMPLETO *</Label>
            <Input
              id="name"
              type="text"
              placeholder="NOME E SOBRENOME"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              required
              className="bg-white border-zinc-200 text-black h-12 rounded-none focus:border-black transition-all"
            />
          </div>

          <div className="space-y-1">
            <Label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">E-MAIL CORPORATIVO *</Label>
            <Input
              id="email"
              type="email"
              placeholder="EX: NOME@EMPRESA.COM"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              required
              className="bg-white border-zinc-200 text-black h-12 rounded-none focus:border-black transition-all"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <Label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">NOME DA EMPRESA *</Label>
            <Input
              id="company"
              type="text"
              placeholder="ORGANIZAÇÃO"
              value={formData.company}
              onChange={(e) => handleInputChange('company', e.target.value)}
              required
              className="bg-white border-zinc-200 text-black h-12 rounded-none focus:border-black transition-all"
            />
          </div>

          <div className="space-y-1">
            <Label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">WHATSAPP *</Label>
            <Input
              id="phone"
              type="tel"
              placeholder="+55 (00) 00000-0000"
              value={formData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              required
              className="bg-white border-zinc-200 text-black h-12 rounded-none focus:border-black transition-all"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <Label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">SEGMENTO *</Label>
            <Select value={formData.industry} onValueChange={(value) => handleInputChange('industry', value)} required>
              <SelectTrigger className="bg-white border-zinc-200 text-black h-12 rounded-none focus:ring-0">
                <SelectValue placeholder="SELECIONAR" />
              </SelectTrigger>
              <SelectContent className="bg-white border-zinc-200 text-black rounded-none">
                <SelectItem value="technology">Tecnologia</SelectItem>
                <SelectItem value="finance">Financeiro</SelectItem>
                <SelectItem value="health">Saúde</SelectItem>
                <SelectItem value="education">Educação</SelectItem>
                <SelectItem value="retail">Varejo</SelectItem>
                <SelectItem value="manufacturing">Indústria</SelectItem>
                <SelectItem value="services">Serviços</SelectItem>
                <SelectItem value="real_estate">Imobiliário</SelectItem>
                <SelectItem value="consulting">Consultoria</SelectItem>
                <SelectItem value="other">Outros</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <Label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">CARGO *</Label>
            <Select value={formData.role} onValueChange={(value) => handleInputChange('role', value)} required>
              <SelectTrigger className="bg-white border-zinc-200 text-black h-12 rounded-none focus:ring-0">
                <SelectValue placeholder="SELECIONAR" />
              </SelectTrigger>
              <SelectContent className="bg-white border-zinc-200 text-black rounded-none">
                <SelectItem value="ceo">CEO/Presidente</SelectItem>
                <SelectItem value="cto">CTO/Diretor de Tecnologia</SelectItem>
                <SelectItem value="cmo">CMO/Diretor de Marketing</SelectItem>
                <SelectItem value="cfo">CFO/Diretor Financeiro</SelectItem>
                <SelectItem value="vp_sales">VP/Diretor de Vendas</SelectItem>
                <SelectItem value="vp_marketing">VP/Diretor de Marketing</SelectItem>
                <SelectItem value="manager">Gerente</SelectItem>
                <SelectItem value="coordinator">Coordenador</SelectItem>
                <SelectItem value="analyst">Analista</SelectItem>
                <SelectItem value="consultant">Consultor</SelectItem>
                <SelectItem value="owner">Proprietário</SelectItem>
                <SelectItem value="other">Outros</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-1">
          <Label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">MENSAGEM ADICIONAL</Label>
          <Textarea
            id="message"
            placeholder="DESCREVA SEUS DESAFIOS ATUAIS..."
            value={formData.message}
            onChange={(e) => handleInputChange('message', e.target.value)}
            className="bg-white border-zinc-200 text-black rounded-none focus:border-black min-h-[100px] text-xs font-bold transition-all"
          />
        </div>

        <Button
          type="submit"
          className="w-full bg-black text-white hover:bg-revgreen hover:text-black h-12 rounded-none font-bold uppercase tracking-widest text-[10px] transition-all duration-300"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Gerando Relatório...' : 'VER RESULTADOS DO CÁLCULO'}
        </Button>
      </form>
    );
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  return (
    <section className="section-padding mesh-background">
      <div className="container-custom">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center px-6 py-3 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 text-sm font-medium mb-8 animate-bounce-gentle">
              <Calculator className="w-4 h-4 mr-2 text-revgreen" />
              Calculadora Interativa
            </div>
            <h2 className="section-title mb-6 animate-fadeUp">
              Calcule o <span className="text-transparent bg-gradient-to-r from-revgreen to-green-600 bg-clip-text">impacto financeiro</span>
            </h2>
            <p className="text-xl text-gray-600 animate-fade-in-delayed max-w-3xl mx-auto">
              Descubra quanto sua empresa pode crescer com nossa metodologia baseada em resultados reais de +150 clientes
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            {/* Calculator Form */}
            <Card className="interactive-card glow-effect">
              <CardHeader>
                <CardTitle className="flex items-center text-2xl">
                  <Target className="w-6 h-6 mr-3 text-revgreen" />
                  Dados da sua empresa
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-8">
                <div className="space-y-3">
                  <Label htmlFor="revenue" className="text-base font-medium">
                    Receita mensal atual (R$)
                  </Label>
                  <Input
                    id="revenue"
                    type="number"
                    value={currentRevenue}
                    onChange={(e) => setCurrentRevenue(Number(e.target.value))}
                    className="text-lg h-12 shimmer-effect"
                    placeholder="100.000"
                  />
                </div>

                <div className="space-y-3">
                  <Label htmlFor="team" className="text-base font-medium">
                    Tamanho da equipe comercial
                  </Label>
                  <Input
                    id="team"
                    type="number"
                    value={teamSize}
                    onChange={(e) => setTeamSize(Number(e.target.value))}
                    className="text-lg h-12"
                    placeholder="5"
                  />
                </div>

                <div className="space-y-4">
                  <Label className="text-base font-medium">
                    Taxa de conversão atual: {conversionRate[0]}%
                  </Label>
                  <Slider
                    value={conversionRate}
                    onValueChange={setConversionRate}
                    max={10}
                    min={0.5}
                    step={0.1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-sm text-gray-500">
                    <span>0.5%</span>
                    <span>10%</span>
                  </div>
                </div>

                <Button
                  onClick={calculateROI}
                  disabled={isCalculating}
                  className="w-full btn-primary text-base h-14 relative overflow-hidden group"
                >
                  {isCalculating ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-black mr-3"></div>
                      Calculando...
                    </div>
                  ) : (
                    <>
                      <Calculator className="w-5 h-5 mr-3" />
                      Calcular Potencial de Crescimento
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Results */}
            <div className="space-y-6">
              {showContactForm ? (
                <Card className="interactive-card border-revgreen/20 animate-slide-in-up">
                  <CardHeader>
                    <CardTitle className="flex flex-col items-center text-2xl text-center space-y-3">
                      <Lock className="w-8 h-8 text-revgreen" />
                      Preencha seus dados para ver o resultado
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center mb-6">
                      <p className="text-gray-600">
                        Seus resultados foram calculados! Para visualizar seu potencial de crescimento,
                        precisamos de algumas informações para personalizar ainda mais nossa análise.
                      </p>
                    </div>
                    <ContactFormForROI onSuccess={handleContactFormSubmit} />
                  </CardContent>
                </Card>
              ) : result && contactFormSubmitted ? (
                <div className="space-y-6 animate-slide-in-up">
                  <div className="text-center mb-10 p-6 bg-zinc-50 rounded-none border border-zinc-200">
                    <h3 className="text-lg font-black text-black mb-2 uppercase tracking-tighter">IDENTIFICAÇÃO VALIDADA</h3>
                    <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest">
                      Seus resultados personalizados foram liberados.
                    </p>
                  </div>

                  <Card className="interactive-card border-revgreen/20">
                    <CardContent className="pt-6">
                      <div className="flex items-center mb-4">
                        <TrendingUp className="w-6 h-6 text-revgreen mr-3" />
                        <h3 className="text-xl font-bold">Crescimento Mensal</h3>
                      </div>
                      <p className="text-3xl font-bold text-revgreen">
                        {formatCurrency(result.monthlyIncrease)}
                      </p>
                      <p className="text-gray-600 mt-2">
                        Aumento estimado na receita mensal
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="interactive-card border-green-200">
                    <CardContent className="pt-6">
                      <div className="flex items-center mb-4">
                        <DollarSign className="w-6 h-6 text-green-600 mr-3" />
                        <h3 className="text-xl font-bold">Crescimento Anual</h3>
                      </div>
                      <p className="text-3xl font-bold text-green-600">
                        {formatCurrency(result.yearlyIncrease)}
                      </p>
                      <p className="text-gray-600 mt-2">
                        Potencial de crescimento no primeiro ano
                      </p>
                    </CardContent>
                  </Card>

                  <div className="grid grid-cols-2 gap-4">
                    <Card className="interactive-card">
                      <CardContent className="pt-6 text-center">
                        <p className="text-2xl font-bold text-[#00CC6A]">
                          {result.roi.toFixed(0)}%
                        </p>
                        <p className="text-sm text-gray-600 mt-1">Retorno sobre investimento</p>
                      </CardContent>
                    </Card>

                    <Card className="interactive-card">
                      <CardContent className="pt-6 text-center">
                        <p className="text-2xl font-bold text-zinc-900">
                          {result.paybackMonths.toFixed(0)} meses
                        </p>
                        <p className="text-sm text-gray-600 mt-1">Tempo de retorno</p>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="bg-zinc-50 rounded-none p-8 border border-zinc-200">
                    <h4 className="font-black text-xs mb-4 text-black uppercase tracking-widest">
                      PROTOCOLO DE VALIDAÇÃO
                    </h4>
                    <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest leading-relaxed">
                      Este cálculo utiliza o framework REI (Revenue Excellence Initiative) baseado na performance de +150 operações B2B, considerando melhorias incrementais de 30% em conversão e 25% em eficiência operacional.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-16 animate-pulse-soft">
                  <Calculator className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 text-lg">
                    Preencha os dados para ver seu potencial de crescimento
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ROICalculator;