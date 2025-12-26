import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from "@/integrations/supabase/client";
import PageLayout from '@/components/layout/PageLayout';
import AdminPageLayout from '@/components/layout/AdminPageLayout';
import CaseForm from '@/components/admin/CaseForm';
import { Loader2 } from 'lucide-react';

const AdminCaseEdit = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [caseStudy, setCaseStudy] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCase = async () => {
            if (!id) return;

            const { data, error } = await supabase
                .from('cases')
                .select('*')
                .eq('id', id)
                .single();

            if (error) {
                navigate('/admin/cases');
            } else {
                setCaseStudy(data);
            }
            setLoading(false);
        };

        fetchCase();
    }, [id, navigate]);

    if (loading) {
        return (
            <PageLayout>
                <div className="flex h-[50vh] items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                </div>
            </PageLayout>
        );
    }

    if (!caseStudy) return null;

    return (
        <PageLayout>
            <AdminPageLayout
                title="Editar Case"
                description={`Editando: ${caseStudy.client_name}`}
                backTo="/admin/cases"
                backLabel="Voltar aos Cases"
            >
                <div className="max-w-5xl mx-auto">
                    <CaseForm initialData={caseStudy} isEditing />
                </div>
            </AdminPageLayout>
        </PageLayout>
    );
};

export default AdminCaseEdit;
