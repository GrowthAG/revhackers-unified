import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from 'lucide-react';
import PageLayout from '../layout/PageLayout';

interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminLayout = ({ children }: AdminLayoutProps) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        navigate('/login');
        return;
      }

      // Check Profile Role
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', session.user.id)
        .single();

      if (error || !profile || (profile.role !== 'super_admin' && profile.role !== 'user')) {
        console.error("Access denied or profile not found");
        navigate('/');
        return;
      }

      setIsAuthorized(true);
      setLoading(false);
    };

    checkAuth();
  }, [navigate]);

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-white">
        <Loader2 className="h-10 w-10 animate-spin text-revgreen" />
      </div>
    );
  }

  if (!isAuthorized) return null;

  return (
    <PageLayout>
      <div className="bg-white min-h-screen py-12">
        <div className="container-custom">
          {children}
        </div>
      </div>
    </PageLayout>
  );
};

export default AdminLayout;
