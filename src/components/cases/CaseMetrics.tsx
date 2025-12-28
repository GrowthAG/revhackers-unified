import { CaseStudy } from '@/data/cases/index';

interface CaseMetricsProps {
  caseData: CaseStudy;
}

const CaseMetrics = ({ caseData }: CaseMetricsProps) => {
  return (
    <div className="w-full">
      {/* Metrics Header - Technical Marker */}
      <div className="mb-12 flex items-center justify-between opacity-30">
        <div className="flex items-center gap-2">
          <span className="font-mono text-[9px] tracking-widest">METR_DATA_SPEC // V1.025</span>
          <div className="h-[1px] w-6 bg-black"></div>
        </div>
        <span className="font-mono text-[7px] uppercase tracking-widest text-zinc-400">Validated_Performance_Sheet</span>
      </div>

      {/* Metrics - Performance Datasheet Grid - With Technical Markers */}
      <div className="relative mb-32 group">
        {/* Precision Crosshairs for the entire grid */}
        <div className="absolute -top-3 -left-3 w-6 h-6 border-t-[1.5px] border-l-[1.5px] border-black"></div>
        <div className="absolute -top-3 -right-3 w-6 h-6 border-t-[1.5px] border-r-[1.5px] border-black"></div>
        <div className="absolute -bottom-3 -left-3 w-6 h-6 border-b-[1.5px] border-l-[1.5px] border-black"></div>
        <div className="absolute -bottom-3 -right-3 w-6 h-6 border-b-[1.5px] border-r-[1.5px] border-black"></div>

        <div className={`grid ${caseData.metrics.length === 4 ? 'grid-cols-2 lg:grid-cols-4' : 'grid-cols-1 md:grid-cols-3'} gap-0 border-[1.5px] border-black bg-white overflow-hidden`}>
          {caseData.metrics.map((metric, index) => (
            <div key={index} className="px-8 py-16 md:py-24 flex flex-col items-center justify-center text-center border-r-[1px] border-black last:border-r-0 hover:bg-zinc-50 transition-all duration-500">
              <span className="font-mono text-[8px] opacity-20 mb-8 tracking-tighter">DATA_POINT_{String(index + 1).padStart(2, '0')}</span>
              <div className="text-6xl md:text-7xl lg:text-8xl font-black text-black mb-4 tracking-tighter tabular-nums leading-none">
                {metric.value}
              </div>
              <div className="text-[9px] uppercase tracking-[0.4em] text-zinc-500 font-bold max-w-[160px] leading-tight">
                {metric.label}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Narrative Impact Analysis */}
      <div className="max-w-5xl mx-auto px-6 md:px-0">
        <div className="flex flex-col lg:flex-row gap-16 lg:gap-32">

          {/* Analysis Label */}
          <div className="lg:w-1/4 shrink-0">
            <h3 className="text-[10px] font-bold text-black tracking-[0.4em] uppercase mb-6 flex items-center gap-2">
              <div className="w-1 bg-black h-4"></div>
              Consolidado
            </h3>
            <p className="text-zinc-500 text-xs leading-relaxed font-mono">
              Análise técnica detalhada dos resultados baseada em performance real e dados auditados.
            </p>
          </div>

          {/* Results List - Technical Blueprint */}
          <div className="lg:w-3/4">
            <div className="grid grid-cols-1 gap-y-12">
              {caseData.results.map((result, index) => (
                <div key={index} className="flex gap-10 items-start group">
                  <div className="flex flex-col items-center shrink-0 w-8 mt-1">
                    <span className="text-[10px] font-mono text-zinc-300 group-hover:text-black transition-colors">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <div className="h-10 w-px bg-zinc-100 group-hover:bg-zinc-300 transition-colors mt-2"></div>
                  </div>
                  <p className="text-zinc-800 leading-relaxed font-normal text-xl md:text-2xl antialiased">
                    {result}
                  </p>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default CaseMetrics;
