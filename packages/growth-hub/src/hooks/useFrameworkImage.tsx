
import { getFrameworkImage, getArticleImageBySlug } from '../components/blog/post/articles/utils/frameworkImages';

// Hook para unificar o acesso às funções de imagem em toda a aplicação
const useFrameworkImage = () => {
  // Retorna as funções utilitárias para serem utilizadas nos componentes
  return { 
    getFrameworkImage,
    getArticleImageBySlug 
  };
};

export default useFrameworkImage;
