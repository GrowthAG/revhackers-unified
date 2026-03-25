
import { Settings, Zap, BarChart3, Globe, Database, Mail } from 'lucide-react';

interface CaseTechStackProps {
    category: string;
    customTools?: string[];
}

const CaseTechStack = ({ category, customTools }: CaseTechStackProps) => {
    // Map categories to relevant icons/tools (Fallback logic)
    const getStack = (cat: string) => {
        const defaultStack = [
            { name: "Analytics", icon: BarChart3 },
            { name: "Automation", icon: Zap },
            { name: "CRM", icon: Database },
        ];

        if (cat.includes('Educação') || cat.includes('SaaS')) {
            return [
                ...defaultStack,
                { name: "Web App", icon: Globe },
                { name: "Email Mkt", icon: Mail },
            ];
        }

        if (cat.includes('Tecnologia') || cat.includes('B2B')) {
            return [
                ...defaultStack,
                { name: "Integration", icon: Settings },
                { name: "LinkedIn", icon: Globe },
            ];
        }

        return defaultStack;
    };

    // Use custom tools if provided, otherwise fallback to category based logic
    const displayStack = customTools && customTools.length > 0
        ? customTools.map(tool => ({ name: tool, icon: tool.toLowerCase().includes('ads') ? Globe : Settings })) // Simple icon mapping fallback
        : getStack(category);

    return (
        <div className="py-10 border-y border-zinc-100 bg-zinc-50/50 mb-20">
            <div className="container-custom">
                <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                    <span className="text-xs font-mono-tech uppercase tracking-widest text-zinc-400 shrink-0">
                        Tech Stack Utilizado
                    </span>

                    <div className="flex flex-wrap justify-center md:justify-end gap-8 md:gap-12 opacity-80 hover:opacity-100 transition-opacity duration-300">
                        {displayStack.map((tool, idx) => (
                            <div key={idx} className="flex items-center gap-3 transition-transform hover:-translate-y-1 duration-300 bg-white border border-zinc-200 px-4 py-2 rounded-full shadow-sm">
                                <tool.icon strokeWidth={1.5} className="w-4 h-4 text-zinc-400" />
                                <span className="text-xs font-bold uppercase tracking-wider text-zinc-800 font-mono-tech">{tool.name}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CaseTechStack;
