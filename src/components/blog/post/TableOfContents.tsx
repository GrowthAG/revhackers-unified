
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
    <div className="sticky top-32 mb-8 hidden lg:block">
      <nav className="toc-nav">
        <ul className="space-y-3 relative border-l border-gray-100 pl-4">
          {headings.map((heading, index) => (
            <li
              key={`${heading.id}-${index}`}
              className={cn(
                "transition-all duration-200 text-xs",
                heading.level === 3 ? "ml-2" : "",
                activeId === heading.id
                  ? "text-black font-bold -ml-[17px] pl-[13px] border-l-2 border-revgreen"
                  : "text-gray-400 hover:text-gray-600"
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
                className="block leading-relaxed break-words"
              >
                {heading.text}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
};

export default TableOfContents;
