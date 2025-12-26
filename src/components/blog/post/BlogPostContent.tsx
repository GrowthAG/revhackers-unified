

// File updated to optimize reading flow and fix component mapping
import PolemicLedGrowthArticle from './articles/PolemicLedGrowthArticle';
import ChatGPTGrowthArticle from './articles/ChatGPTGrowthArticle';
import ColdEmailArticle from './articles/ColdEmailArticle';
import LTVCACArticle from './articles/LTVCACArticle';
import ProductMarketFitArticle from './articles/ProductMarketFitArticle';
import LinkedInNavigatorArticle from './articles/LinkedInNavigatorArticle';

import DiagnosticoFunilArticle from './articles/DiagnosticoFunilArticle';
import PLGStartupsArticle from './articles/PLGStartupsArticle';
import CROPraticaArticle from './articles/CROPraticaArticle';
import AutomacaoMarketingArticle from './articles/AutomacaoMarketingArticle';
import FunilAquisicaoProdutoArticle from './articles/FunilAquisicaoProdutoArticle';
import IAPreVendasArticle from './articles/IAPreVendasArticle';
import DiagnosticoMarketingDataArticle from './articles/DiagnosticoMarketingDataArticle';
import PlaybooksVendasMarketingArticle from './articles/PlaybooksVendasMarketingArticle';
import TrinityGrowthArticle from './articles/TrinityGrowthArticle';
import CanaisAquisicaoStartupArticle from './articles/CanaisAquisicaoStartupArticle';
import GrowthTeamLeanArticle from './articles/GrowthTeamLeanArticle';
import FounderMetricsArticle from './articles/FounderMetricsArticle';
import BestCRMsAutomationArticle from './articles/BestCRMsAutomationArticle';
import SaaSTrialPipelineArticle from './articles/SaaSTrialPipelineArticle';
import UserJourneyMapArticle from './articles/UserJourneyMapArticle';
import IntegracaoMktVendasArticle from './articles/IntegracaoMktVendasArticle';
import EstrategiaGTMArticle from './articles/EstrategiaGTMArticle';
import AnatomiaDaDemoArticle from './articles/AnatomiaDaDemoArticle';
import RevOpsFrameworkArticle from './articles/RevOpsFrameworkArticle';
import PricingStrategyArticle from './articles/PricingStrategyArticle';
import SalesCommissionArticle from './articles/SalesCommissionArticle';
import AntiChurnPlaybookArticle from './articles/AntiChurnPlaybookArticle';
import SaaSPLGArticle from './articles/SaaSPLGArticle';

// New Articles
import IAGenerativaMarketingArticle from './articles/IAGenerativaMarketingArticle';
import Diagnostico360Article from './articles/Diagnostico360Article';
import ABMPracticeArticle from './articles/ABMPracticeArticle';
import DiagnosticoFunilComercialArticle from './articles/DiagnosticoFunilComercialArticle';

import DynamicV2Renderer from './DynamicV2Renderer';

interface BlogPostContentProps {
  content: string;
  category: string;
  authorName: string;
  authorRole: string;
  authorAvatar: string;
  slug?: string;
  onCTAClick?: () => void;
}

interface ArticleComponentProps {
  onCTAClick?: () => void;
}

