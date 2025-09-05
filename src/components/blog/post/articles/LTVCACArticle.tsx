import { Calculator, TrendingUp, AlertCircle, DollarSign, ArrowRight, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useState } from 'react';

const LTVCACArticle = () => {
  const [formData, setFormData] = useState({
    monthlyRevenue: '',
    grossMargin: '',
    churnRate: '',
    acquisitionCost: ''
  });

  const [results, setResults] = useState<{
    ltv: number;
    ratio: number;
    payback: number;
  } | null>(null);

  const calculateMetrics = () => {
    const monthlyRevenue = parseFloat(formData.monthlyRevenue);
    const grossMargin = parseFloat(formData.grossMargin) / 100;
    const churnRate = parseFloat(formData.churnRate) / 100;
    const cac = parseFloat(formData.acquisitionCost);

    if (monthlyRevenue && grossMargin && churnRate && cac) {
      const ltv = (monthlyRevenue * grossMargin) / churnRate;
      const ratio = ltv / cac;
      const payback = cac / (monthlyRevenue * grossMargin);

      setResults({
        ltv: Math.round(ltv),
        ratio: Math.round(ratio * 100) / 100,
        payback: Math.round(payback * 10) / 10
      });
    }
  };

  const optimizationStrategies = [
    {
      metric: "Aumentar LTV",
      strategies: [
        "Implementar programa de upsell/cross-sell estruturado",
        "Melhorar onboarding para ativar usuários mais rapidamente",
        "Criar programa de success para reduzir churn",
        "Desenvolver features que aumentam stickiness"
      ]
    },
    {
      metric: "Reduzir CAC", 
      strategies: [
        "Otimizar funil de conversão (melhorar CR em 20% = CAC 20% menor)",
        "Implementar marketing de referral/viral",
        "Focar em canais com melhor CAC (geralmente SEO e referral)",
        "Melhorar ICP para aumentar taxa de fechamento"
      ]
    }
  ];

  const benchmarks = [
    { industry: "SaaS B2B", ltvCacRatio: "3:1 - 5:1", payback: "5-12 meses" },
    { industry: "E-commerce", ltvCacRatio: "3:1 - 4:1", payback: "1-3 meses" },
    { industry: "Mobile App", ltvCacRatio: "2:1 - 3:1", payback: "1-6 meses" },
    { industry: "MarketPlace", ltvCacRatio: "4:1 - 6:1", payback: "3-8 meses" }
  ];

  return (
    <article className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-12">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl">
            <BarChart3 className="w-6 h-6 text-white" />
          </div>
          <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium">
            Métricas
          </span>
        </div>
        
        <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-6">
          LTV vs CAC: como calcular e otimizar para crescimento sustentável
        </h1>
        
        <div className="flex items-center gap-6 text-gray-600 mb-8">
          <span>15 min de leitura</span>
          <span>•</span>
          <span>Ricardo Oliveira</span>
        </div>
        
        <p className="text-xl text-gray-700 leading-relaxed">
          As duas métricas mais importantes do seu negócio B2B explicadas de forma prática, 
          com calculadora interativa e estratégias para otimização baseadas em 100+ auditorias.
        </p>
      </div>

      {/* Por que importa */}
      <div className="prose prose-lg max-w-none mb-12">
        <p>
          Se você só pudesse acompanhar <strong>duas métricas</strong> no seu negócio, seriam LTV e CAC. 
          Elas determinam se sua empresa é um foguete ou um buraco negro financeiro.
        </p>
        
        <div className="grid md:grid-cols-2 gap-8 my-8">
          <Card className="border-l-4 border-l-green-500">
            <CardHeader>
              <CardTitle className="text-green-700">LTV Alto + CAC Baixo</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm">Crescimento sustentável, margens saudáveis, investidores interessados</p>
            </CardContent>
          </Card>
          
          <Card className="border-l-4 border-l-red-500">
            <CardHeader>
              <CardTitle className="text-red-700">LTV Baixo + CAC Alto</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm">Queima de caixa, crescimento insustentável, morte lenta</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Calculadora interativa */}
      <Card className="mb-12 bg-gradient-to-r from-blue-50 to-purple-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="w-6 h-6 text-blue-600" />
            Calculadora LTV vs CAC
          </CardTitle>
          <p className="text-sm text-gray-600">Insira seus dados para calcular suas métricas</p>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium mb-2">Receita Mensal por Cliente (R$)</label>
              <input
                type="number"
                value={formData.monthlyRevenue}
                onChange={(e) => setFormData({...formData, monthlyRevenue: e.target.value})}
                className="w-full p-3 border rounded-lg"
                placeholder="ex: 500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Margem Bruta (%)</label>
              <input
                type="number"
                value={formData.grossMargin}
                onChange={(e) => setFormData({...formData, grossMargin: e.target.value})}
                className="w-full p-3 border rounded-lg"
                placeholder="ex: 80"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Taxa de Churn Mensal (%)</label>
              <input
                type="number"
                step="0.1"
                value={formData.churnRate}
                onChange={(e) => setFormData({...formData, churnRate: e.target.value})}
                className="w-full p-3 border rounded-lg"
                placeholder="ex: 5"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">CAC - Custo de Aquisição (R$)</label>
              <input
                type="number"
                value={formData.acquisitionCost}
                onChange={(e) => setFormData({...formData, acquisitionCost: e.target.value})}
                className="w-full p-3 border rounded-lg"
                placeholder="ex: 1200"
              />
            </div>
          </div>
          
          <Button onClick={calculateMetrics} className="w-full mb-6">
            <Calculator className="w-4 h-4 mr-2" />
            Calcular Métricas
          </Button>

          {results && (
            <div className="grid md:grid-cols-3 gap-4">
              <div className="bg-white p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-green-600">R$ {results.ltv.toLocaleString()}</div>
                <div className="text-sm text-gray-600">LTV (Lifetime Value)</div>
              </div>
              <div className="bg-white p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-blue-600">{results.ratio}:1</div>
                <div className="text-sm text-gray-600">Ratio LTV:CAC</div>
              </div>
              <div className="bg-white p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-purple-600">{results.payback} meses</div>
                <div className="text-sm text-gray-600">Payback Period</div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Como calcular */}
      <div className="mb-16">
        <h2 className="text-3xl font-bold mb-8">Como Calcular (Fórmulas Práticas)</h2>
        
        <div className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-green-600" />
                LTV (Lifetime Value)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-50 p-4 rounded-lg mb-4">
                <p className="font-mono text-center text-lg">
                  LTV = (Receita Mensal × Margem Bruta) ÷ Taxa de Churn Mensal
                </p>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                <strong>Exemplo:</strong> Cliente paga R$ 500/mês, margem 80%, churn 5%/mês
              </p>
              <p className="font-mono text-sm bg-green-50 p-3 rounded">
                LTV = (500 × 0.8) ÷ 0.05 = R$ 8.000
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-blue-600" />
                CAC (Customer Acquisition Cost)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-50 p-4 rounded-lg mb-4">
                <p className="font-mono text-center text-lg">
                  CAC = Gastos com Marketing e Vendas ÷ Novos Clientes Adquiridos
                </p>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                <strong>Exemplo:</strong> R$ 50.000 gastos, 50 novos clientes
              </p>
              <p className="font-mono text-sm bg-blue-50 p-3 rounded">
                CAC = 50.000 ÷ 50 = R$ 1.000
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Benchmarks */}
      <div className="mb-16">
        <h2 className="text-3xl font-bold mb-8">Benchmarks por Indústria</h2>
        
        <div className="overflow-x-auto">
          <table className="w-full border-collapse bg-white rounded-lg shadow-sm">
            <thead>
              <tr className="bg-gray-50">
                <th className="text-left p-4 font-semibold">Indústria</th>
                <th className="text-left p-4 font-semibold">Ratio LTV:CAC</th>
                <th className="text-left p-4 font-semibold">Payback Period</th>
              </tr>
            </thead>
            <tbody>
              {benchmarks.map((benchmark, index) => (
                <tr key={index} className="border-t border-gray-100">
                  <td className="p-4 font-medium">{benchmark.industry}</td>
                  <td className="p-4">{benchmark.ltvCacRatio}</td>
                  <td className="p-4">{benchmark.payback}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Alerta de ratios */}
      <Alert className="mb-12 border-orange-200 bg-orange-50">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          <strong>Atenção aos ratios:</strong>
          <ul className="mt-2 space-y-1">
            <li>• <strong>Menor que 1:1:</strong> Você perde dinheiro em cada cliente</li>
            <li>• <strong>1:1 a 3:1:</strong> Crescimento possível mas arriscado</li>
            <li>• <strong>3:1 a 5:1:</strong> Zona saudável para a maioria dos negócios</li>
            <li>• <strong>Maior que 5:1:</strong> Você pode estar investindo pouco em crescimento</li>
          </ul>
        </AlertDescription>
      </Alert>

      {/* Estratégias de otimização */}
      <div className="mb-16">
        <h2 className="text-3xl font-bold mb-8">Estratégias de Otimização</h2>
        
        <div className="space-y-8">
          {optimizationStrategies.map((section, index) => (
            <Card key={index}>
              <CardHeader>
                <CardTitle>{section.metric}</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {section.strategies.map((strategy, strategyIndex) => (
                    <li key={strategyIndex} className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                      <span className="text-sm">{strategy}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Erros comuns */}
      <Card className="mb-12 border-l-4 border-l-red-500">
        <CardHeader>
          <CardTitle className="text-red-700">Erros Comuns no Cálculo</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">1. Não incluir todos os custos no CAC</h4>
              <p className="text-sm text-gray-600">Inclua: salários do time, ferramentas, ads, eventos, conteúdo, etc.</p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">2. Usar receita bruta ao invés de margem</h4>
              <p className="text-sm text-gray-600">LTV deve considerar apenas o lucro, não a receita total.</p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">3. Não segmentar por canal</h4>
              <p className="text-sm text-gray-600">CAC varia drasticamente entre canais. Meça separadamente.</p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">4. Ignorar cohort analysis</h4>
              <p className="text-sm text-gray-600">LTV varia por período de aquisição. Analise por cohorts.</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* CTA */}
      <div className="bg-black text-white p-8 rounded-2xl text-center">
        <h3 className="text-2xl font-bold mb-4">
          Precisa de ajuda para otimizar suas métricas?
        </h3>
        <p className="text-gray-300 mb-6">
          Nosso diagnóstico inclui análise completa do seu LTV vs CAC, 
          identificação de oportunidades e plano de otimização específico.
        </p>
        <Button size="lg" className="bg-purple-600 hover:bg-purple-700 text-white">
          Solicitar Diagnóstico Gratuito
          <ArrowRight className="ml-2 w-5 h-5" />
        </Button>
      </div>
    </article>
  );
};

export default LTVCACArticle;