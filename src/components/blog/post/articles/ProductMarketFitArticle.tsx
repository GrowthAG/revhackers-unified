import { Target, CheckCircle, XCircle, TrendingUp, Users, AlertTriangle, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';

const ProductMarketFitArticle = () => {
  const positiveSigns = [
    {
      title: "Crescimento Orgânico Acelerado",
      description: "Usuários chegam por indicação sem esforço ativo de marketing",
      metric: ">40% dos novos usuários vêm de referral",
      example: "Slack cresceu 30%+ mensalmente só com word-of-mouth"
    },
    {
      title: "Alta Retenção desde o Início",
      description: "Usuários não apenas ficam, mas aumentam o uso ao longo do tempo",
      metric: "Retenção de 6 meses >60%",
      example: "Notion: usuários ativos crescem 25% mensalmente após onboarding"
    },
    {
      title: "Resistência Extrema ao Cancelamento",
      description: "Clientes ficam genuinamente chateados quando consideram parar de usar",
      metric: ">40% responde 'muito decepcionado' no teste PMF Survey",
      example: "Usuários do Figma: 'Como vou colaborar sem ele?'"
    },
    {
      title: "Expansão Natural de Conta",
      description: "Clientes compram mais produtos/assentos sem pressão comercial",
      metric: "Net Revenue Retention >110%",
      example: "Zoom: times começam com 10 usuários, chegam a 100+ naturalmente"
    },
    {
      title: "Demanda Supera Capacidade de Entrega",
      description: "Você tem que frear vendas ou contratar rapidamente para acompanhar",
      metric: "Pipeline 3x maior que capacidade de delivery",
      example: "OpenAI teve que limitar acesso ao ChatGPT por demanda excessiva"
    }
  ];

  const negativeSigns = [
    {
      title: "Alto Churn nos Primeiros 90 Dias",
      description: "Usuários testam mas não encontram valor suficiente para continuar",
      warning: "Churn >10% nos primeiros 3 meses indica falta de PMF"
    },
    {
      title: "Crescimento Dependente de Marketing Pago",
      description: "Quando para de pagar por ads, o crescimento despenca",
      warning: "CAC crescendo mais rápido que LTV"
    },
    {
      title: "Dificuldade em Explicar o Valor",
      description: "Você precisa de longos demos/explicações para mostrar o valor",
      warning: "Se não é óbvio em 30 segundos, não há PMF"
    }
  ];

  const validationFrameworks = [
    {
      name: "PMF Survey (Sean Ellis)",
      description: "Pergunta direta sobre decepção se parasse de usar",
      benchmark: "40%+ respondem 'muito decepcionado'",
      how: "Survey simples enviado para usuários ativos há 2+ semanas"
    },
    {
      name: "Retention Cohort Analysis",
      description: "Análise de retenção por período de aquisição",
      benchmark: "Curva de retenção se estabiliza acima de 20%",
      how: "Acompanhe usuários por cohort de signup por 6+ meses"
    },
    {
      name: "NPS + Behavioral Data",
      description: "Combine satisfação com uso real do produto",
      benchmark: "NPS >50 + engagement crescente",
      how: "NPS mensal + métricas de uso (DAU, feature adoption)"
    },
    {
      name: "Revenue Quality Check",
      description: "Análise da qualidade da receita gerada",
      benchmark: "ARR growth >100% YoY com CAC payback <12 meses",
      how: "Acompanhe métricas de receita e eficiência de aquisição"
    }
  ];

  const actionPlan = [
    {
      phase: "Identificação do Problema Real",
      actions: [
        "Entrevistas profundas com 30+ usuários do seu ICP",
        "Análise de jobs-to-be-done específicos",
        "Mapeamento da jornada atual (sem seu produto)",
        "Identificação de hair-on-fire problems"
      ]
    },
    {
      phase: "Validação de Solução",
      actions: [
        "MVP focado no core problem (não feature-rich)",
        "Teste com 100+ early adopters reais",
        "Medição de usage patterns diários",
        "Iteração baseada em comportamento, não opinião"
      ]
    },
    {
      phase: "Scale & Optimization",
      actions: [
        "Identificação do canal #1 de aquisição",
        "Otimização do onboarding para aha-moment",
        "Construção de loops virais naturais",
        "Expansão para segmentos adjacentes"
      ]
    }
  ];

  return (
    <article className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-12">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl">
            <Target className="w-6 h-6 text-white" />
          </div>
          <span className="px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm font-medium">
            Estratégia
          </span>
        </div>
        
        <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-6">
          Product-Market Fit: 5 sinais de que você encontrou (e 3 de que não)
        </h1>
        
        <div className="flex items-center gap-6 text-gray-600 mb-8">
          <span>11 min de leitura</span>
          <span>•</span>
          <span>Paula Ribeiro</span>
        </div>
        
        <p className="text-xl text-gray-700 leading-relaxed">
          Product-Market Fit não é um feeling. É um estado mensurável que 90% das startups 
          pensam que têm, mas apenas 10% realmente encontraram. Aprenda a diferença.
        </p>
      </div>

      {/* Definição clara */}
      <div className="prose prose-lg max-w-none mb-12">
        <p>
          <strong>Product-Market Fit</strong> acontece quando seu produto resolve um problema real, 
          para pessoas reais, que estão dispostas a pagar por essa solução, 
          e te recomendam ativamente para outros.
        </p>
        
        <p>
          É o momento em que <strong>puxar</strong> substitui <strong>empurrar</strong>. 
          Você para de convencer pessoas a usar seu produto e começa a atender demanda orgânica.
        </p>
      </div>

      {/* Estatística de destaque */}
      <Card className="mb-12 bg-gradient-to-r from-red-50 to-orange-50 border-l-4 border-l-red-500">
        <CardContent className="p-8 text-center">
          <div className="text-4xl font-bold text-red-600 mb-2">90%</div>
          <div className="text-lg text-gray-700 mb-4">das startups falham por falta de PMF</div>
          <p className="text-sm text-gray-600">
            Não por problemas técnicos, falta de funding ou competição. 
            Simplesmente constroem algo que ninguém quer o suficiente.
          </p>
        </CardContent>
      </Card>

      {/* 5 Sinais Positivos */}
      <div className="mb-16">
        <h2 className="text-3xl font-bold mb-8 flex items-center gap-3">
          <CheckCircle className="w-8 h-8 text-green-600" />
          5 Sinais de que Você ENCONTROU PMF
        </h2>
        
        <div className="space-y-6">
          {positiveSigns.map((sign, index) => (
            <Card key={index} className="border border-green-200 hover:border-green-300 transition-colors">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <CardTitle className="flex items-center gap-3">
                    <span className="bg-green-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">
                      {index + 1}
                    </span>
                    {sign.title}
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 mb-4">{sign.description}</p>
                <div className="bg-green-50 p-3 rounded-lg mb-3">
                  <p className="text-sm font-semibold text-green-800">📊 Métrica-chave: {sign.metric}</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-sm text-gray-600">💡 Exemplo: {sign.example}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* 3 Sinais Negativos */}
      <div className="mb-16">
        <h2 className="text-3xl font-bold mb-8 flex items-center gap-3">
          <XCircle className="w-8 h-8 text-red-600" />
          3 Sinais de que Você NÃO TEM PMF
        </h2>
        
        <div className="space-y-6">
          {negativeSigns.map((sign, index) => (
            <Card key={index} className="border border-red-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-red-700">
                  <AlertTriangle className="w-6 h-6" />
                  {sign.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 mb-3">{sign.description}</p>
                <Alert className="border-red-200 bg-red-50">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Alerta:</strong> {sign.warning}
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Framework de validação */}
      <div className="mb-16">
        <h2 className="text-3xl font-bold mb-8">Frameworks para Validar PMF</h2>
        
        <div className="grid md:grid-cols-2 gap-6">
          {validationFrameworks.map((framework, index) => (
            <Card key={index}>
              <CardHeader>
                <CardTitle className="text-lg">{framework.name}</CardTitle>
                <p className="text-sm text-gray-600">{framework.description}</p>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <p className="text-sm font-semibold text-blue-800">🎯 Benchmark: {framework.benchmark}</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-sm text-gray-700">🔧 Como fazer: {framework.how}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* PMF Survey Calculator */}
      <Card className="mb-12 bg-gradient-to-r from-blue-50 to-indigo-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-6 h-6 text-blue-600" />
            Quick PMF Health Check
          </CardTitle>
          <p className="text-sm text-gray-600">Baseado nos sinais que você identificou acima</p>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium">Crescimento Orgânico</span>
                <span className="text-sm text-gray-600">40%</span>
              </div>
              <Progress value={40} className="h-2" />
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium">Retenção 6M</span>
                <span className="text-sm text-gray-600">35%</span>
              </div>
              <Progress value={35} className="h-2" />
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium">PMF Survey Score</span>
                <span className="text-sm text-gray-600">25%</span>
              </div>
              <Progress value={25} className="h-2" />
            </div>
            <div className="bg-orange-50 p-4 rounded-lg mt-4">
              <p className="text-sm font-semibold text-orange-800 mb-2">📊 Resultado: PMF Incompleto</p>
              <p className="text-sm text-orange-700">
                Você tem alguns sinais positivos, mas ainda não alcançou PMF completo. 
                Foque em entender melhor o core problem dos seus usuários.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Plano de ação */}
      <div className="mb-16">
        <h2 className="text-3xl font-bold mb-8">Plano de Ação para Encontrar PMF</h2>
        
        <div className="space-y-8">
          {actionPlan.map((phase, index) => (
            <Card key={index}>
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <span className="bg-indigo-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">
                    {index + 1}
                  </span>
                  {phase.phase}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {phase.actions.map((action, actionIndex) => (
                    <li key={actionIndex} className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-indigo-500 rounded-full mt-2 flex-shrink-0"></div>
                      <span className="text-sm">{action}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Casos reais */}
      <Card className="mb-12">
        <CardHeader>
          <CardTitle>Casos Reais: PMF em Ação</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="border-l-4 border-l-green-500 pl-4">
              <h4 className="font-semibold mb-2">Zoom (2011-2020)</h4>
              <p className="text-sm text-gray-600 mb-2">
                <strong>Problema:</strong> Videoconferência era complexa e não funcionava bem
              </p>
              <p className="text-sm text-gray-600 mb-2">
                <strong>Solução:</strong> "Just works" - um clique e funciona em qualquer device
              </p>
              <p className="text-sm text-green-700">
                <strong>PMF:</strong> 40% de crescimento mensal orgânico por 2 anos consecutivos
              </p>
            </div>
            
            <div className="border-l-4 border-l-blue-500 pl-4">
              <h4 className="font-semibold mb-2">Notion (2016-2020)</h4>
              <p className="text-sm text-gray-600 mb-2">
                <strong>Problema:</strong> Ferramentas de produtividade fragmentadas (docs + tasks + wiki)
              </p>
              <p className="text-sm text-gray-600 mb-2">
                <strong>Solução:</strong> Workspace all-in-one com blocos modulares
              </p>
              <p className="text-sm text-blue-700">
                <strong>PMF:</strong> Usuários criaram 2M+ templates compartilhados espontaneamente
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* CTA */}
      <div className="bg-black text-white p-8 rounded-2xl text-center">
        <h3 className="text-2xl font-bold mb-4">
          Não sabe se tem PMF? Vamos descobrir juntos.
        </h3>
        <p className="text-gray-300 mb-6">
          Nosso diagnóstico inclui análise completa do seu product-market fit, 
          identificação de gaps e roadmap para alcançar PMF verdadeiro.
        </p>
        <Button size="lg" className="bg-indigo-600 hover:bg-indigo-700 text-white">
          Solicitar Diagnóstico Gratuito
          <ArrowRight className="ml-2 w-5 h-5" />
        </Button>
      </div>
    </article>
  );
};

export default ProductMarketFitArticle;