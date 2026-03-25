
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from "@/integrations/supabase/client";
import AdminLayout from '@/components/layout/AdminLayout';
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

            const { data, error } = await supabase
                .from('materials')
                .select('*')
                .eq('id', id)
                .single();

            if (error) {
                console.error("Error fetching material:", error);
                setFetchError(error.message);
                toast.error(`Erro ao buscar material: ${error.message}`);
            } else {
                setMaterial(data);
            }
            setLoading(false);
        };

        fetchMaterial();
    }, [id, navigate]);

    if (loading) {
        return (
            <AdminLayout>
                <div className="flex h-screen items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-zinc-400" />
                </div>
            </AdminLayout>
        );
    }

    if (fetchError) {
        return (
            <AdminLayout>
                <AdminPageLayout title="Erro" backTo="/admin/materials" backLabel="Voltar">
                    <div className="p-8 text-center">
                        <h2 className="text-xl font-bold text-red-500 mb-2">Falha ao carregar material</h2>
                        <p className="text-zinc-600 mb-4">{fetchError}</p>
                        <button onClick={() => window.location.reload()} className="underline">Tentar novamente</button>
                    </div>
                </AdminPageLayout>
            </AdminLayout>
        );
    }

    if (!material) return null;

    // Mapping DB columns to Form Interface
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
        <AdminLayout>
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
        </AdminLayout>
    );
};

export default AdminMaterialEdit;

