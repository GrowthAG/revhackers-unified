
import { Link } from 'react-router-dom';
import { ArrowLeft, Clock, Calendar, User, Share2, Linkedin, Twitter, Link as LinkIcon } from 'lucide-react';
import DOMPurify from 'dompurify';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface Author {
  name: string;
  role: string;
  avatar: string;
}

interface BlogPost {
  id: number;
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

interface BlogPostHeaderProps {
  post: BlogPost;
  formatDate: (dateString: string) => string;
}

const BlogPostHeader = ({
  post,
  formatDate
}: BlogPostHeaderProps) => {
  const scrollToTop = () => {
    window.scrollTo(0, 0);
  };

  // Clean HTML from title
  const cleanTitle = () => {
    const div = document.createElement('div');
    div.innerHTML = post.title;
    return div.textContent || div.innerText || '';
  };

  return <>
    {/* Back to Blog Link */}
    <div className="mb-8">
      <Link to="/blog" onClick={scrollToTop} className="inline-flex items-center text-gray-600 hover:text-revgreen">
        <ArrowLeft className="h-4 w-4 mr-2" />
        <span>Voltar para o blog</span>
      </Link>
    </div>

    {/* Article Header */}
    <div className="max-w-3xl mx-auto mb-12">
      <div className="mb-6">
        <span className="inline-block px-3 py-1 bg-green-50 text-green-800 rounded-full text-sm font-medium">
          {post.category}
        </span>
      </div>

      <h1
        className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight mb-8 px-0 text-white text-balance tracking-tight [&>span]:text-revgreen"
        dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(post.title) }}
      />

      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div className="flex items-center space-x-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={post.author.avatar} alt={post.author.name} />
            <AvatarFallback>{post.author.name.substring(0, 2)}</AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium">{post.author.name}</p>
            <p className="text-sm text-gray-500">{post.author.role}</p>
          </div>
        </div>

        <div className="flex text-sm text-gray-500 space-x-4">
          <div className="flex items-center">
            <Calendar className="h-4 w-4 mr-1" />
            <span>{formatDate(post.date)}</span>
          </div>
          <div className="flex items-center">
            <Clock className="h-4 w-4 mr-1" />
            <span>{post.readTime}</span>
          </div>
        </div>
      </div>
    </div>

    {/* Featured Image */}
    <div className="max-w-3xl mx-auto mb-10">
      <figure className="rounded-lg overflow-hidden shadow-sm">
        <img
          src={post.image}
          alt={cleanTitle()}
          className="w-full h-[500px] object-cover"
        />
      </figure>
    </div>
  </>;
};

export default BlogPostHeader;
