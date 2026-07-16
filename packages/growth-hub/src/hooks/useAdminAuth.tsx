
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * Hook para gerenciar autenticação do administrador
 */
export const useAdminAuth = (redirectTo = '/admin') => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Verificar se o usuário está autenticado
    const checkAuth = () => {
      const authData = localStorage.getItem('blogCmsAuth');
      
      if (!authData) {
        setIsAuthenticated(false);
        setIsLoading(false);
        navigate(redirectTo);
        return;
      }
      
      try {
        const { isAuthenticated: auth, timestamp } = JSON.parse(authData);
        const now = Date.now();
        const fourHoursInMs = 4 * 60 * 60 * 1000;
        
        // Expirar a sessão após 4 horas
        if (auth && now - timestamp < fourHoursInMs) {
          setIsAuthenticated(true);
        } else {
          // Sessão expirada
          localStorage.removeItem('blogCmsAuth');
          setIsAuthenticated(false);
          navigate(redirectTo);
        }
      } catch (error) {
        console.error('Erro ao verificar autenticação:', error);
        localStorage.removeItem('blogCmsAuth');
        setIsAuthenticated(false);
        navigate(redirectTo);
      }
      
      setIsLoading(false);
    };
    
    checkAuth();
  }, [navigate, redirectTo]);

  const logout = () => {
    localStorage.removeItem('blogCmsAuth');
    setIsAuthenticated(false);
    navigate('/admin');
  };

  return { isAuthenticated, isLoading, logout };
};
