import { createContext, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Session, User } from '@supabase/supabase-js';
import { useToast } from '@/components/ui/use-toast';
import { APP_CONFIG } from '@/config/constants';

interface AuthContextType {
    session: Session | null;
    user: User | null;
    userProfile: any | null;
    userRole: "super_admin" | "admin" | "user" | null;
    isLoading: boolean;
    isProfileLoading: boolean;
    isRecoveringPassword: boolean;
    setIsRecoveringPassword: (value: boolean) => void; // NOVO: Para resetar após sucesso
    signIn: (email: string) => Promise<void>; // OTP (Existing)
    signInWithPassword: (email: string, password: string) => Promise<{ error: any }>;
    signUp: (email: string, password: string) => Promise<{ error: any }>;
    resetPassword: (email: string) => Promise<{ error: any }>;
    updatePassword: (password: string) => Promise<{ error: any }>;
    signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [session, setSession] = useState<Session | null>(null);
    const [user, setUser] = useState<User | null>(null);
    const [userProfile, setUserProfile] = useState<any | null>(null);
    const [userRole, setUserRole] = useState<"super_admin" | "admin" | "user" | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isProfileLoading, setIsProfileLoading] = useState(false);
    const [isRecoveringPassword, setIsRecoveringPassword] = useState(() => {
        return window.location.hash.includes('type=recovery') ||
            window.location.hash.includes('access_token=') ||
            window.location.pathname === '/reset-password';
    });
    const { toast } = useToast();
    const navigate = useNavigate();

    const fetchUserRole = async (userId: string, silent = false) => {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', userId)
                .maybeSingle();

            if (error) {
                console.error('Error fetching user profile:', error);
                return;
            }

            if (data) {
                setUserProfile(data);
                setUserRole(data.role as any || 'user');
            } else {
                setUserRole('user');
                setUserProfile(null);
            }
        } catch (err) {
            console.error('Failed to fetch profile:', err);
        } finally {
            // Só desliga loading se foi ligado (evita re-render desnecessario no refresh silencioso)
            if (!silent) {
                setIsProfileLoading(false);
            }
        }
    };

    useEffect(() => {
        // Safety timeout: se o auth travar por mais de 5s, força o estado de pronto
        const safetyTimeout = setTimeout(() => {
            setIsLoading(false);
        }, 5000);

        return () => clearTimeout(safetyTimeout);
    }, []); // [] = roda UMA VEZ ao montar, não reage a mudanças de estado

    useEffect(() => {
        if (window.location.hash.includes('type=recovery') ||
            window.location.hash.includes('access_token=') ||
            window.location.pathname === '/reset-password') {
            setIsRecoveringPassword(true);
        }

        // ── Single source of truth: onAuthStateChange ────────────────────────
        // O Supabase dispara INITIAL_SESSION imediatamente ao registrar o listener,
        // com a sessão atual (ou null). Não precisamos chamar getSession() manualmente.
        // Fazer as duas coisas gera race condition e múltiplos re-renders (flash).
        let mounted = true;

        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
            if (!mounted) return;

            // Sincronizar estados basicos imediatamente
            setSession(session);
            setUser(session?.user ?? null);

            // INITIAL_SESSION: primeira leitura da sessão, sempre desliga o loading
            if (_event === 'INITIAL_SESSION') {
                setIsLoading(false);
            }

            if (_event === 'SIGNED_OUT') {
                setUserProfile(null);
                setUserRole(null);
                setIsLoading(false);
                setIsProfileLoading(false);
                return;
            }

            // TOKEN_REFRESHED e USER_UPDATED (foco de aba) NÃO disparam loading!
            // Isso evita desmontar a árvore da DOM ao trocar de aba do navegador.
            if (session?.user && (_event === 'SIGNED_IN' || _event === 'INITIAL_SESSION')) {
                setIsProfileLoading(true);
                fetchUserRole(session.user.id);
            } else if (session?.user && (_event === 'TOKEN_REFRESHED' || _event === 'USER_UPDATED')) {
                // Refresh silencioso - atualiza perfil em background sem destruir a UI
                fetchUserRole(session.user.id, true);
            }

            if (_event === 'PASSWORD_RECOVERY') {
                setIsRecoveringPassword(true);

                if (window.location.pathname !== '/reset-password') {
                    navigate('/reset-password', { replace: true });
                }
            }

            // Invite Flow: redireciona para criação de senha no primeiro acesso
            if ((_event === 'SIGNED_IN' || _event === 'INITIAL_SESSION') && session?.user?.user_metadata?.invited === true) {
                if (window.location.pathname !== '/reset-password') {
                    setIsRecoveringPassword(true);
                    navigate('/reset-password', { replace: true, state: { fromInvite: true } });
                }
            }

            // Garantir que carregamento inicial termine em qualquer evento
            setIsLoading(false);
        });

        return () => {
            mounted = false;
            subscription.unsubscribe();
        };
    }, []);

    // Existing OTP Sign In
    const signIn = async (email: string) => {
        try {
            const { error } = await supabase.auth.signInWithOtp({
                email,
                options: {
                    emailRedirectTo: window.location.origin + '/admin',
                },
            });

            if (error) throw error;

            toast({
                title: "Link de acesso enviado!",
                description: "Verifique seu e-mail para entrar no Hub.",
            });
        } catch (error: any) {
            toast({
                title: "Erro ao entrar",
                description: error.message,
                variant: "destructive"
            });
        }
    };

    const signInWithPassword = async (email: string, password: string) => {
        try {
            // Timeout de 10 segundos
            const timeoutPromise = new Promise((_, reject) =>
                setTimeout(() => reject(new Error('Login timeout - tente novamente')), 10000)
            );

            const loginPromise = supabase.auth.signInWithPassword({
                email,
                password,
            });

            const { data, error } = await Promise.race([loginPromise, timeoutPromise]) as any;

            if (error) throw error;
            return { error: null };
        } catch (error: any) {
            console.error("Login error:", error.message);
            return { error };
        }
    };

    const signUp = async (_email: string, _password: string) => {
        // BLOQUEADO: Cadastro público desabilitado.
        // Toda criação de conta é feita exclusivamente via convite administrativo (invite-member).
        console.warn('[Auth] Tentativa de signUp bloqueada - cadastro publico desabilitado.');
        return { error: new Error('Cadastro desabilitado. Contas são criadas exclusivamente via convite do administrador.') };
    };

    const resetPassword = async (email: string) => {
        try {
            const appOrigin = APP_CONFIG.URLS.APP || window.location.origin;
            const redirectUrl = `${appOrigin}/reset-password`;

            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: redirectUrl,
            });

            if (error) throw error;
            return { error: null };
        } catch (error: any) {
            console.error("Reset password error:", error.message);
            return { error };
        }
    };

    const updatePassword = async (password: string) => {
        try {
            // Timeout de 20 segundos para atualizacao de senha
            const timeoutPromise = new Promise((_, reject) =>
                setTimeout(() => reject(new Error('Tempo limite excedido ao atualizar senha. Verifique sua conexão.')), 20000)
            );

            const updatePromise = (async () => {
                const { data, error } = await supabase.auth.updateUser({
                    password,
                    data: { invited: null }
                });
                if (error) throw error;
                return { data, error: null };
            })();

            const result = await Promise.race([updatePromise, timeoutPromise]) as any;

            return { error: null };
        } catch (error: any) {
            console.error("Update password error detailed:", error);
            return { error };
        }
    }

    const signOut = async () => {
        try {
            // Limpar estado local primeiro
            setSession(null);
            setUser(null);
            setUserProfile(null);
            setUserRole(null);

            // Fazer logout no Supabase
            const { error } = await supabase.auth.signOut();

            if (error) {
                console.error('Erro ao fazer logout:', error);
            }

            // Limpar localStorage (tokens antigos)
            localStorage.removeItem('supabase.auth.token');

            // Mostrar toast
            toast({
                title: "Você saiu do sistema.",
                description: "Até logo!"
            });

            // Redirecionar para home com reload completo
            setTimeout(() => {
                window.location.href = '/';
            }, 500);

        } catch (error) {
            console.error('Erro no logout:', error);
            // Mesmo com erro, limpar tudo
            setSession(null);
            setUser(null);
            setUserProfile(null);
            setUserRole(null);

            // Forçar redirecionamento
            window.location.href = '/';
        }
    };

    return (
        <AuthContext.Provider value={{
            session,
            user,
            userProfile,
            userRole,
            isLoading,
            isProfileLoading,
            isRecoveringPassword,
            setIsRecoveringPassword,
            signIn,
            signInWithPassword,
            signUp,
            resetPassword,
            updatePassword,
            signOut
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
