
import { useState } from 'react';
import { Target, Search, BarChart3, AlertOctagon, CheckCircle2, TrendingUp, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import StrategicContext from '../components/StrategicContext';
import KeyTakeaways from '../components/KeyTakeaways';
import ConceptDefinition from '../components/ConceptDefinition';
import RedFlags from '../components/RedFlags';
import StrategicConclusion from '../components/StrategicConclusion';

const ProductMarketFitArticle = ({ onCTAClick }: { onCTAClick?: () => void }) => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const pmfSignals = [
    {
      title: "A Regra dos 40% (Sean Ellis)",
      description: "Se 40% dos seus usuários disserem que ficariam 'Muito Desapontados' se seu produto sumisse, você tem PMF.",
      icon: <BarChart3 className="w-6 h-6 text-revgreen" />
    },
    {
      title: "Crescimento Orgânico Real",
      description: "Você parou o marketing e os leads continuam chegando por indicação (Word of Mouth).",
      icon: <TrendingUp className="w-6 h-6 text-revgreen" />
    },
    {
      title: "Retenção Flat (Smile Curve)",
      description: "Sua curva de retenção de coorte estabiliza em algum ponto (não vai a zero).",
      icon: <Target className="w-6 h-6 text-revgreen" />
    }
  ];

  const templates = [
    {
      name: "Survey de PMF (Superhuman)",
      subject: "A única pergunta que importa",
      body: `Pergunta 1: Como você se sentiria se não pudesse mais usar o [Produto]?
[ ] Muito desapontado
[ ] Um pouco desapontado
[ ] Não ficaria desapontado

Pergunta 2: Que tipo de pessoa mais se beneficia do [Produto]?
(Isso ajuda a definir seu ICP real)

Pergunta 3: Qual é o principal benefício que você recebe?
(Isso define sua Proposta de Valor real)`
    },
    {
      name: "Email de Feedback (Anti-Churn)",
      subject: "O que faltou para você amar o [Produto]?",
      body: `Oi [Nome],

Vi que você cancelou sua conta. Zero ressentimentos.

Estou tentando entender onde erramos para melhorar o produto.

Se você pudesse mudar UMA coisa no [Produto] que faria você voltar hoje, o que seria?

Sua resposta vai direto para o meu Slack pessoal.

Abs,
[Founder]`
    }
  ];

  return (
    <article className="w-full mx-auto">
      <div className="prose prose-base md:prose-lg lg:prose-xl max-w-none text-gray-900 leading-relaxed font-sans">

        <StrategicContext label="O Mito do Momento Eureca">
          Fundadores acham que o Product-Market Fit (PMF) é um evento binário: ou você tem, ou não tem. Errado. PMF é um espectro. Você pode ter "Weak PMF" (clientes pagam mas cancelam rápido) ou "Strong PMF" (clientes pagam e trazem amigos). E o mais perigoso: Você pode perder o PMF se o mercado mudar.
        </StrategicContext>

        <KeyTakeaways
          title="Key Takeaways (PMF Reality)"
          items={[
            { title: "PMF não é Vendas", description: "Vender gelo para esquimó é habilidade de vendas, não PMF. PMF é quando o mercado puxa o produto da sua mão (Market Pull)." },
            { title: "Niche to Win", description: "É impossível ter PMF em um mercado genérico no início. Domine um nicho pequeno obsessivamente antes de expandir (Ex: Facebook em Harvard)." },
            { title: "Retenção > Aquisição", description: "Se você enche um balde furado, você não tem PMF, você tem burn rate e marketing eficiente." },
            { title: "O Preço valida o Valor", description: "Se o cliente adora o produto mas reclama do preço, você não resolve uma dor forte o suficiente. PMF verdadeiro tem elasticidade de preço." }
          ]}
        />

        <ConceptDefinition
          concept="Product-Market Fit"
          definition="Estar em um bom mercado com um produto que pode satisfazer aquele mercado."
          amateurView="Ter muitos usuários cadastrados."
          proView="Quando a demanda pelo produto excede sua capacidade de entrega, e a retenção se mantém estável."
        />

        <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-6">3 Sinais Científicos de PMF</h2>
        <div className="grid md:grid-cols-3 gap-6 mb-12 not-prose">
          {pmfSignals.map((item, i) => (
            <Card key={i} className="p-6 bg-white border border-gray-200 hover:border-revgreen/50 transition-colors shadow-sm">
              <div className="bg-zinc-900 p-3 rounded-full w-fit mb-4 border border-zinc-800">
                {item.icon}
              </div>
              <h3 className="font-bold text-gray-900 mb-2">{item.title}</h3>
              <p className="text-sm text-gray-600 mb-0 leading-relaxed">{item.description}</p>
            </Card>
          ))}
        </div>

        <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-6">Como Medir (Templates)</h2>
        <div className="space-y-8 mb-16">
          {templates.map((template, index) => (
            <div key={index} className="bg-zinc-950 text-gray-300 p-8 rounded-xl border border-zinc-800 shadow-xl not-prose">
              <div className="flex justify-between items-start mb-6 border-b border-zinc-800 pb-4">
                <div>
                  <h3 className="text-white font-bold text-lg">{template.name}</h3>
                  <p className="text-xs text-gray-500 font-mono mt-1">{template.subject}</p>
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
              <pre className="font-mono text-sm leading-relaxed whitespace-pre-wrap text-emerald-100/90 font-light">
                {template.body}
              </pre>
            </div>
          ))}
        </div>

        <RedFlags
          title="Ilusões de PMF (Falso Positivo)"
          flags={[
            "Imprensa e Hype: Sair na Forbes não é PMF. É ego.",
            "Investimento VC: Levantar R$ 10M não valida o produto, valida seu pitch.",
            "Parcerias Grandes: Fechar com a Microsoft pode ser ótimo, mas se o usuário final não usa, é 'Contract-Market Fit', não Product-Market Fit."
          ]}
        />

        <StrategicConclusion
          title="PMF é uma Jornada, não um Destino"
          description="O mercado muda. Novos concorrentes surgem. IA aparece. O PMF de ontem não garante o de amanhã. Esteja sempre medindo a satisfação do seu Core User."
          ctaText="Diagnóstico de Product-Market Fit"
          onCTAClick={onCTAClick}
        />
      </div>
    </article>
  );
};

export default ProductMarketFitArticle;