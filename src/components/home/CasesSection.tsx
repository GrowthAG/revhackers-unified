import { ArrowUpRight, Loader2, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import Section from '@/components/ui/Section';
import { useState, useEffect } from 'react';
import { getFeaturedCases, CaseStudy } from '@/api/cases';
import { motion } from 'framer-motion';

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
    <Section variant="light" className="bg-white relative py-40 border-t border-zinc-200 overflow-hidden">

      <div className="container-custom relative z-10">
        {/* Header - Industrial & Minimal */}
        <div className="flex flex-col items-center mb-32">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="flex items-center gap-3 mb-6 bg-zinc-100 px-4 py-2 rounded-full"
          >
            <div className="w-2 h-2 bg-zinc-900 rounded-full animate-pulse" />
            <span className="text-xxs font-black uppercase tracking-[0.3em] text-zinc-900">Portfolio de Impacto</span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-6xl lg:text-7xl font-black text-zinc-900 tracking-tighter text-center leading-[1.1] text-balance"
          >
            Resultados Consolidados<span className="text-zinc-300">.</span>
          </motion.h2>
        </div>

        {/* Apple-Style Grid Layout */}
        {loading ? (
          <div className="flex justify-center items-center h-[400px]">
            <Loader2 className="w-10 h-10 text-zinc-300 animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10">
            {cases.map((item, index) => {
              const anyItem = item as any;
              const resultMetric = anyItem.primary_metric || "Scale";
              const description = anyItem.preview_description || "";

              return (
                <motion.div
                  key={item.id || index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                >
                  <Link
                    to={`/cases/${item.slug}`}
                    onClick={scrollToTop}
                    className="group block relative bg-white hover:shadow-sm hover:shadow-zinc-200/50 transition-all duration-700 rounded-[2.5rem] border border-zinc-100 overflow-hidden h-full flex flex-col hover:-translate-y-2"
                  >
                    {/* Logo Canvas - Ultra Clean */}
                    <div className="h-64 overflow-hidden relative bg-zinc-50 flex items-center justify-center p-12 border-b border-zinc-100 group-hover:bg-white transition-colors duration-500">
                      <motion.img
                        whileHover={{ scale: 1.05 }}
                        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                        src={anyItem.client_logo || anyItem.logo}
                        alt={anyItem.title || anyItem.client_name}
                        className="max-w-[160px] max-h-[70px] w-auto h-auto object-contain opacity-100 transition-all duration-700 grayscale group-hover:grayscale-0"
                      />

                      {/* Floating Index Number */}
                      <div className="absolute top-8 left-8">
                        <span className="text-xxs font-mono font-bold text-zinc-300 group-hover:text-zinc-900 transition-colors">
                          0{index + 1}
                        </span>
                      </div>

                      {/* Floating Category tag */}
                      <div className="absolute bottom-6 left-8">
                        <span className="text-2xs font-black uppercase tracking-[0.2em] text-zinc-400 border border-zinc-200 px-3 py-1 bg-white ">
                          {anyItem.case_category || 'B2B'}
                        </span>
                      </div>
                    </div>

                    {/* Technical Specs Area */}
                    <div className="p-10 flex flex-col flex-1 bg-white">
                      {/* Metric Pill */}
                      <div className="mb-8 flex items-center gap-3">
                        <div className="p-2 bg-zinc-900 group-hover:scale-110 transition-transform duration-500">
                          <TrendingUp className="w-3.5 h-3.5 text-white" />
                        </div>
                        <span className="text-2xl font-black text-zinc-900 tracking-tighter group-hover:tracking-normal transition-all duration-500">
                          {resultMetric}
                        </span>
                      </div>

                      <h3 className="text-2xl font-bold text-zinc-900 mb-4 leading-tight">
                        {anyItem.title || anyItem.client_name}
                      </h3>

                      <p className="text-body text-zinc-500 font-normal leading-relaxed mb-10 line-clamp-3">
                        {description}
                      </p>

                      <div className="mt-auto flex items-center justify-between pt-8 border-t border-zinc-50">
                        <div className="flex items-center gap-3 group-hover:gap-5 transition-all duration-500">
                          <span className="text-xxs font-black text-zinc-900 uppercase tracking-[0.3em]">ESTRATÉGIA</span>
                          <div className="w-8 h-px bg-zinc-900" />
                        </div>
                        <div className="p-2 bg-zinc-50 group-hover:bg-zinc-900 transition-colors duration-500 ">
                          <ArrowUpRight className="w-5 h-5 text-zinc-400 group-hover:text-white group-hover:rotate-45 transition-all mt-[-1px]" />
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Global CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-24 flex justify-center"
        >
          <Link
            to="/cases"
            onClick={scrollToTop}
            className="group relative px-14 py-6 bg-zinc-900 text-white hover:bg-black font-black uppercase tracking-[0.4em] text-tiny overflow-hidden transition-all duration-500 hover:-translate-y-1 shadow-sm shadow-zinc-200"
          >
            <span className="relative z-10 flex items-center gap-3">
              Explorar Portfolio
              <ArrowUpRight className="w-4 h-4 translate-y-[1px] group-hover:rotate-45 transition-transform" />
            </span>
          </Link>
        </motion.div>
      </div>
    </Section>
  );
};

export default CasesSection;
