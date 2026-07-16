import { useState, useEffect } from 'react';
import { X, Gift, ArrowRight, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Link } from 'react-router-dom';

const ExitIntentPopup = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  useEffect(() => {
    let hasShown = localStorage.getItem('exitIntentShown');

    const handleMouseLeave = (e: MouseEvent) => {
      if (e.clientY <= 0 && !hasShown && !isVisible) {
        setIsVisible(true);
        localStorage.setItem('exitIntentShown', 'true');
      }
    };

    document.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [isVisible]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would normally send the email to your backend
    console.log('Exit intent email:', email);
    setIsSubmitted(true);

    setTimeout(() => {
      setIsVisible(false);
    }, 3000);
  };

  const handleClose = () => {
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <Card className="max-w-md w-full bg-white shadow-2xl relative overflow-hidden">
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 z-10"
        >
          <X className="h-5 w-5" />
        </button>

        {!isSubmitted ? (
          <div className="p-8 text-center">
            {/* Icon */}
            <div className="h-16 w-16 bg-gradient-to-br from-revgreen/20 to-green-100 rounded-full mx-auto mb-6 flex items-center justify-center">
              <Gift className="h-8 w-8 text-revgreen" />
            </div>

            {/* Headline */}
            <h2 className="text-2xl font-black mb-4 text-black uppercase tracking-tighter">
              ACESSO TEMPORÁRIO LIBERADO
            </h2>

            <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest mb-6">
              RECURSOS TÉCNICOS DISPONÍVEIS:
            </p>

            {/* Benefits */}
            <div className="text-left mb-8 space-y-3">
              <div className="flex items-center text-[11px] text-zinc-600 font-bold uppercase tracking-widest">
                <div className="h-1 w-1 bg-revgreen mr-4 flex-shrink-0"></div>
                CHECKLIST DE AUDITORIA (47 PONTOS)
              </div>
              <div className="flex items-center text-[11px] text-zinc-600 font-bold uppercase tracking-widest">
                <div className="h-1 w-1 bg-revgreen mr-4 flex-shrink-0"></div>
                CALCULADORA DE ROI EM TIME REAL
              </div>
              <div className="flex items-center text-[11px] text-zinc-600 font-bold uppercase tracking-widest">
                <div className="h-1 w-1 bg-revgreen mr-4 flex-shrink-0"></div>
                PLAYBOOKS DE AUTOMAÇÃO DE VENDAS
              </div>
              <div className="flex items-center text-[11px] text-zinc-600 font-bold uppercase tracking-widest">
                <div className="h-1 w-1 bg-revgreen mr-4 flex-shrink-0"></div>
                MATRIZ DE MÉTRICAS B2B
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                type="email"
                placeholder="E-MAIL CORPORATIVO"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="text-center h-12 rounded-none border-zinc-200 focus:border-black font-bold text-xs"
              />

              <Button type="submit" className="w-full bg-black text-white hover:bg-revgreen hover:text-black h-12 rounded-none font-bold uppercase tracking-widest text-[10px] transition-all duration-300">
                LIBERAR ARQUIVOS →
              </Button>
            </form>

            {/* Trust elements */}
            <div className="mt-8 space-y-2 border-t border-zinc-100 pt-6">
              <div className="flex items-center justify-center text-[9px] text-zinc-400 font-bold uppercase tracking-widest">
                <Clock className="h-3 w-3 mr-2" />
                LATÊNCIA DE ENTREGA: &lt; 300S
              </div>
              <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-[0.2em]">
                INFRAESTRUTURA SEGURA • SEM SPAM
              </p>
            </div>

            {/* Alternative CTA */}
            <div className="mt-6 pt-4 border-t border-gray-100">
              <p className="text-sm text-gray-600 mb-3">Ou solicite um diagnóstico gratuito:</p>
              <Button
                asChild
                variant="outline"
                size="sm"
                className="w-full"
                onClick={handleClose}
              >
                <Link to="/diagnostico">
                  Diagnóstico Gratuito
                  <ArrowRight className="ml-2 h-3 w-3" />
                </Link>
              </Button>
            </div>
          </div>
        ) : (
          <div className="p-12 text-center">
            <div className="h-16 w-16 bg-zinc-50 border border-zinc-100 rounded-none mx-auto mb-8 flex items-center justify-center">
              <Gift className="h-8 w-8 text-black" />
            </div>

            <h2 className="text-2xl font-black mb-4 text-black uppercase tracking-tighter">
              DADOS ENVIADOS
            </h2>

            <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest mb-8">
              Verifique sua caixa de entrada para o processamento final.
            </p>

            <p className="text-[9px] text-zinc-700 font-bold uppercase tracking-[0.3em]">
              SISTEMA DE ENTREGA AUTOMATIZADO
            </p>
          </div>
        )}
      </Card>
    </div>
  );
};

export default ExitIntentPopup;