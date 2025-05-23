interface BlogPostContentProps {
  content: string;
  category: string;
  authorName: string;
  authorRole: string;
  slug?: string;
}
const BlogPostContent = ({
  content,
  category,
  authorName,
  authorRole,
  slug
}: BlogPostContentProps) => {
  return <div className="prose prose-lg lg:prose-xl max-w-none">
      {/* Author Card - Start */}
      
      {/* Author Card - End */}
      
      {/* WordPress Content */}
      <div className="wordpress-content font-body" dangerouslySetInnerHTML={{
      __html: content
    }} />
    </div>;
};
export default BlogPostContent;