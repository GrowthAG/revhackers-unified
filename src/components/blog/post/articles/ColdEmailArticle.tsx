
import { useState } from 'react';
import { Mail, Zap, ShieldCheck, CheckCircle2, TrendingUp, AlertTriangle, Fingerprint, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import StrategicContext from '../components/StrategicContext';
import KeyTakeaways from '../components/KeyTakeaways';
import ConceptDefinition from '../components/ConceptDefinition';
import RedFlags from '../components/RedFlags';
import StrategicConclusion from '../components/StrategicConclusion';

const ColdEmailArticle = ({ onCTAClick }: { onCTAClick?: () => void }) => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const strategies = [
    {
      title: "Hyper-Personalização (Trigger-Based)",
      description: "Esqueça 'Vi seu site e achei legal'. Use gatilhos reais: Vagas abertas, Funding, Notícias de PR.",
      example: "Observação: 'Vi que abriram vaga para VP de Vendas'. E-mail: 'A chegada do novo VP sugere expansão em Outbound...'",
      results: "32% taxa de resposta vs 3% da média de mercado."
    },
    {
      title: "Problem-Agitation-Solution (PAS)",
      description: "Apresente um problema específico que eles provavelmente têm, agite a dor e mostre o caminho.",
      example: "'Empresas de SaaS perdem 23% dos leads qualificados na passagem de bastão MKT-Vendas. Isso representa R$ 200k/mês no seu volume...'",
      results: "+45% em taxa de abertura e curiosidade."
    },
    {
      title: "O 'Break-Up' Email Estratégico",
      description: "O último email da cadência não é para chorar, é para qualificar através da retirada.",
      example: "'Estou assumindo que [Processo X] não é prioridade agora, então vou parar de insistir para não lotar sua caixa. Se mudar de ideia, estou por aqui.'",
      results: "O email que mais gera 'Ressurreição' de leads (24%)."
    }
  ];

  const templates = [
    {
      name: "The Insight Opener (Para C-Level)",
      subject: "{{company}} e problemas de escala em {{area}}",
      body: `Oi {{first_name}},

Vi no seu relatório anual que a prioridade para 2025 é {{strategic_goal}}.

Geralmente, empresas de {{industry}} enfrentam um gargalo invisível quando tentam isso: {{specific_problem}}.

Ajudamos a {{competitor}} a resolver exatamente isso aplicando o framework {{methodology}}, o que gerou {{result}}.

Faz sentido eu enviar um mini-audit (2 min de vídeo) mostrando como isso se aplica à {{company}}?

Abs,
{{my_name}}`
    },
    {
      name: "The 'Referral' (Top-Down)",
      subject: "Quem é o responsável por {{area}}?",
      body: `Oi {{first_name}},

Estou tentando falar com a pessoa responsável por melhorar a eficiência de {{process}} na {{company}}.

Poderia me apontar a direção certa?

Geralmente é o Diretor de Operações ou o próprio CEO.

Obrigado pela ajuda,
{{my_name}}`
    }
  ];

  const deliverabilityChecklist = [
    "SPF, DKIM e DMARC Configurados (Obrigatório)",
    "Domínio aquecido (Warmup) por no mínimo 30 dias",
    "Listas Limpas (Bounce rate abaixo de 2% ou bloqueio)",
    "CTAs de baixo atrito ('Interesse?' em vez de 'Reunião?')",
    "Texto simples (Plain Text) > HTML bonitinho"
  ];

  return (
    <article className="w-full mx-auto">
      <div className="prose prose-base md:prose-lg lg:prose-xl max-w-none text-zinc-900 leading-relaxed font-sans">

        <StrategicContext label="O Novo Jogo do Outbound">
          <p>
            Até 2022, era possível escalar Cold Email apenas aumentando o volume. "Spray and Pray" funcionava. Em 2025m com as novas regras de IA do Google/Outlook e filtros de spam agressivos, volume é suicídio.
          </p>
          <p className="mt-4">
            O jogo mudou de <strong>Quantidade</strong> para <strong>Relevância Extrema</strong>. Se o seu email não parece ter sido escrito 1:1, ele nem chega na caixa de entrada.
          </p>
        </StrategicContext>

        <KeyTakeaways
          title="Key Takeaways (Outbound 2.0)"
          items={[
            { title: "Entregabilidade é Rei", description: "Sem configuração técnica perfeita (DKIM/SPF), você é invisível. A reputação do seu domínio é seu ativo mais valioso." },
            { title: "Personalização Relevante", description: "Personalizar o 'Nome' não conta mais. Você precisa contextualizar o 'Porquê' do contato agora." },
            { title: "Baixo Atrito (CTA)", description: "Pare de pedir 30 min na agenda. Peça validação do problema ou interesse no tema. Venda a conversa, não o produto." },
            { title: "Multicanalidade", description: "Cold Email isolado morre. Combine com LinkedIn, Telefone e Social Selling para cercar o lead." }
          ]}
        />

        <ConceptDefinition
          concept="Cold Email vs Spam"
          definition="Cold Email é uma mensagem comercial enviada para um desconhecido, mas altamente direcionada, pesquisada e focada em resolver uma dor provável daquele cargo/indústria."
          amateurView="Comprar uma lista de 10.000 emails e enviar a mesma mensagem genérica 'Compre meu serviço' para todos."
          proView="Selecionar 50 empresas ideais (ICP), pesquisar seus desafios recentes e mandar um email sob medida que agrega valor antes de pedir algo."
        />

        <h2 className="text-2xl font-bold text-zinc-900 mt-12 mb-6">Por que Cold Email ainda é a melhor máquina de ROI?</h2>
        <p>
          Apesar do ruído, o email frio continua gerando um <strong>ROI 4x maior</strong> que mídias pagas para vendas complexas de alto ticket. Por quê? Porque ele é direto, escalável e, se bem feito, cria um relacionamento pessoal com o decisor.
        </p>
        <p>
          Enquanto no anúncio você espera o cliente levantar a mão, no Cold Email você escolhe quem quer atender. É o controle total da sua receita.
        </p>

        <h2 className="font-bold text-zinc-900 mb-8 mt-16 flex items-center gap-3">
          <Zap className="w-6 h-6 text-revgreen" />
          3 Estratégias que Sobreviveram a 2025
        </h2>

        <div className="space-y-12 mb-16">
          {strategies.map((strategy, index) => (
            <div key={index} className="bg-white border border-zinc-200 p-8 shadow-sm transition-shadow">
              <h3 className="text-xl font-bold text-zinc-900 mb-4 flex items-center gap-3">
                <span className="w-8 h-8 bg-zinc-900 text-white flex items-center justify-center text-sm font-bold">{index + 1}</span>
                {strategy.title}
              </h3>
              <p className="text-zinc-700 mb-6 font-medium">
                {strategy.description}
              </p>
              <div className="bg-zinc-50 p-6 border border-zinc-100">
                <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Exemplo Real</h4>
                <p className="text-zinc-600 text-sm font-mono leading-relaxed italic">"{strategy.example}"</p>
              </div>
              <div className="mt-4 flex items-center gap-2 text-sm text-emerald-700 font-bold">
                <TrendingUp className="w-4 h-4" />
                Impacto: {strategy.results}
              </div>
            </div>
          ))}
        </div>

        <RedFlags
          title="Por que seus emails vão para o Spam? (Sinais)"
          flags={[
            "Você usa linguagem de promoção ('Oferta', 'Grátis', 'Compre', 'Melhor preço').",
            "Seu email tem mais HTML/Imagens do que texto (Parece marketing, não conversa).",
            "Você envia mais de 50 emails por dia da mesma conta sem aquecimento.",
            "Você coloca links e anexos logo no primeiro email (Gatilho imediato de filtro)."
          ]}
        />

        <div className="my-16 bg-neutral-900 text-white p-8 not-prose">
          <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-revgreen" />
            Checklist de Entregabilidade Blindada
          </h3>
          <div className="grid md:grid-cols-2 gap-4">
            {deliverabilityChecklist.map((item, i) => (
              <div key={i} className="flex items-start gap-3 p-3 border border-white/10 rounded bg-white/5">
                <CheckCircle2 className="w-5 h-5 text-revgreen mt-0.5 shrink-0" />
                <span className="text-sm font-medium text-zinc-300">{item}</span>
              </div>
            ))}
          </div>
        </div>

        <h2 className="font-bold text-zinc-900 mb-8 mt-16 flex items-center gap-3">
          <Mail className="w-6 h-6 text-revgreen" />
          Templates Prontos para Uso
        </h2>

        <div className="grid md:grid-cols-2 gap-8 mb-16">
          {templates.map((template, index) => (
            <Card key={index} className="bg-zinc-950 border-zinc-800 text-zinc-300 overflow-hidden shadow-sm">
              <div className="p-4 border-b border-white/10 flex justify-between items-center bg-white/5">
                <div className="text-xs font-mono text-revgreen uppercase tracking-wider font-bold truncate pr-4">
                  {template.name}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleCopy(template.body, index)}
                  className="h-7 text-xxs uppercase font-bold text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
                >
                  {copiedIndex === index ? (
                    <span className="flex items-center gap-1 text-revgreen"><CheckCircle2 className="w-3 h-3" /> Copiado</span>
                  ) : (
                    <span className="flex items-center gap-1"><Copy className="w-3 h-3" /> Copiar</span>
                  )}
                </Button>
              </div>
              <div className="p-6 font-mono text-xs leading-relaxed whitespace-pre-wrap opacity-90">
                {template.body}
              </div>
            </Card>
          ))}
        </div>

        <StrategicConclusion
          title="Quer escalar sem cair no Spam?"
          description="Ajudamos empresas B2B a montar máquinas de prospecção que geram 20+ reuniões qualificadas/mês. Diagnóstico, Setup Técnico e Playbooks."
          ctaText="Montar minha Máquina de Outbound"
          onCTAClick={onCTAClick}
        />

      </div>
    </article>
  );
};

export default ColdEmailArticle;