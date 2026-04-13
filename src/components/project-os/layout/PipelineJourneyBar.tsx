import React, { useMemo } from 'react';
import { CheckCircle2, Target } from 'lucide-react';
import {
  PipelineStage,
  STAGE_CONFIGS,
  getStageIndex,
} from '@/types/pipeline';
import type { StageChangeEvent } from '@/types/pipeline';

// ---- Icon map for pipeline stages ----
const STAGE_ICON_MAP: Record<string, React.ElementType> = {
  // We'll import these directly where needed, but keeping the map here
  // to avoid missing icons. Since we can't import all dynamically easily without a huge bundle,
  // we'll use a fallback.
};

function getStageIcon(iconName: string): React.ElementType {
  // For simplicity in the extracted component, we'll use a fallback
  // if you want full icon support, you can import them or pass them as props
  return Target;
}

interface PipelineJourneyBarProps {
  currentStage: PipelineStage;
  history: StageChangeEvent[];
  daysInStage: number;
  onAdvance: (stage: PipelineStage) => void;
  category: string | null;
}

export function PipelineJourneyBar({ currentStage, history, daysInStage, onAdvance, category }: PipelineJourneyBarProps) {
  // Dynamically calculate which macro-stages to show based on the phase of the project
  const visibleStages = useMemo(() => {
      const isExecutionPhase = category === 'execucao' || category === 'encerrado' || currentStage === 'won';
      let stages: PipelineStage[];

      if (isExecutionPhase) {
          // Se já fechou, suprime as granulações chatas de proposta (rascunho, enviada, etc)
          // e mostra a jornada macro do delivery.
          stages = ['lead_inbound', 'diagnostic_done', 'won', 'onboarding', 'active', 'completed'];
          if (currentStage === 'churned') {
              stages.push('churned');
          }
      } else {
          // Em pré-vendas, mostra o funil de oportunidade. Removemos 'lost' por padrão, só mostra se for current.
          stages = ['lead_inbound', 'lead_qualified', 'diagnostic_done', 'proposal_draft', 'proposal_sent', 'proposal_viewed', 'negotiation', 'won'];
          if (currentStage === 'lost') {
              stages.push('lost');
          }
      }

      // Garante que o estágio atual sempre existe na barra, mesmo em edições forçadas de base de dados
      if (!stages.includes(currentStage)) {
          stages.push(currentStage);
      }

      // Ordenar pela cronologia oficial para não ficar pulando
      return stages.sort((a, b) => getStageIndex(a) - getStageIndex(b));
  }, [category, currentStage]);

  return (
      <div className="bg-white border-b border-zinc-200 px-8 py-6">
          <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-black uppercase tracking-widest text-zinc-500">
                  Pipeline
              </span>
              <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-zinc-500">
                      {daysInStage} {daysInStage === 1 ? 'dia' : 'dias'} em {STAGE_CONFIGS[currentStage].label}
                  </span>
              </div>
          </div>
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
              {visibleStages.map((stage, idx) => {
                  const config = STAGE_CONFIGS[stage];
                  const isCurrent = stage === currentStage;
                  const isPast = !isCurrent && getStageIndex(stage) < getStageIndex(currentStage);
                  const isFuture = !isCurrent && !isPast;

                  return (
                      <React.Fragment key={stage}>
                          <button
                              onClick={() => {
                                  const allowed = STAGE_CONFIGS[currentStage].allowedTransitions;
                                  if (allowed.includes(stage)) {
                                      onAdvance(stage);
                                  }
                              }}
                              title={`${config.label}${STAGE_CONFIGS[currentStage].allowedTransitions.includes(stage) ? ' - clique para avancar' : ''}`}
                              className={`group relative flex items-center gap-2 px-4 py-2.5 text-[0.7rem] font-black uppercase tracking-widest transition-all whitespace-nowrap border ${
                                  isCurrent
                                      ? 'border-black bg-black text-white shadow-[0_4px_0_0_#00CC6A]'
                                      : isPast
                                      ? 'border-zinc-300 bg-white text-zinc-700 hover:border-zinc-400'
                                      : 'border-dashed border-zinc-200 bg-zinc-50/50 text-zinc-400 hover:border-zinc-300'
                              } ${STAGE_CONFIGS[currentStage].allowedTransitions.includes(stage) ? 'cursor-pointer' : 'cursor-default'}`}
                          >
                              {isCurrent && (
                                  <span className="w-2 h-2 bg-[#00CC6A] shrink-0" />
                              )}
                              {isPast && (
                                  <CheckCircle2 className="w-4 h-4 text-black shrink-0" />
                              )}
                              {isFuture && (
                                  <span className="w-1.5 h-1.5 bg-zinc-300 shrink-0" />
                              )}
                              <span className="hidden lg:inline">{config.labelShort}</span>
                          </button>
                          {idx < visibleStages.length - 1 && (
                              <div className={`w-4 h-px shrink-0 ${
                                  isPast ? 'bg-zinc-400' : isCurrent ? 'bg-zinc-300' : 'bg-zinc-200'
                              }`} />
                          )}
                      </React.Fragment>
                  );
              })}
          </div>
      </div>
  );
}
