
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

  // Extrair os cabeçalhos do conteúdo do artigo
  useEffect(() => {
    if (!containerRef.current) return;

    const generateId = (text: string) => {
      return text
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');
    };

    const elements = containerRef.current.querySelectorAll('h2, h3');
    const items: TocItem[] = Array.from(elements).map((el) => {
      const text = el.textContent || '';
      if (!el.id) {
        el.id = generateId(text);
      }
      // Add scroll margin to prevent header overlap
      (el as HTMLElement).style.scrollMarginTop = '120px';

      return {
        id: el.id,
        text: text,
        level: parseInt(el.tagName.substring(1), 10),
      };
    });

    setHeadings(items);

    if (items.length > 0) {
      setActiveId(items[0].id);
    }
  }, [containerRef]);

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

  if (headings.length === 0) return null;

  return (
    <div className="sticky top-32 mb-8 hidden lg:block pr-8">
      <nav className="toc-nav relative">
        {/* Continuous Line */}
        <div className="absolute left-0 top-0 bottom-0 w-px bg-gray-100 z-0"></div>

        <ul className="space-y-0 relative z-10 w-full">
          {headings.map((heading, index) => {
            const isActive = activeId === heading.id;
            return (
              <li
                key={`${heading.id}-${index}`}
                className={cn(
                  "relative transition-all duration-300",
                  heading.level === 3 ? "pl-6" : ""
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
                  className={cn(
                    "block py-3 pl-6 border-l-2 text-xs leading-relaxed transition-all duration-300",
                    isActive
                      ? "border-revgreen font-bold text-black bg-gradient-to-r from-revgreen/5 to-transparent"
                      : "border-transparent text-gray-400 hover:text-gray-600 hover:border-gray-200"
                  )}
                >
                  {heading.text}
                </a>
              </li>
            )
          })}
        </ul>
      </nav>
    </div>
  );
};

export default TableOfContents;
