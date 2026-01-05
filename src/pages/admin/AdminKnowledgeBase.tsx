import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Plus, Search, Database, FileText, Trash2,
    MoreVertical, ArrowRight, BookOpen, Layers,
    Loader2, Upload, Globe, Lock, Brain
} from 'lucide-react';
import AdminLayout from '@/components/layout/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';

interface Library {
    id: string;
    name: string;
    description: string;
    is_global: boolean;
    created_at: string;
    document_count?: number;
}

const AdminKnowledgeBase = () => {
    const navigate = useNavigate();
    const [libraries, setLibraries] = useState<Library[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    // New Library Form
    const [newLibName, setNewLibName] = useState('');
    const [newLibDesc, setNewLibDesc] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Library Detail state
    const [selectedLibrary, setSelectedLibrary] = useState<Library | null>(null);
    const [libDocs, setLibDocs] = useState<any[]>([]);
    const [isUploading, setIsUploading] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            // Fetch libraries
            const { data, error } = await supabase
                .from('knowledge_libraries')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;

            // Fetch document counts for each library
            const librariesWithCounts = await Promise.all((data || []).map(async (lib) => {
                const { count } = await supabase
                    .from('agent_documents')
                    .select('*', { count: 'exact', head: true })
                    .eq('library_id', lib.id);

                return { ...lib, document_count: count || 0 };
            }));

            setLibraries(librariesWithCounts);
        } catch (err: any) {
            console.error('Error fetching libraries:', err);
            toast.error('Erro ao carregar bibliotecas');
        } finally {
            setIsLoading(false);
        }
    };

    const fetchLibraryDocs = async (libId: string) => {
        try {
            const { data, error } = await supabase
                .from('agent_documents')
                .select('id, filename, content, metadata')
                .eq('library_id', libId)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setLibDocs(data || []);
        } catch (err) {
            console.error('Error fetching lib docs:', err);
        }
    };

    const handleSelectLibrary = (lib: Library) => {
        setSelectedLibrary(lib);
        fetchLibraryDocs(lib.id);
    };

    const handleUploadToLibrary = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0 || !selectedLibrary) return;

        setIsUploading(true);
        const toastId = toast.loading(`Processando ${files.length} arquivo(s)...`);

        try {
            const allChunks: { filename: string, content: string, metadata: any }[] = [];

            for (const file of Array.from(files)) {
                toast.loading(`Lendo: ${file.name}...`, { id: toastId });
                const text = await extractTextFromFile(file);
                const chunks = chunkText(text);

                chunks.forEach((c, i) => {
                    allChunks.push({
                        filename: file.name,
                        content: c,
                        metadata: { chunk_index: i, total_chunks: chunks.length, source_type: 'file' }
                    });
                });
            }

            if (allChunks.length > 0) {
                const SEGMENT_SIZE = 10;
                for (let i = 0; i < allChunks.length; i += SEGMENT_SIZE) {
                    const segment = allChunks.slice(i, i + SEGMENT_SIZE);
                    const progress = Math.round(((i + segment.length) / allChunks.length) * 100);

                    toast.loading(`Treinando Biblioteca: ${progress}%...`, { id: toastId });

                    const { data, error } = await supabase.functions.invoke('agent-documents', {
                        body: {
                            action: 'upload_chunks',
                            libraryId: selectedLibrary.id,
                            documents: segment
                        }
                    });

                    if (error || !data?.success) throw error || new Error(data?.error);
                }
                toast.success('Documentos adicionados com sucesso!', { id: toastId });
                fetchLibraryDocs(selectedLibrary.id);
                fetchData();
            }
        } catch (err: any) {
            console.error('Upload error:', err);
            toast.error(`Erro no upload: ${err.message}`, { id: toastId });
        } finally {
            setIsUploading(false);
        }
    };

    const extractTextFromFile = async (file: File): Promise<string> => {
        const fileType = file.type;
        const fileName = file.name.toLowerCase();

        if (fileType === 'application/pdf' || fileName.endsWith('.pdf')) {
            try {
                if (!(window as any).pdfjsLib) {
                    await new Promise((resolve, reject) => {
                        const script = document.createElement('script');
                        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
                        script.onload = resolve;
                        script.onerror = reject;
                        document.head.appendChild(script);
                    });
                }
                const pdfjsLib = (window as any).pdfjsLib;
                pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

                const arrayBuffer = await file.arrayBuffer();
                const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
                let fullText = '';
                for (let i = 1; i <= pdf.numPages; i++) {
                    const page = await pdf.getPage(i);
                    const content = await page.getTextContent();
                    const strings = content.items.map((item: any) => item.str);
                    fullText += strings.join(' ') + '\n';
                }
                return fullText;
            } catch (err) {
                console.error('PDF processing error:', err);
            }
        }

        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target?.result as string);
            reader.onerror = (e) => reject(new Error('Falha ao ler arquivo de texto'));
            reader.readAsText(file);
        });
    };

    const chunkText = (text: string, chunkSize = 1500, overlap = 200) => {
        const chunks: string[] = [];
        let start = 0;
        while (start < text.length) {
            const end = Math.min(start + chunkSize, text.length);
            chunks.push(text.slice(start, end));
            start += chunkSize - overlap;
        }
        return chunks;
    };

    const handleCreateLibrary = async () => {
        if (!newLibName.trim()) {
            toast.error('Nome da biblioteca é obrigatório');
            return;
        }

        setIsSubmitting(true);
        try {
            const { data, error } = await supabase
                .from('knowledge_libraries')
                .insert({
                    name: newLibName.trim(),
                    description: newLibDesc.trim(),
                    is_global: true // Default to global for now
                })
                .select()
                .single();

            if (error) throw error;

            toast.success('Biblioteca criada!');
            setIsCreateModalOpen(false);
            setNewLibName('');
            setNewLibDesc('');
            fetchData();
        } catch (err: any) {
            console.error('Error creating library:', err);
            toast.error(err.message || 'Erro ao criar biblioteca');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteLibrary = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (!confirm('Excluir biblioteca?')) return;

        try {
            const { error } = await supabase
                .from('knowledge_libraries')
                .delete()
                .eq('id', id);

            if (error) throw error;

            toast.success('Biblioteca removida');
            if (selectedLibrary?.id === id) setSelectedLibrary(null);
            fetchData();
        } catch (err: any) {
            console.error('Error deleting library:', err);
            toast.error('Erro ao excluir');
        }
    };

    const handleRemoveDoc = async (docId: string) => {
        if (!confirm('Deseja remover este documento da biblioteca?')) return;
        try {
            const { error } = await supabase.from('agent_documents').delete().eq('id', docId);
            if (error) throw error;
            toast.success('Documento removido');
            if (selectedLibrary) fetchLibraryDocs(selectedLibrary.id);
            fetchData();
        } catch (err) {
            toast.error('Erro ao remover documento');
        }
    };

    const filteredLibraries = libraries.filter(lib =>
        lib.name.toLowerCase().includes(search.toLowerCase()) ||
        (lib.description || '').toLowerCase().includes(search.toLowerCase())
    );

    return (
        <AdminLayout>
            <div className="min-h-screen bg-white font-sans selection:bg-black selection:text-white pb-20">
                <div className="max-w-6xl mx-auto px-6 pt-12 pb-8">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-16">
                        <div className="flex items-center gap-4">
                            {selectedLibrary && (
                                <Button
                                    variant="ghost"
                                    onClick={() => setSelectedLibrary(null)}
                                    className="w-10 h-10 rounded-full p-0 flex items-center justify-center hover:bg-zinc-100"
                                >
                                    <ArrowRight className="w-5 h-5 rotate-180" />
                                </Button>
                            )}
                            <div>
                                <div className="flex items-center gap-2 mb-2">
                                    <div className="w-8 h-8 bg-zinc-950 rounded-lg flex items-center justify-center text-white">
                                        <Brain size={18} />
                                    </div>
                                    <h1 className="text-3xl font-bold tracking-tight text-black">
                                        {selectedLibrary ? selectedLibrary.name : 'Knowledge Hub'}
                                    </h1>
                                </div>
                                <p className="text-zinc-400 text-sm font-medium">
                                    {selectedLibrary
                                        ? selectedLibrary.description || 'Gerencie os documentos desta biblioteca.'
                                        : 'Centralize e gerencie bibliotecas de treinamento para seus agentes.'}
                                </p>
                            </div>
                        </div>
                        {!selectedLibrary ? (
                            <Button
                                onClick={() => setIsCreateModalOpen(true)}
                                className="bg-black text-white rounded-full px-6 h-10 text-xs font-bold uppercase tracking-widest hover:bg-zinc-800 transition-all shadow-sm"
                            >
                                <Plus className="w-4 h-4 mr-2" />
                                Nova Biblioteca
                            </Button>
                        ) : (
                            <div className="flex items-center gap-3">
                                <label className="cursor-pointer">
                                    <input type="file" multiple className="hidden" onChange={handleUploadToLibrary} disabled={isUploading} />
                                    <Button disabled={isUploading} asChild className="bg-black text-white rounded-full px-6 h-10 text-xs font-bold uppercase tracking-widest hover:bg-zinc-800 transition-all shadow-sm">
                                        <span>
                                            <Upload className="w-4 h-4 mr-2" />
                                            Adicionar Documentos
                                        </span>
                                    </Button>
                                </label>
                            </div>
                        )}
                    </div>

                    {!selectedLibrary ? (
                        <>
                            {/* Stats */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                                <div className="p-6 bg-zinc-50 border border-zinc-100 rounded-3xl">
                                    <Layers className="text-zinc-400 mb-4" size={24} />
                                    <h3 className="text-2xl font-bold text-black">{libraries.length}</h3>
                                    <p className="text-zinc-400 text-xs font-semibold uppercase tracking-wider">Bibliotecas Ativas</p>
                                </div>
                                <div className="p-6 bg-zinc-50 border border-zinc-100 rounded-3xl">
                                    <FileText className="text-zinc-400 mb-4" size={24} />
                                    <h3 className="text-2xl font-bold text-black">
                                        {libraries.reduce((acc, lib) => acc + (lib.document_count || 0), 0)}
                                    </h3>
                                    <p className="text-zinc-400 text-xs font-semibold uppercase tracking-wider">Documentos Totais</p>
                                </div>
                                <div className="p-6 bg-zinc-50 border border-zinc-100 rounded-3xl">
                                    <Globe className="text-zinc-400 mb-4" size={24} />
                                    <h3 className="text-lg font-bold text-black">Global Access</h3>
                                    <p className="text-zinc-400 text-xs font-semibold uppercase tracking-wider">Sincronização Ativa</p>
                                </div>
                            </div>

                            {/* List Controls */}
                            <div className="flex items-center justify-between mb-8 pb-4 border-b border-zinc-50">
                                <div className="flex items-center gap-2">
                                    <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400">Bibliotecas de Treinamento</span>
                                </div>
                                <div className="relative group w-64">
                                    <Search className="absolute left-0 top-1/2 -translate-y-1/2 text-zinc-300 w-3.5 h-3.5 transition-colors group-focus-within:text-black" />
                                    <input
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        placeholder="Filtrar..."
                                        className="w-full bg-transparent border-none py-2 pl-6 pr-0 text-sm font-medium text-black outline-none placeholder:text-zinc-300 text-right"
                                    />
                                </div>
                            </div>

                            {/* Grid */}
                            {isLoading ? (
                                <div className="flex flex-col items-center justify-center py-20 grayscale opacity-50">
                                    <Loader2 className="w-8 h-8 animate-spin mb-4" />
                                    <p className="text-xs font-bold uppercase tracking-widest">Carregando Cérebro...</p>
                                </div>
                            ) : filteredLibraries.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {filteredLibraries.map(lib => (
                                        <div
                                            key={lib.id}
                                            onClick={() => handleSelectLibrary(lib)}
                                            className="group relative bg-white border border-zinc-100 rounded-[28px] p-6 hover:border-zinc-300 hover:shadow-2xl hover:shadow-zinc-200/50 transition-all duration-500 cursor-pointer flex flex-col h-[280px]"
                                        >
                                            <div className="flex items-start justify-between mb-6">
                                                <div className="w-12 h-12 bg-zinc-50 rounded-2xl flex items-center justify-center text-black group-hover:scale-110 transition-transform duration-500 border border-zinc-100/50">
                                                    <BookOpen size={20} className="text-zinc-700" />
                                                </div>
                                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all duration-300">
                                                    <button
                                                        onClick={(e) => handleDeleteLibrary(lib.id, e)}
                                                        className="w-8 h-8 bg-zinc-50 hover:bg-red-500 hover:text-white flex items-center justify-center text-zinc-400 rounded-full transition-all"
                                                    >
                                                        <Trash2 size={12} />
                                                    </button>
                                                </div>
                                            </div>

                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-2">
                                                    {lib.is_global ? (
                                                        <span className="text-[8px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-500 border border-zinc-200">Global</span>
                                                    ) : (
                                                        <span className="text-[8px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-50 text-blue-500 border border-blue-100">Privada</span>
                                                    )}
                                                </div>
                                                <h3 className="text-lg font-bold text-black tracking-tight mb-2">{lib.name}</h3>
                                                <p className="text-zinc-400 text-xs font-medium leading-relaxed line-clamp-3">
                                                    {lib.description || "Sem descrição disponível para esta biblioteca de treinamento."}
                                                </p>
                                            </div>

                                            <div className="mt-auto pt-4 border-t border-zinc-50 flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <FileText size={12} className="text-zinc-300" />
                                                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">{lib.document_count} Documentos</span>
                                                </div>
                                                <div className="w-8 h-8 rounded-full bg-black flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0 text-white">
                                                    <ArrowRight size={14} />
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="py-20 text-center border-2 border-dashed border-zinc-100 rounded-[40px]">
                                    <Database className="w-12 h-12 text-zinc-100 mx-auto mb-4" />
                                    <p className="text-zinc-400 text-sm font-medium">Nenhuma biblioteca encontrada.</p>
                                    <Button variant="link" onClick={() => setIsCreateModalOpen(true)} className="text-black font-bold h-auto p-0 mt-2">Criar a primeira agora</Button>
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                            <div className="grid grid-cols-1 gap-4">
                                {libDocs.length > 0 ? libDocs.map(doc => (
                                    <div key={doc.id} className="flex items-center justify-between p-5 bg-white border border-zinc-100 rounded-3xl hover:border-zinc-200 transition-all group">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 bg-zinc-50 rounded-xl flex items-center justify-center text-zinc-400">
                                                <FileText size={20} />
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-black">{doc.filename}</p>
                                                <p className="text-[10px] text-zinc-400 font-medium uppercase tracking-widest">
                                                    {Math.round(doc.content?.length / 1024)} KB • {doc.metadata?.total_chunks || 1} Chunks
                                                </p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => handleRemoveDoc(doc.id)}
                                            className="w-10 h-10 flex items-center justify-center text-zinc-300 hover:text-red-500 hover:bg-red-50 rounded-full transition-all opacity-0 group-hover:opacity-100"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                )) : (
                                    <div className="py-20 text-center border-2 border-dashed border-zinc-100 rounded-[40px] grayscale opacity-40">
                                        <FileText className="w-12 h-12 mx-auto mb-4 text-zinc-200" />
                                        <p className="text-sm font-medium text-zinc-400">Esta biblioteca está vazia.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Create Modal Implementation (Internal Component for simplicity here) */}
                {isCreateModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 sm:p-0">
                        <div className="absolute inset-0 bg-white/80 backdrop-blur-xl" onClick={() => setIsCreateModalOpen(false)} />
                        <div className="relative bg-white border border-zinc-200 w-full max-w-lg rounded-[32px] shadow-2xl overflow-hidden p-8 animate-in fade-in zoom-in duration-300">
                            <div className="mb-8 text-center">
                                <div className="w-12 h-12 bg-zinc-950 rounded-2xl flex items-center justify-center text-white mx-auto mb-4">
                                    <Plus size={24} />
                                </div>
                                <h2 className="text-2xl font-bold text-black tracking-tight">Nova Biblioteca</h2>
                                <p className="text-zinc-400 text-sm font-medium">Defina a identidade da sua nova base de treinamento.</p>
                            </div>

                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 ml-1">Nome da Biblioteca</label>
                                    <Input
                                        value={newLibName}
                                        onChange={(e) => setNewLibName(e.target.value)}
                                        placeholder="Ex: Guia de Copywriting PRO"
                                        className="h-12 bg-zinc-50 border-zinc-100 rounded-2xl focus:ring-black focus:border-black transition-all"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 ml-1">Descrição (Contexto)</label>
                                    <textarea
                                        value={newLibDesc}
                                        onChange={(e) => setNewLibDesc(e.target.value)}
                                        placeholder="Para que serve este conhecimento?"
                                        className="w-full min-h-[120px] bg-zinc-50 border border-zinc-100 rounded-2xl p-4 text-sm focus:outline-none focus:ring-1 focus:ring-black transition-all resize-none"
                                    />
                                </div>

                                <div className="flex items-center gap-3 pt-4">
                                    <Button
                                        variant="outline"
                                        onClick={() => setIsCreateModalOpen(false)}
                                        className="flex-1 rounded-full h-12 border-zinc-200 font-bold text-zinc-500 hover:bg-zinc-50"
                                    >
                                        Cancelar
                                    </Button>
                                    <Button
                                        disabled={isSubmitting}
                                        onClick={handleCreateLibrary}
                                        className="flex-[2] rounded-full h-12 bg-black text-white font-bold hover:bg-zinc-800 transition-all shadow-lg shadow-zinc-200"
                                    >
                                        {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Criar Biblioteca'}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
};

export default AdminKnowledgeBase;
