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
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { toast } from 'sonner';
import { Save, Eye, Image, FileText, Upload, Loader2, ArrowLeft, Trash2, Sparkles, Copy, ChevronDown, ChevronUp } from 'lucide-react';
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
  const [promptObject, setPromptObject] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [published, setPublished] = useState(false);
  const [readTime, setReadTime] = useState('5 min');
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [promptExpanded, setPromptExpanded] = useState(false);

  useEffect(() => {
    if (post && isEditing) {
      setTitle(post.title || '');
      setSlug(post.slug || '');
      setExcerpt(post.excerpt || '');
      setCategory(post.category || '');
      setCoverImage(post.image || post.thumbnail || '');
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

  // Calculate SEO Score (0-100)
  const calculateSEOScore = (): { score: number; feedback: string[] } => {
    let score = 0;
    const feedback: string[] = [];

    // Title (30 points)
    if (title.length >= 30 && title.length <= 60) {
      score += 30;
    } else if (title.length > 0 && title.length < 30) {
      score += 15;
      feedback.push('Título muito curto');
    } else if (title.length > 60 && title.length <= 80) {
      score += 20;
      feedback.push('Título um pouco longo');
    } else if (title.length > 80) {
      score += 10;
      feedback.push('Título muito longo para SEO');
    }

    // Excerpt (20 points)
    if (excerpt.length >= 120 && excerpt.length <= 160) {
      score += 20;
    } else if (excerpt.length > 0 && excerpt.length < 120) {
      score += 10;
      feedback.push('Resumo muito curto');
    } else if (excerpt.length > 160) {
      score += 5;
      feedback.push('Resumo muito longo');
    }

    // Content length (25 points)
    const wordCount = content.split(/\s+/).filter(w => w).length;
    if (wordCount >= 800 && wordCount <= 2000) {
      score += 25;
    } else if (wordCount >= 500 && wordCount < 800) {
      score += 15;
      feedback.push('Artigo um pouco curto');
    } else if (wordCount > 2000) {
      score += 20;
      feedback.push('Artigo muito longo');
    } else if (wordCount > 0) {
      score += 5;
      feedback.push('Artigo muito curto');
    }

    // Structure (15 points)
    const hasH2 = content.includes('## ');
    const hasH3 = content.includes('### ');
    const hasList = content.includes('- ') || content.includes('1. ');

    if (hasH2) score += 5;
    else if (content.length > 0) feedback.push('Adicione títulos H2 (##)');

    if (hasH3) score += 5;
    if (hasList) score += 5;
    else if (content.length > 0) feedback.push('Adicione listas');

    // Category (10 points)
    if (category && category !== '') score += 10;

    return { score, feedback };
  };

  const seoAnalysis = calculateSEOScore();

  const handleSave = async () => {
    if (!title || !slug || !excerpt || !category) {
      toast.error('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    setIsSaving(true);

    const finalCategory = category === 'Outra' ? customCategory : category;

    try {
      const postData: any = {
        title,
        slug,
        excerpt,
        content,
        category: finalCategory,
        image: coverImage || null,
        read_time: readTime,
        date: new Date().toISOString(),
        published: published
      };

      // Add author_id if new post
      if (!isEditing) {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          postData.author_id = session.user.id;
        }
      }

      console.log('📤 Enviando postData para Supabase:', postData);

      if (isEditing && post) {
        // Prepare update payload - remove fields that shouldn't change or cause issues
        const { date, ...updateData } = postData; // Optionally keep original date or update 'updated_at' if exists

        const { error } = await supabase
          .from('blog_posts')
          .update(postData) // Send full data including date update
          .eq('id', post.id);

        if (error) {
          console.error('❌ Erro no Update Supabase:', error);
          throw error;
        }
        toast.success('Post atualizado com sucesso!');
      } else {
        const { error } = await supabase
          .from('blog_posts')
          .insert([postData]);

        if (error) {
          console.error('❌ Erro no Insert Supabase:', error);
          throw error;
        }
        toast.success('Post criado com sucesso!');
      }

      navigate('/admin/posts');
    } catch (error: any) {
      console.error('Erro ao salvar post:', error);
      toast.error(`Erro ao salvar post: ${error.message || 'Erro desconhecido'}`);
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
      } catch (err: any) {
        console.error('Upload error:', err);

        // Specialized error for RLS/Permissions
        if (err.message?.includes('violates row-level security') || err.message?.includes('permission denied') || err.message?.includes('Supabase: new row violates')) {
          toast.error('ERRO DE PERMISSÃO: O banco de dados bloqueou o upload. Execute a migração de políticas de Storage.');
        } else {
          toast.error(`Erro no upload: ${err.message || 'Falha desconhecida'}. Tente novamente.`);
        }
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
          {/* SEO Score Widget */}
          {(title || excerpt || content) && (
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">Score SEO</span>
                    <button
                      type="button"
                      className="w-4 h-4 rounded-full bg-gray-200 text-gray-600 hover:bg-black hover:text-white transition-colors flex items-center justify-center text-[10px] font-bold"
                      title="Análise baseada em: tamanho do título, resumo, conteúdo, estrutura e categoria."
                    >
                      ?
                    </button>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-32 h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-500 ${seoAnalysis.score >= 80 ? 'bg-black' :
                          seoAnalysis.score >= 60 ? 'bg-gray-600' :
                            'bg-gray-400'
                          }`}
                        style={{ width: `${seoAnalysis.score}%` }}
                      />
                    </div>
                    <span className={`text-2xl font-bold font-mono ${seoAnalysis.score >= 80 ? 'text-black' :
                      seoAnalysis.score >= 60 ? 'text-gray-600' :
                        'text-gray-400'
                      }`}>
                      {seoAnalysis.score}
                    </span>
                  </div>
                </div>
                {seoAnalysis.feedback.length > 0 && (
                  <div className="flex items-center gap-2">
                    {seoAnalysis.feedback.slice(0, 3).map((item, idx) => (
                      <span key={idx} className="text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded border border-gray-200">
                        {item}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200 space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <label htmlFor="title" className="block text-sm font-semibold text-gray-700">
                      Título do Artigo *
                    </label>
                    <button
                      type="button"
                      className="w-4 h-4 rounded-full bg-gray-200 text-gray-600 hover:bg-black hover:text-white transition-colors flex items-center justify-center text-[10px] font-bold"
                      title="Use um título claro e direto. Ideal: 30-60 caracteres para SEO."
                    >
                      ?
                    </button>
                  </div>
                  <Input
                    id="title"
                    value={title}
                    onChange={handleTitleChange}
                    placeholder="Ex: Como Estruturar um Funil de Vendas B2B"
                    className="h-11 bg-white border-gray-200 text-gray-900 placeholder:text-gray-400 focus:border-black"
                    required
                  />
                  {title.length > 0 && (
                    <div className="flex items-center gap-2 text-xs mt-1">
                      <span className="font-mono text-gray-400">{title.length} caracteres</span>
                      <span className="text-gray-300">•</span>
                      {title.length >= 30 && title.length <= 60 ? (
                        <span className="text-gray-600">✓ Tamanho ideal para SEO</span>
                      ) : title.length > 60 && title.length <= 80 ? (
                        <span className="text-gray-500">⚠ Um pouco longo</span>
                      ) : title.length > 80 ? (
                        <span className="text-black font-semibold">✗ Muito longo para SEO</span>
                      ) : (
                        <span className="text-gray-400">Pode ser mais descritivo</span>
                      )}
                    </div>
                  )}
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <label htmlFor="slug" className="block text-sm font-semibold text-gray-700">
                      URL (Slug)
                    </label>
                    <button
                      type="button"
                      className="w-4 h-4 rounded-full bg-gray-200 text-gray-600 hover:bg-black hover:text-white transition-colors flex items-center justify-center text-[10px] font-bold"
                      title="Gerado automaticamente a partir do título. Apenas letras minúsculas e hífens."
                    >
                      ?
                    </button>
                  </div>
                  <Input
                    id="slug"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    placeholder="slug-do-post"
                    className="h-11 bg-gray-50 border-gray-200 text-gray-600"
                    required
                    disabled={!isEditing}
                  />
                  <p className="text-xs text-gray-400 mt-1">
                    ✓ Auto-gerado a partir do título
                  </p>
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <label htmlFor="category" className="block text-sm font-semibold text-gray-700">
                      Categoria Mestra *
                    </label>
                    <button
                      type="button"
                      className="w-4 h-4 rounded-full bg-gray-200 text-gray-600 hover:bg-black hover:text-white transition-colors flex items-center justify-center text-[10px] font-bold"
                      title="Escolha a categoria que melhor representa o conteúdo do artigo."
                    >
                      ?
                    </button>
                  </div>
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
                      <img
                        src={coverImage}
                        alt="Preview"
                        className="absolute inset-0 w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?q=80&w=1800&auto=format&fit=crop';
                        }}
                      />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                        <div
                          className="p-3 bg-white/20 hover:bg-white/40 rounded-full backdrop-blur-md transition-all"
                          onClick={(e) => {
                            e.stopPropagation();
                            document.getElementById('image-upload')?.click();
                          }}
                        >
                          <Upload className="w-5 h-5 text-white" />
                        </div>
                        <div
                          className="p-3 bg-red-500/50 hover:bg-red-500 rounded-full backdrop-blur-md transition-all"
                          onClick={(e) => {
                            e.stopPropagation();
                            setCoverImage('');
                            toast.success('Imagem removida');
                          }}
                        >
                          <Trash2 className="w-5 h-5 text-white" />
                        </div>
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

                <div className="mt-4 pt-4 border-t border-gray-100">
                  <p className="text-[10px] font-bold text-gray-400 mb-2 uppercase tracking-widest">Opção Alternativa (Link Direto)</p>
                  <Input
                    value={coverImage}
                    onChange={(e) => setCoverImage(e.target.value)}
                    placeholder="Cole aqui um link de imagem (https://...)"
                    className="bg-white border-gray-200 text-xs h-9 focus:border-black transition-colors"
                  />
                </div>

                {/* AI Prompt Builder Section - Colapsável */}
                <div className="mt-6 pt-6 border-t border-gray-100">
                  <Collapsible open={promptExpanded} onOpenChange={setPromptExpanded}>
                    <CollapsibleTrigger asChild>
                      <Button
                        variant="ghost"
                        className="w-full justify-between p-3 hover:bg-gray-50 rounded-lg border border-gray-200"
                        type="button"
                      >
                        <div className="text-left">
                          <h3 className="text-xs font-bold text-black uppercase tracking-wider">
                            Gerador de Prompt AI
                          </h3>
                          <p className="text-[10px] text-gray-500 normal-case tracking-normal">
                            Crie prompts padronizados para capas (opcional)
                          </p>
                        </div>
                        {promptExpanded ? (
                          <ChevronUp className="h-4 w-4 text-gray-400" />
                        ) : (
                          <ChevronDown className="h-4 w-4 text-gray-400" />
                        )}
                      </Button>
                    </CollapsibleTrigger>

                    <CollapsibleContent className="mt-3">
                      <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg space-y-3">
                        <div>
                          <Label className="text-xs font-semibold text-black mb-1.5 block">
                            Objeto Visual
                          </Label>
                          <Input
                            value={promptObject}
                            onChange={(e) => setPromptObject(e.target.value)}
                            placeholder="Ex: Glass Rocket, Shield, Brain..."
                            className="bg-white border-gray-200 h-9 text-sm focus:border-black"
                          />
                          <p className="text-[10px] text-gray-500 mt-1">
                            Digite em inglês para melhores resultados
                          </p>
                        </div>

                        <div>
                          <div className="flex items-center justify-between mb-1.5">
                            <Label className="text-xs font-semibold text-black">
                              Prompt Completo
                            </Label>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className="h-7 text-xs bg-white border-gray-300 hover:bg-black hover:text-white hover:border-black"
                              onClick={() => {
                                const p = `A wide 16:9 cinematic shot of a minimalist 3D glass icon representing ${title || 'TOPIC'}. A sleek, translucent dark glass ${promptObject || '[OBJECT]'} floating in a vast deep black void. Inside the glass, glowing neon green data circuits and flow. Premium glassmorphism, sharp edges, internal light reflection, soft neon green rim lighting. IMPORTANT: The object is SMALL in the frame (approx 30% height), perfectly centered, with massive negative space around it. Identical scale (zoom out) to a minimalist icon. No text. 8k resolution. Pure engineering artifact style.`;
                                navigator.clipboard.writeText(p);
                                toast.success('Prompt copiado!');
                              }}
                            >
                              <Copy className="w-3 h-3 mr-1" />
                              Copiar
                            </Button>
                          </div>
                          <div className="bg-white border border-gray-200 rounded-md p-3 text-[11px] font-mono text-gray-700 leading-relaxed">
                            A wide 16:9 cinematic shot of a minimalist 3D glass icon representing{' '}
                            <span className="font-semibold text-black">{title || '[TOPIC]'}</span>.
                            A sleek, translucent dark glass{' '}
                            <span className="font-semibold text-black">{promptObject || '[OBJECT]'}</span>{' '}
                            floating in a vast deep black void.
                            Inside the glass, glowing neon green data circuits and flow. Premium glassmorphism, sharp edges, internal light reflection, soft neon green rim lighting.
                            IMPORTANT: The object is SMALL in the frame (approx 30% height), perfectly centered, with massive negative space around it.
                            Identical scale (zoom out) to a minimalist icon. No text. 8k resolution. Pure engineering artifact style.
                          </div>
                        </div>
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                </div>
              </div>
            </div>

            {/* Resumo de Impacto - Ultra Minimalista */}
            <div className="p-6 bg-white border border-gray-300 rounded-lg space-y-4">
              <div className="flex items-start gap-3 pb-3 border-b border-gray-200">
                <div className="w-6 h-6 bg-black text-white rounded flex items-center justify-center shrink-0 text-xs font-bold">
                  1
                </div>
                <div className="flex-1">
                  <label htmlFor="excerpt" className="block text-sm font-bold text-black mb-1">
                    Resumo de Impacto (Excerpt)
                  </label>
                  <p className="text-xs text-gray-500">
                    Uma ou duas frases que vendem o clique. Aparece nos cards de preview.
                  </p>
                </div>
              </div>
              <Textarea
                id="excerpt"
                value={excerpt}
                onChange={handleExcerptChange}
                placeholder="Ex: Descubra como estruturar demos que convertem 3x mais do que a média do mercado..."
                className="min-h-[100px] bg-gray-50 border-gray-200 focus:border-black text-gray-900 resize-none"
                required
              />
              <div className="flex items-center gap-3 text-xs text-gray-500 pt-2 border-t border-gray-100">
                <span className="font-semibold text-black">Caracteres:</span>
                <span className="font-mono">{excerpt.length}/160</span>
                <span className="text-gray-300">•</span>
                <span className={excerpt.length > 160 ? 'text-black font-semibold' : 'text-gray-400'}>
                  {excerpt.length <= 160 ? 'Ideal para SEO' : 'Muito longo'}
                </span>
              </div>
            </div>

            {/* Corpo do Artigo - Ultra Minimalista */}
            <div className="p-6 bg-gray-50 border border-gray-200 rounded-lg space-y-4">
              <div className="flex items-start gap-3 pb-3 border-b border-gray-300">
                <div className="w-6 h-6 bg-black text-white rounded flex items-center justify-center shrink-0 text-xs font-bold">
                  2
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div>
                      <label htmlFor="content" className="block text-sm font-bold text-black mb-1">
                        Corpo do Artigo
                      </label>
                      <p className="text-xs text-gray-500">
                        Cole o texto puro. O sistema formatará automaticamente.
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="text-xs hover:bg-white"
                      onClick={insertV2Template}
                    >
                      <FileText className="w-3 h-3 mr-1" /> Template V2
                    </Button>
                  </div>
                </div>
              </div>

              <Textarea
                id="content"
                value={content}
                onChange={handleContentChange}
                placeholder={`Cole o texto do artigo aqui...

## Título Principal

Parágrafo introdutório com **negrito** e *itálico*.

### Subtítulo

- Item de lista 1
- Item de lista 2

> Citação importante
> — Autor

---

Outro parágrafo...`}
                className="min-h-[500px] font-mono text-sm bg-white border-gray-200 focus:border-black text-gray-900 placeholder:text-gray-400"
                required
              />

              {/* Grid de Sintaxe - Minimalista */}
              <div className="p-4 bg-white border border-gray-200 rounded">
                <p className="text-xs font-bold text-black mb-3">Sintaxe Suportada:</p>
                <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-xs">
                  <div className="flex items-center gap-2 text-gray-600">
                    <code className="bg-gray-100 px-2 py-0.5 rounded font-mono text-black border border-gray-200">##</code>
                    <span>Título H2</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <code className="bg-gray-100 px-2 py-0.5 rounded font-mono text-black border border-gray-200">###</code>
                    <span>Subtítulo H3</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <code className="bg-gray-100 px-2 py-0.5 rounded font-mono text-black border border-gray-200">-</code>
                    <span>Lista</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <code className="bg-gray-100 px-2 py-0.5 rounded font-mono text-black border border-gray-200">1.</code>
                    <span>Lista numerada</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <code className="bg-gray-100 px-2 py-0.5 rounded font-mono text-black border border-gray-200">**</code>
                    <span>Negrito</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <code className="bg-gray-100 px-2 py-0.5 rounded font-mono text-black border border-gray-200">*</code>
                    <span>Itálico</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <code className="bg-gray-100 px-2 py-0.5 rounded font-mono text-black border border-gray-200">{">"}</code>
                    <span>Citação</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <code className="bg-gray-100 px-2 py-0.5 rounded font-mono text-black border border-gray-200">---</code>
                    <span>Divisor</span>
                  </div>
                </div>
              </div>

              {/* Contador de Palavras */}
              <div className="flex items-center gap-4 text-xs text-gray-500 pt-3 border-t border-gray-200">
                <span><strong className="text-black font-mono">{content.split(/\s+/).filter(w => w).length}</strong> palavras</span>
                <span className="text-gray-300">•</span>
                <span><strong className="text-black font-mono">{readTime}</strong> de leitura</span>
              </div>
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

              <Button onClick={handleSave} disabled={isSaving} className="bg-revgreen text-black hover:bg-revgreen/90 min-w-[200px] h-14 text-lg font-black uppercase tracking-tighter shadow-xl hover:shadow-revgreen/20 transition-all">
                <Save className="mr-2 h-6 w-6" />
                {isSaving ? 'Salvando...' : (isEditing ? 'Salvar Artigo' : 'Criar Artigo')}
              </Button>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="preview" className="focus-visible:outline-none focus-visible:ring-0">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden min-h-[800px]">
            {/* Mock Header for Context */}
            <div className="bg-zinc-50 border-b border-gray-100 px-8 py-3 flex items-center justify-between text-[10px] font-bold text-gray-400 uppercase tracking-widest">
              <span>Modo de Visualização (Live Preview)</span>
              <div className="flex gap-2">
                <div className="w-2 h-2 rounded-full bg-red-400/30"></div>
                <div className="w-2 h-2 rounded-full bg-yellow-400/30"></div>
                <div className="w-2 h-2 rounded-full bg-green-400/30"></div>
              </div>
            </div>

            {title ? (
              <div className="max-w-4xl mx-auto px-8 py-20 animate-in fade-in slide-in-from-bottom-4 duration-500">
                {/* Meta Header */}
                <div className="flex items-center gap-4 mb-8">
                  <span className="bg-revgreen/10 text-revgreen text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-sm border border-revgreen/20">
                    {category === 'Outra' ? customCategory : category}
                  </span>
                  <div className="h-px w-8 bg-zinc-200" />
                  <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                    {readTime} de leitura
                  </span>
                </div>

                <h1 className="text-4xl md:text-6xl font-black text-black tracking-tighter mb-8 leading-[1.1]">
                  {title}<span className="text-revgreen">.</span>
                </h1>

                <p className="text-xl md:text-2xl text-zinc-500 font-normal tracking-tight mb-12 leading-relaxed border-l-4 border-revgreen pl-6 italic">
                  {excerpt}
                </p>

                {coverImage && (
                  <div className="mb-16 -mx-4 md:-mx-8">
                    <img
                      src={coverImage}
                      alt={title}
                      className="w-full h-[400px] object-cover rounded-sm shadow-2xl"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?q=80&w=1800&auto=format&fit=crop';
                      }}
                    />
                  </div>
                )}

                <article className="prose prose-zinc max-w-none">
                  {(() => {
                    try {
                      const isJson = content.trim().startsWith('{');
                      if (isJson) {
                        const v2Content = JSON.parse(content);
                        if (v2Content.sections) {
                          return (
                            <div className="space-y-16">
                              {v2Content.sections.map((section: any, idx: number) => {
                                switch (section.type) {
                                  case 'strategic_context':
                                    return (
                                      <div key={idx} className="bg-zinc-50 p-10 rounded-sm border border-zinc-100">
                                        <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-revgreen mb-4">Contexto Estratégico</h4>
                                        <p className="text-lg text-zinc-700 font-serif leading-relaxed italic">"{section.content}"</p>
                                      </div>
                                    );
                                  case 'key_takeaways':
                                    return (
                                      <div key={idx} className="bg-black p-10 rounded-sm text-white shadow-2xl">
                                        <h3 className="text-2xl font-black uppercase tracking-tighter mb-8 italic">{section.title}</h3>
                                        <div className="grid md:grid-cols-2 gap-8">
                                          {section.items?.map((item: any, i: number) => (
                                            <div key={i} className="space-y-2 border-l border-white/20 pl-4 py-1">
                                              <h4 className="font-bold text-revgreen uppercase text-xs tracking-widest">{item.title}</h4>
                                              <p className="text-white/60 text-sm leading-relaxed">{item.description}</p>
                                            </div>
                                          ))}
                                        </div>
                                      </div>
                                    );
                                  case 'cards_grid':
                                    return (
                                      <div key={idx} className="space-y-8">
                                        <h3 className="text-3xl font-black uppercase tracking-tighter text-black">{section.title}</h3>
                                        <div className="grid md:grid-cols-3 gap-6">
                                          {section.items?.map((card: any, i: number) => (
                                            <div key={i} className={`p-6 border rounded-sm transition-all duration-300 ${card.type === 'warning' ? 'bg-red-50 border-red-100' :
                                              card.type === 'success' ? 'bg-green-50 border-green-100' :
                                                'bg-white border-zinc-200'
                                              }`}>
                                              <h4 className="font-black text-[10px] uppercase tracking-widest mb-3">{card.title}</h4>
                                              <p className="text-sm text-zinc-600 leading-relaxed mb-4">{card.description}</p>
                                              <p className={`text-[10px] font-bold uppercase tracking-widest ${card.type === 'warning' ? 'text-red-600' :
                                                card.type === 'success' ? 'text-green-600' :
                                                  'text-revgreen'
                                                }`}>FIX: {card.fix}</p>
                                            </div>
                                          ))}
                                        </div>
                                      </div>
                                    );
                                  default:
                                    return (
                                      <div key={idx} className="text-zinc-800 leading-[1.8] font-normal text-lg"
                                        dangerouslySetInnerHTML={{ __html: section.content || '' }} />
                                    );
                                }
                              })}
                            </div>
                          );
                        }
                      }
                    } catch (e) {
                      // Standard Markdown fallback
                    }

                    return <div className="text-zinc-800 leading-[1.8] font-normal text-lg space-y-4" dangerouslySetInnerHTML={{ __html: content.replace(/\n/g, '<br/>') }} />;
                  })()}
                </article>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-[600px] text-gray-400">
                <FileText size={48} className="mb-4 opacity-20" />
                <p className="font-bold uppercase tracking-widest text-[10px]">Preencha os campos para visualizar</p>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PostEditor;
