import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Save, User, Upload, ArrowLeft } from "lucide-react";
import AdminLayout from "@/components/layout/AdminLayout";
import AdminPageLayout from "@/components/layout/AdminPageLayout";
import { uploadImageToSupabase } from "@/utils/uploadImageToSupabase";

const ProfileSettings = () => {
    const { user, signOut } = useAuth();
    // ...

    // NOVO: Alerta visual para usuário de teste
    if (user?.id === 'dev-bypass-user') {
        return (
            <AdminLayout>
                <AdminPageLayout title="Meu Perfil" description="Acesso Restrito">
                    <div className="bg-zinc-50 border border-zinc-200 text-zinc-800 p-8 text-center space-y-4">
                        <h2 className="text-xl font-bold">⚠️ MODO DE DESENVOLVIMENTO (DEV BYPASS)</h2>
                        <p>Você está usando um usuário simulado que NÃO tem permissão de escrita no banco de dados.</p>
                        <p className="font-bold">Para salvar fotos ou dados, você precisa fazer login com uma conta real.</p>
                        <Button
                            onClick={() => {
                                localStorage.clear();
                                window.location.reload();
                            }}
                            variant="destructive"
                            className="mt-4"
                        >
                            SAIR E FAZER LOGIN REAL
                        </Button>
                    </div>
                </AdminPageLayout>
            </AdminLayout>
        );
    }
    const navigate = useNavigate();
    const { toast } = useToast();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);

    const [formData, setFormData] = useState({
        username: "",
        full_name: "",
        bio: "",
        avatar_url: "",
        cpf: "",
        personal_email: "",
        address: "",
        job_title: "",
    });

    useEffect(() => {
        const fetchProfile = async () => {
            if (!user) return;

            try {
                const { data, error } = await supabase
                    .from("profiles")
                    .select("username, full_name, avatar_url, bio, cpf, personal_email, address, job_title")
                    .eq("id", user.id)
                    .single();

                if (error) {
                    console.error("Error fetching profile:", error);
                }

                if (data) {
                    setFormData({
                        username: data.username || "",
                        full_name: data.full_name || "",
                        bio: data.bio || "",
                        avatar_url: data.avatar_url || "",
                        cpf: data.cpf || "",
                        personal_email: data.personal_email || "",
                        address: data.address || "",
                        job_title: data.job_title || "",
                    });
                }
            } catch (error) {
                console.error("Error:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, [user]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return;

        const file = e.target.files[0];
        setUploading(true);

        try {
            console.log("Iniciando upload para user:", user?.id);
            if (!user?.id) throw new Error("Usuário não autenticado.");

            // Passamos user.id para criar estrutura de pasta (ex: user_id/foto.jpg)
            // Isso satisfaz políticas de RLS que exigem pasta própria
            const publicUrl = await uploadImageToSupabase(file, "profiles", user.id);
            if (publicUrl) {
                setFormData((prev) => ({ ...prev, avatar_url: publicUrl }));
                toast({ title: "Avatar atualizado! Lembre-se de salvar." });
            }
        } catch (error: any) {
            console.error("Avatar upload error:", error);
            toast({
                title: "Erro no upload",
                description: error.message || "Verifique o console e se o bucket 'profiles' existe.",
                variant: "destructive"
            });
        } finally {
            setUploading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;
        setSaving(true);

        try {
            const updates = {
                id: user.id,
                email: user.email,
                username: formData.username,
                full_name: formData.full_name,
                avatar_url: formData.avatar_url,
                bio: formData.bio,
                cpf: formData.cpf,
                personal_email: formData.personal_email,
                address: formData.address,
                job_title: formData.job_title,
                // updated_at: new Date().toISOString(), // Column missing in DB, removing to fix save error
            };

            const { error } = await supabase
                .from("profiles")
                .upsert(updates);

            if (error) throw error;

            toast({
                title: "Perfil atualizado!",
                description: "Suas informações foram salvas com sucesso.",
            });
        } catch (error: any) {
            console.error(error);
            toast({
                title: "Erro ao salvar",
                description: error.message,
                variant: "destructive",
            });
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <AdminLayout>
                <div className="flex h-[50vh] items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                </div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout>
            <AdminPageLayout
                title="Meu Perfil"
                description="Gerencie seus dados. Para colaboradores, o preenchimento completo é obrigatório."
                backTo="/admin"
                backLabel="Voltar ao Dashboard"
            >
                <div className="max-w-6xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <form onSubmit={handleSubmit}>
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">

                            {/* LEFT COLUMN: AVATAR & INFO */}
                            <div className="md:col-span-3 space-y-6">
                                <div className="group relative w-full aspect-square bg-white border border-zinc-200 hover:border-black transition-all duration-300 flex items-center justify-center overflow-hidden">
                                    {formData.avatar_url ? (
                                        <img src={formData.avatar_url} alt="Avatar" className="w-full h-full object-cover transition-all duration-500" />
                                    ) : (
                                        <User className="h-16 w-16 text-zinc-200 group-hover:text-black transition-colors" />
                                    )}
                                    <label
                                        htmlFor="avatar-upload"
                                        className="absolute inset-0 bg-black/90 flex items-center justify-center text-white text-[10px] font-black uppercase tracking-[0.2em] opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                                    >
                                        Alterar Foto
                                    </label>
                                    <input
                                        id="avatar-upload"
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={handleAvatarUpload}
                                    />
                                    {uploading && (
                                        <div className="absolute inset-0 bg-white/90 flex items-center justify-center">
                                            <Loader2 className="animate-spin text-black w-6 h-6" />
                                        </div>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <h3 className="text-sm font-black uppercase tracking-[0.2em] text-black">Fotografia</h3>
                                    <p className="text-[10px] text-zinc-400 uppercase tracking-widest leading-relaxed">
                                        Usada em artigos e identificação interna. Use uma foto profissional.
                                    </p>
                                </div>

                                <div className="pt-6 border-t border-zinc-100">
                                    <Button
                                        type="submit"
                                        disabled={saving || uploading}
                                        className="w-full bg-black text-white hover:bg-zinc-900 font-black uppercase tracking-[0.2em] h-12 text-[10px] rounded-none shadow-none border border-black transition-all"
                                    >
                                        {saving ? <Loader2 className="animate-spin h-4 w-4" /> : "Salvar Dados"}
                                    </Button>
                                </div>
                            </div>

                            {/* RIGHT COLUMN: FORM FIELDS */}
                            <div className="md:col-span-9 bg-white border border-zinc-100 p-8 shadow-sm">
                                <div className="space-y-6">

                                    {/* ROW 1 */}
                                    <div className="grid md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <Label htmlFor="full_name" className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Nome Completo</Label>
                                            <Input
                                                id="full_name"
                                                name="full_name"
                                                value={formData.full_name}
                                                onChange={handleChange}
                                                className="h-11 bg-zinc-50/30 border-zinc-200 rounded-none focus-visible:ring-0 focus-visible:border-black text-xs font-medium transition-all placeholder:text-zinc-200"
                                                placeholder="EX: JOÃO SILVA"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="username" className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Username</Label>
                                            <Input
                                                id="username"
                                                name="username"
                                                value={formData.username}
                                                onChange={handleChange}
                                                className="h-11 bg-zinc-50/30 border-zinc-200 rounded-none focus-visible:ring-0 focus-visible:border-black text-xs font-medium transition-all placeholder:text-zinc-200"
                                                placeholder="EX: JOAOSILVA"
                                            />
                                        </div>
                                    </div>

                                    {/* ROW 2 */}
                                    <div className="grid md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <Label htmlFor="job_title" className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Cargo / Função</Label>
                                            <Input
                                                id="job_title"
                                                name="job_title"
                                                value={formData.job_title}
                                                onChange={handleChange}
                                                className="h-11 bg-zinc-50/30 border-zinc-200 rounded-none focus-visible:ring-0 focus-visible:border-black text-xs font-medium transition-all placeholder:text-zinc-200"
                                                placeholder="EX: HEAD DE MARKETING"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="cpf" className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">CPF / Registro</Label>
                                            <Input
                                                id="cpf"
                                                name="cpf"
                                                value={formData.cpf}
                                                onChange={handleChange}
                                                className="h-11 bg-zinc-50/30 border-zinc-200 rounded-none focus-visible:ring-0 focus-visible:border-black text-xs font-medium transition-all placeholder:text-zinc-200"
                                                placeholder="000.000.000-00"
                                            />
                                        </div>
                                    </div>

                                    {/* ROW 3 */}
                                    <div className="space-y-2">
                                        <Label htmlFor="personal_email" className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">E-mail de Contato</Label>
                                        <Input
                                            id="personal_email"
                                            name="personal_email"
                                            value={formData.personal_email}
                                            onChange={handleChange}
                                            className="h-11 bg-zinc-50/30 border-zinc-200 rounded-none focus-visible:ring-0 focus-visible:border-black text-xs font-medium transition-all placeholder:text-zinc-200"
                                            placeholder="JOAO@CLIENTE.COM"
                                        />
                                    </div>

                                    {/* ROW 4 */}
                                    <div className="space-y-2">
                                        <Label htmlFor="address" className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Endereço</Label>
                                        <Textarea
                                            id="address"
                                            name="address"
                                            value={formData.address}
                                            onChange={handleChange}
                                            className="min-h-[60px] bg-zinc-50/30 border-zinc-200 rounded-none focus-visible:ring-0 focus-visible:border-black text-xs font-medium transition-all py-3 placeholder:text-zinc-200 shadow-none resize-none"
                                            placeholder="RUA, NÚMERO, BAIRRO..."
                                        />
                                    </div>

                                    {/* ROW 5 */}
                                    <div className="space-y-2">
                                        <Label htmlFor="bio" className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Bio</Label>
                                        <Textarea
                                            id="bio"
                                            name="bio"
                                            value={formData.bio}
                                            onChange={handleChange}
                                            className="min-h-[80px] bg-zinc-50/30 border-zinc-200 rounded-none focus-visible:ring-0 focus-visible:border-black text-xs font-medium transition-all py-3 placeholder:text-zinc-200 shadow-none resize-none"
                                            placeholder="BREVE DESCRIÇÃO..."
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </form>
                </div>
            </AdminPageLayout>
        </AdminLayout>
    );
};

export default ProfileSettings;
