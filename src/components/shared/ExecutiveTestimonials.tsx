import { motion } from 'framer-motion';
import { Quote, Star } from 'lucide-react';
import PremiumFloatingCard from './PremiumFloatingCard';
import { HoverScale, Reveal } from './PremiumMicroInteractions';

const testimonials = [
  {
    name: "Carlos Mendonça",
    role: "CEO, TechScale Brasil",
    company: "Startup SaaS B2B",
    content: "A RevHackers transformou completamente nossa operação. Em 6 meses, nosso pipeline aumentou 340% e nossa taxa de conversão triplicou. A metodologia deles é simplesmente excepcional.",
    rating: 5,
    result: "+340% Pipeline",
    avatar: "CM"
  },
  {
    name: "Ana Carolina Silva",
    role: "VP Growth, InnovateCorp",
    company: "Fintech Enterprise",
    content: "Nunca vi uma consultoria com essa profundidade técnica e visão estratégica. Eles não só implementaram as soluções, mas nos educaram para escalar sozinhos. ROI de 12x no primeiro ano.",
    rating: 5,
    result: "ROI 12x",
    avatar: "AS"
  },
  {
    name: "Roberto Ferreira",
    role: "CMO, DataDriven Solutions",
    company: "Scale-up Tech",
    content: "O que mais me impressiona é a abordagem data-driven aliada à experiência prática. Eles entregaram resultados mensuráveis desde o primeiro mês de implementação.",
    rating: 5,
    result: "+250% Conversões",
    avatar: "RF"
  }
];

const ExecutiveTestimonials = () => {
  return (
    <section className="section-padding bg-gradient-to-br from-slate-50 to-white">
      <div className="container-custom">
        <Reveal direction="up" className="text-center mb-16">
          <h2 className="section-title text-slate-900 mb-6">
            O que nossos clientes falam sobre os resultados
          </h2>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto">
            Empresas que confiaram na nossa metodologia e transformaram suas operações em máquinas de crescimento sustentável.
          </p>
        </Reveal>

        <div className="grid lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <Reveal key={index} direction="up" delay={index * 0.2}>
              <HoverScale className="h-full">
                <PremiumFloatingCard className="h-full p-8 relative">
                  {/* Quote Icon */}
                  <div className="absolute -top-4 -left-4 w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-lg">
                    <Quote className="w-4 h-4 text-white" />
                  </div>

                  {/* Rating */}
                  <div className="flex items-center mb-6">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                    ))}
                  </div>

                  {/* Content */}
                  <blockquote className="text-lg text-slate-700 mb-8 leading-relaxed italic">
                    "{testimonial.content}"
                  </blockquote>

                  {/* Result Badge */}
                  <div className="mb-6">
                    <span className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-green-500 to-emerald-600 text-white text-sm font-semibold">
                      {testimonial.result}
                    </span>
                  </div>

                  {/* Author */}
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-gradient-to-br from-slate-700 to-slate-900 rounded-full flex items-center justify-center text-white font-bold text-lg mr-4">
                      {testimonial.avatar}
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-900">
                        {testimonial.name}
                      </h4>
                      <p className="text-slate-600 text-sm">
                        {testimonial.role}
                      </p>
                      <p className="text-slate-500 text-xs">
                        {testimonial.company}
                      </p>
                    </div>
                  </div>
                </PremiumFloatingCard>
              </HoverScale>
            </Reveal>
          ))}
        </div>

        {/* Trust Indicators */}
        <Reveal direction="up" delay={0.8} className="mt-16 text-center">
          <div className="flex justify-center items-center space-x-8 text-slate-500">
            <div className="text-sm">
              <span className="font-semibold">98%</span> Taxa de Satisfação
            </div>
            <div className="w-1 h-1 bg-slate-300 rounded-full"></div>
            <div className="text-sm">
              <span className="font-semibold">150+</span> Empresas Transformadas
            </div>
            <div className="w-1 h-1 bg-slate-300 rounded-full"></div>
            <div className="text-sm">
              <span className="font-semibold">+300%</span> ROI Médio
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
};

export default ExecutiveTestimonials;