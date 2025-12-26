import { ArrowRight, ArrowUpRight, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import Section from '@/components/ui/Section';
import { useState, useEffect } from 'react';
import { getFeaturedCases, CaseStudy } from '@/api/cases';

const CasesSection = () => {
  const [cases, setCases] = useState<CaseStudy[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCases = async () => {
      try {
        const data = await getFeaturedCases();
        if (data && data.length > 0) {
          setCases(data);
        }
      } catch (error) {
        console.error("Failed to load featured cases", error);
      } finally {
        setLoading(false);
      }
    };
    loadCases();
  }, []);

  const scrollToTop = () => {
    window.scrollTo(0, 0);
  };

  return (
    <Section variant="dark" className="bg-black relative py-32 border-t border-white/10">
      <div className="container-custom">
        {/* Centered Header - More Objective */}
        <div className="text-center max-w-3xl mx-auto mb-20">
          <div className="font-mono-tech text-revgreen text-xs uppercase tracking-widest mb-4">Track Record</div>
          <h2 className="text-4xl md:text-5xl font-medium text-white tracking-tight mb-6">
            Resultados que Geram Receita
          </h2>
          <p className="text-xl text-gray-400 font-light text-balance">
            Não prometemos, entregamos. Veja como transformamos desafios complexos em máquinas de crescimento.
          </p>
        </div>

        {/* Grid Layout 3 Columns (Focused) */}
        {loading ? (
          <div className="flex justify-center items-center h-[400px]">
            <Loader2 className="w-8 h-8 text-revgreen animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {cases.map((item, index) => {
              // Compatibility mapping just in case types are stale
              const anyItem = item as any;
              const resultText = anyItem.primary_metric || anyItem.result || 'Resultado';
              const imageSrc = anyItem.image_url || anyItem.coverImage || anyItem.image || '';
              const description = anyItem.preview_description || anyItem.description || '';

              return (
                <Link
                  to={`/cases/${item.slug}`}
                  onClick={scrollToTop}
                  key={item.id || index}
                  className="group block h-full"
                >
                  <div className="bg-zinc-900/30 border border-white/5 rounded-lg overflow-hidden h-full flex flex-col hover:border-white/20 transition-all duration-500 relative">

                    {/* Image/Logo Area - Dark & Minimal */}
                    <div className="h-64 overflow-hidden relative bg-black/50 p-8 flex items-center justify-center border-b border-white/5">
                      {anyItem.client_logo ? (
                        <img
                          src={anyItem.client_logo}
                          alt={item.title}
                          className="w-48 h-auto max-h-32 object-contain opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500 grayscale group-hover:grayscale-0"
                        />
                      ) : imageSrc ? (
                        <img
                          src={imageSrc}
                          alt={item.title}
                          className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500"
                        />
                      ) : (
                        <div className="text-white text-xl font-bold tracking-tight">{item.title}</div>
                      )}

                      <div className="absolute top-4 left-4">
                        <span className="text-[10px] font-mono-tech uppercase tracking-widest text-gray-500 border border-white/10 px-2 py-1 rounded-sm bg-black/50 backdrop-blur-sm">
                          {(item.case_category || (item as any).category || 'Case').split('•')[0].trim()}
                        </span>
                      </div>
                    </div>

                    {/* Content - Minimal text */}
                    <div className="p-8 flex-1 flex flex-col justify-between">
                      <div>
                        <h3 className="text-xl md:text-2xl font-bold text-white mb-3 group-hover:text-revgreen transition-colors leading-tight">
                          {item.title}
                        </h3>
                        <p className="text-sm text-gray-500 font-light leading-relaxed line-clamp-3 mb-6">
                          {description}
                        </p>
                      </div>

                      <div className="flex items-end justify-between border-t border-white/5 pt-6 mt-auto">
                        <div>
                          <span className="block text-[10px] text-gray-600 uppercase tracking-widest mb-1">Resultado</span>
                          <span className="text-lg font-medium text-white">{resultText}</span>
                        </div>
                        <div className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center group-hover:bg-white group-hover:text-black transition-all">
                          <ArrowUpRight className="w-4 h-4" />
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        <div className="mt-16 text-center">
          <Link
            to="/cases"
            onClick={scrollToTop}
            className="inline-flex items-center text-white font-bold uppercase tracking-wider hover:text-revgreen transition-colors border-b border-white pb-1 hover:border-revgreen"
          >
            Ver Todos os Cases
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </div>
      </div>
    </Section>
  );
};

export default CasesSection;
