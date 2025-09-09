import { useEffect } from 'react';
import PageLayout from '@/components/layout/PageLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Heart, Star } from 'lucide-react';
import { Link } from 'react-router-dom';

const ObrigadoNPS = () => {
  useEffect(() => {
    // Scroll to top when component mounts
    window.scrollTo(0, 0);
  }, []);

  return (
    <PageLayout>
      <section className="bg-background py-20 min-h-screen flex items-center">
        <div className="container-custom">
          <Card className="max-w-3xl mx-auto border-border/20 bg-card/50 backdrop-blur-sm rounded-3xl shadow-soft p-12 text-center">
            <div className="mb-8">
              <CheckCircle className="w-20 h-20 text-revgreen mx-auto mb-6 animate-scale-in" />
              
              <h1 className="section-title mb-6 text-foreground">
                <span className="text-transparent bg-gradient-to-r from-revgreen to-green-600 bg-clip-text">Obrigado</span> pelo seu feedback!
              </h1>
              
              <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
                Sua opinião é extremamente valiosa para nós. Ela nos ajuda a continuar evoluindo e oferecendo sempre o melhor serviço.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6 mb-10">
              <div className="flex flex-col items-center p-4 rounded-xl bg-card/30 border border-border/10">
                <Heart className="w-8 h-8 text-revgreen mb-3" />
                <h3 className="font-semibold text-foreground mb-2">Crescimento</h3>
                <p className="text-sm text-muted-foreground text-center">
                  Seu feedback nos ajuda a crescer e melhorar
                </p>
              </div>
              
              <div className="flex flex-col items-center p-4 rounded-xl bg-card/30 border border-border/10">
                <Star className="w-8 h-8 text-revgreen mb-3" />
                <h3 className="font-semibold text-foreground mb-2">Excelência</h3>
                <p className="text-sm text-muted-foreground text-center">
                  Buscamos sempre a excelência em nossos serviços
                </p>
              </div>
              
              <div className="flex flex-col items-center p-4 rounded-xl bg-card/30 border border-border/10">
                <CheckCircle className="w-8 h-8 text-revgreen mb-3" />
                <h3 className="font-semibold text-foreground mb-2">Compromisso</h3>
                <p className="text-sm text-muted-foreground text-center">
                  Comprometidos com sua satisfação e sucesso
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <p className="text-muted-foreground">
                Continue explorando nossos conteúdos e soluções
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Button asChild className="btn-primary">
                  <Link to="/">
                    Voltar ao Início
                  </Link>
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </section>
    </PageLayout>
  );
};

export default ObrigadoNPS;