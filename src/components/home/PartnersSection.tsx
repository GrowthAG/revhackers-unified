
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { 
  Carousel, 
  CarouselContent, 
  CarouselItem, 
  CarouselNext, 
  CarouselPrevious 
} from '@/components/ui/carousel';

const partners = [
  {
    name: "TOEFL Junior Brasil",
    logo: "/lovable-uploads/46993eff-c4c5-41af-b7ee-c93ef0366f59.png", 
    url: "/partners/toefl",
    slug: "toefl"
  },
  {
    name: "Anhembi Morumbi",
    logo: "/lovable-uploads/f5e74a47-fc77-4b34-970e-e839080310fd.png", 
    url: "/partners/anhembi",
    slug: "anhembi"
  },
  {
    name: "DataVoxx",
    logo: "/lovable-uploads/b068bd61-d02d-4f35-a869-afd72751cf62.png", 
    url: "/partners/datavoxx",
    slug: "datavoxx"
  },
  {
    name: "Agence MR",
    logo: "/lovable-uploads/6c09375e-5298-4672-9226-27eb60a6b038.png",
    url: "/partners/agence-mr",
    slug: "agence-mr"
  },
  {
    name: "Heineken",
    logo: "/lovable-uploads/aada4820-3f12-4185-9af6-811f30795a93.png",
    url: "/partners/heineken",
    slug: "heineken"
  },
  {
    name: "PlacLux",
    logo: "/lovable-uploads/c949a25f-b0ab-4e66-981e-a3db0d728850.png", 
    url: "/partners/placlux",
    slug: "placlux"
  },
  {
    name: "ENICS",
    logo: "/lovable-uploads/a05718ad-1822-4102-909a-7e86af151e98.png",
    url: "/partners/enics",
    slug: "enics"
  },
  {
    name: "Funnels",
    logo: "/lovable-uploads/e468ed87-3eee-496b-bb1a-3525f02f8429.png",
    url: "/partners/funnels",
    slug: "funnels",
  }
];

const PartnersSection = () => {
  return (
    <section className="py-20 bg-gradient-to-b from-white to-gray-50">
      <div className="container-custom">
        <div className="max-w-3xl mx-auto text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Nossos Clientes e Parceiros
          </h2>
          <p className="text-lg text-gray-600">
            Empresas que confiam na nossa expertise para impulsionar seus resultados
          </p>
        </div>
        
        <div className="px-4 md:px-12">
          <Carousel
            opts={{
              align: "start",
              loop: true,
            }}
            className="w-full relative"
          >
            <CarouselContent>
              {partners.map((partner) => (
                <CarouselItem key={partner.name} className="md:basis-1/3 lg:basis-1/4">
                  <Link 
                    to={partner.url}
                    className="group block"
                  >
                    <Card className={`h-28 flex items-center justify-center p-4 bg-white border-0 shadow-sm overflow-hidden hover:shadow-md transition-all duration-300 group-hover:scale-105 ${partner.slug === 'bldn-digital' ? 'bg-gray-100' : ''}`}>
                      <div className="w-full h-full flex items-center justify-center">
                        <img 
                          src={partner.logo} 
                          alt={partner.name}
                          className="max-h-16 max-w-[80%] object-contain transition-all duration-300 grayscale group-hover:grayscale-0"
                        />
                      </div>
                    </Card>
                  </Link>
                </CarouselItem>
              ))}
            </CarouselContent>
            
            <div className="absolute top-1/2 -left-2 md:left-0 z-10 transform -translate-y-1/2">
              <CarouselPrevious className="bg-white shadow-lg border-0 text-black h-10 w-10 opacity-90 hover:opacity-100" />
            </div>
            
            <div className="absolute top-1/2 -right-2 md:right-0 z-10 transform -translate-y-1/2">
              <CarouselNext className="bg-white shadow-lg border-0 text-black h-10 w-10 opacity-90 hover:opacity-100" />
            </div>
          </Carousel>
        </div>

        <div className="text-center mt-10">
          <Button 
            asChild 
            className="bg-revgreen text-black font-medium px-8 py-6 rounded-md hover:brightness-110 transition-all shadow-lg min-w-[250px]"
            size="lg"
          >
            <Link to="/cases" className="flex items-center justify-center">
              <span>Ver mais sobre nossos cases</span>
              <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default PartnersSection;
