
// Utility function to get framework image based on category
// Updated to use the new 3D minimalist glassmorphism icons

const frameworkImages: Record<string, string[]> = {
  "RevOps": ["/images/blog-v2/blog_revops_core.png"],
  "ABM": ["/images/blog-v2/blog_abm_practical.png"],
  "PLG": ["/images/blog-v2/blog_plg_startups.png"],
  "Estratégia": ["/images/blog-v2/blog_gtm_strategy.png"],
  "Defaults": ["/images/blog-v2/blog_efficient_funnel.png"]
};

// Helper: Deterministic hash from string
const getHash = (str: string) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash);
};

export const getFrameworkImage = (category: string, slug?: string): string => {
  // Normalize category key
  let key = category;
  if (['Account Based Marketing'].includes(category)) key = "ABM";
  if (['Strategy', 'Management'].includes(category)) key = "Estratégia";
  if (['Growth', 'Geração de Demanda', 'Vendas', 'Automação', 'CRO', 'Dados', 'CS', 'Customer Success', 'SaaS', 'Polemic Led Growth'].includes(category)) {
    key = "Defaults";
  }

  const images = frameworkImages[key] || frameworkImages["Defaults"];

  if (!slug) return images[0];

  const index = getHash(slug) % images.length;
  return images[index];
};

// Function to get specific image for article by slug (Prioritized)
export const getArticleImageBySlug = (slug: string): string => {
  // We prefer the image defined in blogData.ts, but keeping this for any dynamic overrides
  const articleImageMap: Record<string, string> = {
    "polemic-led-growth-metodo-linkedin-maquina-oportunidades": "/images/blog-v2/blog_polemic_growth.png",
    "ia-generativa-marketing-alem-do-hype": "/images/blog-v2/blog_ai_marketing.png",
    "estrategia-gtm-go-to-market-para-novos-produtos": "/images/blog-v2/blog_gtm_strategy.png",
    "diagnostico-360-descobrir-gargalos-funil": "/images/blog-v2/blog_diagnostico_360.png",
    "abm-na-pratica-escolher-contas-alvo": "/images/blog-v2/blog_abm_practical.png",
    "diagnostico-funil-comercial-identificar-gargalos": "/images/blog-v2/blog_funil_comercial.png"
  };

  return articleImageMap[slug] || "";
};
