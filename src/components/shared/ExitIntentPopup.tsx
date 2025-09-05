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
            <h2 className="text-2xl font-bold mb-4 text-gray-900">
              Espere! Não perca esta oportunidade 🎯
            </h2>

            <p className="text-gray-600 mb-6">
              Receba nosso <strong>Kit de RevOps GRATUITO</strong> com:
            </p>

            {/* Benefits */}
            <div className="text-left mb-6 space-y-2">
              <div className="flex items-center text-sm text-gray-700">
                <div className="h-2 w-2 bg-revgreen rounded-full mr-3"></div>
                Checklist de 47 pontos para otimizar seu funil
              </div>
              <div className="flex items-center text-sm text-gray-700">
                <div className="h-2 w-2 bg-revgreen rounded-full mr-3"></div>
                Planilha de cálculo de ROI para campanhas B2B
              </div>
              <div className="flex items-center text-sm text-gray-700">
                <div className="h-2 w-2 bg-revgreen rounded-full mr-3"></div>
                Templates de automação de vendas
              </div>
              <div className="flex items-center text-sm text-gray-700">
                <div className="h-2 w-2 bg-revgreen rounded-full mr-3"></div>
                Guia completo de métricas de RevOps
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                type="email"
                placeholder="Seu melhor email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="text-center"
              />
              
              <Button type="submit" className="w-full bg-revgreen hover:bg-revgreen/90 text-white">
                <Gift className="mr-2 h-4 w-4" />
                Quero o Kit Gratuito
              </Button>
            </form>

            {/* Trust elements */}
            <div className="mt-6 space-y-2">
              <div className="flex items-center justify-center text-xs text-gray-500">
                <Clock className="h-3 w-3 mr-1" />
                Material enviado em até 5 minutos
              </div>
              <p className="text-xs text-gray-400">
                ✅ Sem spam • ✅ Cancele quando quiser
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
          <div className="p-8 text-center">
            <div className="h-16 w-16 bg-green-100 rounded-full mx-auto mb-6 flex items-center justify-center">
              <Gift className="h-8 w-8 text-green-600" />
            </div>
            
            <h2 className="text-2xl font-bold mb-4 text-green-800">
              Kit enviado com sucesso! 🎉
            </h2>
            
            <p className="text-gray-600 mb-4">
              Verifique sua caixa de entrada (e spam) nos próximos minutos.
            </p>
            
            <p className="text-sm text-gray-500">
              Prepare-se para transformar seus resultados em RevOps! 🚀
            </p>
          </div>
        )}
      </Card>
    </div>
  );
};

export default ExitIntentPopup;