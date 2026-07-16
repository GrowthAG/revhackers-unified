import { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PageLayout from '@/components/layout/PageLayout';
import BlogPostHeader from '@/components/blog/post/BlogPostHeader';
import BlogPostContent from '@/components/blog/post/BlogPostContent';
import BlogPostFooter from '@/components/blog/post/BlogPostFooter';
import RelatedPosts from '@/components/blog/post/RelatedPosts';
import TableOfContents from '@/components/blog/post/TableOfContents';
import { getArticleImageBySlug, getFrameworkImage } from '@/components/blog/post/articles/utils/frameworkImages';
import { getAllPosts, BlogPostWithAuthor } from '@/api/posts'; // Updated import
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { blogPosts as staticBlogPosts, BlogPost as StaticBlogPost } from '@/data/blogData';
import ContextualCTA from '@/components/blog/post/ContextualCTA';
import MaterialModal from '@/components/shared/MaterialModal';
import BookingModal from '@/components/shared/BookingModal';
import { useToast } from '@/hooks/use-toast';

// Interface matches the Supabase structure
interface Author {
  name: string;
  role: string;
  avatar: string;
}

// Unified interface for both Static and API posts
interface BlogPost {
  id: string | number; // Support both static (number) and Supabase (UUID string)
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: string;
  image: string;
  author: Author;
  date: string;
  readTime: string;
  featured?: boolean;
}

const BlogPostPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const contentRef = useRef<HTMLDivElement>(null);
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isMaterialModalOpen, setIsMaterialModalOpen] = useState(false);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const { toast } = useToast();

  // Load posts from Supabase API and combine with static posts
  useEffect(() => {
    const fetchPosts = async () => {
      setIsLoading(true);
      try {
        // Fix author avatar path helper
        const getFixedAuthorAvatar = (path?: string | null) => {
          if (!path) return "/lovable-uploads/0cf4734e-5153-4c6e-8f33-4b382577e479.png";
          if (path.startsWith('http') || path.startsWith('/')) return path;
          return `/lovable-uploads/${path}`;
        };

        const apiPosts = await getAllPosts();

        // Convert static posts to match the unified interface
        const staticPostsWithContent: BlogPost[] = staticBlogPosts.map(post => ({
          ...post,
          id: post.id,
          content: post.content || '',
          author: {
            ...post.author,
            avatar: getFixedAuthorAvatar(post.author.avatar)
          }
        }));

        // Convert API posts to match the unified interface
        const formattedApiPosts: BlogPost[] = apiPosts.map(p => ({
          id: p.id,
          title: p.title,
          slug: p.slug,
          excerpt: p.excerpt || '',
          content: p.content || '',
          category: p.category,
          image: p.image || '',
          author: p.author,
          date: p.date || p.created_at, // Fallback to created_at if date is missing
          readTime: p.read_time || '5 min',
          featured: p.featured
        }));

        // [CODEX] Merge Strategy: Database > Static (Primary key: slug)
        // This ensures edits made in the Admin Panel (Supabase) override local static files.
        // UPDATE: Enrich API posts with Local Metadata (Titles with HTML, Fixed Authors) to ensure Design Consistency
        // [CODEX] Safe Merge Strategy: "Smart Authority"
        // 1. Database is the source of truth for EDITS.
        // 2. Static files are the source of truth for DESIGN (HTML Titles, Curated Images).
        const enrichedApiPosts = formattedApiPosts.map(apiPost => {
          const localMatch = staticPostsWithContent.find(local => local.slug === apiPost.slug);
          if (localMatch) {
            // DATABASE FIRST: If it's in the DB, it's an intended edit.
            // We only use static files for things that are NULL in the DB.
            return {
              ...apiPost,
              // If title in DB is just common text, but local has HTML <span>, keep HTML unless DB title is significantly different
              title: (apiPost.title.length > 5 && !apiPost.title.includes('<span'))
                ? (apiPost.title === localMatch.title.replace(/<[^>]*>?/gm, "") ? localMatch.title : apiPost.title)
                : apiPost.title,

              // Priority: DB Image > Local Image > Framework Fallback
              // If DB image is null, it means it was explicitly cleared in Admin
              image: apiPost.image === null ? '' : (apiPost.image || localMatch.image),

              // Content: Always DB if not empty
              content: apiPost.content || localMatch.content,

              // Excerpt: DB First
              excerpt: apiPost.excerpt || localMatch.excerpt
            };
          }
          return apiPost;
        });

        const apiSlugs = new Set(enrichedApiPosts.map(p => p.slug));
        const staticPostsToAdd = staticPostsWithContent.filter(p => !apiSlugs.has(p.slug));

        const allPosts = [...enrichedApiPosts, ...staticPostsToAdd];
        setPosts(allPosts);
        setError(null);
      } catch (err) {
        console.error("Erro ao carregar posts da API, usando apenas posts estáticos:", err);
        // If API fails, use only static posts
        const postsWithContent = staticBlogPosts.map(post => ({
          ...post,
          content: post.content || ''
        }));
        setPosts(postsWithContent);
        setError(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPosts();
  }, []);

  // State for hero image (must be at top level)
  const [heroImgSrc, setHeroImgSrc] = useState<string>('');

  // Find the current post (derived from state)
  const post = posts.find(post => post.slug === slug);

  // Calculate resolved image safely
  // If from DB, explicitly respect NULL/EMPTY to allow deletion in Admin
  const isStatic = post && (typeof post.id === 'number' || post.id.toString().startsWith('static-'));
  const resolvedImage = post
    ? (post.image && post.image !== ''
      ? post.image
      : (isStatic
        ? (getArticleImageBySlug(post.slug) || getFrameworkImage(post.category, post.slug))
        : getFrameworkImage(post.category, post.slug))
    )
    : '';

  // Update hero image when resolvedImage changes
  useEffect(() => {
    if (resolvedImage) {
      setHeroImgSrc(resolvedImage);
    }
  }, [resolvedImage]);

  const handleHeroImageError = () => {
    if (post) {
      const fallback = getFrameworkImage(post.category, post.slug);
      if (heroImgSrc !== fallback) {
        setHeroImgSrc(fallback);
      }
    }
  };

  // Get related posts
  const relatedPosts = post
    ? posts
      .filter(p => p.category === post.category && p.id !== post.id)
      .slice(0, 3)
    : [];

  // Format date to Portuguese
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('pt-BR', options);
  };

  // If post not found and not loading, redirect to blog page
  useEffect(() => {
    if (!isLoading && !post && posts.length > 0) {
      navigate('/blog');
    }
  }, [post, navigate, isLoading, posts]);

  if (isLoading) {
    return (
      <PageLayout>
        <div className="container-custom py-20">
          <div className="text-center">
            <div className="mx-auto w-16 h-16 rounded-full border-4 border-gray-200 border-t-revgreen animate-spin mb-4"></div>
            <h3 className="text-2xl font-bold mb-4">Carregando artigo...</h3>
          </div>
        </div>
      </PageLayout>
    );
  }

  // Handle Primary CTA (Booking/Consultancy)
  const handlePrimaryCTAClick = () => {
    setIsBookingModalOpen(true);
  };

  // Handle Secondary CTA (Material Download - if handled globally)
  // Note: StrategicConclusion usually handles secondary CTA locally via LeadMagnetModal, 
  // but if it bubbles up or if other components trigger it:
  const handleMaterialDownload = () => {
    setIsMaterialModalOpen(true);
  };

  const handleFormSubmit = () => {
    toast({
      title: "Solicitação recebida!",
      description: "Seus dados foram processados. Redirecionando para agendamento...",
    });
    setIsMaterialModalOpen(false);
    // Redirect to booking with slight delay for toast visibility
    setTimeout(() => {
      navigate('/booking');
    }, 1500);
  };

  if (error) {
    return (
      <PageLayout>
        <div className="container-custom py-20">
          <div className="text-center">
            <h3 className="text-2xl font-bold mb-4">Erro ao carregar artigo</h3>
            <p className="text-gray-600 max-w-md mx-auto">{error}</p>
            <Button
              variant="outline"
              onClick={() => navigate('/blog')}
              className="mt-6 border-2 border-revgreen text-revgreen hover:bg-revgreen hover:text-white"
            >
              Voltar para o blog
            </Button>
          </div>
        </div>
      </PageLayout>
    );
  }

  if (!post) {
    return null; // Will redirect in useEffect
  }

  // Get custom image if available for this article
  const customImage = getArticleImageBySlug(post.slug);

  // Copy the post but update the image if custom one exists
  const updatedPost = {
    ...post,
    image: customImage || post.image
  };

  return (
    <PageLayout>
      {/* 1. Hero Section - Matching Landing Page EXACTLY (HeroSection.tsx) */}
      <section className="relative min-h-[60vh] flex flex-col items-center justify-center pt-24 pb-20 overflow-hidden bg-black">
        {/* Full-bleed high-impact background (Fixed: "sem imagem no banner") */}
        <div className="absolute inset-0 z-0">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.4 }}
            transition={{ duration: 1 }}
            className="absolute inset-0"
          >
            <img
              src={heroImgSrc}
              alt=""
              onError={handleHeroImageError}
              className="w-full h-full object-cover blur-xl scale-110"
            />
          </motion.div>
          <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/40 to-black"></div>
          {/* Noise overlay for texture */}
          <div className="absolute inset-0 opacity-[0.15] mix-blend-overlay pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>
        </div>

        <div className="container-custom flex flex-col items-center text-center max-w-6xl relative z-10">
          <header className="max-w-7xl pt-8 w-full">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
              <div className="flex flex-col md:flex-row items-center justify-center gap-4 mb-8">
                <Badge variant="outline" className="bg-revgreen/10 text-revgreen border-revgreen/20 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest h-fit">
                  {post.category}
                </Badge>
                <div className="hidden md:block h-px w-8 bg-white/20"></div>
                <div className="flex items-center gap-4 text-gray-400 text-xs font-medium uppercase tracking-[0.2em]">
                  <span>{post.readTime} reading</span>
                  <span className="text-revgreen/40">•</span>
                  <span>{formatDate(updatedPost.date)}</span>
                </div>
              </div>

              <h1
                className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-12 leading-snug tracking-tight text-balance max-w-5xl mx-auto [&>span]:text-revgreen"
                dangerouslySetInnerHTML={{
                  __html: post.title.includes('<')
                    ? post.title
                    : post.title.includes(':')
                      ? `<span>${post.title.split(':')[0]}</span>: ${post.title.split(':').slice(1).join(':').trim()}`
                      : post.title
                }}
              />
            </motion.div>
          </header>

          {/* Subheadline/Excerpt - Matching Hero Description */}
          {updatedPost.excerpt && (
            <p className="text-lg md:text-xl text-gray-300 mb-16 max-w-4xl leading-relaxed font-normal text-balance mx-auto">
              {updatedPost.excerpt.replace(/<[^>]*>?/gm, "")}
            </p>
          )}

          {/* Metadata - Logic from HeroSection pillars */}
          <div className="w-full border-t border-white/10 pt-8 mt-4 animate-fade-in-up delay-300">
            <div className="flex flex-wrap justify-center gap-6 md:gap-12 text-[10px] md:text-xs font-mono text-gray-500 uppercase tracking-[0.3em]">
              <div className="flex items-center gap-2 hover:text-revgreen transition-colors cursor-default group">
                <span className="text-revgreen group-hover:animate-pulse">•</span> {formatDate(updatedPost.date)}
              </div>
              <div className="flex items-center gap-2 hover:text-revgreen transition-colors cursor-default group">
                <span className="text-revgreen group-hover:animate-pulse">•</span> {updatedPost.readTime}
              </div>
              <div className="flex items-center gap-2 hover:text-revgreen transition-colors cursor-default group">
                <span className="text-revgreen group-hover:animate-pulse">•</span> {updatedPost.author.name}
              </div>
            </div>
          </div>

          {/* Scroll Trigger - Minimalist & Visible */}
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 1 }}
            onClick={() => contentRef.current?.scrollIntoView({ behavior: 'smooth' })}
            className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-6 text-white hover:text-revgreen transition-colors cursor-pointer group z-50 pt-16"
          >
            <span className="text-[10px] uppercase tracking-[0.3em] font-bold text-revgreen bg-black/80 px-4 py-2 rounded-sm border border-revgreen/20 backdrop-blur-md shadow-2xl hover:bg-revgreen hover:text-black transition-all duration-300">
              Ler Artigo
            </span>
            <div className="w-px h-12 bg-gradient-to-b from-revgreen to-transparent opacity-50 group-hover:h-20 transition-all duration-500"></div>
          </motion.button>
        </div>
      </section>

      {/* 2. Content Section - White Background (Fixes "Totally Dark" issue) */}
      <section className="py-20 bg-white border-t border-gray-100">
        <div className="container px-4 md:px-6 mx-auto max-w-7xl">

          {/* Changed grid to give more space to content (col-span-12 on mobile, col-span-8 or 9 on desktop) */}
          <div className="grid grid-cols-12 gap-8 lg:gap-16">

            {/* TOC Sidebar - Hidden on mobile, sticky on desktop */}
            <div className="hidden lg:col-span-3 lg:block">
              <div className="sticky top-32">
                <h4 className="font-bold text-black mb-6 border-l-4 border-black pl-4 uppercase tracking-widest text-xs">Neste Artigo</h4>
                <TableOfContents containerRef={contentRef} />
              </div>
            </div>

            {/* Main Content - Expanded width (col-span-9) */}
            <div ref={contentRef} className="col-span-12 lg:col-span-9 lg:pl-10 border-l border-gray-50">

              {/* The content below will render either the database 'content' or a custom article component */}
              <div className="animate-fade-in">
                <BlogPostContent
                  content={post.content}
                  category={post.category}
                  authorName={post.author.name}
                  authorRole={post.author.role}
                  authorAvatar={post.author.avatar}
                  slug={post.slug}
                  onCTAClick={handlePrimaryCTAClick} // Pass Booking Handler for Primary
                />

                {/* Contextual Diagnostic CTA */}
                <ContextualCTA title={post.title} category={post.category} />
              </div>
              <BlogPostFooter />
            </div>
          </div>
        </div>
      </section>

      {/* Global CTA Modal for all articles (Material Download) */}
      <MaterialModal
        isOpen={isMaterialModalOpen}
        onClose={() => setIsMaterialModalOpen(false)}
        material={{
          title: post.title,
          material_name: post.title,
          type: "Contexto", // Changed to generic context as it's secondary
          id: post.slug
        }}
        onSuccess={handleFormSubmit}
      />

      {/* Global Booking Modal (Diagnosis) */}
      <BookingModal
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
      />
    </PageLayout >
  );
};

export default BlogPostPage;
