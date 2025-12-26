import { useState, useEffect } from 'react';
import PageLayout from '@/components/layout/PageLayout';
import { Link } from 'react-router-dom';
import ContactForm from '@/components/shared/ContactForm';
import Section from '@/components/ui/Section';
import { Search, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';

const Cases = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('Todos');
  const [loading, setLoading] = useState(true);
  const [cases, setCases] = useState<any[]>([]);

  // Buscar cases do Supabase
  useEffect(() => {
    const fetchCases = async () => {
      console.log('🔄 INICIANDO BUSCA DE CASES - ' + new Date().toISOString());

      try {
        const { data, error } = await supabase
          .from('cases')
          .select('*')
          .eq('published', true)
          .order('date', { ascending: false });

        console.log('📊 RESULTADO DA BUSCA:');
        console.log('- Erro:', error);
        console.log('- Dados recebidos:', data?.length || 0);

        if (data) {
          console.log('📋 LISTA COMPLETA DE CASES:');
          data.forEach((c, i) => {
            console.log(`${i + 1}. ID: ${c.id} | Título: ${c.client_name || c.title} | Categoria: ${c.case_category}`);
          });
        }

        if (!error && data) {
          setCases(data);
          console.log('✅ CASES SETADOS NO ESTADO:', data.length);
        } else {
          console.log('❌ ERRO AO CARREGAR:', error);
          setCases([]);
        }
      } catch (err) {
        console.log('💥 EXCEÇÃO:', err);
        setCases([]);
      } finally {
        setLoading(false);
        console.log('🏁 BUSCA FINALIZADA');
      }
    };

    fetchCases();
  }, []);



  const error = null;

  const categories = ['Todos', ...Array.from(new Set(cases.map(c => c.case_category || 'Geral').filter(Boolean)))];

  const filteredCases = cases.filter(c => {
    const searchLower = searchQuery.toLowerCase();
    const title = c.title?.toLowerCase() || '';
    const desc = c.preview_description?.toLowerCase() || '';
    const cat = c.case_category?.toLowerCase() || '';

    const matchesSearch = title.includes(searchLower) || desc.includes(searchLower) || cat.includes(searchLower);
    const matchesCategory = activeCategory === 'Todos' || c.case_category === activeCategory;

    return matchesSearch && matchesCategory;
  });

  return (
    <PageLayout>
      {/* Standardized Header */}
      <div className="bg-black py-12 md:py-20 border-b border-white/10 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-white/[0.05] pointer-events-none" />

        <div className="container-custom relative z-10">
          <div className="max-w-2xl mx-auto text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-white tracking-tight">Cases de Sucesso</h1>
            <p className="text-lg text-gray-400 font-light">
              Histórias reais de empresas que transformaram seus resultados.
            </p>
          </div>

          <div className="max-w-md mx-auto relative mb-12">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-500" />
            <Input
              type="search"
              placeholder="Buscar cases..."
              className="pl-10 pr-4 py-6 bg-zinc-900/80 border-white/10 text-white placeholder:text-gray-600 focus:border-revgreen transition-colors rounded-xl backdrop-blur-sm"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="flex flex-wrap justify-center gap-3">
            {categories.map(category => (
              <button
                key={category}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${activeCategory === category
                  ? "bg-revgreen text-black shadow-[0_0_15px_rgba(74,222,128,0.3)] font-bold"
                  : "bg-zinc-900/50 text-gray-400 hover:bg-zinc-800 hover:text-white border border-white/5 hover:border-white/20"
                  }`}
                onClick={() => setActiveCategory(category)}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Cases Grid */}
      <Section variant="dark" className="py-24 bg-black min-h-screen relative">
        <div className="absolute inset-0 bg-grid-white/[0.03] pointer-events-none" />
        <div className="container-custom relative z-10">

          {loading ? (
            <div className="flex justify-center items-center py-20">
              <Loader2 className="w-8 h-8 text-revgreen animate-spin" />
            </div>
          ) : filteredCases.length === 0 ? (
            <div className="text-center py-20 border border-dashed border-zinc-800 rounded-xl bg-zinc-900/30">
              <h3 className="text-xl font-medium text-white">Nenhum case encontrado</h3>
              <Button variant="link" className="text-revgreen mt-4" onClick={() => { setSearchQuery(''); setActiveCategory('Todos') }}>
                Limpar filtros
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredCases.map((study, index) => (
                <Link to={`/cases/${study.slug}`} className="group h-full" key={study.id || index}>
                  <div className={`
                    bg-white/5 overflow-hidden h-full flex flex-col transition-all duration-300 relative rounded-sm
                    ${study.featured
                      ? 'border border-revgreen/30 hover:border-revgreen shadow-[0_0_30px_rgba(0,255,136,0.05)]'
                      : 'border border-white/10 hover:border-revgreen'
                    }
                  `}>
                    {study.featured && (
                      <div className="absolute top-4 right-4 z-20">
                        <span className="bg-revgreen text-black text-[10px] font-bold px-2 py-1 rounded-sm uppercase tracking-wide">Destaque</span>
                      </div>
                    )}

                    <div className="h-48 overflow-hidden bg-white flex items-center justify-center p-8 border-b border-white/10 relative">
                      {study.client_logo ? (
                        <img src={study.client_logo} alt={study.title} className="w-full h-full object-contain hover:scale-105 transition-transform duration-500" />
                      ) : (
                        <div className="text-gray-300 font-bold text-2xl uppercase">{study.client_name?.substring(0, 2)}</div>
                      )}
                    </div>

                    <div className="p-8 flex-1 flex flex-col">
                      <span className="text-xs font-mono-tech uppercase tracking-wider text-revgreen mb-2">
                        {study.case_category} {study.industry ? `• ${study.industry}` : ''}
                      </span>
                      <h3 className="text-2xl font-bold text-white mb-3">{study.title}</h3>
                      <p className="text-gray-400 font-light text-sm mb-6 flex-1">
                        {study.preview_description}
                      </p>
                      <div className="pt-4 border-t border-white/10">
                        <p className="text-sm font-bold text-white group-hover:text-revgreen">
                          {study.primary_metric}
                        </p>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </Section>

      {/* CTA Section */}
      <Section variant="light" className="py-20 bg-gray-50 border-t border-gray-200">
        <div className="container-custom">
          <div className="max-w-4xl mx-auto flex flex-col md:flex-row gap-12 items-center">
            <div className="flex-1">
              <h2 className="text-3xl font-normal mb-6 text-black tracking-tight">Sua empresa será nosso próximo case?</h2>
              <p className="text-lg text-gray-500 mb-8 font-light">
                Entre em contato agora mesmo e descubra como podemos ajudar sua empresa
                a obter resultados excepcionais como estes.
              </p>
            </div>

            <div className="w-full md:w-auto bg-white p-8 rounded-sm shadow-sm border border-gray-200 flex-1">
              <ContactForm formType="diagnosis" />
            </div>
          </div>
        </div>
      </Section>
    </PageLayout>
  );
};

export default Cases;
