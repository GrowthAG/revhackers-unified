
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
import PageLayout from "@/components/layout/PageLayout";
import AdminPageLayout from "@/components/layout/AdminPageLayout";
import { uploadImageToSupabase } from "@/utils/uploadImageToSupabase";

const ProfileSettings = () => {
    const { user } = useAuth();
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
            const publicUrl = await uploadImageToSupabase(file, "profiles");
            if (publicUrl) {
                setFormData((prev) => ({ ...prev, avatar_url: publicUrl }));
                toast({ title: "Avatar atualizado! Lembre-se de salvar." });
            }
        } catch (error) {
            console.error("Avatar upload error:", error);
            toast({ title: "Erro no upload. Verifique se o bucket 'profiles' existe.", variant: "destructive" });
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
            <PageLayout>
                <div className="flex h-[50vh] items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                </div>
            </PageLayout>
        );
    }

    return (
        <PageLayout>
            <AdminPageLayout
                title="Meu Perfil"
                description="Gerencie seus dados. Para colaboradores, o preenchimento completo é obrigatório."
                backTo="/admin"
                backLabel="Voltar ao Dashboard"
            >
                <div className="max-w-3xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <form onSubmit={handleSubmit} className="space-y-12">
                        {/* Avatar Section */}
                        <div className="flex items-center gap-10 pb-12 border-b border-black">
                            <div className="relative group shrink-0">
                                <div className="w-32 h-32 bg-white border border-zinc-200 group-hover:border-black transition-colors duration-300 flex items-center justify-center overflow-hidden">
                                    {formData.avatar_url ? (
                                        <img src={formData.avatar_url} alt="Avatar" className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500" />
                                    ) : (
                                        <User className="h-10 w-10 text-zinc-200 group-hover:text-black transition-colors" />
                                    )}
                                </div>
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

                            <div className="space-y-3">
                                <h3 className="text-base font-black uppercase tracking-[0.25em] text-black">Fotografia de Perfil</h3>
                                <p className="text-[10px] text-zinc-400 uppercase tracking-widest leading-relaxed max-w-sm">
                                    Esta imagem será utilizada em seus artigos, comentários e identificação interna. Use uma foto profissional.
                                </p>
                            </div>
                        </div>

                        <div className="grid gap-12">
                            <div className="grid md:grid-cols-2 gap-10">
                                <div className="space-y-3">
                                    <Label htmlFor="full_name" className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Nome Completo</Label>
                                    <Input
                                        id="full_name"
                                        name="full_name"
                                        value={formData.full_name}
                                        onChange={handleChange}
                                        className="h-14 bg-white border-zinc-200 rounded-none focus-visible:ring-0 focus-visible:border-black text-xs font-medium transition-all placeholder:text-zinc-200"
                                        placeholder="EX: JOÃO SILVA"
                                    />
                                </div>

                                <div className="space-y-3">
                                    <Label htmlFor="username" className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Identificador (Username)</Label>
                                    <Input
                                        id="username"
                                        name="username"
                                        value={formData.username}
                                        onChange={handleChange}
                                        className="h-14 bg-white border-zinc-200 rounded-none focus-visible:ring-0 focus-visible:border-black text-xs font-medium transition-all placeholder:text-zinc-200"
                                        placeholder="EX: JOAOSILVA"
                                    />
                                </div>
                            </div>

                            <div className="space-y-3">
                                <Label htmlFor="job_title" className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Cargo / Função</Label>
                                <Input
                                    id="job_title"
                                    name="job_title"
                                    value={formData.job_title}
                                    onChange={handleChange}
                                    className="h-14 bg-white border-zinc-200 rounded-none focus-visible:ring-0 focus-visible:border-black text-xs font-medium transition-all placeholder:text-zinc-200"
                                    placeholder="EX: HEAD DE MARKETING"
                                />
                            </div>

                            <div className="grid md:grid-cols-2 gap-10">
                                <div className="space-y-3">
                                    <Label htmlFor="cpf" className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">CPF / Registro</Label>
                                    <Input
                                        id="cpf"
                                        name="cpf"
                                        value={formData.cpf}
                                        onChange={handleChange}
                                        className="h-14 bg-white border-zinc-200 rounded-none focus-visible:ring-0 focus-visible:border-black text-xs font-medium transition-all placeholder:text-zinc-200"
                                        placeholder="000.000.000-00"
                                    />
                                </div>
                                <div className="space-y-3">
                                    <Label htmlFor="personal_email" className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">E-mail de Contato</Label>
                                    <Input
                                        id="personal_email"
                                        name="personal_email"
                                        value={formData.personal_email}
                                        onChange={handleChange}
                                        className="h-14 bg-white border-zinc-200 rounded-none focus-visible:ring-0 focus-visible:border-black text-xs font-medium transition-all placeholder:text-zinc-200"
                                        placeholder="JOAO@CLIENTE.COM"
                                    />
                                </div>
                            </div>

                            <div className="space-y-3">
                                <Label htmlFor="address" className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Endereço de Correspondência</Label>
                                <Textarea
                                    id="address"
                                    name="address"
                                    value={formData.address}
                                    onChange={handleChange}
                                    className="min-h-[100px] bg-white border-zinc-200 rounded-none focus-visible:ring-0 focus-visible:border-black text-xs font-medium transition-all py-4 placeholder:text-zinc-200 shadow-none resize-none"
                                    placeholder="RUA, NÚMERO, BAIRRO, CIDADE, ESTADO, CEP"
                                />
                            </div>

                            <div className="space-y-3">
                                <Label htmlFor="bio" className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Biografia Profissional</Label>
                                <Textarea
                                    id="bio"
                                    name="bio"
                                    value={formData.bio}
                                    onChange={handleChange}
                                    className="min-h-[140px] bg-white border-zinc-200 rounded-none focus-visible:ring-0 focus-visible:border-black text-xs font-medium transition-all py-4 placeholder:text-zinc-200 shadow-none resize-none"
                                    placeholder="BREVE DESCRIÇÃO DOS PAPÉIS E RESPONSABILIDADES NA REVHACKERS..."
                                />
                            </div>
                        </div>

                        <div className="flex justify-start pt-8 border-t border-black">
                            <Button
                                type="submit"
                                disabled={saving || uploading}
                                className="bg-black text-white hover:bg-zinc-900 font-black uppercase tracking-[0.25em] h-14 px-12 text-[11px] rounded-none shadow-none border border-black transition-all"
                            >
                                {saving ? <Loader2 className="animate-spin h-4 w-4" /> : "Salvar Alterações"}
                            </Button>
                        </div>
                    </form>
                </div>
            </AdminPageLayout>
        </PageLayout>
    );
};

export default ProfileSettings;
