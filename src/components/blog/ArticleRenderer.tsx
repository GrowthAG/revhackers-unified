import React from 'react';
import { ArticleTakeaways } from './ArticleTakeaways';
import { CheckCircle2, ChevronRight, LightbulbIcon, ArrowRight, Quote } from 'lucide-react';
import DOMPurify from 'dompurify';
import { ArticleBlueprint } from './ArticleBlueprint';
import { ArticleStack } from './ArticleStack';
import { ArticleRedFlags } from './ArticleRedFlags';
import { ArticleSteps } from './ArticleSteps';
import { ArticleInfoBox } from './ArticleInfoBox';

interface ArticleRendererProps {
    content: string;
}

/**
 * ArticleRenderer V2 - Parser avançado com suporte a componentes ricos
 * 
 * Sintaxes suportadas:
 * - ## Título, ### Subtítulo
 * - - Lista, 1. Lista numerada
 * - **negrito**, *itálico*
 * - > Citação
 * - [TAKEAWAYS:...] [/TAKEAWAYS]
 * - [BLUEPRINT:...] [/BLUEPRINT]
 * - [STACK:...] [/STACK]
 * - [REDFLAGS:...] [/REDFLAGS]
 * - [STEPS:...] [/STEPS]
 * - [INFO] [/INFO]
 */
