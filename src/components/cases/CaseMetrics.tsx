
import { CheckCircle } from 'lucide-react';
import { CaseStudy } from '@/data/casesData';

interface CaseMetricsProps {
  caseData: CaseStudy;
}

const CaseMetrics = ({ caseData }: CaseMetricsProps) => {
  return (
    <div className="mt-20">
      {/* Financial Dashboard Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 border-t border-b border-black/10 divide-x divide-black/10 mb-20">
        {caseData.metrics.map((metric, index) => (
          <div key={index} className="p-8 md:p-12 flex flex-col items-center justify-center text-center group hover:bg-gray-50 transition-colors">
            <div className="text-4xl md:text-6xl font-mono-tech font-medium text-black mb-4 tracking-tighter group-hover:scale-110 transition-transform duration-500">
              {metric.value}
            </div>
            <div className="text-[10px] md:text-xs text-gray-500 uppercase tracking-[0.2em] font-medium font-sans">
              {metric.label}
            </div>
          </div>
        ))}
      </div>

      {/* Key Results Checklist - Minimalist */}
      <div className="max-w-3xl mx-auto">
        <h3 className="text-xl font-medium text-black mb-8 text-center tracking-tight">
          Impacto Consolidado
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-12">
          {caseData.results.map((result, index) => (
            <div key={index} className="flex items-start group">
              <span className="text-revgreen mr-4 text-xs mt-1 font-mono-tech">0{index + 1}</span>
              <span className="text-gray-600 font-light text-lg border-b border-transparent group-hover:border-black/10 transition-colors pb-1 leading-relaxed">
                {result}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CaseMetrics;
