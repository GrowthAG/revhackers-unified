
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import PageLayout from '@/components/layout/PageLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Book, BookOpen, BarChart3, PlaySquare, FileSpreadsheet, ExternalLink, Search } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import Section from '@/components/ui/Section';
import { Input } from '@/components/ui/input';
import MaterialModal from '@/components/shared/MaterialModal';
import { removeEmojis } from '@/utils/stringUtils';

import { materialsData } from '@/data/materialsData';

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
        // Timeout de 3 segundos
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Timeout')), 3000)
        );

        const fetchPromise = supabase
          .from('materials')
          .select('*')
          .eq('published', true)
          .order('date', { ascending: false });

        const { data, error } = await Promise.race([fetchPromise, timeoutPromise]) as any;

        if (!error && data) {
          setApiMaterials(data);
          console.log('✅ Materiais do Supabase carregados:', data.length);
        } else {
          console.log('⚠️ Usando apenas dados estáticos de materiais');
        }
      } catch (err) {
        console.log('⚠️ Erro ao buscar materiais (usando dados estáticos):', err);
      } finally {
        setLoading(false);
      }
    };

    fetchMaterials();
  }, []);

  // Merge API data with Static data
  const apiSlugs = new Set(apiMaterials.map(m => m.slug || m.material_url?.split('/').pop()));
  const staticItemsToAdd = materialsData.filter(staticItem => !apiSlugs.has(staticItem.slug));
  const materials = [...apiMaterials, ...staticItemsToAdd];

  // Debug logs
  console.log('📊 Materiais Debug:', {
    apiMaterials: apiMaterials.length,
    staticItemsToAdd: staticItemsToAdd.length,
    totalMaterials: materials.length,
    firstMaterial: materials[0]
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
    console.log(`Material ${selectedMaterial?.materialId} requested for download`);
  };

  const cleanTitle = (title: string) => {
    const div = document.createElement('div');
    div.innerHTML = title;
    return div.textContent || div.innerText || '';
  };

  const getSlugFromTitle = (title: string) => {
    return cleanTitle(title)
      .toLowerCase()
      .replace(/[^\w\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-'); // Replace multiple hyphens with a single one
  };

  const categories = ['Todos', ...Array.from(new Set(materials.map(m => m.type).filter(Boolean)))];

  const filteredMaterials = materials.filter(material => {
    const title = material.title || '';
    const type = material.type || '';

    const matchesSearch = title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      material.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === 'Todos' || type === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <PageLayout>
      {/* 1. Standardized Header (Compact & Clean) */}
      <div className="bg-black pt-12 pb-6 border-b border-white/10 relative overflow-hidden">
        {/* Abstract Background Effect */}
        <div className="absolute inset-0 bg-grid-white/[0.05] pointer-events-none" />

        <div className="container-custom relative z-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
            <div className="max-w-2xl">
              <h1 className="text-3xl md:text-4xl font-bold mb-2 text-white tracking-tight">MATERIAIS RICOS</h1>
              <p className="text-base text-gray-400 font-light">
                Baixe nossos conteúdos exclusivos sobre Revenue Operations e Growth.
              </p>
            </div>

            <div className="w-full md:w-72 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
              <Input
                type="search"
                placeholder="Buscar materiais..."
                className="pl-9 h-10 bg-zinc-900/80 border-white/10 text-white placeholder:text-gray-500 focus:border-revgreen transition-colors rounded-lg text-sm"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {categories.map(category => (
              <button
                key={category as string}
                className={`px-3 py-1.5 rounded-sm text-xs font-medium uppercase tracking-wide transition-all duration-300 ${activeCategory === category
                  ? "bg-revgreen text-black font-bold border border-revgreen"
                  : "bg-zinc-900 text-gray-400 hover:text-white border border-zinc-800 hover:border-zinc-700"
                  }`}
                onClick={() => setActiveCategory(category as string)}
              >
                {category as string}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Materials Grid */}
      <Section variant="dark" className="pt-10 pb-24 bg-black min-h-screen relative">
        <div className="absolute inset-0 bg-grid-white/[0.03] pointer-events-none" />
        <div className="container-custom relative z-10">
          {loading ? (
            <div className="flex justify-center items-center min-h-[200px]">
              <div className="text-center">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em]" role="status"></div>
                <p className="mt-4 text-gray-600 font-mono-tech text-sm uppercase">Carregando...</p>
              </div>
            </div>
          ) : filteredMaterials.length === 0 ? (
            <div className="text-center py-20 border border-dashed border-zinc-800 rounded-xl bg-zinc-900/30">
              <h3 className="text-xl font-medium text-white">Nenhum material encontrado</h3>
              <p className="text-gray-500 mt-2 font-light">Tente ajustar seus termos de busca.</p>
              <Button variant="link" className="text-revgreen mt-4" onClick={() => { setSearchQuery(''); setActiveCategory('Todos') }}>
                Limpar filtros
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredMaterials.map((material, index) => {

                // Use DB Schema fields (Prioritize DB columns)
                const title = material.title || "Sem título";
                const type = material.type || "Geral";

                // Map type to icon or default
                const IconComponent = IconMap[type] || FileText;

                return (
                  <div key={index} className="group h-full cursor-pointer" onClick={() => handleDownloadClick(material)}>
                    <div className="h-full flex flex-col p-8 rounded-sm border border-white/10 bg-zinc-900/30 hover:bg-zinc-900 hover:border-revgreen transition-all duration-300 relative overflow-hidden group hover:shadow-[0_0_30px_rgba(0,255,136,0.05)]">

                      {/* Subtle Top Accent */}
                      <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/5 to-transparent group-hover:via-revgreen/50 transition-all duration-500" />

                      <div className="flex justify-between items-start mb-6">
                        <span className="text-[10px] font-mono-tech uppercase tracking-widest text-revgreen px-2 py-1 bg-revgreen/5 rounded-sm border border-revgreen/10 group-hover:bg-revgreen/10 transition-colors">
                          {type}
                        </span>
                        <IconComponent className="h-5 w-5 text-zinc-700 group-hover:text-revgreen transition-colors duration-300" />
                      </div>

                      <h3
                        className="text-xl font-bold text-white mb-3 leading-snug group-hover:text-revgreen transition-colors line-clamp-2"
                        dangerouslySetInnerHTML={{ __html: removeEmojis(title) }}
                      />

                      <div
                        className="text-sm text-gray-500 font-light leading-relaxed mb-8 flex-1 line-clamp-4"
                        dangerouslySetInnerHTML={{
                          __html: material.description ? (material.description.substring(0, 150) + (material.description.length > 150 ? '...' : '')) : ''
                        }}
                      />

                      <div className="mt-auto pt-5 border-t border-white/5 flex items-center justify-between">
                        <span className="text-[10px] font-bold text-gray-400 group-hover:text-white uppercase tracking-widest transition-colors flex items-center">
                          Baixar Agora
                        </span>
                        <ExternalLink className="h-3 w-3 text-revgreen opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all duration-300" />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Modal Implementation */}
          <MaterialModal
            isOpen={showForm}
            onClose={() => setShowForm(false)}
            material={selectedMaterial}
            onSuccess={handleFormSubmit}
          />
        </div>
      </Section>

      {/* CTA Footer - Minimalist Flat */}
      <Section variant="light" className="py-24 bg-white border-t border-gray-100">
        <div className="container-custom">
          <div className="flex flex-col md:flex-row items-center justify-between gap-10">
            <div className="max-w-2xl text-center md:text-left">
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900 tracking-tight leading-tight">
                Precisa de conteúdo personalizado?
              </h2>
              <p className="text-lg text-gray-500 font-light leading-relaxed">
                Entre em contato conosco para solicitar materiais exclusivos e frameworks sob medida para sua operação.
              </p>
            </div>
            <div className="flex-shrink-0">
              <Button asChild size="lg" className="bg-black text-white hover:bg-revgreen hover:text-black font-bold tracking-wide uppercase px-10 h-14 rounded-full text-sm transition-all duration-300 shadow-xl hover:shadow-revgreen/20">
                <a href="/contact">Agendar Conversa</a>
              </Button>
            </div>
          </div>
        </div>
      </Section>
    </PageLayout>
  );
};

export default Materiais;
// Re-trigger build
