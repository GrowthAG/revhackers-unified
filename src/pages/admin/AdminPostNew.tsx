import AdminLayout from '@/components/layout/AdminLayout';
import AdminPageLayout from '@/components/layout/AdminPageLayout';
import PostEditor from '@/components/admin/PostEditor';

const AdminPostNew = () => {
    return (
        <AdminLayout>
            <div className="h-full">
                <PostEditor />
            </div>
        </AdminLayout>
    );
};

export default AdminPostNew;
