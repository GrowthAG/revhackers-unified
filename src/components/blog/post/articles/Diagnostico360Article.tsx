import { Target, Search, BarChart3, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import StrategicContext from '../components/StrategicContext';
import KeyTakeaways from '../components/KeyTakeaways';
import StrategicConclusion from '../components/StrategicConclusion';

const Diagnostico360Article = ({ onCTAClick }: { onCTAClick?: () => void }) => {
    return (
        <article className="w-full mx-auto">
            {/* Hero Banner */}


            <div className="prose prose-base md:prose-lg lg:prose-xl max-w-none text-gray-900 leading-relaxed">

                <StrategicContext label="Diagnóstico">
                    Um funil de vendas "furado" é a causa #1 de estagnação em empresas B2B. Aumentar o tráfego em um funil ruim é queimar dinheiro.
                </StrategicContext>

                <KeyTakeaways
                    title="Key Takeaways"
                    items={[
                        { title: "Topo, Meio e Fundo", description: "Onde está o gargalo? Topo (Pouco Lead), Meio (Baixa Conversão) ou Fundo (Baixo Fechamento)?" },
                        { title: "Dados vs Opinião", description: "Pare de 'achar' que o problema é preço. Olhe para os dados de conversão por etapa." },
                        { title: "Alinhamento Mkt-Vendas", description: "O maior vazamento costuma estar na passagem de bastão (Handoff). Leads são ignorados ou abordados tarde demais." },
                        { title: "Tecnologia", description: "Seu CRM está ajudando ou atrapalhando? Dados sujos impedem diagnósticos precisos." }
                    ]}
                />

                <div className="mb-16">
                    <h2 id="intro" className="font-bold tracking-tight text-gray-900 mt-0">O Sintoma vs A Doença</h2>
                    <p className="text-lg md:text-xl text-gray-600 leading-relaxed">
                        Muitas empresas acham que precisam de "mais leads". Mas quando olhamos o funil, vemos que 70% dos leads atuais são desperdiçados. O diagnóstico 360° serve para identificar a "doença" real.
                    </p>
                </div>

                <div className="mb-20">
                    <h2 className="font-bold text-gray-900 mb-8">Os 4 Pilares do Diagnóstico</h2>
                    <div className="grid md:grid-cols-2 gap-6 not-prose">
                        <Card className="p-6 border-l-4 border-l-revgreen">
                            <h3 className="font-bold text-lg mb-2 flex items-center gap-2"><Target className="w-5 h-5" /> Processos</h3>
                            <p className="text-sm text-gray-600">Existe um playbook claro? O time segue? As etapas do funil estão bem definidas?</p>
                        </Card>
                        <Card className="p-6 border-l-4 border-l-revgreen">
                            <h3 className="font-bold text-lg mb-2 flex items-center gap-2"><BarChart3 className="w-5 h-5" /> Métricas</h3>
                            <p className="text-sm text-gray-600">Você sabe seu CAC, LTV e Taxas de Conversão entre etapas? Sem isso, você voa no escuro.</p>
                        </Card>
                        <Card className="p-6 border-l-4 border-l-revgreen">
                            <h3 className="font-bold text-lg mb-2 flex items-center gap-2"><AlertTriangle className="w-5 h-5" /> Pessoas</h3>
                            <p className="text-sm text-gray-600">O time tem as skills necessárias? A compensação incentiva o comportamento certo?</p>
                        </Card>
                        <Card className="p-6 border-l-4 border-l-revgreen">
                            <h3 className="font-bold text-lg mb-2 flex items-center gap-2"><Search className="w-5 h-5" /> Tecnologia</h3>
                            <p className="text-sm text-gray-600">As ferramentas estão integradas? Os dados fluem ou ficam em silos?</p>
                        </Card>
                    </div>
                </div>

                <StrategicConclusion
                    title="Onde seu funil vaza?"
                    description="Identifique e corrija os gargalos com nossa planilha calculadora de ROI e Diagnóstico."
                    ctaText="Baixar Calculadora ROI"
                    leadMagnetId="roi-calculator"
                    onCTAClick={onCTAClick}
                />

            </div>
        </article>
    );
};

export default Diagnostico360Article;
