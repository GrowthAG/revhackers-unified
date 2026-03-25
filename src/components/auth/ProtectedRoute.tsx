
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
    children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
    const { user, isLoading, isProfileLoading, isRecoveringPassword } = useAuth();
    const location = useLocation();

    if (isLoading || (user && isProfileLoading)) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <Loader2 className="w-10 h-10 text-revgreen animate-spin" />
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

    return <>{children}</>;
};

export default ProtectedRoute;
