import { useState, useEffect } from 'react';
import PageLayout from '@/components/layout/PageLayout';
import { Link } from 'react-router-dom';
import ContactForm from '@/components/shared/ContactForm';
import Section from '@/components/ui/Section';
import { Search, Loader2, ArrowRight } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import SEO from '@/components/shared/SEO';
import DarkHeroSection from '@/components/shared/DarkHeroSection';
import { getAllCases, CaseStudy } from '@/api/cases';


const Cases = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('Todos');
  const [loading, setLoading] = useState(true);
  const [cases, setCases] = useState<any[]>([]);

  // Buscar cases via API Centralizada (com Overrides)
  useEffect(() => {
    const fetchCases = async () => {
      try {
        const data = await getAllCases();
        if (data) {
          setCases(data);
        }
      } catch (err: any) {
        console.warn('⚠️ [API] Falha ao buscar cases:', err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCases();
  }, []);

  // Format Database Cases
  const filteredCases = cases.map(dbCase => ({
    ...dbCase,
    // Ensure all required fields for UI are present
    client_logo: dbCase.client_logo || '',
    title: dbCase.client_name || dbCase.title,
    case_category: dbCase.case_category || 'Geral',
    preview_description: dbCase.preview_description || dbCase.description || '',
    image_url: dbCase.image_url || dbCase.cover_image,
    slug: dbCase.slug
  })).filter(c => {
    const searchLower = searchQuery.toLowerCase();
    const title = (c.title || '').toLowerCase();
    const desc = (c.preview_description || '').toLowerCase();
    const cat = (c.case_category || '').toLowerCase();

    const matchesSearch = title.includes(searchLower) || desc.includes(searchLower) || cat.includes(searchLower);
    const matchesCategory = activeCategory === 'Todos' || c.case_category === activeCategory;

    return matchesSearch && matchesCategory;
  });

  const categories = ['Todos', ...Array.from(new Set(cases.map(c => c.case_category || 'Geral').filter(Boolean)))];

  return (
    <PageLayout>
      <SEO
        title="Cases de Sucesso"
        description="Histórias reais de empresas que transformaram seus resultados com Revenue Operations, ABM e Growth Engineering."
        canonical="https://revhackers.com/cases"
      />
      <DarkHeroSection
        title="Cases"
        subtitle="Histórias reais de empresas que transformaram seus resultados através de inteligência técnica."
        searchPlaceholder="BUSCAR CASES..."
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        categories={categories}
        activeCategory={activeCategory}
        onCategoryChange={setActiveCategory}
      />

      {/* Cases Grid */}
      <section className="pb-24 bg-white min-h-screen relative">
        <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] opacity-10 pointer-events-none" />
        <div className="container-custom relative z-10">

          {loading ? (
            <div className="flex justify-center items-center py-20">
              <Loader2 className="w-8 h-8 text-black animate-spin" />
            </div>
          ) : filteredCases.length === 0 ? (
            <div className="text-center py-20 border border-dashed border-zinc-200 bg-zinc-50/30">
              <h3 className="text-xl font-black uppercase tracking-widest text-black">Nenhum case encontrado</h3>
              <Button variant="link" className="text-black font-bold uppercase tracking-widest text-xxs mt-4" onClick={() => { setSearchQuery(''); setActiveCategory('Todos') }}>
                Limpar filtros
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredCases.map((study, index) => (
                <Link to={`/cases/${study.slug}`} className="group h-full" key={study.id || index}>
                  <div className={`
                    bg-white overflow-hidden h-full flex flex-col transition-all duration-500 relative rounded-sm border border-zinc-200 hover:border-black shadow-sm hover:-translate-y-1
                  `}>
                    <div className="h-56 overflow-hidden bg-zinc-50 flex items-center justify-center border-b border-zinc-100 relative transition-all">
                      <div className="w-full h-full flex items-center justify-center p-10 transition-transform duration-700 group-hover:scale-105">
                        <img
                          src={study.client_logo}
                          alt={study.title}
                          className="max-w-[200px] max-h-[110px] w-auto h-auto object-contain opacity-100 grayscale group-hover:grayscale-0 transition-all duration-500"
                          style={{
                            transform: study.logoScale ? `scale(${study.logoScale})` : 'scale(1.0)',
                          }}
                        />
                      </div>
                    </div>

                    <div className="p-10 md:p-12 flex-1 flex flex-col bg-white">
                      <span className="text-2xs font-black uppercase tracking-[0.2em] text-zinc-400 mb-6 font-mono-tech bg-zinc-50 w-fit px-2 py-1 rounded-full border border-zinc-100">
                        {study.case_category}
                      </span>
                      <h3 className="text-2xl font-bold text-black mb-4 group-hover:text-zinc-500 transition-colors leading-tight">
                        {study.title}
                      </h3>
                      <p className="text-zinc-600 font-normal text-mini mb-8 flex-1 line-clamp-3 leading-relaxed">
                        {study.preview_description}
                      </p>

                      <div className="pt-8 border-t border-zinc-100 flex items-center justify-between group-hover:opacity-100 transition-opacity">
                        <span className="text-xxs font-bold uppercase tracking-[0.2em] text-black">
                          Ver Detalhes
                        </span>
                        <ArrowRight className="h-4 w-4 text-black group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-white border-t border-zinc-100">
        <div className="container-custom">
          <div className="max-w-4xl mx-auto flex flex-col md:flex-row gap-12 items-center">
            <div className="flex-1">
              <h2 className="text-3xl font-normal mb-6 text-black tracking-tight">Sua empresa será nosso próximo case?</h2>
              <p className="text-lg text-zinc-500 mb-8 font-light">
                Entre em contato agora mesmo e descubra como podemos ajudar sua empresa
                a obter resultados excepcionais como estes.
              </p>
            </div>

            <div className="w-full md:w-auto bg-white p-8 rounded-sm shadow-sm border border-zinc-200 flex-1">
              <ContactForm formType="diagnosis" />
            </div>
          </div>
        </div>
      </section>
    </PageLayout>
  );
};

export default Cases;
