
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
    children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
    const { user, userRole, isLoading, isProfileLoading, isRecoveringPassword } = useAuth();
    const location = useLocation();

    if (isLoading || (user && isProfileLoading)) {
        return (
            <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center">
                <div className="w-10 h-10 border-2 border-zinc-800 border-t-revgreen rounded-full animate-spin"></div>
            </div>
        );
    }

    // Se estiver em recuperação, não redirecionar para login (o AuthContext cuidará do roteamento para /reset-password)
    if (isRecoveringPassword && location.pathname !== '/reset-password') {
        return null;
    }

    if (!user) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    if (userRole === 'user') {
        // Apenas roles admin/super_admin acessam /admin.
        // Qualquer 'user' sem role elevado vai para o Hub do cliente.
        return <Navigate to="/login" replace />;
    }

    return <>{children}</>;
};

export default ProtectedRoute;
