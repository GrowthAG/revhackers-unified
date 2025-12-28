
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PageLayout from '@/components/layout/PageLayout';
import { Button } from '@/components/ui/button';
import { FileText, Book, BookOpen, BarChart3, PlaySquare, FileSpreadsheet, Search, ArrowRight } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import Section from '@/components/ui/Section';
import { Input } from '@/components/ui/input';
import MaterialModal from '@/components/shared/MaterialModal';
import BookingModal from '@/components/shared/BookingModal';
import { removeEmojis } from '@/utils/stringUtils';
// import { materialsData } from '@/data/materialsData'; // REMOVED: Usage of static data disabled.

// Icon map for dynamic icon rendering
const IconMap: Record<string, React.ElementType> = {
  FileText,
  Book,
  BookOpen,
  BarChart3,
  PlaySquare,
  FileSpreadsheet
};

const Materiais = () => {
  const [showForm, setShowForm] = useState(false);
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState<any | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('Todos');
  const [loading, setLoading] = useState(true);
  const [apiMaterials, setApiMaterials] = useState<any[]>([]);
  const { toast } = useToast();

  // Buscar materiais do Supabase com timeout
  useEffect(() => {
    const fetchMaterials = async () => {
      try {
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Timeout de rede')), 10000)
        );

        const fetchPromise = supabase
          .from('materials')
          .select('*')
          .eq('published', true)
          .order('created_at', { ascending: false });

        const { data, error } = await Promise.race([fetchPromise, timeoutPromise]) as any;

        if (error) throw error;

        if (data) {
          setApiMaterials(data);
          console.log('✅ [DATABASE] Materiais carregados:', data.length);
        }
      } catch (err: any) {
        console.warn('⚠️ [DATABASE] Falha ao buscar materiais (usando offline/static):', err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchMaterials();
  }, []);

  // Pure Database Data
  const materials = apiMaterials;

  const handleDownloadClick = (material: any) => {
    setSelectedMaterial(material);
    setShowForm(true);
  };

  const handleFormSubmit = () => {
    toast({
      title: "Material disponível!",
      description: "Seu download está sendo preparado e foi enviado para seu email.",
    });
    setShowForm(false);
  };

  const categories = ['Todos', ...Array.from(new Set(materials.map(m => m.material_type || m.type).filter(Boolean)))];

  const filteredMaterials = materials.filter(material => {
    const title = material.material_name || material.title || '';
    const type = material.material_type || material.type || '';
    const description = material.description || '';

    const matchesSearch = title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === 'Todos' || type === activeCategory;

    return matchesSearch && matchesCategory;
  });

  return (
    <PageLayout>
      {/* 1. Dark Hero Header (Standardized with Blog) */}
      <section className="bg-black py-24 md:py-32 relative overflow-hidden">
        {/* Sophisticated Dark Pattern */}
        <div className="absolute inset-0 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:24px_24px] opacity-[0.03] pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/50 to-black pointer-events-none" />

        <div className="container-custom relative z-10">
          <div className="max-w-4xl mx-auto text-center mb-16">
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-8 text-white tracking-tight leading-[1.1]">
              Materiais<span className="text-revgreen">.</span>
            </h1>
            <p className="text-lg md:text-xl text-zinc-500 font-normal tracking-tight leading-relaxed max-w-2xl mx-auto">
              Frameworks, checklists e playbooks para escalar sua operação de revenue.
            </p>
          </div>

          <div className="max-w-xl mx-auto relative mb-20">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-zinc-500" />
            <Input
              type="search"
              placeholder="BUSCAR MATERIAIS..."
              className="pl-12 pr-4 py-8 bg-zinc-900/30 border-zinc-800 text-white placeholder:text-zinc-600 focus:border-revgreen/50 transition-all rounded-sm shadow-2xl text-xs font-bold uppercase tracking-widest"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="flex flex-wrap justify-center gap-x-8 gap-y-4 border-t border-zinc-900/50 pt-8 mt-12">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`text-[10px] uppercase tracking-[0.2em] font-bold font-sans transition-all duration-300 relative py-2 ${activeCategory === category
                  ? "text-revgreen"
                  : "text-zinc-500 hover:text-white"
                  }`}
              >
                {category}
                {activeCategory === category && (
                  <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-revgreen" />
                )}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Content Section (White Background) */}
      <section className="bg-white min-h-screen relative pb-24">
        <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] opacity-10 pointer-events-none" />

        <div className="container-custom relative z-10 pt-12">

          {loading ? (
            <div className="text-center py-20">
              <div className="mx-auto w-12 h-12 rounded-full border-2 border-zinc-100 border-t-black animate-spin mb-4"></div>
              <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Carregando Hub...</p>
            </div>
          ) : filteredMaterials.length === 0 ? (
            <div className="text-center py-20 border border-dashed border-zinc-200 rounded-xl bg-zinc-50/50 max-w-2xl mx-auto">
              <div className="mx-auto w-16 h-16 bg-zinc-100 rounded-full flex items-center justify-center mb-6">
                <BookOpen className="h-8 w-8 text-zinc-300" />
              </div>
              <h3 className="text-xl font-black uppercase tracking-tight text-black mb-2">Nenhum material encontrado</h3>
              <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest">Tente ajustar seus termos de busca.</p>
              <Button
                variant="link"
                className="text-black uppercase text-[10px] font-black tracking-widest mt-6 hover:text-revgreen transition-colors"
                onClick={() => { setSearchQuery(''); setActiveCategory('Todos'); }}
              >
                Limpar filtros
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredMaterials.map((material, index) => {
                const type = material.type || "Geral";
                const IconComponent = IconMap[type] || FileText;
                const title = material.title || "Sem título";

                return (
                  <div
                    key={index}
                    className="group"
                    onClick={() => handleDownloadClick(material)}
                  >
                    <div className="h-full flex flex-col p-8 rounded-sm border border-zinc-200 bg-white shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all duration-500 relative cursor-pointer group">
                      <div className="flex justify-between items-start mb-6">
                        <span className="text-[9px] font-black uppercase tracking-widest text-black bg-white px-2 py-1 rounded-sm border border-zinc-200">
                          {type}
                        </span>
                        <IconComponent className="h-5 w-5 text-zinc-200 group-hover:text-black transition-all duration-500" />
                      </div>

                      <h3
                        className="text-xl font-bold tracking-tight text-black mb-4 leading-[1.1] group-hover:text-zinc-700 transition-colors"
                        dangerouslySetInnerHTML={{ __html: removeEmojis(title) }}
                      />

                      <div
                        className="text-[10px] text-zinc-400 font-bold uppercase tracking-[0.2em] leading-relaxed mb-8 flex-1 line-clamp-4"
                        dangerouslySetInnerHTML={{
                          __html: material.description ? (material.description.substring(0, 150) + (material.description.length > 150 ? '...' : '')) : ''
                        }}
                      />

                      <div className="mt-auto pt-6 border-t border-zinc-50 flex items-center justify-between">
                        <span className="text-[10px] font-black text-black uppercase tracking-widest transition-all flex items-center group-hover:gap-2">
                          Baixar Material
                          <ArrowRight className="ml-2 h-3 w-3 transition-all" />
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* 3. CTA Footer */}
      <div className="py-24 bg-white border-t border-zinc-200">
        <div className="container-custom">
          <div className="flex flex-col md:flex-row items-center justify-between gap-10">
            <div className="max-w-2xl text-center md:text-left">
              <h2 className="text-3xl md:text-5xl font-semibold mb-6 text-black tracking-tighter uppercase leading-tight">
                Precisa de Ajuda Estratégica?
              </h2>
              <p className="text-xl text-zinc-500 font-normal tracking-tight leading-relaxed">
                Agende um diagnóstico gratuito e descubra onde sua operação está perdendo receita.
              </p>
            </div>
            <div className="flex-shrink-0">
              <Button
                size="lg"
                onClick={() => setIsBookingOpen(true)}
                className="bg-black text-white hover:bg-revgreen hover:text-black font-black tracking-widest uppercase px-10 h-16 rounded-sm text-xs transition-all duration-500 shadow-2xl hover:shadow-revgreen/20"
              >
                Agendar Conversa
              </Button>
            </div>
          </div>
        </div>
      </div>

      <MaterialModal
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        material={selectedMaterial}
        onSuccess={handleFormSubmit}
      />

      <BookingModal
        isOpen={isBookingOpen}
        onClose={() => setIsBookingOpen(false)}
      />
    </PageLayout>
  );
};

export default Materiais;
