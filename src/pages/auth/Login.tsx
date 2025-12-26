import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, Lock, Mail, ArrowRight } from 'lucide-react';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [magicLinkLoading, setMagicLinkLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const { signInWithPassword, signIn, setDevBypass } = useAuth();
    const navigate = useNavigate();

    const handleMagicLink = async () => {
        if (!email) {
            setError('Digite seu e-mail primeiro.');
            return;
        }
        setError(null);
        setMagicLinkLoading(true);
        await signIn(email);
        setMagicLinkLoading(false);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        // BYPASS TEMPORÁRIO DE DESENVOLVIMENTO
        if (password === 'DEV_BYPASS_2024') {
            console.log('🔓 Bypass de desenvolvimento ativado');
            setDevBypass(email); // Seta usuário fake no contexto

            // Delay para parecer mais seguro
            await new Promise(resolve => setTimeout(resolve, 800));

            setLoading(false);
            navigate('/admin');
            return;
        }

        const result = await signInWithPassword(email, password);

        if (result.error) {
            setError('Credenciais inválidas. Tente novamente.');
            setLoading(false);
        } else {
            // Delay para parecer mais seguro
            await new Promise(resolve => setTimeout(resolve, 800));
            navigate('/admin');
        }
    };

    return (
        <div className="min-h-screen w-full bg-black font-sans text-white flex items-center justify-center p-4 relative overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 bg-dot-dark opacity-30"></div>

            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-black via-black to-zinc-900"></div>

            <div className="w-full max-w-[480px] relative z-10 animate-in fade-in zoom-in-95 duration-700">
                {/* Logo RevHackers */}
                <div className="flex flex-col items-center mb-12">
                    <Link to="/" className="block mb-8 group">
                        <img
                            src="https://storage.googleapis.com/msgsndr/oFTw9DcsKRUj6xCiq4mb/media/6808e4eea2927569eb667113.png"
                            alt="RevHackers Logo"
                            className="h-16 w-auto transition-all duration-300 group-hover:opacity-80"
                        />
                    </Link>

                    <p className="text-zinc-500 text-[10px] uppercase tracking-[0.3em] font-medium text-center">
                        Acesso Administrativo
                    </p>
                </div>

                {/* Card de Login */}
                <div className="bg-zinc-900/50 border border-white/10 backdrop-blur-xl p-8 rounded-sm">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {error && (
                            <div className="bg-red-500/10 border border-red-500/20 p-4 text-red-400 text-xs font-bold uppercase tracking-widest text-center rounded-sm">
                                {error}
                            </div>
                        )}

                        <div className="space-y-2">
                            <label className="text-[10px] uppercase tracking-[0.2em] text-zinc-400 font-black pl-1 flex items-center gap-2">
                                <Mail className="w-3 h-3" />
                                Email Corporativo
                            </label>
                            <Input
                                type="email"
                                placeholder="seu@email.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="bg-zinc-800/50 border-zinc-700 text-white placeholder:text-zinc-600 h-12 rounded-sm border focus:border-revgreen focus:ring-1 focus:ring-revgreen/20 transition-all text-sm px-4"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between items-center pl-1 pr-1">
                                <label className="text-[10px] uppercase tracking-[0.2em] text-zinc-400 font-black flex items-center gap-2">
                                    <Lock className="w-3 h-3" />
                                    Senha
                                </label>
                                <Link
                                    to="/forgot-password"
                                    className="text-[9px] uppercase tracking-widest text-zinc-500 hover:text-revgreen transition-colors font-bold"
                                >
                                    Recuperar
                                </Link>
                            </div>
                            <Input
                                type="password"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="bg-zinc-800/50 border-zinc-700 text-white placeholder:text-zinc-600 h-12 rounded-sm border focus:border-revgreen focus:ring-1 focus:ring-revgreen/20 transition-all text-sm px-4"
                                required
                            />
                        </div>

                        <Button
                            type="submit"
                            className="w-full bg-revgreen text-black hover:bg-revgreen/90 h-12 font-black text-xs tracking-[0.3em] uppercase rounded-sm border-none transition-all mt-4 shadow-[0_0_20px_rgba(34,197,94,0.3)] hover:shadow-[0_0_30px_rgba(34,197,94,0.5)]"
                            disabled={loading}
                        >
                            {loading ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <span className="flex items-center justify-center gap-2">
                                    Acessar Sistema <ArrowRight className="w-4 h-4" />
                                </span>
                            )}
                        </Button>

                        <div className="relative flex py-4 items-center">
                            <div className="flex-grow border-t border-white/10"></div>
                            <span className="flex-shrink-0 mx-4 text-[9px] uppercase tracking-widest text-zinc-600">Ou</span>
                            <div className="flex-grow border-t border-white/10"></div>
                        </div>

                        <Button
                            type="button"
                            onClick={handleMagicLink}
                            variant="outline"
                            className="w-full bg-transparent border-white/20 text-zinc-400 hover:text-white hover:border-revgreen hover:bg-revgreen/10 h-12 font-bold text-[10px] tracking-[0.2em] uppercase rounded-sm transition-all"
                            disabled={loading || magicLinkLoading}
                        >
                            {magicLinkLoading ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <span className="flex items-center justify-center gap-2">
                                    <Mail className="w-4 h-4" />
                                    Receber Link de Acesso
                                </span>
                            )}
                        </Button>
                    </form>
                </div>

                {/* Footer */}
                <div className="mt-8 text-center space-y-4">
                    <Link
                        to="/"
                        className="text-zinc-600 hover:text-revgreen text-[10px] uppercase tracking-[0.2em] transition-colors font-bold inline-flex items-center gap-2 group"
                    >
                        <span className="group-hover:-translate-x-1 transition-transform">←</span>
                        Voltar ao Site
                    </Link>

                    <p className="text-zinc-700 text-[8px] uppercase tracking-[0.3em]">
                        © 2024 RevHackers • Growth Hub
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;
