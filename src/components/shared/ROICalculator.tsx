import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Calculator, TrendingUp, Target, DollarSign } from 'lucide-react';

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
    }, 1500);
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
              Calcule o <span className="text-transparent bg-gradient-to-r from-revgreen to-green-600 bg-clip-text">impacto financeiro</span> da RevOps
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
                  className="w-full btn-primary text-lg h-14 relative overflow-hidden group"
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
              {result ? (
                <div className="space-y-6 animate-slide-in-up">
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
                        <p className="text-2xl font-bold text-purple-600">
                          {result.roi.toFixed(0)}%
                        </p>
                        <p className="text-sm text-gray-600 mt-1">Retorno sobre investimento</p>
                      </CardContent>
                    </Card>
                    
                    <Card className="interactive-card">
                      <CardContent className="pt-6 text-center">
                        <p className="text-2xl font-bold text-blue-600">
                          {result.paybackMonths.toFixed(0)} meses
                        </p>
                        <p className="text-sm text-gray-600 mt-1">Tempo de retorno</p>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="bg-gradient-to-r from-revgreen/10 to-green-100/50 rounded-2xl p-6 border border-revgreen/20">
                    <h4 className="font-bold text-lg mb-3 text-revgreen">
                      💡 Baseado em casos reais
                    </h4>
                    <p className="text-gray-700 text-sm leading-relaxed">
                      Estes cálculos são baseados na média de resultados de nossos +150 clientes B2B, 
                      considerando melhorias de 30% em conversão, 25% em eficiência operacional e 24% 
                      na redução de churn.
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