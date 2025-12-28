import { CaseStudy } from '@/data/cases/index';

interface CaseTestimonialProps {
  caseData: CaseStudy;
}

const CaseTestimonial = ({ caseData }: CaseTestimonialProps) => {
  if (!caseData.quote || !caseData.author) return null;

  return (
    <div className="w-full">
      {/* Quote - Editorial Style */}
      <p className="text-zinc-900 text-xl md:text-2xl lg:text-3xl leading-[1.3] font-medium mb-12 italic text-balance">
        "{caseData.quote}"
      </p>

      {/* Author - Minimal */}
      <div className="flex items-center gap-4">
        {caseData.authorImage && (
          <img
            src={caseData.authorImage}
            alt={caseData.author}
            className="w-12 h-12 rounded-full object-cover grayscale"
          />
        )}
        <div>
          <p className="text-sm font-bold text-black">{caseData.author}</p>
          <p className="text-xs text-zinc-500">{caseData.role}</p>
        </div>
      </div>
    </div>
  );
};

export default CaseTestimonial;
