import React from 'react';
import { Filter, TrendingDown, AlertTriangle, CheckCircle2 } from 'lucide-react';
import StrategicContext from '../components/StrategicContext';
import KeyTakeaways from '../components/KeyTakeaways';
import ArticleBlueprint from '../components/ArticleBlueprint';
import ArticleTechStack from '../components/ArticleTechStack';
import ArticleStepsGrid from '../components/ArticleStepsGrid';
import StrategicConclusion from '../components/StrategicConclusion';
import RedFlags from '../components/RedFlags';

const DiagnosticoFunilComercialArticle = ({ onCTAClick }: { onCTAClick?: () => void }) => {
    return (
        <article className="max-w-4xl mx-auto px-6 py-12 font-sans text-gray-900 leading-relaxed">

            {/* Strategic Context */}
            <StrategicContext label="Arquitetura de Vendas">
                <p className="text-xl font-medium text-gray-900">
                    Se você não sabe onde seu dinheiro está emperrando, você está sangrando receita.
                    A maioria dos times de vendas opera no "feeling", ignorando que um funil comercial é um
                    <span className="font-bold border-b border-revgreen mx-1">sistema hidráulico</span>.
                    Se há vazamento na conexão (Demo → Proposta), aumentar a pressão da água (Lead Generation) só vai molhar o chão, não encher o balde.
                </p>
            </StrategicContext>

            {/* Key Takeaways */}
            <KeyTakeaways
                title="Protocolo de Diagnóstico"
                items={[
                    { title: "Exit Criteria Rigorosos", description: "Um deal nunca deve avançar de etapa 'porque o cliente gostou'. Defina critérios binários (Sim/Não) para cada movimento no CRM." },
                    { title: "Saneamento de Pipeline", description: "Pipeline inchado é métrica de vaidade. Se o lead não responde a 3 follow-ups ou perdeu o prazo estipulado, mova para 'Lost' ou 'Nurture'. Mantenha o foco no que é real." },
                    { title: "Análise de Gargalo (Bottleneck)", description: "Identifique a 'Etapa da Morte' onde a conversão cai abaixo de 20%. É ali que você deve concentrar 80% do seu esforço de treinamento e engenharia." }
                ]}
            />

            {/* Introduction */}
            <div className="mb-16">
                <h2 className="text-3xl font-bold mb-6 text-gray-900 tracking-tight">Onde os Deals Morrem?</h2>
                <p className="text-lg text-gray-600 mb-8 font-light leading-relaxed">
                    A morte silenciosa de um deal raramente acontece na resposta "Não". Ela acontece no "Vou ver internamente e te retorno".
                    A falta de tensão e compromisso (Next Steps) é o que mata pipelines. Vamos dissecar as falhas estruturais mais comuns.
                </p>
            </div>

            {/* Blueprint 01: O Pipeline à Prova de Bala */}
            <ArticleBlueprint
                title="O Pipeline à Prova de Bala"
                number="01"
                description="Uma arquitetura de funil onde o movimento é consequência de validação técnica, não de otimismo do vendedor."
                items={[
                    {
                        label: "Etapa 1: Discovery",
                        content: <span><strong>Exit Criteria:</strong> Dor quantificada em R$ OU horas perdidas identificada + Decisor Confirmado presente na próxima call.</span>
                    },
                    {
                        label: "Etapa 2: Demo",
                        content: <span><strong>Exit Criteria:</strong> Cliente verbalizou que a solução resolve a dor identificada na Etapa 1 + Cronograma de implementação validado pelo cliente.</span>
                    },
                    {
                        label: "Etapa 3: Proposta",
                        content: <span><strong>Exit Criteria:</strong> Valor aprovado pelo influenciador (Champion) + Processo de compras mapeado (quem assina, prazo legal).</span>,
                        isHighlight: true
                    },
                    {
                        label: "Etapa 4: Negociação",
                        content: <span><strong>Exit Criteria:</strong> Minuta contratual enviada + Data de assinatura agendada no calendário.</span>
                    },
                    {
                        label: "Action]",
                        content: "Configure 'Validation Rules' no seu CRM para impedir o avanço de etapa sem preenchimento desses campos obrigatórios.",
                        isAction: true
                    }
                ]}
                result="Previsibilidade de Revenue acima de 90% para o mês corrente."
            />

            {/* Tech Stack */}
            <ArticleTechStack
                title="Stack de Auditoria de Vendas"
                items={[
                    { role: "CRM Core", tools: "Salesforce / HubSpot" },
                    { role: "Call Intelligence", tools: "Gong / Clari Copilot" },
                    { role: "Pipeline Analytics", tools: "Tableau / InsightSquared" },
                    { role: "Sales Engagement", tools: "Outreach / Apollo.io" }
                ]}
            />

            {/* Red Flags Section */}
            <RedFlags
                title="Sinais de Colapso do Funil"
                flags={[
                    "Deals parados na mesma etapa por mais de 30 dias (Zombie Pipeline)",
                    "Taxa de conversão de Proposta para Fechamento abaixo de 30%",
                    "Vendedores não sabem explicar POR QUE perderam um deal ('O cliente sumiu')",
                    "Desconto médio acima de 15% para fechar contratos no fim do mês"
                ]}
            />

            {/* Steps Grid: How to Unblock */}
            <ArticleStepsGrid
                title="Protocolo de Desbloqueio Imediato"
                steps={[
                    {
                        number: "01",
                        title: "Purge Day (O Expurgo)",
                        description: "Reúna o time e elimine impiedosamente qualquer oportunidade sem 'Next Step' agendado nos últimos 14 dias. Mova para 'Recycle'. Limpe a visão.",
                        isHighlight: false
                    },
                    {
                        number: "02",
                        title: "Auditoria de Calls",
                        description: "Ouça as últimas 10 calls perdidas na etapa de Proposta. Identifique o padrão: foi preço ou foi falha em vender valor? Ajuste o script.",
                        isHighlight: true
                    },
                    {
                        number: "03",
                        title: "Campanha de Retomada",
                        description: "Para os deals removidos no passo 1, crie uma sequência automatizada de 'Breakup Email' de baixa fricção para tentar reativar interesse genuíno.",
                        isHighlight: false
                    }
                ]}
            />

            {/* CTA */}
            <StrategicConclusion
                title="Seu Funil está mentindo para você?"
                description="Não construa previsões de receita baseadas em esperança. Nossa auditoria de RevOps identifica os vazamentos invisíveis e implementa a infraestrutura para corrigi-los em 30 dias."
                ctaText="Agendar Diagnóstico de Funil"
                leadMagnetId="template"
                onCTAClick={onCTAClick}
            />

        </article>
    );
};

export default DiagnosticoFunilComercialArticle;
