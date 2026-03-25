import { useState } from 'react';
import { ArrowRight, ShieldCheck, Target, Zap, TrendingUp, AlertTriangle, Copy, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import StrategicContext from '../components/StrategicContext';
import KeyTakeaways from '../components/KeyTakeaways';
import RedFlags from '../components/RedFlags';
import StrategicConclusion from '../components/StrategicConclusion';

const EstrategiaGTMArticle = ({ onCTAClick }: { onCTAClick?: () => void }) => {
    const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

    const handleCopy = (text: string, index: number) => {
        navigator.clipboard.writeText(text);
        setCopiedIndex(index);
        setTimeout(() => setCopiedIndex(null), 2000);
    };

    const strategies = [
        {
            title: "ICP Cirúrgico e Mapeamento de Comitê",
            description: "Pare de mirar em 'empresas' e comece a mirar em problemas específicos de cargos específicos.",
            example: "Em vez de 'Empresas de SaaS', mire em 'VPs de Vendas em SaaS Series B com churn > 5%'.",
            impact: "Redução de 40% no ciclo de vendas por evitar leads desqualificados."
        },
        {
            title: "Manifesto: Da Transação à Transformação",
            description: "Seu produto não é uma ferramenta, é a ponte entre um 'Estado A' (dor) e um 'Estado B' (glória).",
            example: "Ninguém compra CRM. Pessoas compram 'previsibilidade para dormir tranquilo sem medo de errar a meta'.",
            impact: "+25% na taxa de conversão de demo para fechamento."
        },
        {
            title: "Demand Gen: O Consultor Silencioso",
            description: "Crie conteúdo que educa o mercado sobre o custo da inércia. Se eles não virem o problema, não comprarão a solução.",
            example: "Posts que mostram: 'Quanto custa para sua empresa NÃO ter um processo de GTM estruturado'.",
            impact: "70% da jornada de compra concluída antes do primeiro call com vendas."
        },
        {
            title: "Pricing Estratégico e Valor Percebido",
            description: "O preço deve ser um reflexo do valor gerado (ROI), não do custo de produção ou concorrência direta.",
            example: "Mude de 'R$ 500/mês' para 'Uma fração do desperdício de R$ 50k que economizamos para você'.",
            impact: "Aumento médio de 15% no ACV (Annual Contract Value)."
        }
    ];

    const templates = [
        {
            name: "ICP Worksheet Quick-Start",
            subject: "Framework de Qualificação de Perfil Ideal",
            body: `1. FIRMOGRAFIA: Seto, Tamanho (Funcionários/Receita), Localização.
2. TECNOGRAFIA: Quais ferramentas eles usam que o seu produto integra ou substitui?
3. SITUAÇÃO GATILHO: O que aconteceu hoje que tornou seu produto urgente? (Ex: Funding, Troca de Gestão).
4. PERSONAS (COMITÊ):
   - O Iniciador (quem sente a dor)
   - O Influenciador (quem entende a técnica)
   - O Decisor (quem assina o cheque)
   - O Detrator (quem perde poder com a mudança)`
        },
        {
            name: "GTM Readiness Checklist",
            subject: "Checklist de Validação de Estratégia",
            body: `- Temos clareza de qual PROBLEMA específico resolvemos?
- Nossa segmentação é estreita o suficiente para dominarmos um nicho?
- O time de vendas tem os scripts alinhados com o Marketing?
- O modelo de pricing captura o valor gerado?
- Temos métricas de sucesso (CAC/LTV) definidas para os primeiros 90 dias?`
        }
    ];

    return (
        <article className="w-full mx-auto">
            {/* Hero Banner */}


            <div className="prose prose-base md:prose-lg lg:prose-xl max-w-none text-zinc-900 leading-relaxed">

                <StrategicContext label="Fato Brutal">
                    68% dos novos produtos B2B falham não por falta de tecnologia, mas por falta de uma estratégia de GTM clara. O custo da inércia é maior que o custo da mudança.
                </StrategicContext>

                <KeyTakeaways
                    title="Key Takeaways"
                    items={[
                        { title: "GTM não é Lançamento", description: "É um motor de crescimento contínuo, não um evento único." },
                        { title: "ICP > Volume", description: "É melhor ser o rei de um nicho do que um desconhecido no oceano." },
                        { title: "Demand Gen", description: "Gere valor antes de pedir tempo. Eduque antes de vender." },
                        { title: "Unit Economics", description: "Se o CAC superou o LTV, seu GTM está quebrado." }
                    ]}
                />

                {/* Intro Text */}
                <div className="mb-16">
                    <h2 id="o-que-e-gtm" className="font-bold tracking-tight text-zinc-900 mt-0 text-3xl md:text-4xl">GTM: O Motor de Sobrevivência B2B</h2>
                    <p className="text-lg md:text-xl text-zinc-600 leading-relaxed">
                        Muitas empresas tratam o Go-To-Market como se fosse apenas um plano de marketing ou um checklist de lançamento. Na realidade, o GTM é a <strong>estratégia de alinhamento total</strong> entre Produto, Marketing e Vendas para entregar valor a um mercado específico.
                    </p>
                </div>

                {/* Anatomy Section */}
                <div className="mb-20">
                    <h2 id="pilares-gtm" className="font-bold text-zinc-900 mb-8 border-b border-zinc-100 pb-4 uppercase tracking-tight">Os 9 Pilares do GTM de Alta Performance</h2>
                    <div className="not-prose grid gap-6">
                        {[
                            { label: "01. MANIFESTO", title: "Causa e Consequência", desc: "Qual é a mudança no mundo que torna seu produto inevitável?" },
                            { label: "02. ICP", title: "O Alvo Cirúrgico", desc: "Quem é o cliente que tem a dor mais aguda e o cheque mais fácil?" },
                            { label: "03. PSICOLOGIA", title: "Gatilhos de Compra", desc: "O que move o seu comprador: Ganância, Medo ou Ego?" },
                            { label: "04. DIFERENCIAÇÃO", title: "O Vazio no Mercado", desc: "Por que escolher você e não o status quo ou o concorrente gigante?" },
                            { label: "05. DEMAND GEN", title: "O Imã de Leads", desc: "Como atrair contas qualificadas sem depender apenas de outbound frio?" },
                            { label: "06. ESTRUTURA", title: "Rampa de Vendas", desc: "Seu processo comercial é previsível ou depende de 'talento natural'?" },
                            { label: "07. PRICING", title: "Captura de Valor", desc: "Seu preço comunica autoridade ou medo de perder a venda?" },
                            { label: "08. MÉTRICAS", title: "Os Sinais de Saúde", desc: "Payback, Churn e LTV/CAC: a verdade nua e crua dos seus números." },
                            { label: "09. FRAMEWORK", title: "Execução Contínua", desc: "O ciclo de teste, aprendizado e escala que nunca para." }
                        ].map((item, i) => (
                            <div key={i} className="flex flex-col md:flex-row gap-4 md:items-baseline border-b border-zinc-100 pb-6 last:border-0 last:pb-0">
                                <span className="bg-zinc-100 px-3 py-1 text-[10px] font-bold text-black w-24 shrink-0 uppercase tracking-widest text-center rounded">{item.label}</span>
                                <div>
                                    <h4 className="font-bold text-zinc-900 text-lg mb-1">{item.title}</h4>
                                    <p className="text-zinc-600 leading-relaxed m-0 text-base">{item.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Strategies Section */}
                <div className="mb-20">
                    <h2 id="estrategias-gtm" className="font-bold text-zinc-900 mb-10 text-3xl">Playbook de Execução</h2>
                    <div className="space-y-16">
                        {strategies.map((strategy, index) => (
                            <div key={index} className="group">
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center font-bold text-lg shrink-0 group-hover:bg-revgreen transition-colors">
                                        {index + 1}
                                    </div>
                                    <h3 className="font-bold text-2xl text-zinc-900 m-0">{strategy.title}</h3>
                                </div>
                                <p className="text-zinc-700 text-lg mb-6 leading-relaxed pl-14">{strategy.description}</p>

                                <div className="pl-14 space-y-4">
                                    <div className="bg-zinc-50 border-l-2 border-revgreen p-6 rounded-r-lg">
                                        <span className="text-xs font-bold text-revgreen uppercase tracking-widest block mb-2">Exemplo Prático</span>
                                        <p className="text-zinc-600 italic m-0">"{strategy.example}"</p>
                                    </div>
                                    <div className="text-sm font-bold text-zinc-900 flex items-center gap-2">
                                        <TrendingUp className="w-4 h-4 text-revgreen" />
                                        Impacto Estimado: <span className="text-revgreen underline decoration-revgreen/30">{strategy.impact}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <RedFlags
                    title="Quando NÃO escalar seu GTM"
                    flags={[
                        "Churn alto (>3% ao mês) em contas novas",
                        "CAC Payback maior que 18 meses sem caixa",
                        "Falta de clareza sobre quem é o ICP",
                        "Vendas fechando apenas via 'desconto' e não valor"
                    ]}
                />

                {/* Templates Section */}
                <div className="mb-20">
                    <h2 id="templates-gtm" className="font-bold text-zinc-900 mb-10 text-3xl">Recursos de Implementação</h2>
                    <div className="grid md:grid-cols-2 gap-8">
                        {templates.map((template, index) => (
                            <Card key={index} className="bg-white border border-zinc-200 shadow-sm transition-shadow overflow-hidden">
                                <div className="p-4 border-b border-zinc-100 flex justify-between items-center bg-zinc-50">
                                    <div className="text-sm font-bold text-zinc-900 flex items-center gap-2">
                                        <Target className="w-4 h-4 text-revgreen" />
                                        {template.name}
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleCopy(template.body, index)}
                                        className="h-7 text-[10px] uppercase font-bold text-zinc-500 hover:text-revgreen hover:bg-revgreen/10 transition-colors"
                                    >
                                        {copiedIndex === index ? (
                                            <span className="flex items-center gap-1 text-revgreen"><CheckCircle2 className="w-3 h-3" /> Copiado</span>
                                        ) : (
                                            <span className="flex items-center gap-1"><Copy className="w-3 h-3" /> Copiar</span>
                                        )}
                                    </Button>
                                </div>
                                <div className="p-6">
                                    <div className="text-xs text-zinc-500 font-mono mb-4 border-b border-zinc-100 pb-2 flex gap-2">
                                        <span className="font-bold text-zinc-700">Assunto:</span> {template.subject}
                                    </div>
                                    <pre className="font-mono text-sm text-zinc-700 whitespace-pre-wrap leading-relaxed">
                                        {template.body}
                                    </pre>
                                </div>
                            </Card>
                        ))}
                    </div>
                </div>

                {/* Final CTA */}
                <StrategicConclusion
                    title="Pronto para construir seu Motor de Receita?"
                    description="Não desperdice mais energia em mercados que não dão retorno. Vamos desenhar seu GTM cirúrgico juntos."
                    ctaText="Agendar Diagnóstico Gratuito"
                    onCTAClick={onCTAClick}
                />

            </div>
        </article>
    );
};

export default EstrategiaGTMArticle;
