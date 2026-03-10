import React from 'react';
import { EditableField } from '@/components/plan/PlanEditContext';
import { User } from 'lucide-react';
import SectionHeader from '@/components/plan/SectionHeader';

// ── Default Roadmap Phases ────────────────────────────────────────────────
const defaultPhases = [
    {
        period: 'Dia 1 a 7', title: 'Kick-Off e Alinhamento', owner: 'RevHackers e Cliente',
        tasks: [
            { task: 'Reunião inaugural: expectativas, metas e responsabilidades por área', key: true },
            { task: 'Liberação de acessos: Meta Ads, Google Ads, LinkedIn, Analytics, CRM e Site', key: true },
            { task: 'Entrega e validação formal do Planejamento Estratégico', key: false },
            { task: 'Definição de OKRs e Resultados-Chave com targets numéricos por canal', key: false },
            { task: 'Onboarding de stakeholders: quem aprova o quê e em qual prazo', key: false },
        ],
        output: 'Planejamento validado, acessos liberados e OKRs acordados com o cliente',
    },
    {
        period: 'Dia 7 a 21', title: 'Fundação Técnica e Revenue Stack', owner: 'RevHackers',
        tasks: [
            { task: 'CRM implementado com estágios de pipeline, campos obrigatórios e automações básicas', key: true },
            { task: 'Configuração de DNS, SPF, DKIM e DMARC para entregabilidade de e-mail', key: true },
            { task: 'Integração de formulários de captura ao CRM com alertas automáticos de novo lead', key: false },
            { task: 'UTMs padronizados por canal, campanha e criativo antes de qualquer mídia', key: false },
            { task: 'Rastreamento de conversões validado: clique, lead, oportunidade e fechamento', key: false },
        ],
        output: 'CRM operante, rastreamento completo e pipeline com automações ativas',
    },
    {
        period: 'Dia 21 a 45', title: 'Geração de Demanda', owner: 'RevHackers',
        tasks: [
            { task: 'Ativação de campanhas Meta Ads com 3 variações de copy e 2 criativos por variação', key: false },
            { task: 'Ativação Google Ads Search com palavras-chave de alta intenção e lista de negativas', key: false },
            { task: 'Sequência de nutrição em e-mail: 7 pontos de contato automáticos para novos leads', key: false },
            { task: 'Análise dos primeiros dados: custo por lead, CTR e taxa de conversão por canal', key: false },
            { task: 'Prospecção ativa para lista de contas prioritárias: 50 contatos por semana', key: false },
        ],
        output: 'Campanhas no ar, primeiros leads qualificados no pipeline e SDR em operação',
    },
    {
        period: 'Dia 45 a 90', title: 'Otimização e Escala', owner: 'RevHackers e Cliente',
        tasks: [
            { task: 'Realocação de verba para o canal com menor custo de aquisição validado', key: false },
            { task: 'Desativação de variações com CTR abaixo de 1% e custo por lead acima do benchmark', key: false },
            { task: 'Segundo momento de entrega: resultado tangível apresentado ao cliente', key: true },
            { task: 'Revisão do trimestre: CAC real, LTV estimado e velocidade de pipeline calculada', key: true },
            { task: 'Playbook documentado e proposta de expansão baseada em dados reais do período', key: false },
        ],
        output: 'CAC validado, LTV:CAC acima de 2:1 e playbook documentado para o próximo trimestre',
    },
];

const milestones = [
    { dia: 'Dia 1', titulo: 'Kick-Off', desc: 'Planejamento validado e acessos liberados', destaque: false },
    { dia: 'Dia 21', titulo: 'Fundação Completa', desc: 'CRM, rastreamento e automações em operação', destaque: false },
    { dia: 'Dia 35', titulo: 'Campanhas no Ar', desc: 'Leads entrando e SDR ativo no pipeline', destaque: true },
    { dia: 'Dia 60', titulo: 'Segunda Entrega', desc: 'Resultado tangível apresentado ao cliente', destaque: false },
    { dia: 'Dia 90', titulo: 'Revisão do Quarter', desc: 'CAC validado e escala autorizada com dados', destaque: false },
];

