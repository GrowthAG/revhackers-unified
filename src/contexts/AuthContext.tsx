import { createContext, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Session, User } from '@supabase/supabase-js';
import { useToast } from '@/components/ui/use-toast';

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
    setDevBypass: (email: string) => void; // NOVO: Para bypass de desenvolvimento
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

    const fetchUserRole = async (userId: string) => {
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
            setIsProfileLoading(false);
        }
    };

    // NOVO: Bypass de desenvolvimento - Protegido contra produção
    const setDevBypass = (email: string) => {
        // Bloqueio rigoroso em produção
        if (import.meta.env.PROD) {
            console.error('❌ SEGURANÇA: Dev Bypass bloqueado em produção.');
            return;
        }

        const fakeUser: any = {
            id: 'dev-bypass-user',
            email: email,
            app_metadata: {},
            user_metadata: {},
            aud: 'authenticated',
            created_at: new Date().toISOString()
        };

        setUser(fakeUser);
        setUserRole('super_admin');
        setIsLoading(false);
    };

    useEffect(() => {
        // Safety timeout to prevent infinite loading
        const safetyTimeout = setTimeout(() => {
            if (isLoading) {
                console.warn('⚠️ [AUTH] Loading state trapped for 5s. Forcing ready.');
                setIsLoading(false);
            }
        }, 5000);

        return () => clearTimeout(safetyTimeout);
    }, [user, isLoading, userRole]);

    useEffect(() => {
        if (window.location.hash.includes('type=recovery') ||
            window.location.hash.includes('access_token=') ||
            window.location.pathname === '/reset-password') {
            setIsRecoveringPassword(true);
        }

        // Safe Session Initialization
        const initSession = async () => {
            try {
                const { data: { session }, error } = await supabase.auth.getSession();
                if (error) {
                    console.warn('⚠️ [AUTH] Initial session check failed:', error.message);
                    // Force clean state if session check fails
                    if (error.message.includes('Invalid Refresh Token')) {
                        localStorage.removeItem('sb-eqspbruarsdybpfeijnf-auth-token');
                    }
                    return;
                }
                if (session) {
                    setSession(session);
                    setUser(session.user);
                    // fetchUserRole will be triggered by the listener
                }
            } catch (err) {
                console.error('⚠️ [AUTH] Unexpected initialization error:', err);
            } finally {
                setIsLoading(false); // Ensure we stop loading even on error
            }
        };

        initSession();

        let mounted = true;

        // Listen for auth changes - Supabase handles sync/initial check via INITIAL_SESSION event
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
            if (!mounted) return;

            // Sincronizar estados basicos imediatamente
            setSession(session);
            setUser(session?.user ?? null);

            // Resiliência contra loop de carregamento
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

            // Lógica de perfil para qualquer evento que traga um usuário
            if (session?.user && (_event === 'SIGNED_IN' || _event === 'USER_UPDATED' || _event === 'INITIAL_SESSION' || _event === 'TOKEN_REFRESHED')) {
                setIsProfileLoading(true);
                // Não dar await aqui para não bloquear o loop de eventos do Supabase
                fetchUserRole(session.user.id);
            }

            if (_event === 'PASSWORD_RECOVERY') {
                setIsRecoveringPassword(true);

                if (window.location.pathname !== '/reset-password') {
                    navigate('/reset-password', { replace: true });
                }
            }

            // Garantir que carregamento inicial termine
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
                    emailRedirectTo: window.location.origin + '/dashboard',
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

    const signUp = async (email: string, password: string) => {
        try {
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
            });
            if (error) throw error;
            return { error: null };
        } catch (error: any) {
            console.error("Signup error:", error.message);
            return { error };
        }
    };

    const resetPassword = async (email: string) => {
        try {
            // Usar o origin atual em vez de localhost fixo
            const redirectUrl = window.location.origin + '/reset-password';

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
            signOut,
            setDevBypass
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
