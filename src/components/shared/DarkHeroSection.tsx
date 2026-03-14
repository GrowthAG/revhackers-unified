import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface DarkHeroSectionProps {
  title: string;
  subtitle: string;
  searchPlaceholder?: string;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  categories?: string[];
  activeCategory?: string;
  onCategoryChange?: (category: string) => void;
}

const DarkHeroSection = ({
  title,
  subtitle,
  searchPlaceholder = 'BUSCAR...',
  searchQuery = '',
  onSearchChange,
  categories,
  activeCategory = 'Todos',
  onCategoryChange
}: DarkHeroSectionProps) => {
  return (
    <section className="bg-black py-24 md:py-32 relative overflow-hidden">
      {/* Sophisticated Dark Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:24px_24px] opacity-[0.03] pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/50 to-black pointer-events-none" />

      <div className="container-custom relative z-10">
        <div className="max-w-4xl mx-auto text-center mb-16">
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-8 text-white tracking-tight leading-[1.1]">
            {title}<span className="text-revgreen">.</span>
          </h1>
          <p className="text-lg md:text-xl text-zinc-500 font-normal tracking-tight leading-relaxed max-w-2xl mx-auto">
            {subtitle}
          </p>
        </div>

        {onSearchChange && (
          <div className="max-w-xl mx-auto relative mb-20">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-zinc-500" />
            <Input
              type="search"
              placeholder={searchPlaceholder}
              className="pl-12 pr-4 py-8 bg-zinc-900/30 border-zinc-800 text-white placeholder:text-zinc-600 focus:border-revgreen/50 transition-all rounded-sm shadow-2xl text-xs font-bold uppercase tracking-widest"
              value={searchQuery}
              onChange={e => onSearchChange(e.target.value)}
            />
          </div>
        )}

        {categories && categories.length > 0 && onCategoryChange && (
          <div className="flex flex-wrap justify-center gap-x-8 gap-y-4 border-t border-zinc-900/50 pt-8 mt-12">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => onCategoryChange(category)}
                className={`text-[10px] uppercase tracking-[0.2em] font-bold font-sans transition-all duration-300 relative py-2 ${activeCategory === category
                  ? "text-revgreen"
                  : "text-zinc-500 hover:text-white"
                  }`}
              >
                {category}
                {activeCategory === category && (
                  <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-revgreen" />
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default DarkHeroSection;
