import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminPageLayout from '@/components/layout/AdminPageLayout';
import PageLayout from '@/components/layout/PageLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, Shield, Settings, UserCircle, Loader2 } from "lucide-react";
import { toast } from 'sonner';
import { APP_CONFIG } from "@/config/constants";

export default function AdminSettings() {
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [platformName, setPlatformName] = useState(APP_CONFIG.PLATFORM_NAME);
  const [adminEmail, setAdminEmail] = useState(APP_CONFIG.EMAILS.CONTACT);

  const handleSave = () => {
    setSaving(true);
    // Simulate API call
    setTimeout(() => {
      setSaving(false);
      toast.success("Configurações salvas com sucesso!");
    }, 1000);
  };

  return (
    <PageLayout>
      <AdminPageLayout
        title="Configurações"
        description="Gerencie as configurações do sistema e acesso."
        backTo="/admin"
      >
        <Tabs defaultValue="team" className="w-full max-w-4xl">
          <TabsList className="flex w-full bg-transparent border-b border-zinc-200 h-auto p-0 gap-8 mb-12 rounded-none">
            <TabsTrigger
              value="team"
              className="flex items-center gap-2 px-0 py-4 data-[state=active]:bg-transparent data-[state=active]:text-black data-[state=active]:border-b-2 data-[state=active]:border-black text-zinc-400 hover:text-black transition-all rounded-none uppercase tracking-[0.2em] font-bold text-tiny"
            >
              <Users className="w-3.5 h-3.5 uppercase" /> Time & Acesso
            </TabsTrigger>
            <TabsTrigger
              value="general"
              className="flex items-center gap-2 px-0 py-4 data-[state=active]:bg-transparent data-[state=active]:text-black data-[state=active]:border-b-2 data-[state=active]:border-black text-zinc-400 hover:text-black transition-all rounded-none uppercase tracking-[0.2em] font-bold text-tiny"
            >
              <Settings className="w-3.5 h-3.5" /> Geral
            </TabsTrigger>
            <TabsTrigger
              value="security"
              className="flex items-center gap-2 px-0 py-4 data-[state=active]:bg-transparent data-[state=active]:text-black data-[state=active]:border-b-2 data-[state=active]:border-black text-zinc-400 hover:text-black transition-all rounded-none uppercase tracking-[0.2em] font-bold text-tiny"
            >
              <Shield className="w-3.5 h-3.5" /> Segurança
            </TabsTrigger>
          </TabsList>

          {/* TEAM TAB */}
          <TabsContent value="team" className="space-y-12 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <div className="space-y-6">
              <div className="border-b border-black pb-4 mb-8">
                <h2 className="text-sm font-black uppercase tracking-[0.3em] text-black">Gestão de Usuários</h2>
                <p className="text-tiny text-zinc-400 uppercase tracking-widest mt-2">
                  Controle de acesso e permissões administrativas.
                </p>
              </div>

              <div className="grid gap-4">
                <div className="border border-zinc-200 p-8 flex items-center justify-between hover:border-black transition-colors group">
                  <div className="flex items-center gap-6">
                    <div className="w-12 h-12 flex items-center justify-center border border-zinc-100 bg-zinc-50 group-hover:bg-black group-hover:border-black transition-all">
                      <Users className="w-5 h-5 text-black group-hover:text-white transition-colors stroke-[1.5]" />
                    </div>
                    <div>
                      <h3 className="font-bold text-black text-sm uppercase tracking-tight">Membros da Equipe</h3>
                      <p className="text-xs text-zinc-400 mt-1">Gestão de permissões, administradores e editores ativos.</p>
                    </div>
                  </div>
                  <Button
                    onClick={() => navigate('/admin/users')}
                    className="bg-black text-white hover:bg-zinc-800 font-bold uppercase tracking-[0.2em] text-xxs h-11 px-8 rounded-none shadow-none border border-black"
                  >
                    Gerenciar Time
                  </Button>
                </div>

                <div className="border border-zinc-200 p-8 flex items-center justify-between hover:border-black transition-colors group">
                  <div className="flex items-center gap-6">
                    <div className="w-12 h-12 flex items-center justify-center border border-zinc-100 bg-zinc-50 group-hover:bg-black group-hover:border-black transition-all">
                      <UserCircle className="w-5 h-5 text-black group-hover:text-white transition-colors stroke-[1.5]" />
                    </div>
                    <div>
                      <h3 className="font-bold text-black text-sm uppercase tracking-tight">Meu Perfil</h3>
                      <p className="text-xs text-zinc-400 mt-1">Configurações de conta pessoal, biografia e ativos visuais.</p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    onClick={() => navigate('/admin/profile')}
                    className="border border-zinc-200 text-black hover:bg-black hover:text-white hover:border-black font-bold uppercase tracking-[0.2em] text-xxs h-11 px-8 rounded-none transition-all"
                  >
                    Editar Perfil
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* GENERAL TAB */}
          <TabsContent value="general" className="space-y-12 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <div className="max-w-xl space-y-8">
              <div className="border-b border-black pb-4">
                <h2 className="text-sm font-black uppercase tracking-[0.3em] text-black">Informações do Site</h2>
                <p className="text-tiny text-zinc-400 uppercase tracking-widest mt-2">Configurações globais de SEO e identificação de marca.</p>
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-xxs font-bold uppercase tracking-widest text-zinc-400">Nome da Plataforma</label>
                  <Input
                    value={platformName}
                    onChange={(e) => setPlatformName(e.target.value)}
                    className="h-12 bg-white border-zinc-200 rounded-none focus-visible:ring-0 focus-visible:border-black text-sm transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xxs font-bold uppercase tracking-widest text-zinc-400">Email Administrativo</label>
                  <Input
                    value={adminEmail}
                    onChange={(e) => setAdminEmail(e.target.value)}
                    className="h-12 bg-white border-zinc-200 rounded-none focus-visible:ring-0 focus-visible:border-black text-sm transition-all"
                  />
                </div>
                <div className="flex justify-start">
                  <Button
                    onClick={handleSave}
                    disabled={saving}
                    className="bg-black text-white hover:bg-zinc-800 font-bold uppercase tracking-[0.25em] h-12 px-8 text-tiny rounded-none shadow-none border border-black mt-4 transition-all w-auto"
                  >
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : "Salvar Alterações"}
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* SECURITY TAB */}
          <TabsContent value="security" className="space-y-12 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <div className="max-w-xl space-y-8">
              <div className="border-b border-black pb-4">
                <h2 className="text-sm font-black uppercase tracking-[0.3em] text-black">Segurança da Conta</h2>
                <p className="text-tiny text-zinc-400 uppercase tracking-widest mt-2">Protocolos de acesso e proteção de identidade.</p>
              </div>

              <div className="space-y-6">
                <div className="p-6 border border-zinc-100 bg-zinc-50 flex items-start gap-4">
                  <Shield className="w-4 h-4 text-black mt-0.5" />
                  <p className="text-xs text-zinc-500 leading-relaxed">
                    Para sua segurança, todos os tokens são criptografados. Recomenda-se a alteração semestral de credenciais de acesso através do fluxo oficial.
                  </p>
                </div>
                <Button
                  variant="outline"
                  onClick={() => navigate('/forgot-password')}
                  className="w-full border-zinc-200 text-black hover:bg-black hover:text-white hover:border-black font-bold uppercase tracking-[0.2em] text-tiny h-12 rounded-none transition-all"
                >
                  Redefinir Senha de Acesso
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </AdminPageLayout>
    </PageLayout>
  );
};