const BlogPostContent = ({ content, category, authorName, authorRole, authorAvatar, slug, onCTAClick }: BlogPostContentProps) => {
  // Use slug as secondary key if content is generic or empty
  const articleSlug = slug || '';

  // Try to parse content as Dynamic V2 JSON
  let dynamicV2Config = null;
  if (content && content.trim().startsWith('{')) {
    try {
      const parsed = JSON.parse(content);
      if (parsed.v2_template === true) {
        dynamicV2Config = parsed;
      }
    } catch (e) {
      // Not a valid JSON or not V2, ignore and render as normal
    }
  }
  // Map of custom article components
  const articleComponents: Record<string, React.ComponentType<ArticleComponentProps>> = {
    'polemic-led-growth-metodo-linkedin-maquina-oportunidades': PolemicLedGrowthArticle,
    'chatgpt-para-growth-15-prompts-produtividade-marketing': ChatGPTGrowthArticle,
    'cold-email-2025-7-estrategias-que-funcionam': ColdEmailArticle,
    'ltv-vs-cac-calcular-otimizar-crescimento-sustentavel': LTVCACArticle,
    'product-market-fit-5-sinais-encontrou-3-que-nao': ProductMarketFitArticle,
    'linkedin-sales-navigator-guia-completo-prospeccao-b2b': LinkedInNavigatorArticle,
    'o-funil-que-realmente-funciona-para-empresas-b2b': DiagnosticoFunilArticle,
    'o-que-e-plg-e-como-aplicar-em-startups-brasileiras': PLGStartupsArticle,
    'cro-na-pratica-como-dobrar-sua-taxa-de-conversao': CROPraticaArticle,
    '7-automacoes-de-marketing-que-escalam-sua-operacao': AutomacaoMarketingArticle,
    'como-construir-um-funil-de-aquisicao-usando-seu-proprio-produto': FunilAquisicaoProdutoArticle,
    'estrategias-de-inteligencia-artificial-aplicadas-a-pre-vendas': IAPreVendasArticle,
    'diagnostico-de-marketing-orientado-por-dados': DiagnosticoMarketingDataArticle,
    'playbooks-de-vendas-e-marketing-que-escalam-resultados': PlaybooksVendasMarketingArticle,
    'como-combinar-inbound-outbound-e-plg': TrinityGrowthArticle,
    'canais-de-aquisicao-com-roi-imediato-para-startups': CanaisAquisicaoStartupArticle,
    'como-estruturar-um-time-de-growth-com-poucos-recursos': GrowthTeamLeanArticle,
    'analise-de-dados-para-fundadores-quais-metricas-importam': FounderMetricsArticle,
    'os-melhores-crms-e-automacoes-para-crescimento-b2b': BestCRMsAutomationArticle,
    'saas-trial-pipeline-optimization': SaaSTrialPipelineArticle,
    'como-desenhar-uma-jornada-do-usuario-que-ativa-e-converte': UserJourneyMapArticle,
    'integracao-marketing-vendas-sucesso-cliente': IntegracaoMktVendasArticle,
    'estrategia-gtm-go-to-market-para-novos-produtos': EstrategiaGTMArticle,
    'anatomia-da-demo-perfeita-vendas-b2b': AnatomiaDaDemoArticle,
    'revops-framework-definitivo-revenue-operations': RevOpsFrameworkArticle,
    'psicologia-pricing-b2b-estrategia-precos': PricingStrategyArticle,
    'comissionamento-vendas-sdr-closer-modelos': SalesCommissionArticle,
    'manual-anti-churn-retencao-clientes-cs': AntiChurnPlaybookArticle,
    'saas-plg-como-usar-seu-trial-gratuito-para-gerar-pipeline': SaaSPLGArticle,

    // New Mappings
    'ia-generativa-marketing-alem-do-hype': IAGenerativaMarketingArticle,
    'diagnostico-360-descobrir-gargalos-funil': Diagnostico360Article,
    'abm-na-pratica-escolher-contas-alvo': ABMPracticeArticle,
    'diagnostico-funil-comercial-identificar-gargalos': DiagnosticoFunilComercialArticle
  };

  const CustomArticleComponent = articleSlug ? articleComponents[articleSlug] : null;
  const isCustomRender = content === "Conteúdo renderizado via componente customizado";

  // Fix author avatar path
  const getFixedAuthorAvatar = (path: string) => {
    if (!path) return "/lovable-uploads/0cf4734e-5153-4c6e-8f33-4b382577e479.png";
    if (path.startsWith('http') || path.startsWith('/')) return path;
    return `/lovable-uploads/${path}`;
  };

  const fixedAvatar = getFixedAuthorAvatar(authorAvatar);

  return (
    <div className="bg-white text-gray-900">
      {dynamicV2Config ? (
        <DynamicV2Renderer config={dynamicV2Config} onCTAClick={onCTAClick} />
      ) : CustomArticleComponent ? (
        <CustomArticleComponent onCTAClick={onCTAClick} />
      ) : (
        <div
          className="prose prose-lg max-w-none text-gray-900 [&_h1]:hidden"
          dangerouslySetInnerHTML={{ __html: isCustomRender ? "Este artigo está sendo carregado..." : content }}
        />
      )}

      {/* Author Details Footer */}
      <div className="mt-20 pt-10 border-t border-gray-100 flex flex-col items-center text-center">
        <div className="relative mb-4">
          <div className="absolute -inset-1 bg-gradient-to-r from-revgreen to-emerald-400 rounded-full opacity-70 blur-sm animate-pulse"></div>
          <img
            src={fixedAvatar}
            alt={authorName}
            className="relative w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg"
          />
        </div>
        <h4 className="text-xl font-bold text-gray-900 mb-1">{authorName}</h4>
        <p className="text-revgreen font-medium uppercase tracking-widest text-xs">{authorRole}</p>
        <p className="max-w-md mt-4 text-gray-500 text-sm italic">
          Fundador da RevHackers. Especialista em estratégias de Revenue Operations e Growth B2B para empresas de tecnologia.
        </p>
      </div>
    </div>
  );
};

export default BlogPostContent;
