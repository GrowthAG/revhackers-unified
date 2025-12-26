
import { Quote } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious
} from "@/components/ui/carousel";
import Section from '@/components/ui/Section';

const testimonials = [
  {
    quote: "Aumentamos nossa receita recorrente em 89% no primeiro ano. A metodologia trouxe clareza e métricas confiáveis para o board.",
    author: "Carla Macedo",
    role: "Diretora de Vendas, TOEFL Junior",
    avatar: "/lovable-uploads/95e8dfb6-30ef-4311-b229-a6c702cd57b7.png",
  },
  {
    quote: "Reduzimos CPA em 29% e aumentamos o volume de leads qualificados. O suporte consultivo transformou nossa visão de Growth.",
    author: "Pedro Silva",
    role: "Gerente de Marketing, Agence MR",
    avatar: "/lovable-uploads/c78b28dc-f100-4719-b64b-05c759d55429.png",
  },
  {
    quote: "O ROI foi claro desde o terceiro mês. Conseguimos alinhar marketing e vendas em um único sistema de verdade.",
    author: "Fabio Boldrini",
    role: "CEO, ENICS",
    avatar: "/lovable-uploads/81d46788-47c4-456e-b31d-d0681f39e12c.png",
  }
];

const TestimonialsSection = () => {
  return (
    <Section variant="light" className="bg-white border-t border-gray-100 py-32">
      <div className="container-custom">
        {/* Centered Standard Header */}
        <div className="text-center mb-16 max-w-3xl mx-auto">
          <span className="font-mono-tech text-gray-400 text-xs uppercase tracking-widest mb-4 block">
            Feedback de Líderes
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-black tracking-tight mb-6">
            O Impacto Real
          </h2>
        </div>

        <div className="max-w-5xl mx-auto px-4">
          <Carousel
            opts={{
              align: "center",
              loop: true,
            }}
            className="w-full relative"
          >
            <CarouselContent>
              {testimonials.map((testimonial, index) => (
                <CarouselItem key={index} className="md:basis-1/1">
                  <div className="py-12 px-4 text-center">
                    <div className="mb-10 flex justify-center">
                      <Quote className="text-revgreen h-12 w-12 opacity-100" />
                    </div>

                    <blockquote className="text-2xl md:text-4xl font-light text-black leading-tight mb-12 max-w-4xl mx-auto tracking-tight">
                      "{testimonial.quote}"
                    </blockquote>

                    <div className="flex flex-col items-center">
                      <Avatar className="h-16 w-16 mb-4 border border-gray-200">
                        <AvatarImage src={testimonial.avatar} alt={testimonial.author} />
                        <AvatarFallback>{testimonial.author.substring(0, 2)}</AvatarFallback>
                      </Avatar>
                      <div className="text-black font-bold text-lg uppercase tracking-wider font-mono-tech">{testimonial.author}</div>
                      <div className="text-gray-500 text-sm mt-1">{testimonial.role}</div>
                    </div>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>

            <div className="flex justify-center gap-4 mt-12">
              <CarouselPrevious className="static translate-y-0 bg-white border border-black text-black hover:bg-black hover:text-white rounded-sm h-12 w-12 transition-colors" />
              <CarouselNext className="static translate-y-0 bg-white border border-black text-black hover:bg-black hover:text-white rounded-sm h-12 w-12 transition-colors" />
            </div>
          </Carousel>
        </div>
      </div>
    </Section>
  );
};

export default TestimonialsSection;
