
import { ArrowRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Link } from 'react-router-dom';

const cases = [
  {
    title: "ENICS",
    category: "Eventos",
    result: "3 mil ingressos em 30 dias",
    image: "/lovable-uploads/a05718ad-1822-4102-909a-7e86af151e98.png",
    slug: "enics",
    logo: true
  },
  {
    title: "Heineken",
    category: "Bebidas",
    result: "Materiais em vídeo para parcerias",
    image: "/lovable-uploads/aada4820-3f12-4185-9af6-811f30795a93.png",
    slug: "heineken",
    logo: true
  },
  {
    title: "TOEFL Junior Brasil",
    category: "Educação",
    result: "Leads B2B para escolas",
    image: "/lovable-uploads/46993eff-c4c5-41af-b7ee-c93ef0366f59.png",
    slug: "toefl",
    logo: true
  },
  {
    title: "DataVoxx",
    category: "Tecnologia",
    result: "Novo site e funil inbound",
    image: "/lovable-uploads/b068bd61-d02d-4f35-a869-afd72751cf62.png",
    slug: "datavoxx",
    logo: true
  },
  {
    title: "Funnels",
    category: "Marketing",
    result: "Aumento de 130% em leads qualificados",
    image: "/lovable-uploads/e468ed87-3eee-496b-bb1a-3525f02f8429.png",
    slug: "funnels",
    logo: true
  }
];

const CasesSection = () => {
  const scrollToTop = () => {
    window.scrollTo(0, 0);
  };

  return (
    <section className="section-padding bg-gray-50">
      <div className="container-custom">
        <div className="flex flex-col md:flex-row justify-between items-start mb-16">
          <div className="max-w-lg mb-8 md:mb-0">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Cases de sucesso
            </h2>
            <p className="text-lg text-gray-600">
              Empresas de referência que conquistaram resultados extraordinários com nossa metodologia de crescimento orientado a dados.
            </p>
          </div>
          
          <Link 
            to="/cases" 
            onClick={scrollToTop}
            className="inline-flex items-center text-revgreen hover:text-black font-medium"
          >
            Ver todos os cases
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {cases.slice(0, 3).map((item, index) => (
            <Link to={`/cases/${item.slug}`} onClick={scrollToTop} key={index}>
              <Card className="overflow-hidden card-hover h-full border-0 shadow-sm">
                <div className="h-48 overflow-hidden bg-white flex items-center justify-center p-6">
                  <img 
                    src={item.image} 
                    alt={item.title} 
                    className="w-3/4 h-auto max-h-32 object-contain transition-transform hover:scale-105 duration-500"
                  />
                </div>
                <CardContent className="p-6">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-500">{item.category}</span>
                    <span className="text-xs px-3 py-1 bg-green-50 text-green-800 rounded-full font-medium">
                      {item.result}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold">{item.title}</h3>
                  <div className="mt-4 flex items-center text-revgreen font-medium text-sm">
                    <span>Ler estudo completo</span>
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CasesSection;
