
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PageLayout from '@/components/layout/PageLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Download, FileText, Book, BookOpen, BarChart3, PlaySquare, FileSpreadsheet, ExternalLink } from 'lucide-react';
import DownloadForm from '@/components/shared/download-form';
import { useToast } from '@/components/ui/use-toast';

const materials = [
  {
    title: "Guia Completo: Revenue Operations para B2B",
    description: "Aprenda como implementar Revenue Operations de forma eficiente em sua empresa e alinhar vendas, marketing e sucesso do cliente.",
    type: "E-book",
    icon: Book,
    id: "ebook-revops-b2b",
    category: "revops",
    downloadLink: "/downloads/ebook-revenue-operations-b2b.pdf",
  },
  {
    title: "Case Study: Como a WA Project conquistou grandes contas com ABM",
    description: "Estudo de caso detalhado sobre como a WA Project implementou Account-Based Marketing para conquistar contratos com Localiza e Porto Seguro.",
    type: "Case Study",
    icon: FileText,
    id: "case-waproject-abm",
    category: "marketing",
    downloadLink: "/downloads/case-waproject-abm.pdf",
  },
  {
    title: "Automação de Marketing B2B: Além do básico",
    description: "Descubra estratégias avançadas de automação para aumentar a eficiência e os resultados do seu marketing B2B.",
    type: "Whitepaper",
    icon: FileText,
    id: "whitepaper-automacao-marketing",
    category: "marketing",
    downloadLink: "/downloads/whitepaper-automacao-marketing-b2b.pdf",
  },
  {
    title: "Template: Dashboard de Revenue Intelligence",
    description: "Template pronto para você implementar um dashboard de Revenue Intelligence em sua empresa B2B.",
    type: "Template",
    icon: FileSpreadsheet,
    id: "template-dashboard-revenue",
    category: "analytics",
    downloadLink: "/downloads/template-dashboard-revenue-intelligence.xlsx",
  },
  {
    title: "Framework de Growth Funnel para SaaS",
    description: "Framework completo para criar funis de crescimento otimizados para empresas de software como serviço.",
    type: "Framework",
    icon: FileText,
    id: "framework-growth-funnel",
    category: "growth",
    downloadLink: "/downloads/framework-growth-funnel-saas.pdf",
  },
  {
    title: "Checklist: Implementação de RevOps",
    description: "Lista completa de verificação para implementar RevOps em sua empresa, desde o início até a maturidade.",
    type: "Checklist",
    icon: FileText,
    id: "checklist-revops",
    category: "revops",
    downloadLink: "/downloads/checklist-implementacao-revops.pdf",
  },
  {
    title: "Relatório: Benchmark de Empresas B2B",
    description: "Dados e insights sobre o desempenho de empresas B2B em diferentes setores tecnológicos.",
    type: "Relatório",
    icon: BarChart3,
    id: "relatorio-benchmark-b2b",
    category: "analytics",
    downloadLink: "/downloads/relatorio-benchmark-empresas-b2b.pdf",
  },
  {
    title: "Como a ENICS vendeu 3.000 ingressos em 30 dias",
    description: "Caso de estudo sobre a estratégia de marketing integrada que levou a ENICS a vender 3.000 ingressos para seu evento em apenas 30 dias.",
    type: "Caso de estudo",
    icon: FileText,
    id: "case-enics-eventos",
    category: "marketing",
    downloadLink: "/downloads/case-enics-eventos.pdf",
  },
  {
    title: "Playbook: Account Based Marketing para B2B SaaS",
    description: "Guia estratégico com táticas práticas para implementar ABM em empresas de tecnologia B2B.",
    type: "Playbook",
    icon: BookOpen,
    id: "playbook-abm-b2b",
    category: "marketing",
    downloadLink: "/downloads/playbook-abm-b2b-saas.pdf",
  },
  {
    title: "Webinar: O futuro de Revenue Operations",
    description: "Gravação completa do nosso webinar sobre as tendências e o futuro de Revenue Operations no mercado B2B.",
    type: "Webinar",
    icon: PlaySquare,
    id: "webinar-futuro-revops",
    category: "revops",
    downloadLink: "/downloads/webinar-futuro-revenue-operations.mp4",
  },
  {
    title: "Guia de integração de CRM e Marketing Automation",
    description: "Aprenda como integrar e otimizar seu CRM com ferramentas de automação de marketing para um pipeline de vendas eficiente.",
    type: "Guia",
    icon: Book,
    id: "guia-crm-automacao",
    category: "tech",
    downloadLink: "/downloads/guia-integracao-crm-marketing-automation.pdf",
  },
  {
    title: "Calculadora de ROI para investimentos em RevOps",
    description: "Ferramenta para calcular o retorno sobre investimento em estratégias e implementações de Revenue Operations.",
    type: "Calculadora",
    icon: FileSpreadsheet,
    id: "calculadora-roi-revops",
    category: "analytics",
    downloadLink: "/downloads/calculadora-roi-revops.xlsx",
  },
  {
    title: "Playbook de Vendas Adaptável para Qualquer Negócio",
    description: "Descubra estratégias práticas e adaptáveis para estruturar e escalar o processo comercial em diferentes segmentos e portes de empresas.",
    type: "E-book",
    icon: Book,
    id: "ebook-playbook-vendas-negocio",
    category: "vendas",
    downloadLink: "/downloads/ebook-playbook-vendas-adaptavel.pdf",
  }
];

