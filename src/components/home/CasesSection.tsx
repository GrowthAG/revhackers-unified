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
    <Section variant="dark" className="bg-black relative py-40 border-t border-white/10 overflow-hidden">
      {/* Precision Grid Background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />

      <div className="container-custom relative z-10">
        {/* Header - Industrial & Minimal */}
        <div className="flex flex-col items-center mb-32">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex items-center gap-2 mb-4"
          >
            <div className="w-1.5 h-1.5 bg-revgreen rounded-full animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-revgreen">Portfolio de Impacto</span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-5xl md:text-7xl font-black text-white tracking-tighter text-center"
          >
            Resultados Consolidados<span className="text-revgreen">.</span>
          </motion.h2>
        </div>

        {/* Grid Layout - Focused Engineering */}
        {loading ? (
          <div className="flex justify-center items-center h-[400px]">
            <Loader2 className="w-8 h-8 text-revgreen animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-0 border border-white/10 divide-y md:divide-y-0 md:divide-x divide-white/10">
            {cases.map((item, index) => {
              const anyItem = item as any;
              const resultMetric = anyItem.primary_metric || "Scale";
              const description = anyItem.preview_description || "";

              return (
                <motion.div
                  key={item.id || index}
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Link
                    to={`/cases/${item.slug}`}
                    onClick={scrollToTop}
                    className="group block relative h-full bg-black hover:bg-zinc-900/40 transition-colors duration-700"
                  >
                    {/* Index Number - Engineering aesthetic */}
                    <div className="absolute top-8 left-8 z-20">
                      <span className="text-[10px] font-mono font-bold text-zinc-700 group-hover:text-revgreen transition-colors">
                        0{index + 1}
                      </span>
                    </div>

                    {/* Logo Canvas - Ultra Clean */}
                    <div className="h-72 overflow-hidden relative bg-white flex items-center justify-center p-12">
                      <motion.img
                        whileHover={{ scale: 1.05 }}
                        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                        src={anyItem.client_logo || anyItem.logo}
                        alt={item.title}
                        className="max-w-[200px] max-h-[90px] w-auto h-auto object-contain grayscale brightness-90 group-hover:grayscale-0 group-hover:brightness-100 transition-all duration-700"
                      />

                      {/* Floating Category tag */}
                      <div className="absolute bottom-6 left-8">
                        <span className="text-[9px] font-black uppercase tracking-[0.3em] text-black/40 border border-black/10 px-2 py-0.5">
                          {anyItem.case_category || 'B2B'}
                        </span>
                      </div>
                    </div>

                    {/* Technical Specs Area */}
                    <div className="p-10 flex flex-col h-full">
                      {/* Metric Pill */}
                      <div className="mb-6 flex items-center gap-2">
                        <TrendingUp className="w-3 h-3 text-revgreen" />
                        <span className="text-xl font-black text-white tracking-tighter">
                          {resultMetric}
                        </span>
                      </div>

                      <h3 className="text-xl font-bold text-white mb-4 leading-tight group-hover:text-revgreen transition-colors">
                        {item.title}
                      </h3>

                      <p className="text-[12px] text-zinc-500 font-medium leading-relaxed mb-10 line-clamp-3">
                        {description}
                      </p>

                      <div className="mt-auto flex items-center justify-between pt-6 border-t border-white/5">
                        <div className="flex items-center gap-2 overflow-hidden">
                          <span className="text-[9px] font-black text-zinc-400 uppercase tracking-[0.3em] group-hover:text-white transition-colors">ESTRATÉGIA COMPLETA</span>
                          <div className="w-0 group-hover:w-8 h-px bg-white transition-all duration-500" />
                        </div>
                        <ArrowUpRight className="w-5 h-5 text-zinc-700 group-hover:text-white group-hover:rotate-45 transition-all mt-[-2px]" />
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
          className="mt-20 flex justify-center"
        >
          <Link
            to="/cases"
            onClick={scrollToTop}
            className="group relative px-12 py-5 bg-white text-black font-black uppercase tracking-[0.3em] text-[11px] overflow-hidden transition-all hover:pr-16"
          >
            <span className="relative z-10 flex items-center gap-2">
              Explorar Portfolio Completo
              <ArrowUpRight className="w-4 h-4 translate-y-[1px]" />
            </span>
          </Link>
        </motion.div>
      </div>
    </Section>
  );
};

export default CasesSection;
