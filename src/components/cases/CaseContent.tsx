import { CaseStudy } from '@/data/casesData';
import CaseMetrics from './CaseMetrics';
import CaseTechStack from './CaseTechStack';
import CaseTestimonial from './CaseTestimonial';
import ContactForm from '@/components/shared/ContactForm';
import { Target, Lightbulb, CheckCircle2 } from 'lucide-react';

interface CaseContentProps {
  caseData: CaseStudy;
}

const CaseContent = ({ caseData }: CaseContentProps) => {
  return (
    <section className="py-20 bg-white">
      <div className="container-custom">
        <div className="max-w-4xl mx-auto">

          {/* Main Copy - Challenge vs Solution (Rich Cards) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-20">
            {/* Challenge Card - The Problem */}
            <div className="bg-gray-50 rounded-sm p-8 border-l-4 border-red-500 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-red-100 p-2 rounded-full">
                  <Target className="w-5 h-5 text-red-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">O Cenário Inicial</h2>
              </div>
              <p className="text-gray-600 leading-relaxed font-light text-lg text-pretty">
                "{caseData.challenge}"
              </p>
            </div>

            {/* Solution Card - The Strategy */}
            <div className="bg-white rounded-sm p-8 border border-gray-200">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-2 h-2 rounded-full bg-revgreen ring-4 ring-revgreen/10"></div>
                <h2 className="text-xl font-bold text-gray-900 tracking-tight">A Estratégia</h2>
              </div>
              <p className="text-gray-600 leading-relaxed font-light text-lg text-pretty">
                {caseData.solution}
              </p>
            </div>
          </div>

          {/* Metrics Section */}
          <div className="mb-0">
            <CaseMetrics caseData={caseData} />
          </div>

          {/* Tech Stack - Minimalist Strip */}
          <CaseTechStack category={caseData.category} />

          {/* Testimonial */}
          <div className="mb-20">
            <CaseTestimonial caseData={caseData} />
          </div>

          {/* Standardized 'Floating Card' Form Section - Minimalist */}
          <div className="mt-20">
            <div className="bg-gray-50 rounded-lg border border-gray-200 p-8 md:p-12 mb-20 max-w-2xl mx-auto">
              <h3 className="text-xl font-bold text-center text-black mb-2 uppercase tracking-wide">
                Escalar sua operação?
              </h3>
              <p className="text-gray-500 text-center mb-8 text-sm font-light">
                Sem hacks, apenas engenharia de receita sólida.
              </p>

              <ContactForm formType="diagnosis" />
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default CaseContent;
