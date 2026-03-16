import React from 'react';
import { ArrowRight } from 'lucide-react';
import { EditableField } from '@/components/plan/PlanEditContext';
import SectionHeader from '@/components/plan/SectionHeader';

// ── Fallback states by project type ───────────────────────────────────────
const fallbackByType: Record<string, { current: string[]; future: string[] }> = {
    crm_ops: {
        current: [
            'Dados de vendas espalhados entre planilhas, WhatsApp e e-mails',
            'Sem visibilidade real sobre taxas de conversão por etapa',
            'Passagem de bastão Marketing → Vendas informal e inconsistente',
            'Decisões comerciais baseadas em feeling, não em dados',
            'Forecast de receita impreciso e reativo',
        ],
        future: [
            'CRM centralizado como única fonte da verdade da operação',
            'Dashboard em tempo real com conversão por etapa, vendedor e origem',
            'Automação de passagem de bastão com SLA metrificado',
            'Governança ativa com Revisão de Pipeline semanal baseada em dados',
            'Previsibilidade de receita com pipeline orientado por métricas',
        ],
    },
    founder: {
        current: [
            'Autoridade concentrada em network pessoal e indicações',
            'Perfil do LinkedIn sem posicionamento claro para o ICP',
            'Publicações esporádicas e sem estratégia de conversão',
            'Zero inbound qualificado originado de conteúdo',
            'Dependência total de cold outreach para gerar pipeline',
        ],
        future: [
            'Posicionamento cirúrgico: nicho, POV e headline que atraem o ICP',
            'Cadência sustentável de 3x/semana com banco de conteúdo',
            'Audiência qualificada 3–5x maior dentro do perfil ideal',
            '4–12 oportunidades inbound/mês originadas de conteúdo',
            'Loop de conversão: seguidor → conexão → conversa → chamada',
        ],
    },
    dev: {
        current: [
            'Site com performance abaixo dos padrões (LCP > 4s)',
            'Experiência mobile comprometida e sem responsividade real',
            'Sem rastreamento de conversões e comportamento do visitante',
            'Design desatualizado que não reflete o posicionamento da empresa',
            'Estrutura que dificulta SEO e indexação orgânica',
        ],
        future: [
            'Site com LCP < 2.5s e GTmetrix ≥ 90 em todos os dispositivos',
            'Mobile-first design com UX aprovada antes do desenvolvimento',
            'Rastreamento completo: Analytics, pixels e eventos de conversão',
            'Design alinhado ao posicionamento com foco em conversão',
            'Arquitetura SEO-ready com sitemap, meta tags e estrutura semântica',
        ],
    },
    default: {
        current: [
            'Geração de demanda dependente de um único canal ou tática isolada',
            'Pipeline sem governança: leads entram mas não há visibilidade de conversão',
            'CAC descontrolado e sem relação clara com LTV do cliente',
            'Rastreamento parcial: não sabe exatamente de onde vem cada deal',
            'Onboarding do cliente inconsistente, impactando retenção e expansão',
        ],
        future: [
            'Motor de Receita com 3 fontes de demanda paralelas (Seeds, Nets, Spears)',
            'Pipeline com etapas claras, responsáveis e SLA de avanço metrificado',
            'CAC rastreado por canal e LTV:CAC ≥ 3:1 como critério de escala',
            'Rastreamento ponta a ponta: do clique ao fechamento ao sucesso',
            'Onboarding orquestrado: primeiro resultado em 15 dias, cada touchpoint com dono',
        ],
    },
};

export default function CurrentVsFutureSection({ plan }: { plan: any }) {
    const diagnostic = plan?.diagnostic_data || {};
    const projectType = plan?.rei_projects?.type || plan?.project_type || 'default';
    const fallback = fallbackByType[projectType] || fallbackByType.default;

    const aiData = diagnostic.current_vs_future || {};
    const currentItems = aiData.current || fallback.current;
    const futureItems = aiData.future || fallback.future;

    return (
        <div className="flex flex-col h-full bg-white overflow-y-auto w-full">
            <div className="flex-none px-6 md:px-10 lg:px-14 py-8 pb-4">
                <SectionHeader
                    eyebrow="Transformação"
                    titleLine1="Estado Atual"
                    titleLine2="vs Futuro"
                    description="A distância entre onde você está hoje e onde vai chegar com a execução deste plano."
                />
            </div>

            <div className="flex-1 px-6 md:px-10 lg:px-14 pb-14 pt-2 w-full">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 border border-zinc-200 rounded-2xl overflow-hidden">

                    {/* Current State - Light */}
                    <div className="bg-white p-8 md:p-10 border-b lg:border-b-0 lg:border-r border-zinc-200">
                        <div className="flex items-center gap-3 mb-8">
                            <div className="w-3 h-3 rounded-full bg-zinc-300" />
                            <span className="text-[10px] font-black uppercase tracking-[0.25em] text-zinc-400">
                                Cenário Atual
                            </span>
                        </div>

                        <div className="space-y-5">
                            {currentItems.map((item: string, i: number) => (
                                <div key={i} className="flex items-start gap-4">
                                    <span className="text-zinc-200 font-bold font-mono text-lg leading-none mt-0.5 shrink-0">
                                        {String(i + 1).padStart(2, '0')}
                                    </span>
                                    <EditableField
                                        path={`diagnostic_data.current_vs_future.current.${i}`}
                                        className="text-[15px] font-medium text-zinc-600 leading-relaxed"
                                        placeholder={item}
                                        multiline
                                    />
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Future State - Dark */}
                    <div className="bg-zinc-950 p-8 md:p-10">
                        <div className="flex items-center gap-3 mb-8">
                            <div className="w-3 h-3 rounded-full bg-[#00CC6A]" />
                            <span className="text-[10px] font-black uppercase tracking-[0.25em] text-[#00CC6A]">
                                Cenário Futuro
                            </span>
                        </div>

                        <div className="space-y-5">
                            {futureItems.map((item: string, i: number) => (
                                <div key={i} className="flex items-start gap-4">
                                    <span className="text-zinc-700 font-bold font-mono text-lg leading-none mt-0.5 shrink-0">
                                        {String(i + 1).padStart(2, '0')}
                                    </span>
                                    <EditableField
                                        path={`diagnostic_data.current_vs_future.future.${i}`}
                                        className="text-[15px] font-medium text-zinc-400 leading-relaxed"
                                        placeholder={item}
                                        multiline
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Transition arrow */}
                <div className="flex items-center justify-center mt-8 gap-4">
                    <div className="h-[2px] flex-1 bg-zinc-100 rounded-full" />
                    <div className="flex items-center gap-2 px-5 py-2.5 bg-zinc-950 rounded-lg">
                        <ArrowRight className="w-4 h-4 text-[#00CC6A]" />
                        <span className="text-[11px] font-bold text-white uppercase tracking-widest">
                            Transformação em {plan?.rei_projects?.project_duration || plan?.roadmap_data?.project_duration || '90 dias'}
                        </span>
                    </div>
                    <div className="h-[2px] flex-1 bg-zinc-100 rounded-full" />
                </div>
            </div>
        </div>
    );
}
