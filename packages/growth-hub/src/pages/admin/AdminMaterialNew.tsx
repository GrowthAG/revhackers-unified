import PageLayout from '@/components/layout/PageLayout';
import AdminPageLayout from '@/components/layout/AdminPageLayout';
import MaterialForm from '@/components/admin/MaterialForm';

const AdminMaterialNew = () => {
    return (
        <PageLayout>
            <AdminPageLayout
                title="Novo Material Rico"
                description="Adicione um novo material (ebook, planilha, etc) para geração de leads."
                backTo="/admin/materials"
                backLabel="Voltar aos Materiais"
            >
                <div className="max-w-5xl mx-auto">
                    <MaterialForm />
                </div>
            </AdminPageLayout>
        </PageLayout>
    );
};

export default AdminMaterialNew;
