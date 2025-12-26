import { Crosshair, Users, MessageSquare, ArrowRight } from 'lucide-react';
import StrategicContext from '../components/StrategicContext';
import KeyTakeaways from '../components/KeyTakeaways';
import StrategicConclusion from '../components/StrategicConclusion';
import { Card } from '@/components/ui/card';

const ABMPracticeArticle = ({ onCTAClick }: { onCTAClick?: () => void }) => {
    return (
        <article className="w-full mx-auto">
            {/* Hero Banner */}
            <div className="mb-12 rounded-xl overflow-hidden shadow-2xl border border-white/10 bg-black">
                <img
                    src="/images/blog-v2/blog_abm_practical.png"
                    alt="ABM na Prática"
                    className="w-full h-auto object-cover opacity-90"
                />
            </div>

            <div className="prose prose-base md:prose-lg lg:prose-xl max-w-none text-gray-900 leading-relaxed">

                <StrategicContext label="Estratégia">
                    Account-Based Marketing (ABM) não é "marketing para empresas". É tratar cada conta alvo como um mercado individual. É pesca com arpão, não com rede.
                </StrategicContext>

                <KeyTakeaways
                    title="Key Takeaways"
                    items={[
                        { title: "Ideal Customer Profile (ICP)", description: "ABM começa na lista. Se sua lista de contas alvo é ruim, sua campanha será ruim." },
                        { title: "Personalização Extrema", description: "Não envie e-mails genéricos. Entenda as dores específicas daquela empresa e daquele stakeholder." },
                        { title: "Orquestração", description: "Marketing aquece, Vendas aborda, Executivos se conectam. É um trabalho de time." }
                    ]}
                />

                <div className="mb-16">
                    <h2 id="intro" className="font-bold tracking-tight text-gray-900 mt-0">Caçando Baleias</h2>
                    <p className="text-lg md:text-xl text-gray-600 leading-relaxed">
                        Para fechar contratos Enterprise de 6 ou 7 dígitos, inbound marketing passivo não funciona. Você precisa ir ativamente atrás das contas que podem comprar de você.
                    </p>
                </div>

                <div className="mb-20">
                    <h2 className="font-bold text-gray-900 mb-8">Os 3 Tipos de ABM</h2>
                    <div className="space-y-6 not-prose">
                        <div className="flex gap-4 p-4 bg-gray-50 rounded-lg border border-gray-100">
                            <div className="font-bold text-revgreen text-xl">1:1</div>
                            <div>
                                <h3 className="font-bold text-gray-900 m-0">Strategic ABM</h3>
                                <p className="text-sm text-gray-600 m-0">Foco em &lt; 50 contas chave. Personalização total (landing pages dedicadas, eventos exclusivos).</p>
                            </div>
                        </div>
                        <div className="flex gap-4 p-4 bg-gray-50 rounded-lg border border-gray-100">
                            <div className="font-bold text-revgreen text-xl">1:Few</div>
                            <div>
                                <h3 className="font-bold text-gray-900 m-0">ABM Lite</h3>
                                <p className="text-sm text-gray-600 m-0">Foco em clusters (segmentos/indústrias). Conteúdo adaptado para o setor.</p>
                            </div>
                        </div>
                        <div className="flex gap-4 p-4 bg-gray-50 rounded-lg border border-gray-100">
                            <div className="font-bold text-revgreen text-xl">1:Many</div>
                            <div>
                                <h3 className="font-bold text-gray-900 m-0">Programmatic ABM</h3>
                                <p className="text-sm text-gray-600 m-0">Automação para atingir centenas de contas com personalização dinâmica (ex: LinkedIn Ads).</p>
                            </div>
                        </div>
                    </div>
                </div>

                <StrategicConclusion
                    title="Quem são suas Top 50 Contas?"
                    description="Não sabe por onde começar sua lista? Baixe nosso Template de Planejamento de Contas e Segmentação."
                    ctaText="Baixar Templates"
                    leadMagnetId="template"
                    onCTAClick={onCTAClick}
                />

            </div>
        </article>
    );
};

export default ABMPracticeArticle;
