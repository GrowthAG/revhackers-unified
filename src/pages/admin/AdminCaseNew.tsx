import AdminLayout from '@/components/layout/AdminLayout';
import AdminPageLayout from '@/components/layout/AdminPageLayout';
import CaseForm from '@/components/admin/CaseForm';

const AdminCaseNew = () => {
    return (
        <AdminLayout>
            <div className="h-full">
                <CaseForm />
            </div>
        </AdminLayout>
    );
};

export default AdminCaseNew;
