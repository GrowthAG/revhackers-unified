import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Save, Eye, Image, FileText, Upload, Loader2, ArrowLeft, Trash2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { uploadImageToSupabase } from '@/utils/uploadImageToSupabase';

const categories = [
  'RevOps',
  'Account Based Marketing',
  'PLG',
  'Estratégia',
  'CRO',
  'Dados',
  'Automação',
  'Vendas',
  'Geração de Demanda',
  'Polemic Led Growth',
  'Outra',
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
    image?: string; // Legacy support
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
  const [activeTab, setActiveTab] = useState('editor');
  const [customCategory, setCustomCategory] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [published, setPublished] = useState(false);
  const [readTime, setReadTime] = useState('5 min');
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  useEffect(() => {
    if (post && isEditing) {
      setTitle(post.title);
      setSlug(post.slug);
      setExcerpt(post.excerpt);
      setCategory(post.category);
      setCategory(post.category);
      setCoverImage(post.thumbnail || post.image || '');
      setReadTime(post.read_time || '5 min');
      setContent(post.content || '');
      setPublished(post.published || false);
    }
  }, [post, isEditing]);

  useEffect(() => {
    if (!isEditing || !post) {
      setSlug(generateSlug(title));
    }
  }, [title, isEditing, post]);

  useEffect(() => {
    if (content) {
      const wordCount = content.split(/\s+/).length;
      const minutes = Math.max(1, Math.ceil(wordCount / 200));
      setReadTime(`${minutes} min`);
    }
  }, [content]);

  const handleSave = async () => {
    if (!title || !slug || !excerpt || !category) {
      toast.error('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    setIsSaving(true);

    const finalCategory = category === 'Outra' ? customCategory : category;

    try {
      const postData = {
        title,
        slug,
        excerpt,
        content,
        category: finalCategory,
        thumbnail: coverImage || 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?q=80&w=1800&auto=format&fit=crop',
        read_time: readTime,
        date: new Date().toISOString(),
        published: published
      };

      // Add author_id if new post
      if (!isEditing) {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          // @ts-ignore
          postData.author_id = session.user.id;
        }
      }

      if (isEditing && post) {
        const { error } = await supabase
          .from('blog_posts')
          .update(postData)
          .eq('id', post.id);

        if (error) throw error;
        toast.success('Post atualizado com sucesso!');
      } else {
        const { error } = await supabase
          .from('blog_posts')
          .insert([postData]);

        if (error) throw error;
        toast.success('Post criado com sucesso!');
      }

      navigate('/admin/posts');
    } catch (error) {
      console.error('Erro ao salvar post:', error);
      toast.error('Erro ao salvar o post. Por favor, tente novamente.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!isEditing || !post?.id) return;

    if (!window.confirm("Tem certeza que deseja excluir este Artigo? Esta ação não pode ser desfeita.")) {
      return;
    }

    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('blog_posts')
        .delete()
        .eq('id', post.id);

      if (error) throw error;

      toast.success('Artigo excluído com sucesso.');
      navigate('/admin/posts');
    } catch (error: any) {
      console.error(error);
      toast.error(`Erro ao excluir: ${error.message}`);
      setIsSaving(false);
    }
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
  };

  const handleExcerptChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setExcerpt(e.target.value);
  };

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
  };

  const handleCategoryChange = (value: string) => {
    setCategory(value);
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setIsUploadingImage(true);
      try {
        const imageUrl = await uploadImageToSupabase(file);
        setCoverImage(imageUrl);
        toast.success('Imagem enviada com sucesso!');
      } catch (err) {
        toast.error('Erro ao enviar imagem de capa.');
        console.error(err);
      } finally {
        setIsUploadingImage(false);
      }
    }
  };

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/--+/g, '-')
      .trim();
  };

  const insertV2Template = () => {
    const template = {
      v2_template: true,
      sections: [
        {
          type: "strategic_context",
          label: "Contexto Estratégico",
          content: "Neste artigo vamos explorar como otimizar a jornada do cliente usando frameworks de Revenue Operations..."
        },
        {
          type: "key_takeaways",
          title: "Executive Summary",
          items: [
            { title: "Alinhamento", description: "O primeiro passo é garantir que vendas e marketing falem a mesma língua." },
            { title: "Eficiência", description: "Use automação para processos repetitivos e ganhe escala." }
          ]
        },
        {
          type: "concept",
          concept: "O Novo Conceito",
          definition: "Revenue Operations não é apenas um cargo, é uma filosofia de crescimento sustentável equilibrando processos, dados e pessoas.",
          amateurView: "Apenas gerenciar o CRM e cobrar o time de vendas.",
          proView: "Orquestrar toda a jornada do cliente (Marketing, Vendas e CX) sob um único stack de dados e processos."
        },
        {
          type: "text",
          content: "<h2>O Framework na Prática</h2><p>Normalmente o erro das empresas de tecnologia é tentar escalar sem antes ter um playbook de vendas validado...</p>"
        },
        {
          type: "cards_grid",
          title: "Os 3 Pilares da Eficiência",
          items: [
            {
              title: "Dados Unificados",
              description: "Se o Marketing olha o GA4 e Vendas olha o Salesforce com números diferentes, você tem um problema.",
              fix: "Implemente um Single Source of Truth.",
              type: "info"
            },
            {
              title: "Processos Escritos",
              description: "Processo que só existe na cabeça do gestor não é processo, é lenda urbana.",
              fix: "Documente tudo no Notion.",
              type: "warning"
            },
            {
              title: "Tecnologia Integrada",
              description: "Ter 20 ferramentas que não se falam é mais caro do que não ter nada.",
              fix: "Priorize integrações nativas.",
              type: "success"
            }
          ]
        },
        {
          type: "email_templates",
          title: "Templates para seu Time",
          templates: [
            {
              name: "Email de Prospecção Fria",
              subject: "Uma ideia sobre seu processo de [Processo]",
              body: "Olá [Nome],\n\nNotei que sua empresa está crescendo rápido em [Mercado].\n\nNormalmente nessa fase, o maior gargalo é [Gargalo].\n\nTrabalhamos com empresas similares ajudando a [Resultado].\n\nToparia uma conversa de 10 min?\n\nAbs,\n[Seu Nome]"
            }
          ]
        },
        {
          type: "red_flags",
          title: "O que deve ser evitado",
          flags: [
            "Métricas de vaidade (likes, acessos sem conversão)",
            "Ferramentas subutilizadas ou sem dono",
            "Falta de documentação dos playbooks"
          ]
        },
        {
          type: "conclusion",
          title: "Sua operação está pronta?",
          description: "Nossa metodologia ajuda empresas de tecnologia a estruturarem playbooks que realmente convertem.",
          ctaText: "Agendar Diagnóstico",
          ctaLink: "/agenda-diagnostico"
        }
      ]
    };
    setContent(JSON.stringify(template, null, 2));
    toast.success('Master Template V2 inserido! Siga o padrão para posts premium.');
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate('/admin/posts')} className="pl-0 text-gray-500 hover:text-gray-900 hover:bg-gray-50">
            <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
          </Button>
          <h2 className="text-2xl font-bold text-gray-900 border-l border-gray-300 pl-4">
            {isEditing ? 'Editar Post' : 'Novo Post'}
          </h2>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            onClick={() => setActiveTab(activeTab === 'editor' ? 'preview' : 'editor')}
            className="border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
          >
            {activeTab === 'editor' ? (
              <>
                <Eye className="mr-2 h-4 w-4" />
                Visualizar
              </>
            ) : (
              <>
                <FileText className="mr-2 h-4 w-4" />
                Editor
              </>
            )}
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-gray-100 p-1 border-none">
          <TabsTrigger value="editor" className="data-[state=active]:bg-white data-[state=active]:shadow-sm text-gray-600">Editor</TabsTrigger>
          <TabsTrigger value="preview" className="data-[state=active]:bg-white data-[state=active]:shadow-sm text-gray-600">Visualização</TabsTrigger>
        </TabsList>

        <TabsContent value="editor" className="space-y-4 focus-visible:outline-none focus-visible:ring-0">
          <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200 space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label htmlFor="title" className="block text-sm font-semibold text-gray-700 mb-1">
                    Título do Artigo *
                  </label>
                  <Input
                    id="title"
                    value={title}
                    onChange={handleTitleChange}
                    placeholder="Ex: Anatomia da Demo Perfeita..."
                    className="h-11 bg-white border-gray-200 text-gray-900 placeholder:text-gray-400 focus:border-black"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="slug" className="block text-sm font-semibold text-gray-700 mb-1">
                    URL (Slug) *
                  </label>
                  <Input
                    id="slug"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    placeholder="slug-do-post"
                    className="h-11 bg-gray-50 border-gray-200 text-gray-600"
                    required
                    disabled={!isEditing}
                  />
                  <p className="text-[10px] text-gray-400 mt-1 uppercase tracking-wider font-bold">
                    AUTO-GERADO A PARTIR DO TÍTULO
                  </p>
                </div>

                <div>
                  <label htmlFor="category" className="block text-sm font-semibold text-gray-700 mb-1">
                    Categoria Mestra *
                  </label>
                  <Select
                    value={category}
                    onValueChange={handleCategoryChange}
                  >
                    <SelectTrigger className="w-full h-11 bg-white border-gray-200 text-gray-900">
                      <SelectValue placeholder="Selecione uma categoria" />
                    </SelectTrigger>
                    <SelectContent className="bg-white text-gray-900 border-gray-200">
                      {categories.map((cat) => (
                        <SelectItem key={cat} value={cat} className="text-gray-900 hover:bg-gray-50 cursor-pointer">
                          {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {category === 'Outra' && (
                    <div className="mt-2">
                      <Input
                        placeholder="Nome da nova categoria"
                        value={customCategory}
                        onChange={(e) => setCustomCategory(e.target.value)}
                        className="h-11 bg-white border-gray-200 text-gray-900"
                      />
                    </div>
                  )}
                </div>
              </div>

              <div>
                <Label className="text-sm font-semibold text-gray-700 mb-1 block uppercase tracking-wider">Capa do Post</Label>
                <div
                  className="border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center h-[215px] hover:bg-gray-50 transition-colors relative overflow-hidden group cursor-pointer bg-gray-50/50"
                  onClick={() => document.getElementById('image-upload')?.click()}
                >
                  {coverImage ? (
                    <>
                      <img src={coverImage} alt="Preview" className="absolute inset-0 w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <p className="text-white font-medium flex items-center gap-2">
                          <Upload className="w-5 h-5" /> Trocar Capa
                        </p>
                      </div>
                    </>
                  ) : (
                    <div className="text-center p-4">
                      <div className="w-12 h-12 bg-white rounded-full shadow-sm flex items-center justify-center mx-auto mb-3 border border-gray-200">
                        <Upload className="h-6 w-6 text-revgreen" />
                      </div>
                      <p className="text-sm font-bold text-gray-900 mb-1">Upload da Capa</p>
                      <p className="text-[10px] text-gray-500 uppercase tracking-widest">1200x600px sugerido</p>
                    </div>
                  )}
                  {isUploadingImage && <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-20"><Loader2 className="animate-spin w-8 h-8 text-revgreen" /></div>}
                </div>
                <input
                  id="image-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageChange}
                />
              </div>
            </div>

            <div>
              <label htmlFor="excerpt" className="block text-sm font-semibold text-gray-700 mb-1">
                Resumo de Impacto (Excerpt) *
              </label>
              <Textarea
                id="excerpt"
                value={excerpt}
                onChange={handleExcerptChange}
                placeholder="Uma ou duas frases que vendem o clique no artigo..."
                className="resize-none h-24 bg-white border-gray-200 text-gray-900 placeholder:text-gray-400 focus:border-black"
                required
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label htmlFor="content" className="block text-sm font-semibold text-gray-700">
                  Corpo do Artigo (Markdown) *
                </label>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-7 text-[10px] font-bold uppercase tracking-widest text-revgreen hover:text-revgreen hover:bg-revgreen/5"
                  onClick={insertV2Template}
                >
                  <FileText className="w-3 h-3 mr-1" /> Usar Template V2
                </Button>
              </div>
              <Textarea
                id="content"
                value={content}
                onChange={handleContentChange}
                placeholder="Insira o conteúdo aqui..."
                className="min-h-[400px] font-mono text-sm border-gray-200 bg-white text-gray-900 placeholder:text-gray-400 focus:border-black"
                required
              />
            </div>

            <div className="flex items-center justify-between pt-8 border-t border-gray-100">
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-3 bg-gray-50 px-4 py-3 rounded-lg border border-gray-200">
                  <Switch
                    id="published"
                    checked={published}
                    onCheckedChange={setPublished}
                  />
                  <Label htmlFor="published" className="cursor-pointer font-bold text-xs uppercase tracking-widest text-gray-600">
                    {published ? 'Status: Publicado' : 'Status: Rascunho'}
                  </Label>
                </div>

                {isEditing && (
                  <Button
                    type="button"
                    variant="destructive"
                    onClick={handleDelete}
                    disabled={isSaving}
                    className="bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 hover:border-red-300 h-10 px-4"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Excluir
                  </Button>
                )}
              </div>

              <Button onClick={handleSave} disabled={isSaving} className="bg-revgreen text-black hover:bg-emerald-400 min-w-[200px] h-14 text-lg font-black uppercase tracking-tighter shadow-xl hover:shadow-revgreen/20 transition-all">
                <Save className="mr-2 h-6 w-6" />
                {isSaving ? 'Salvando...' : (isEditing ? 'Salvar Artigo' : 'Criar Artigo')}
              </Button>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="preview" className="border rounded-md p-6 min-h-[600px] bg-white text-gray-900">
          {title ? (
            <div className="prose prose-lg max-w-none">
              <h1 className="text-3xl font-bold mb-4">{title}</h1>
              {coverImage && (
                <div className="mb-6">
                  <img
                    src={coverImage}
                    alt={title}
                    className="w-full h-64 object-cover rounded-lg"
                  />
                </div>
              )}
              <div className="mb-6">
                <span className="inline-block bg-green-100 text-green-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                  {category === 'Outra' ? customCategory : category}
                </span>
              </div>
              <div className="text-lg font-medium text-gray-700 mb-6">
                {excerpt}
              </div>
              <div className="prose">
                {content.split('\n').map((line, index) => {
                  if (line.startsWith('# ')) {
                    return <h1 key={index} className="text-2xl font-bold my-4">{line.substring(2)}</h1>;
                  } else if (line.startsWith('## ')) {
                    return <h2 key={index} className="text-xl font-bold my-3">{line.substring(3)}</h2>;
                  } else if (line.startsWith('### ')) {
                    return <h3 key={index} className="text-lg font-bold my-2">{line.substring(4)}</h3>;
                  } else if (line === '') {
                    return <br key={index} />;
                  } else {
                    return <p key={index} className="my-2">{line}</p>;
                  }
                })}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-[400px] text-gray-400">
              <FileText size={48} className="mb-4" />
              <p>Preencha os campos do post para visualizar o conteúdo</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PostEditor;
