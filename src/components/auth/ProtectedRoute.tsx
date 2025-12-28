
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
    children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
    const { user, isLoading, isProfileLoading, isRecoveringPassword } = useAuth();
    const location = useLocation();

    console.log('🛡️ ProtectedRoute Check:', {
        path: location.pathname,
        isLoading,
        isProfileLoading,
        hasUser: !!user,
        isRecoveringPassword
    });

    if (isLoading || (user && isProfileLoading)) {
        console.log('⏳ ProtectedRoute: Carregando (Auth ou Perfil)...');
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <Loader2 className="w-10 h-10 text-revgreen animate-spin" />
            </div>
        );
    }

    // Se estiver em recuperação, não redirecionar para login (o AuthContext cuidará do roteamento para /reset-password)
    if (isRecoveringPassword && location.pathname !== '/reset-password') {
        console.log('🔑 ProtectedRoute: Fluxo de recuperação ativo. Silenciando redirecionamento.');
        return null; // Ou manter o loader
    }

    if (!user) {
        console.log('🚫 ProtectedRoute: Sem usuário, redirecionando para login');
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    console.log('✅ ProtectedRoute: Usuário autenticado, permitindo acesso');
    return <>{children}</>;
};

export default ProtectedRoute;
