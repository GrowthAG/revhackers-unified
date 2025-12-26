import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, CheckCircle } from 'lucide-react';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [countdown, setCountdown] = useState(0);

    const { resetPassword } = useAuth();

    // Timer logic
    useEffect(() => {
        if (countdown > 0) {
            const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [countdown]);

    const handleResend = async () => {
        if (countdown > 0) return;

        setLoading(true);
        setError(null);

        const result = await resetPassword(email);

        if (result.error) {
            setError(result.error.message || 'Erro ao reenviar e-mail.');
        } else {
            setCountdown(60);
        }
        setLoading(false);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        // Basic email validation
        if (!email || !email.includes('@')) {
            setError("Por favor, insira um e-mail válido.");
            setLoading(false);
            return;
        }

        const result = await resetPassword(email);

        if (result.error) {
            setError(result.error.message || 'Erro ao enviar e-mail. Tente novamente.');
        } else {
            setSuccess(true);
            setCountdown(60);
        }
        setLoading(false);
    };

    return (
        <div className="min-h-screen w-full bg-white font-sans text-black flex items-center justify-center p-4">
            <div className="w-full max-w-[400px] animate-in fade-in zoom-in-95 duration-700">
                {/* Header Section */}
                <div className="flex flex-col items-center mb-12">
                    <div className="h-14 w-14 bg-white border border-zinc-200 flex items-center justify-center mb-8 rounded-none group hover:border-black transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" strokeLinejoin="miter" className="text-black transition-colors">
                            <path d="M21.2 8.4c.5.38.8.97.8 1.6v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V10a2 2 0 0 1 .8-1.6l8-6a2 2 0 0 1 2.4 0l8 6Z" />
                            <path d="m22 10-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 10" />
                        </svg>
                    </div>
                    <h1 className="text-2xl font-black tracking-[0.2em] text-black uppercase text-center leading-none mb-4">
                        Recuperar
                    </h1>
                    <p className="text-zinc-500 text-[10px] uppercase tracking-[0.2em] font-bold text-center max-w-[280px] mx-auto leading-relaxed">
                        Insira seu e-mail para receber as instruções.
                    </p>
                </div>

                {success ? (
                    <div className="bg-zinc-50 border border-zinc-200 p-8 text-center animate-in fade-in zoom-in duration-300 rounded-none">
                        <div className="w-10 h-10 bg-black text-white flex items-center justify-center mx-auto mb-6 rounded-none">
                            <CheckCircle className="w-5 h-5" />
                        </div>
                        <h3 className="text-black font-black uppercase tracking-widest text-xs mb-4">Email Enviado</h3>
                        <p className="text-zinc-500 text-[10px] uppercase tracking-widest mb-8 leading-relaxed">
                            Verifique sua caixa de entrada e spam ({email}).
                        </p>

                        <div className="space-y-3">
                            <Button
                                variant="outline"
                                className="w-full bg-white border-zinc-200 text-zinc-600 hover:text-black hover:border-black h-12 font-bold text-[10px] tracking-[0.2em] uppercase rounded-none transition-all"
                                onClick={handleResend}
                                disabled={countdown > 0 || loading}
                            >
                                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> :
                                    countdown > 0 ? `Reenviar em ${countdown}s` : "Reenviar Link"}
                            </Button>

                            <Button
                                variant="ghost"
                                className="w-full text-zinc-500 hover:text-black h-10 font-bold text-[9px] tracking-[0.2em] uppercase transition-colors rounded-none"
                                onClick={() => setSuccess(false)}
                            >
                                Usar outro e-mail
                            </Button>
                        </div>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {error && (
                            <div className="bg-red-50 border border-red-200 p-4 text-red-600 text-xs font-bold uppercase tracking-widest text-center rounded-none">
                                {error}
                            </div>
                        )}

                        <div className="space-y-2">
                            <label className="text-[10px] uppercase tracking-[0.2em] text-zinc-500 font-black pl-1">Email Cadastrado</label>
                            <Input
                                type="email"
                                placeholder="SEU@EMAIL.COM"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="bg-white border-zinc-200 text-black placeholder:text-zinc-300 h-12 rounded-none border focus:border-black focus:ring-0 transition-all text-xs font-bold uppercase tracking-widest px-4"
                                required
                                autoFocus
                            />
                        </div>

                        <Button
                            type="submit"
                            className="w-full bg-black text-white hover:bg-zinc-800 h-12 font-black text-xs tracking-[0.3em] uppercase rounded-none border-none transition-all mt-4"
                            disabled={loading}
                        >
                            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Enviar Instruções"}
                        </Button>
                    </form>
                )}

                <div className="mt-12 text-center">
                    <Link
                        to="/login"
                        className="text-zinc-400 hover:text-black text-[10px] uppercase tracking-[0.2em] transition-colors font-bold group inline-flex items-center gap-2"
                    >
                        <span className="group-hover:-translate-x-1 transition-transform">←</span> Voltar ao Login
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;
