
interface BlogPostContentProps {
  content: string;
  category: string;
  authorName: string;
  authorRole: string;
  slug?: string;
}

const BlogPostContent = ({ content, category, authorName, authorRole, slug }: BlogPostContentProps) => {
  return (
    <div className="prose prose-lg lg:prose-xl max-w-none">
      {/* Author Card - Start */}
      <div className="not-prose bg-gray-50 p-6 rounded-lg border border-gray-200 mb-8">
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <img src="/lovable-uploads/0cf4734e-5153-4c6e-8f33-4b382577e479.png" alt={authorName} className="w-20 h-20 rounded-full object-cover border-2 border-revgreen" />
          <div className="text-center sm:text-left">
            <h3 className="text-xl font-bold">{authorName}</h3>
            <p className="text-gray-600">{authorRole}</p>
          </div>
        </div>
      </div>
      {/* Author Card - End */}
      
      {/* WordPress Content */}
      <div 
        className="wordpress-content font-body"
        dangerouslySetInnerHTML={{ __html: content }} 
      />
    </div>
  );
};

export default BlogPostContent;
