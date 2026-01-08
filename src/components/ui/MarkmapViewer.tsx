import { useEffect, useRef } from 'react';
import { Transformer } from 'markmap-lib';
import { Markmap } from 'markmap-view';

interface MarkmapViewerProps {
    markdown: string;
    className?: string;
}

const transformer = new Transformer();

/**
 * MarkmapViewer - Renders an interactive mindmap from markdown
 * 
 * Input format (Markdown with bullet points):
 * ```
 * # Central Topic
 * 
 * ## Branch 1
 * - Sub-item 1
 * - Sub-item 2
 *   - Nested item
 * 
 * ## Branch 2
 * - Sub-item A
 * ```
 */
const MarkmapViewer = ({ markdown, className = '' }: MarkmapViewerProps) => {
    const svgRef = useRef<SVGSVGElement>(null);
    const markmapRef = useRef<Markmap | null>(null);

    useEffect(() => {
        if (!svgRef.current || !markdown) return;

        // Transform markdown to mindmap data
        const { root } = transformer.transform(markdown);

        // Clear previous content
        svgRef.current.innerHTML = '';

        // Create or update markmap
        if (markmapRef.current) {
            markmapRef.current.setData(root);
            markmapRef.current.fit();
        } else {
            markmapRef.current = Markmap.create(svgRef.current, {
                autoFit: true,
                duration: 500,
                maxWidth: 300,
                color: (node: any) => {
                    // Custom color based on depth
                    const colors = ['#03FC3B', '#6366F1', '#F59E0B', '#10B981', '#8B5CF6', '#EC4899'];
                    return colors[node.state?.depth % colors.length] || '#3B82F6';
                },
            }, root);
        }

        // Fit after a short delay to ensure proper sizing
        setTimeout(() => {
            markmapRef.current?.fit();
        }, 100);

        return () => {
            // Cleanup on unmount
        };
    }, [markdown]);

    if (!markdown) {
        return (
            <div className={`flex items-center justify-center bg-zinc-50 rounded-xl border border-dashed border-zinc-200 min-h-[400px] ${className}`}>
                <p className="text-zinc-400 text-sm">Nenhum mapa mental gerado ainda</p>
            </div>
        );
    }

    return (
        <div className={`bg-white rounded-xl border border-zinc-100 shadow-sm overflow-hidden ${className}`}>
            <svg
                ref={svgRef}
                className="w-full min-h-[400px]"
                style={{
                    fontFamily: 'system-ui, -apple-system, sans-serif',
                    background: 'linear-gradient(135deg, #fafafa 0%, #ffffff 100%)'
                }}
            />
        </div>
    );
};

export default MarkmapViewer;
