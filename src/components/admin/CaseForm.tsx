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
import { Loader2, Save, Upload, Building, Trash2 } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Database } from "@/integrations/supabase/types";
import AIEditorLayout from '@/components/layout/AIEditorLayout';

// Define form shape explicitly since some fields might be missing from generated types
interface CaseFormValues {
    id?: string;
    title: string;
    slug: string;
    client_name: string;
    client_logo: string | null;
    case_category: string;
    preview_description: string;
    primary_metric: string;
    challenge: string;
    solution: string;
    results: string;
    testimonial_quote: string;
    testimonial_author: string;
    testimonial_role: string;
    published: boolean;
}

type CaseFormData = Database['public']['Tables']['cases']['Insert'];

interface CaseFormProps {
    initialData?: Partial<CaseFormData>;
    isEditing?: boolean;
}

const CaseForm = ({ initialData, isEditing = false }: CaseFormProps) => {
    const navigate = useNavigate();
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [logoPreview, setLogoPreview] = useState<string | null>(initialData?.client_logo || null);

    const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<CaseFormValues>({
        defaultValues: initialData ? {
            ...initialData,
            // Ensure defaults for potentially missing fields
            title: (initialData as any).title || '',
            challenge: (initialData as any).challenge || '',
            solution: (initialData as any).solution || '',
            results: (initialData as any).results || '',
            testimonial_quote: (initialData as any).testimonial_quote || '',
            testimonial_author: (initialData as any).testimonial_author || '',
            testimonial_role: (initialData as any).testimonial_role || '',
        } : {
            title: '',
            slug: '',
            client_name: '',
            client_logo: '',
            case_category: 'B2B',
            preview_description: '',
            primary_metric: '',
            challenge: '',
            solution: '',
            results: '',
            testimonial_quote: '',
            testimonial_author: '',
            testimonial_role: '',
            published: false,
        }
    });

    const clientName = watch('client_name');
    useEffect(() => {
        if (!isEditing && clientName) {
            const slug = clientName.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
            setValue('slug', slug);
        }
    }, [clientName, isEditing, setValue]);

    const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return;
        setUploading(true);
        try {
            const file = e.target.files[0];
            const publicUrl = await uploadImageToSupabase(file);
            if (publicUrl) {
                setValue('client_logo', publicUrl);
                setLogoPreview(publicUrl);
                toast({ title: 'Logo enviada com sucesso' });
            }
        } catch (error) {
            toast({ title: 'Erro ao enviar imagem', variant: 'destructive' });
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async () => {
        if (!isEditing || !initialData?.id || !confirm('Excluir este case?')) return;
        setLoading(true);
        try {
            await supabase.from('cases').delete().eq('id', initialData.id);
            toast({ title: 'Case excluído' });
            navigate('/admin/cases');
        } catch (error) {
            toast({ title: 'Erro ao excluir', variant: 'destructive' });
        } finally {
            setLoading(false);
        }
    };

    const onSubmit = async (data: CaseFormValues) => {
        setLoading(true);
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) { navigate('/login'); return; }

            const payload = { ...data };

            if (isEditing && initialData?.id) {
                const { error } = await supabase.from('cases').update(payload).eq('id', initialData.id);
                if (error) throw error;
                toast({ title: 'Case atualizado!' });
                navigate('/admin/cases');
            } else {
                const { error } = await supabase.from('cases').insert(payload);
                if (error) throw error;
                toast({ title: 'Case criado!' });
                navigate('/admin/cases');
            }
        } catch (error: any) {
            toast({ title: 'Erro ao salvar', description: error.message, variant: 'destructive' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <AIEditorLayout
            title={isEditing ? 'Editar Case' : 'Novo Case'}
            description={isEditing && initialData?.client_name ? `Cliente: ${initialData.client_name}` : 'Documente uma história de sucesso'}
            saving={loading}
            actions={
                <>
                    <div className="flex items-center gap-2">
                        <Switch id="published" checked={watch('published') || false} onCheckedChange={(c) => setValue('published', c)} />
                        <Label htmlFor="published" className="text-xs uppercase font-medium text-zinc-500 cursor-pointer">
                            {watch('published') ? 'Publicado' : 'Rascunho'}
                        </Label>
                    </div>
                    <Button onClick={handleSubmit(onSubmit)} disabled={loading || uploading} className="bg-zinc-900 text-white hover:bg-black font-medium h-9 text-xs px-4">
                        {loading ? <Loader2 className="w-3 h-3 animate-spin mr-2" /> : <Save className="w-3 h-3 mr-2" />}
                        {isEditing ? 'Salvar' : 'Criar'}
                    </Button>
                    {isEditing && (
                        <Button variant="outline" onClick={handleDelete} className="h-9 w-9 p-0 text-red-500 hover:text-red-600 hover:bg-red-50 hover:border-red-200">
                            <Trash2 className="w-4 h-4" />
                        </Button>
                    )}
                </>
            }
        >
            {/* Main Fields */}
            <div className="space-y-8">
                {/* Client Name & Logo */}
                <div className="flex gap-6 items-start">
                    <div className="flex-1 space-y-2">
                        <Label className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">Cliente (Nome do Case)</Label>
                        <Input
                            {...register('client_name', { required: true })}
                            placeholder="Nome do Cliente"
                            className="text-3xl font-bold border-none px-0 h-auto placeholder:text-zinc-200 text-zinc-900 bg-transparent focus-visible:ring-0"
                        />
                        <Input
                            {...register('title', { required: true })}
                            placeholder="Headline (Título do Case)"
                            className="text-lg text-zinc-600 border-none px-0 h-auto bg-transparent focus-visible:ring-0"
                        />
                    </div>

                    <div className="w-[120px] shrink-0">
                        <div className="border border-zinc-200 rounded-lg aspect-square flex flex-col items-center justify-center relative bg-zinc-50 overflow-hidden group">
                            {logoPreview ? (
                                <img src={logoPreview} alt="Logo" className="w-full h-full object-contain p-2" />
                            ) : (
                                <Building className="w-6 h-6 text-zinc-300" />
                            )}
                            <label className="absolute inset-0 cursor-pointer flex items-center justify-center opacity-0 group-hover:opacity-100 bg-black/50 transition-all">
                                <input type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} disabled={uploading} />
                                {uploading ? <Loader2 className="w-4 h-4 text-white animate-spin" /> : <Upload className="w-4 h-4 text-white" />}
                            </label>
                        </div>
                        <p className="text-[10px] text-center mt-1 text-zinc-400 uppercase tracking-wider">Logo</p>
                    </div>
                </div>

                {/* Grid Metadata */}
                <div className="grid grid-cols-2 gap-6 p-6 bg-zinc-50 rounded-xl border border-zinc-100">
                    <div className="space-y-4">
                        <div className="space-y-1.5">
                            <Label className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">Categoria</Label>
                            <Select onValueChange={(v) => setValue('case_category', v)} defaultValue={watch('case_category') || 'B2B'}>
                                <SelectTrigger className="bg-white"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    {['SaaS', 'Fintech', 'Software House', 'Educação', 'Agência', 'B2B (Geral)'].map(c =>
                                        <SelectItem key={c} value={c}>{c}</SelectItem>
                                    )}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">Métrica Destaque</Label>
                            <Input {...register('primary_metric')} placeholder="+150% ROI" className="bg-white" />
                        </div>
                    </div>
                    <div className="space-y-4">
                        <div className="space-y-1.5">
                            <Label className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">URL Slug</Label>
                            <Input {...register('slug')} placeholder="cliente-x" className="bg-white font-mono text-zinc-500" />
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">Resumo (Preview)</Label>
                            <Input {...register('preview_description')} placeholder="Descrição curta para listagem..." className="bg-white" />
                        </div>
                    </div>
                </div>

                {/* Narrative Fields - Expanded */}
                <div className="space-y-8">
                    <div className="space-y-2">
                        <Label className="text-[12px] font-bold text-zinc-900 uppercase tracking-widest flex items-center gap-2">
                            <div className="w-2 h-2 bg-red-500 rounded-full" /> O Desafio (Challenge)
                        </Label>
                        <Textarea
                            {...register('challenge')}
                            placeholder="Qual era o problema?"
                            className="min-h-[150px] font-serif text-lg leading-relaxed p-4 border-zinc-200 resize-y"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label className="text-[12px] font-bold text-zinc-900 uppercase tracking-widest flex items-center gap-2">
                            <div className="w-2 h-2 bg-blue-500 rounded-full" /> A Solução (Solution)
                        </Label>
                        <Textarea
                            {...register('solution')}
                            placeholder="O que foi feito?"
                            className="min-h-[150px] font-serif text-lg leading-relaxed p-4 border-zinc-200 resize-y"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label className="text-[12px] font-bold text-zinc-900 uppercase tracking-widest flex items-center gap-2">
                            <div className="w-2 h-2 bg-green-500 rounded-full" /> Resultados (Results)
                        </Label>
                        <Textarea
                            {...register('results')}
                            placeholder="Quais foram os entregáveis?"
                            className="min-h-[150px] font-serif text-lg leading-relaxed p-4 border-zinc-200 resize-y"
                        />
                    </div>
                </div>

                {/* Testimonial */}
                <div className="border-t border-zinc-100 pt-8">
                    <Label className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-4 block">Depoimento</Label>
                    <div className="p-6 bg-zinc-50 border border-zinc-100 rounded-xl space-y-4">
                        <Textarea {...register('testimonial_quote')} placeholder="Citação do cliente..." className="bg-white italic border-zinc-200" />
                        <div className="grid grid-cols-2 gap-4">
                            <Input {...register('testimonial_author')} placeholder="Autor" className="bg-white border-zinc-200" />
                            <Input {...register('testimonial_role')} placeholder="Cargo / Empresa" className="bg-white border-zinc-200" />
                        </div>
                    </div>
                </div>
            </div>
        </AIEditorLayout>
    );
};

export default CaseForm;
