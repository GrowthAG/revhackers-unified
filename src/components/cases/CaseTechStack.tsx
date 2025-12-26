
import { Settings, Zap, BarChart3, Globe, Database, Mail } from 'lucide-react';

interface CaseTechStackProps {
    category: string;
}

const CaseTechStack = ({ category }: CaseTechStackProps) => {
    // Map categories to relevant icons/tools (simulated logic)
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

    const stack = getStack(category);

    return (
        <div className="py-10 border-y border-gray-100 bg-gray-50/50 mb-20">
            <div className="container-custom">
                <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                    <span className="text-xs font-mono-tech uppercase tracking-widest text-gray-400 shrink-0">
                        Tech Stack Utilizado
                    </span>

                    <div className="flex flex-wrap justify-center md:justify-end gap-8 md:gap-12 opacity-60 hover:opacity-100 transition-opacity duration-300">
                        {stack.map((tool, idx) => (
                            <div key={idx} className="flex items-center gap-3 transition-transform hover:-translate-y-1 duration-300">
                                <tool.icon strokeWidth={1.5} className="w-5 h-5 text-gray-800" />
                                <span className="text-sm font-medium text-gray-600 font-mono-tech">{tool.name}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CaseTechStack;
