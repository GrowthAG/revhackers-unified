import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import PageLayout from '@/components/layout/PageLayout';
import Section from '@/components/ui/Section';
import AdminUsers from './AdminUsers';
import ProfileSettings from './ProfileSettings';

const Settings = () => {
    return (
        <PageLayout>
            <Section variant="light" className="py-20 bg-white min-h-screen">
                <div className="container-custom max-w-7xl">
                    {/* Header */}
                    <div className="mb-12">
                        <h1 className="text-4xl md:text-5xl font-black text-black mb-2 uppercase tracking-[0.2em]">
                            Sistema
                        </h1>
                        <p className="text-zinc-500 text-xs uppercase tracking-[0.3em] font-bold">
                            Usuários & Configurações
                        </p>
                    </div>

                    {/* Tabs */}
                    <Tabs defaultValue="users" className="w-full">
                        <TabsList className="bg-zinc-100 border-b border-zinc-200 rounded-none h-12 p-0 w-full justify-start">
                            <TabsTrigger
                                value="users"
                                className="data-[state=active]:bg-white data-[state=active]:border-b-2 data-[state=active]:border-black rounded-none px-8 h-12 text-xs uppercase tracking-widest font-bold"
                            >
                                Usuários
                            </TabsTrigger>
                            <TabsTrigger
                                value="profile"
                                className="data-[state=active]:bg-white data-[state=active]:border-b-2 data-[state=active]:border-black rounded-none px-8 h-12 text-xs uppercase tracking-widest font-bold"
                            >
                                Meu Perfil
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="users" className="mt-8">
                            <AdminUsers />
                        </TabsContent>

                        <TabsContent value="profile" className="mt-8">
                            <ProfileSettings />
                        </TabsContent>
                    </Tabs>
                </div>
            </Section>
        </PageLayout>
    );
};

export default Settings;
