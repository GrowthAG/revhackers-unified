
import { useState } from 'react';
import { Target, Search, Users, ShieldCheck, CheckCircle2, TrendingUp, AlertTriangle, Filter, Copy, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import StrategicContext from '../components/StrategicContext';
import KeyTakeaways from '../components/KeyTakeaways';
import ConceptDefinition from '../components/ConceptDefinition';
import RedFlags from '../components/RedFlags';
import StrategicConclusion from '../components/StrategicConclusion';

const LinkedInNavigatorArticle = ({ onCTAClick }: { onCTAClick?: () => void }) => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const strategies = [
    {
      title: "O Filtro Invisível (Intent Signals)",
      description: "Amadores filtram por cargo. Profissionais filtram por gatilhos de compra.",
      example: "Filtro: (CMO) + Empresa cresceu >20% em headcount + Postou nos últimos 30 dias + Segue a página da sua empresa.",
      results: "Lista saiu de 5.000 (fria) para 43 nomes (quente)."
    },
    {
      title: "Boolean Search: A Linguagem Secreta",
      description: "Use operadores lógicos (AND, OR, NOT) para eliminar ruído e achar quem ninguém acha.",
      example: "'SaaS' AND (Founder OR CEO) AND NOT 'Consultant' AND NOT 'Agency'. Isso limpa os 'solopreneurs' da lista.",
      results: "Economia de 5h/semana em prospecção manual."
    },
    {
      title: "Account Map e 'Save as Lead'",
      description: "Não conecte imediatamente. Salve como lead e monitore. O Sales Navigator te avisa quando ele posta.",
      example: "O lead postou sobre 'Desafios de Recrutamento'. Esse é o seu gancho para conectar (em vez de um pitch genérico).",
      results: "Taxa de aceite de conexão sobe para 60%."
    }
  ];

  const templates = [
    {
      name: "Connect Request (Contextual)",
      subject: "Nota de Conexão",
      body: `Oi {{first_name}}, vi seu post sobre {{topic}}.

Achei muito interessante o ponto sobre {{specific_point}}.

Estou acompanhando de perto esse mercado. Adoraria conectar.`
    },
    {
      name: "2nd Message (Value Drop)",
      subject: "Mensagem pós-aceite",
      body: `Valeu pela conexão, {{first_name}}!

A propósito, expandindo aquele ponto sobre {{topic}}:

Acabamos de lançar um estudo sobre como empresas de {{industry}} estão resolvendo isso. 

Se fizer sentido, te mando o PDF por aqui (sem compromisso).

Abs,`
    }
  ];

  const workflow = [
    "KPI: SSI (Social Selling Index) > 70",
    "Limite de 25 conexões/dia (Segurança)",
    "Use 'Saved Searches' para alertas diários",
    "Integração CRM ativa (Sync de inmails)",
    "Filtro Spotlight: 'Changed Jobs in past 90 days'"
  ];

  return (
    <article className="w-full mx-auto">
      <div className="prose prose-base md:prose-lg lg:prose-xl max-w-none text-zinc-900 leading-relaxed font-sans">

        <StrategicContext label="A Verdade sobre o Sales Nav">
          <p>
            O LinkedIn Sales Navigator não é uma "lista telefônica de luxo". Ele é um <strong>radar de comportamento de compra</strong>.
          </p>
          <p className="mt-4">
            A maioria dos vendedores usa o SN apenas para encontrar emails. Isso é subutilizar a ferramenta mais poderosa do B2B. O verdadeiro valor está em identificar <strong>quem está pronto para comprar agora</strong>, baseado em sinais invisíveis na versão gratuita.
          </p>
        </StrategicContext>

        <KeyTakeaways
          title="Key Takeaways (Prospecção Moderna)"
          items={[
            { title: "Mire no Movimento", description: "Empresas estagnadas não compram. Use filtros de 'Crescimento de Headcount' e 'Vagas Abertas' para achar quem tem budget." },
            { title: "Personalização Reativa", description: "Monitore a atividade do lead (posts, mudanças de cargo) e use isso como gancho. Nunca prospecte 'a frio' no LinkedIn." },
            { title: "Limpe sua Lista", description: "Use operadores booleanos (NOT, AND) para excluir consultores, agências e perfis irrelevantes que sujam seu pipeline." },
            { title: "Social Selling", description: "O objetivo da conexão não é vender, é iniciar uma conversa. Venda a reunião, não o produto." }
          ]}
        />

        <ConceptDefinition
          concept="Busca Ativa vs Monitoramento Passivo"
          definition="Amadores fazem buscas ativas todos os dias. Profissionais configuram 'Saved Searches' e deixam o Navigator trabalhar para eles, recebendo alertas diários de novos leads que batem com o critério."
          amateurView="Passar 2 horas por dia procurando perfis manualmente."
          proView="Receber uma lista diária de 5 leads novos no email que acabaram de entrar no seu ICP (ex: Novo Diretor de MKT em empresa de Varejo)."
        />

        <h2 className="text-2xl font-bold text-zinc-900 mt-12 mb-6">Por que Pagar por isso?</h2>
        <p>
          A busca gratuita do LinkedIn é limitada comercialmente (limite de visualizações, sem filtros avançados). O Sales Navigator desbloqueia o <strong>Grafo Econômico</strong> completo.
        </p>
        <p>
          Se você vende B2B e seu ticket é &gt; R$ 5k, uma única venda paga a licença anual. O ROI é matemático.
        </p>

        <h2 className="font-bold text-zinc-900 mb-8 mt-16 flex items-center gap-3">
          <Filter className="w-6 h-6 text-revgreen" />
          3 Táticas para achar "Ouro"
        </h2>

        <div className="space-y-12 mb-16">
          {strategies.map((strategy, index) => (
            <div key={index} className="bg-white border border-zinc-200 p-8 rounded-xl shadow-sm transition-shadow">
              <h3 className="text-xl font-bold text-zinc-900 mb-4 flex items-center gap-3">
                <span className="w-8 h-8 rounded-full bg-zinc-900 text-white flex items-center justify-center text-sm font-bold">{index + 1}</span>
                {strategy.title}
              </h3>
              <p className="text-zinc-700 mb-6 font-medium">
                {strategy.description}
              </p>
              <div className="bg-zinc-50 p-6 rounded-lg border border-zinc-100">
                <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Exemplo Prático</h4>
                <p className="text-zinc-600 text-sm font-mono leading-relaxed italic">"{strategy.example}"</p>
              </div>
              <div className="mt-4 flex items-center gap-2 text-sm text-emerald-700 font-bold">
                <Search className="w-4 h-4" />
                Impacto: {strategy.results}
              </div>
            </div>
          ))}
        </div>

        <RedFlags
          title="Erros que queimam seu perfil (LinkedIn Jail)"
          flags={[
            "Enviar mais de 50 conexões por dia (O algoritmo vai te bloquear).",
            "Usar ferramentas de automação não-oficiais (Chrome Extensions baratas).",
            "Vender no primeiro, segundo ou terceiro inbox. Pitch só vem depois do rapport.",
            "Não ter um perfil otimizado (Foto ruim, Headline confusa) - Ninguém aceita conexão de bot."
          ]}
        />

        <div className="my-16 bg-zinc-900 text-white p-8 rounded-xl not-prose">
          <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-revgreen" />
            Checklist Diário do SDR
          </h3>
          <div className="grid md:grid-cols-2 gap-4">
            {workflow.map((item, i) => (
              <div key={i} className="flex items-start gap-3 p-3 border border-white/10 rounded bg-white/5">
                <CheckCircle2 className="w-5 h-5 text-revgreen mt-0.5 shrink-0" />
                <span className="text-sm font-medium text-zinc-300">{item}</span>
              </div>
            ))}
          </div>
        </div>

        <h2 className="font-bold text-zinc-900 mb-8 mt-16 flex items-center gap-3">
          <MessageSquare className="w-6 h-6 text-revgreen" />
          Templates de Conexão (Human-First)
        </h2>

        <div className="grid md:grid-cols-2 gap-8 mb-16">
          {templates.map((template, index) => (
            <Card key={index} className="bg-white border-zinc-200 text-zinc-800 overflow-hidden shadow-sm transition-shadow">
              <div className="p-4 border-b border-zinc-100 flex justify-between items-center bg-zinc-50">
                <div className="text-xs font-mono text-revgreen uppercase tracking-wider font-bold truncate pr-4">
                  {template.name}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleCopy(template.body, index)}
                  className="h-7 text-[10px] uppercase font-bold text-zinc-500 hover:text-revgreen hover:bg-white transition-colors"
                >
                  {copiedIndex === index ? (
                    <span className="flex items-center gap-1 text-revgreen"><CheckCircle2 className="w-3 h-3" /> Copiado</span>
                  ) : (
                    <span className="flex items-center gap-1"><Copy className="w-3 h-3" /> Copiar</span>
                  )}
                </Button>
              </div>
              <div className="p-6 font-mono text-xs leading-relaxed whitespace-pre-wrap">
                {template.body}
              </div>
            </Card>
          ))}
        </div>

        <StrategicConclusion
          title="Pare de caçar no escuro"
          description="O Sales Navigator é poderoso, mas exige método. Transforme seu LinkedIn em uma fonte previsível de receita."
          ctaText="Treinamento de Social Selling"
          onCTAClick={onCTAClick}
        />

      </div>
    </article>
  );
};

export default LinkedInNavigatorArticle;