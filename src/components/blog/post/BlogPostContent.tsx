

import { useNavigate } from 'react-router-dom';
import ArticleCTA from './components/ArticleCTA';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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
import { ArticleRenderer } from '../ArticleRenderer';

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
  const navigate = useNavigate();
  const articleSlug = slug || '';

  // Contextual Dynamic CTA Logic
  const lowerCategory = (category || '').toLowerCase();
  let ctaTitle = "Pronto para o próximo nível?";
  let ctaDesc = "A RevHackers ajuda empresas de tecnologia a estruturarem playbooks de crescimento previsível.";
  let ctaBtnText = "Agendar Diagnóstico";
  let ctaAction = onCTAClick;

  if (lowerCategory.includes('vendas') || lowerCategory.includes('comercial') || lowerCategory.includes('crm')) {
    ctaTitle = "Gargalos no seu Funil de Vendas?";
    ctaDesc = "Descubra exatamente onde você está perdendo negócios. Faça o diagnóstico comercial focado em Receita.";
    ctaBtnText = "Iniciar Revenue Score";
    ctaAction = () => navigate('/score-revenue');
  } else if (lowerCategory.includes('marketing') || lowerCategory.includes('seo') || lowerCategory.includes('conteúdo') || lowerCategory.includes('midia')) {
    ctaTitle = "Sua máquina de Marketing está tracionando?";
    ctaDesc = "Avalie a performance dos seus canais de aquisição e descubra como dobrar seus leads qualificados.";
    ctaBtnText = "Iniciar Marketing Score";
    ctaAction = () => navigate('/score-site');
  } else if (lowerCategory.includes('founder') || lowerCategory.includes('startups') || lowerCategory.includes('liderança') || lowerCategory.includes('plg')) {
    ctaTitle = "Qual o próximo gargalo da sua operação?";
    ctaDesc = "Faça o assessment exclusivo para Founders B2B e descubra onde focar sua energia para escalar.";
    ctaBtnText = "Iniciar Founder Score";
    ctaAction = () => navigate('/score-founder');
  } else {
    ctaTitle = "Sua operação B2B está pronta para escalar?";
    ctaDesc = "Faça o diagnóstico 360º de Growth e descubra os vazamentos que estão limitando seu crescimento.";
    ctaBtnText = "Iniciar Growth Score";
    ctaAction = () => navigate('/score');
  }

  // Try to parse content as Dynamic V2 JSON (Keep for legacy support or special grids)
  let dynamicV2Config = null;
  if (content && content.trim().startsWith('{')) {
    try {
      const parsed = JSON.parse(content);
      if (parsed.v2_template === true) {
        dynamicV2Config = parsed;
      }
    } catch (e) { }
  }

  // Map of custom article components (Keep for specific deep-coded articles)
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
    'ia-generativa-marketing-alem-do-hype': IAGenerativaMarketingArticle,
    'diagnostico-360-descobrir-gargalos-funil': Diagnostico360Article,
    'abm-na-pratica-escolher-contas-alvo': ABMPracticeArticle,
    'diagnostico-funil-comercial-identificar-gargalos': DiagnosticoFunilComercialArticle
  };

  const CustomArticleComponent = articleSlug ? articleComponents[articleSlug] : null;

  const getFixedAuthorAvatar = (path: string) => {
    if (!path) return "/uploads/0cf4734e-5153-4c6e-8f33-4b382577e479.png";
    if (path.startsWith('http') || path.startsWith('/')) return path;
    return `/uploads/${path}`;
  };

  const fixedAvatar = getFixedAuthorAvatar(authorAvatar);

  return (
    <article className="bg-white text-gray-900 overflow-hidden antialiased">
      <div className="max-w-4xl mx-auto">
        {dynamicV2Config ? (
          <DynamicV2Renderer config={dynamicV2Config} onCTAClick={onCTAClick} />
        ) : CustomArticleComponent ? (
          <CustomArticleComponent onCTAClick={onCTAClick} />
        ) : (
          <div className="space-y-6">
            {/* Use ArticleRenderer for clean, standardized article formatting */}
            <ArticleRenderer content={content} />

            {/* Contextual CTA */}
            <ArticleCTA 
              title={ctaTitle}
              description={ctaDesc}
              primaryBtnText={ctaBtnText}
              onPrimaryClick={ctaAction}
            />
          </div>
        )}

        {/* Author Footer - Fixed Visuals */}
        <div className="mt-32 pt-16 border-t border-zinc-100 flex flex-col md:flex-row items-center md:items-start gap-8 bg-zinc-50/50 p-8 rounded-2xl">
          <img
              src={fixedAvatar}
              alt={authorName}
              loading="lazy"
              className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-xl"
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/uploads/0cf4734e-5153-4c6e-8f33-4b382577e479.png';
              }}
            />

          <div className="flex-1 text-center md:text-left">
            <h4 className="text-2xl font-black text-black tracking-tighter mb-1 uppercase italic">{authorName}</h4>
            <p className="text-revgreen font-bold uppercase tracking-[0.3em] text-[10px] mb-4">{authorRole}</p>
            <p className="text-zinc-500 text-sm leading-relaxed font-medium uppercase tracking-wider opacity-80">
              Especialista Sênior em Growth e Estratégia de Receita. Focado em transformar operações complexas em máquinas de crescimento previsíveis e escaláveis.
            </p>
          </div>
        </div>
      </div>
    </article>
  );
};

export default BlogPostContent;
