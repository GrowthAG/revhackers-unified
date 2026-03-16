
import { useState, useEffect, useMemo } from 'react';
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
  const isStatic = typeof post.id === 'number' || post.id.toString().startsWith('static-');
  const articleImage = (post.image && post.image !== '')
    ? post.image
    : (isStatic ? (getArticleImageBySlug(post.slug) || getFrameworkImage(post.category, post.slug)) : getFrameworkImage(post.category, post.slug));

  const [imgSrc, setImgSrc] = useState(articleImage);

  useEffect(() => {
    setImgSrc(articleImage);
  }, [articleImage]);

  const handleImageError = () => {
    const fallback = getFrameworkImage(post.category, post.slug);
    if (imgSrc !== fallback) {
      setImgSrc(fallback);
    }
  };

  // Strip HTML tags with regex instead of creating DOM elements
  const cleanExcerpt = useMemo(() =>
    (post.excerpt || '').replace(/<[^>]*>?/gm, ''),
    [post.excerpt]
  );

  return (
    <Link
      to={`/blog/${post.slug || post.id}`}
      className="group block h-full"
      onClick={onClick}
    >
      <article className="h-full flex flex-col bg-white">
        {/* Image Container */}
        <div className="aspect-[16/9] w-full overflow-hidden bg-black relative mb-6 flex items-center justify-center">
          <img
            src={imgSrc}
            alt={post.title}
            onError={handleImageError}
            className="max-w-full max-h-full object-contain transition-transform duration-700 group-hover:scale-105 opacity-90 group-hover:opacity-100 p-4"
          />
        </div>

        {/* Content Container */}
        <div className="flex-1 flex flex-col pr-4">
          {/* Badge & Meta */}
          <div className="flex items-center gap-3 mb-4">
            <span className="text-[10px] font-bold uppercase tracking-widest text-black bg-gray-100 px-2 py-1 rounded-none border border-transparent">
              {post.category}
            </span>
            <span className="text-[10px] font-bold text-gray-300 uppercase tracking-widest">
              {post.readTime || '5 MIN'}
            </span>
          </div>

          {/* Title - Heavy & Tight */}
          <h3 className="text-xl md:text-2xl font-bold text-black mb-3 leading-tight tracking-tight mt-2">
            {post.title}
          </h3>

          {/* Excerpt - Clean & Minimal */}
          <p className="text-gray-500 text-xs font-medium uppercase tracking-wide line-clamp-3 mb-6 leading-relaxed">
            {cleanExcerpt}
          </p>

          {/* Footer / Author - Ultra clean */}
          <div className="mt-auto pt-4 flex items-center justify-between border-t border-gray-100">
            <div className="flex items-center gap-3">
              <img
                  src={post.author?.avatar || '/uploads/0cf4734e-5153-4c6e-8f33-4b382577e479.png'}
                  alt={post.author?.name || 'Giulliano Alves'}
                  className="w-8 h-8 rounded-full object-cover border border-gray-100"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/uploads/0cf4734e-5153-4c6e-8f33-4b382577e479.png';
                  }}
                />
              <div className="flex flex-col">
                <span className="text-[9px] font-bold text-black uppercase tracking-widest">{post.author?.name}</span>
                <span className="text-[8px] font-bold text-gray-400 uppercase tracking-widest">{post.author?.role}</span>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-black transition-transform group-hover:translate-x-1" />
          </div>
        </div>
      </article>
    </Link>
  );
};

export default BlogCard;
