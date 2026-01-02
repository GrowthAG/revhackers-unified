import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from "@/integrations/supabase/client";
import AdminLayout from '@/components/layout/AdminLayout';
import AdminPageLayout from '@/components/layout/AdminPageLayout';
import CaseForm from '@/components/admin/CaseForm';
import { Loader2 } from 'lucide-react';
import { toast } from "sonner";

const AdminCaseEdit = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [caseStudy, setCaseStudy] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [fetchError, setFetchError] = useState<string | null>(null);

    useEffect(() => {
        const fetchCase = async () => {
            if (!id) return;

            const { data, error } = await supabase
                .from('cases')
                .select('*')
                .eq('id', id)
                .single();

            if (error) {
                console.error("Error fetching case:", error);
                setFetchError(error.message);
                toast.error(`Erro ao buscar case: ${error.message}`);
                // navigate('/admin/cases');
            } else {
                setCaseStudy(data);
            }
            setLoading(false);
        };

        fetchCase();
    }, [id, navigate]);

    if (loading) {
        return (
            <AdminLayout>
                <div className="flex h-[calc(100vh-60px)] items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-zinc-300" />
                </div>
            </AdminLayout>
        );
    }

    if (fetchError) {
        return (
            <AdminLayout>
                <div className="p-8 text-center text-red-500">
                    <h2 className="text-xl font-bold mb-2">Falha ao carregar Case</h2>
                    <p className="mb-4">{fetchError}</p>
                    <button onClick={() => window.location.reload()} className="underline text-sm">Tentar novamente</button>
                    <div className="mt-4">
                        <button onClick={() => navigate('/admin/cases')} className="text-sm text-zinc-500 hover:text-zinc-800">Voltar para listagem</button>
                    </div>
                </div>
            </AdminLayout>
        );
    }

    if (!caseStudy) return null;

    return (
        <AdminLayout>
            <div className="h-full">
                <CaseForm initialData={caseStudy} isEditing />
            </div>
        </AdminLayout>
    );
};

export default AdminCaseEdit;
