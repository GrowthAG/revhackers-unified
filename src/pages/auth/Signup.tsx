import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, Mail, ArrowRight } from 'lucide-react';
import PageLayout from '@/components/layout/PageLayout';

const Signup = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const { signUp, user } = useAuth();
    const navigate = useNavigate();

    // Redirecionar se já estiver logado
    useEffect(() => {
        if (user) {
            navigate('/admin');
        }
    }, [user, navigate]);

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
        const { error: signUpError } = await signUp(email, password);

        if (signUpError) {
            setError(signUpError.message);
            setLoading(false);
        } else {
            setSuccess(true);
            setLoading(false);
        }
    };

    return (
        <PageLayout>
            <div className="w-full h-full min-h-[70vh] flex items-center justify-center p-4">
                <div className="w-full max-w-[400px] animate-in fade-in zoom-in-95 duration-700">

                    <div className="bg-white p-8 md:p-12 shadow-[0_0_50px_rgba(0,0,0,0.5)] border border-white/10">
                        {/* Header Section */}
                        <div className="flex flex-col items-center mb-10">
                            <h1 className="text-2xl font-black tracking-[0.2em] text-black uppercase text-center leading-none mb-4">
                                Criar Conta
                            </h1>
                            <p className="text-zinc-500 text-xxs uppercase tracking-[0.2em] font-bold text-center max-w-[280px] mx-auto leading-relaxed">
                                Junte-se à maior comunidade de RevOps.
                            </p>
                        </div>

                        {success ? (
                            <div className="text-center py-8">
                                <div className="bg-black border border-zinc-800 p-6 rounded-none mb-8">
                                    <h3 className="text-white font-black uppercase tracking-widest text-sm mb-2">Conta criada!</h3>
                                    <p className="text-zinc-400 text-xs font-bold uppercase tracking-wider leading-relaxed">
                                        Verifique seu e-mail para confirmar o cadastro e liberar seu acesso.
                                    </p>
                                </div>
                                <Link to="/login">
                                    <Button className="w-full bg-black text-white hover:bg-zinc-800 font-black text-xs tracking-widest uppercase rounded-none">
                                        Ir para Login
                                    </Button>
                                </Link>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-6">
                                {error && (
                                    <div className="bg-zinc-50 border border-black text-black text-xs font-bold uppercase tracking-widest text-center rounded-none p-4">
                                        {error}
                                    </div>
                                )}

                                <div className="space-y-2">
                                    <label className="text-xxs uppercase tracking-[0.2em] text-zinc-500 font-black pl-1 flex items-center gap-2">
                                        <Mail className="w-3 h-3" />
                                        Email Corporativo
                                    </label>
                                    <Input
                                        type="email"
                                        placeholder="seu@email.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="bg-white border-zinc-200 text-black placeholder:text-zinc-400 h-12 rounded-none focus:border-black transition-all text-sm px-4"
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xxs uppercase tracking-[0.2em] text-zinc-500 font-black pl-1">
                                        Senha
                                    </label>
                                    <Input
                                        type="password"
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="bg-white border-zinc-200 text-black placeholder:text-zinc-400 h-12 rounded-none focus:border-black transition-all text-sm px-4"
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xxs uppercase tracking-[0.2em] text-zinc-500 font-black pl-1">
                                        Confirmar Senha
                                    </label>
                                    <Input
                                        type="password"
                                        placeholder="••••••••"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        className="bg-white border-zinc-200 text-black placeholder:text-zinc-400 h-12 rounded-none focus:border-black transition-all text-sm px-4"
                                        required
                                    />
                                </div>

                                <Button
                                    type="submit"
                                    className="w-full bg-black text-white hover:bg-zinc-800 h-12 font-black text-xs tracking-[0.3em] uppercase rounded-none border-none transition-all mt-4"
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
                            </form>
                        )}
                    </div>

                    <div className="mt-12 text-center flex flex-col items-center gap-4">
                        <p className="text-zinc-500 text-xxs uppercase tracking-widest">
                            Já tem uma conta?{' '}
                            <Link to="/login" className="text-white hover:text-revgreen font-bold transition-colors">
                                Fazer Login
                            </Link>
                        </p>

                        <Link
                            to="/"
                            className="text-zinc-400 hover:text-white text-xxs uppercase tracking-[0.2em] transition-colors font-bold inline-flex items-center gap-2 group"
                        >
                            <span className="group-hover:-translate-x-1 transition-transform">←</span> Voltar ao Site
                        </Link>
                    </div>
                </div>
            </div>
        </PageLayout>
    );
};

export default Signup;