export const ArticleRenderer: React.FC<ArticleRendererProps> = ({ content }) => {

    const parseContent = (text: string): JSX.Element[] => {
        const elements: JSX.Element[] = [];
        let elementKey = 0;

        // Pre-process: Extract special blocks
        const blocks = extractSpecialBlocks(text);

        blocks.forEach((block) => {
            if (block.type === 'TAKEAWAYS') {
                elements.push(
                    <ArticleTakeaways
                        key={`takeaway-${elementKey++}`}
                        title={block.title || 'Key Takeaways'}
                        items={parseTakeawayItems(block.content)}
                    />
                );
            } else if (block.type === 'BLUEPRINT') {
                elements.push(
                    <ArticleBlueprint
                        key={`blueprint-${elementKey++}`}
                        title={block.title || 'Framework'}
                        items={parseBlueprintItems(block.content)}
                    />
                );
            } else if (block.type === 'STACK') {
                elements.push(
                    <ArticleStack
                        key={`stack-${elementKey++}`}
                        title={block.title || 'Tech Stack'}
                        items={parseStackItems(block.content)}
                    />
                );
            } else if (block.type === 'REDFLAGS') {
                elements.push(
                    <ArticleRedFlags
                        key={`redflags-${elementKey++}`}
                        title={block.title || 'Red Flags'}
                        flags={parseListItems(block.content)}
                    />
                );
            } else if (block.type === 'STEPS') {
                elements.push(
                    <ArticleSteps
                        key={`steps-${elementKey++}`}
                        title={block.title || 'Passos'}
                        steps={parseStepsItems(block.content)}
                    />
                );
            } else if (block.type === 'INFO') {
                elements.push(
                    <ArticleInfoBox key={`info-${elementKey++}`}>
                        <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(formatInlineStyles(block.content)) }} />
                    </ArticleInfoBox>
                );
            } else if (block.type === 'TEXT') {
                // Regular content parsing
                const parsed = parseRegularContent(block.content, elementKey);
                elements.push(...parsed.elements);
                elementKey = parsed.nextKey;
            }
        });

        return elements;
    };

    // Extract special blocks from content
    const extractSpecialBlocks = (text: string) => {
        const blocks: Array<{ type: string; title?: string; content: string }> = [];
        const specialBlockRegex = /\[(TAKEAWAYS|BLUEPRINT|STACK|REDFLAGS|STEPS|INFO):?\s*([^\]]*)\]([\s\S]*?)\[\/\1\]/g;

        let lastIndex = 0;
        let match;

        while ((match = specialBlockRegex.exec(text)) !== null) {
            // Add text before this block
            if (match.index > lastIndex) {
                const textBefore = text.substring(lastIndex, match.index).trim();
                if (textBefore) {
                    blocks.push({ type: 'TEXT', content: textBefore });
                }
            }

            // Add special block
            blocks.push({
                type: match[1],
                title: match[2].trim() || undefined,
                content: match[3].trim()
            });

            lastIndex = match.index + match[0].length;
        }

        // Add remaining text
        if (lastIndex < text.length) {
            const textAfter = text.substring(lastIndex).trim();
            if (textAfter) {
                blocks.push({ type: 'TEXT', content: textAfter });
            }
        }

        // If no special blocks found, return all as TEXT
        if (blocks.length === 0) {
            blocks.push({ type: 'TEXT', content: text });
        }

        return blocks;
    };

    // Parse takeaway items (- **Title:** Description)
    const parseTakeawayItems = (content: string) => {
        const items: Array<{ title: string; description: string }> = [];
        const lines = content.split('\n');

        lines.forEach(line => {
            const trimmed = line.trim();
            if (trimmed.startsWith('- ')) {
                const text = trimmed.substring(2);
                const match = text.match(/\*\*(.+?)\*\*:\s*(.+)/);
                if (match) {
                    items.push({ title: match[1], description: match[2] });
                }
            }
        });

        return items;
    };

    // Parse blueprint items (1. **Title:** Description)
    const parseBlueprintItems = (content: string) => {
        const items: Array<{ number: string; title: string; description: string; isHighlight?: boolean }> = [];
        const lines = content.split('\n');

        lines.forEach(line => {
            const trimmed = line.trim();
            const match = trimmed.match(/^(\d+)\.\s+\*\*(.+?)\*\*:\s*(.+)/);
            if (match) {
                items.push({
                    number: match[1],
                    title: match[2],
                    description: match[3],
                    isHighlight: match[3].includes('(destacada)') || match[3].includes('(highlight)')
                });
            }
        });

        return items;
    };

    // Parse stack items (- **Role:** Tools)
    const parseStackItems = (content: string) => {
        const items: Array<{ role: string; tools: string }> = [];
        const lines = content.split('\n');

        lines.forEach(line => {
            const trimmed = line.trim();
            if (trimmed.startsWith('- ')) {
                const text = trimmed.substring(2);
                const match = text.match(/\*\*(.+?)\*\*:\s*(.+)/);
                if (match) {
                    items.push({ role: match[1], tools: match[2] });
                }
            }
        });

        return items;
    };

    // Parse simple list items
    const parseListItems = (content: string) => {
        const items: string[] = [];
        const lines = content.split('\n');

        lines.forEach(line => {
            const trimmed = line.trim();
            if (trimmed.startsWith('- ')) {
                items.push(trimmed.substring(2));
            }
        });

        return items;
    };

    // Parse steps items (1. **Title:** Description)
    const parseStepsItems = (content: string) => {
        const items: Array<{ number: string; title: string; description: string; isHighlight?: boolean }> = [];
        const lines = content.split('\n');

        lines.forEach(line => {
            const trimmed = line.trim();
            const match = trimmed.match(/^(\d+)\.\s+\*\*(.+?)\*\*:\s*(.+)/);
            if (match) {
                items.push({
                    number: match[1],
                    title: match[2],
                    description: match[3],
                    isHighlight: match[3].includes('(destacada)') || match[3].includes('(highlight)')
                });
            }
        });

        return items;
    };

    // Parse regular content (H2, H3, paragraphs, lists, quotes, tables, YouTube embeds)
    const parseRegularContent = (text: string, startKey: number) => {
        const lines = text.split('\n');
        const elements: JSX.Element[] = [];
        let currentParagraph: string[] = [];
        let currentList: string[] = [];
        let currentTable: string[][] = [];
        let tableHeader: string[] = [];
        let listType: 'ul' | 'ol' | null = null;
        let elementKey = startKey;

        const flushParagraph = () => {
            if (currentParagraph.length > 0) {
                const paragraphText = currentParagraph.join(' ').trim();
                if (paragraphText) {
                    elements.push(
                        <p key={`p-${elementKey++}`} className="article-body" dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(formatInlineStyles(paragraphText)) }} />
                    );
                }
                currentParagraph = [];
            }
        };

        const flushList = () => {
            if (currentList.length > 0 && listType) {
                const ListTag = listType;
                elements.push(
                    <ListTag key={`list-${elementKey++}`} className={listType === 'ul' ? 'article-list' : 'article-list-numbered'}>
                        {currentList.map((item, idx) => (
                            <li key={idx} dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(formatInlineStyles(item)) }} />
                        ))}
                    </ListTag>
                );
                currentList = [];
                listType = null;
            }
        };

        const flushTable = () => {
            if (tableHeader.length > 0 && currentTable.length > 0) {
                elements.push(
                    <div key={`table-wrap-${elementKey++}`} className="article-table-wrapper">
                        <table className="article-table">
                            <thead>
                                <tr>
                                    {tableHeader.map((cell, idx) => (
                                        <th key={idx} dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(formatInlineStyles(cell)) }} />
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {currentTable.map((row, rowIdx) => (
                                    <tr key={rowIdx}>
                                        {row.map((cell, cellIdx) => (
                                            <td key={cellIdx} dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(formatInlineStyles(cell) }} />
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                );
            }
            tableHeader = [];
            currentTable = [];
        };

        const parseTableRow = (line: string): string[] => {
            return line.split('|').filter((_, i, arr) => i > 0 && i < arr.length - 1).map(cell => cell.trim());
        };

        const isSeparatorRow = (line: string): boolean => {
            return /^\|[\s\-:|]+\|$/.test(line.trim()) || /^\|(\s*-+\s*\|)+$/.test(line.trim());
        };

        lines.forEach((line, index) => {
            const trimmedLine = line.trim();

            if (!trimmedLine) {
                flushParagraph();
                flushList();
                flushTable();
                return;
            }

            // YouTube embed [YOUTUBE:VIDEO_ID]
            const youtubeMatch = trimmedLine.match(/^\[YOUTUBE:([a-zA-Z0-9_-]+)\]$/);
            if (youtubeMatch) {
                flushParagraph();
                flushList();
                flushTable();
                elements.push(
                    <div key={`yt-${elementKey++}`} className="article-youtube">
                        <iframe
                            width="100%"
                            height="400"
                            src={`https://www.youtube.com/embed/${youtubeMatch[1]}`}
                            title="YouTube video"
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                            style={{ borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }}
                        />
                    </div>
                );
                return;
            }

            // Table row (starts with |)
            if (trimmedLine.startsWith('|') && trimmedLine.endsWith('|')) {
                flushParagraph();
                flushList();

                if (isSeparatorRow(trimmedLine)) {
                    // This is the separator row after header, skip it
                    return;
                }

                const cells = parseTableRow(trimmedLine);
                if (tableHeader.length === 0) {
                    // First row is header
                    tableHeader = cells;
                } else {
                    currentTable.push(cells);
                }
                return;
            }

            // If we were in a table and hit a non-table line, flush
            if (tableHeader.length > 0) {
                flushTable();
            }

            // H2
            if (trimmedLine.startsWith('## ')) {
                flushParagraph();
                flushList();
                const title = trimmedLine.substring(3).trim();
                elements.push(<h2 key={`h2-${elementKey++}`} className="article-h2">{title}</h2>);
                return;
            }

            // H3
            if (trimmedLine.startsWith('### ')) {
                flushParagraph();
                flushList();
                const title = trimmedLine.substring(4).trim();
                elements.push(
                    <h3 key={`h3-${elementKey++}`} className="article-h3">
                        <div className="w-2 h-2 bg-revgreen shrink-0" />
                        {title}
                    </h3>
                );
                return;
            }

            // Blockquote
            if (trimmedLine.startsWith('> ')) {
                flushParagraph();
                flushList();
                const quote = trimmedLine.substring(2).trim();
                const nextLine = lines[index + 1]?.trim();
                if (nextLine?.startsWith('-')) {
                    elements.push(
                        <blockquote key={`quote-${elementKey++}`} className="article-quote">
                            <p>{quote}</p>
                            <cite>{nextLine}</cite>
                        </blockquote>
                    );
                    lines[index + 1] = '';
                } else {
                    elements.push(
                        <blockquote key={`quote-${elementKey++}`} className="article-quote">
                            <p>{quote}</p>
                        </blockquote>
                    );
                }
                return;
            }

            // Unordered list
            if (trimmedLine.startsWith('- ') || trimmedLine.startsWith('• ')) {
                flushParagraph();
                if (listType !== 'ul') {
                    flushList();
                    listType = 'ul';
                }
                const item = trimmedLine.substring(2).trim();
                currentList.push(item);
                return;
            }

            // Ordered list
            if (/^\d+\.\s/.test(trimmedLine)) {
                flushParagraph();
                if (listType !== 'ol') {
                    flushList();
                    listType = 'ol';
                }
                const item = trimmedLine.replace(/^\d+\.\s/, '').trim();
                currentList.push(item);
                return;
            }

            // Divider
            if (trimmedLine === '---') {
                flushParagraph();
                flushList();
                elements.push(<hr key={`hr-${elementKey++}`} className="article-divider" />);
                return;
            }

            // Paragraph
            flushList();
            currentParagraph.push(trimmedLine);
        });

        flushParagraph();
        flushList();
        flushTable();

        return { elements, nextKey: elementKey };
    };

    const linkifyKeywords = (text: string): string => {
        // Handle explicit markdown links [TEXT](URL) first
        let linkedText = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-revgreen hover:underline font-semibold transition-colors decoration-revgreen/30 underline-offset-4" target="_blank" rel="noopener noreferrer">$1</a>');

        // If it already has an anchor tag, skip auto-linking to avoid nested or broken HTML
        if (linkedText.includes('<a ')) return linkedText;

        const keywords = [
            { pattern: "Mídia Paga|Tráfego Pago", url: '/servicos/tracao-midia-paga' },
            { pattern: "\\bCRM\\b|HubSpot|ActiveCampaign", url: '/servicos/ecossistema-crm' },
            { pattern: "Inbound Marketing|Inbound|SEO", url: '/servicos/conteudo-inbound-plg' },
            { pattern: "Go-To-Market|GTM|Máquina de Vendas", url: '/servicos/consultoria-go-to-market' },
            { pattern: "Growth Hacking|Account-Based Marketing|ABM", url: '/servicos/revenue-operations-abm' }
        ];

        keywords.forEach(kw => {
            let replaced = false;
            linkedText = linkedText.replace(new RegExp(`(${kw.pattern})`, 'gi'), (match) => {
                if (replaced) return match;
                replaced = true; // Only linkify first occurrence per text block
                return `<a href="${kw.url}" class="text-revgreen hover:underline font-semibold transition-colors decoration-revgreen/30 underline-offset-4" title="Serviço RevHackers: ${match}">${match}</a>`;
            });
        });

        return linkedText;
    };

    const formatInlineStyles = (text: string): string => {
        text = text.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
        text = text.replace(/\*(.+?)\*/g, '<em>$1</em>');
        text = linkifyKeywords(text);
        return text;
    };

    return (
        <div className="article-content">
            {parseContent(content)}
        </div>
    );
};
