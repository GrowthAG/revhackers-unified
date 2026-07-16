import { useState } from 'react';
import { ArrowRight, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import StrategicContext from '../components/StrategicContext';
import KeyTakeaways from '../components/KeyTakeaways';
import StrategicConclusion from '../components/StrategicConclusion';

const PolemicLedGrowthArticle = ({ onCTAClick }: { onCTAClick?: () => void }) => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const strategies = [
    {
      title: "O 'Inimigo Comum' (Defining the Anti-Hero)",
      description: "Posicionamento exige contraste. Defina claramente contra O QUE você luta na sua indústria.",
      example: "Exemplo: 'O Marketing de Esperança morreu'. Inimigo: Agências que prometem branding sem métricas.",
      results: "Cria tribo instantânea e repele clientes ruins."
    },
    {
      title: "O 'Data-Backed' Hot Take",
      description: "Opinião impopular sustentada por dados irrefutáveis. É a forma mais segura de polêmica.",
      example: "Exemplo: 'SDRs são inúteis sem Marketing (Dados de 50 empresas)'.",
      results: "Autoridade baseada em fatos, não em ego."
    },
    {
      title: "O Bastidor 'Feio' (Vulnerability)",
      description: "Mostre o erro, o prejuízo, a falha. A perfeição no LinkedIn cria desconfiança.",
      example: "Exemplo: 'Como perdi um contrato de R$ 50k por ego'.",
      results: "Humanização e confiança extrema."
    },
    {
      title: "A Previsão Contrariana",
      description: "Aposte contra o hype do momento com argumentos lógicos.",
      example: "Exemplo: 'Por que o ChatGPT vai piorar o SEO em 2025'.",
      results: "Posicionamento como 'Thought Leader'."
    }
  ];

  const templates = [
    {
      name: "Bio PLG (Alta Conversão)",
      subject: "Estrutura Recomendada",
      body: `[Headline]
Ajudo [ICP] a resolver [Problema Caro] através de [Mecanismo Único].
Ex-[Empresa de Autoridade] | [Número de Impacto] | [Link de Conversão]

[About]
A maioria tenta resolver [Problema] fazendo [Erro Comum].
Isso resulta em [Consequência Dolorosa].
Eu criei o método [Nome do Método] para garantir [Resultado].

→ Baixe meu framework gratuito aqui: [Link]`
    },
    {
      name: "Post 'The Industry Myth'",
      subject: "Template de Polêmica",
      body: `Dizem que você precisa de [Mito Comum] para ter sucesso em [Área].

Isso é uma mentira. E está custando caro.

A verdade? [Contraponto Real].

Analisei [Número] casos e descobri que [Dado Surpreendente].

Pare de focar em [Mito]. Comece a focar em [Verdade].

Concorda?`
    }
  ];

  const workflow = [
    { label: "PILAR 1", title: "Posicionamento Magnético", desc: "Clareza absoluta sobre quem você ajuda e qual problema caro você resolve. Se você fala para todos, não fala para ninguém." },
    { label: "PILAR 2", title: "Narrativa Proprietária", desc: "Não use os termos do concorrente. Crie seu próprio vocabulário (ex: 'Receita Previsível', 'Inbound', 'PLG')." },
    { label: "PILAR 3", title: "Prova Social Indireta", desc: "Não diga que é bom. Mostre bastidores, prints e números que provem que você é bom, sem arrogância." },
    { label: "PILAR 4", title: "Sistema de Atração", desc: "Seu perfil deve ter um funil claro: Topo (Viral) → Meio (Educativo) → Fundo (Conversão)." }
  ];

  return (
    <article className="w-full mx-auto">
      <div className="prose prose-base md:prose-lg lg:prose-xl max-w-none text-gray-900 leading-relaxed">

        <StrategicContext label="Atenção">
          Se ninguém discorda do que você diz, provavelmente ninguém está prestando atenção. O consenso gera conforto, o conflito gera crescimento.
        </StrategicContext>

        <KeyTakeaways
          title="Key Takeaways"
          items={[
            { title: "Invisibilidade é Opcional", description: "O algoritmo privilegia opiniões fortes. Isenção é irrelevância." },
            { title: "Polêmica ≠ Briga", description: "PLG é sobre desafiar ideias, não atacar pessoas. É um debate intelectual, não um ringue." },
            { title: "Tribalismo", description: "Ao definir um inimigo comum, você cria uma tribo fiel de seguidores que compartilham seus valores." },
            { title: "Conversão", description: "Autoridade sem oferta é vaidade. Seu perfil deve levar o tráfego para um destino ($)." }
          ]}
        />

        {/* Intro + Stats */}
        <div className="mb-16">
          <h2 id="intro" className="font-bold tracking-tight text-gray-900 mt-0">A Era da Autoridade Digital</h2>
          <p className="text-lg md:text-xl text-gray-600 leading-relaxed">
            Em um mar de conteúdo gerado por IA e "dicas de especialista" genéricas, a única coisa que não pode ser commoditizada é uma visão de mundo única e corajosa.
          </p>

          <div className="flex flex-col md:flex-row gap-8 my-10 border-y border-gray-200 py-8 not-prose">
            <div className="flex-1">
              <div className="text-4xl font-bold text-black mb-1">+326%</div>
              <div className="text-xs text-gray-500 uppercase tracking-widest font-medium">Oportunidades Inbound</div>
            </div>
            <div className="flex-1 md:border-l md:border-gray-200 md:pl-8">
              <div className="text-4xl font-bold text-black mb-1">92%</div>
              <div className="text-xs text-gray-500 uppercase tracking-widest font-medium">Aumento de Autoridade</div>
            </div>
            <div className="flex-1 md:border-l md:border-gray-200 md:pl-8">
              <div className="text-4xl font-bold text-black mb-1">43%</div>
              <div className="text-xs text-gray-500 uppercase tracking-widest font-medium">Maior Ticket Médio</div>
            </div>
          </div>
        </div>

        {/* Anatomy / Workflow - Definition List */}
        <div className="mb-20">
          <h2 id="anatomia" className="font-bold text-gray-900 mb-8">O Framework PLG (4 Pilares)</h2>
          <p className="text-gray-700 mb-8">Uma metodologia para transformar "likes" em contratos assinados.</p>

          <div className="not-prose grid gap-6">
            {workflow.map((item, i) => (
              <div key={i} className="flex flex-col md:flex-row gap-4 md:items-baseline border-b border-gray-100 pb-6 last:border-0 last:pb-0">
                <span className="text-xs font-bold text-black w-24 shrink-0 uppercase tracking-wider bg-gray-100 p-2 text-center rounded-sm">
                  {item.label}
                </span>
                <div>
                  <h4 className="font-bold text-gray-900 text-lg mb-1">{item.title}</h4>
                  <p className="text-gray-600 leading-relaxed m-0">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Strategies - Numbered List */}
        <div className="mb-20">
          <h2 id="estrategias" className="font-bold text-gray-900 mb-10">
            4 Arquétipos de Conteúdo Viral
          </h2>

          <div className="space-y-12">
            {strategies.map((strategy, index) => (
              <div key={index} className="pl-0">
                <h3 className="font-bold text-xl text-gray-900 mb-3 mt-0 flex items-baseline gap-3">
                  <span className="text-revgreen text-base font-normal">0{index + 1}.</span>
                  {strategy.title}
                </h3>
                <p className="text-gray-700 mb-4">{strategy.description}</p>

                <div className="bg-gray-50 border-l-2 border-gray-300 pl-4 py-2 italic text-gray-600 text-base mb-2">
                  "{strategy.example}"
                </div>

                <div className="text-sm font-medium text-black mt-2">
                  <span className="text-gray-500 font-normal mr-2">Resultado:</span>
                  {strategy.results}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Templates Grid */}
        <div className="mb-20">
          <h2 id="templates" className="font-bold text-gray-900 mb-10">Templates de Implementação</h2>

          <div className="grid md:grid-cols-2 gap-12">
            {templates.map((template, index) => (
              <div key={index} className="flex flex-col h-full">
                <div className="mb-4 border-b border-black pb-2">
                  <h3 className="font-bold text-lg text-gray-900">{template.name}</h3>
                  <div className="text-xs text-gray-500 font-mono mt-1">{template.subject}</div>
                </div>
                <div className="flex-1 bg-gray-50 p-6 rounded-sm text-sm font-mono text-gray-800 whitespace-pre-wrap leading-relaxed border border-gray-200">
                  {template.body}
                </div>
                <div className="mt-4 text-right">
                  <button
                    onClick={() => handleCopy(template.body, index)}
                    className="text-xs font-bold uppercase tracking-widest text-gray-900 hover:text-revgreen transition-colors"
                  >
                    {copiedIndex === index ? "Copiado!" : "Copiar Texto"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Checklist - Black Box */}
        <div className="mb-20 bg-neutral-900 text-white p-8 md:p-12">
          <div className="flex items-center gap-3 mb-8 border-b border-gray-800 pb-4">
            <ShieldCheck className="w-6 h-6 text-revgreen" />
            <h2 id="checklist" className="text-xl font-bold text-white m-0">Checklist de Auditoria de Perfil</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-x-12 gap-y-4">
            {[
              "Foto profissional (Fundo neutro, rosto iluminado)",
              "Banner de Autoridade (O que você faz + Prova Social)",
              "Headline Única (Benefício Claro, sem 'Open to Work')",
              "Seção 'Featured' com seus 3 melhores ativos/links",
              "About Storytelling (Jornada do Herói)",
              "Experiência Focada em Resultados (Números, não tarefas)",
              "Depoimentos Recentes (Prova Social)",
              "Link na Bio para captura de leads (Newsletter/Diagnóstico)"
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-3 py-2 border-b border-gray-800 last:border-0 text-gray-300">
                <span className="text-revgreen mt-1">✓</span>
                <span className="text-sm">{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Final */}
        <StrategicConclusion
          title="Seu perfil está invisível?"
          description="Pare de postar para o vazio. Agende um diagnóstico gratuito e descubra como ativar sua autoridade."
          ctaText="Diagnóstico de Autoridade"
          leadMagnetId="template"
          diagnosticPath="/score-founder"
          onCTAClick={onCTAClick}
        />

      </div>
    </article>
  );
};

export default PolemicLedGrowthArticle;