
import { useState } from 'react';
import { Calculator, TrendingDown, DollarSign, AlertCircle, CheckCircle2, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import StrategicContext from '../components/StrategicContext';
import KeyTakeaways from '../components/KeyTakeaways';
import ConceptDefinition from '../components/ConceptDefinition';
import RedFlags from '../components/RedFlags';
import StrategicConclusion from '../components/StrategicConclusion';

const LTVCACArticle = ({ onCTAClick }: { onCTAClick?: () => void }) => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const calculationMistakes = [
    {
      title: "Ignorar o Churn",
      description: "Calcular LTV infinito. Se seu churn é 5%, seu cliente dura no máximo 20 meses.",
      fix: "Fórmula correta: (ARPU / Churn Rate)"
    },
    {
      title: "CAC Blended (A Ilusão)",
      description: "Misturar leads orgânicos com pagos. Isso esconde que seu Paid Media está dando prejuízo.",
      fix: "Calcule 'Paid CAC' separadamente do 'Blended CAC'."
    },
    {
      title: "Gross Margin Esquecida",
      description: "Usar a receita total no LTV, esquecendo que você tem custo de servidor e suporte.",
      fix: "Multiplique o LTV pela Margem Bruta (Gross Margin)."
    }
  ];

  const templates = [
    {
      name: "Calculadora Rápida de Unit Economics",
      subject: "Use para validar canais de aquisição",
      body: `Passo 1: Custo por Aquisição (CAC)
Gastou R$ 10.000 em Ads.
Gerou 50 Clientes.
CAC = R$ 200,00.

Passo 2: Valor do Cliente (LTV)
Mensalidade (ARPU): R$ 100,00.
Margem Bruta: 80% (R$ 80,00 líquidos).
Churn Mensal: 5% (O cliente fica 20 meses).
LTV = R$ 80,00 x 20 = R$ 1.600,00.

Passo 3: A Razão Mágica
LTV / CAC = 1.600 / 200 = 8x.
(Isso é excelente. Você pode gastar mais para crescer mais rápido).`
    }
  ];

  return (
    <article className="w-full mx-auto">
      <div className="prose prose-base md:prose-lg lg:prose-xl max-w-none text-gray-900 leading-relaxed font-sans">

        <StrategicContext label="O Cemitério das Startups">
          Muitas empresas quebram com LTV:CAC de 5x ou 10x. Por quê? <strong>Payback Period</strong>. Se você gasta R$ 1.000 para trazer um cliente que paga R$ 50/mês, você leva 20 meses para recuperar o dinheiro. Se você crescer rápido demais nesse modelo, vai quebrar o caixa antes do lucro chegar. Cash is King.
        </StrategicContext>

        <KeyTakeaways
          title="Key Takeaways (Unit Economics)"
          items={[
            { title: "Payback > LTV:CAC", description: "Para empresas bootstrap ou early-stage, recupere o CAC em menos de 12 meses (Ideal: < 6 meses). Sobrevivência vem antes de eficiência." },
            { title: "O CAC nunca para de subir", description: "Canais saturam. O Google Ads de hoje é 3x mais caro que há 5 anos. Se sua única estratégia é comprar tráfego, você tem data de validade." },
            { title: "Retenção é o novo CAC", description: "Aumentar o LTV é mais barato que diminuir o CAC. Reduzir o Churn pela metade dobra seu LTV automaticamente." },
            { title: "Não misture os CACs", description: "Não use leads de indicação (custo zero) para mascarar o prejuízo do LinkedIn Ads. Meça canais separadamente." }
          ]}
        />

        <ConceptDefinition
          concept="LTV:CAC Ratio"
          definition="A relação entre quanto valor um cliente gera (Lifetime Value) e quanto custou para trazê-lo (Customer Acquisition Cost)."
          amateurView="Quanto maior, melhor."
          proView="3:1 é o padrão saudável. Acima de 5:1, você está investindo pouco em crescimento. Abaixo de 1:1, você está pagando para trabalhar."
        />

        <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-6">3 Erros que Mascaram a Realidade</h2>
        <div className="grid md:grid-cols-3 gap-6 mb-12 not-prose">
          {calculationMistakes.map((item, i) => (
            <Card key={i} className="p-6 bg-white border border-gray-200 hover:border-revgreen/50 transition-colors shadow-sm">
              <AlertCircle className="w-8 h-8 text-red-500 mb-4" />
              <h3 className="font-bold text-gray-900 mb-2">{item.title}</h3>
              <p className="text-sm text-gray-600 mb-4">{item.description}</p>
              <div className="text-xs bg-gray-50 p-2 rounded border border-gray-100 text-gray-700 font-mono font-bold flex gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />
                {item.fix}
              </div>
            </Card>
          ))}
        </div>

        <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-6">Calculando na Prática</h2>
        <div className="space-y-8 mb-16">
          {templates.map((template, index) => (
            <div key={index} className="bg-zinc-900 text-gray-300 p-8 rounded-xl border border-zinc-800 shadow-xl not-prose relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-revgreen/10 rounded-full blur-2xl -mr-16 -mt-16 pointer-events-none"></div>
              <div className="flex justify-between items-start mb-6 border-b border-zinc-800 pb-4 relative z-10">
                <div>
                  <h3 className="text-white font-bold text-lg flex items-center gap-2">
                    <Calculator className="w-5 h-5 text-revgreen" />
                    {template.name}
                  </h3>
                  <p className="text-xs text-gray-500 mt-1">{template.subject}</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleCopy(template.body, index)}
                  className="text-revgreen hover:text-revgreen hover:bg-revgreen/10"
                >
                  {copiedIndex === index ? "Copiado" : "Copiar"}
                </Button>
              </div>
              <pre className="font-mono text-sm leading-relaxed whitespace-pre-wrap text-emerald-100/90 font-light relative z-10">
                {template.body}
              </pre>
            </div>
          ))}
        </div>

        <div className="my-16 bg-gray-50 p-8 rounded-xl not-prose border border-gray-200">
          <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <TrendingDown className="w-6 h-6 text-red-500" />
            Como consertar um LTV:CAC ruim?
          </h3>
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h4 className="font-bold text-gray-900 mb-2 uppercase text-xs tracking-wider">Opção 1: Aumentar LTV</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• Aumentar preço (Pricing Power)</li>
                <li>• Upsell/Cross-sell (Expansion)</li>
                <li>• Reduzir Churn (Customer Success)</li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-gray-900 mb-2 uppercase text-xs tracking-wider">Opção 2: Reduzir CAC</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• Otimizar conversão de Landing Page (CRO)</li>
                <li>• Mudar para canais orgânicos (SEO/Content)</li>
                <li>• Melhorar qualificação de leads (Menos lixo no funil)</li>
              </ul>
            </div>
          </div>
        </div>

        <StrategicConclusion
          title="Métricas são Bússolas, não Objetivos"
          description="O objetivo não é ter o melhor LTV:CAC do mundo. O objetivo é construir um negócio sustentável que resolve problemas reais. Use as métricas para não bater o navio, mas não esqueça de olhar para o horizonte (Estratégia)."
          ctaText="Auditoria de Unit Economics"
          onCTAClick={onCTAClick}
        />
      </div>
    </article>
  );
};

export default LTVCACArticle;