
import { supabase } from '@/integrations/supabase/client';

export interface KnowledgeLibrary {
    id: string;
    name: string;
    description: string | null;
    created_at: string;
}

export const getAllLibraries = async () => {
    const { data, error } = await supabase
        .from('knowledge_libraries')
        .select('*')
        .order('name', { ascending: true });

    if (error) throw error;
    return data as KnowledgeLibrary[];
};

/**
 * Gera um documento de diagnóstico REI automaticamente na biblioteca do projeto
 */
export const createDocumentFromREI = async (
    projectId: string,
    projectName: string,
    formData: any,
    analysisResult: {
        score: number;
        radarData: { label: string; value: number }[];
        insights: string[];
    },
    diagnosticType: string
): Promise<string | null> => {
    try {
        // 1. Find or create the project's wiki library
        let { data: library } = await supabase
            .from('knowledge_libraries')
            .select('id')
            .eq('project_id', projectId)
            .single();

        if (!library) {
            // Create the wiki library for the project
            const { data: newLib, error: libError } = await supabase
                .from('knowledge_libraries')
                .insert({
                    name: `Wiki - ${projectName}`,
                    description: `Biblioteca de conhecimento do projeto ${projectName}`,
                    project_id: projectId,
                    type: 'project_wiki',
                    is_global: false
                })
                .select('id')
                .single();

            if (libError) throw libError;
            library = newLib;
        }

        // 2. Generate the markdown document content
        const content = generateREIMarkdown(projectName, formData, analysisResult, diagnosticType);

        // 3. Create the document
        const { data: doc, error: docError } = await supabase
            .from('agent_documents')
            .insert({
                library_id: library.id,
                filename: `Diagnóstico REI - ${projectName}.html`,
                title: `Diagnóstico REI - ${projectName}`,
                content: content,
                source_type: 'native',
                agent_id: '00000000-0000-0000-0000-000000000000',
                metadata: {
                    type: 'rei_diagnostic',
                    project_id: projectId,
                    score: analysisResult.score,
                    generated_at: new Date().toISOString()
                }
            })
            .select('id')
            .single();

        if (docError) throw docError;
        return doc?.id || null;
    } catch (error) {
        console.error('Error creating REI document:', error);
        return null;
    }
};

/**
 * Generates formatted Markdown from REI diagnostic data
 */
const generateREIMarkdown = (
    projectName: string,
    formData: any,
    analysisResult: { score: number; radarData: { label: string; value: number }[]; insights: string[] },
    diagnosticType: string
): string => {
    const date = new Date().toLocaleDateString('pt-BR');

    let md = `# Diagnóstico REI - ${projectName}\n\n`;
    md += `**Data:** ${date}\n`;
    md += `**Tipo:** ${diagnosticType}\n`;
    md += `**Score Total:** ${analysisResult.score}%\n\n`;
    md += `---\n\n`;

    // Radar Data (Pilares)
    md += `## Avaliação por Pilar\n\n`;
    md += `| Pilar | Score |\n`;
    md += `|-------|-------|\n`;
    analysisResult.radarData.forEach(item => {
        md += `| ${item.label} | ${item.value}% |\n`;
    });
    md += `\n`;

    // Insights
    if (analysisResult.insights && analysisResult.insights.length > 0) {
        md += `## Insights Estratégicos\n\n`;
        analysisResult.insights.forEach((insight, i) => {
            md += `${i + 1}. ${insight}\n`;
        });
        md += `\n`;
    }

    // Questions and Answers from formData
    md += `## Respostas do Diagnóstico\n\n`;

    if (formData && typeof formData === 'object') {
        Object.entries(formData).forEach(([key, value]) => {
            // Format the key into a readable question
            const question = key
                .replace(/_/g, ' ')
                .replace(/([A-Z])/g, ' $1')
                .trim();

            md += `### ${question}\n`;

            if (Array.isArray(value)) {
                value.forEach(v => md += `- ${v}\n`);
            } else if (typeof value === 'object' && value !== null) {
                md += `\`\`\`json\n${JSON.stringify(value, null, 2)}\n\`\`\`\n`;
            } else {
                md += `${value}\n`;
            }
            md += `\n`;
        });
    }

    return md;
};
