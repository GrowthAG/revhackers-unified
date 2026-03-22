import AdminLayout from '@/components/layout/AdminLayout';
import AdminPageLayout from '@/components/layout/AdminPageLayout';
import MaterialForm from '@/components/admin/MaterialForm';

const AdminMaterialNew = () => {
    return (
        <AdminLayout>
            <div className="h-full">
                <AdminPageLayout title="Novo Material" backTo="/admin/materials" backLabel="Voltar aos Materiais">
                    <MaterialForm />
                </AdminPageLayout>
            </div>
        </AdminLayout>
    );
};

export default AdminMaterialNew;
