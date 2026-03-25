import { CheckCircle2, Map, Rocket, Lock, Calendar } from 'lucide-react';

interface ProjectTimelineProps {
    currentStage: 0 | 1 | 2 | 3; // 0-indexed: 0=Onboarding, 1=Scheduling, 2=Planning, 3=GoLive
    reiDate?: string;
    planDate?: string;
}

export function ProjectTimeline({ currentStage, reiDate, planDate }: ProjectTimelineProps) {
    const stages = [
        { icon: CheckCircle2, label: 'Embarque & Handoff', status: 'Concluído' },
        { icon: Calendar, label: 'Estratégia & Kickoff', status: 'Pendente' },
        { icon: Map, label: 'Adoção & Execução', status: 'Bloqueado' },
        { icon: Rocket, label: 'Valor & Expansão', status: 'Futuro' }
    ];

    return (
        <div className="w-full bg-white border border-zinc-200 p-6 mb-8 rounded-sm">
            <div className="flex items-center justify-between relative">
                {/* Connecting Line */}
                <div className="absolute top-1/2 left-0 w-full h-[2px] bg-zinc-100 -z-0" />

                {stages.map((stage, index) => {
                    const isActive = currentStage === index;
                    const isCompleted = currentStage > index;
                    const Icon = stage.icon;

                    // Status Logic
                    let statusText = stage.status;
                    if (isActive) statusText = 'Em Andamento';
                    if (isCompleted) statusText = 'Concluído';
                    if (!isActive && !isCompleted) statusText = index === 1 ? 'Bloqueado' : 'Futuro';

                    // Special overrides based on props could go here

                    return (
                        <div key={index} className="relative z-10 flex flex-col items-center gap-3 bg-white px-4">
                            <div className={`w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all duration-500 ${isActive || isCompleted
                                ? 'bg-black border-black text-white'
                                : 'bg-white border-zinc-200 text-zinc-300'
                                } ${isActive ? 'scale-110 shadow-sm' : ''}`}>
                                <Icon size={16} strokeWidth={isActive || isCompleted ? 2 : 2} />
                            </div>
                            <div className="text-center">
                                <h4 className={`text-[10px] font-black uppercase tracking-widest ${isActive || isCompleted ? 'text-black' : 'text-zinc-300'
                                    }`}>
                                    {stage.label}
                                </h4>
                                <p className="text-[9px] text-zinc-400 mt-1 font-medium bg-white px-1">
                                    {statusText}
                                </p>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
