import { Mail, Target, TrendingUp, AlertTriangle, CheckCircle, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';

const ColdEmailArticle = () => {
  const strategies = [
    {
      title: "Hyper-Personalização Baseada em Gatilhos",
      description: "Vá além do nome da empresa. Use eventos específicos como contratações, expansões, funding rounds.",
      example: "Vi que a [Empresa] acabou de abrir 15 vagas para o time comercial. Isso sugere uma expansão agressiva...",
      results: "32% taxa de resposta vs 3% do cold email genérico"
    },
    {
      title: "O Método 'Problem Before Solution'",
      description: "Apresente um problema específico que eles provavelmente não sabem que têm.",
      example: "A maioria das empresas de [setor] perde 23% dos leads qualificados entre MQL e SQL...",
      results: "+45% em taxa de abertura"
    },
    {
      title: "Social Proof Específico",
      description: "Use casos de empresas similares com métricas específicas.",
      example: "Ajudamos a [Empresa Similar] a reduzir CAC em 34% mantendo a mesma qualidade de leads...",
      results: "2.8x mais conversões para call"
    },
    {
      title: "O CTA de 'Baixo Risco'",
      description: "Ofereça algo de valor sem compromisso antes de vender.",
      example: "Posso enviar o mesmo audit que fiz para [Competitor]? Sem compromisso.",
      results: "67% mais responses positivas"
    },
    {
      title: "Timing Estratégico",
      description: "Envie nos momentos certos baseado no comportamento do cargo.",
      example: "CFOs respondem 3x mais nas quartas às 10h. CMOs preferem sextas às 15h.",
      results: "28% aumento na taxa de resposta"
    },
    {
      title: "Follow-up com Valor Crescente",
      description: "Cada follow-up deve adicionar valor, não apenas insistir.",
      example: "PS: Anexei um mini-audit da sua landing page principal. 3 ajustes rápidos podem aumentar conversão em 15%.",
      results: "43% dos deals fecham no 4º follow-up"
    },
    {
      title: "O Poder do 'Pattern Interrupt'",
      description: "Quebre o padrão mental com abordagens inesperadas.",
      example: "Não quero vender nada hoje. Só quero te mostrar por que seus concorrentes estão crescendo 40% mais rápido.",
      results: "78% mais opens que subjects tradicionais"
    }
  ];

  const templates = [
    {
      name: "The Insight Opener",
      subject: "{{company}} pode estar perdendo {{percentage}}% dos leads qualificados",
      body: `Oi {{first_name}},

Notei que a {{company}} está investindo pesado em {{channel_observado}}.

A maioria das empresas de {{industry}} que fazem isso cometem um erro que custa caro: não conseguem conectar marketing com vendas de forma eficiente.

Isso resulta em ~{{percentage}}% dos MQLs virando SQLs de baixa qualidade.

Posso mostrar exatamente como resolver isso? O mesmo método que usamos na {{similar_company}} ({{result_achieved}}).

Quer que eu envie o diagnóstico que fiz da {{company}}?

{{signature}}`
    },
    {
      name: "The Case Study Hook",
      subject: "Como a {{similar_company}} cresceu {{growth_percentage}}% (case study)",
      body: `{{first_name}},

A {{similar_company}} tinha o mesmo desafio que vocês:
- {{pain_point_1}}
- {{pain_point_2}}
- {{pain_point_3}}

Em 90 dias ajudamos eles a:
✓ {{result_1}}
✓ {{result_2}}  
✓ {{result_3}}

Quer ver exatamente como fizemos isso?

Posso enviar o case completo + os templates que usamos.

{{signature}}`
    }
  ];

  return (
    <article className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-12">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl">
            <Mail className="w-6 h-6 text-white" />
          </div>
          <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
            Growth Tactics
          </span>
        </div>
        
        <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-6">
          Cold Email em 2025: as 7 estratégias que ainda funcionam
        </h1>
        
        <div className="flex items-center gap-6 text-gray-600 mb-8">
          <span>10 min de leitura</span>
          <span>•</span>
          <span>Marina Santos</span>
        </div>
        
        <p className="text-xl text-gray-700 leading-relaxed">
          Enquanto 90% dos profissionais lamentam que "cold email morreu", os 10% mais espertos 
          estão batendo recordes de resposta com estas estratégias contra-intuitivas.
        </p>
      </div>

      {/* Alerta sobre mudanças */}
      <Alert className="mb-12 border-orange-200 bg-orange-50">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          <strong>Atenção:</strong> As regras mudaram drasticamente em 2024. Gmail e Outlook implementaram 
          filtros de IA mais rigorosos. O que funcionava antes pode te mandar direto para spam hoje.
        </AlertDescription>
      </Alert>

      {/* Por que ainda funciona */}
      <div className="prose prose-lg max-w-none mb-12">
        <h2 className="text-3xl font-bold mb-6">Por que Cold Email ainda é o canal #1 para B2B</h2>
        <p>
          Dados de 2024 mostram que cold email ainda gera <strong>ROI 4x maior</strong> que qualquer outro canal 
          para vendas B2B complexas. O segredo? Não é quantidade, é relevância cirúrgica.
        </p>
        
        <div className="grid md:grid-cols-3 gap-6 my-8">
          <div className="bg-green-50 p-6 rounded-xl text-center">
            <div className="text-3xl font-bold text-green-600">4,400%</div>
            <div className="text-sm text-gray-600">ROI médio do email marketing</div>
          </div>
          <div className="bg-blue-50 p-6 rounded-xl text-center">
            <div className="text-3xl font-bold text-blue-600">89%</div>
            <div className="text-sm text-gray-600">Dos executivos checam email diariamente</div>
          </div>
          <div className="bg-purple-50 p-6 rounded-xl text-center">
            <div className="text-3xl font-bold text-purple-600">23%</div>
            <div className="text-sm text-gray-600">Taxa de resposta possível (com estratégia certa)</div>
          </div>
        </div>
      </div>

      {/* As 7 estratégias */}
      <div className="mb-16">
        <h2 className="text-3xl font-bold mb-8 flex items-center gap-3">
          <Target className="w-8 h-8 text-blue-600" />
          As 7 Estratégias que Funcionam em 2025
        </h2>
        
        <div className="space-y-8">
          {strategies.map((strategy, index) => (
            <Card key={index} className="border border-gray-200 hover:border-blue-300 transition-colors">
              <CardHeader>
                <CardTitle className="flex items-start gap-3">
                  <span className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">
                    {index + 1}
                  </span>
                  {strategy.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 mb-4">{strategy.description}</p>
                <div className="bg-gray-50 p-4 rounded-lg mb-4">
                  <p className="text-sm font-mono italic">"{strategy.example}"</p>
                </div>
                <div className="flex items-center gap-2 text-green-600">
                  <TrendingUp className="w-4 h-4" />
                  <span className="text-sm font-semibold">{strategy.results}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Templates testados */}
      <div className="mb-16">
        <h2 className="text-3xl font-bold mb-8">Templates Testados (10k+ envios)</h2>
        
        <div className="space-y-8">
          {templates.map((template, index) => (
            <Card key={index} className="border-l-4 border-l-green-500">
              <CardHeader>
                <CardTitle>{template.name}</CardTitle>
                <p className="text-sm text-gray-600">
                  <strong>Subject:</strong> {template.subject}
                </p>
              </CardHeader>
              <CardContent>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <pre className="text-sm whitespace-pre-wrap font-mono">
                    {template.body}
                  </pre>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Ferramentas recomendadas */}
      <Card className="mb-12">
        <CardHeader>
          <CardTitle>Stack de Ferramentas Recomendado</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-3">Prospecção & Dados</h4>
              <ul className="space-y-2 text-sm">
                <li>• <strong>Apollo:</strong> Base mais atualizada (2024)</li>
                <li>• <strong>Clay:</strong> Enriquecimento de dados com IA</li>
                <li>• <strong>ZoomInfo:</strong> Para empresas enterprise</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Envio & Automação</h4>
              <ul className="space-y-2 text-sm">
                <li>• <strong>Instantly:</strong> Melhor deliverability em 2024</li>
                <li>• <strong>Lemlist:</strong> Personalização avançada</li>
                <li>• <strong>Outreach:</strong> Para times grandes</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Erros fatais */}
      <Alert className="mb-12 border-red-200 bg-red-50">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          <strong>Erros que matam sua deliverability:</strong>
          <ul className="mt-2 space-y-1">
            <li>• Enviar de domínios novos (warmup mínimo 30 dias)</li>
            <li>• Usar palavras como "grátis", "desconto", "promoção"</li>
            <li>• Mais de 50 emails/dia por domínio</li>
            <li>• Links encurtados ou muitos links</li>
            <li>• Não personalizar além do nome</li>
          </ul>
        </AlertDescription>
      </Alert>

      {/* Checklist */}
      <Card className="mb-12 bg-gradient-to-r from-green-50 to-emerald-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="w-6 h-6 text-green-600" />
            Checklist Antes do Envio
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <input type="checkbox" className="rounded" />
                <span className="text-sm">Domínio com warmup de 30+ dias</span>
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" className="rounded" />
                <span className="text-sm">DKIM, SPF, DMARC configurados</span>
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" className="rounded" />
                <span className="text-sm">Personalização específica (não genérica)</span>
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" className="rounded" />
                <span className="text-sm">Subject line testado</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <input type="checkbox" className="rounded" />
                <span className="text-sm">CTA claro e específico</span>
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" className="rounded" />
                <span className="text-sm">Sequência de follow-up pronta</span>
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" className="rounded" />
                <span className="text-sm">Landing page para resposta</span>
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" className="rounded" />
                <span className="text-sm">Métricas de tracking configuradas</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* CTA */}
      <div className="bg-black text-white p-8 rounded-2xl text-center">
        <h3 className="text-2xl font-bold mb-4">
          Quer implementar essas estratégias na sua empresa?
        </h3>
        <p className="text-gray-300 mb-6">
          Nosso diagnóstico inclui análise da sua estratégia atual de cold email, 
          templates personalizados e setup completo de deliverability.
        </p>
        <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white">
          Solicitar Diagnóstico Gratuito
          <ArrowRight className="ml-2 w-5 h-5" />
        </Button>
      </div>
    </article>
  );
};

export default ColdEmailArticle;