
import { useState } from 'react';
import { Bot, Zap, ShieldCheck, CheckCircle2, Cpu, BrainCircuit, Terminal, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import StrategicContext from '../components/StrategicContext';
import KeyTakeaways from '../components/KeyTakeaways';
import ConceptDefinition from '../components/ConceptDefinition';
import RedFlags from '../components/RedFlags';
import StrategicConclusion from '../components/StrategicConclusion';

const IAPreVendasArticle = ({ onCTAClick }: { onCTAClick?: () => void }) => {
    const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

    const handleCopy = (text: string, index: number) => {
        navigator.clipboard.writeText(text);
        setCopiedIndex(index);
        setTimeout(() => setCopiedIndex(null), 2000);
    };

    const applications = [
        {
            title: "Enriquecimento Deep (Pre-Work)",
            description: "Esqueça a busca manual por CNAE ou Tech Stack. A IA constrói o dossiê completo do lead antes do SDR abrir o CRM.",
            example: "Prompt: 'Analise o site da [Empresa], identifique o ICP deles, liste 3 concorrentes diretos e sugira 2 dores latentes para um Diretor de Vendas.'",
            results: "Redução de 70% no tempo de pesquisa pré-call."
        },
        {
            title: "Hiper-Personalização em Escala",
            description: "Não é sobre trocar o {{nome}}. É sobre conectar a proposta de valor com o contexto da empresa em segundos.",
            example: "IA lê o Relatório Anual da empresa alvo, identifica que eles querem 'Expandir para LATAM' e escreve um intro email focado nisso.",
            results: "3x mais respostas positivas em cold emails."
        },
        {
            title: "Objection Handling em Tempo Real",
            description: "Durante a call, a IA 'ouve' a objeção e sugere a melhor resposta baseada no playbook da empresa.",
            example: "Cliente: 'Está caro'. IA (na tela do SDR): 'O cliente mencionou preço. Use a técnica de ancoragem com ROI: Mostre que o custo de inação é R$ 50k/mês.'",
            results: "Aumento de 24% na conversão de SDRs júnior."
        }
    ];

    const templates = [
        {
            name: "Prompt: Dossiê de Conta",
            subject: "Gerador de Account Plan",
            body: `Atue como um Especialista em RevOps.

Analise a empresa [URL da Empresa] e o perfil [URL do LinkedIn do Decisor].

Gere um report curto com:
1. O modelo de receita deles (SaaS, Service, Marketplace).
2. O provável Stack Tecnológico de Vendas (CRM, Automação).
3. Uma hipótese de problema que meu produto ([Seu Produto]) resolve para eles especificamente.
4. Três perguntas de SPIN Selling para fazer na call.

Saída em tópicos (Bullets).`
        },
        {
            name: "Prompt: Email Opener (Rapport)",
            subject: "Gerador de Ganchos",
            body: `Crie 3 opções de primeira frase para um cold email para [Nome] da [Empresa].

Baseie-se nesta notícia recente: [Colar Texto da Notícia].

Regras:
- Tom casual e executivo (sem bajulação excessiva).
- Máximo de 280 caracteres.
- Deve conectar a notícia com [Problema que você resolve].

Não use exclamações.`
        }
    ];

    const workflow = [
        "Defina 'Guardrails' (Limites éticos da IA)",
        "Não automatize o envio sem revisão humana",
        "Use IA para 'Draft' (Rascunho), Humano para 'Polish' (Polimento)",
        "DADOS: Limpe seu CRM antes de plugar qualquer IA",
        "Treine o modelo com suas melhores calls (Gong/Fathom)"
    ];

    return (
        <article className="w-full mx-auto">
            <div className="prose prose-base md:prose-lg lg:prose-xl max-w-none text-zinc-900 leading-relaxed font-sans">

                <StrategicContext label="A Era do 'AI-Augmented SDR'">
                    <p>
                        Existe um mito de que a IA vai substituir vendedores. A realidade: vendedores que usam IA vão substituir vendedores que não usam.
                    </p>
                    <p className="mt-4">
                        A IA Generativa não serve para escrever emails robóticos em massa. Ela serve para <strong>eliminar a fricção cognitiva</strong>. O trabalho braçal de pesquisa, resumo e input de dados desaparece, liberando o humano para o que realmente vende: empatia, negociação e estratégia.
                    </p>
                </StrategicContext>

                <KeyTakeaways
                    title="Key Takeaways (IA em Vendas)"
                    items={[
                        { title: "Pesquisa Infinita", description: "O que levava 45 minutos (ler site, linkedin, notícias) agora leva 15 segundos. O SDR chega na call sabendo mais da empresa que o próprio cliente." },
                        { title: "Fim do 'Writer's Block'", description: "Nunca mais comece um email do zero. A IA gera 3 variações de copy sólidas para você apenas editar e enviar." },
                        { title: "Treinamento Passivo", description: "IAs que analisam calls (Conversation Intelligence) treinam novatos 24/7, apontando erros que gestores humanos não teriam tempo de ouvir." },
                        { title: "Dados Proprietários", description: "Sua vantagem não é o ChatGPT. É o contexto único que você dá a ele (Seus Playbooks, Seus Casos de Sucesso, Seu CRM)." }
                    ]}
                />

                <ConceptDefinition
                    concept="Automação vs Augmentation"
                    definition="Automação é colocar um robô para fazer tarefas repetitivas sem supervisão (ex: Disparo de Email). Augmentation (Aumentação) é dar superpoderes ao humano (ex: O robô sussurra a resposta certa no ouvido do vendedor durante a negociação)."
                    amateurView="Quero uma IA para mandar 10.000 emails por dia sozinho."
                    proView="Quero uma IA que analise 10.000 leads e me diga quais os 50 que eu devo ligar pessoalmente agora."
                />

                <h2 className="text-2xl font-bold text-zinc-900 mt-12 mb-6">O Fim do Trabalho Braçal</h2>
                <p>
                    Estudos mostram que SDRs gastam apenas 30% do tempo vendendo. O resto é perdido em CRM, pesquisa e tarefas administrativas. A IA inverte essa pirâmide.
                </p>
                <p>
                    Imagine um estagiário genial que leu toda a internet, decorou seu playbook de vendas e trabalho 24h por dia. Esse é o seu novo assistente de IA.
                </p>

                <h2 className="font-bold text-zinc-900 mb-8 mt-16 flex items-center gap-3">
                    <Cpu className="w-6 h-6 text-revgreen" />
                    3 Aplicações Práticas (Setup em 24h)
                </h2>

                <div className="space-y-12 mb-16">
                    {applications.map((app, index) => (
                        <div key={index} className="bg-white border border-zinc-200 p-8 rounded-xl shadow-sm transition-shadow">
                            <h3 className="text-xl font-bold text-zinc-900 mb-4 flex items-center gap-3">
                                <span className="w-8 h-8 rounded-full bg-zinc-900 text-white flex items-center justify-center text-sm font-bold">{index + 1}</span>
                                {app.title}
                            </h3>
                            <p className="text-zinc-700 mb-6 font-medium">
                                {app.description}
                            </p>
                            <div className="bg-zinc-50 p-6 rounded-lg border border-zinc-100">
                                <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Exemplo Real</h4>
                                <p className="text-zinc-600 text-sm font-mono leading-relaxed italic">"{app.example}"</p>
                            </div>
                            <div className="mt-4 flex items-center gap-2 text-sm text-emerald-700 font-bold">
                                <Zap className="w-4 h-4" />
                                Impacto: {app.results}
                            </div>
                        </div>
                    ))}
                </div>

                <RedFlags
                    title="Onde a IA falha (Cuidado)"
                    flags={[
                        "Alucinação: A IA pode inventar fatos sobre o lead. Nunca envie sem checar.",
                        "Tom Genérico: Se você não der contexto (Prompt Engineering), o email vai soar como 'Marketing Speak'.",
                        "Privacidade: Cuidado ao colocar dados sensíveis de clientes em IAs públicas (ChatGPT Gratuito).",
                        "Dependência: Seu time não pode desaprender a escrever. A IA é apoio, não muleta."
                    ]}
                />

                <div className="my-16 bg-zinc-900 text-white p-8 rounded-xl not-prose">
                    <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                        <ShieldCheck className="w-6 h-6 text-revgreen" />
                        Checklist de Implementação Segura
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
                    <Terminal className="w-6 h-6 text-revgreen" />
                    Prompts de Engenharia de Vendas
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
                                    className="h-7 text-[10px] uppercase font-bold text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
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
                    title="Não compre software, compre tempo"
                    description="Implementar IA em Vendas não é sobre TI. É sobre dar ao seu time 40% a mais de tempo útil para vender."
                    ctaText="Consultoria de IA para Vendas"
                    onCTAClick={onCTAClick}
                />

            </div>
        </article>
    );
};

export default IAPreVendasArticle;
