import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, Lock, CheckCircle } from 'lucide-react';

const UpdatePassword = () => {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const { updatePassword } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        // Ensure we have a session (password reset link should set this automatically)
        const checkSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                setError('Link inválido ou expirado. Solicite um novo link de recuperação.');
            }
        };
        checkSession();
    }, []);

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

        const result = await updatePassword(password);

        if (result.error) {
            setError('Erro ao atualizar senha. Tente novamente.');
            setLoading(false);
        } else {
            setSuccess(true);
            setTimeout(() => {
                navigate('/login');
            }, 2000);
        }
    };

    return (
        <div className="min-h-screen w-full bg-white font-sans text-black flex items-center justify-center p-4">
            <div className="w-full max-w-[400px] animate-in fade-in zoom-in-95 duration-700">
                {/* Header Section */}
                <div className="flex flex-col items-center mb-12">
                    <div className="h-14 w-14 bg-white border border-zinc-200 flex items-center justify-center mb-8 rounded-none group hover:border-black transition-colors">
                        <Lock className="w-6 h-6 text-black transition-colors" strokeWidth={1.5} />
                    </div>
                    <h1 className="text-2xl font-black tracking-[0.2em] text-black uppercase text-center leading-none mb-4">
                        Nova Senha
                    </h1>
                    <p className="text-zinc-500 text-[10px] uppercase tracking-[0.2em] font-bold text-center max-w-[280px] mx-auto leading-relaxed">
                        Defina uma nova senha para sua conta.
                    </p>
                </div>

                {success ? (
                    <div className="bg-zinc-50 border border-zinc-200 p-8 text-center animate-in fade-in zoom-in duration-300 rounded-none">
                        <div className="w-10 h-10 bg-black text-white flex items-center justify-center mx-auto mb-6 rounded-none">
                            <CheckCircle className="w-5 h-5" />
                        </div>
                        <h3 className="text-black font-black uppercase tracking-widest text-xs mb-4">Senha Atualizada</h3>
                        <p className="text-zinc-500 text-[10px] uppercase tracking-widest mb-4 leading-relaxed">
                            Redirecionando para o login...
                        </p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {error && (
                            <div className="bg-red-50 border border-red-200 p-4 text-red-600 text-xs font-bold uppercase tracking-widest text-center rounded-none">
                                {error}
                            </div>
                        )}

                        <div className="space-y-2">
                            <label className="text-[10px] uppercase tracking-[0.2em] text-zinc-500 font-black pl-1">Nova Senha</label>
                            <Input
                                type="password"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="bg-white border-zinc-200 text-black placeholder:text-zinc-300 h-12 rounded-none border focus:border-black focus:ring-0 transition-all text-xs font-bold uppercase tracking-widest px-4"
                                required
                                autoFocus
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] uppercase tracking-[0.2em] text-zinc-500 font-black pl-1">Confirmar Senha</label>
                            <Input
                                type="password"
                                placeholder="••••••••"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="bg-white border-zinc-200 text-black placeholder:text-zinc-300 h-12 rounded-none border focus:border-black focus:ring-0 transition-all text-xs font-bold uppercase tracking-widest px-4"
                                required
                            />
                        </div>

                        <Button
                            type="submit"
                            className="w-full bg-black text-white hover:bg-zinc-800 h-12 font-black text-xs tracking-[0.3em] uppercase rounded-none border-none transition-all mt-4"
                            disabled={loading}
                        >
                            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Atualizar Senha"}
                        </Button>
                    </form>
                )}
            </div>
        </div>
    );
};

export default UpdatePassword;
