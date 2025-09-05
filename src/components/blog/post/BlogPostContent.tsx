

import DefaultArticle from './articles/DefaultArticle';
import PolemicLedGrowthArticle from './articles/PolemicLedGrowthArticle';
import ChatGPTGrowthArticle from './articles/ChatGPTGrowthArticle';
import ColdEmailArticle from './articles/ColdEmailArticle';
import LTVCACArticle from './articles/LTVCACArticle';
import ProductMarketFitArticle from './articles/ProductMarketFitArticle';
import LinkedInNavigatorArticle from './articles/LinkedInNavigatorArticle';

interface BlogPostContentProps {
  content: string;
  category: string;
  authorName: string;
  authorRole: string;
  authorAvatar: string;
  slug?: string;
}

const BlogPostContent = ({ content, category, authorName, authorRole, authorAvatar, slug }: BlogPostContentProps) => {
  // Map of custom article components
  const articleComponents: Record<string, React.ComponentType> = {
    'polemic-led-growth-metodo-linkedin-maquina-oportunidades': PolemicLedGrowthArticle,
    'chatgpt-para-growth-15-prompts-produtividade-marketing': ChatGPTGrowthArticle,
    'cold-email-2025-7-estrategias-que-funcionam': ColdEmailArticle,
    'ltv-vs-cac-calcular-otimizar-crescimento-sustentavel': LTVCACArticle,
    'product-market-fit-5-sinais-encontrou-3-que-nao': ProductMarketFitArticle,
    'linkedin-sales-navigator-guia-completo-prospeccao-b2b': LinkedInNavigatorArticle
  };

  // Check if there's a custom component for this slug
  const CustomArticleComponent = slug ? articleComponents[slug] : null;

  // If custom component exists, render it instead of default content
  if (CustomArticleComponent) {
    return (
      <div className="prose prose-lg lg:prose-xl max-w-none">
        <CustomArticleComponent />
      </div>
    );
  }

  return (
    <div className="prose prose-lg lg:prose-xl max-w-none">
      {/* Author Card - Start */}
      <div className="not-prose bg-gray-50 p-6 rounded-lg border border-gray-200 mb-8">
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <img src={authorAvatar} alt={authorName} className="w-20 h-20 rounded-full object-cover border-2 border-revgreen" />
          <div className="text-center sm:text-left">
            <h3 className="text-xl font-bold">{authorName}</h3>
            <p className="text-gray-600">{authorRole}</p>
          </div>
        </div>
      </div>
      {/* Author Card - End */}
      
      {/* WordPress Content */}
      <div 
        className="wordpress-content font-body"
        dangerouslySetInnerHTML={{ __html: content }} 
      />
    </div>
  );
};

export default BlogPostContent;

