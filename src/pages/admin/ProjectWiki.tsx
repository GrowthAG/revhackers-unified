import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { FileText, Plus, Search, BookOpen, Layers, Loader2, ArrowRight, Link as LinkIcon, ExternalLink } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';

// Reusing types/logic where possible, but keeping it self-contained for speed
interface ProjectWikiProps {
    projectId: string;
    projectName: string;
}

const ProjectWiki = ({ projectId, projectName }: ProjectWikiProps) => {
    const navigate = useNavigate();
    const [wikiLibrary, setWikiLibrary] = useState<any | null>(null);
    const [docs, setDocs] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isCreating, setIsCreating] = useState(false);

    // Link Modal State
    const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
    const [linkTitle, setLinkTitle] = useState('');
    const [linkUrl, setLinkUrl] = useState('');
    const [linkCategory, setLinkCategory] = useState('playbook');
    const [linkVisibility, setLinkVisibility] = useState('shared');
    const [isSavingLink, setIsSavingLink] = useState(false);

    useEffect(() => {
        if (projectId) fetchProjectWiki();
    }, [projectId]);

    const fetchProjectWiki = async () => {
        setIsLoading(true);
        try {
            // 1. Try to find an existing library linked to this project
            const { data: lib, error } = await (supabase as any)
                .from('knowledge_libraries')
                .select('*')
                .eq('project_id', projectId)
                .single();

            if (error && error.code !== 'PGRST116') throw error; // Ignore not found error

            if (lib) {
                setWikiLibrary(lib);
                // 2. Fetch docs if library exists
                const { data: documents } = await (supabase as any)
                    .from('agent_documents')
                    .select('*')
                    .eq('library_id', lib.id)
                    .order('created_at', { ascending: false });

                setDocs(documents || []);
            } else {
                setWikiLibrary(null);
            }
        } catch (err) {
            console.error(err);
            toast.error('Erro ao carregar Wiki');
        } finally {
            setIsLoading(false);
        }
    };

    const handleInitializeWiki = async () => {
        setIsCreating(true);
        try {
            // Create a new library automatically linked to this project
            const { data, error } = await (supabase as any)
                .from('knowledge_libraries')
                .insert({
                    name: `Wiki: ${projectName}`,
                    description: `Documentação oficial do projeto ${projectName}`,
                    project_id: projectId,
                    type: 'project_wiki',
                    is_global: false
                })
                .select()
                .single();

            if (error) throw error;

            toast.success('Wiki do Projeto inicializada!');
            setWikiLibrary(data);
            // Reload to ensure state is clean
            fetchProjectWiki();

        } catch (err: any) {
            toast.error(err.message);
        } finally {
            setIsCreating(false);
        }
    };
    const handleSaveLink = async () => {
        if (!linkTitle || !linkUrl) {
            toast.error('Preencha o título e a URL do link.');
            return;
        }
        setIsSavingLink(true);
        try {
            const { error } = await (supabase as any).from('agent_documents').insert({
                library_id: wikiLibrary.id,
                filename: linkTitle,
                title: linkTitle,
                content: `URL Externa: ${linkUrl}`,
                metadata: {
                    type: 'external_link',
                    url: linkUrl,
                    category: linkCategory,
                    visibility: linkVisibility,
                }
            });

            if (error) throw error;
            
            toast.success('Link anexado com sucesso!');
            setIsLinkModalOpen(false);
            setLinkTitle('');
            setLinkUrl('');
            fetchProjectWiki();
        } catch (err: any) {
            toast.error('Falha ao salvar link: ' + err.message);
        } finally {
            setIsSavingLink(false);
        }
    };
    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-zinc-300 mb-2" />
                <p className="text-xs text-zinc-400 font-medium lowercase">carregando wiki...</p>
            </div>
        );
    }

    if (!wikiLibrary) {
        return (
            <div className="flex flex-col items-center justify-center h-[50vh] border-2 border-dashed border-zinc-200 rounded-3xl bg-zinc-50/50">
                <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-sm mb-6">
                    <BookOpen className="w-8 h-8 text-zinc-400" />
                </div>
                <h3 className="text-xl font-bold text-zinc-900 mb-2">Wiki do Projeto não iniciada</h3>
                <p className="text-sm text-zinc-500 max-w-md text-center mb-8 leading-relaxed">
                    Este projeto ainda não possui uma base de conhecimento. Inicialize a Wiki para começar a criar documentos, atas de reunião e specs técnicos.
                </p>
                <Button
                    onClick={handleInitializeWiki}
                    disabled={isCreating}
                    className="bg-black text-white hover:bg-zinc-800 rounded-xl px-8 h-12 font-bold uppercase tracking-widest text-xs shadow-sm"
                >
                    {isCreating ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
                    Inicializar Wiki
                </Button>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header / Stats */}
            <div className="flex items-center justify-between border-b border-zinc-100 pb-4">
                <div>
                    <h2 className="text-xl font-black text-black tracking-tight mb-1 uppercase">Wiki & Documentos</h2>
                    <p className="text-xs text-zinc-500 font-medium tracking-wide">
                        {docs.length} documentos • Repositório central do projeto
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Dialog open={isLinkModalOpen} onOpenChange={setIsLinkModalOpen}>
                        <DialogTrigger asChild>
                            <Button variant="outline" className="rounded-xl px-4 h-10 font-bold uppercase tracking-widest text-[10px] shadow-sm">
                                <LinkIcon className="w-3 h-3 mr-2" />
                                Anexar Link/Arquivo Externo
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-md">
                            <DialogHeader>
                                <DialogTitle className="text-xl font-bold">Anexar Arquivo ou Link</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                                <div className="space-y-2">
                                    <Label>Título (Visível no Hub)</Label>
                                    <Input placeholder="Ex: Roadmap no Notion, Dashboard BI..." value={linkTitle} onChange={e => setLinkTitle(e.target.value)} />
                                </div>
                                <div className="space-y-2">
                                    <Label>URL Específica (Link público)</Label>
                                    <Input placeholder="https://..." value={linkUrl} onChange={e => setLinkUrl(e.target.value)} />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Categoria</Label>
                                        <Select value={linkCategory} onValueChange={setLinkCategory}>
                                            <SelectTrigger><SelectValue /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="playbook">Playbook</SelectItem>
                                                <SelectItem value="strategy">Estratégia</SelectItem>
                                                <SelectItem value="dashboards">Dashboards</SelectItem>
                                                <SelectItem value="tech">Técnico</SelectItem>
                                                <SelectItem value="final">Entregável Final</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Visibilidade</Label>
                                        <Select value={linkVisibility} onValueChange={setLinkVisibility}>
                                            <SelectTrigger><SelectValue /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="shared">Compartilhado (Cliente)</SelectItem>
                                                <SelectItem value="internal">Somente Interno</SelectItem>
                                                <SelectItem value="final">Destacado (Final)</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            </div>
                            <DialogFooter>
                                <Button className="w-full bg-black font-bold uppercase tracking-widest text-xs" onClick={handleSaveLink} disabled={isSavingLink}>
                                    {isSavingLink ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Salvar Link'}
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                    
                    <Button
                        onClick={() => navigate(`/admin/knowledge/${wikiLibrary.id}/doc/new`)}
                        className="bg-black text-white hover:bg-zinc-800 rounded-xl px-4 h-10 font-bold uppercase tracking-widest text-[10px] shadow-sm"
                    >
                        <Plus className="w-3 h-3 mr-2" />
                        Criar Documento
                    </Button>
                </div>
            </div>

            {/* Grid of Docs */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {docs.length > 0 ? docs.map(doc => (
                    <div
                        key={doc.id}
                        onClick={() => {
                            if (doc.metadata?.type === 'external_link') {
                                window.open(doc.metadata.url, '_blank');
                            } else {
                                navigate(`/admin/knowledge/${wikiLibrary.id}/doc/${doc.id}`);
                            }
                        }}
                        className="group relative bg-white border border-zinc-200 rounded-2xl p-5 hover:border-zinc-300 transition-all cursor-pointer h-48 flex flex-col justify-between overflow-hidden"
                    >
                        {/* Status/Meta Badge */}
                        <div className="flex justify-between items-start z-10 relative">
                            <div className="w-10 h-10 bg-zinc-50 rounded-lg flex items-center justify-center text-zinc-400 group-hover:bg-zinc-900 group-hover:text-white transition-colors">
                                {doc.metadata?.type === 'external_link' ? <ExternalLink size={20} /> : <FileText size={20} />}
                            </div>
                            <div className="flex flex-col items-end gap-1">
                                {doc.metadata?.visibility && (
                                    <span className={cn(
                                        "px-2 py-0.5 border rounded-md text-[8px] font-black uppercase tracking-widest",
                                        doc.metadata.visibility === 'internal' ? "bg-zinc-100 text-zinc-500 border-zinc-200" :
                                        doc.metadata.visibility === 'shared' ? "bg-zinc-100 text-zinc-700 border-zinc-200" :
                                        "bg-[#00CC6A]/10 text-[#00CC6A] border-[#00CC6A]/20"
                                    )}>
                                        {doc.metadata.visibility === 'internal' ? 'Interno' : doc.metadata.visibility === 'shared' ? 'Compartilhado' : 'Oficial'}
                                    </span>
                                )}
                                {doc.metadata?.category && (
                                    <span className="px-2 py-0.5 bg-zinc-50 border border-zinc-100 rounded-md text-[8px] font-bold uppercase tracking-wider text-zinc-400">
                                        {doc.metadata.category}
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Content */}
                        <div className="z-10 relative">
                            <h3 className="font-bold text-zinc-900 mb-1 line-clamp-1 group-hover:text-zinc-600 transition-colors">
                                {doc.title || doc.filename?.replace('.html', '')}
                            </h3>
                            <p className="text-xs text-zinc-400 line-clamp-2">
                                {doc.content?.slice(0, 100).replace(/[#*`]/g, '') || "Sem preview..."}
                            </p>
                        </div>

                        {/* Background Decoration */}
                        <div className="absolute -right-4 -bottom-4 opacity-0 group-hover:opacity-5 transition-opacity pointer-events-none">
                            <FileText size={120} />
                        </div>
                    </div>
                )) : (
                    <div className="col-span-full py-12 text-center border border-dashed border-zinc-200 rounded-2xl bg-zinc-50/50">
                        <p className="text-sm font-medium text-zinc-400 mb-4">Nenhum documento criado ainda.</p>
                        <Button
                            variant="link"
                            onClick={() => navigate(`/admin/knowledge/${wikiLibrary.id}/doc/new`)}
                            className="text-black font-bold uppercase tracking-widest text-xs"
                        >
                            Criar o primeiro
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProjectWiki;
