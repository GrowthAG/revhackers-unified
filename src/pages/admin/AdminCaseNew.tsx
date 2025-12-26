import PageLayout from '@/components/layout/PageLayout';
import AdminPageLayout from '@/components/layout/AdminPageLayout';
import CaseForm from '@/components/admin/CaseForm';

const AdminCaseNew = () => {
    return (
        <PageLayout>
            <AdminPageLayout
                title="Novo Case de Sucesso"
                description="Adicione um novo case de sucesso."
                backTo="/admin/cases"
                backLabel="Voltar aos Cases"
            >
                <div className="max-w-5xl mx-auto">
                    <CaseForm />
                </div>
            </AdminPageLayout>
        </PageLayout>
    );
};

export default AdminCaseNew;
