
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
  const articleImage = post.image || getArticleImageBySlug(post.slug) || getFrameworkImage(post.category, post.slug);

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
    <Link to={`/blog/${post.slug}`} className="group block h-full" onClick={onClick}>
      <div className="flex flex-col h-full bg-white/5 border border-white/10 hover:border-revgreen transition-all duration-300 rounded-sm overflow-hidden group hover:shadow-[0_0_30px_rgba(0,255,136,0.05)]">
        <div className="h-52 overflow-hidden relative border-b border-white/10">
          <div className="absolute inset-0 bg-black/20 z-10 group-hover:bg-transparent transition-colors duration-500" />
          <img
            src={imgSrc}
            alt={cleanTitle()}
            onError={handleImageError}
            className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-700"
          />
          <div className="absolute top-4 left-4 z-20">
            <span className="text-[10px] uppercase tracking-widest px-3 py-1 bg-black/90 backdrop-blur-md text-revgreen border border-revgreen/20 rounded-sm font-bold shadow-sm">
              {post.category}
            </span>
          </div>
        </div>

        <div className="p-8 flex-1 flex flex-col">
          <h3 className="text-2xl font-bold mb-4 line-clamp-2 text-white group-hover:text-revgreen transition-colors leading-tight">
            {cleanTitle()}
          </h3>
          <p className="text-gray-400 mb-6 line-clamp-3 text-sm font-light leading-relaxed flex-1">
            {cleanExcerpt()}
          </p>

          <div className="flex items-center justify-between text-xs text-gray-500 pt-6 border-t border-white/10 mt-auto">
            <div className="flex items-center space-x-4">
              <div className="flex items-center text-gray-400">
                <CalendarIcon className="h-3 w-3 mr-2 text-revgreen" />
                <span>{formatDate(post.date)}</span>
              </div>
              <div className="flex items-center text-gray-400">
                <Clock className="h-3 w-3 mr-2 text-revgreen" />
                <span>{post.readTime}</span>
              </div>
            </div>

            <div className="flex items-center group-hover:translate-x-1 transition-transform duration-300">
              <span className="text-revgreen font-bold uppercase tracking-wide text-[10px] mr-2">Ler Artigo</span>
              <ArrowRight className="h-3 w-3 text-revgreen" />
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default BlogCard;
