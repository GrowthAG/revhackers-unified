import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Download, ChevronRight } from 'lucide-react';
import DownloadForm from '@/components/shared/download-form';
import { supabase } from '@/integrations/supabase/client';
import PageLayout from '@/components/layout/PageLayout';
import SEO from '@/components/shared/SEO';

const getSlugFromTitle = (title: string) => {
    return title
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-');
};

export default function MaterialLanding() {
    const { slug } = useParams<{ slug: string }>();
    const [showForm, setShowForm] = useState(false);
    const [material, setMaterial] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        window.scrollTo(0, 0);

        const fetchFromDatabase = async () => {
            try {
                const { data, error } = await supabase
                    .from('materials')
                    .select('*')
                    .eq('published', true);

                if (error) throw error;

                if (data) {
                    // Find material by matching slug
                    const dbMaterial = data.find((m: any) => {
                        const materialSlug = (m.slug || m.title || '')
                            .toLowerCase()
                            .replace(/[^\w\s-]/g, '')
                            .replace(/\s+/g, '-')
                            .replace(/-+/g, '-');
                        return materialSlug === slug;
                    });

                    if (dbMaterial) {
                        setMaterial({
                            id: dbMaterial.id,
                            title: dbMaterial.title || dbMaterial.material_name,
                            headline: dbMaterial.title?.split(':')[0] || dbMaterial.material_name,
                            subheadline: dbMaterial.description?.substring(0, 100),
                            description: dbMaterial.description,
                            type: dbMaterial.type || dbMaterial.material_type || 'Material',
                            downloadLink: dbMaterial.link_material || ''
                        });
                    }
                }
            } catch (err) {
                console.error('Error fetching material:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchFromDatabase();
    }, [slug]);

    if (loading) {
        return (
            <div className="min-h-screen bg-white flex flex-col items-center justify-center">
                <div className="w-8 h-8 border-2 border-zinc-200 border-t-zinc-900 rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!material) {
        return (
            <div className="min-h-screen bg-white flex flex-col items-center justify-center px-6">
                <h1 className="text-4xl font-semibold text-zinc-900 tracking-tight mb-4">Material não encontrado</h1>
                <p className="text-zinc-500 mb-8">O link pode estar incorreto ou o material foi removido.</p>
                <Link to="/materiais" className="text-zinc-900 font-medium flex items-center gap-2 hover:gap-3 transition-all">
                    <ArrowLeft className="w-4 h-4" />
                    Ver todos os materiais
                </Link>
            </div>
        );
    }

    return (
        <PageLayout>
            <SEO
                title={((material.headline || material.title || '').replace(/<[^>]*>/g, '')).substring(0, 60)}
                description={(material.description || material.subheadline || 'Material gratuito RevHackers').replace(/<[^>]*>/g, '').substring(0, 160)}
                canonical={`https://revhackers.com.br/materiais/${slug}`}
            />
            {/* Hero Section - Apple/OpenAI Minimalist Style */}
            <section className="pt-32 pb-24 px-6 bg-white min-h-[70vh] flex items-center justify-center">
                <div className="max-w-3xl mx-auto text-center space-y-10">

                    {/* Headline */}
                    <div className="space-y-4">
                        <h1 className="text-[2.5rem] md:text-[3.5rem] font-semibold tracking-tight text-zinc-900 leading-[1.1] max-w-3xl mx-auto">
                            {(material.headline || material.title || '').replace(/<[^>]*>/g, '')}
                        </h1>
                        <p className="text-[1rem] md:text-[1.25rem] text-zinc-500 font-light tracking-tight max-w-xl mx-auto leading-relaxed">
                            {(material.subheadline || material.description || '').replace(/<[^>]*>/g, '').substring(0, 150)}
                        </p>
                    </div>

                    {/* CTA Button */}
                    {!showForm ? (
                        <div className="pt-8">
                            <button
                                onClick={() => setShowForm(true)}
                                className="group inline-flex items-center gap-3 bg-revgreen hover:bg-[#00A850] text-white font-semibold text-sm px-8 py-4 rounded-full transition-all duration-300 hover:shadow-sm hover:-translate-y-0.5"
                            >
                                <Download className="w-4 h-4" />
                                Baixar Gratuitamente
                                <span className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center group-hover:bg-white/30 transition-colors">
                                    <ChevronRight className="w-3 h-3" />
                                </span>
                            </button>
                            <p className="text-xs text-zinc-400 mt-4">
                                Acesso imediato após preencher o formulário
                            </p>
                        </div>
                    ) : (
                        /* Download Form */
                        <div className="max-w-md mx-auto bg-zinc-50 border border-zinc-200 p-8 text-left animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="mb-6 text-center">
                                <h3 className="text-lg font-semibold text-zinc-900 mb-1">Acesse o material</h3>
                                <p className="text-sm text-zinc-500">Preencha seus dados para liberar o download</p>
                            </div>
                            <DownloadForm
                                materialId={material.id}
                                materialType={material.type}
                                onSubmit={() => {
                                    // Form handles success internally
                                }}
                                linkMaterial={material.downloadLink}
                            />
                        </div>
                    )}

                </div>
            </section>
        </PageLayout>
    );
}
