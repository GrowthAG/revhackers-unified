
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from "@/integrations/supabase/client";
import PageLayout from '@/components/layout/PageLayout';
import AdminPageLayout from '@/components/layout/AdminPageLayout';
import MaterialForm from '@/components/admin/MaterialForm';
import { Loader2 } from 'lucide-react';

const AdminMaterialEdit = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [material, setMaterial] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchMaterial = async () => {
            if (!id) return;

            const { data, error } = await supabase
                .from('materials')
                .select('*')
                .eq('id', id)
                .single();

            if (error) {
                navigate('/admin/materials');
            } else {
                setMaterial(data);
            }
            setLoading(false);
        };

        fetchMaterial();
    }, [id, navigate]);

    if (loading) {
        return (
            <PageLayout>
                <div className="flex h-screen items-center justify-center pt-32">
                    <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                </div>
            </PageLayout>
        );
    }

    if (!material) return null;

    return (
        <PageLayout>
            <AdminPageLayout
                title="Editar Material"
                description={`Editando: ${material.title}`}
                backTo="/admin/materials"
                backLabel="Voltar aos Materiais"
            >
                <div className="max-w-5xl mx-auto">
                    <MaterialForm
                        initialData={{
                            ...material,
                            title: material.material_name || material.title,
                            type: material.material_type || material.type,
                            material_url: material.material_url || material.slug ? `/materiais/${material.slug}` : ''
                        }}
                        isEditing
                    />
                </div>
            </AdminPageLayout>
        </PageLayout>
    );
};

export default AdminMaterialEdit;
