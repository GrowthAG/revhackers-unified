import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, Lock, Mail, ArrowRight } from 'lucide-react';
import PageLayout from '@/components/layout/PageLayout';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [magicLinkLoading, setMagicLinkLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const { signInWithPassword, signIn, setDevBypass, user, isRecoveringPassword } = useAuth();
    const navigate = useNavigate();

    // Redirecionar se já estiver logado (exceto se estiver em fluxo de recuperação)
    useEffect(() => {
        if (user && !isRecoveringPassword) {
            console.log('🏠 Login: Usuário já autenticado e sem pendências de recuperação, indo para admin');
            navigate('/admin');
        } else if (user && isRecoveringPassword) {
            console.log('🔑 Login: Fluxo de recuperação detectado pelo contexto. Mantendo na página.');
        }
    }, [user, navigate, isRecoveringPassword]);

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
        <PageLayout>
            <div className="w-full h-full min-h-[70vh] flex items-center justify-center p-4 bg-white pt-32">
                <div className="w-full max-w-[400px] animate-in fade-in zoom-in-95 duration-700">

                    {/* Header Section */}
                    <div className="flex flex-col items-center mb-10">
                        <h1 className="text-2xl font-black tracking-[0.2em] text-black uppercase text-center leading-none mb-4 mt-8">
                            Acesso Admin
                        </h1>
                        <p className="text-zinc-500 text-[10px] uppercase tracking-[0.2em] font-bold text-center max-w-[280px] mx-auto leading-relaxed">
                            Entre com suas credenciais corporativas.
                        </p>
                    </div>

                    {/* Conteúdo de Login */}
                    <div className="bg-white p-2">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {error && (
                                <div className="text-black text-[9px] font-light uppercase tracking-[0.3em] text-center mb-10 border border-black p-2">
                                    {error}
                                </div>
                            )}

                            <div className="space-y-2">
                                <label className="text-[10px] uppercase tracking-[0.2em] text-zinc-500 font-black pl-1 flex items-center gap-2">
                                    <Mail className="w-3 h-3" />
                                    Email Corporativo
                                </label>
                                <Input
                                    type="email"
                                    placeholder="seu@email.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="bg-zinc-50 border-zinc-200 text-black placeholder:text-zinc-400 h-12 rounded-sm border focus:border-black focus:ring-1 focus:ring-black transition-all text-sm px-4"
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <div className="flex justify-between items-center pl-1 pr-1">
                                    <label className="text-[10px] uppercase tracking-[0.2em] text-zinc-500 font-black flex items-center gap-2">
                                        <Lock className="w-3 h-3" />
                                        Senha
                                    </label>
                                    <Link
                                        to="/forgot-password"
                                        className="text-[9px] uppercase tracking-widest text-zinc-400 hover:text-revgreen transition-colors font-bold"
                                    >
                                        Recuperar
                                    </Link>
                                </div>
                                <Input
                                    type="password"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="bg-zinc-50 border-zinc-200 text-black placeholder:text-zinc-400 h-12 rounded-sm border focus:border-black focus:ring-1 focus:ring-black transition-all text-sm px-4"
                                    required
                                />
                            </div>

                            <Button
                                type="submit"
                                className="w-full bg-black text-white hover:bg-revgreen hover:text-black h-12 font-black text-xs tracking-[0.3em] uppercase rounded-sm border-none transition-all mt-4"
                                disabled={loading}
                            >
                                {loading ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                    <span className="flex items-center justify-center gap-2">
                                        Entrar <ArrowRight className="w-4 h-4" />
                                    </span>
                                )}
                            </Button>

                            <div className="relative flex py-4 items-center">
                                <div className="flex-grow border-t border-zinc-200"></div>
                                <span className="flex-shrink-0 mx-4 text-[9px] uppercase tracking-widest text-zinc-400">Ou</span>
                                <div className="flex-grow border-t border-zinc-200"></div>
                            </div>

                            <Button
                                type="button"
                                onClick={handleMagicLink}
                                variant="outline"
                                className="w-full bg-transparent border-zinc-200 text-zinc-500 hover:text-black hover:border-black h-12 font-bold text-[10px] tracking-[0.2em] uppercase rounded-none transition-all"
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
                </div>
            </div>
        </PageLayout>
    );
};

export default Login;
