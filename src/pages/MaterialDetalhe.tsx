import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PageLayout from '@/components/layout/PageLayout';
import { Button } from '@/components/ui/button';
import { Download, Check } from 'lucide-react';
import { getAllMaterials } from '@/api/materialsService';
import DownloadForm from '@/components/shared/download-form';
import { removeEmojis } from '@/utils/stringUtils';
import { useToast } from '@/components/ui/use-toast';
import { materialsData } from '@/data/materialsData';

const MaterialDetalhe = () => {
  const {
    slug
  } = useParams<{
    slug: string;
  }>();
  const [material, setMaterial] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const {
    toast
  } = useToast();
  const navigate = useNavigate();
  useEffect(() => {
    window.scrollTo(0, 0);
    const fetchMaterial = async () => {
      setLoading(true);
      try {
        const materials = await getAllMaterials();

        // Normalize the slug for comparison
        const normalizedSlug = slug?.toLowerCase().replace(/[^\w-]+/g, '-');

        // Find the material that matches the slug
        let foundMaterial = materials.find(item => {
          // Extract a slug from the title
          const itemTitle = (item as any).material_name || (typeof item.title === 'string' ? item.title : (item.title as any)?.rendered ? (item.title as any).rendered : '');
          const itemSlug = itemTitle.toLowerCase().replace(/<[^>]*>/g, '') // Remove HTML tags
            .replace(/[^\w\s-]/g, '') // Remove special characters
            .replace(/\s+/g, '-') // Replace spaces with hyphens
            .replace(/-+/g, '-'); // Replace multiple hyphens with a single one

          return itemSlug === normalizedSlug;
        });

        if (!foundMaterial) {
          // Fallback to static data
          console.log("Material not found in API, checking static data...");
          foundMaterial = materialsData.find(m => m.slug === normalizedSlug) as any;
        }

        if (foundMaterial) {
          setMaterial(foundMaterial);
        } else {
          // Material not found, redirect to materials list
          navigate('/materiais');
          toast({
            title: "Material não encontrado",
            description: "O material que você está procurando não foi encontrado.",
            variant: "destructive"
          });
        }
      } catch (error) {
        console.error("Error fetching material:", error);
        toast({
          title: "Erro ao carregar material",
          description: "Não foi possível carregar o material. Por favor, tente novamente mais tarde.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };
    fetchMaterial();
  }, [slug, navigate, toast]);
  const handleDownloadClick = () => {
    setShowForm(true);
    setTimeout(() => {
      document.getElementById('download-form')?.scrollIntoView({
        behavior: 'smooth'
      });
    }, 100);
  };
  const handleFormSubmit = () => {
    toast({
      title: "Material disponível!",
      description: "Seu download está sendo preparado e foi enviado para seu email."
    });
    setShowForm(false);
  };
  const cleanHtml = (html: string) => {
    const div = document.createElement('div');
    div.innerHTML = html;
    const text = div.textContent || div.innerText || '';
    return removeEmojis(text);
  };
  if (loading) {
    return <PageLayout>
      <div className="container-custom pt-32 pb-16 flex justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" role="status">
            <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">
              Carregando...
            </span>
          </div>
          <p className="mt-2 text-gray-600">Carregando material...</p>
        </div>
      </div>
    </PageLayout>;
  }
  if (!material) {
    return null; // Will redirect in useEffect
  }
  const title = typeof material.title === 'string' ? material.title : material.title?.rendered || '';
  const description = typeof material.description === 'string' ? material.description : material.description?.rendered || '';
  return <PageLayout>
    <section className="pt-40 pb-32 bg-black relative overflow-hidden flex flex-col items-center justify-center min-h-[50vh]">
      {/* Premium Spotlight Effect */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-gray-900/40 via-black to-black pointer-events-none"></div>

      <div className="container-custom relative z-10 text-center">
        <div className="max-w-4xl mx-auto flex flex-col items-center">
          {/* Tag */}
          <div className="mb-8 animate-fade-in-up">
            <span className="text-[10px] md:text-xs font-mono-tech text-revgreen border border-revgreen/20 bg-revgreen/5 rounded-sm px-3 py-1.5 uppercase tracking-[0.2em] backdrop-blur-sm">
              {material.type && material.type !== 'Material' ? `Material • ${material.type}` : 'Material Gratuito'}
            </span>
          </div>

          <h1
            className="text-5xl md:text-7xl font-bold text-white mb-8 tracking-tighter leading-none animate-fade-in-up delay-100 text-balance"
            dangerouslySetInnerHTML={{ __html: removeEmojis(title) }}
          />

          <p className="text-xl text-gray-400 font-light max-w-2xl mx-auto animate-fade-in-up delay-200">
            Conteúdo exclusivo para impulsionar suas estratégias.
          </p>
        </div>
      </div>
    </section>

    <section className="py-20 bg-white">
      <div className="container-custom">
        <div className="max-w-4xl mx-auto">
          {/* Main Description - Typographically Enhanced */}
          <div className="prose prose-lg mx-auto mb-16 text-gray-600 font-light leading-relaxed prose-headings:font-bold prose-headings:text-black prose-a:text-revgreen">
            <div dangerouslySetInnerHTML={{
              __html: description
            }} />
          </div>

          {/* Premium "Floating Card" CTA */}
          <div className="bg-white rounded-sm shadow-2xl overflow-hidden border border-gray-100 max-w-3xl mx-auto" id="download-form">
            <div className="p-1 bg-gradient-to-r from-revgreen via-emerald-500 to-teal-500"></div>
            <div className="p-8 md:p-12">
              {!showForm ? (
                <div className="text-center">
                  <h3 className="text-2xl md:text-3xl font-bold text-black mb-4 tracking-tight">
                    Baixe agora este material completo
                  </h3>
                  <p className="text-gray-500 mb-10 font-light text-lg">
                    Acesse o conteúdo detalhado e comece a aplicar as estratégias de Revenue Operations hoje mesmo.
                  </p>

                  <Button
                    onClick={handleDownloadClick}
                    className="w-full md:w-auto bg-revgreen text-black hover:bg-emerald-400 font-bold text-lg px-12 h-14 rounded-sm shadow-lg hover:shadow-revgreen/20 transition-all uppercase tracking-wide"
                  >
                    <Download className="mr-2 h-5 w-5" />
                    Acessar Material Gratuitamente
                  </Button>

                  <div className="mt-8 pt-8 border-t border-gray-100 flex flex-wrap justify-center gap-6 text-center text-sm text-gray-400 font-light">
                    <span>✓ Download Imediato</span>
                    <span>✓ Conteúdo Prático</span>
                    <span>✓ 100% Gratuito</span>
                  </div>
                </div>
              ) : (
                <>
                  <h2 className="text-2xl font-bold mb-6 text-center text-black">
                    Preencha seus dados para baixar "{cleanHtml(title)}"
                  </h2>
                  <DownloadForm materialId={material.materialId} materialType={material.type || 'Material'} linkMaterial={material.link_material} onSubmit={handleFormSubmit} />
                </>
              )}
            </div>
          </div>

        </div>
      </div>
    </section>
  </PageLayout>;
};
export default MaterialDetalhe;