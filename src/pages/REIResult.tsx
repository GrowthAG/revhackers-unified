import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { getReiResponseById } from '@/api/reiResponses';
import PageLayout from '@/components/layout/PageLayout';
import Section from '@/components/ui/Section';
import ReiDashboard from '@/components/rei/ReiDashboard';

export default function REIResult() {
    const { id } = useParams();
    const [response, setResponse] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadResponse = async () => {
            if (!id) return;

            try {
                const data = await getReiResponseById(id);
                setResponse(data);
            } catch (error) {
                console.error('Erro ao carregar resultado:', error);
            } finally {
                setLoading(false);
            }
        };

        loadResponse();
    }, [id]);

    if (loading) {
        return (
            <PageLayout>
                <Section variant="dark" className="min-h-screen flex items-center justify-center">
                    <div className="text-white text-lg">Carregando resultado...</div>
                </Section>
            </PageLayout>
        );
    }

    if (!response) {
        return (
            <PageLayout>
                <Section variant="dark" className="min-h-screen flex items-center justify-center">
                    <div className="text-center">
                        <h2 className="text-2xl font-bold text-white mb-4">Resultado não encontrado</h2>
                        <Link to="/rei" className="text-revgreen hover:underline">
                            Voltar para o Hub REI
                        </Link>
                    </div>
                </Section>
            </PageLayout>
        );
    }

    // Determinar tipo para uppercase
    const typeUpper = response.project?.type?.toUpperCase() || 'CONSULTING';

    return (
        <PageLayout>
            <Section variant="dark" className="min-h-screen pt-28 pb-20">
                <div className="container-custom max-w-6xl mx-auto">
                    <Link to="/rei" className="inline-flex items-center text-sm text-gray-500 hover:text-revgreen mb-8 transition-colors">
                        <ArrowLeft className="w-4 h-4 mr-2" /> Voltar para o Hub
                    </Link>

                    {/* Disclaimer de Versão */}
                    <div className="mb-6 p-4 bg-white/5 border border-white/10 rounded-sm">
                        <div className="flex items-center justify-between text-xs text-gray-400">
                            <div className="flex items-center gap-4">
                                <span>
                                    📊 Resultado calculado em: {new Date(response.calculated_at || response.created_at).toLocaleDateString('pt-BR')}
                                </span>
                                {response.score_version && (
                                    <span className="px-2 py-1 bg-revgreen/10 text-revgreen rounded">
                                        Versão {response.score_version}
                                    </span>
                                )}
                            </div>
                            <span className="text-gray-500">
                                Metodologia atual
                            </span>
                        </div>
                    </div>

                    <ReiDashboard
                        type={typeUpper}
                        score={response.total_score || 0}
                        radarData={response.radar_data || []}
                        insights={response.insights || []}
                        onAction={() => console.log('Action clicked')}
                    />
                </div>
            </Section>
        </PageLayout>
    );
}
