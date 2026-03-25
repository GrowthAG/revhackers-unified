import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Check, ArrowRight } from 'lucide-react';

const OnboardingSuccess = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center">

            <div className="mb-8 relative">
                <div className="h-24 w-24 rounded-full bg-revgreen/10 flex items-center justify-center mx-auto animate-in fade-in zoom-in duration-500">
                    <Check className="h-10 w-10 text-revgreen" strokeWidth={3} />
                </div>
            </div>

            <h1 className="text-3xl font-black tracking-tighter text-black uppercase mb-4 max-w-lg mx-auto">
                Cadastro Recebido com Sucesso
            </h1>

            <p className="text-zinc-500 max-w-md mx-auto mb-10 text-lg leading-relaxed">
                Nossa equipe de Revenue Operations já iniciou a configuração do seu ambiente. Em breve você receberá o acesso ao seu portal.
            </p>

            <div className="space-y-4 w-full max-w-sm">
                <Button
                    onClick={() => window.location.href = 'https://revhackers.com.br'}
                    className="w-full h-14 bg-black text-white hover:bg-zinc-800 rounded-none font-black text-[10px] uppercase tracking-[0.3em] gap-3 shadow-sm"
                >
                    Voltar ao Site <ArrowRight size={14} />
                </Button>

                <p className="text-[10px] uppercase font-bold tracking-widest text-zinc-300 pt-4">
                    Protocolo: #{Math.floor(Math.random() * 900000) + 100000}
                </p>
            </div>

        </div>
    );
};

export default OnboardingSuccess;