const Downloads = () => {
  const [showForm, setShowForm] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState<(typeof materials)[0] | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleDownloadClick = (material: (typeof materials)[0]) => {
    setSelectedMaterial(material);
    setShowForm(true);
    setTimeout(() => {
      document.getElementById('download-form')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleFormSubmit = () => {
    toast({
      title: "Material disponível!",
      description: "Seu download está sendo preparado. Você receberá o material por e-mail em instantes.",
    });
    setShowForm(false);
    console.log(`Material ${selectedMaterial?.id} requested for download`);
  };

  const getSlugFromTitle = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^\w\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-'); // Replace multiple hyphens with a single one
  };

  return (
    <PageLayout>
      <section className="pt-32 pb-10 bg-white text-gray-900 relative">
        <div className="absolute inset-0 z-0 opacity-20">
          <img
            src="https://images.unsplash.com/photo-1488590528505-98d2b5aba04b"
            alt="Materiais Gratuitos"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="container-custom relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">Materiais Gratuitos</h1>
            <p className="text-xl text-gray-300 mb-8">
              Baixe nossos conteúdos exclusivos sobre Revenue Operations,
              Account Based Marketing e estratégias de crescimento para empresas B2B
            </p>
          </div>
        </div>
      </section>

      <section className="py-16 bg-gray-50">
        <div className="container-custom">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {materials.map((material, index) => {
              const materialSlug = getSlugFromTitle(material.title);

              return (
                <Card key={index} className="overflow-hidden shadow-md hover:shadow-xl transition-shadow h-full flex flex-col">
                  <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 border-b">
                    <div className="flex items-center justify-between">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-revgreen/10 text-revgreen">
                        {material.type}
                      </span>
                      <material.icon className="h-6 w-6 text-revgreen" />
                    </div>
                    <CardTitle className="mt-4">{material.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-6 flex-grow">
                    <CardDescription className="text-gray-600 mb-4">
                      {material.description}
                    </CardDescription>
                  </CardContent>
                  <CardFooter className="bg-gray-50 border-t">
                    <div className="grid grid-cols-2 gap-2 w-full">
                      <Button
                        className="w-full"
                        variant="outline"
                        onClick={() => navigate(`/materiais/${materialSlug}`)}
                      >
                        <ExternalLink className="mr-2 h-4 w-4" />
                        Ver detalhes
                      </Button>
                      <Button
                        className="w-full"
                        variant="default"
                        onClick={() => handleDownloadClick(material)}
                      >
                        <Download className="mr-2 h-4 w-4" />
                        Baixar
                      </Button>
                    </div>
                  </CardFooter>
                </Card>
              );
            })}
          </div>

          {showForm && selectedMaterial && (
            <div id="download-form" className="mt-16 max-w-2xl mx-auto bg-white rounded-xl shadow-xl p-6 md:p-8 border">
              <h2 className="text-2xl font-bold mb-6">
                Preencha seus dados para baixar "{selectedMaterial.title}"
              </h2>
              <DownloadForm
                materialId={selectedMaterial.id}
                materialType={selectedMaterial.type}
                onSubmit={handleFormSubmit}
              />
            </div>
          )}
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="container-custom">
          <div className="bg-black text-white rounded-xl p-8 md:p-12">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-2xl md:text-3xl font-bold mb-4">
                  Precisa de conteúdo personalizado?
                </h2>
                <p className="text-gray-300 mb-6">
                  Entre em contato conosco para solicitar materiais exclusivos
                  ou uma análise personalizada para seu negócio B2B.
                </p>
                <Button asChild variant="outline" className="border-revgreen text-revgreen hover:bg-revgreen hover:text-black">
                  <a href="/booking">Agendar conversa</a>
                </Button>
              </div>
              <div className="hidden md:block">
                <img
                  src="https://images.unsplash.com/photo-1488590528505-98d2b5aba04b"
                  alt="Análise personalizada"
                  className="w-full h-auto rounded-lg"
                />
              </div>
            </div>
          </div>
        </div>
      </section>
    </PageLayout>
  );
};

export default Downloads;
