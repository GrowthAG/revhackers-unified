
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PageLayout from '@/components/layout/PageLayout';
import { Button } from '@/components/ui/button';
import { FileText, Book, BookOpen, BarChart3, PlaySquare, FileSpreadsheet, Search, ArrowRight } from 'lucide-react';
import DOMPurify from 'dompurify';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import Section from '@/components/ui/Section';
import { Input } from '@/components/ui/input';
import MaterialModal from '@/components/shared/MaterialModal';
import SEO from '@/components/shared/SEO';
import DarkHeroSection from '@/components/shared/DarkHeroSection';
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
  const navigate = useNavigate();

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

        }
      } catch (err: any) {
        console.warn('⚠️ [DATABASE] Falha ao buscar materiais (usando offline/static):', err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchMaterials();
  }, []);

  // Pure Database Data - filter out materials with Google Drive links (invalid)
  const materials = apiMaterials.filter(m => {
    const link = (m.link_material || '').toLowerCase();
    return !link.includes('docs.google.com') && !link.includes('drive.google.com');
  });

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
      <SEO
        title="Materiais"
        description="Frameworks, checklists, playbooks e templates para escalar sua operação de revenue. Downloads gratuitos para profissionais B2B."
        canonical="https://revhackers.com/materiais"
      />
      <DarkHeroSection
        title="Materiais"
        subtitle="Frameworks, checklists e playbooks para escalar sua operação de revenue."
        searchPlaceholder="BUSCAR MATERIAIS..."
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        categories={categories}
        activeCategory={activeCategory}
        onCategoryChange={setActiveCategory}
      />

      {/* Content Section (White Background) */}
      <section className="bg-white min-h-screen relative pb-24">
        <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] opacity-10 pointer-events-none" />

        <div className="container-custom relative z-10 pt-12">

          {loading ? (
            <div className="text-center py-20">
              <div className="mx-auto w-12 h-12 rounded-full border-2 border-zinc-100 border-t-black animate-spin mb-4"></div>
              <p className="text-xxs font-black uppercase tracking-widest text-zinc-400">Carregando Hub...</p>
            </div>
          ) : filteredMaterials.length === 0 ? (
            <div className="text-center py-20 border border-dashed border-zinc-200 bg-zinc-50/50 max-w-2xl mx-auto">
              <div className="mx-auto w-16 h-16 bg-zinc-100 rounded-full flex items-center justify-center mb-6">
                <BookOpen className="h-8 w-8 text-zinc-300" />
              </div>
              <h3 className="text-xl font-black uppercase tracking-tight text-black mb-2">Nenhum material encontrado</h3>
              <p className="text-zinc-500 text-xxs font-bold uppercase tracking-widest">Tente ajustar seus termos de busca.</p>
              <Button
                variant="link"
                className="text-black uppercase text-xxs font-black tracking-widest mt-6 hover:text-revgreen transition-colors"
                onClick={() => { setSearchQuery(''); setActiveCategory('Todos'); }}
              >
                Limpar filtros
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredMaterials.map((material, index) => {
                const type = material.material_type || material.type || "Geral";
                const IconComponent = IconMap[type] || FileText;
                const title = material.material_name || material.title || "Sem título";

                return (
                  <div
                    key={index}
                    className="group"
                    onClick={() => {
                      // Generate slug from title and navigate to landing page
                      const slug = (material.slug || title)
                        .toLowerCase()
                        .replace(/[^\w\s-]/g, '')
                        .replace(/\s+/g, '-')
                        .replace(/-+/g, '-');
                      navigate(`/materiais/${slug}`);
                    }}
                  >
                    <div className="h-full flex flex-col p-8 rounded-sm border border-zinc-200 bg-white shadow-sm hover:-translate-y-1 transition-all duration-500 relative cursor-pointer group">
                      <div className="flex justify-between items-start mb-6">
                        <span className="text-2xs font-black uppercase tracking-widest text-black bg-white px-2 py-1 rounded-sm border border-zinc-200">
                          {type}
                        </span>
                        <IconComponent className="h-5 w-5 text-zinc-200 group-hover:text-black transition-all duration-500" />
                      </div>

                      <h3
                        className="text-lg md:text-xl font-bold text-white mb-3 group-hover:text-revgreen transition-colors line-clamp-2 leading-tight"
                        dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(removeEmojis(title)) }}
                      ></h3>

                      <div
                        className="text-xxs text-zinc-400 font-bold uppercase tracking-[0.2em] leading-relaxed mb-8 flex-1 line-clamp-4"
                        dangerouslySetInnerHTML={{
                          __html: material.description ? (material.description.substring(0, 150) + (material.description.length > 150 ? '...' : '')) : ''
                        }}
                      />

                      <div className="mt-auto pt-6 border-t border-zinc-50 flex items-center justify-between">
                        <span className="text-xxs font-black text-black uppercase tracking-widest transition-all flex items-center group-hover:gap-2">
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
                className="bg-black text-white hover:bg-revgreen hover:text-black font-black tracking-widest uppercase px-10 h-16 rounded-sm text-xs transition-all duration-500 shadow-sm hover:shadow-revgreen/20"
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
