
import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import PageLayout from '@/components/layout/PageLayout';

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <PageLayout>
      <div className="min-h-[70vh] flex flex-col items-center justify-center py-20">
        <div className="text-center max-w-2xl mx-auto px-4">
          <h1 className="text-5xl md:text-6xl font-bold mb-4">404</h1>
          <p className="text-xl md:text-2xl text-gray-600 mb-8">
            Oops! Página não encontrada
          </p>
          <p className="text-gray-500 mb-8">
            A página que você está procurando foi movida, removida, renomeada ou talvez nunca tenha existido.
          </p>
          <Button asChild className="btn-primary">
            <Link to="/">
              Voltar para Home
            </Link>
          </Button>
        </div>
      </div>
    </PageLayout>
  );
};

export default NotFound;
