
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2, User, Camera, ArrowRight } from "lucide-react";
import { uploadImageToSupabase } from "@/utils/uploadImageToSupabase";

const CompleteProfile = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);

    const [formData, setFormData] = useState({
        full_name: "",
        cpf: "",
        job_title: "",
        avatar_url: "",
    });

    // Check if profile is already complete
    useEffect(() => {
        const checkProfile = async () => {
            if (!user) return;
            const { data } = await supabase
                .from("profiles")
                .select("full_name, cpf, job_title, avatar_url")
                .eq("id", user.id)
                .single();

            if (data?.full_name && data?.cpf && data?.job_title && data?.avatar_url) {
                navigate("/dashboard");
            }
        };
        checkProfile();
    }, [user, navigate]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
                toast({ title: "Foto carregada com sucesso!" });
            }
        } catch (error) {
            console.error("Upload error:", error);
            toast({ title: "Erro no upload da imagem.", variant: "destructive" });
        } finally {
            setUploading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;

        if (!formData.full_name || !formData.cpf || !formData.job_title || !formData.avatar_url) {
            toast({
                title: "Campos Obrigatórios",
                description: "Por favor, preencha todos os campos e adicione uma foto de perfil.",
                variant: "destructive"
            });
            return;
        }

        setLoading(true);
        try {
            const { error } = await supabase
                .from("profiles")
                .update({
                    full_name: formData.full_name,
                    cpf: formData.cpf,
                    job_title: formData.job_title,
                    avatar_url: formData.avatar_url,
                    status: 'active' // Ensure user is active after completion
                })
                .eq("id", user.id);

            if (error) throw error;

            toast({
                title: "Perfil Completado!",
                description: "Bem-vindo ao RevHackers Growth Hub.",
            });
            navigate("/dashboard");
        } catch (error: any) {
            console.error(error);
            toast({
                title: "Erro ao salvar",
                description: error.message,
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full flex bg-[#020202] items-center justify-center p-4 font-sans text-white">
            <div className="w-full max-w-2xl bg-[#050505] border border-white/5 rounded-none shadow-2xl p-8 lg:p-16 relative overflow-hidden">

                <div className="mb-12 text-center">
                    <h1 className="text-2xl font-black text-white uppercase tracking-[0.2em] mb-4">Complete seu Cadastro</h1>
                    <p className="text-zinc-400 text-xs uppercase tracking-widest leading-relaxed max-w-md mx-auto">
                        Para acessar os materiais e ferramentas, precisamos de algumas informações para personalizar sua experiência.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-12">

                    {/* Avatar Upload */}
                    <div className="flex flex-col items-center justify-center gap-6">
                        <div className="relative group cursor-pointer w-32 h-32">
                            <div className="w-32 h-32 bg-zinc-900 border border-white/10 flex items-center justify-center overflow-hidden transition-all group-hover:border-white/50">
                                {formData.avatar_url ? (
                                    <img src={formData.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                                ) : (
                                    <User className="w-10 h-10 text-zinc-700" />
                                )}
                            </div>
                            <label htmlFor="avatar-upload" className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 transition-all text-[10px] font-bold uppercase tracking-widest text-white cursor-pointer">
                                <Camera className="w-4 h-4 mr-2" /> Upload
                            </label>
                            <input
                                id="avatar-upload"
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={handleAvatarUpload}
                            />
                            {uploading && (
                                <div className="absolute inset-0 bg-black/80 flex items-center justify-center">
                                    <Loader2 className="w-6 h-6 animate-spin text-white" />
                                </div>
                            )}
                        </div>
                        <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">Foto de Perfil *</span>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8">
                        <div className="space-y-2">
                            <Label htmlFor="full_name" className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Nome Completo *</Label>
                            <Input
                                id="full_name"
                                name="full_name"
                                value={formData.full_name}
                                onChange={handleChange}
                                className="bg-zinc-900/50 border-white/10 text-white h-12 rounded-none focus:border-white focus:ring-0 transition-all placeholder:text-zinc-700 text-xs"
                                placeholder="SEU NOME"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="cpf" className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">CPF *</Label>
                            <Input
                                id="cpf"
                                name="cpf"
                                value={formData.cpf}
                                onChange={handleChange}
                                className="bg-zinc-900/50 border-white/10 text-white h-12 rounded-none focus:border-white focus:ring-0 transition-all placeholder:text-zinc-700 text-xs"
                                placeholder="000.000.000-00"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="job_title" className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Cargo / Função *</Label>
                        <Input
                            id="job_title"
                            name="job_title"
                            value={formData.job_title}
                            onChange={handleChange}
                            className="bg-zinc-900/50 border-white/10 text-white h-12 rounded-none focus:border-white focus:ring-0 transition-all placeholder:text-zinc-700 text-xs"
                            placeholder="EX: HEAD DE MARKETING, CEO..."
                        />
                    </div>

                    <Button
                        type="submit"
                        disabled={loading || uploading}
                        className="w-full bg-white text-black hover:bg-zinc-200 h-14 font-black text-xs uppercase tracking-[0.25em] rounded-none transition-all flex items-center justify-center gap-4"
                    >
                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Finalizar Cadastro <ArrowRight className="w-4 h-4" /></>}
                    </Button>

                </form>
            </div>
        </div>
    );
};

export default CompleteProfile;
