import { useNavigate, useParams } from 'react-router-dom';
import AdminLayout from '@/components/layout/AdminLayout';
import AdminPageLayout from '@/components/layout/AdminPageLayout';
import ClientFormContent from './ClientFormContent';

interface ClientFormProps {
    initialData?: any;
    isEditing?: boolean;
    mode?: 'admin' | 'public';
}

const ClientForm = ({ initialData, isEditing = false, mode = 'admin' }: ClientFormProps) => {
    const { id } = useParams();
    const navigate = useNavigate();

    // Determine actual editing state from props or URL
    const isActuallyEditing = isEditing || !!id;
    const clientId = id;

    const handleSuccess = (client: any) => {
        if (mode === 'admin') {
            navigate('/admin/clients');
        } else {
            navigate('/onboarding/success');
        }
    };

    const handleCancel = () => {
        if (mode === 'admin') {
            navigate('/admin/clients');
        }
    };

    const FormContent = (
        <ClientFormContent
            initialData={initialData}
            isEditing={isActuallyEditing}
            mode={mode}
            clientId={clientId}
            onSuccess={handleSuccess}
            onCancel={mode === 'admin' ? handleCancel : undefined}
        />
    );

    if (mode === 'public') {
        return FormContent;
    }

    return (
        <AdminLayout>
            <AdminPageLayout
                title={isActuallyEditing ? "Editar Perfil do Cliente" : "Cadastrar Novo Cliente"}
                description="Defina os parâmetros mestres do cliente para orquestração da jornada GTM."
                backTo={mode === 'admin' ? "/admin/clients" : undefined}
                backLabel="VOLTAR"
                showBackButton={mode === 'admin'}
            >
                {FormContent}
            </AdminPageLayout>
        </AdminLayout>
    );
};

export default ClientForm;
