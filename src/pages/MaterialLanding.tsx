import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Download, ChevronRight } from 'lucide-react';
import DownloadForm from '@/components/shared/download-form';
import { supabase } from '@/integrations/supabase/client';
import PageLayout from '@/components/layout/PageLayout';

// Materials data - matches Downloads.tsx
const materials = [
    {
        title: "Guia Completo: Revenue Operations para B2B",
        description: "Aprenda como implementar Revenue Operations de forma eficiente em sua empresa e alinhar vendas, marketing e sucesso do cliente.",
        headline: "Revenue Operations",
        subheadline: "O framework completo para alinhar vendas, marketing e CS",
        type: "E-book",
        id: "ebook-revops-b2b",
        category: "revops",
        downloadLink: "/downloads/ebook-revenue-operations-b2b.pdf",
    },
    {
        title: "Case Study: Como a WA Project conquistou grandes contas com ABM",
        description: "Estudo de caso detalhado sobre como a WA Project implementou Account-Based Marketing para conquistar contratos com Localiza e Porto Seguro.",
        headline: "ABM na Prática",
        subheadline: "Como conquistar grandes contas com estratégia focada",
        type: "Case Study",
        id: "case-waproject-abm",
        category: "marketing",
        downloadLink: "/downloads/case-waproject-abm.pdf",
    },
    {
        title: "Automação de Marketing B2B: Além do básico",
        description: "Descubra estratégias avançadas de automação para aumentar a eficiência e os resultados do seu marketing B2B.",
        headline: "Automação Avançada",
        subheadline: "Estratégias que vão além do básico em marketing B2B",
        type: "Whitepaper",
        id: "whitepaper-automacao-marketing",
        category: "marketing",
        downloadLink: "/downloads/whitepaper-automacao-marketing-b2b.pdf",
    },
    {
        title: "Template: Dashboard de Revenue Intelligence",
        description: "Template pronto para você implementar um dashboard de Revenue Intelligence em sua empresa B2B.",
        headline: "Revenue Intelligence",
        subheadline: "Dashboard pronto para implementar hoje",
        type: "Template",
        id: "template-dashboard-revenue",
        category: "analytics",
        downloadLink: "/downloads/template-dashboard-revenue-intelligence.xlsx",
    },
    {
        title: "Framework de Growth Funnel para SaaS",
        description: "Framework completo para criar funis de crescimento otimizados para empresas de software como serviço.",
        headline: "Growth Funnel",
        subheadline: "Framework de crescimento otimizado para SaaS",
        type: "Framework",
        id: "framework-growth-funnel",
        category: "growth",
        downloadLink: "/downloads/framework-growth-funnel-saas.pdf",
    },
    {
        title: "Checklist: Implementação de RevOps",
        description: "Lista completa de verificação para implementar RevOps em sua empresa, desde o início até a maturidade.",
        headline: "RevOps Checklist",
        subheadline: "Do zero à maturidade operacional",
        type: "Checklist",
        id: "checklist-revops",
        category: "revops",
        downloadLink: "/downloads/checklist-implementacao-revops.pdf",
    },
    {
        title: "Relatório: Benchmark de Empresas B2B",
        description: "Dados e insights sobre o desempenho de empresas B2B em diferentes setores tecnológicos.",
        headline: "Benchmark B2B",
        subheadline: "Dados de mercado e insights estratégicos",
        type: "Relatório",
        id: "relatorio-benchmark-b2b",
        category: "analytics",
        downloadLink: "/downloads/relatorio-benchmark-empresas-b2b.pdf",
    },
    {
        title: "Como a ENICS vendeu 3.000 ingressos em 30 dias",
        description: "Caso de estudo sobre a estratégia de marketing integrada que levou a ENICS a vender 3.000 ingressos para seu evento em apenas 30 dias.",
        headline: "ENICS Case Study",
        subheadline: "3.000 ingressos vendidos em 30 dias",
        type: "Caso de estudo",
        id: "case-enics-eventos",
        category: "marketing",
        downloadLink: "/downloads/case-enics-eventos.pdf",
    },
    {
        title: "Playbook: Account Based Marketing para B2B SaaS",
        description: "Guia estratégico com táticas práticas para implementar ABM em empresas de tecnologia B2B.",
        headline: "ABM Playbook",
        subheadline: "Táticas práticas para B2B SaaS",
        type: "Playbook",
        id: "playbook-abm-b2b",
        category: "marketing",
        downloadLink: "/downloads/playbook-abm-b2b-saas.pdf",
    },
    {
        title: "Webinar: O futuro de Revenue Operations",
        description: "Gravação completa do nosso webinar sobre as tendências e o futuro de Revenue Operations no mercado B2B.",
        headline: "O Futuro de RevOps",
        subheadline: "Tendências e estratégias para os próximos anos",
        type: "Webinar",
        id: "webinar-futuro-revops",
        category: "revops",
        downloadLink: "/downloads/webinar-futuro-revenue-operations.mp4",
    },
    {
        title: "Guia de integração de CRM e Marketing Automation",
        description: "Aprenda como integrar e otimizar seu CRM com ferramentas de automação de marketing para um pipeline de vendas eficiente.",
        headline: "CRM + Automação",
        subheadline: "Integração para um pipeline de vendas eficiente",
        type: "Guia",
        id: "guia-crm-automacao",
        category: "tech",
        downloadLink: "/downloads/guia-integracao-crm-marketing-automation.pdf",
    },
    {
        title: "Calculadora de ROI para investimentos em RevOps",
        description: "Ferramenta para calcular o retorno sobre investimento em estratégias e implementações de Revenue Operations.",
        headline: "ROI Calculator",
        subheadline: "Calcule o retorno do seu investimento em RevOps",
        type: "Calculadora",
        id: "calculadora-roi-revops",
        category: "analytics",
        downloadLink: "/downloads/calculadora-roi-revops.xlsx",
    },
    {
        title: "Playbook de Vendas Adaptável para Qualquer Negócio",
        description: "Descubra estratégias práticas e adaptáveis para estruturar e escalar o processo comercial em diferentes segmentos e portes de empresas.",
        headline: "Sales Playbook",
        subheadline: "Estratégias adaptáveis para qualquer negócio",
        type: "E-book",
        id: "ebook-playbook-vendas-negocio",
        category: "vendas",
        downloadLink: "/downloads/ebook-playbook-vendas-adaptavel.pdf",
    }
];

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

        // First try to find in static materials
        const staticMaterial = materials.find(m => getSlugFromTitle(m.title) === slug);

        if (staticMaterial) {
            setMaterial(staticMaterial);
            setLoading(false);
            return;
        }

        // If not found, try to fetch from Supabase
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
                        // Map database fields to component format
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
                                className="group inline-flex items-center gap-3 bg-zinc-900 hover:bg-black text-white font-semibold text-sm px-8 py-4 rounded-full transition-all duration-300 hover:shadow-2xl hover:shadow-zinc-300/50 hover:-translate-y-0.5"
                            >
                                <Download className="w-4 h-4" />
                                Baixar Gratuitamente
                                <span className="w-6 h-6 bg-white/10 rounded-full flex items-center justify-center group-hover:bg-white/20 transition-colors">
                                    <ChevronRight className="w-3 h-3" />
                                </span>
                            </button>
                            <p className="text-xs text-zinc-400 mt-4">
                                Acesso imediato após preencher o formulário
                            </p>
                        </div>
                    ) : (
                        /* Download Form */
                        <div className="max-w-md mx-auto bg-zinc-50 border border-zinc-200 rounded-2xl p-8 text-left animate-in fade-in slide-in-from-bottom-4 duration-500">
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
