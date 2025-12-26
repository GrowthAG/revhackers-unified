
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Mail, Copy, CheckCircle2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface TemplateItem {
    name: string;
    subject: string;
    body: string;
}

interface EmailTemplatesProps {
    title?: string;
    templates: TemplateItem[];
}

const EmailTemplates = ({ title, templates }: EmailTemplatesProps) => {
    const { toast } = useToast();
    const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

    const handleCopy = (text: string, index: number) => {
        navigator.clipboard.writeText(text);
        setCopiedIndex(index);
        toast({
            title: "Copiado!",
            description: "O template foi copiado para sua área de transferência.",
        });
        setTimeout(() => setCopiedIndex(null), 2000);
    };

    return (
        <div className="my-12 not-prose">
            {title && <h2 className="text-2xl font-bold text-gray-900 mb-6">{title}</h2>}
            <div className="space-y-6">
                {templates.map((template, index) => (
                    <Card key={index} className="bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
                        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                            <div className="text-sm font-bold text-gray-900 flex items-center gap-2">
                                <Mail className="w-4 h-4 text-revgreen" />
                                {template.name}
                            </div>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleCopy(template.body, index)}
                                className="h-7 text-[10px] uppercase font-bold text-gray-500 hover:text-revgreen hover:bg-revgreen/10 transition-colors"
                            >
                                {copiedIndex === index ? (
                                    <span className="flex items-center gap-1 text-revgreen">
                                        <CheckCircle2 className="w-3 h-3" /> Copiado
                                    </span>
                                ) : (
                                    <span className="flex items-center gap-1">
                                        <Copy className="w-3 h-3" /> Copiar
                                    </span>
                                )}
                            </Button>
                        </div>
                        <div className="p-6">
                            <div className="text-xs text-gray-500 font-mono mb-4 border-b border-gray-100 pb-2 flex gap-2">
                                <span className="font-bold text-gray-700 shrink-0">Assunto:</span> {template.subject}
                            </div>
                            <pre className="font-mono text-sm leading-relaxed whitespace-pre-wrap text-gray-700">
                                {template.body}
                            </pre>
                        </div>
                    </Card>
                ))}
            </div>
        </div>
    );
};

export default EmailTemplates;
