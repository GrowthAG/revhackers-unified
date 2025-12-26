
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { supabase } from "@/integrations/supabase/client";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { uploadImageToSupabase } from '@/utils/uploadImageToSupabase';
import { Loader2, Save, ArrowLeft, Upload, Building, Trash2 } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Database } from "@/integrations/supabase/types";

type CaseFormData = Database['public']['Tables']['cases']['Insert'];

interface CaseFormProps {
    initialData?: CaseFormData;
    isEditing?: boolean;
}

const CaseForm = ({ initialData, isEditing = false }: CaseFormProps) => {
    const navigate = useNavigate();
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [logoPreview, setLogoPreview] = useState<string | null>(initialData?.client_logo || null);

    const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<CaseFormData>({
        defaultValues: initialData || {
            title: '',
            slug: '',
            client_name: '',
            client_logo: '',
            case_category: 'B2B',
            preview_description: '',
            primary_metric: '',
            testimonial_quote: '',
            testimonial_author: '',
            testimonial_role: '',
            published: false,
        }
    });

    const clientName = watch('client_name');
    useEffect(() => {
        if (!isEditing && clientName) {
            const slug = clientName
                .toLowerCase()
                .normalize('NFD')
                .replace(/[\u0300-\u036f]/g, '')
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/(^-|-$)/g, '');
            setValue('slug', slug);
        }
    }, [clientName, isEditing, setValue]);

    const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return;

        const file = e.target.files[0];
        setUploading(true);

        try {
            const publicUrl = await uploadImageToSupabase(file);
            if (publicUrl) {
                setValue('client_logo', publicUrl);
                setLogoPreview(publicUrl);
                toast({ title: 'Logo enviada com sucesso' });
            } else {
                throw new Error("Upload failed");
            }
        } catch (error) {
            console.error(error);
            toast({ title: 'Erro ao enviar imagem', variant: 'destructive' });
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async () => {
        if (!isEditing || !initialData?.id) return;

        if (!window.confirm("Tem certeza que deseja excluir este Case? Esta ação não pode ser desfeita.")) {
            return;
        }

        setLoading(true);
        try {
            const { error } = await supabase
                .from('cases')
                .delete()
                .eq('id', initialData.id);

            if (error) throw error;

            toast({
                title: 'Case excluído',
                description: 'O case foi removido com sucesso.'
            });
            navigate('/admin/cases');
        } catch (error: any) {
            console.error(error);
            toast({
                title: 'Erro ao excluir',
                description: error.message,
                variant: 'destructive'
            });
            setLoading(false);
        }
    };

    const onSubmit = async (data: CaseFormData) => {
        setLoading(true);
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                navigate('/login');
                return;
            }

            const payload = {
                title: data.title,
                slug: data.slug,
                client_name: data.client_name,
                client_logo: data.client_logo,
                case_category: data.case_category,
                preview_description: data.preview_description,
                primary_metric: data.primary_metric,
                testimonial_quote: data.testimonial_quote,
                testimonial_author: data.testimonial_author,
                testimonial_role: data.testimonial_role,
                published: data.published,
            };

            let error;
            if (isEditing && initialData?.id) {
                const { error: updateError } = await supabase
                    .from('cases')
                    .update(payload)
                    .eq('id', initialData.id);
                error = updateError;
            } else {
                const { error: insertError } = await supabase.from('cases').insert(payload);
                error = insertError;
            }

            if (error) throw error;

            toast({
                title: isEditing ? 'Case atualizado!' : 'Case criado!',
                description: data.published ? 'Disponível no site.' : 'Salvo como rascunho.'
            });

            navigate('/admin/cases');

        } catch (error: any) {
            console.error(error);
            toast({
                title: 'Erro ao salvar',
                description: error.message,
                variant: 'destructive'
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 max-w-4xl mx-auto bg-white p-8 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-6">
                <Button type="button" variant="ghost" onClick={() => navigate('/admin/cases')} className="text-gray-500 hover:text-black hover:bg-gray-100 h-9 px-3">
                    <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
                </Button>
                <h1 className="text-2xl font-bold text-gray-900">{isEditing ? 'Editar Case' : 'Novo Case'}</h1>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                    <div>
                        <Label className="text-base font-semibold text-gray-900">Nome do Cliente</Label>
                        <Input {...register('client_name', { required: true })} placeholder="Ex: Empresa X" className="bg-white border-gray-200 text-gray-900 placeholder:text-gray-400 focus:border-black" />
                        {errors.client_name && <span className="text-red-500 text-xs">Obrigatório</span>}
                    </div>

                    <div>
                        <Label className="text-base font-semibold text-gray-900">Slug</Label>
                        <Input {...register('slug', { required: true })} placeholder="empresa-x" className="bg-gray-50 border-gray-200 text-gray-600 font-mono text-sm" />
                    </div>

                    <div>
                        <Label className="text-base font-semibold text-gray-900">Título do Case (Headline)</Label>
                        <Input {...register('title', { required: true })} placeholder="Ex: Como a Empresa X escalou..." className="bg-white border-gray-200 text-gray-900 placeholder:text-gray-400 focus:border-black" />
                    </div>

                    <div>
                        <Label className="text-base font-semibold text-gray-900">Categoria</Label>
                        <Select
                            onValueChange={(value) => setValue('case_category', value)}
                            defaultValue={watch('case_category') || 'B2B'}
                        >
                            <SelectTrigger className="w-full bg-white border-gray-200 text-gray-900">
                                <SelectValue placeholder="Selecione a categoria" />
                            </SelectTrigger>
                            <SelectContent className="bg-white text-gray-900 border-gray-200 shadow-xl z-50">
                                <SelectItem value="B2B" className="text-gray-900 hover:bg-gray-50 cursor-pointer">B2B (Serviços)</SelectItem>
                                <SelectItem value="SaaS" className="text-gray-900 hover:bg-gray-50 cursor-pointer">SaaS</SelectItem>
                                <SelectItem value="E-commerce" className="text-gray-900 hover:bg-gray-50 cursor-pointer">E-commerce</SelectItem>
                                <SelectItem value="Infoproduto" className="text-gray-900 hover:bg-gray-50 cursor-pointer">Infoproduto</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <div className="space-y-4">
                    <Label className="text-base font-semibold text-gray-900">Logo do Cliente</Label>
                    <div className="border-2 border-dashed border-gray-200 rounded-lg p-6 flex flex-col items-center justify-center min-h-[150px] hover:bg-gray-50 transition-colors relative overflow-hidden bg-gray-50/50">
                        {logoPreview ? (
                            <>
                                <img src={logoPreview} alt="Preview" className="absolute inset-0 w-full h-full object-contain p-4" />
                                <div className="relative z-10 flex flex-col items-center mt-auto bg-white/90 p-1.5 rounded shadow-sm">
                                    <Button type="button" variant="secondary" size="sm" onClick={() => document.getElementById('logo-upload')?.click()}>
                                        Trocar
                                    </Button>
                                </div>
                            </>
                        ) : (
                            <div className="text-center">
                                <Building className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                                <p className="text-sm text-gray-500 mb-2">Logo do Cliente</p>
                                <Button type="button" variant="outline" size="sm" onClick={() => document.getElementById('logo-upload')?.click()} className="bg-white border-gray-200 text-gray-700 hover:bg-gray-50">
                                    Selecionar
                                </Button>
                            </div>
                        )}
                        {uploading && <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-20"><Loader2 className="animate-spin text-revgreen" /></div>}
                    </div>
                    <input
                        id="logo-upload"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleLogoUpload}
                    />
                    <input type="hidden" {...register('client_logo')} />
                </div>
            </div>

            <div className="space-y-4 pt-4 border-t border-gray-100">
                <h3 className="font-semibold text-gray-900">Resultado Principal</h3>
                <div>
                    <Label className="text-base font-semibold text-gray-900">Métrica de Destaque (Primary Metric)</Label>
                    <Input {...register('primary_metric')} placeholder="Ex: +150% em Vendas" className="bg-white border-gray-200 text-gray-900 placeholder:text-gray-400 focus:border-black" />
                </div>
                <div>
                    <Label className="text-base font-semibold text-gray-900">Resumo do Resultado</Label>
                    <Textarea {...register('preview_description')} placeholder="Resumo curto para o card..." rows={2} className="bg-white border-gray-200 text-gray-900 placeholder:text-gray-400 focus:border-black" />
                </div>
            </div>

            <div className="space-y-4 pt-4 border-t border-gray-100">
                <h3 className="font-semibold text-gray-900">Depoimento (Testimonial)</h3>
                <div>
                    <Label className="text-base font-semibold text-gray-900">Citação (Quote)</Label>
                    <Textarea {...register('testimonial_quote')} placeholder="O que o cliente disse..." rows={3} className="bg-white border-gray-200 text-gray-900 placeholder:text-gray-400 focus:border-black" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <Label className="text-base font-semibold text-gray-900">Autor do Depoimento</Label>
                        <Input {...register('testimonial_author')} placeholder="Nome da pessoa" className="bg-white border-gray-200 text-gray-900 placeholder:text-gray-400 focus:border-black" />
                    </div>
                    <div>
                        <Label className="text-base font-semibold text-gray-900">Cargo</Label>
                        <Input {...register('testimonial_role')} placeholder="Ex: CEO, Founder" className="bg-white border-gray-200 text-gray-900 placeholder:text-gray-400 focus:border-black" />
                    </div>
                </div>
            </div>

            <div className="flex items-center justify-between pt-6 border-t border-gray-100">
                <div className="flex items-center gap-6">
                    <div className="flex items-center space-x-2">
                        <Switch
                            id="published"
                            checked={watch('published') || false}
                            onCheckedChange={(checked) => setValue('published', checked)}
                        />
                        <Label htmlFor="published" className="text-gray-700">{watch('published') ? 'Publicado' : 'Rascunho'}</Label>
                    </div>

                    {isEditing && (
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={handleDelete}
                            disabled={loading || uploading}
                            className="text-gray-400 hover:text-red-600 hover:bg-red-50 h-10 px-4 transition-colors"
                        >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Excluir Case
                        </Button>
                    )}
                </div>

                <Button
                    type="submit"
                    className="bg-black text-white hover:bg-zinc-900 min-w-[180px] h-11 text-[11px] font-bold uppercase tracking-[0.25em] transition-all rounded-none shadow-none border border-black"
                    disabled={loading || uploading}
                >
                    {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                    {isEditing ? 'Salvar Alterações' : 'Criar Case'}
                </Button>
            </div>
        </form>
    );
};

export default CaseForm;
