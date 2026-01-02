import PageLayout from '@/components/layout/PageLayout';
import ClientForm from '@/pages/admin/ClientForm';

const ClientOnboarding = () => {
    return (
        <PageLayout>
            <div className="pt-32 pb-24 px-6 bg-zinc-50 min-h-screen">
                <div className="max-w-4xl mx-auto space-y-12">
                    <div className="text-center space-y-4">
                        <h1 className="text-3xl md:text-4xl font-black tracking-tighter text-black uppercase">
                            Bem-vindo à RevHackers
                        </h1>
                        <p className="text-sm md:text-base text-zinc-500 max-w-lg mx-auto leading-relaxed font-medium">
                            Preencha os dados abaixo para iniciarmos a configuração da sua máquina de vendas.
                        </p>
                    </div>

                    <ClientForm mode="public" />
                </div>
            </div>
        </PageLayout>
    );
};

export default ClientOnboarding;
