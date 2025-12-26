import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Session, User } from '@supabase/supabase-js';
import { useToast } from '@/components/ui/use-toast';

interface AuthContextType {
    session: Session | null;
    user: User | null;
    userProfile: any | null;
    userRole: "super_admin" | "admin" | "user" | null;
    isLoading: boolean;
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
    const { toast } = useToast();

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
            setIsLoading(false);
        }
    };

    // NOVO: Bypass de desenvolvimento
    const setDevBypass = (email: string) => {
        const fakeUser: any = {
            id: 'dev-bypass-user',
            email: email,
            app_metadata: {},
            user_metadata: {},
            aud: 'authenticated',
            created_at: new Date().toISOString()
        };

        console.log('🔓 DEV BYPASS ATIVADO:', email);
        setUser(fakeUser);
        setUserRole('super_admin');
        setIsLoading(false);
    };

    useEffect(() => {
        console.log('🔐 Auth State Changed:', {
            hasUser: !!user,
            userEmail: user?.email,
            isLoading,
            userRole
        });
    }, [user, isLoading, userRole]);

    useEffect(() => {
        console.log('🚀 AuthProvider: Initializing...');

        // Get initial session
        supabase.auth.getSession().then(({ data: { session } }) => {
            console.log('📦 Initial Session:', session ? 'Found' : 'Not found');
            setSession(session);
            setUser(session?.user ?? null);

            if (session?.user) {
                fetchUserRole(session.user.id);
            } else {
                setIsLoading(false);
            }
        });

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
            console.log('🔄 Auth State Change Event:', _event, session ? 'Session exists' : 'No session');

            // CORREÇÃO DEFINITIVA: Não processar INITIAL_SESSION se não há sessão
            // Isso previne limpar o estado quando o usuário já está logado
            if (_event === 'INITIAL_SESSION' && !session) {
                console.log('⚠️ Ignorando INITIAL_SESSION sem sessão');
                setIsLoading(false);
                return;
            }

            if (_event === 'PASSWORD_RECOVERY') {
                window.location.href = '/reset-password';
                return;
            }

            // Só atualizar estado se houver mudança real
            if (_event !== 'INITIAL_SESSION' || session) {
                setSession(session);
                setUser(session?.user ?? null);

                if (session?.user) {
                    await fetchUserRole(session.user.id);
                } else {
                    setUserProfile(null);
                    setUserRole(null);
                    setIsLoading(false);
                }
            }
        });

        return () => subscription.unsubscribe();
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
            // Use localhost em desenvolvimento, produção em prod
            const redirectUrl = window.location.hostname === 'localhost'
                ? 'http://localhost:8080/reset-password'
                : `${window.location.origin}/reset-password`;

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
            const { error } = await supabase.auth.updateUser({
                password,
            });
            if (error) throw error;
            return { error: null };
        } catch (error: any) {
            console.error("Update password error:", error.message);
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
