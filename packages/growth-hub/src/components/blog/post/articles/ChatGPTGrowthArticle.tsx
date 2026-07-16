import { useState } from 'react';
import { ArrowRight, ShieldCheck, Copy, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import StrategicContext from '../components/StrategicContext';
import KeyTakeaways from '../components/KeyTakeaways';

const ChatGPTGrowthArticle = ({ onCTAClick }: { onCTAClick?: () => void }) => {
  const [copiedPrompt, setCopiedPrompt] = useState<string | null>(null);

  const copyToClipboard = (text: string, promptName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedPrompt(promptName);
    setTimeout(() => setCopiedPrompt(null), 2000);
  };

  const strategies = [
    {
      title: "O Método 'Persona Embutida'",
      description: "O ChatGPT é genérico porque você não dá personalidade a ele. Comece sempre definindo QUEM ele é.",
      example: "Errado: 'Escreva um email'. Certo: 'Atue como um Copywriter Senior especializado em B2B SaaS...'",
      results: "Outputs 10x mais alinhados com o tom da marca."
    },
    {
      title: "Chain of Thought (Cadeia de Pensamento)",
      description: "Peça para a IA explicar o raciocínio antes de dar a resposta final. Isso reduz alucinações.",
      example: "'Antes de escrever o post, liste os 3 principais argumentos psicológicos que você vai usar e por quê.'",
      results: "Lógica blindada e argumentos persuasivos."
    },
    {
      title: "Constraint-Based Prompting",
      description: "A criatividade floresce com restrições. Limite o output para evitar textos prolixos e robóticos.",
      example: "'Use frases curtas. Sem advérbios. Máximo de 3 parágrafos. Fale como se estivesse num bar, não numa palestra.'",
      results: "Textos humanos, diretos e naturais."
    },
    {
      title: "Iterative Refinement (O Editor)",
      description: "Nunca aceite a primeira versão. Use o ChatGPT como editor do seu próprio trabalho.",
      example: "'Agora atue como um Editor Chefe crítico. Aponte 3 falhas nesse texto e reescreva a versão final corrigindo-as.'",
      results: "Polimento profissional instantâneo."
    }
  ];

  const templates = [
    {
      name: "1. Pesquisa de Dores (Persona)",
      subject: "Market Research Assistant",
      body: `Atue como um Especialista em Pesquisa de Mercado.

Crie uma tabela detalhada com as 10 maiores dores, medos e desejos secretos de [Cargo/Persona] na indústria de [Indústria].

Para cada dor, descreva:
1. O problema superficial (O que eles dizem)
2. O problema raiz (O que realmente causa)
3. O impacto emocional (Como se sentem)
4. Uma ideia de conteúdo para abordar isso.

Contexto: Meu produto ajuda a [Sua Solução].`
    },
    {
      name: "2. Cold Email Generator",
      subject: "Copywriting B2B",
      body: `Atue como um Copywriter de Resposta Direta focado em Cold Email.

Escreva 3 variações de um email de prospecção para [Cargo Alvo].

Objetivo: Agendar uma demo de 15 min.
Problema: [Problema que você resolve].
Solução: [Sua Solução].
Prova Social: [Seu Case/Cliente].

Regras:
- Máximo 75 palavras.
- Tom conversacional e intrigante (não vendedor).
- Foco neles, não em nós.
- Use a estrutura: Gancho -> Problema -> Solução -> CTA Suave.`
    },
    {
      name: "3. Content Repurposing",
      subject: "Multiplicador de Conteúdo",
      body: `Atue como um Estrategista de Conteúdo.

Transforme o texto abaixo (transcrição de vídeo) em:
1. Um post de LinkedIn viral (formato lista, gancho forte).
2. Uma Thread de Twitter/X (5 tweets).
3. Um script de Reels de 30 segundos.
4. Um email de newsletter focado em clique.

Texto Original:
[Cole seu texto aqui]`
    },
    {
      name: "4. Objeções & Vendas",
      subject: "Sales Trainer",
      body: `Atue como um Treinador de Vendas B2B Enterprise.

Eu estou vendendo [Produto] para [Persona]. O preço é [Preço].

O cliente acabou de dizer: "[Objeção Específica]".

Liste 5 maneiras diferentes de contornar essa objeção, usando:
1. Pergunta Socrática
2. Reframe de Valor
3. Case de Sucesso
4. Comparação de Custo de Inação
5. Empatia + Pivô

Mantenha o tom consultivo e profissional.`
    }
  ];

  const anatomy = [
    { label: "ROLE", title: "Atue como...", desc: "Defina a 'máscara'. Senior Copywriter, CFO, Consultor McKinsey? Isso define o vocabulário e a profundidade." },
    { label: "TASK", title: "Execute a...", desc: "O verbo de ação. Escreva, Analise, Resuma, Codifique. Seja específico sobre o entregável." },
    { label: "CONTEXT", title: "Para o público...", desc: "Quem vai ler? Onde será publicado? Qual o objetivo? Sem contexto, a IA alucina." },
    { label: "FORMAT", title: "No formato...", desc: "Tabela CSV, Lista de Bullets, Markdown, Texto corrido, Código Python? Defina a estrutura visual." }
  ];

  return (
    <article className="w-full mx-auto">
      <div className="prose prose-base md:prose-lg lg:prose-xl max-w-none text-gray-900 leading-relaxed">

        <StrategicContext label="Atenção">
          O ChatGPT não "sabe" nada. Ele prevê a próxima palavra mais provável. Sem direção clara, ele produzirá clichês corporativos vazios. Você precisa ser o diretor.
        </StrategicContext>

        <KeyTakeaways
          title="Key Takeaways"
          items={[
            { title: "Garbage In, Garbage Out", description: "A qualidade da resposta é 100% proporcional à qualidade do prompt." },
            { title: "IA é Automação Cognitiva", description: "Use para tarefas repetitivas, pesquisa preliminar e rascunhos. Nunca para o final." },
            { title: "Framework R.T.C.F.", description: "Role, Task, Context, Format. A fórmula mágica de qualquer prompt." },
            { title: "Humanização", description: "A IA escreve, o humano edita. O 'toque humano' é o que diferencia o spam da arte." }
          ]}
        />

        {/* Intro + Stats */}
        <div className="mb-16">
          <h2 id="intro" className="font-bold tracking-tight text-gray-900 mt-0">O Multiplicador de Produtividade</h2>
          <p className="text-lg md:text-xl text-gray-600 leading-relaxed">
            Não é sobre substituir o profissional de marketing, é sobre transformá-lo em um exército de um homem só. Prompt Engineering é a habilidade de alto valor da década.
          </p>

          <div className="flex flex-col md:flex-row gap-8 my-10 border-y border-gray-200 py-8 not-prose">
            <div className="flex-1">
              <div className="text-4xl font-bold text-black mb-1">10x</div>
              <div className="text-xs text-gray-500 uppercase tracking-widest font-medium">Velocidade de Criação</div>
            </div>
            <div className="flex-1 md:border-l md:border-gray-200 md:pl-8">
              <div className="text-4xl font-bold text-black mb-1">Zero</div>
              <div className="text-xs text-gray-500 uppercase tracking-widest font-medium">Bloqueio Criativo</div>
            </div>
            <div className="flex-1 md:border-l md:border-gray-200 md:pl-8">
              <div className="text-4xl font-bold text-black mb-1">Scale</div>
              <div className="text-xs text-gray-500 uppercase tracking-widest font-medium">Personalização em Massa</div>
            </div>
          </div>
        </div>

        {/* Anatomy - Definition List */}
        <div className="mb-20">
          <h2 id="anatomia" className="font-bold text-gray-900 mb-8">Framework Universal de Prompt (R.T.C.F.)</h2>
          <p className="text-gray-700 mb-8">Antes de digitar qualquer coisa, pense nestes 4 componentes.</p>

          <div className="not-prose grid gap-6">
            {anatomy.map((item, i) => (
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
            4 Estratégias de Prompting
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

        {/* Templates Grid - PROMPTS */}
        <div className="mb-20">
          <h2 id="templates" className="font-bold text-gray-900 mb-10">Biblioteca de Prompts Prontos</h2>

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
                    onClick={() => copyToClipboard(template.body, template.name)}
                    className="text-xs font-bold uppercase tracking-widest text-gray-900 hover:text-revgreen transition-colors flex items-center gap-2 justify-end bg-white p-2 border border-gray-200 rounded-sm ml-auto"
                  >
                    {copiedPrompt === template.name ? (
                      <>
                        <CheckCircle className="w-3 h-3" />
                        Copiado!
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        Copiar Prompt
                      </>
                    )}
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
            <h2 id="checklist" className="text-xl font-bold text-white m-0">Checklist de Qualidade IA</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-x-12 gap-y-4">
            {[
              "O prompt definou uma Persona clara?",
              "Você forneceu contexto suficiente?",
              "O formato de saída foi especificado?",
              "Você checou os fatos (Fact Checking)?",
              "Você reescreveu a introdução e conclusão?",
              "Removeu palavras de IA ('Delve', 'Landscape')?",
              "O tom de voz bate com a marca?",
              "Você iterou pelo menos 1 vez?"
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-3 py-2 border-b border-gray-800 last:border-0 text-gray-300">
                <span className="text-revgreen mt-1">✓</span>
                <span className="text-sm">{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Final */}
        <div className="text-center py-12 border-t border-gray-200">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            Quer implementar IA no seu time?
          </h3>
          <p className="text-gray-600 mb-8 max-w-lg mx-auto text-lg">
            Agende um diagnóstico. Ensinamos seu time a criar máquinas de vendas usando IA.
          </p>
          <div className="flex justify-center">
            <Button
              size="lg"
              className="bg-black text-white hover:bg-gray-800 font-bold px-10 h-14 rounded-none uppercase tracking-wider text-sm"
              onClick={onCTAClick}
            >
              <span className="flex items-center gap-2">
                Solicitar Diagnóstico
                <ArrowRight className="w-4 h-4" />
              </span>
            </Button>
          </div>
        </div>

      </div>
    </article>
  );
};

export default ChatGPTGrowthArticle;