
import { Megaphone, Handshake, Map, Rocket, ScanSearch, TrendingUp } from "lucide-react";

const stages = [
    {
        id: 1,
        name: "Embarque & Handoff",
        engName: "Embark + Handoff",
        icon: Handshake,
        description: "Transição técnica e alinhamento de expectativas",
        duration: "Dia 0-5"
    },
    {
        id: 2,
        name: "Estratégia & Kickoff",
        engName: "Kickoff + Success Plan",
        icon: Map,
        description: "Plano de Sucesso e cronograma estratégico",
        duration: "Dia 5-15"
    },
    {
        id: 3,
        name: "Adoção & Execução",
        engName: "Adopt",
        icon: Rocket,
        description: "Implementação tática e primeiros valores",
        duration: "Dia 15-90"
    },
    {
        id: 4,
        name: "Valor & Expansão",
        engName: "Review + Expand",
        icon: TrendingUp,
        description: "Revisão de ROI (QBR) e novos objetivos",
        duration: "Ongoing"
    }
];

export function OnboardingRoadmap() {
    return (
        <section className="space-y-8" id="onboarding-roadmap">
            <div className="text-center space-y-4">
                <div className="flex items-center justify-center gap-2 mb-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#00CC6A]"></span>
                    <h3 className="text-tiny font-bold text-[#00CC6A] uppercase tracking-[0.2em]">Metodologia Exclusiva</h3>
                </div>
                <h2 className="text-2xl lg:text-3xl font-semibold text-zinc-900 tracking-tight">Onboarding Orquestrado</h2>
                <p className="text-zinc-500 max-w-2xl mx-auto text-sm leading-relaxed">
                    Não vendemos apenas software. Fornecemos um <span className="text-zinc-900 font-medium">Ciclo de Sucesso 4x4</span> desenhado para garantir seu ROI via GTM.
                </p>
            </div>

            <div className="relative pt-8 pb-4">
                {/* Connecting Line (Desktop) */}
                <div className="hidden lg:block absolute top-[45px] left-0 w-full h-[2px] bg-zinc-200 z-0"></div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative z-10">
                    {stages.map((stage, index) => {
                        const Icon = stage.icon;
                        return (
                            <div key={stage.id} className="group relative flex flex-col items-center text-center space-y-4">

                                {/* Icon Circle */}
                                <div className="w-14 h-14 rounded-full bg-white border border-zinc-200 shadow-sm flex items-center justify-center group-hover:border-[#00CC6A] transition-all duration-300 relative z-10">
                                    <Icon className="w-6 h-6 text-zinc-400 group-hover:text-[#00CC6A] transition-colors" strokeWidth={1.5} />

                                    {/* Number Badge */}
                                    <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-zinc-100 border border-white flex items-center justify-center text-xxs font-bold text-zinc-500 group-hover:bg-[#00CC6A] group-hover:text-white transition-colors">
                                        {stage.id}
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="space-y-1.5 px-2">
                                    <span className="text-xxs font-mono uppercase tracking-wider text-[#00CC6A]/80 bg-[#00CC6A]/10 px-2 py-0.5 ">
                                        {stage.duration}
                                    </span>
                                    <h4 className="text-sm font-bold text-zinc-900 leading-tight">
                                        {stage.name}
                                    </h4>
                                    <p className="text-tiny text-zinc-500 leading-snug">
                                        {stage.description}
                                    </p>
                                </div>

                                {/* Mobile Arrow (visible only on mobile/tablet) */}
                                <div className="lg:hidden h-6 w-[1px] bg-zinc-200 last:hidden"></div>
                            </div>
                        )
                    })}
                </div>
            </div>
        </section>
    );
}
