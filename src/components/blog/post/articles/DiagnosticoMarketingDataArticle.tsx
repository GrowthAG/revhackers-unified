
import { useState } from 'react';
import { AreaChart, Search, AlertOctagon, CheckCircle2, TrendingUp, Copy, Eye, PieChart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import StrategicContext from '../components/StrategicContext';
import KeyTakeaways from '../components/KeyTakeaways';
import ConceptDefinition from '../components/ConceptDefinition';
import RedFlags from '../components/RedFlags';
import StrategicConclusion from '../components/StrategicConclusion';

const DiagnosticoMarketingDataArticle = ({ onCTAClick }: { onCTAClick?: () => void }) => {
    const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

    const handleCopy = (text: string, index: number) => {
        navigator.clipboard.writeText(text);
        setCopiedIndex(index);
        setTimeout(() => setCopiedIndex(null), 2000);
    };

    const metricsFramework = [
        {
            title: "Métricas de Vaidade (O que Ignorar)",
            description: "Likes, Pageviews, Número de leads (sem qualificação). Elas massageiam o ego mas não pagam boleto.",
            icon: <Eye className="w-6 h-6 text-red-500" />
        },
        {
            title: "Métricas de Saúde (O que Monitorar)",
            description: "CAC, LTV, Churn, NPS. Elas dizem se a empresa vai morrer mês que vem.",
            icon: <PieChart className="w-6 h-6 text-yellow-500" />
        },
        {
            title: "Métricas de Ação (Onde Focar)",
            description: "Taxa de Conversão por Etapa, Custo por Oportunidade, Ciclo de Venda. Elas dizem onde você deve trabalhar hoje.",
            icon: <TrendingUp className="w-6 h-6 text-revgreen" />
        }
    ];

    const templates = [
        {
            name: "Audit de Tracking (GTM)",
            subject: "Checklist de Higiene de Dados",
            body: `1. UTMs Padronizadas:
[ ] Todas as campanhas usam utm_source, utm_medium e utm_campaign?
[ ] Nomenclatura consistente (ex: 'linkedin' sempre minúsculo)?
[ ] Se não, seus dados de atribuição são lixo.

2. Eventos de Conversão:
[ ] O evento 'Lead' dispara na visualização do form ou no sucesso do envio? (Deve ser no sucesso)
[ ] O evento 'Venda' bate com o CRM? (Margem de erro < 5%)

3. Exclusão de IPs Internos:
[ ] O tráfego dos funcionários está filtrado no GA4?`
        },
        {
            name: "Relatório Mensal de Performance",
            subject: "Modelo para Diretoria",
            body: `Resumo Executivo:
- Investimento Total: R$ [Valor]
- Receita Gerada (Atribuída): R$ [Valor]
- ROAS: [X]x

O que funcionou (Scale):
- Campanha [A] no LinkedIn (CPL R$ 20, Qualificação 40%)

O que não funcionou (Kill/Fix):
- Campanha [B] no Google (CPL R$ 80, Qualificação 10%)

Próximos Passos:
- Parar [B], Dobrar orçamento de [A].
- Testar nova Landing Page para reduzir CAC em 15%.`
        }
    ];

    return (
        <article className="w-full mx-auto">
            <div className="prose prose-base md:prose-lg lg:prose-xl max-w-none text-zinc-900 leading-relaxed font-sans">

                <StrategicContext label="Dados não tomam decisão">
                    Ter um dashboard lindo no PowerBI não resolve nada se ninguém sabe o que fazer com ele. A maioria das empresas sofre de "Paralisia por Análise". O objetivo dos dados é matar opiniões e acelerar decisões, não criar reuniões de 4 horas para discutir a cor do gráfico.
                </StrategicContext>

                <KeyTakeaways
                    title="Key Takeaways (Data Driven)"
                    items={[
                        { title: "Garbage In, Garbage Out", description: "Se seus dados de entrada (input) estão sujos (UTMs erradas, CRM desatualizado), seus relatórios são ficção. Limpe a fonte antes de construir o dashboard." },
                        { title: "Uma Métrica que Importa (OMTM)", description: "Em cada fase da empresa, existe apenas UMA métrica que importa. Early stage? Retenção. Scale up? CAC/LTV. Foque tudo nela." },
                        { title: "Contexto > Número", description: "Dizer 'Tivemos 100 leads' não diz nada. 'Tivemos 100 leads, 30% a mais que mês passado, com a mesma verba' é uma história." },
                        { title: "Atribuição é Mito", description: "Não existe modelo de atribuição perfeito (Last click, First click, Linear). Escolha um, entenda suas falhas, e siga com ele. Consistência vence perfeição." }
                    ]}
                />

                <ConceptDefinition
                    concept="Data-Driven Marketing"
                    definition="Tomar decisões baseadas em evidências quantitativas e qualitativas, não em intuição ou hierarquia (HiPPO - Highest Paid Person's Opinion)."
                    amateurView="Olhar o Google Analytics todo dia."
                    proView="Rodar experimentos controlados, medir resultados com significância estatística e iterar."
                />

                <h2 className="text-2xl font-bold text-zinc-900 mt-12 mb-6">A Pirâmide de Métricas</h2>
                <div className="grid md:grid-cols-3 gap-6 mb-12 not-prose">
                    {metricsFramework.map((item, i) => (
                        <Card key={i} className="p-6 bg-white border border-zinc-200 hover:border-revgreen/50 transition-colors shadow-sm">
                            <div className="bg-zinc-900 p-3 rounded-full w-fit mb-4 border border-zinc-800">
                                {item.icon}
                            </div>
                            <h3 className="font-bold text-zinc-900 mb-2">{item.title}</h3>
                            <p className="text-sm text-zinc-600 mb-0 leading-relaxed">{item.description}</p>
                        </Card>
                    ))}
                </div>

                <h2 className="text-2xl font-bold text-zinc-900 mt-12 mb-6">Templates de Governança</h2>
                <div className="grid md:grid-cols-2 gap-8 mb-16">
                    {templates.map((template, index) => (
                        <Card key={index} className="bg-white border border-zinc-200 shadow-sm transition-shadow overflow-hidden">
                            <div className="p-4 border-b border-zinc-100 flex justify-between items-center bg-zinc-50">
                                <div className="text-xs font-bold text-zinc-900 uppercase tracking-wider truncate pr-4 flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-revgreen"></div>
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
                                <pre className="font-mono text-xs text-zinc-600 whitespace-pre-wrap leading-relaxed">
                                    {template.body}
                                </pre>
                            </div>
                        </Card>
                    ))}
                </div>

                <RedFlags
                    title="Sinais de Analfabetismo de Dados"
                    flags={[
                        "Relatórios que só mostram 'O Quê' e não 'Porquê'. (Ex: O tráfego caiu. Por quê? Não sei.)",
                        "Confundir Correlação com Causalidade. (Ex: 'Lançamos a feature nova e as vendas subiram'. Talvez tenha sido a Black Friday.)",
                        "Ignorar a Sazonalidade. (Comparar Fevereiro com Março sem ajustar pelos dias úteis ou Carnaval)."
                    ]}
                />

                <StrategicConclusion
                    title="Seja um Cético"
                    description="Torture os dados e eles confessarão qualquer coisa. Seu papel como líder de Growth é questionar os números. 'Isso faz sentido?'. 'A coleta está certa?'. A intuição humana ainda é necessária para validar a lógica da máquina."
                    ctaText="Auditoria de Analytics & Dados"
                    leadMagnetId="checklist"
                    onCTAClick={onCTAClick}
                />
            </div>
        </article>
    );
};

export default DiagnosticoMarketingDataArticle;
