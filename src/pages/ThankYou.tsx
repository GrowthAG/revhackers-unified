import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { CheckCircle, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import PageLayout from '@/components/layout/PageLayout';

const ThankYou = () => {
  return (
    <PageLayout>
      <div className="min-h-screen bg-white flex items-center justify-center py-16 px-4">
        <Card className="max-w-2xl mx-auto p-12 text-center bg-white border border-zinc-200 shadow-sm">
          {/* Success Icon */}
          <div className="flex justify-center mb-8">
            <CheckCircle className="w-20 h-20 text-revgreen animate-bounceGentle" />
          </div>
          
          {/* Title */}
          <h1 className="text-4xl md:text-5xl font-bold text-revgreen mb-6">
            Obrigado pelo agendamento!
          </h1>
          
          {/* Subtitle */}
          <p className="text-xl md:text-2xl text-[#555555] leading-relaxed mb-6">
            Sua solicitação foi registrada com sucesso. Em breve você receberá um e-mail com os próximos passos.
          </p>
          
          {/* Warning/Alert */}
          <div className="mb-10">
            <p className="text-lg text-[#d51f2a] font-medium">
              📩 Fique de olho na sua caixa de entrada (e também no spam).
            </p>
          </div>
          
          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button 
              asChild 
              className="bg-[#03fc3b] hover:bg-[#03fc3b]/90 text-black font-semibold px-8 py-3 transition-all duration-300 group min-w-48"
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
              className="border-zinc-300 text-black hover:bg-zinc-50 px-8 py-3 transition-all duration-300 min-w-48"
              size="lg"
            >
              <Link to="/servicos">
                Conheça nossos serviços
              </Link>
            </Button>
          </div>
        </Card>
      </div>
    </PageLayout>
  );
};

export default ThankYou;