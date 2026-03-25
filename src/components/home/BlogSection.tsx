
import { useState, useEffect } from 'react';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { getArticleImageBySlug } from '../blog/post/articles/utils/frameworkImages';
import { getAllPosts } from '@/api/posts';

// Interface para post do blog
interface BlogPost {
  id: number | string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  date: string;
  readTime: string;
  image: string;
  category: string;
  author: {
    name: string;
    role: string;
    avatar: string;
  };
}

const BlogSection = () => {
  const [featuredArticles, setFeaturedArticles] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const posts = await getAllPosts();

        // Ordenar posts por data (mais recentes primeiro) e pegar os primeiros 4
        const sortedPosts = [...posts].sort((a, b) =>
          new Date(b.date).getTime() - new Date(a.date).getTime()
        ).slice(0, 4);

        setFeaturedArticles(sortedPosts);
      } catch (error) {
        console.error("Erro ao carregar artigos do blog:", error);
        setFeaturedArticles([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  // Limpar HTML do título
  const cleanTitle = (htmlTitle: string) => {
    const div = document.createElement('div');
    div.innerHTML = htmlTitle;
    return div.textContent || div.innerText || '';
  };

  // Limpar HTML do excerpt
  const cleanExcerpt = (htmlExcerpt: string) => {
    const div = document.createElement('div');
    div.innerHTML = htmlExcerpt;
    return div.textContent || div.innerText || '';
  };

  return (
    <section className="section-padding bg-white">
      <div className="container-custom">
        <div className="flex flex-col md:flex-row justify-between items-start mb-16">
          <div className="max-w-lg mb-8 md:mb-0">
            <h2 className="text-3xl md:text-4xl font-black mb-4">
              Blog RevHackers
            </h2>
            <p className="text-lg text-zinc-600">
              Conteúdo estratégico e especializado sobre crescimento, tecnologia e dados para empresas B2B.
            </p>
          </div>

          <Button
            variant="link"
            asChild
            className="text-base"
          >
            <Link
              to="/blog"
              className="inline-flex items-center text-revgreen hover:text-black font-medium group"
            >
              Ver todos os artigos
              <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </Button>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="rounded-full border-4 border-zinc-200 border-t-revgreen animate-spin h-12 w-12"></div>
          </div>
        ) : featuredArticles.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-zinc-500">Nenhum artigo disponível no momento.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {featuredArticles.map((article) => {
              // Obter imagem personalizada se disponível para este artigo
              const articleImage = getArticleImageBySlug(article.slug) || article.image;
              const title = cleanTitle(article.title);
              const excerpt = cleanExcerpt(article.excerpt);

              return (
                <Link to={`/blog/${article.slug}`} key={article.id} className="group block h-full">
                  <Card className="overflow-hidden card-hover h-full border-0 shadow-sm transition-all duration-300">
                    <div className="h-48 overflow-hidden relative">
                      <img
                        src={articleImage}
                        alt={title}
                        className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-500"
                      />
                      <div className="absolute top-3 left-3">
                        <span className="text-[10px] uppercase tracking-widest bg-white/90 backdrop-blur-sm px-3 py-1 text-black font-bold border border-black/10 rounded-sm">
                          {article.category}
                        </span>
                      </div>
                    </div>
                    <CardContent className="p-6">
                      <h3 className="text-xl font-bold mb-2 line-clamp-2 group-hover:text-revgreen transition-colors">
                        {title}
                      </h3>
                      <p className="text-zinc-600 mb-4 line-clamp-2">
                        {excerpt}
                      </p>

                      <div className="flex items-center justify-between mt-4">
                        <div className="flex items-center space-x-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={article.author.avatar} alt={article.author.name} />
                            <AvatarFallback>{article.author.name.substring(0, 2)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-sm font-medium">{article.author.name}</p>
                            <p className="text-xs text-zinc-500">{article.author.role}</p>
                          </div>
                        </div>
                        <span className="text-revgreen opacity-0 group-hover:opacity-100 transition-opacity">
                          <ArrowRight className="h-4 w-4" />
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};

export default BlogSection;
