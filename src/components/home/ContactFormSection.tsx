import ContactForm from '../shared/ContactForm';
import Section from '@/components/ui/Section';

const ContactFormSection = () => {
  return (
    <Section variant="light" className="py-32 bg-white relative overflow-hidden border-t border-zinc-100">

      <div className="container-custom relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24 items-start">

          {/* Left Column: Authority & Protocol */}
          <div className="lg:col-span-5 space-y-16 pt-10 md:pt-14">
            <div>
              <h2 className="text-5xl md:text-6xl font-black text-black tracking-tighter leading-none mb-8">
                Inicie o <br />
                <span className="text-zinc-300">Protocolo.</span>
              </h2>
              <p className="text-lg text-zinc-600 font-normal leading-relaxed text-pretty max-w-sm">
                Nossa infraestrutura não é para todos. Aplicamos ciência de receita para empresas que buscam <strong className="text-black font-semibold">dominar o mercado</strong> com precisão cirúrgica.
              </p>
            </div>

            <div className="space-y-12">
              <div className="group">
                <span className="font-mono text-xxs font-bold text-zinc-300 mb-4 block group-hover:text-black transition-colors">01 DO 03</span>
                <div>
                  <h4 className="text-black font-bold text-lg tracking-tight mb-2">Diagnóstico de Infraestrutura</h4>
                  <p className="text-zinc-500 text-sm leading-relaxed max-w-xs">Auditoria completa de Tracking, CRM e Atribuição para identificar gargalos.</p>
                </div>
              </div>

              <div className="group">
                <span className="font-mono text-xxs font-bold text-zinc-300 mb-4 block group-hover:text-black transition-colors">02 DO 03</span>
                <div>
                  <h4 className="text-black font-bold text-lg tracking-tight mb-2">Roadmap de Otimização</h4>
                  <p className="text-zinc-500 text-sm leading-relaxed max-w-xs">Plano de ação de 90 dias focado em eficiência e escala previsível.</p>
                </div>
              </div>

              <div className="group">
                <span className="font-mono text-xxs font-bold text-zinc-300 mb-4 block group-hover:text-black transition-colors">03 DO 03</span>
                <div>
                  <h4 className="text-black font-bold text-lg tracking-tight mb-2">Validação Científica</h4>
                  <p className="text-zinc-500 text-sm leading-relaxed max-w-xs">Metodologia baseada em dados reais, eliminando "achismos" e hacks.</p>
                </div>
              </div>
            </div>

            {/* Trust/Live Signal - Minimalist Typography */}
            <div className="pt-8 border-t border-zinc-100">
              <p className="text-xxs text-zinc-400 font-mono uppercase tracking-widest">
                Agenda Q1 2026: <span className="text-black font-bold ml-2">Vagas Limitadas</span>
              </p>
            </div>
          </div>

          {/* Right Column: "Application" Form - Cleanest Possible */}
          <div className="lg:col-span-7">
            <div className="bg-zinc-50 border border-zinc-100 p-10 md:p-14 rounded-[2.5rem] shadow-sm hover:shadow-sm hover:shadow-zinc-200/50 transition-all duration-700 hover:-translate-y-1">
              <div className="mb-12">
                <h3 className="text-2xl font-bold text-zinc-900 tracking-tight mb-3">Formulário de Aplicação</h3>
                <p className="text-body text-zinc-500 font-normal leading-relaxed">Preencha seus dados para análise técnica de perfil.</p>
              </div>

              <ContactForm formType="contact" variant="light" />

              <div className="mt-12 pt-8 border-t border-zinc-200/50 text-center">
                <p className="text-xxs text-zinc-400 uppercase tracking-[0.3em] font-bold">
                  Segurança de Dados · Resposta Técnica em 24h
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </Section>
  );
};

export default ContactFormSection;
