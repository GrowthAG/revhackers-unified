
import { useState, useEffect } from 'react';
import { CalendarIcon, Clock, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getArticleImageBySlug, getFrameworkImage } from './post/articles/utils/frameworkImages';

interface Author {
  name: string;
  role: string;
  avatar: string;
}

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
  author: Author;
}

interface BlogCardProps {
  post: BlogPost;
  onClick?: () => void;
}

const BlogCard = ({ post, onClick }: BlogCardProps) => {
  // Obter imagem personalizada se disponível para este artigo
  // Fallback: post.image -> imageMap by slug -> category specific image (deterministic)
  // [CRITICAL] If from DB, explicitly respect NULL/EMPTY to allow deletion in Admin
  const isStatic = typeof post.id === 'number' || post.id.toString().startsWith('static-');
  const articleImage = (post.image && post.image !== '')
    ? post.image
    : (isStatic ? (getArticleImageBySlug(post.slug) || getFrameworkImage(post.category, post.slug)) : getFrameworkImage(post.category, post.slug));

  // State to handle image loading errors
  const [imgSrc, setImgSrc] = useState(articleImage);

  // Update imgSrc if articleImage changes (e.g. during search/filtering)
  useEffect(() => {
    setImgSrc(articleImage);
  }, [articleImage]);

  const handleImageError = () => {
    const fallback = getFrameworkImage(post.category, post.slug);
    if (imgSrc !== fallback) {
      setImgSrc(fallback);
    }
  };

  // Formatar data para português
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('pt-BR', options);
  };

  // Limpar HTML do excerpt
  const cleanExcerpt = () => {
    const div = document.createElement('div');
    div.innerHTML = post.excerpt || '';
    return div.textContent || div.innerText || '';
  };

  // Limpar HTML do título
  const cleanTitle = () => {
    const div = document.createElement('div');
    div.innerHTML = post.title || '';
    return div.textContent || div.innerText || '';
  };

  return (
    <Link
      to={`/blog/${post.slug || post.id}`}
      className="group block h-full"
      onClick={onClick}
    >
      <article className="h-full flex flex-col bg-white rounded-sm border border-zinc-200 shadow-sm hover:shadow-2xl hover:border-black transition-all duration-500 overflow-hidden hover:-translate-y-1">
        <div className="h-52 overflow-hidden relative border-b border-zinc-100 bg-zinc-50">
          <div className="absolute inset-0 z-10 group-hover:bg-black/5 transition-colors duration-500" />
          <img
            src={imgSrc}
            alt={cleanTitle()}
            onError={handleImageError}
            className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-700"
          />
        </div>

        <div className="flex-1 p-6 md:p-8 flex flex-col">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-[10px] font-black uppercase tracking-widest text-black bg-zinc-100 px-2 py-1 rounded-sm border border-zinc-200">
              {post.category}
            </span>
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
              {post.readTime || '5 min'}
            </span>
          </div>

          <h3 className="text-xl md:text-2xl font-black text-black mb-4 leading-tight group-hover:text-zinc-600 transition-colors tracking-tighter">
            {post.title}
          </h3>

          <p className="text-zinc-500 text-sm font-bold uppercase tracking-widest line-clamp-3 mb-8 flex-1 leading-relaxed">
            {cleanExcerpt()}
          </p>

          <div className="flex items-center justify-between pt-6 border-t border-zinc-50">
            <div className="flex items-center gap-3">
              {post.author?.avatar && (
                <img
                  src={post.author.avatar}
                  alt={post.author.name}
                  className="w-10 h-10 rounded-full object-cover border border-zinc-200"
                />
              )}
              <div>
                <p className="text-[10px] font-black text-black uppercase tracking-widest">{post.author?.name || 'Equipe RevHackers'}</p>
                <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">{post.author?.role || 'Estrategista'}</p>
              </div>
            </div>
            <ArrowRight className="w-5 h-5 text-zinc-300 group-hover:text-black transition-all group-hover:translate-x-1" />
          </div>
        </div>
      </article>
    </Link>
  );
};

export default BlogCard;
