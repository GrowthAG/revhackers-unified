import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, CheckCircle, AlertTriangle } from 'lucide-react';
import PageLayout from '@/components/layout/PageLayout';

const UpdatePassword = () => {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    // Utilizamos o estado global do AuthContext para garantir que a sessão foi resolvida
    const { session, isLoading: authLoading, updatePassword, setIsRecoveringPassword } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const fromInvite = (location.state as any)?.fromInvite === true || session?.user?.user_metadata?.invited === true;

    // Removemos a chamada direta standalone do supabase.auth.getSession, pois o AuthContext já lida com resiliência
    useEffect(() => {
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const hashError = hashParams.get('error_description');

        if (hashError) {
            console.error('⚠️ [UpdatePassword] Supabase Hash Error:', hashError);
            setError('Link Inválido/Expirado: Provedores de e-mail podem ter bloqueado ou consumido este link antecipadamente. Solicite um novo convite.');
            return;
        }

        if (!authLoading && !session && !success) {
            console.warn('⚠️ [UpdatePassword] No session found. Link is consumed/expired/invalid.');
            setError('Sessão expirada. O link já foi utilizado ou expirou. Por favor, volte ao login.');
        } else if (session) {
            setError(null);
        }
    }, [session, authLoading, success]);

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

        try {
            const result = await updatePassword(password);

            if (result && result.error) {
                console.error('❌ [UpdatePassword] Update failed:', result.error);
                setError(`Erro: ${result.error.message || 'Tente novamente.'}`);
                setLoading(false);
            } else {
                setIsRecoveringPassword(false); // Libera o fluxo de redirecionamento normal
                setSuccess(true);
                setTimeout(() => {
                    // Invite users are already authenticated - send to hub
                    navigate(fromInvite ? '/admin' : '/login');
                }, 2000);
            }
        } catch (err: any) {
            console.error('💥 [UpdatePassword] Fatal error:', err);
            setError('Erro inesperado. Tente novamente.');
            setLoading(false);
        }
    };

    return (
        <PageLayout>
            <div className="w-full h-full min-h-[70vh] flex items-center justify-center p-4 bg-white pt-32">
                <div className="w-full max-w-[400px] animate-in fade-in zoom-in-95 duration-700">
                    {/* Header Section */}
                    <div className="flex flex-col items-center mb-10">
                        <h1 className="text-2xl font-black tracking-[0.2em] text-black uppercase text-center leading-none mb-4 mt-8">
                            {fromInvite ? 'Ative Seu Acesso' : 'Nova Senha'}
                        </h1>
                        <p className="text-zinc-500 text-xxs uppercase tracking-[0.2em] font-bold text-center max-w-[280px] mx-auto leading-relaxed">
                            {fromInvite
                                ? 'Bem-vindo à RevHackers. Crie sua senha para acessar o Hub.'
                                : 'Defina uma nova senha para sua conta.'}
                        </p>
                    </div>

                    {authLoading ? (
                        <div className="flex flex-col items-center justify-center p-8 space-y-4">
                            <Loader2 className="w-8 h-8 animate-spin text-zinc-900" />
                            <p className="text-xxs uppercase tracking-widest text-zinc-500 font-bold">Validando link seguro...</p>
                        </div>
                    ) : success ? (
                        <div className="bg-zinc-50 border border-zinc-200 p-8 text-center animate-in fade-in zoom-in duration-300 rounded-none">
                            <div className="w-10 h-10 bg-black text-white flex items-center justify-center mx-auto mb-6 rounded-none">
                                <CheckCircle className="w-5 h-5" />
                            </div>
                            <h3 className="text-black font-black uppercase tracking-widest text-xs mb-4">
                                {fromInvite ? 'Acesso Ativado' : 'Senha Atualizada'}
                            </h3>
                            <p className="text-zinc-500 text-xxs uppercase tracking-widest mb-4 leading-relaxed">
                                {fromInvite ? 'Redirecionando para o Hub...' : 'Redirecionando para o login...'}
                            </p>
                        </div>
                    ) : !session ? (
                        <div className="bg-zinc-50 border border-zinc-200 p-8 text-center animate-in fade-in zoom-in duration-300 rounded-none">
                            <div className="w-10 h-10 bg-white border border-red-200 text-red-500 flex items-center justify-center mx-auto mb-6 rounded-none">
                                <AlertTriangle className="w-5 h-5" />
                            </div>
                            <h3 className="text-red-500 font-black uppercase tracking-widest text-xs mb-4">
                                Link Expirado ou Já Utilizado
                            </h3>
                            <p className="text-zinc-500 text-xxs uppercase tracking-[0.1em] mb-8 leading-relaxed max-w-[280px] mx-auto">
                                Por segurança, este link de acesso foi invalidado pois já foi acessado anteriormente ou o limite de tempo estourou.
                            </p>
                            <Button
                                type="button"
                                onClick={() => navigate('/login')}
                                className="w-full bg-black text-white hover:bg-zinc-800 h-12 font-black text-xs tracking-[0.3em] uppercase rounded-none border-none transition-all"
                            >
                                Voltar para o Login
                            </Button>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {error && (
                                <div className="text-red-500 text-2xs font-light uppercase tracking-[0.3em] text-center mb-10">
                                    {error}
                                </div>
                            )}

                            <div className="space-y-2">
                                <label className="text-xxs uppercase tracking-[0.2em] text-zinc-500 font-black pl-1">Nova Senha</label>
                                <Input
                                    type="password"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="bg-white border-zinc-200 text-black placeholder:text-zinc-300 h-12 rounded-none border focus:border-black focus:ring-0 transition-all text-sm px-4"
                                    required
                                    autoFocus
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-xxs uppercase tracking-[0.2em] text-zinc-500 font-black pl-1">Confirmar Senha</label>
                                <Input
                                    type="password"
                                    placeholder="••••••••"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="bg-white border-zinc-200 text-black placeholder:text-zinc-300 h-12 rounded-none border focus:border-black focus:ring-0 transition-all text-sm px-4"
                                    required
                                />
                            </div>

                            <Button
                                type="submit"
                                className="w-full bg-black text-white hover:bg-zinc-800 h-12 font-black text-xs tracking-[0.3em] uppercase rounded-none border-none transition-all mt-4"
                                disabled={loading}
                            >
                                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : (fromInvite ? 'Ativar Acesso' : 'Atualizar Senha')}
                            </Button>
                        </form>
                    )}
                </div>
            </div>
        </PageLayout>
    );
};

export default UpdatePassword;
