import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, Mail, ArrowRight } from 'lucide-react';

const Signup = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const { signUp } = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (password !== confirmPassword) {
            setError('As senhas não coincidem.');
            return;
        }

        if (password.length < 6) {
            setError('A senha deve ter pelo menos 6 caracteres.');
            return;
        }

        setLoading(true);

        const result = await signUp(email, password);

        if (result.error) {
            setError(result.error.message || 'Erro ao criar conta. Tente novamente.');
            setLoading(false);
        } else {
            setSuccess(true);
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="min-h-screen w-full bg-black font-sans text-white flex items-center justify-center p-4 relative overflow-hidden">
                <div className="absolute inset-0 bg-dot-dark opacity-30"></div>
                <div className="absolute inset-0 bg-gradient-to-br from-black via-black to-zinc-900"></div>

                <div className="w-full max-w-[480px] relative z-10 animate-in fade-in zoom-in-95 duration-700">
                    <div className="bg-zinc-900/50 border border-white/10 backdrop-blur-xl p-12 rounded-sm text-center">
                        <div className="w-16 h-16 bg-revgreen/20 border border-revgreen/30 flex items-center justify-center mx-auto mb-6 rounded-sm">
                            <Mail className="w-8 h-8 text-revgreen" />
                        </div>
                        <h2 className="text-2xl font-black uppercase tracking-wider mb-4">Verifique seu Email</h2>
                        <p className="text-zinc-400 text-sm mb-8 leading-relaxed">
                            Enviamos um link de confirmação para <strong className="text-white">{email}</strong>.
                            <br />
                            Clique no link para ativar sua conta.
                        </p>
                        <Button asChild className="btn-outline-flat w-full">
                            <Link to="/login">
                                Ir para Login
                            </Link>
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen w-full bg-black font-sans text-white flex items-center justify-center p-4 relative overflow-hidden">
            <div className="absolute inset-0 bg-dot-dark opacity-30"></div>
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

                    <div className="flex items-center gap-3 mb-4">
                        <div className="h-px w-8 bg-revgreen"></div>
                        <h1 className="text-2xl font-black tracking-[0.2em] text-white uppercase text-center leading-none">
                            CRIAR CONTA
                        </h1>
                        <div className="h-px w-8 bg-revgreen"></div>
                    </div>

                    <p className="text-zinc-500 text-[10px] uppercase tracking-[0.3em] font-medium text-center">
                        Acesso ao Growth Hub
                    </p>
                </div>

                {/* Card de Signup */}
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
                                Email
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
                            <label className="text-[10px] uppercase tracking-[0.2em] text-zinc-400 font-black pl-1">
                                Senha
                            </label>
                            <Input
                                type="password"
                                placeholder="Mínimo 6 caracteres"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="bg-zinc-800/50 border-zinc-700 text-white placeholder:text-zinc-600 h-12 rounded-sm border focus:border-revgreen focus:ring-1 focus:ring-revgreen/20 transition-all text-sm px-4"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] uppercase tracking-[0.2em] text-zinc-400 font-black pl-1">
                                Confirmar Senha
                            </label>
                            <Input
                                type="password"
                                placeholder="Digite novamente"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
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
                                    Criar Conta <ArrowRight className="w-4 h-4" />
                                </span>
                            )}
                        </Button>

                        <div className="text-center pt-4">
                            <p className="text-zinc-500 text-xs">
                                Já tem uma conta?{' '}
                                <Link to="/login" className="text-revgreen hover:text-revgreen/80 font-bold transition-colors">
                                    Fazer Login
                                </Link>
                            </p>
                        </div>
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

export default Signup;
