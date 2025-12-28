
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Save, ArrowLeft, Upload, Trash2 } from 'lucide-react';
type MaterialFormData = {
    id?: string;
    title: string;
    slug: string; // URL identifyer (REQUIRED)
    material_url: string;
    type: string;
    description: string;
    cover_image: string | null;
    published: boolean;
    is_active: boolean;
};

interface MaterialFormProps {
    initialData?: MaterialFormData;
    isEditing?: boolean;
}

const MaterialForm = ({ initialData, isEditing = false }: MaterialFormProps) => {
    const navigate = useNavigate();
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [imagePreview, setImagePreview] = useState<string | null>(initialData?.cover_image || null);

    const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<MaterialFormData>({
        defaultValues: initialData || {
            title: '',
            slug: '',
            type: 'framework',
            description: '',
            cover_image: '',
            published: false,
            is_active: true, // Default to active
            material_url: ''
        }
    });

    const title = watch('title');
    const slug = watch('slug');

    useEffect(() => {
        if (!isEditing && title) {
            const generatedSlug = title
                .toLowerCase()
                .normalize('NFD') // decompose accents
                .replace(/[\u0300-\u036f]/g, '') // remove accents
                .replace(/[^a-z0-9]+/g, '-') // replace non-alphanumeric with hyphens
                .replace(/(^-|-$)/g, ''); // remove leading/trailing hyphens
            setValue('slug', generatedSlug);


            // We DO NOT auto-generate Link Material anymore. 
            // It must be manually entered as per "Strict Rich Materials Workflow".

        }
    }, [title, isEditing, setValue]);

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return;

        const file = e.target.files[0];
        setUploading(true);

        try {
            const publicUrl = await uploadImageToSupabase(file);
            if (publicUrl) {
                setValue('cover_image', publicUrl);
                setImagePreview(publicUrl);
                toast({ title: 'Capa enviada com sucesso' });
            } else {
                throw new Error("Upload failed");
            }
        } catch (error: any) {
            console.error(error);
            toast({
                title: 'Erro ao enviar imagem',
                description: error.message || 'Erro desconhecido',
                variant: 'destructive'
            });
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async () => {
        if (!isEditing || !initialData?.id) return;

        if (!window.confirm("Tem certeza que deseja excluir este Material? Esta ação não pode ser desfeita.")) {
            return;
        }

        setLoading(true);
        try {
            const { error } = await supabase
                .from('materials')
                .delete()
                .eq('id', initialData.id);

            if (error) throw error;

            toast({
                title: 'Material excluído',
                description: 'O material foi removido com sucesso.'
            });
            navigate('/admin/materials');
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

    const onSubmit = async (data: MaterialFormData) => {
        setLoading(true);
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                navigate('/login');
                return;
            }

            // Prepare payload - Map to ACTUAL DB COLUMNS
            // DB Schema: material_name, material_type, link_material, description, is_active, published, cover_image, slug
            const payload = {
                material_name: data.title,
                material_type: data.type,
                link_material: data.material_url,

                // Standard Columns
                slug: data.slug,
                description: data.description,
                cover_image: data.cover_image,
                published: data.published,
                is_active: true,

                // Legacy/Duplicate keys (Commented out to avoid 'Column not found' errors if schema is strict)
                // title: data.title,
                // type: data.type,
                // material_url: data.material_url
            };

            console.log("Payload to Supabase:", payload); // Debug for User Support

            let error;
            if (isEditing && initialData?.id) {
                const { error: updateError } = await supabase
                    .from('materials')
                    .update(payload)
                    .eq('id', initialData.id);
                error = updateError;
            } else {
                // Insert
                const { error: insertError } = await supabase.from('materials').insert(payload);
                error = insertError;
            }

            if (error) throw error;

            toast({
                title: isEditing ? 'Material atualizado!' : 'Material criado!',
                description: data.published ? 'Disponível no site.' : 'Salvo como rascunho.'
            });

            navigate('/admin/materials');

        } catch (error: any) {
            console.error(error);
            toast({
                title: 'Erro ao salvar',
                description: error.message,
                variant: 'destructive'
            });
            // Fallback for critical visibility
            alert(`Erro ao salvar: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 bg-white p-8 rounded-xl shadow-sm border border-gray-200">
            <div className="space-y-6">
                <div>
                    <Label className="text-base font-semibold text-gray-900">Título do Material</Label>
                    <Input
                        {...register('title', { required: true })}
                        placeholder="Ex: Playbook de Vendas 2025"
                        className="mt-2 h-12 text-lg bg-white border-gray-200 text-gray-900 placeholder:text-gray-400 focus:border-black focus:ring-black"
                    />
                    {errors.title && <span className="text-red-500 text-xs mt-1">Obrigatório</span>}
                </div>

                <div>
                    <Label className="text-base font-semibold text-gray-900">Slug (URL Amigável)</Label>
                    <Input
                        {...register('slug', { required: "O slug é obrigatório para o banco de dados" })}
                        placeholder="ex: playbook-vendas-2025"
                        className="mt-2 h-12 font-mono text-sm bg-gray-50 border-gray-200 text-gray-600"
                    />
                    {errors.slug && <span className="text-red-500 text-xs mt-1">{errors.slug.message}</span>}
                    <p className="text-xs text-gray-500 mt-1">Identificador único na URL (letras, números e hifens)</p>
                </div>


                <div>
                    <Label className="text-base font-semibold text-gray-900">Link do Material (Externo - ClickUp/Drive)</Label>
                    <Input
                        {...register('material_url', { required: true })}
                        placeholder="https://revhackers.com.br/..."
                        className="mt-2 h-12 font-mono text-sm bg-white border-gray-200 text-gray-900 placeholder:text-gray-400"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                        Link direto para o material (ClickUp, Drive, etc).
                        <span className="font-bold text-red-500 ml-1">Obrigatório para o envio por e-mail via Webhook.</span>
                    </p>
                </div>


                <div>
                    <Label className="text-base font-semibold text-gray-900">Tipo de Material</Label>
                    <Select
                        onValueChange={(value) => setValue('type', value)}
                        defaultValue={watch('type')}
                    >
                        <SelectTrigger className="h-12 text-base bg-white border-gray-200 text-gray-900">
                            <SelectValue placeholder="Selecione o tipo" />
                        </SelectTrigger>
                        <SelectContent className="bg-white text-gray-900 border-gray-200 shadow-xl z-50">
                            <SelectItem value="framework" className="text-gray-900 hover:bg-gray-50 cursor-pointer">Framework</SelectItem>
                            <SelectItem value="playbook" className="text-gray-900 hover:bg-gray-50 cursor-pointer">Playbook</SelectItem>
                            <SelectItem value="template" className="text-gray-900 hover:bg-gray-50 cursor-pointer">Template</SelectItem>
                            <SelectItem value="presentation" className="text-gray-900 hover:bg-gray-50 cursor-pointer">Apresentação</SelectItem>
                            <SelectItem value="tool" className="text-gray-900 hover:bg-gray-50 cursor-pointer">Ferramenta (Tool)</SelectItem>
                            <SelectItem value="other" className="text-gray-900 hover:bg-gray-50 cursor-pointer">Outro</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="space-y-3 pt-4">
                <Label className="text-base font-semibold text-gray-900">Descrição Completa</Label>
                <Textarea
                    {...register('description')}
                    placeholder="Descreva o conteúdo do material, benefícios e para quem é indicado..."
                    rows={6}
                    className="resize-y min-h-[150px] text-base bg-white border-gray-200 text-gray-900 placeholder:text-gray-400 focus:border-black focus:ring-black"
                />
            </div>

            <div className="flex items-center justify-between pt-8 border-t border-gray-100 mt-8">
                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-3 bg-gray-50 px-4 py-2 rounded-lg border border-gray-200">
                        <Switch
                            id="published"
                            checked={watch('published') || false}
                            onCheckedChange={(checked) => setValue('published', checked)}
                        />
                        <Label htmlFor="published" className="cursor-pointer font-medium text-gray-700">
                            {watch('published') ? 'Status: Publicado' : 'Status: Rascunho'}
                        </Label>
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
                            Excluir Material
                        </Button>
                    )}
                </div>

                <Button
                    type="submit"
                    className="bg-black text-white hover:bg-zinc-900 min-w-[180px] h-11 text-[11px] font-bold uppercase tracking-[0.25em] transition-all rounded-none shadow-none border border-black"
                    disabled={loading || uploading}
                >
                    {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                    {isEditing ? 'Salvar Alterações' : 'Criar Material'}
                </Button>
            </div>
        </form>

    );
};

export default MaterialForm;
