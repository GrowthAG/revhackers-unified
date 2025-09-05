import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { CheckCircle, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import PageLayout from '@/components/layout/PageLayout';

const ThankYou = () => {
  return (
    <PageLayout>
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex items-center justify-center py-16 px-4">
        <div className="relative">
          {/* Gradient background effects */}
          <div className="absolute inset-0 bg-gradient-radial from-revgreen/20 via-transparent to-transparent blur-3xl" />
          <div className="absolute -top-32 -right-32 w-64 h-64 bg-gradient-conic from-revgreen/30 via-transparent to-transparent rounded-full blur-2xl animate-pulse" />
          
          <Card className="relative max-w-2xl mx-auto bg-black/80 backdrop-blur-sm border border-white/10 p-12 text-center interactive-card">
            <div className="flex justify-center mb-8">
              <div className="relative">
                <CheckCircle className="w-20 h-20 text-revgreen animate-bounceGentle" />
                <div className="absolute inset-0 w-20 h-20 bg-revgreen/20 rounded-full animate-ping" />
              </div>
            </div>
            
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              Obrigado pelo seu contato!
            </h1>
            
            <div className="space-y-4 mb-10">
              <p className="text-xl text-gray-300 leading-relaxed">
                Sua mensagem foi enviada com sucesso. Nossa equipe irá analisar 
                suas informações e entrar em contato em breve.
              </p>
              
              <p className="text-lg text-revgreen/80">
                Responderemos em até 24 horas úteis.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button 
                asChild 
                className="bg-gradient-primary text-black font-semibold px-8 py-3 rounded-lg hover:shadow-glow transition-all duration-300 group min-w-48"
                size="lg"
              >
                <Link to="/" onClick={() => window.scrollTo(0, 0)}>
                  Voltar para a Home
                  <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
              
              <Button 
                asChild 
                variant="outline"
                className="border-white/20 text-white hover:bg-white/10 px-8 py-3 rounded-lg transition-all duration-300 min-w-48"
                size="lg"
              >
                <Link to="/servicos">
                  Conheça nossos serviços
                </Link>
              </Button>
            </div>
            
            <div className="mt-12 pt-8 border-t border-white/10">
              <p className="text-sm text-gray-400">
                Enquanto isso, conecte-se conosco nas redes sociais para acompanhar 
                conteúdos exclusivos sobre crescimento empresarial.
              </p>
            </div>
          </Card>
        </div>
      </div>
    </PageLayout>
  );
};

export default ThankYou;