import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
const categories = ["Todos", "PLG", "ABM", "Automação", "CRO", "Dados", "Vendas", "MarTech"];
interface BlogHeaderProps {
  activeCategory: string;
  setActiveCategory: (category: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}
const BlogHeader = ({
  activeCategory,
  setActiveCategory,
  searchQuery,
  setSearchQuery
}: BlogHeaderProps) => {
  return <div className="bg-black py-12 md:py-20 border-b border-white/10 relative overflow-hidden">
    {/* Abstract Background Effect */}
    <div className="absolute inset-0 bg-grid-white/[0.05] pointer-events-none" />
    <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black pointer-events-none" />

    <div className="container-custom relative z-10">
      <div className="max-w-2xl mx-auto text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold mb-4 text-white tracking-tight">Blog</h1>
        <p className="text-lg text-gray-400 font-light">
          Estratégias avançadas de Growth, Revenue Operations e Tecnologia.
        </p>
      </div>

      <div className="max-w-md mx-auto relative mb-12">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-500" />
        <Input
          type="search"
          placeholder="Buscar artigos..."
          className="pl-10 pr-4 py-6 bg-zinc-900/80 border-white/10 text-white placeholder:text-gray-600 focus:border-revgreen transition-colors rounded-xl backdrop-blur-sm"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="flex flex-wrap justify-center gap-3">
        {categories.map(category => (
          <button
            key={category}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${activeCategory === category
              ? "bg-revgreen text-black shadow-[0_0_15px_rgba(74,222,128,0.3)] font-bold"
              : "bg-zinc-900/50 text-gray-400 hover:bg-zinc-800 hover:text-white border border-white/5 hover:border-white/20"
              }`}
            onClick={() => setActiveCategory(category)}
          >
            {category}
          </button>
        ))}
      </div>
    </div>
  </div>;
};
export default BlogHeader;