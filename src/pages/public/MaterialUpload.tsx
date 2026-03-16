import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Upload, Link as LinkIcon, Trash2, FileText, ExternalLink, CheckCircle } from 'lucide-react';
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
import { useToast } from '@/components/ui/use-toast';
import {
  uploadMaterial,
  addMaterialLink,
  getMaterialsByProject,
  deleteMaterial,
  ReiMaterial,
} from '@/api/reiMaterials';

const MATERIAL_TYPES = [
  { value: 'playbook', label: 'Playbook de Vendas' },
  { value: 'ebook', label: 'Ebook / Guia' },
  { value: 'slide', label: 'Apresentação / Slide' },
  { value: 'framework', label: 'Framework / Metodologia' },
  { value: 'planilha', label: 'Planilha / Dados' },
  { value: 'fluxograma', label: 'Fluxograma / Mapa Mental' },
  { value: 'outro', label: 'Outro' },
];

const ACCEPTED_EXTENSIONS = '.pdf,.docx,.doc,.pptx,.ppt,.xlsx,.xls,.csv,.txt';
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export default function MaterialUpload() {
  const { projectId } = useParams<{ projectId: string }>();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [projectInfo, setProjectInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  // Form state
  const [materialType, setMaterialType] = useState('');
  const [sourceType, setSourceType] = useState<'upload' | 'link'>('upload');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [linkUrl, setLinkUrl] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Materials list
  const [materials, setMaterials] = useState<ReiMaterial[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  // Load project info + existing materials
  useEffect(() => {
    if (!projectId) return;

    const loadData = async () => {
      setLoading(true);
      try {
        // Verify project exists
        const { data: project, error } = await supabase
          .from('rei_projects')
          .select('id, client_name, client_company, type')
          .eq('id', projectId)
          .single();

        if (error || !project) {
          setNotFound(true);
          return;
        }

        setProjectInfo(project);

        // Load existing materials
        const existingMaterials = await getMaterialsByProject(projectId);
        setMaterials(existingMaterials);
      } catch (e) {
        console.error('Error loading project:', e);
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [projectId]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > MAX_FILE_SIZE) {
      toast({
        title: 'Arquivo muito grande',
        description: 'O tamanho máximo permitido é 10MB.',
        variant: 'destructive',
      });
      return;
    }

    setSelectedFile(file);
  };

  const handleSubmit = async () => {
    if (!projectId || !materialType) {
      toast({
        title: 'Campos obrigatórios',
        description: 'Selecione o tipo de material.',
        variant: 'destructive',
      });
      return;
    }

    if (sourceType === 'upload' && !selectedFile) {
      toast({
        title: 'Selecione um arquivo',
        description: 'Arraste ou clique para selecionar o arquivo.',
        variant: 'destructive',
      });
      return;
    }

    if (sourceType === 'link' && !linkUrl.trim()) {
      toast({
        title: 'Informe o link',
        description: 'Cole o link do material.',
        variant: 'destructive',
      });
      return;
    }

    setSubmitting(true);
    try {
      let newMaterial: ReiMaterial | null = null;

      if (sourceType === 'upload' && selectedFile) {
        newMaterial = await uploadMaterial(projectId, selectedFile, materialType, description);
      } else if (sourceType === 'link') {
        newMaterial = await addMaterialLink(projectId, linkUrl.trim(), materialType, description);
      }

      if (newMaterial) {
        setMaterials(prev => [newMaterial!, ...prev]);
        // Reset form
        setMaterialType('');
        setSelectedFile(null);
        setLinkUrl('');
        setDescription('');
        if (fileInputRef.current) fileInputRef.current.value = '';

        toast({
          title: 'Material enviado',
          description: 'Seu material será usado para enriquecer o planejamento estratégico.',
          className: 'bg-black text-white border-zinc-800',
        });
      }
    } catch (error: any) {
      toast({
        title: 'Erro ao enviar',
        description: error.message || 'Tente novamente.',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (material: ReiMaterial) => {
    try {
      await deleteMaterial(material);
      setMaterials(prev => prev.filter(m => m.id !== material.id));
      toast({ title: 'Material removido', className: 'bg-black text-white border-zinc-800' });
    } catch (error: any) {
      toast({ title: 'Erro ao remover', description: error.message, variant: 'destructive' });
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    if (file.size > MAX_FILE_SIZE) {
      toast({
        title: 'Arquivo muito grande',
        description: 'O tamanho máximo permitido é 10MB.',
        variant: 'destructive',
      });
      return;
    }

    setSelectedFile(file);
  };

  const getMaterialTypeLabel = (value: string) => {
    return MATERIAL_TYPES.find(t => t.value === value)?.label || value;
  };

  // --- RENDER ---

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-zinc-200 border-t-zinc-900 rounded-full animate-spin" />
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-6">
        <div className="text-center max-w-sm">
          <h1 className="text-2xl font-bold text-zinc-900 mb-2">Projeto não encontrado</h1>
          <p className="text-sm text-zinc-500">
            O link de upload é inválido ou o projeto não existe.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50">
      {/* Header */}
      <div className="bg-white border-b border-zinc-200">
        <div className="max-w-2xl mx-auto px-6 py-8">
          <span className="text-[10px] uppercase tracking-[0.3em] font-bold text-zinc-400 block mb-3">
            Materiais de Referência
          </span>
          <h1 className="text-2xl md:text-3xl font-black text-zinc-900 tracking-tight mb-2">
            Envie seus materiais
          </h1>
          <p className="text-sm text-zinc-500 leading-relaxed max-w-md">
            Materiais como playbooks, frameworks e apresentações serão analisados pela IA
            para gerar um planejamento estratégico mais preciso e personalizado.
          </p>
          {projectInfo?.client_company && (
            <div className="mt-4 inline-flex items-center gap-2 px-3 py-1.5 bg-zinc-100 rounded-lg">
              <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider">
                {projectInfo.client_company}
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-6 py-8 space-y-8">
        {/* Upload Form */}
        <div className="bg-white border border-zinc-200 rounded-2xl p-6 space-y-5">
          <h2 className="text-sm font-bold text-zinc-900 uppercase tracking-wider">
            Novo Material
          </h2>

          {/* Material Type */}
          <div>
            <label className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider block mb-2">
              Tipo de Material
            </label>
            <Select value={materialType} onValueChange={setMaterialType}>
              <SelectTrigger className="w-full border-zinc-200">
                <SelectValue placeholder="Selecione o tipo" />
              </SelectTrigger>
              <SelectContent>
                {MATERIAL_TYPES.map(t => (
                  <SelectItem key={t.value} value={t.value}>
                    {t.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Source Type Toggle */}
          <div>
            <label className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider block mb-2">
              Como enviar?
            </label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setSourceType('upload')}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors border ${
                  sourceType === 'upload'
                    ? 'bg-zinc-950 text-white border-zinc-950'
                    : 'bg-white text-zinc-500 border-zinc-200 hover:border-zinc-300'
                }`}
              >
                <Upload className="w-4 h-4" />
                Upload
              </button>
              <button
                type="button"
                onClick={() => setSourceType('link')}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors border ${
                  sourceType === 'link'
                    ? 'bg-zinc-950 text-white border-zinc-950'
                    : 'bg-white text-zinc-500 border-zinc-200 hover:border-zinc-300'
                }`}
              >
                <LinkIcon className="w-4 h-4" />
                Link
              </button>
            </div>
          </div>

          {/* File Input */}
          {sourceType === 'upload' && (
            <div>
              <label className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider block mb-2">
                Arquivo
              </label>
              <div
                onClick={() => fileInputRef.current?.click()}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
                  isDragging
                    ? 'border-zinc-900 bg-zinc-100'
                    : 'border-zinc-200 hover:border-zinc-300'
                }`}
              >
                {selectedFile ? (
                  <div className="flex items-center justify-center gap-3">
                    <FileText className="w-5 h-5 text-zinc-400" />
                    <div className="text-left">
                      <p className="text-sm font-medium text-zinc-900">{selectedFile.name}</p>
                      <p className="text-[11px] text-zinc-400">
                        {(selectedFile.size / 1024 / 1024).toFixed(1)} MB
                      </p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedFile(null);
                        if (fileInputRef.current) fileInputRef.current.value = '';
                      }}
                      className="ml-auto text-zinc-400 hover:text-zinc-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <>
                    <Upload className="w-6 h-6 text-zinc-300 mx-auto mb-2" />
                    <p className="text-sm text-zinc-500 mb-1">
                      Clique para selecionar ou arraste o arquivo
                    </p>
                    <p className="text-[11px] text-zinc-400">
                      PDF, DOCX, PPTX, XLSX, TXT, CSV - até 10MB
                    </p>
                  </>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept={ACCEPTED_EXTENSIONS}
                onChange={handleFileChange}
                className="hidden"
              />
            </div>
          )}

          {/* Link Input */}
          {sourceType === 'link' && (
            <div>
              <label className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider block mb-2">
                URL do Material
              </label>
              <Input
                type="url"
                placeholder="https://miro.com/board/... ou link do Google Drive"
                value={linkUrl}
                onChange={e => setLinkUrl(e.target.value)}
                className="border-zinc-200"
              />
              <p className="text-[11px] text-zinc-400 mt-1.5">
                Google Drive, Miro, Notion, Figma ou qualquer link compartilhável.
              </p>
            </div>
          )}

          {/* Description */}
          <div>
            <label className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider block mb-2">
              Descrição <span className="text-zinc-300 normal-case">(opcional)</span>
            </label>
            <Textarea
              placeholder="Breve contexto sobre o material..."
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="border-zinc-200 resize-none h-20"
            />
          </div>

          {/* Submit */}
          <Button
            onClick={handleSubmit}
            disabled={submitting || !materialType}
            className="w-full bg-zinc-950 text-white hover:bg-zinc-800 h-11"
          >
            {submitting ? 'Enviando...' : 'Enviar Material'}
          </Button>
        </div>

        {/* Materials List */}
        {materials.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-[11px] font-bold text-zinc-400 uppercase tracking-[0.2em]">
                Materiais Enviados
              </h3>
              <span className="text-[11px] font-bold text-zinc-400">
                {materials.length} {materials.length === 1 ? 'material' : 'materiais'}
              </span>
            </div>

            <div className="space-y-2">
              {materials.map(mat => (
                <div
                  key={mat.id}
                  className="bg-white border border-zinc-200 rounded-xl px-5 py-4 flex items-center gap-4"
                >
                  <div className="w-9 h-9 bg-zinc-100 rounded-lg flex items-center justify-center shrink-0">
                    {mat.source_type === 'link' ? (
                      <ExternalLink className="w-4 h-4 text-zinc-400" />
                    ) : (
                      <FileText className="w-4 h-4 text-zinc-400" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-zinc-900 truncate">
                      {mat.original_name || 'Material'}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                        {getMaterialTypeLabel(mat.material_type)}
                      </span>
                      <span className="text-zinc-200">·</span>
                      <CheckCircle className="w-3 h-3 text-[#00CC6A]" />
                      <span className="text-[10px] text-zinc-400">Recebido</span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleDelete(mat)}
                    className="text-zinc-300 hover:text-zinc-500 transition-colors shrink-0"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer note */}
        <p className="text-[11px] text-zinc-400 text-center leading-relaxed">
          Seus materiais são privados e usados exclusivamente para melhorar
          a qualidade do seu planejamento estratégico.
        </p>
      </div>
    </div>
  );
}
