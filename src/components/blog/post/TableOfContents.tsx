
import { useEffect, useState } from 'react';
import { List, ChevronDown, ChevronUp } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { cn } from '@/lib/utils';

interface TableOfContentsProps {
  containerRef: React.RefObject<HTMLElement>;
}

interface TocItem {
  id: string;
  text: string;
  level: number;
}

const TableOfContents = ({ containerRef }: TableOfContentsProps) => {
  const [headings, setHeadings] = useState<TocItem[]>([]);
  const [activeId, setActiveId] = useState<string>('');
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Extrair os cabeçalhos do conteúdo do artigo
  useEffect(() => {
    if (!containerRef.current) return;
    
    const elements = containerRef.current.querySelectorAll('h2, h3');
    const items: TocItem[] = Array.from(elements).map((el) => ({
      id: el.id,
      text: el.textContent || '',
      level: parseInt(el.tagName.substring(1), 10),
    }));

    setHeadings(items);

    // Se não há cabeçalhos ativos, definir o primeiro como ativo
    if (items.length > 0 && !activeId) {
      setActiveId(items[0].id);
    }
  }, [containerRef, activeId]);

  // Atualizar cabeçalho ativo com base na rolagem
  useEffect(() => {
    if (headings.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      { rootMargin: '0px 0px -80% 0px', threshold: 0.1 }
    );

    headings.forEach((heading) => {
      const element = document.getElementById(heading.id);
      if (element) observer.observe(element);
    });

    return () => {
      headings.forEach((heading) => {
        const element = document.getElementById(heading.id);
        if (element) observer.unobserve(element);
      });
    };
  }, [headings]);

  // Se não há cabeçalhos, não renderizar o componente
  if (headings.length === 0) return null;

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <div className="bg-white bg-opacity-90 border border-gray-200 rounded-lg shadow-sm sticky top-24 mb-8">
      <div 
        className="flex items-center justify-between p-4 cursor-pointer"
        onClick={toggleCollapse}
      >
        <div className="flex items-center">
          <List className="h-5 w-5 text-revgreen mr-2" />
          <h3 className="font-medium">Índice</h3>
        </div>
        {isCollapsed ? (
          <ChevronDown className="h-4 w-4 text-gray-500" />
        ) : (
          <ChevronUp className="h-4 w-4 text-gray-500" />
        )}
      </div>

      <div className={cn(
        "px-4 pb-4 overflow-hidden transition-all duration-300",
        isCollapsed ? "max-h-0 opacity-0 p-0" : "max-h-[500px] opacity-100"
      )}>
        <nav className="toc-nav">
          <ul className="space-y-2">
             {headings.map((heading, index) => (
               <li 
                 key={`${heading.id}-${index}`} 
                 className={cn(
                   "transition-colors",
                   heading.level === 3 ? "ml-4" : "",
                   activeId === heading.id ? "text-revgreen font-medium" : "text-gray-600 hover:text-revgreen"
                 )}
               >
                <a
                  href={`#${heading.id}`}
                  onClick={(e) => {
                    e.preventDefault();
                    document.getElementById(heading.id)?.scrollIntoView({ 
                      behavior: 'smooth', 
                      block: 'start'
                    });
                  }}
                  className="block py-1 hover:underline"
                >
                  {heading.text}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </div>
  );
};

export default TableOfContents;
