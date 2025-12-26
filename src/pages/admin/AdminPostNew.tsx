import PageLayout from '@/components/layout/PageLayout';
import AdminPageLayout from '@/components/layout/AdminPageLayout';
import PostEditor from '@/components/admin/PostEditor';

const AdminPostNew = () => {
    return (
        <PageLayout>
            <AdminPageLayout
                title="Novo Artigo"
                description="Escreva um novo artigo para o blog."
                backTo="/admin/posts"
                backLabel="Voltar aos Artigos"
            >
                <div className="max-w-5xl mx-auto">
                    <PostEditor />
                </div>
            </AdminPageLayout>
        </PageLayout>
    );
};

export default AdminPostNew;
