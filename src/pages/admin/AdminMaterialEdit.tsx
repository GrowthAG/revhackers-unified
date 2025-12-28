
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from "@/integrations/supabase/client";
import PageLayout from '@/components/layout/PageLayout';
import AdminPageLayout from '@/components/layout/AdminPageLayout';
import MaterialForm from '@/components/admin/MaterialForm';
import { Loader2 } from 'lucide-react';
import { toast } from "sonner";

const AdminMaterialEdit = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [material, setMaterial] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [fetchError, setFetchError] = useState<string | null>(null);

    useEffect(() => {
        const fetchMaterial = async () => {
            if (!id) return;

            console.log('Fetching material:', id);
            const { data, error } = await supabase
                .from('materials')
                .select('*')
                .eq('id', id)
                .single();

            if (error) {
                console.error("Error fetching material:", error);
                setFetchError(error.message);
                toast.error(`Erro ao buscar material: ${error.message}`);
                // navigate('/admin/materials');
            } else {
                console.log('Material data:', data);
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

    if (fetchError) {
        return (
            <PageLayout>
                <AdminPageLayout title="Erro" backTo="/admin/materials" backLabel="Voltar">
                    <div className="p-8 text-center">
                        <h2 className="text-xl font-bold text-red-500 mb-2">Falha ao carregar material</h2>
                        <p className="text-gray-600 mb-4">{fetchError}</p>
                        <button onClick={() => window.location.reload()} className="underline">Tentar novamente</button>
                    </div>
                </AdminPageLayout>
            </PageLayout>
        );
    }

    if (!material) return null;

    // Mapping DB columns to Form Interface
    // DB: material_name, material_type, link_material, slug, etc.
    // Form: title, type, material_url, etc.
    const formInitialData = {
        id: material.id,
        title: material.material_name || material.title || '',
        slug: material.slug || '',
        type: material.material_type || material.type || 'framework',
        description: material.description || '',
        cover_image: material.cover_image || '',
        published: material.published || false,
        is_active: material.is_active || true,
        material_url: material.link_material || material.material_url || ''
    };

    return (
        <PageLayout>
            <AdminPageLayout
                title="Editar Material"
                description={`Editando: ${formInitialData.title}`}
                backTo="/admin/materials"
                backLabel="Voltar aos Materiais"
            >
                <div className="max-w-5xl mx-auto">
                    <MaterialForm
                        initialData={formInitialData}
                        isEditing
                    />
                </div>
            </AdminPageLayout>
        </PageLayout>
    );
};

export default AdminMaterialEdit;
