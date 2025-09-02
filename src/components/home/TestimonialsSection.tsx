
import { Quote } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Carousel, 
  CarouselContent, 
  CarouselItem, 
  CarouselNext, 
  CarouselPrevious 
} from "@/components/ui/carousel";
import { Card } from '@/components/ui/card';

const testimonials = [
  {
    quote: "A consultoria da RevHackers nos ajudou a implementar uma estratégia de RevOps que integrou nossas equipes de marketing e vendas, trazendo resultados expressivos em poucos meses.",
    author: "Lucio Sardinha",
    role: "CEO, FMU Virtual",
    avatar: "/lovable-uploads/96db41f1-2d74-4913-997d-3296df29d457.png"
  },
  {
    quote: "Reduzimos nosso CAC em 38% após implementar as recomendações da RevHackers. O conhecimento técnico da equipe e a capacidade de extrair insights dos dados foram cruciais para nossa estratégia de crescimento.",
    author: "Fernando Correa",
    role: "CEO, First Security",
    avatar: "/lovable-uploads/2abb9e01-3bb4-413b-887d-0efab88c25eb.png"
  },
  {
    quote: "A metodologia da RevHackers trouxe clareza para nossos processos de vendas e marketing. Hoje temos métricas confiáveis e um pipeline muito mais previsível, o que nos permite escalar com segurança.",
    author: "Carla Macedo",
    role: "Diretora de Vendas, TOEFL Junior Brasil",
    avatar: "/lovable-uploads/95e8dfb6-30ef-4311-b229-a6c702cd57b7.png"
  },
  {
    quote: "A implementação do RevOps pela equipe da RevHackers transformou completamente nosso funil de vendas. A visibilidade e previsibilidade que conseguimos agora são incomparáveis com o que tínhamos antes.",
    author: "Yves Mariano",
    role: "CEO, Wisyion",
    avatar: "/lovable-uploads/bfbe5a85-3867-44dc-adcc-909e6ebeae4f.png"
  },
  {
    quote: "Depois da consultoria da RevHackers, conseguimos alinhar marketing, vendas e sucesso do cliente como nunca antes. Os resultados em termos de conversão e retenção foram impressionantes.",
    author: "Fabio Boldrini",
    role: "CEO, BLDN Digital",
    avatar: "/lovable-uploads/81d46788-47c4-456e-b31d-d0681f39e12c.png"
  },
  {
    quote: "O suporte consultivo da RevHackers para nosso time de marketing transformou nossa abordagem em Google Ads e trouxe resultados impressionantes para todo nosso funil de vendas.",
    author: "Pedro Silva",
    role: "Gerente de Vendas, Agence MR",
    avatar: "/lovable-uploads/c78b28dc-f100-4719-b64b-05c759d55429.png"
  }
];

const TestimonialsSection = () => {
  return (
    <section className="py-24 bg-gray-50">
      <div className="container-custom">
        <div className="max-w-2xl mx-auto text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            O que nossos clientes dizem
          </h2>
          <p className="text-lg text-gray-600">
            Empresas que já transformaram seu crescimento conosco
          </p>
        </div>
        
        <div className="max-w-4xl mx-auto relative px-4 md:px-12">
          <Carousel
            opts={{
              align: "start",
              loop: true,
            }}
            className="w-full relative"
          >
            <CarouselContent>
              {testimonials.map((testimonial, index) => (
                <CarouselItem key={index} className="md:basis-1/1 lg:basis-1/1">
                  <div className="p-1">
                    <Card className="bg-white rounded-xl shadow-md p-8 md:p-12 relative">
                      <Quote className="text-revgreen/20 h-16 w-16 absolute top-8 left-8" />
                      
                      <blockquote className="relative z-10">
                        <p className="text-xl md:text-2xl leading-relaxed text-gray-800 mb-8">
                          "{testimonial.quote}"
                        </p>
                        
                        <div className="flex items-center">
                          <Avatar className="h-12 w-12 mr-4">
                            <AvatarImage src={testimonial.avatar} alt={testimonial.author} />
                            <AvatarFallback>{testimonial.author.substring(0, 2)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-bold">{testimonial.author}</p>
                            <p className="text-gray-600">{testimonial.role}</p>
                          </div>
                        </div>
                      </blockquote>
                    </Card>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            
            <div className="absolute top-1/2 -left-2 md:-left-8 z-10 transform -translate-y-1/2">
              <CarouselPrevious className="bg-white shadow-lg border-0 text-black h-10 w-10 opacity-90 hover:opacity-100" />
            </div>
            
            <div className="absolute top-1/2 -right-2 md:-right-8 z-10 transform -translate-y-1/2">
              <CarouselNext className="bg-white shadow-lg border-0 text-black h-10 w-10 opacity-90 hover:opacity-100" />
            </div>
          </Carousel>
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
