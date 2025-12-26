import { Filter, TrendingDown, TrendingUp } from 'lucide-react';
import StrategicContext from '../components/StrategicContext';
import KeyTakeaways from '../components/KeyTakeaways';
import StrategicConclusion from '../components/StrategicConclusion';

const DiagnosticoFunilComercialArticle = ({ onCTAClick }: { onCTAClick?: () => void }) => {
    return (
        <article className="w-full mx-auto">
            <div className="prose prose-base md:prose-lg lg:prose-xl max-w-none text-gray-900 leading-relaxed">

                <StrategicContext label="Vendas">
                    Se você não mede, você não gerencia. Um pipeline de vendas saudável tem taxas de conversão previsíveis entre etapas. Se varia muito, seu processo está quebrado.
                </StrategicContext>

                <KeyTakeaways
                    title="Key Takeaways"
                    items={[
                        { title: "Definição de Etapas", description: "Cada etapa do funil (Discovery, Demo, Negociação) deve ter gatilhos de saída claros (Exit Criteria)." },
                        { title: "Limpeza de Pipeline", description: "Pipeline inchado é vaidade. Remova oportunidades estagnadas para ter uma visão real da receita futura." },
                        { title: "Tempo de Ciclo", description: "O 'Time to Close' está aumentando? Isso é um sinal de alerta vermelho sobre a qualidade dos leads ou do processo." }
                    ]}
                />

                <div className="mb-16">
                    <h2 id="intro" className="font-bold tracking-tight text-gray-900 mt-0">Onde os Deals Morrem?</h2>
                    <p className="text-lg md:text-xl text-gray-600 leading-relaxed">
                        A maioria dos deals não é perdida para a concorrência. É perdida para a indecisão (o "status quo"). O diagnóstico de funil ajuda a entender por que o cliente parou de responder.
                    </p>
                </div>

                <div className="mb-20">
                    <h2 className="font-bold text-gray-900 mb-8">Etapas Críticas</h2>
                    <ul className="space-y-4 list-none pl-0 not-prose">
                        <li className="flex items-start gap-3">
                            <span className="bg-red-100 text-red-800 font-bold px-2 py-1 text-xs rounded uppercase mt-1">Conexão -&gt; Agendamento</span>
                            <div>
                                <strong className="block text-gray-900">Taxa Baixa?</strong>
                                <span className="text-gray-600">Sua proposta de valor inicial é fraca ou você está falando com a pessoa errada.</span>
                            </div>
                        </li>
                        <li className="flex items-start gap-3">
                            <span className="bg-yellow-100 text-yellow-800 font-bold px-2 py-1 text-xs rounded uppercase mt-1">Demo -&gt; Proposta</span>
                            <div>
                                <strong className="block text-gray-900">Taxa Baixa?</strong>
                                <span className="text-gray-600">Sua demo foi um "tour de features" e não focou na resolução da dor do cliente.</span>
                            </div>
                        </li>
                        <li className="flex items-start gap-3">
                            <span className="bg-green-100 text-green-800 font-bold px-2 py-1 text-xs rounded uppercase mt-1">Proposta -&gt; Fechamento</span>
                            <div>
                                <strong className="block text-gray-900">Taxa Baixa?</strong>
                                <span className="text-gray-600">Falha na negociação, falta de urgência ou campeão interno fraco.</span>
                            </div>
                        </li>
                    </ul>
                </div>

                <StrategicConclusion
                    title="Audite seu Processo Comercial"
                    description="Baixe nosso Checklist de RevOps para auditar as etapas do seu funil de vendas."
                    ctaText="Baixar Checklist"
                    leadMagnetId="checklist"
                    onCTAClick={onCTAClick}
                />

            </div>
        </article>
    );
};

export default DiagnosticoFunilComercialArticle;
