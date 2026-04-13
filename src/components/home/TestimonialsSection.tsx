
import { useNavigate } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious
} from "@/components/ui/carousel";
import Section from '@/components/ui/Section';
import { casesData } from '../../data/casesData';

const TestimonialsSection = () => {
  const navigate = useNavigate();

  // Extract testimonials from cases
  const testimonials = Object.entries(casesData)
    .filter(([key, c]) => c.quote && c.author && !c.title.includes('Lindoya') && key !== 'enics' && key !== 'tegra' && key !== 'bolt') // Only cases with quotes
    .map(([key, c]) => ({
      id: key,
      quote: c.quote,
      author: c.author,
      role: c.role,
      avatar: c.authorImage,
      company: c.title
    }));

  return (
    <Section variant="light" className="bg-[#F5F5F7] border-t border-zinc-200 py-32">
      <div className="container-custom">
        {/* Header - Subtle & Clean */}
        <div className="text-center mb-20 max-w-2xl mx-auto">
          <h2 className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-4">
            Resultados Comprovados
          </h2>
          <p className="text-3xl md:text-4xl font-black text-zinc-900 tracking-tight leading-tight">
            O impacto da nossa metodologia na voz de quem lidera o mercado.
          </p>
        </div>

        <div className="max-w-6xl mx-auto px-6">
          <Carousel
            opts={{
              align: "start",
              loop: true,
            }}
            className="w-full relative"
          >
            <CarouselContent className="-ml-6">
              {testimonials.map((testimonial, index) => (
                <CarouselItem key={index} className="pl-6 md:basis-1/2 lg:basis-1/3">
                  <div
                    onClick={() => navigate(`/cases/${testimonial.id}`)}
                    className="bg-white p-8 h-full flex flex-col justify-between border border-zinc-100 shadow-[0_2px_12px_rgba(0,0,0,0.02)] hover:shadow-[0_4px_20px_rgba(0,0,0,0.04)] transition-all duration-300 group cursor-pointer hover:-translate-y-1 block select-none"
                  >

                    <div className="mb-8 pointer-events-none">
                      {/* Subtle Quote Mark */}
                      <span className="text-4xl text-zinc-200 font-serif leading-none group-hover:text-zinc-300 transition-colors">“</span>
                      <blockquote className="text-body leading-relaxed text-zinc-700 font-medium mt-[-10px]">
                        {testimonial.quote.replace(/RevHackers/gi, 'REVHACKERS')}
                      </blockquote>
                    </div>

                    <div className="flex items-center gap-3 pt-6 border-t border-zinc-50 pointer-events-none">
                      <Avatar className="h-10 w-10 border border-zinc-100 bg-zinc-50">
                        <AvatarImage src={testimonial.avatar} alt={testimonial.author} className="object-cover" />
                        <AvatarFallback className="text-xxs text-zinc-400 font-bold bg-zinc-50">
                          {testimonial.author?.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="text-mini font-bold text-zinc-900 leading-tight">
                          {testimonial.author}
                        </div>
                        <div className="text-tiny text-zinc-400 leading-tight mt-0.5">
                          {testimonial.role}
                        </div>
                      </div>
                    </div>

                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>

            <div className="flex justify-center gap-3 mt-12">
              <CarouselPrevious className="static translate-y-0 bg-white border border-zinc-200 text-zinc-600 hover:bg-black hover:text-white hover:border-black rounded-full h-10 w-10 transition-all shadow-sm" />
              <CarouselNext className="static translate-y-0 bg-white border border-zinc-200 text-zinc-600 hover:bg-black hover:text-white hover:border-black rounded-full h-10 w-10 transition-all shadow-sm" />
            </div>
          </Carousel>
        </div>
      </div>
    </Section>
  );
};

export default TestimonialsSection;
