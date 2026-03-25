import { useParams, Link } from 'react-router-dom';
import { useEffect, useState, useRef } from 'react';
import PageLayout from '@/components/layout/PageLayout';
import CaseNotFound from '@/components/cases/CaseNotFound';
import { getCaseBySlug } from '@/api/cases';
import { CaseStudy, casesData } from '@/data/casesData';
import { Loader2, ArrowLeft, TrendingUp, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import ContactForm from '@/components/shared/ContactForm';
import SEO from '@/components/shared/SEO';

const CasesDetalhe = () => {
  const { slug } = useParams<{ slug: string }>();
  const [caseData, setCaseData] = useState<CaseStudy | null>(null);
  const [loading, setLoading] = useState(true);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadCase = async () => {
      if (!slug) {
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const dbCase = await getCaseBySlug(slug);

        if (dbCase) {
          const mappedCase: CaseStudy = {
            title: dbCase.client_name || dbCase.title || 'Case sem título',
            category: dbCase.case_category || 'Geral',
            logo: dbCase.client_logo || '',
            coverImage: dbCase.image_url || '',
            challenge: dbCase.challenge || 'Desafio não informado.',
            solution: dbCase.solution || 'Solução não informada.',
            results: typeof dbCase.results === 'string' ? dbCase.results.split('\n') : (Array.isArray(dbCase.results) ? dbCase.results : []),
            metrics: (Array.isArray(dbCase.metrics) ? dbCase.metrics : []) as any[],
            quote: dbCase.testimonial_quote || '',
            author: dbCase.testimonial_author || '',
            role: dbCase.testimonial_role || '',
            authorImage: dbCase.testimonial_avatar || '',
            techStack: (Array.isArray((dbCase as any).tech_stack) ? (dbCase as any).tech_stack : []) || [],
            logoScale: (dbCase as any).logoScale || 1.4,
            preview_description: dbCase.preview_description || ''
          };
          setCaseData(mappedCase);
        } else {
          console.warn(`Case not found for slug: ${slug}`);
          setCaseData(null);
        }
      } catch (error) {
        console.error("Error loading case detail:", error);
        setCaseData(null);
      } finally {
        setLoading(false);
      }
    };

    loadCase();
    window.scrollTo(0, 0);
  }, [slug]);

  if (loading) {
    return (
      <PageLayout>
        <div className="h-screen w-full flex items-center justify-center bg-black">
          <Loader2 className="h-10 w-10 text-revgreen animate-spin" />
        </div>
      </PageLayout>
    )
  }

  if (!caseData) {
    return (
      <PageLayout>
        <CaseNotFound />
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <SEO
        title={`${caseData.title} | Case de Sucesso`}
        description={caseData.preview_description || `Confira como a ${caseData.title} transformou seus resultados com a RevHackers.`}
        canonical={`https://revhackers.com/cases/${slug}`}
      />

      <section className="relative min-h-[60vh] flex flex-col items-center justify-center pt-32 pb-24 overflow-hidden bg-white">
        <div className="absolute inset-0 z-0 opacity-40">
          {/* Subtle gradient instead of noise */}
          <div className="absolute inset-0 bg-zinc-50"></div>
        </div>

        <div className="container-custom flex flex-col items-center text-center max-w-6xl relative z-10">
          <Link to="/cases" className="absolute top-0 left-0 text-zinc-400 hover:text-black flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest transition-colors mb-8 md:mb-0 md:static self-start md:self-center bg-zinc-50 px-4 py-2 rounded-full border border-zinc-100">
            <ArrowLeft className="w-3 h-3" /> Voltar para Cases
          </Link>

          <header className="max-w-5xl pt-12 w-full mt-8">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>

              <div className="flex justify-center mb-10">
                {caseData.logo ? (
                  <img
                    src={caseData.logo}
                    alt={`${caseData.title} Logo`}
                    className="h-16 md:h-20 w-auto object-contain" // Removed brightness-0 invert
                  />
                ) : (
                  <span className="text-3xl font-bold text-black tracking-tighter">{caseData.title}</span>
                )}
              </div>

              <div className="flex flex-col md:flex-row items-center justify-center gap-4 mb-8">
                <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-zinc-400">
                  {caseData.category}
                </span>
              </div>

              <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-black mb-8 leading-tight tracking-tighter text-balance max-w-5xl mx-auto">
                {caseData.title}
              </h1>
            </motion.div>
          </header>

          {caseData.preview_description && (
            <p className="text-lg md:text-xl text-zinc-500 mb-16 max-w-3xl leading-relaxed font-normal text-balance mx-auto">
              {caseData.preview_description}
            </p>
          )}

          {caseData.metrics && caseData.metrics.length > 0 && (
            <div className="flex flex-wrap justify-center gap-12 md:gap-24 border-t border-zinc-100 pt-12 mt-4 animate-fade-in-up delay-300 w-full">
              {caseData.metrics.slice(0, 3).map((metric, idx) => (
                <div key={idx} className="text-center group">
                  <div className="text-4xl md:text-5xl font-bold text-black tracking-tighter mb-2 relative inline-block group-hover:scale-110 transition-transform duration-500 origin-center">
                    {metric.value}
                    <span className="absolute -top-2 -right-4 text-zinc-300 text-2xl font-light">+</span>
                  </div>
                  <div className="text-[9px] font-bold uppercase tracking-[0.2em] text-zinc-400">{metric.label}</div>
                </div>
              ))}
            </div>
          )}

          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 1 }}
            onClick={() => contentRef.current?.scrollIntoView({ behavior: 'smooth' })}
            className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3 text-zinc-300 hover:text-black transition-colors cursor-pointer group z-50 md:bottom-10"
          >
            <div className="w-px h-12 bg-zinc-300 group-hover:bg-black transition-colors"></div>
          </motion.button>
        </div>
      </section>

      <section className="py-20 bg-white border-t border-zinc-100 min-h-screen">
        <div className="container px-4 md:px-6 mx-auto max-w-7xl">
          <div className="grid grid-cols-12 gap-8 lg:gap-16">

            <div className="col-span-12 lg:col-span-3 order-2 lg:order-1">
              <div className="sticky top-32 space-y-12">

                <div>
                  <h4 className="font-bold text-black mb-6 border-l-4 border-black pl-4 uppercase tracking-widest text-xs">Sobre o Cliente</h4>
                  <p className="text-sm text-zinc-600 leading-relaxed mb-4">
                    Projeto desenvolvido para <strong>{caseData.title}</strong>, focado em estratégias de {caseData.category}.
                  </p>
                </div>

                {caseData.techStack && caseData.techStack.length > 0 && (
                  <div>
                    <h4 className="font-bold text-black mb-6 border-l-4 border-black pl-4 uppercase tracking-widest text-xs">Tech Stack</h4>
                    <div className="flex flex-wrap gap-2">
                      {caseData.techStack.map((tech) => (
                        <span key={tech} className="bg-zinc-100 text-zinc-600 px-3 py-1 rounded-sm text-xs font-medium border border-zinc-200">
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="bg-zinc-50 p-6 border border-zinc-100 rounded-sm">
                  <h5 className="font-bold text-black text-sm mb-2">Precisa de resultados assim?</h5>
                  <p className="text-xs text-zinc-500 mb-4">Agende um diagnóstico gratuito da sua operação.</p>
                  <Button asChild className="w-full bg-black hover:bg-revgreen hover:text-black text-white text-xs font-bold uppercase tracking-widest">
                    <Link to="/booking">Agendar Agora</Link>
                  </Button>
                </div>
              </div>
            </div>

            <div ref={contentRef} className="col-span-12 lg:col-span-9 lg:pl-10 lg:border-l border-zinc-50 order-1 lg:order-2">

              <div className="prose prose-lg max-w-none prose-headings:font-bold prose-headings:tracking-tight prose-a:text-revgreen">
                <div className="mb-16">
                  <h2 className="text-3xl font-bold text-black mb-6 flex items-center gap-3">
                    <span className="w-2 h-8 bg-revgreen block rounded-sm"></span>
                    O Desafio
                  </h2>
                  <div className="text-zinc-600 leading-relaxed text-lg whitespace-pre-line">
                    {caseData.challenge}
                  </div>
                </div>

                <div className="mb-16">
                  <h2 className="text-3xl font-bold text-black mb-6 flex items-center gap-3">
                    <span className="w-2 h-8 bg-black block rounded-sm"></span>
                    A Estratégia
                  </h2>
                  <div className="text-zinc-600 leading-relaxed text-lg whitespace-pre-line">
                    {caseData.solution}
                  </div>
                </div>

                <div className="mb-16">
                  <h2 className="text-3xl font-bold text-black mb-8 flex items-center gap-3">
                    <span className="w-2 h-8 bg-zinc-300 block rounded-sm"></span>
                    Resultados Alcançados
                  </h2>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    {caseData.metrics && caseData.metrics.map((metric, idx) => (
                      <div key={idx} className="bg-zinc-50 p-8 border border-zinc-100 rounded-sm hover:border-revgreen/50 transition-colors">
                        <TrendingUp className="w-6 h-6 text-revgreen mb-4" />
                        <div className="text-4xl font-black text-black tracking-tighter mb-2">{metric.value}</div>
                        <p className="text-sm font-bold uppercase tracking-widest text-zinc-500">{metric.label}</p>
                      </div>
                    ))}
                  </div>

                  {caseData.results && Array.isArray(caseData.results) && (
                    <ul className="space-y-4">
                      {caseData.results.map((result, idx) => (
                        <li key={idx} className="flex items-start gap-3 text-zinc-700 bg-white p-4 border-b border-zinc-100 last:border-0">
                          <CheckCircle2 className="w-5 h-5 text-revgreen shrink-0 mt-0.5" />
                          <span className="font-medium">{result}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                {caseData.quote && (
                  <div className="my-16 bg-black text-white p-10 md:p-12 relative rounded-sm overflow-hidden isolation">
                    <div className="absolute top-0 right-0 p-8 opacity-10">
                      <svg width="64" height="64" viewBox="0 0 24 24" fill="currentColor"><path d="M14.017 21L14.017 18C14.017 16.8954 14.9124 16 16.017 16H19.017C19.5693 16 20.017 15.5523 20.017 15V9C20.017 8.44772 19.5693 8 19.017 8H15.017C14.4647 8 14.017 8.44772 14.017 9V11C14.017 11.5523 13.5693 12 13.017 12H12.017V5H22.017V15C22.017 18.3137 19.3307 21 16.017 21H14.017ZM5.0166 21L5.0166 18C5.0166 16.8954 5.91203 16 7.0166 16H10.0166C10.5689 16 11.0166 15.5523 11.0166 15V9C11.0166 8.44772 10.5689 8 10.0166 8H6.0166C5.46432 8 5.0166 8.44772 5.0166 9V11C5.0166 11.5523 4.56889 12 4.0166 12H3.0166V5H13.0166V15C13.0166 18.3137 10.3303 21 7.0166 21H5.0166Z" /></svg>
                    </div>
                    <blockquote className="relative z-10">
                      <p className="text-xl md:text-2xl font-light italic leading-relaxed mb-8 text-zinc-200">
                        "{caseData.quote}"
                      </p>
                      <footer className="flex items-center gap-4">
                        {caseData.authorImage && (
                          <img src={caseData.authorImage} alt={caseData.author} className="w-12 h-12 rounded-full border-2 border-zinc-800" />
                        )}
                        <div>
                          <cite className="not-italic font-bold text-white block uppercase tracking-wider text-sm">{caseData.author}</cite>
                          <span className="text-zinc-500 text-xs font-mono uppercase tracking-widest">{caseData.role}</span>
                        </div>
                      </footer>
                    </blockquote>
                  </div>
                )}

              </div>

              <div className="mt-20 pt-12 border-t border-zinc-200">
                <div className="bg-zinc-50 border border-zinc-200 p-8 md:p-12 rounded-sm text-center">
                  <h3 className="text-2xl font-bold text-black mb-4">Pronto para escrever sua história de sucesso?</h3>
                  <p className="text-zinc-600 mb-8 max-w-xl mx-auto">
                    Nossa metodologia já gerou mais de R$ 500M em receita para nossos clientes. Vamos descobrir como aplicar no seu negócio.
                  </p>
                  <div className="w-full max-w-md mx-auto">
                    <ContactForm />
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </section>
    </PageLayout>
  );
};

export default CasesDetalhe;
