import AdminLayout from '@/components/layout/AdminLayout';
import AdminPageLayout from '@/components/layout/AdminPageLayout';
import MaterialForm from '@/components/admin/MaterialForm';

const AdminMaterialNew = () => {
    return (
        <AdminLayout>
            <div className="h-full">
                <MaterialForm />
            </div>
        </AdminLayout>
    );
};

export default AdminMaterialNew;
