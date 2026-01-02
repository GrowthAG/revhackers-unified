import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { getReiProjectById } from '@/api/reiProjects';
import PageLayout from '@/components/layout/PageLayout';
import Section from '@/components/ui/Section';
import ReiDashboard from '@/components/rei/ReiDashboard';
import { useToast } from '@/components/ui/use-toast';

export default function REIResult() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { toast } = useToast();
    const [project, setProject] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProject = async () => {
            if (!id) return;

            try {
                const data = await getReiProjectById(id);
                setProject(data);
            } catch (error) {
                console.error("Erro ao carregar projeto", error);

                // Fallback mock for demo if fetch fails or data is missing
                setProject({
                    type: 'CONSULTING',
                    analysis_result: {
                        score: 72,
                        radarData: [
                            { label: "PROCESSOS", value: 65 },
                            { label: "PESSOAS", value: 80 },
                            { label: "DADOS", value: 45 },
                            { label: "TECNOLOGIA", value: 90 },
                        ],
                        insights: [
                            "MOCK: Dados do projeto não encontrados ou erro de carregamento.",
                            "MOCK: Exibindo dados de exemplo para validação visual.",
                            "MOCK: Verifique a integração com o backend."
                        ]
                    }
                });
            } finally {
                setLoading(false);
            }
        };

        fetchProject();
    }, [id]);

    const handleAction = () => {
        toast({
            title: "Simulação de Report",
            description: "Em produção, isso geraria um PDF do diagnóstico.",
            duration: 3000
        });
    };

    if (loading) {
        return (
            <PageLayout>
                <Section variant="light" className="min-h-screen flex items-center justify-center bg-white">
                    <div className="text-black text-lg font-bold">Carregando resultado...</div>
                </Section>
            </PageLayout>
        );
    }

    if (!project) {
        return (
            <PageLayout>
                <Section variant="light" className="min-h-screen flex items-center justify-center bg-white">
                    <div className="text-center">
                        <h2 className="text-2xl font-bold text-black mb-4">Resultado não encontrado</h2>
                        <button onClick={() => navigate('/rei-hub')} className="text-black hover:underline font-medium">
                            Voltar para o Hub REI
                        </button>
                    </div>
                </Section>
            </PageLayout>
        );
    }

    // Use stored analysis result or fallback to defaults if legacy project
    const result = project?.analysis_result || {
        score: 0,
        radarData: [],
        insights: ["Aguardando diagnóstico..."]
    };

    return (
        <PageLayout>
            <Section variant="light" className="min-h-screen pt-28 pb-20 bg-white">
                <div className="container-custom max-w-6xl mx-auto">
                    {/* Back Button */}
                    <button
                        onClick={() => navigate('/rei-hub')}
                        className="inline-flex items-center text-[10px] text-zinc-400 hover:text-black mb-8 transition-colors uppercase tracking-[0.2em] font-bold"
                    >
                        <ArrowLeft className="w-3 h-3 mr-2" /> Voltar ao Hub
                    </button>

                    <ReiDashboard
                        type={project?.type || 'CONSULTING'}
                        score={result.score}
                        radarData={result.radarData}
                        insights={result.insights}
                        onAction={handleAction}
                    />
                </div>
            </Section>
        </PageLayout>
    );
}
