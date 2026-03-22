import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Loader2 } from "lucide-react";
import AdminLayout from "@/components/layout/AdminLayout";
import ProposalForm from "@/components/admin/ProposalForm";
import { getReiProjectById } from "@/api/reiProjects";
import { getLatestReiResponse } from "@/api/reiResponses";
import AdminPageLayout from "@/components/layout/AdminPageLayout";

const AdminProposalNew = () => {
    const [searchParams] = useSearchParams();
    const projectId = searchParams.get('projectId');
    const [loading, setLoading] = useState(!!projectId);
    const [initialData, setInitialData] = useState<any>(null);

    useEffect(() => {
        const loadContext = async () => {
            if (!projectId) return;

            try {
                setLoading(true);
                const project = await getReiProjectById(projectId);

                let diagnosisData = null;
                try {
                    const response = await getLatestReiResponse(projectId);
                    if (response?.responses) {
                        diagnosisData = response.responses;
                    }
                } catch (e) {
                    console.warn("No diagnosis response found", e);
                }

                if (project) {
                    setInitialData({
                        client_name: project.client_name,
                        client_email: project.client_email,
                        client_contact_name: project.client_name?.split(' ')[0] || '', // Guess first name
                        // Pass the rich diagnosis data as context for the AI
                        crm_data: {
                            ...((diagnosisData as any) || {}),
                            source: 'rei_diagnosis',
                            project_id: projectId
                        }
                    });
                }
            } catch (error) {
                console.error("Failed to load project context", error);
            } finally {
                setLoading(false);
            }
        };

        loadContext();
    }, [projectId]);

    if (loading) {
        return (
            <AdminLayout>
                <div className="flex h-[80vh] items-center justify-center">
                    <Loader2 className="w-8 h-8 animate-spin text-zinc-400" />
                </div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout>
            <div className="h-full">
                <AdminPageLayout title="Nova Proposta" backTo="/admin/proposals" backLabel="Voltar às Propostas">
                    <ProposalForm initialData={initialData} />
                </AdminPageLayout>
            </div>
        </AdminLayout>
    );
};

export default AdminProposalNew;
