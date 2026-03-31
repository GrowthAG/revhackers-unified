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
    <section className="bg-zinc-950 py-24 md:py-32 relative overflow-hidden">
      {/* Sophisticated Dark Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:24px_24px] opacity-[0.03] pointer-events-none" />
      {/* Overlay solido - gradientes proibidos pelo design system */}
      <div className="absolute inset-0 bg-zinc-950/40 pointer-events-none" />

      <div className="container-custom relative z-10">
        <div className="max-w-4xl mx-auto text-center mb-16">
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black mb-6 text-white tracking-tighter text-balance">
            {title}<span className="text-revgreen">.</span>
          </h1>
          <p className="text-lg md:text-xl text-zinc-400 font-medium leading-relaxed max-w-2xl mx-auto text-balance">
            {subtitle}
          </p>
        </div>

        {onSearchChange && (
          <div className="max-w-xl mx-auto relative mb-16">
            <Search className="absolute left-5 top-1/2 transform -translate-y-1/2 h-5 w-5 text-zinc-500" />
            <Input
              type="search"
              placeholder={searchPlaceholder}
              className="h-14 pl-14 pr-6 bg-zinc-900/50 border-zinc-800 text-white placeholder:text-zinc-500 rounded-none shadow-sm text-tiny font-black uppercase tracking-widest focus-visible:ring-1 focus-visible:ring-revgreen focus-visible:border-revgreen transition-all"
              value={searchQuery}
              onChange={e => onSearchChange(e.target.value)}
            />
          </div>
        )}

        {categories && categories.length > 0 && onCategoryChange && (
          <div className="flex flex-wrap justify-center gap-x-8 gap-y-4 border-t border-zinc-900 pt-8 mt-12">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => onCategoryChange(category)}
                className={`text-xxs uppercase tracking-[0.2em] font-black font-sans transition-all duration-300 relative py-2 ${
                  activeCategory === category
                    ? "text-revgreen"
                    : "text-zinc-500 hover:text-zinc-300"
                }`}
              >
                {category}
                {activeCategory === category && (
                  <span className="absolute bottom-0 left-0 w-full h-[2px] bg-revgreen" />
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
