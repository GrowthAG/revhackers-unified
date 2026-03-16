import { useState } from 'react';
import { CheckCircle2, Microscope, Filter } from 'lucide-react';
import StrategicContext from '../components/StrategicContext';
import KeyTakeaways from '../components/KeyTakeaways';
import ConceptDefinition from '../components/ConceptDefinition';
import RedFlags from '../components/RedFlags';
import StrategicConclusion from '../components/StrategicConclusion';

const DiagnosticoFunilArticle = ({ onCTAClick }: { onCTAClick?: () => void }) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

    const bowTieStages = [
        {
            title: "1. Aquisição (O Funil Antigo)",
            desc: "Marketing e Vendas trazem o cliente até a assinatura. O foco é 'Fechar'.",
            metric: "CAC (Custo de Aquisição)"
        },
        {
            title: "2. Retenção (O Nó)",
            desc: "Onboarding e Adoção. Onde o cliente percebe o primeiro valor (Time to Value).",
            metric: "Churn Rate"
        },
        {
            title: "3. Expansão (O Crescimento Real)",
            desc: "Upsell, Cross-sell e Renovação. Onde o lucro acontece de verdade.",
            metric: "LTV e NRR"
        }
    ];

    const metrics = [
        {
            name: "LTV:CAC",
            ideal: "> 3:1",
            meaning: "Quanto você ganha para cada real gasto. Abaixo de 3, você está queimando caixa. Acima de 5, você está crescendo devagar demais."
        },
        {
            name: "CAC Payback",
            ideal: "< 12 meses",
            meaning: "Quanto tempo leva para recuperar o custo de venda. Startups eficientes recuperam em 8-10 meses."
        },
        {
            name: "Net Revenue Retention (NRR)",
            ideal: "> 110%",
            meaning: "A métrica de ouro. Se você parasse de vender hoje, sua receita cresceria ou diminuiria? Acima de 100% significa crescimento automático."
        }
    ];

    return (
        <article className="w-full mx-auto">
            <div className="prose prose-base md:prose-lg lg:prose-xl max-w-none text-gray-900 leading-relaxed font-sans">

                <StrategicContext label="O Diagnóstico">
                    <p>
                        Se sua operação B2B está estagnada, mesmo com investimento em marketing, vendas e equipe qualificada, o problema quase sempre está dentro do funil comercial - não fora.
                    </p>
                    <p className="mt-4">
                        A maioria dos CEOs e heads de growth tenta acelerar com tráfego ou contratar mais SDRs, mas o que precisam, na real, é cirurgia de precisão: diagnóstico de onde a receita está vazando.
                    </p>
                </StrategicContext>

                <KeyTakeaways
                    title="Key Takeaways"
                    items={[
                        { title: "Funil Gravata Borboleta", description: "O modelo visual que une Aquisição (Esquerda) e Expansão (Direita). O objetivo não é só fechar, é expandir." },
                        { title: "NRR é Rei", description: "A Net Revenue Retention é a única métrica que importa para valuation hoje. Reter custa 5x menos que adquirir." },
                        { title: "Silenciem os 'Leads'", description: "Pare de medir sucesso por volume de MQLs. Meça por Pipeline Gerado e Receita Recorrente." },
                        { title: "O Buraco no Meio", description: "A maior falha das empresas B2B é o handoff entre Vendas e CS. É ali que o churn (cancelamento) é plantado." }
                    ]}
                />

                <ConceptDefinition
                    concept="The Bow Tie Funnel (Funil Gravata Borboleta)"
                    definition="Um modelo de growth onde a venda é apenas o 'nó' central. O funil se abre novamente após a venda para focar em Retenção e Expansão."
                    amateurView="Vendi, bati o sino, próximo lead. O cliente é problema do suporte agora."
                    proView="A venda é o começo. Meu foco é garantir que o cliente tenha sucesso rápido para que eu possa vender mais para ele (Expansion)."
                />

                {/* Bow Tie Visualization */}
                <div className="my-16 not-prose">
                    <h3 className="text-xl font-bold text-gray-900 mb-8 flex items-center gap-2">
                        <Filter className="w-6 h-6 text-revgreen rotate-90" />
                        A Anatomia do Growth Moderno
                    </h3>
                    <div className="grid md:grid-cols-3 gap-6">
                        {bowTieStages.map((stage, i) => (
                            <div key={i} className={`p-6 rounded-lg border relative overflow-hidden ${i === 1 ? 'bg-zinc-900 text-white border-zinc-800' : 'bg-gray-50 border-gray-200'}`}>
                                <div className="absolute top-0 right-0 p-4 opacity-10">
                                    <h4 className="text-6xl font-bold">{i + 1}</h4>
                                </div>
                                <h4 className={`font-bold text-lg mb-2 relative z-10 ${i === 1 ? 'text-white' : 'text-gray-900'}`}>{stage.title}</h4>
                                <p className={`text-sm mb-4 relative z-10 ${i === 1 ? 'text-gray-400' : 'text-gray-600'}`}>{stage.desc}</p>
                                <div className={`inline-block px-3 py-1 rounded text-xs font-bold uppercase tracking-wider ${i === 1 ? 'bg-revgreen text-white' : 'bg-gray-200 text-gray-700'}`}>
                                    KPI: {stage.metric}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-6">As 3 Métricas que Ditam a Sobrevivência</h2>
                <div className="grid gap-6 mb-12">
                    {metrics.map((m, i) => (
                        <div key={i} className="flex flex-col md:flex-row gap-6 border-b border-gray-100 pb-6 last:border-0 items-start">
                            <div className="w-full md:w-1/3">
                                <h3 className="font-bold text-lg text-gray-900">{m.name}</h3>
                                <div className="text-revgreen font-mono font-bold text-2xl mt-1">{m.ideal}</div>
                            </div>
                            <div className="w-full md:w-2/3">
                                <p className="text-gray-700 leading-relaxed m-0">{m.meaning}</p>
                            </div>
                        </div>
                    ))}
                </div>

                <RedFlags
                    title="Sinais de que seu Funil está Quebrado"
                    flags={[
                        "Marketing comemora leads, Vendas reclama de qualidade (Desalinhamento clássico).",
                        "High Churn nos primeiros 90 dias (Erro de Onboarding ou Venda Errada).",
                        "Sua base de clientes não cresce organicamente (Zero indicação/Referral).",
                        "O time de CS funciona como 'Suporte de Luxo' (Reativo) em vez de 'Gerentes de Sucesso' (Proativo)."
                    ]}
                />

                <div className="my-16 bg-zinc-900 text-white p-8 rounded-xl not-prose">
                    <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                        <Microscope className="w-6 h-6 text-revgreen" />
                        O Diagnóstico de Receita
                    </h3>
                    <p className="text-gray-300 mb-8 max-w-2xl">
                        Pare de olhar para métricas de vaidade (likes, visitas, leads). Para consertar seu crescimento, você precisa auditar a passagem de bastão:
                    </p>
                    <ul className="space-y-4">
                        {[
                            "Qual sua taxa de conversão de MQL para SQL real?",
                            "Quanto tempo leva entre o 'Closed Won' e o 'First Value'?",
                            "Qual % da sua receita vem de Upsell hoje?",
                            "Seu CAC Payback está abaixo de 12 meses?"
                        ].map((item, i) => (
                            <li key={i} className="flex items-start gap-3">
                                <CheckCircle2 className="w-5 h-5 text-revgreen mt-0.5 shrink-0" />
                                <span className="text-white font-medium">{item}</span>
                            </li>
                        ))}
                    </ul>
                </div>

                <StrategicConclusion
                    title="Construa uma Máquina, Não uma Campanha"
                    description="O Funil Gravata Borboleta não é sobre marketing. É sobre alinhar a empresa inteira em torno de uma única missão: gerar valor recorrente para o cliente."
                    ctaText="Solicitar Análise de Funil & Revenue Ops"
                    onCTAClick={onCTAClick}
                />

            </div>
        </article>
    );
};

export default DiagnosticoFunilArticle;
