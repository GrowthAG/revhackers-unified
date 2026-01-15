
import { CheckCircle2, Calendar, FileText, Users, PlayCircle, BarChart3 } from "lucide-react";

const timelineItems = [
    {
        period: "Semanas 1-2",
        title: "Ciclo 01: Embarque",
        icon: Users,
        items: [
            "Criação dos acessos ao Hub",
            "Reunião de Handoff (Transição)",
            "Auditoria inicial de dados",
            "Agendamento do Kickoff"
        ],
        color: "bg-black text-white border-black"
    },
    {
        period: "Semanas 3-4",
        title: "Ciclo 02: Estratégia",
        icon: FileText,
        items: [
            "Workshop de Definição de KPIs",
            "Validação do Cronograma",
            "Mapeamento de Processos",
            "Treinamento Inicial da Equipe"
        ],
        color: "bg-zinc-100 text-zinc-900 border-zinc-200"
    },
    {
        period: "Mês 2",
        title: "Ciclo 03: Adoção",
        icon: PlayCircle,
        items: [
            "Execução das Estratégias GTM",
            "Acompanhamento Semanal",
            "Ajustes de Rota",
            "Primeiros Resultados (Quick Wins)"
        ],
        color: "bg-zinc-100 text-zinc-900 border-zinc-200"
    },
    {
        period: "Mês 3",
        title: "Ciclo 04: Valor",
        icon: BarChart3,
        items: [
            "Análise de ROI Trimestral",
            "Apresentação de QBR",
            "Definição de Metas de Expansão",
            "Início do Plano de Crescimento"
        ],
        color: "bg-zinc-100 text-zinc-900 border-zinc-200"
    }
];

export function First90Days() {
    return (
        <section className="space-y-12 pt-12 pb-12" id="first-90-days">
            <div className="text-center space-y-4">
                <div className="flex items-center justify-center gap-2">
                    <span className="h-[1px] w-8 bg-zinc-200" />
                    <h3 className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.3em] flex items-center gap-2 font-mono">
                         // JOURNEY_TIMELINE
                    </h3>
                    <span className="h-[1px] w-8 bg-zinc-200" />
                </div>
                <h2 className="text-3xl font-black text-zinc-900 tracking-ultratight uppercase">Seus Primeiros 90 Dias</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-0 max-w-7xl mx-auto border-2 border-zinc-900">
                {timelineItems.map((item, index) => {
                    const Icon = item.icon;
                    return (
                        <div key={index} className={`relative p-8 transition-all bg-white border-r-2 last:border-r-0 border-zinc-900 group hover:bg-zinc-50`}>
                            {/* Header */}
                            <div className="flex flex-col gap-5 mb-8">
                                <div className={`w-fit px-3 py-1 text-[10px] font-black uppercase tracking-widest border-2 ${item.color}`}>
                                    {item.period}
                                </div>
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        <Icon className="w-4 h-4 text-black" strokeWidth={2.5} />
                                        <h4 className="font-black text-zinc-900 text-sm uppercase tracking-tight">{item.title}</h4>
                                    </div>
                                </div>
                            </div>

                            {/* List */}
                            <ul className="space-y-4">
                                {item.items.map((subItem, idx) => (
                                    <li key={idx} className="flex items-start gap-3 text-[11px] text-zinc-600 font-medium leading-relaxed group-hover:text-black transition-colors">
                                        <div className="w-1.5 h-1.5 rounded-full bg-zinc-200 mt-1 shrink-0 group-hover:bg-revgreen transition-colors" />
                                        <span>{subItem}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    );
                })}
            </div>

            <div className="text-center">
                <p className="text-[9px] text-zinc-400 font-bold uppercase tracking-widest font-mono">
                    // SLA_ESTIMATED_DELIVERY_PROTOCOL
                </p>
            </div>
        </section>
    );
}
