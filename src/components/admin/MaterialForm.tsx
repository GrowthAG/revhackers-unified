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
import { Loader2, Save, Upload, Trash2, Image as ImageIcon } from 'lucide-react';
// import AIEditorLayout from '@/components/layout/AIEditorLayout';

// Define explicit form values matching database needs
interface MaterialFormValues {
    id?: string;
    title: string;
    slug: string;
    material_url: string;
    type: string;
    description: string;
    cover_image: string | null;
    published: boolean;
    is_active: boolean;
};

interface MaterialFormProps {
    initialData?: Partial<MaterialFormValues>;
    isEditing?: boolean;
}

const MaterialForm = ({ initialData, isEditing = false }: MaterialFormProps) => {
    const navigate = useNavigate();
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [imagePreview, setImagePreview] = useState<string | null>(initialData?.cover_image || null);

    const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<MaterialFormValues>({
        defaultValues: initialData ? {
            ...initialData,
            title: initialData.title || (initialData as any).material_name || '', // Handle DB column name change if needed
            slug: initialData.slug || '',
            material_url: initialData.material_url || (initialData as any).link_material || '',
            type: initialData.type || (initialData as any).material_type || 'framework',
            description: initialData.description || '',
            cover_image: initialData.cover_image || '',
            published: initialData.published || false,
            is_active: initialData.is_active ?? true
        } : {
            title: '',
            slug: '',
            type: 'framework',
            description: '',
            cover_image: '',
            published: false,
            is_active: true,
            material_url: ''
        }
    });

    const title = watch('title');

    useEffect(() => {
        if (!isEditing && title) {
            const generatedSlug = title.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
            setValue('slug', generatedSlug);
        }
    }, [title, isEditing, setValue]);

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return;
        setUploading(true);
        try {
            const publicUrl = await uploadImageToSupabase(e.target.files[0]);
            if (publicUrl) {
                setValue('cover_image', publicUrl);
                setImagePreview(publicUrl);
                toast({ title: 'Capa enviada com sucesso' });
            }
        } catch (error: any) {
            toast({ title: 'Erro ao enviar imagem', description: error.message, variant: 'destructive' });
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async () => {
        if (!isEditing || !initialData?.id || !confirm('Excluir este Material?')) return;
        setLoading(true);
        try {
            await supabase.from('materials').delete().eq('id', initialData.id);
            toast({ title: 'Material excluído' });
            navigate('/admin/materials');
        } catch (error: any) {
            toast({ title: 'Erro ao excluir', description: error.message, variant: 'destructive' });
        } finally {
            setLoading(false);
        }
    };

    const onSubmit = async (data: MaterialFormValues) => {
        setLoading(true);
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) { navigate('/login'); return; }

            // Map to strict DB columns: material_name, material_type, link_material
            const payload = {
                material_name: data.title,
                material_type: data.type,
                link_material: data.material_url,
                material_url: data.material_url, // Add redundant field to satisfy types if needed, or check DB
                slug: data.slug,
                description: data.description,
                cover_image: data.cover_image,
                published: data.published,
                is_active: true,
            };

            if (isEditing && initialData?.id) {
                const { error } = await supabase.from('materials').update(payload).eq('id', initialData.id);
                if (error) throw error;
                toast({ title: 'Material atualizado!' });
            } else {
                const { error } = await supabase.from('materials').insert(payload);
                if (error) throw error;
                toast({ title: 'Material criado!' });
                navigate('/admin/materials');
            }
        } catch (error: any) {
            toast({ title: 'Erro ao salvar', description: error.message, variant: 'destructive' });
        } finally {
            setLoading(false);
        }
    };



    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between border-b pb-4">
                <div>
                    <h1 className="text-2xl font-bold">{isEditing ? 'Editar Material' : 'Novo Material'}</h1>
                    <p className="text-sm text-gray-500">Gerencie materiais ricos, templates e playbooks.</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 mr-2">
                        <Switch id="published" checked={watch('published') || false} onCheckedChange={(c) => setValue('published', c)} />
                        <Label htmlFor="published" className="text-xs uppercase font-medium text-zinc-500 cursor-pointer">
                            {watch('published') ? 'Publicado' : 'Rascunho'}
                        </Label>
                    </div>
                    <Button onClick={handleSubmit(onSubmit)} disabled={loading} className="bg-zinc-900 text-white hover:bg-black font-medium h-9 text-xs px-4">
                        {loading ? <Loader2 className="w-3 h-3 animate-spin mr-2" /> : <Save className="w-3 h-3 mr-2" />}
                        {isEditing ? 'Salvar' : 'Criar'}
                    </Button>
                    {isEditing && (
                        <Button variant="outline" onClick={handleDelete} className="h-9 w-9 p-0 text-red-500 hover:text-red-600 hover:bg-red-50 hover:border-red-200">
                            <Trash2 className="w-4 h-4" />
                        </Button>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Main Content */}
                <div className="md:col-span-2 space-y-6">
                    <div className="space-y-2">
                        <Label>Título do Material</Label>
                        <Input
                            {...register('title', { required: true })}
                            placeholder="Ex: Playbook de Vendas B2B"
                            className="bg-white text-lg font-medium"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Descrição</Label>
                        <Textarea
                            {...register('description')}
                            placeholder="Descreva o material e seus benefícios para o lead..."
                            className="min-h-[200px] bg-white resize-y"
                        />
                    </div>
                </div>

                {/* Sidebar - Link is the most important field */}
                <div className="space-y-6">
                    <div className="p-4 bg-zinc-50 rounded-xl border border-zinc-100 space-y-4">
                        <div className="space-y-2">
                            <Label className="text-sm font-bold text-zinc-700">🔗 Link do Material (URL)</Label>
                            <Input {...register('material_url', { required: true })} placeholder="https://clickup.com/..." className="bg-white font-mono text-xs" />
                            <p className="text-[10px] text-zinc-500">Este é o link que o lead receberá após preencher o formulário.</p>
                            {errors.material_url && <span className="text-red-500 text-[10px]">O link é obrigatório!</span>}
                        </div>

                        <div className="h-px bg-zinc-200" />

                        <div className="space-y-2">
                            <Label>Slug (URL interna)</Label>
                            <Input {...register('slug')} className="bg-white font-mono text-xs" placeholder="playbook-vendas-b2b" />
                        </div>

                        <div className="space-y-2">
                            <Label>Tipo</Label>
                            <Select onValueChange={(v) => setValue('type', v)} defaultValue={watch('type') || 'framework'}>
                                <SelectTrigger className="bg-white"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    {['framework', 'playbook', 'template', 'presentation', 'tool', 'other'].map(t =>
                                        <SelectItem key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</SelectItem>
                                    )}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MaterialForm;

