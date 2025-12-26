
import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import PageLayout from '@/components/layout/PageLayout';
import BlogHeader from '@/components/blog/BlogHeader';
import BlogCard from '@/components/blog/BlogCard';
import { Button } from '@/components/ui/button';
import { Search, Filter, BookOpen } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { getArticleImageBySlug } from '@/components/blog/post/articles/utils/frameworkImages';
import { blogPosts as staticBlogPosts, BlogPost as StaticBlogPost } from '@/data/blogData';

// Interface para post do blog (estendendo a estática)
interface BlogPost extends Omit<StaticBlogPost, 'content' | 'id'> {
  id: string | number;
  content: string;
}

const Blog = () => {
  const [activeCategory, setActiveCategory] = useState('Todos');
  const [searchQuery, setSearchQuery] = useState('');
  const [displayedPosts, setDisplayedPosts] = useState<BlogPost[]>([]);
  const [postsPerPage] = useState(9);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [apiPosts, setApiPosts] = useState<any[]>([]);

  // Fix author avatar path helper
  const getFixedAuthorAvatar = (path?: string | null) => {
    if (!path) return "/lovable-uploads/0cf4734e-5153-4c6e-8f33-4b382577e479.png";
    if (path.startsWith('http') || path.startsWith('/')) return path;
    return `/lovable-uploads/${path}`;
  };

  // Buscar posts do Supabase
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const { data, error } = await supabase
          .from('blog_posts')
          .select('*')
          .eq('published', true)
          .order('date', { ascending: false });

        if (!error && data) {
          setApiPosts(data);
        }
      } catch (err) {
        console.error('Erro ao buscar posts:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPosts();
  }, []);

  // Merge API posts with static posts (memoized)
  const blogPosts = useMemo(() => {
    // Format API posts
    const formattedApiPosts: BlogPost[] = apiPosts.map(post => ({
      id: post.id,
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt || '',
      content: post.content || '',
      category: post.category,
      image: post.image || undefined,
      author: {
        name: post.author_name || 'Equipe RevHackers',
        role: post.author_role || 'Expert Growth',
        avatar: getFixedAuthorAvatar(post.author_avatar)
      },
      date: post.date || post.created_at,
      readTime: post.read_time || '5 min',
      featured: post.featured || false
    }));

    // Format Static posts
    const formattedStaticPosts: BlogPost[] = staticBlogPosts.map(p => ({
      ...p,
      content: p.content || '',
      author: {
        ...p.author,
        avatar: getFixedAuthorAvatar(p.author.avatar)
      }
    }));

    // De-duplicate logic
    const staticSlugs = new Set(formattedStaticPosts.map(p => p.slug));
    const staticTitles = new Set(formattedStaticPosts.map(p => p.title.toLowerCase().trim()));

    const uniqueApiPosts = formattedApiPosts.filter(p => {
      const slugExists = staticSlugs.has(p.slug);
      const titleExists = staticTitles.has(p.title.toLowerCase().trim());
      return !slugExists && !titleExists;
    });

    const allPosts = [...formattedStaticPosts, ...uniqueApiPosts].sort((a, b) =>
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    return allPosts;
  }, [apiPosts]);

  // Filtrar posts com base na categoria e consulta de pesquisa (memoized)
  const filteredPosts = useMemo(() => {
    let filtered = [...blogPosts];

    if (activeCategory !== 'Todos') {
      filtered = filtered.filter(post => post.category === activeCategory);
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(post =>
        post.title.toLowerCase().includes(query) ||
        post.excerpt.toLowerCase().includes(query) ||
        post.category.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [blogPosts, activeCategory, searchQuery]);

  // Atualizar posts exibidos com base na paginação
  useEffect(() => {
    const endIndex = currentPage * postsPerPage;
    setDisplayedPosts(filteredPosts.slice(0, endIndex));
  }, [filteredPosts, currentPage, postsPerPage]);

  // Carregar mais posts
  const loadMore = () => {
    setCurrentPage(prev => prev + 1);
  };

  const hasMorePosts = currentPage * postsPerPage < filteredPosts.length;

  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // Observer for infinite scroll
  const observer = useRef<IntersectionObserver | null>(null);
  const lastPostElementRef = useCallback((node: HTMLDivElement) => {
    if (isLoading) return;
    if (observer.current) observer.current.disconnect();

    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMorePosts) {
        setIsLoadingMore(true);
        // Simulate small delay for smoother UX
        setTimeout(() => {
          setCurrentPage(prev => prev + 1);
          setIsLoadingMore(false);
        }, 500);
      }
    });

    if (node) observer.current.observe(node);
  }, [isLoading, hasMorePosts]);

  // Obter todas as categorias únicas
  const categories = ['Todos', ...Array.from(new Set(blogPosts.map(post => post.category)))];

  return (
    <PageLayout>
      <BlogHeader
        activeCategory={activeCategory}
        setActiveCategory={setActiveCategory}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />

      <section className="py-24 bg-black min-h-screen relative">
        <div className="absolute inset-0 bg-grid-white/[0.03] pointer-events-none" />
        <div className="container-custom relative z-10">
          {/* Filters are now in BlogHeader */}
          <div className="pt-8"></div>

          {isLoading ? (
            <div className="text-center py-20">
              <div className="mx-auto w-16 h-16 rounded-full border-4 border-gray-700 border-t-revgreen animate-spin mb-4"></div>
              <h3 className="text-2xl font-bold mb-4 text-white">Carregando artigos...</h3>
            </div>
          ) : filteredPosts.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {displayedPosts.map((post, index) => {
                  if (index === displayedPosts.length - 1) {
                    return (
                      <div ref={lastPostElementRef} key={post.id} className="h-full">
                        <BlogCard post={post as any} />
                      </div>
                    );
                  } else {
                    return <BlogCard key={post.id} post={post as any} />;
                  }
                })}
              </div>

              {/* Loader for infinite scroll */}
              {isLoadingMore && (
                <div className="py-8 text-center flex justify-center">
                  <div className="w-8 h-8 rounded-full border-4 border-gray-700 border-t-revgreen animate-spin"></div>
                </div>
              )}

              {/* No more posts indicator */}
              {!hasMorePosts && displayedPosts.length > 0 && (
                <div className="py-12 text-center text-gray-500 text-sm">
                  Você chegou ao fim da lista.
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-20 border border-dashed border-zinc-800 rounded-xl bg-zinc-900/30">
              <div className="mx-auto w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-4 border border-white/10">
                <BookOpen className="h-8 w-8 text-gray-500" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-white">Nenhum artigo encontrado</h3>
              <p className="text-gray-400 max-w-md mx-auto">
                Tente ajustar seus filtros ou termos de busca para encontrar o conteúdo que você procura.
              </p>
              <Button
                variant="link"
                onClick={() => {
                  setActiveCategory('Todos');
                  setSearchQuery('');
                }}
                className="mt-6 text-revgreen"
              >
                Limpar filtros
              </Button>
            </div>
          )}
        </div>
      </section>
    </PageLayout>
  );
};

export default Blog;
