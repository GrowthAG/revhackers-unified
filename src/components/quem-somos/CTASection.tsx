
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const CTASection = () => {
  const scrollToTop = () => {
    window.scrollTo(0, 0);
  };

  return (
    <section className="py-24 md:py-40 bg-zinc-50 border-t border-zinc-100">
      <div className="container-custom">
        <div className="bg-black p-12 md:p-24 overflow-hidden relative group rounded-none">
          <div className="relative z-10 max-w-4xl space-y-12">
            <div className="space-y-6">
              <span className="text-zinc-500 font-mono text-[10px] uppercase tracking-[0.5em] font-black">
                // PRONTO_PARA_ESCALAR?
              </span>
              <h2 className="text-5xl md:text-7xl font-black text-white tracking-tighter leading-none italic uppercase">
                VAMOS MONTAR SUA <br />
                <span className="text-revgreen">ARQUITETURA.</span>
              </h2>
            </div>

            <p className="text-xl md:text-2xl text-zinc-400 font-medium tracking-tight leading-relaxed max-w-2xl">
              Pare de depender da sorte. Instale o protocolo de receita que as empresas de alto crescimento utilizam.
            </p>

            <Button
              asChild
              className="bg-white text-black font-black text-xs uppercase tracking-[0.3em] h-16 px-12 rounded-none hover:bg-revgreen hover:text-black transition-all duration-300"
            >
              <Link to="/diagnostico" onClick={scrollToTop}>
                Diagnóstico Grátis //
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
