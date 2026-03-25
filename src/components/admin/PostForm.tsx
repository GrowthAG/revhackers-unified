
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
import { Database } from "@/integrations/supabase/types";

// Type definition for form data
type PostFormData = any;

interface PostFormProps {
    initialData?: PostFormData; // If provided, it's edit mode
    isEditing?: boolean;
}

const PostForm = ({ initialData, isEditing = false }: PostFormProps) => {
    const navigate = useNavigate();
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [imagePreview, setImagePreview] = useState<string | null>(initialData?.image || null);

    const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<PostFormData>({
        defaultValues: initialData || {
            title: '',
            slug: '',
            excerpt: '',
            content: '',
            category: 'Growth', // Default category
            image: '',
            published: false,
            featured: false,
            read_time: '5 min',
            date: new Date().toISOString()
        }
    });

    // Watch title to auto-generate slug if new
    const title = watch('title');
    useEffect(() => {
        if (!isEditing && title) {
            const slug = title
                .toLowerCase()
                .normalize('NFD') // decompose accents
                .replace(/[\u0300-\u036f]/g, '') // remove accents
                .replace(/[^a-z0-9]+/g, '-') // replace non-alphanumeric with hyphens
                .replace(/(^-|-$)/g, ''); // remove leading/trailing hyphens
            setValue('slug', slug);
        }
    }, [title, isEditing, setValue]);

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return;

        const file = e.target.files[0];
        setUploading(true);

        try {
            const publicUrl = await uploadImageToSupabase(file);
            if (publicUrl) {
                setValue('image', publicUrl);
                setImagePreview(publicUrl);
                toast({ title: 'Imagem enviada com sucesso' });
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

    const onSubmit = async (data: PostFormData) => {
        setLoading(true);
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                toast({ title: 'Sessão expirada', variant: 'destructive' });
                navigate('/login');
                return;
            }

            // Prepare payload
            // IMPORTANT: We do NOT send author_id. The trigger/default should handle it.
            // But we DO need to ensure we don't send `id` if creating.
            const payload = {
                title: data.title,
                slug: data.slug,
                excerpt: data.excerpt,
                content: data.content,
                category: data.category,
                image: data.image,
                published: data.published,
                featured: data.featured,
                read_time: data.read_time,
                date: data.date || new Date().toISOString(),
                // updated_at is handled by trigger, but we can send it too
                updated_at: new Date().toISOString()
            };

            let error;
            if (isEditing && initialData?.id) {
                // Update
                const { error: updateError } = await supabase
                    .from('blog_posts')
                    .update(payload)
                    .eq('id', initialData.id);
                error = updateError;
            } else {
                // Insert
                // Only if strictly required, we add created_at
                const insertPayload = {
                    ...payload,
                    created_at: new Date().toISOString(),
                    author_id: session.user.id // Explicitly set author_id logic for RLS match
                };
                const { error: insertError } = await supabase.from('blog_posts').insert(insertPayload);
                error = insertError;
            }

            if (error) throw error;

            toast({
                title: isEditing ? 'Artigo atualizado!' : 'Artigo criado!',
                description: data.published ? 'O artigo está visível no site.' : 'Salvo como rascunho.'
            });

            navigate('/admin/posts');

        } catch (error: any) {
            console.error(error);
            toast({
                title: 'Erro ao salvar',
                description: error.message || 'Verifique suas permissões.',
                variant: 'destructive'
            });
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!isEditing || !initialData?.id) return;
        if (!window.confirm("Tem certeza que deseja excluir este Artigo? Esta ação não pode ser desfeita.")) return;

        setLoading(true);
        try {
            const { error } = await supabase.from('blog_posts').delete().eq('id', initialData.id);
            if (error) throw error;
            toast({ title: 'Artigo excluído' });
            navigate('/admin/posts');
        } catch (error: any) {
            console.error(error);
            toast({ title: 'Erro ao excluir', description: error.message, variant: 'destructive' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 max-w-4xl mx-auto bg-white p-8 rounded-xl shadow-sm border border-zinc-100">
            <div className="flex items-center justify-between mb-6">
                <Button type="button" variant="ghost" onClick={() => navigate('/admin/posts')} className="text-zinc-500 hover:text-black hover:bg-zinc-100 h-9 px-3">
                    <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
                </Button>
                <h1 className="text-2xl font-bold">{isEditing ? 'Editar Artigo' : 'Novo Artigo'}</h1>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                    <div>
                        <Label>Título</Label>
                        <Input {...register('title', { required: true })} placeholder="Título do artigo" />
                        {errors.title && <span className="text-red-500 text-xs">Obrigatório</span>}
                    </div>

                    <div>
                        <Label>Slug (URL)</Label>
                        <Input {...register('slug', { required: true })} placeholder="titulo-do-artigo" />
                    </div>

                    <div>
                        <Label>Categoria</Label>
                        <Select
                            onValueChange={(value) => setValue('category', value)}
                            defaultValue={watch('category')}
                        >
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Selecione uma categoria" />
                            </SelectTrigger>
                            <SelectContent className="bg-white text-black border-zinc-200 shadow-sm z-50">
                                <SelectItem value="Growth" className="text-black hover:bg-zinc-100 focus:bg-zinc-100 focus:text-black cursor-pointer">Growth</SelectItem>
                                <SelectItem value="Vendas" className="text-black hover:bg-zinc-100 focus:bg-zinc-100 focus:text-black cursor-pointer">Vendas</SelectItem>
                                <SelectItem value="Marketing" className="text-black hover:bg-zinc-100 focus:bg-zinc-100 focus:text-black cursor-pointer">Marketing</SelectItem>
                                <SelectItem value="RevOps" className="text-black hover:bg-zinc-100 focus:bg-zinc-100 focus:text-black cursor-pointer">RevOps</SelectItem>
                                <SelectItem value="Tecnologia" className="text-black hover:bg-zinc-100 focus:bg-zinc-100 focus:text-black cursor-pointer">Tecnologia</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div>
                        <Label>Tempo de Leitura</Label>
                        <Input {...register('read_time')} placeholder="Ex: 5 min" />
                    </div>
                </div>

                <div className="space-y-4">
                    <Label>Capa do Artigo</Label>
                    <div className="border-2 border-dashed border-zinc-200 rounded-lg p-6 flex flex-col items-center justify-center min-h-[200px] hover:bg-zinc-50 transition-colors relative overflow-hidden">
                        {imagePreview ? (
                            <>
                                <img src={imagePreview} alt="Preview" className="absolute inset-0 w-full h-full object-cover opacity-50" />
                                <div className="relative z-10 flex flex-col items-center">
                                    <Button type="button" variant="secondary" size="sm" className="mb-2" onClick={() => document.getElementById('image-upload')?.click()}>
                                        Trocar Imagem
                                    </Button>
                                </div>
                            </>
                        ) : (
                            <div className="text-center">
                                <Upload className="h-8 w-8 text-zinc-400 mx-auto mb-2" />
                                <p className="text-sm text-zinc-500 mb-2">Arraste ou clique para enviar</p>
                                <Button type="button" variant="outline" size="sm" onClick={() => document.getElementById('image-upload')?.click()}>
                                    Selecionar Arquivo
                                </Button>
                            </div>
                        )}
                        {uploading && <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-20"><Loader2 className="animate-spin" /></div>}
                    </div>
                    <input
                        id="image-upload"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleImageUpload}
                    />
                    {/* Hidden input to store URL */}
                    <input type="hidden" {...register('image')} />
                </div>
            </div>

            <div className="space-y-2">
                <Label>Resumo (Excerpt)</Label>
                <Textarea {...register('excerpt')} placeholder="Breve descrição para o card..." rows={3} />
            </div>

            <div className="space-y-2">
                <Label>Conteúdo (HTML/Markdown)</Label>
                <Textarea
                    {...register('content', { required: true })}
                    className="font-mono text-sm min-h-[400px]"
                    placeholder="Escreva seu conteúdo aqui..."
                />
                <p className="text-xs text-zinc-500">Aceita formatação HTML básica ou Markdown (se suportado pelo renderizador).</p>
            </div>

            <div className="flex items-center justify-between pt-6 border-t border-zinc-100">
                <div className="flex items-center gap-6">
                    <div className="flex items-center space-x-2 bg-zinc-50 px-3 py-1.5 rounded-lg border border-zinc-100">
                        <Switch
                            id="published"
                            checked={!!watch('published')}
                            onCheckedChange={(checked) => setValue('published', checked)}
                        />
                        <Label htmlFor="published" className="cursor-pointer font-medium text-zinc-700 text-sm">
                            {watch('published') ? 'Publicado' : 'Rascunho'}
                        </Label>
                    </div>

                    {isEditing && (
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={handleDelete}
                            disabled={loading || uploading}
                            className="text-zinc-400 hover:text-red-600 hover:bg-red-50 h-10 px-4 transition-colors"
                        >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Excluir Artigo
                        </Button>
                    )}
                </div>

                <Button
                    type="submit"
                    className="bg-black text-white hover:bg-zinc-900 min-w-[180px] h-11 text-[11px] font-bold uppercase tracking-[0.25em] transition-all rounded-none shadow-none border border-black"
                    disabled={loading || uploading}
                >
                    {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                    {isEditing ? 'Salvar Alterações' : 'Criar Artigo'}
                </Button>
            </div>
        </form>
    );
};

export default PostForm;
