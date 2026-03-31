import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { CheckCircle2, ArrowRight, CalendarDays, LineChart } from 'lucide-react';
import { Link } from 'react-router-dom';

const ThankYouMessage = () => {
  return (
    <Card className="max-w-3xl mx-auto bg-black border border-zinc-800 p-12 text-center shadow-sm overflow-hidden relative">
      {/* Background Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-revgreen/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="relative z-10 flex flex-col items-center">
        <div className="flex justify-center mb-8">
          <div className="relative">
            <div className="absolute inset-0 bg-revgreen/20 blur-xl rounded-full" />
            <CheckCircle2 className="w-20 h-20 text-revgreen relative z-10 animate-in zoom-in duration-500" />
          </div>
        </div>

        <h2 className="text-4xl font-black text-white mb-6 tracking-tight uppercase">
          Diagnóstico Concluído
        </h2>

        <p className="text-xl text-zinc-400 mb-10 leading-relaxed max-w-2xl font-light">
          Agradecemos pelo seu tempo e detalhamento. O primeiro passo para escalar suas vendas com lucratividade e previsibilidade foi dado.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10 text-left w-full max-w-xl">
          <div className="bg-zinc-900/50 border border-zinc-800 p-5 flex items-start space-x-4">
            <div className="bg-black p-2 mt-1 border border-zinc-800">
              <LineChart className="w-5 h-5 text-revgreen" />
            </div>
            <div>
              <h4 className="text-white font-bold mb-1 text-sm uppercase tracking-wider">1. Análise de Dados</h4>
              <p className="text-zinc-500 text-sm leading-relaxed">Nossa equipe de especialistas está avaliando seu modelo de receita, gaps de conversão e oportunidades de lucro oculto.</p>
            </div>
          </div>
          <div className="bg-zinc-900/50 border border-zinc-800 p-5 flex items-start space-x-4">
            <div className="bg-black p-2 mt-1 border border-zinc-800">
              <CalendarDays className="w-5 h-5 text-revgreen" />
            </div>
            <div>
              <h4 className="text-white font-bold mb-1 text-sm uppercase tracking-wider">2. Call Estratégica</h4>
              <p className="text-zinc-500 text-sm leading-relaxed">Entraremos em contato muito em breve para agendar uma reunião de planejamento e apresentar o plano de ação.</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full">
          <Button
            asChild
            className="bg-revgreen text-black font-bold px-8 py-6 hover:bg-revgreen/90 transition-all text-sm uppercase tracking-wider w-full sm:w-auto hover:scale-105"
          >
            <Link to="/" onClick={() => window.scrollTo(0, 0)}>
              Voltar para o Início <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default ThankYouMessage;
