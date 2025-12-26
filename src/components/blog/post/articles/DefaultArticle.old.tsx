import { ArrowRight, BarChart3, BookOpen, CheckCircle2, LineChart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';

interface DefaultArticleProps {
  category: string;
  authorName: string;
  authorRole: string;
  getFrameworkImage: (category: string) => string;
  slug?: string;
  getArticleImageBySlug: (slug: string) => string;
}

const DefaultArticle = ({
  category,
  authorName,
  authorRole,
  getFrameworkImage,
  slug,
  getArticleImageBySlug
}: DefaultArticleProps) => {
  const articleImage = slug ? getArticleImageBySlug(slug) : getFrameworkImage(category);
  const displayCategory = category || 'Estratégia';

  return (
    <article className="w-full">
      {/* Header Escuro (Hero Style) */}
      <header className="bg-black text-white p-8 md:p-12 rounded-2xl mb-8 border border-white/10 relative overflow-hidden">
        <div className="relative z-10">
          <div className="mb-6 inline-flex items-center">
            <span className="px-3 py-1 rounded-full bg-white/10 border border-white/20 text-xs font-semibold tracking-wider text-revgreen uppercase backdrop-blur-md">
              {displayCategory}
            </span>
          </div>

          <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-[1.1] tracking-tight">
            Dominando {displayCategory} para Crescimento B2B
          </h1>

          <p className="text-xl md:text-2xl text-gray-400 leading-relaxed font-medium max-w-3xl">
            Esta é uma análise aprofundada sobre estratégias de {displayCategory} para empresas que buscam escala previsível e sustentável.
          </p>
        </div>

        {/* Decorative Background Element */}
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-revgreen/20 rounded-full blur-[100px] pointer-events-none"></div>
      </header>

      {/* Conteúdo no Card Branco */}
      <section className="bg-white text-gray-900 p-8 md:p-12 rounded-2xl shadow-sm border border-gray-100">
        <h2 id="introducao" className="text-3xl font-bold mb-8 text-gray-900 tracking-tight">
          Introdução ao {displayCategory}
        </h2>

        <div className="prose prose-lg max-w-none text-gray-600 mb-12">
          <p>
            No dinâmico cenário de negócios B2B atual, estratégias baseadas em dados e tecnologia
            têm se provado essenciais para empresas que buscam crescimento sustentável. Este artigo
            mergulha nos conceitos fundamentais e aplicações práticas que podem transformar resultados.
          </p>
        </div>

        <div className="not-prose my-10 p-8 bg-gray-50 rounded-xl border border-gray-200">
          <h3 className="text-xl font-bold mb-4 flex items-center text-gray-900">
            <BookOpen className="mr-3 text-black" size={24} />
            Definição de {displayCategory}
          </h3>
          <p className="text-gray-700 text-lg leading-relaxed">
            {displayCategory === "RevOps" && "Revenue Operations (RevOps) é uma abordagem estratégica que alinha equipes de marketing, vendas e sucesso do cliente sob uma visão unificada do funil de receita."}
            {displayCategory === "Account Based Marketing" && "ABM é uma estratégia focada que trata contas específicas como mercados individuais, criando campanhas altamente personalizadas."}
            {displayCategory === "PLG" && "Product-Led Growth (PLG) coloca o produto como o principal motor de aquisição, conversão e retenção."}
            {displayCategory !== "RevOps" && displayCategory !== "Account Based Marketing" && displayCategory !== "PLG" &&
              `${displayCategory} envolve a aplicação estratégica de processos e tecnologia para maximizar a eficiência e o impacto das operações comerciais.`}
          </p>
        </div>

        <figure className="my-12">
          <img src={articleImage} alt={`Framework de ${displayCategory}`} className="w-full h-auto rounded-xl shadow-lg border border-gray-100" />
          <figcaption className="text-center text-sm text-gray-500 mt-4 font-medium">
            Framework visual de implementação de {displayCategory}
          </figcaption>
        </figure>

        <h2 id="componentes" className="text-3xl font-bold mb-8 text-gray-900 tracking-tight">
          Componentes Estratégicos
        </h2>

        <p className="text-gray-600 mb-8 text-lg leading-relaxed">
          A implementação eficaz requer uma abordagem sistemática. Nossos especialistas desenvolveram um framework que simplifica esse processo:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 not-prose my-12">
          <Card className="border border-gray-200 bg-white hover:shadow-md transition-shadow">
            <CardContent className="pt-8">
              <h3 className="text-xl font-bold mb-4 flex items-center text-gray-900">
                <LineChart className="mr-3 text-black" size={24} />
                Diagnóstico
              </h3>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <CheckCircle2 className="h-5 w-5 text-revgreen mr-3 flex-shrink-0 mt-1" />
                  <span className="text-gray-700">Mapeamento do funil atual</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle2 className="h-5 w-5 text-revgreen mr-3 flex-shrink-0 mt-1" />
                  <span className="text-gray-700">Identificação de gargalos</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle2 className="h-5 w-5 text-revgreen mr-3 flex-shrink-0 mt-1" />
                  <span className="text-gray-700">Análise de dados históricos</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border border-gray-200 bg-white hover:shadow-md transition-shadow">
            <CardContent className="pt-8">
              <h3 className="text-xl font-bold mb-4 flex items-center text-gray-900">
                <BarChart3 className="mr-3 text-black" size={24} />
                Execução
              </h3>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <CheckCircle2 className="h-5 w-5 text-revgreen mr-3 flex-shrink-0 mt-1" />
                  <span className="text-gray-700">Testes A/B controlados</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle2 className="h-5 w-5 text-revgreen mr-3 flex-shrink-0 mt-1" />
                  <span className="text-gray-700">Implementação de ferramentas</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle2 className="h-5 w-5 text-revgreen mr-3 flex-shrink-0 mt-1" />
                  <span className="text-gray-700">Monitoramento de KPIs</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>

        <blockquote className="my-12 border-l-4 border-revgreen pl-6 italic text-xl text-gray-800 bg-gray-50 py-4 pr-4 rounded-r-lg">
          <p className="mb-2">"A verdadeira transformação acontece quando combinamos dados, tecnologia e processos em uma estratégia coerente."</p>
          <cite className="block text-sm font-bold text-gray-500 not-italic uppercase tracking-wide">— {authorName}, {authorRole}</cite>
        </blockquote>

        <h2 id="conclusao" className="text-3xl font-bold mb-6 text-gray-900 tracking-tight">Conclusão</h2>

        <p className="text-gray-600 mb-12 text-lg leading-relaxed">
          Empresas que dominam estratégias de {displayCategory} posicionam-se como líderes, construindo vantagens competitivas sustentáveis através de eficiência operacional e inteligência de mercado.
        </p>

        <div className="not-prose bg-black text-white p-10 rounded-2xl relative overflow-hidden">
          <div className="relative z-10">
            <h3 className="text-2xl font-bold mb-4">Pronto para escalar com {displayCategory}?</h3>
            <p className="mb-8 text-gray-300 max-w-xl">
              Agende um diagnóstico gratuito com nossos especialistas e receba um plano de ação personalizado para o seu negócio.
            </p>
            <Button asChild size="lg" className="bg-revgreen text-black hover:bg-revgreen/90 font-bold px-8">
              <Link to="/diagnostico" className="flex items-center">
                Solicitar Diagnóstico
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
          <div className="absolute top-0 right-0 w-64 h-64 bg-revgreen/10 rounded-full blur-[80px] pointer-events-none"></div>
        </div>

      </section>
    </article>
  );
};

export default DefaultArticle;