export default function RoadmapSection({ plan }: { plan: any }) {
    // Backend uses "name" and "items" (array of strings) instead of "period" and "tasks" (objects).
    // Let's normalize data here gracefully without breaking editable fields (which bind blindly).
    const rawPhases = plan?.roadmap_data?.phases || defaultPhases;

    const phases = rawPhases.map((p: any) => ({
        ...p,
        period: p.period || p.name || 'Dia N',
        owner: p.owner || 'Equipe',
        output: p.output || 'A ser definido',
        tasks: p.tasks ? p.tasks : (p.items || []).map((item: string) => ({ task: item, key: false }))
    }));

    return (
        <div className="flex flex-col h-full bg-white overflow-y-auto w-full">
            <div className="flex-none p-6 md:p-10 lg:p-12 pb-0">
                <SectionHeader
                    eyebrow="Execução"
                    titleLine1="Cronograma"
                    titleLine2="90 Dias"
                    description="Tabela semanal com ações, responsáveis e entrega por fase"
                />
            </div>

            <div className="flex-1 p-6 md:p-10 lg:p-12 pt-0 max-w-[1600px] mx-auto w-full bg-white space-y-10">

                {/* Table */}
                <div className="border border-zinc-200 overflow-hidden">
                    {/* Header row */}
                    <div className="grid grid-cols-12 bg-zinc-50 text-zinc-500 border-b border-zinc-200">
                        <div className="col-span-2 px-5 py-3 text-xs uppercase tracking-widest font-black border-r border-zinc-200">Período</div>
                        <div className="col-span-5 px-5 py-3 text-xs uppercase tracking-widest font-black border-r border-zinc-200">Ações</div>
                        <div className="col-span-2 px-5 py-3 text-xs uppercase tracking-widest font-black border-r border-zinc-200">Responsável</div>
                        <div className="col-span-3 px-5 py-3 text-xs uppercase tracking-widest font-black">Entrega</div>
                    </div>
                    {/* Rows */}
                    {phases.map((phase, i) => {
                        const isOdd = i % 2 === 1;
                        return (
                            <div key={i} className={`grid grid-cols-12 border-t border-zinc-200 ${isOdd ? 'bg-zinc-50' : 'bg-white'}`}>
                                <div className="col-span-2 px-5 py-5 border-r border-zinc-200">
                                    <span className="text-xs font-black text-zinc-400 uppercase tracking-widest block mb-1">{phase.period}</span>
                                    <EditableField path={`roadmap_data.phases.${i}.title`} className="text-base font-bold text-black leading-snug" placeholder={phase.title} />
                                </div>
                                <div className="col-span-5 px-5 py-5 border-r border-zinc-200">
                                    <ul className="space-y-2.5">
                                        {phase.tasks.map((task: any, j: number) => (
                                            <li key={j} className="flex items-start gap-2">
                                                <div className={`w-1.5 h-1.5 rounded-full mt-2 shrink-0 ${task.key ? 'bg-[#00CC6A]' : 'bg-zinc-300'}`} />
                                                <EditableField
                                                    path={plan?.roadmap_data?.phases[i]?.items
                                                        ? `roadmap_data.phases.${i}.items.${j}`
                                                        : `roadmap_data.phases.${i}.tasks.${j}.task`}
                                                    className={`text-sm leading-relaxed ${task.key ? 'text-zinc-900 font-semibold' : 'text-zinc-600'}`}
                                                    placeholder={typeof task === 'string' ? task : task?.task}
                                                />
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                                <div className="col-span-2 px-5 py-5 border-r border-zinc-200">
                                    <div className="flex items-center gap-1.5">
                                        <User className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                                        <span className="text-xs text-zinc-500 font-medium leading-snug">{phase.owner}</span>
                                    </div>
                                </div>
                                <div className="col-span-3 px-5 py-5">
                                    <EditableField path={`roadmap_data.phases.${i}.output`} className="text-xs text-zinc-500 leading-relaxed" placeholder={phase.output} multiline />
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Milestones */}
                <div className="grid grid-cols-5 gap-3">
                    {milestones.map((m, i) => (
                        <div key={i} className={`p-5 rounded-xl transition-shadow ${m.destaque ? 'bg-black shadow-lg shadow-black/10' : 'border border-zinc-200 bg-white shadow-sm hover:shadow-md'}`}>
                            <span className={`font-mono text-xs font-black uppercase tracking-widest block mb-1.5 ${m.destaque ? 'text-[#00CC6A]' : 'text-zinc-400'}`}>{m.dia}</span>
                            <h4 className={`font-bold text-sm mb-1.5 leading-snug ${m.destaque ? 'text-white' : 'text-black'}`}>{m.titulo}</h4>
                            <p className={`text-[11px] leading-relaxed ${m.destaque ? 'text-white/60' : 'text-zinc-500'}`}>{m.desc}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
