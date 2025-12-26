
import { CaseStudy } from '@/data/casesData';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface CaseTestimonialProps {
  caseData: CaseStudy;
}

const CaseTestimonial = ({ caseData }: CaseTestimonialProps) => {
  return (
    <div className="py-12 border-y border-gray-100 my-12">
      <div className="flex flex-col md:flex-row gap-8 items-start md:items-center">
        {/* Author Image (if exists) or Initial Avatar - Minimalist */}
        {caseData.authorImage ? (
          <div className="shrink-0">
            <Avatar className="h-20 w-20 border-2 border-white shadow-lg">
              <AvatarImage src={caseData.authorImage} alt={caseData.author} />
              <AvatarFallback className="bg-black text-white">{caseData.author.substring(0, 2)}</AvatarFallback>
            </Avatar>
          </div>
        ) : (
          <div className="shrink-0 h-16 w-1 bg-black hidden md:block"></div>
        )}

        <div className="flex-1">
          <blockquote className="text-2xl md:text-4xl font-serif italic text-black leading-tight mb-6">
            "{caseData.quote}"
          </blockquote>

          <div>
            <p className="font-bold text-sm uppercase tracking-wider text-black">{caseData.author}</p>
            <p className="text-gray-500 text-sm">{caseData.role}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CaseTestimonial;
