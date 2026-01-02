import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Save, Upload, Loader2, Trash2, Image as ImageIcon } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { uploadImageToSupabase } from '@/utils/uploadImageToSupabase';
import AIEditorLayout from '@/components/layout/AIEditorLayout';

const categories = [
  'RevOps', 'Account Based Marketing', 'PLG', 'Estratégia', 'CRO',
  'Dados', 'Automação', 'Vendas', 'Geração de Demanda',
  'Polemic Led Growth', 'Outra'
];

interface PostEditorProps {
  post?: {
    id: number | string;
    title: string;
    slug: string;
    excerpt: string;
    content?: string;
    category: string;
    thumbnail?: string;
    image?: string;
    read_time?: string;
    published?: boolean;
  };
  isEditing?: boolean;
}

const PostEditor = ({ post, isEditing = false }: PostEditorProps) => {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [category, setCategory] = useState('');
  const [content, setContent] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [customCategory, setCustomCategory] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [published, setPublished] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  useEffect(() => {
    if (post && isEditing) {
      setTitle(post.title || '');
      setSlug(post.slug || '');
      setExcerpt(post.excerpt || '');
      setCategory(post.category || '');
      setCoverImage(post.image || post.thumbnail || '');
      setContent(post.content || '');
      setPublished(post.published || false);
    }
  }, [post, isEditing]);

  const generateSlug = (text: string) => {
    return text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  };

  useEffect(() => {
    if (!isEditing || !post) {
      setSlug(generateSlug(title));
    }
  }, [title, isEditing, post]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    setIsUploadingImage(true);
    try {
      const file = e.target.files[0];
      const publicUrl = await uploadImageToSupabase(file, 'blog-covers');
      if (publicUrl) {
        setCoverImage(publicUrl);
        toast.success('Imagem carregada com sucesso');
      }
    } catch (error) {
      toast.error('Erro ao fazer upload da imagem');
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleSave = async () => {
    if (!title) return toast.error('Título é obrigatório');

    setIsSaving(true);
    try {
      const postData = {
        title,
        slug,
        excerpt,
        content,
        category: category === 'Outra' ? customCategory : category,
        image: coverImage,
        thumbnail: coverImage,
        read_time: `${Math.max(1, Math.ceil(content.split(/\s+/).length / 200))} min`,
        published,
        updated_at: new Date().toISOString(),
      };

      if (isEditing && post) {
        const { error } = await supabase.from('blog_posts').update(postData).eq('id', post.id);
        if (error) throw error;
        toast.success('Artigo atualizado!');
      } else {
        const { error } = await supabase.from('blog_posts').insert([postData]);
        if (error) throw error;
        toast.success('Artigo criado!');
        navigate('/admin/posts');
      }
    } catch (error: any) {
      toast.error('Erro ao salvar: ' + error.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!post || !confirm('Tem certeza que deseja excluir?')) return;
    const { error } = await supabase.from('blog_posts').delete().eq('id', post.id);
    if (error) toast.error('Erro ao excluir');
    else {
      toast.success('Artigo excluído');
      navigate('/admin/posts');
    }
  };

  return (
    <AIEditorLayout
      title={isEditing ? 'Editar Artigo' : 'Novo Artigo'}
      description={isEditing ? `Editando: ${post?.title}` : 'Crie um novo conteúdo para o blog'}
      saving={isSaving}
      actions={
        <>
          <div className="flex items-center gap-2">
            <Switch id="published" checked={published} onCheckedChange={setPublished} />
            <Label htmlFor="published" className="text-xs uppercase font-medium text-zinc-500 cursor-pointer">
              {published ? 'Publicado' : 'Rascunho'}
            </Label>
          </div>

          <Button onClick={handleSave} disabled={isSaving} className="bg-zinc-900 text-white hover:bg-black font-medium h-9 text-xs px-4">
            {isSaving ? <Loader2 className="w-3 h-3 animate-spin mr-2" /> : <Save className="w-3 h-3 mr-2" />}
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
      {/* Cover Image */}
      <div className="group relative rounded-xl overflow-hidden bg-zinc-50 border border-zinc-100 aspect-[21/9] flex items-center justify-center transition-all hover:border-zinc-300">
        {coverImage ? (
          <>
            <img src={coverImage} alt="Cover" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
          </>
        ) : (
          <div className="text-center">
            <ImageIcon className="w-8 h-8 text-zinc-300 mx-auto mb-2" />
            <span className="text-xs text-zinc-400 font-medium">Adicionar Imagem de Capa</span>
          </div>
        )}

        <label className="absolute inset-0 cursor-pointer flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={isUploadingImage} />
          <div className="bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full shadow-sm text-xs font-medium text-zinc-700 flex items-center gap-2">
            {isUploadingImage ? <Loader2 className="w-3 h-3 animate-spin" /> : <Upload className="w-3 h-3" />}
            {coverImage ? 'Alterar Imagem' : 'Upload Imagem'}
          </div>
        </label>
      </div>

      {/* Meta Fields Grid */}
      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-1.5">
          <Label className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">Categoria</Label>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="bg-white border-zinc-200 text-[13px] h-10">
              <SelectValue placeholder="Selecione..." />
            </SelectTrigger>
            <SelectContent>
              {categories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">URL Slug</Label>
          <Input
            value={slug}
            onChange={e => setSlug(e.target.value)}
            className="bg-white border-zinc-200 text-[13px] h-10 font-mono text-zinc-600"
            placeholder="url-do-artigo"
          />
        </div>
      </div>

      {/* Title */}
      <div className="space-y-2">
        <Textarea
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="Título do Artigo"
          className="text-4xl md:text-5xl font-bold border-none px-0 resize-none min-h-[60px] leading-tight focus-visible:ring-0 placeholder:text-zinc-200 text-zinc-900 bg-transparent"
          rows={1}
          onInput={(e) => {
            const target = e.target as HTMLTextAreaElement;
            target.style.height = 'auto';
            target.style.height = target.scrollHeight + 'px';
          }}
        />
      </div>

      {/* Excerpt */}
      <div className="space-y-1.5 p-4 bg-zinc-50 rounded-lg border border-zinc-100">
        <Label className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider flex items-center gap-2">
          Resumo de Impacto (Excerpt)
          <span className={`text-[10px] ml-auto ${excerpt.length > 160 ? 'text-red-500' : 'text-green-500'}`}>{excerpt.length}/160</span>
        </Label>
        <Textarea
          value={excerpt}
          onChange={e => setExcerpt(e.target.value)}
          placeholder="Uma ou duas frases que vendem o clique..."
          className="border-none bg-transparent px-0 text-[14px] text-zinc-600 focus-visible:ring-0 min-h-[40px] resize-none italic"
        />
      </div>

      {/* Content Editor */}
      <div className="space-y-2 pt-4">
        <Label className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">Conteúdo</Label>
        <Textarea
          value={content}
          onChange={e => setContent(e.target.value)}
          placeholder="Comece a escrever ou cole o HTML gerado pela IA..."
          className="min-h-[500px] border-zinc-200 text-[16px] leading-relaxed p-6 font-serif resize-y focus-visible:ring-zinc-200 focus-visible:border-zinc-300"
        />
        <p className="text-[11px] text-zinc-400 text-right">
          Dica: Use HTML para formatação avançada ou Markdown simples.
        </p>
      </div>
    </AIEditorLayout>
  );
};

export default PostEditor;
