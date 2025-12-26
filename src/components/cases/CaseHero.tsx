import { CaseStudy } from '@/data/casesData';

interface CaseHeroProps {
  caseData: CaseStudy;
}

const CaseHero = ({ caseData }: CaseHeroProps) => {
  return (
    <section className="pt-40 pb-32 bg-black relative overflow-hidden flex flex-col items-center justify-center min-h-[60vh]">

      {/* Premium Spotlight Effect - Adds depth without noise */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-gray-900/40 via-black to-black pointer-events-none"></div>

      <div className="container-custom relative z-10">
        <div className="max-w-5xl mx-auto text-center flex flex-col items-center">

          {/* Strategic Tag - Minimalist */}
          <div className="mb-10 animate-fade-in-up">
            <span className="text-xs font-medium text-gray-500 uppercase tracking-widest">
              CASE STUDY — {caseData.category}
            </span>
          </div>

          {/* Company Name replaced by Logo as The Hero */}
          <div className="mb-8 animate-fade-in-up delay-100 flex justify-center">
            {caseData.logo ? (
              <img
                src={caseData.logo}
                alt={`${caseData.title} logo`}
                className="h-20 md:h-32 w-auto object-contain filter brightness-0 invert opacity-90 hover:opacity-100 transition-opacity duration-500"
              />
            ) : (
              <h1 className="text-6xl md:text-9xl font-bold text-white tracking-tighter leading-none">
                {caseData.title}
              </h1>
            )}
          </div>

          {/* Value Proposition / Hook - From DB */}
          <p className="text-xl md:text-2xl text-gray-400 font-light max-w-3xl mx-auto leading-relaxed mb-10 animate-fade-in-up delay-200 text-balance">
            {caseData.preview_description || `Como transformamos desafios de ${caseData.category.toLowerCase()} em uma máquina de receita previsível.`}
          </p>

        </div>
      </div>
    </section>
  );
};

export default CaseHero;
