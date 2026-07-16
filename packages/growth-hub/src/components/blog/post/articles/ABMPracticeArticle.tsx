import React from 'react';
import { Crosshair, Users, MessageSquare, Target } from 'lucide-react';
import StrategicContext from '../components/StrategicContext';
import KeyTakeaways from '../components/KeyTakeaways';
import ArticleBlueprint from '../components/ArticleBlueprint';
import ArticleTechStack from '../components/ArticleTechStack';
import ArticleStepsGrid from '../components/ArticleStepsGrid';
import StrategicConclusion from '../components/StrategicConclusion';
import ArticleCTA from '../components/ArticleCTA';
import RedFlags from '../components/RedFlags';

const ABMPracticeArticle = ({ onCTAClick }: { onCTAClick?: () => void }) => {
    return (
        <article className="max-w-4xl mx-auto px-6 py-12 font-sans text-gray-900 leading-relaxed">

            {/* Strategic Context */}
            <StrategicContext label="Enterprise Growth">
                <p className="text-xl font-medium text-gray-900">
                    Marketing tradicional é pescar com rede: você pega muitos peixes pequenos e muito lixo.
                    <span className="font-bold border-b border-revgreen mx-1">Account-Based Marketing (ABM)</span>
                    é pescar com arpão. Você escolhe o alvo, estuda o movimento dele e dispara com precisão letal.
                    Se você vende contratos acima de R$ 50k/ano, Inbound genérico é desperdício de munição.
                </p>
            </StrategicContext>

            {/* Key Takeaways */}
            <KeyTakeaways
                title="Protocolo Alpha"
                items={[
                    { title: "Definição de ICP Real", description: "Esqueça 'Empresas de Tecnologia'. Seu alvo é 'SaaS B2B, Series B, >200 funcionários, usando Salesforce'." },
                    { title: "Orquestração Multicanal", description: "Não é só anúncio. É anúncio + e-mail do CEO + envio físico (Direct Mail) + conexão no LinkedIn. Tudo na mesma semana." },
                    { title: "Personalização Radical", description: "Se o seu e-mail serve para duas empresas diferentes, ele é genérico. ABM exige contexto específico da conta." }
                ]}
            />

            {/* Introduction */}
            <div className="mb-16">
                <h2 className="text-3xl font-bold mb-6 text-gray-900 tracking-tight">Os 3 Níveis de Ataque</h2>
                <p className="text-lg text-gray-600 mb-8 font-light leading-relaxed">
                    Muitas empresas falham no ABM porque tentam fazer "personalização artesanal" para 1.000 contas.
                    Isso é insustentável. O segredo é segmentar sua lista em camadas (Tiers) e ajustar o esforço de engenharia para cada uma.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border border-gray-200 bg-gray-50 p-6">
                    <div className="p-4 bg-white border border-gray-100 shadow-sm">
                        <div className="font-black text-revgreen text-2xl mb-1">Tier 1</div>
                        <h3 className="font-bold text-black text-sm uppercase tracking-wide mb-2">Strategic (1:1)</h3>
                        <p className="text-xs text-gray-500">Top 10 contas. Orçamento ilimitado. Campanha feita do zero exclusivamente para elas.</p>
                    </div>
                    <div className="p-4 bg-white border border-gray-100 shadow-sm">
                        <div className="font-black text-black text-2xl mb-1">Tier 2</div>
                        <h3 className="font-bold text-black text-sm uppercase tracking-wide mb-2">Scale (1:Few)</h3>
                        <p className="text-xs text-gray-500">Top 50 contas. Segmentadas por indústria. Conteúdo adaptado, não exclusivo.</p>
                    </div>
                    <div className="p-4 bg-white border border-gray-100 shadow-sm">
                        <div className="font-black text-gray-400 text-2xl mb-1">Tier 3</div>
                        <h3 className="font-bold text-black text-sm uppercase tracking-wide mb-2">Programmatic (1:Many)</h3>
                        <p className="text-xs text-gray-500">Top 500 contas. Personalização via token (Nome/Empresa) e Ads dinâmicos.</p>
                    </div>
                </div>
            </div>

            {/* Blueprint 01: A Campanha de Cerco (Tier 1) */}
            <ArticleBlueprint
                title="A Campanha de Cerco (Tier 1)"
                number="01"
                description="Como penetrar uma conta Enterprise que ignora seus e-mails há 6 meses. O protocolo de 4 semanas."
                items={[
                    {
                        label: "Semana 1: Radar",
                        content: <span><strong>Soft Touch:</strong> Ads no LinkedIn focados apenas nos decisores da conta (IP-Based targeting). Engajamento 'leve' (likes/comments) em posts dos VPs. Nenhuma abordagem direta.</span>
                    },
                    {
                        label: "Semana 2: O Presente",
                        content: <span><strong>Direct Mail:</strong> Envio de um kit físico (livro, relatório impresso, item personalizado) para a mesa do Decisor. O objetivo não é suborno, é 'Pattern Interrupt'.</span>
                    },
                    {
                        label: "Semana 3: O Ataque",
                        content: <span><strong>Orquestração:</strong> No dia da entrega do pacote, o SDR liga. O CEO da sua empresa envia um e-mail para o CEO deles. O VP de Vendas adiciona no LinkedIn. Cerco total.</span>,
                        isHighlight: true
                    },
                    {
                        label: "Semana 4: Conversão",
                        content: <span><strong>O Convite:</strong> Convite para um 'Workshop de Diagnóstico' ou 'Benchmarking', não para uma demo de software. Venda o valor da reunião, não o produto.</span>
                    },
                    {
                        label: "Action]",
                        content: "Mapeie a hierarquia da conta no CRM (Quem é o Champion? Quem é o Detrator? Quem assina o cheque?).",
                        isAction: true
                    }
                ]}
                result="Taxa de abertura de porta de 40% em contas F500."
            />

            {/* Tech Stack */}
            <ArticleTechStack
                title="Stack de ABM Moderno"
                items={[
                    { role: "Intent Data", tools: "6sense / Bombora" },
                    { role: "Ad Targeting", tools: "LinkedIn / Terminus" },
                    { role: "Personalization", tools: "Mutiny / Uberflip" },
                    { role: "Gifting/Direct Mail", tools: "Reachdesk / Sendoso" }
                ]}
            />

            {/* Red Flags Section */}
            <RedFlags
                title="Por que seu ABM vai falhar"
                flags={[
                    "Vendas e Marketing desalinhados (Marketing gera 'leads', Vendas ignora)",
                    "Falta de paciência (O ciclo de vendas Enterprise é de 6-12 meses, não espere ROI em 30 dias)",
                    "Conteúdo fraco (Enviar whitepaper genérico para um CTO é pedir para ser bloqueado)",
                    "Medir MQLs em vez de 'Engajamento na Conta' e 'Pipeline Gerado'"
                ]}
            />

            {/* Steps Grid: Execution Plan */}
            <ArticleStepsGrid
                title="Lançando o Piloto em 30 Dias"
                steps={[
                    {
                        number: "01",
                        title: "Seleção (Dia 1-7)",
                        description: "Use dados de intenção e firmográficos para selecionar as 20 contas com maior propensão de compra. Valide com o time de vendas.",
                        isHighlight: false
                    },
                    {
                        number: "02",
                        title: "Intelligence (Dia 8-14)",
                        description: "Crie dossiês de inteligência para cada conta. Notícias recentes, relatórios anuais, podcasts onde os diretores falaram.",
                        isHighlight: true
                    },
                    {
                        number: "03",
                        title: "Ativação (Dia 15+)",
                        description: "Inicie a campanha de Ads e a cadência de prospecção personalizada baseada nos dossiês criados.",
                        isHighlight: false
                    }
                ]}
            />

            {/* CTA */}
            <StrategicConclusion
                title="Quer construir sua Lista de Baleias?"
                description="Não desperdice recursos tentando vender para quem não tem fit. Nossa consultoria de ABM ajuda a definir seu ICP Enterprise e montar a estratégia de ataque."
                ctaText="Agendar Consultoria de ABM"
                leadMagnetId="template"
                onCTAClick={onCTAClick}
            />

        </article>
    );
};

export default ABMPracticeArticle;
