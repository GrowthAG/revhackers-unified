import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Save, ChevronLeft, Loader2, Sparkles, Hash, User, FileText, CheckSquare, Image as ImageIcon } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import AdminLayout from '@/components/layout/AdminLayout';
import { cn } from '@/lib/utils';

// --- Command/Mention Types ---
type CommandType = 'slash' | 'mention' | 'task' | null;

interface CommandItem {
    id: string;
    label: string;
    icon: React.ElementType;
    action: () => void;
}

// --- Imports ---
// Tasks are managed in Notion - stub for legacy command menu
const getAllActiveTasks = async () => [] as any[];
import { uploadImageToSupabase } from '@/utils/uploadImageToSupabase';
import { Database } from 'lucide-react';

const KnowledgeDocumentEditor = () => {
    const { libId, docId } = useParams();
    const navigate = useNavigate();
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isThinking, setIsThinking] = useState(false);
    const [coverImage, setCoverImage] = useState<string | null>(null);
    const [isUploadingCover, setIsUploadingCover] = useState(false);
    
    // Handover Metadata
    const [visibility, setVisibility] = useState('internal');
    const [category, setCategory] = useState('geral');

    // Command/Mention State
    const [commandType, setCommandType] = useState<CommandType>(null);
    const [commandQuery, setCommandQuery] = useState('');
    const [tasks, setTasks] = useState<any[]>([]);
    const [filteredTasks, setFilteredTasks] = useState<any[]>([]);

    const [viewMode, setViewMode] = useState<'edit' | 'split' | 'preview'>('split'); // Default to Split for "Active" feel

    const [isUploadingImage, setIsUploadingImage] = useState(false);

    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const titleRef = useRef<HTMLTextAreaElement>(null);
    const coverInputRef = useRef<HTMLInputElement>(null);
    const contentImageInputRef = useRef<HTMLInputElement>(null);

    // Mock Data for Mentions (Replace with real users query later)
    const users = [
        { id: '1', name: 'Giulliano' },
        { id: '2', name: 'Luna' },
        { id: '3', name: 'Danilo' },
        { id: '4', name: 'Support Agent' },
    ];

    useEffect(() => {
        if (titleRef.current) {
            titleRef.current.style.height = 'auto';
            titleRef.current.style.height = titleRef.current.scrollHeight + 'px';
        }
    }, [title]);

    useEffect(() => {
        if (docId && docId !== 'new') {
            loadDocument();
        } else {
            setIsLoading(false);
        }
    }, [docId]);

    const loadDocument = async () => {
        try {
            const { data, error } = await supabase
                .from('agent_documents')
                .select('*')
                .eq('id', docId)
                .single();

            if (data) {
                setTitle((data as any).title || data.filename?.replace('.html', '') || 'Sem Título');
                setContent(data.content || '');
                setCoverImage((data.metadata as any)?.cover_image || null);
                setVisibility((data.metadata as any)?.visibility || 'internal');
                setCategory((data.metadata as any)?.category || 'geral');
            }
        } catch (err) {
            console.error('Error loading:', err);
        } finally {
            setIsLoading(false);
        }
    };

    // --- Data Fetching for Commands ---
    useEffect(() => {
        const fetchTasks = async () => {
            const t = await getAllActiveTasks();
            setTasks(t);
        };
        fetchTasks();
    }, []);

    useEffect(() => {
        if (commandType === 'task') {
            const q = commandQuery.toLowerCase();
            setFilteredTasks(tasks.filter(t => t.title.toLowerCase().includes(q) || t.project_name?.toLowerCase().includes(q)));
        }
    }, [commandQuery, tasks, commandType]);


    // --- File Handlers ---
    const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploadingCover(true);
        try {
            const url = await uploadImageToSupabase(file, 'blog-covers'); // Reuse existing accessible bucket
            if (url) {
                setCoverImage(url);
                // Auto-save metadata update? Or wait for manual save.
                // Better to wait for manual save to keep state sync simple, but UI shows preview.
            }
        } catch (err) {
            toast.error('Erro ao enviar imagem de capa');
        } finally {
            setIsUploadingCover(false);
        }
    };

    const handleContentImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploadingImage(true);
        const toastId = toast.loading('Enviando imagem...');

        try {
            // Reverting to 'blog-covers' to fix "Erro no upload". 
            // The previous bucket 'knowledge-assets' likely does not exist in Supabase storage.
            const url = await uploadImageToSupabase(file, 'blog-covers');
            if (url) {
                insertText(`\n![Imagem](${url})\n`);
                toast.success('Imagem inserida!');
            }
        } catch (err) {
            toast.error('Erro no upload', { id: toastId });
        } finally {
            setIsUploadingImage(false);
            // Reset input value to allow uploading same file again
            if (contentImageInputRef.current) contentImageInputRef.current.value = '';
        }
    };

    // --- Command Logic ---
    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (commandType) {
            if (e.key === 'Escape') {
                closeCommandMenu();
                return;
            }
            // Let the user type to filter (handled in onChange)
        }
    };

    const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const val = e.target.value;
        const newPos = e.target.selectionStart;
        setContent(val);

        // Detect Trigger Characters directly before cursor
        const charBefore = val.slice(newPos - 1, newPos);

        if (charBefore === '/') {
            openCommandMenu('slash', newPos);
            return;
        } else if (charBefore === '@') {
            openCommandMenu('mention', newPos);
            return;
        }

        if (commandType) {
            const textToCursor = val.slice(0, newPos);
            const triggerChar = commandType === 'slash' ? '/' : '@';
            const lastTriggerIdx = textToCursor.lastIndexOf(triggerChar);

            // If trigger key is missing (deleted) or too far back (newline/space handling)
            // For slash commands, usually no spaces allowed in command name.
            if (lastTriggerIdx === -1) {
                closeCommandMenu();
                return;
            }

            const queryText = textToCursor.slice(lastTriggerIdx + 1);

            // Validation: If there's a newline between trigger and cursor, it's not a command
            if (queryText.includes('\n')) {
                closeCommandMenu();
                return;
            }

            // For slash commands, usually we want to close if there is a space (e.g. "/ start sentence")
            // But for mentions "@User Name" spaces are valid.
            if (commandType === 'slash' && queryText.includes(' ')) {
                closeCommandMenu();
                return;
            }

            // If we are good, update query
            setCommandQuery(queryText);
        }
    };

    const openCommandMenu = (type: CommandType, index: number) => {
        setCommandType(type);
        // Calculate position (approximation)
        // In a real production editor, we'd use getBoundingClientRect of a dummy element
        // For now, centering or using fixed position relative to cursor is tricky in standard textarea
        // Using a fixed decent position for MVP or centered modal-like

        // Better hack: use caret-coordinates library or similar in full implementation
        // For MVP: Show floating near the top of editor or fixed bottom-left
    };

    const closeCommandMenu = () => {
        setCommandType(null);
        setCommandQuery('');
    };

    const insertText = (text: string) => {
        if (!textareaRef.current) return;
        const start = textareaRef.current.selectionStart;
        const end = textareaRef.current.selectionEnd;

        // Remove the trigger char if needed (simplified)
        const textBefore = content.substring(0, start - 1); // remove @ or /
        const textAfter = content.substring(end);

        const newContent = textBefore + text + " " + textAfter;
        setContent(newContent);
        closeCommandMenu();
        // Focus back?
    };

    const slashCommands: CommandItem[] = [
        { id: 'h1', label: 'Cabeçalho 1', icon: Hash, action: () => insertText('# ') },
        { id: 'h2', label: 'Cabeçalho 2', icon: Hash, action: () => insertText('## ') },
        { id: 'checklist', label: 'Checklist', icon: CheckSquare, action: () => insertText('- [ ] ') },
        { id: 'banner', label: 'Banner / Callout', icon: FileText, action: () => insertText('> [!NOTE]\n> ') },
        { id: 'table', label: 'Tabela', icon: Database, action: () => insertText('| Coluna 1 | Coluna 2 |\n|---|---|\n| Dado | Dado |') },
        { id: 'task', label: 'Vincular Tarefa', icon: CheckSquare, action: () => setCommandType('task') },
        { id: 'image', label: 'Imagem / Anexo', icon: ImageIcon, action: () => contentImageInputRef.current?.click() },
        { id: 'ai', label: 'AI Writer', icon: Sparkles, action: () => handleAIExpand() },
    ];

    // Filter Logic
    const filteredCommands = slashCommands.filter(cmd =>
        cmd.label.toLowerCase().includes(commandQuery.toLowerCase())
    );

    const filteredUsers = users.filter(user =>
        user.name.toLowerCase().includes(commandQuery.toLowerCase())
    );

    // Auto-close if no matches
    useEffect(() => {
        if (commandType === 'slash' && filteredCommands.length === 0 && commandQuery.length > 0) {
            // Optional: Close immediately, or keep open if they are just typing mismatch?
            // User requirement: "se apart a frase ou a plavrar o card somee" -> likely means if mismatch
            // Actually usually Notion closes if you type gibberish that matches nothing
            // OR if you press space. Space is handled. 
            // Lets Keep it open for strict mismatches might be annoying if they just typed a slash in text.
            // Requirement "card some" -> lets close if no match.
            // closeCommandMenu(); 
            // Better UX: Don't render. 
        }
    }, [filteredCommands, commandType, commandQuery]);

    const handleSave = async () => {
        if (!title.trim()) return toast.error('O documento precisa de um título');
        setIsSaving(true);
        try {
            const docData = {
                filename: `${title.trim()}.html`,
                title: title.trim(),
                content: content,
                library_id: libId,
                source_type: 'native',
                metadata: {
                    type: 'native_document',
                    last_edited: new Date().toISOString(),
                    cover_image: coverImage,
                    visibility: visibility,
                    category: category
                }
            };

            if (docId === 'new') {
                const { data } = await supabase.from('agent_documents').insert({ ...docData, agent_id: '00000000-0000-0000-0000-000000000000' }).select().single();
                if (data) navigate(`/admin/knowledge/${libId}/doc/${data.id}`, { replace: true });
                toast.success('Criado com sucesso!');
            } else {
                await supabase.from('agent_documents').update(docData).eq('id', docId);
                toast.success('Salvo!');
            }
        } catch (err: any) {
            toast.error(err.message);
        } finally {
            setIsSaving(false);
        }
    };

    const handleAIExpand = async () => {
        setIsThinking(true);
        try {
            const { data } = await supabase.functions.invoke('agent-chat', {
                body: { messages: [{ role: 'user', content: `Complete/Expand this text: ${content}` }], model: 'gpt-4o' }
            });
            if (data?.response) setContent(prev => prev + '\n' + data.response);
        } catch { toast.error('Erro na IA'); }
        finally { setIsThinking(false); }
    };

    return (
        <AdminLayout>
            <div className="min-h-screen bg-white font-sans text-zinc-900 pb-20 relative">
                {/* Navbar */}
                <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-zinc-100 px-6 h-14 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="sm" onClick={() => navigate('/admin/knowledge')} className="text-zinc-500 hover:text-black -ml-2">
                            <ChevronLeft className="w-4 h-4 mr-1" /> Voltar
                        </Button>
                        <span className="text-zinc-200">|</span>
                        <div className="flex items-center gap-2 text-xs text-zinc-400">
                            <span>{docId === 'new' ? 'Nova Página' : 'Editando'}</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="flex items-center gap-2">
                            <div className="flex items-center gap-1 bg-zinc-100 p-0.5 rounded-lg mr-4">
                                <button onClick={() => setViewMode('edit')} className={cn("px-3 py-1 text-xs font-bold rounded-md transition-all", viewMode === 'edit' ? "bg-white text-black shadow-sm" : "text-zinc-400 hover:text-zinc-600")}>Editor</button>
                                <button onClick={() => setViewMode('split')} className={cn("px-3 py-1 text-xs font-bold rounded-md transition-all", viewMode === 'split' ? "bg-white text-black shadow-sm" : "text-zinc-400 hover:text-zinc-600")}>Dividido</button>
                                <button onClick={() => setViewMode('preview')} className={cn("px-3 py-1 text-xs font-bold rounded-md transition-all", viewMode === 'preview' ? "bg-white text-black shadow-sm" : "text-zinc-400 hover:text-zinc-600")}>Leitor</button>
                            </div>
                            <div className="text-xs text-zinc-400 mr-4 font-mono">{isSaving ? 'Salvando...' : 'Salvo'}</div>
                            <Button onClick={handleSave} disabled={isSaving} className="bg-black hover:bg-zinc-800 text-white rounded-md px-4 h-8 text-xs font-bold uppercase tracking-widest transition-all">
                                {isSaving && <Loader2 className="w-3 h-3 animate-spin mr-2" />} Salvar
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Editor */}
                <div className="max-w-4xl mx-auto px-6 pt-12 relative">
                    <input
                        type="file"
                        ref={contentImageInputRef}
                        className="hidden"
                        onChange={handleContentImageUpload}
                        accept="image/*"
                    />

                    {/* Cover Image Area */}
                    <div className="group relative mb-8 rounded-xl overflow-hidden bg-zinc-50 border-zinc-100 min-h-[60px] hover:bg-zinc-100 transition-all flex flex-col justify-end">
                        <input
                            type="file"
                            ref={coverInputRef}
                            className="hidden"
                            onChange={handleCoverUpload}
                            accept="image/*"
                        />
                        {coverImage ? (
                            <div className="w-full h-48 md:h-64 relative">
                                <img src={coverImage} alt="Cover" className="w-full h-full object-cover" />
                                <button
                                    onClick={() => coverInputRef.current?.click()}
                                    className="absolute bottom-4 right-4 bg-white/10 backdrop-blur-md text-white text-xs font-bold px-3 py-1.5 rounded-full hover:bg-white/20 transition-all opacity-0 group-hover:opacity-100 border border-white/20"
                                >
                                    Alterar Capa
                                </button>
                            </div>
                        ) : (
                            <button
                                onClick={() => coverInputRef.current?.click()}
                                className="w-full h-full py-4 flex items-center justify-center gap-2 text-zinc-300 hover:text-zinc-500 transition-colors opacity-0 group-hover:opacity-100"
                            >
                                <ImageIcon size={16} />
                                <span className="text-xs font-bold uppercase tracking-widest">Adicionar Capa</span>
                            </button>
                        )}
                        {isUploadingCover && (
                            <div className="absolute inset-0 bg-white/50 backdrop-blur-sm flex items-center justify-center">
                                <Loader2 className="w-6 h-6 animate-spin text-zinc-400" />
                            </div>
                        )}
                    </div>

                    <Textarea
                        ref={titleRef}
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Sem Título"
                        className="w-full text-5xl font-bold bg-transparent border-none focus:ring-0 p-0 resize-none overflow-hidden placeholder:text-zinc-200 mb-6 leading-tight"
                        rows={1} spellCheck={false}
                    />

                    {/* Handover Metadata Controls */}
                    <div className="flex flex-wrap items-center gap-4 mb-8">
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] items-center gap-1 font-bold uppercase tracking-widest text-zinc-400">Visibilidade</span>
                            <select 
                                value={visibility} 
                                onChange={e => setVisibility(e.target.value)}
                                className="text-xs bg-zinc-50 border border-zinc-200 text-zinc-700 rounded-md px-3 py-1.5 focus:ring-black focus:border-black outline-none font-medium"
                            >
                                <option value="internal">Interno (Somente Admin)</option>
                                <option value="shared">Compartilhável (Visível no Hub)</option>
                                <option value="final">Oficial Entregue (Destaque no Hub)</option>
                            </select>
                        </div>

                        <div className="flex items-center gap-2">
                            <span className="text-[10px] items-center gap-1 font-bold uppercase tracking-widest text-zinc-400">Categoria</span>
                            <select 
                                value={category} 
                                onChange={e => setCategory(e.target.value)}
                                className="text-xs bg-zinc-50 border border-zinc-200 text-zinc-700 rounded-md px-3 py-1.5 focus:ring-black focus:border-black outline-none font-medium"
                            >
                                <option value="geral">Geral</option>
                                <option value="kickoff">Kickoff & Alinhamento</option>
                                <option value="transcr">Transcrições e Reuniões</option>
                                <option value="strategy">Planejamento e Estratégia</option>
                                <option value="tech">Documentação Técnica</option>
                                <option value="playbook">Playbooks e SOPs</option>
                                <option value="final">Entregáveis Finais</option>
                                <option value="acessos">Acessos e Referências</option>
                            </select>
                        </div>
                    </div>

                    {/* Visual Toolbar (Subtle) */}
                    <div className="flex items-center gap-1 mb-6 text-zinc-400 border-b border-zinc-50 pb-2">
                        <span className="text-[10px] uppercase tracking-wider font-medium mr-2">Comandos Rápidos:</span>
                        <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-[10px] font-mono text-zinc-500 border border-zinc-200">/</code>
                        <span className="text-[10px] text-zinc-300 mr-2">para menu</span>
                        <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-[10px] font-mono text-zinc-500 border border-zinc-200">@</code>
                        <span className="text-[10px] text-zinc-300">para mencionar</span>
                    </div>

                    <div className="min-h-[500px] relative">
                        <div className="min-h-[500px] relative">
                            <div className={cn("grid h-[calc(100vh-250px)]", viewMode === 'split' ? "grid-cols-2 gap-6" : "grid-cols-1")}>
                                {/* Editor Pane */}
                                {(viewMode === 'edit' || viewMode === 'split') && (
                                    <Textarea
                                        ref={textareaRef}
                                        value={content}
                                        onChange={handleContentChange}
                                        onKeyDown={handleKeyDown}
                                        placeholder="Digite '/' para comandos..."
                                        className="w-full h-full bg-transparent border-none focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0 p-0 resize-none text-lg leading-relaxed font-serif text-zinc-700 placeholder:text-zinc-200 selection:bg-zinc-100 selection:text-black shadow-none ring-0 outline-none overflow-y-auto"
                                        spellCheck={false}
                                    />
                                )}

                                {/* Preview Pane */}
                                {(viewMode === 'split' || viewMode === 'preview') && (
                                    <div className={cn("w-full h-full prose prose-zinc max-w-none text-lg leading-relaxed font-serif text-zinc-700 pb-20 overflow-y-auto", viewMode === 'split' ? "border-l border-zinc-100 pl-6" : "")}>
                                        {/* Simple Markdown Line Parser */}
                                        {(() => {
                                            // Block Parser Logic
                                            const lines = content.split('\n');
                                            const elements = [];
                                            let i = 0;

                                            while (i < lines.length) {
                                                const line = lines[i];

                                                // 1. Tables (StartsWith |)
                                                if (line.trim().startsWith('|')) {
                                                    const tableLines = [];
                                                    while (i < lines.length && lines[i].trim().startsWith('|')) {
                                                        tableLines.push(lines[i]);
                                                        i++;
                                                    }
                                                    // Render Table
                                                    elements.push(
                                                        <div key={`table-${i}`} className="my-6 overflow-x-auto rounded-lg border border-zinc-200 shadow-sm">
                                                            <table className="w-full text-sm text-left">
                                                                <thead>
                                                                    <tr className="bg-zinc-50 border-b border-zinc-200">
                                                                        {tableLines[0].split('|').filter(c => c.trim()).map((h, k) => (
                                                                            <th key={k} className="px-4 py-3 font-semibold text-zinc-700">{h.trim()}</th>
                                                                        ))}
                                                                    </tr>
                                                                </thead>
                                                                <tbody>
                                                                    {tableLines.slice(2).map((row, k) => ( // Skip header and separator
                                                                        <tr key={k} className="border-b border-zinc-100 last:border-0 hover:bg-zinc-50/50 transition-colors">
                                                                            {row.split('|').filter(c => c.trim()).map((c, j) => (
                                                                                <td key={j} className="px-4 py-2.5 text-zinc-600">{c.trim()}</td>
                                                                            ))}
                                                                        </tr>
                                                                    ))}
                                                                </tbody>
                                                            </table>
                                                        </div>
                                                    );
                                                    continue;
                                                }

                                                // 2. Images
                                                const imgMatch = line.match(/!\[(.*?)\]\((.*?)\)/);
                                                if (imgMatch) {
                                                    elements.push(<img key={i} src={imgMatch[2]} alt={imgMatch[1]} className="w-full rounded-xl my-4 border border-zinc-100 shadow-sm transition-transform hover:scale-[1.01]" />);
                                                    i++; continue;
                                                }

                                                // 3. Headers
                                                if (line.startsWith('# ')) {
                                                    elements.push(<h1 key={i} className="text-4xl font-bold text-black mt-8 mb-4 tracking-tight">{line.replace('# ', '')}</h1>);
                                                    i++; continue;
                                                }
                                                if (line.startsWith('## ')) {
                                                    elements.push(<h2 key={i} className="text-2xl font-bold text-black mt-6 mb-3 tracking-tight border-b border-zinc-100 pb-2">{line.replace('## ', '')}</h2>);
                                                    i++; continue;
                                                }

                                                // 4. Banners / Callouts
                                                if (line.includes('[!NOTE]')) {
                                                    // Look ahead for content lines starting with >
                                                    const bannerContent = [];
                                                    i++; // Skip marker line
                                                    while (i < lines.length && lines[i].startsWith('>')) {
                                                        bannerContent.push(lines[i].replace('> ', ''));
                                                        i++;
                                                    }
                                                    elements.push(
                                                        <div key={`banner-${i}`} className="my-6 bg-zinc-50 border-l-4 border-zinc-900 p-4 rounded-r-lg flex items-start gap-4">
                                                            <div className="mt-1"><FileText className="w-5 h-5 text-zinc-900" /></div>
                                                            <div className="flex-1">
                                                                <h4 className="font-bold text-zinc-900 text-sm uppercase tracking-wider mb-1">Nota</h4>
                                                                <div className="text-zinc-700 text-sm leading-relaxed">
                                                                    {bannerContent.length > 0 ? bannerContent.map((l, k) => <p key={k}>{l}</p>) : <p className="italic text-zinc-400">Edite o texto...</p>}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    );
                                                    continue;
                                                }

                                                // 5. Lists
                                                if (line.startsWith('- [ ] ')) {
                                                    elements.push(
                                                        <div key={i} className="flex items-center gap-3 my-2 pl-1 group">
                                                            <div className="w-4 h-4 border-2 border-zinc-300 rounded group-hover:border-black transition-colors" />
                                                            <span className="text-zinc-600 line-through-none group-hover:text-zinc-900 transition-colors">{line.replace('- [ ] ', '')}</span>
                                                        </div>
                                                    );
                                                    i++; continue;
                                                }

                                                // 6. Simple Blockquotes
                                                if (line.startsWith('> ')) {
                                                    elements.push(<blockquote key={i} className="border-l-4 border-zinc-300 pl-4 py-1 my-2 text-zinc-500 italic bg-zinc-50/30 rounded-r">{line.replace('> ', '')}</blockquote>);
                                                    i++; continue;
                                                }

                                                // 7. Task Links (Inline replacement simulation)
                                                if (line.match(/\[task:(.*?):(.*?)\]/)) {
                                                    const parts = line.split(/(\[task:.*?:.*?\])/);
                                                    elements.push(
                                                        <p key={i} className="mb-2 min-h-[1.5em]">
                                                            {parts.map((part, idx) => {
                                                                const match = part.match(/\[task:(.*?):(.*?)\]/);
                                                                if (match) {
                                                                    return (
                                                                        <span key={idx} className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-zinc-100 text-zinc-700 font-medium text-sm border border-zinc-200 cursor-pointer hover:bg-zinc-200 transition-colors mx-1 align-middle">
                                                                            <CheckSquare size={12} />
                                                                            <span className="truncate max-w-[200px]">{match[2]}</span>
                                                                        </span>
                                                                    );
                                                                }
                                                                return part;
                                                            })}
                                                        </p>
                                                    );
                                                    i++; continue;
                                                }

                                                // Default Paragraph
                                                if (line.trim()) {
                                                    elements.push(<p key={i} className="mb-2 min-h-[1.5em]">{line}</p>);
                                                } else {
                                                    elements.push(<div key={i} className="h-4" />); // Spacer
                                                }
                                                i++;
                                            }

                                            return elements;
                                        })()}
                                    </div>
                                )}
                            </div>

                            {/* Command Menu Popup */}
                            {commandType && (
                                (commandType === 'slash' && filteredCommands.length > 0) ||
                                (commandType === 'mention' && filteredUsers.length > 0) ||
                                (commandType === 'task') // Task handles its own empty state or filtering
                            ) && (
                                    <div className="absolute top-20 left-10 z-50 w-64 bg-white rounded-xl shadow-sm border border-zinc-200 animate-in fade-in zoom-in-95 duration-200 overflow-hidden">
                                        <div className="bg-zinc-50/50 px-3 py-2 border-b border-zinc-50">
                                            <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">
                                                {commandType === 'slash' ? 'Comandos' : commandType === 'task' ? 'Vincular Tarefa' : 'Mencionar'}
                                            </span>
                                        </div>
                                        <div className="p-1 max-h-60 overflow-y-auto">
                                            {commandType === 'task' ? (
                                                filteredTasks.length > 0 ? filteredTasks.map(task => (
                                                    <button key={task.id} onClick={() => insertText(`[task:${task.id}:${task.title}] `)} className="w-full flex items-center gap-3 p-2 hover:bg-zinc-50 rounded-lg transition-colors group text-left border-b border-zinc-50 last:border-0 relative">
                                                        <div className="w-1 absolute left-0 top-2 bottom-2 bg-zinc-900 rounded-r-lg" />
                                                        <div className="pl-4">
                                                            <span className="text-sm font-bold text-zinc-800 group-hover:text-black block">{task.title}</span>
                                                            <span className="text-[10px] text-zinc-400 uppercase tracking-wider">{task.project_name}</span>
                                                        </div>
                                                    </button>
                                                )) : <div className="p-4 text-xs text-zinc-400 text-center">Nenhuma tarefa encontrada.</div>
                                            ) : commandType === 'slash' ? filteredCommands.map(cmd => (
                                                <button key={cmd.id} onClick={cmd.action} className="w-full flex items-center gap-3 p-2 hover:bg-zinc-50 rounded-lg transition-colors group text-left">
                                                    <div className="w-8 h-8 rounded-md bg-white border border-zinc-100 flex items-center justify-center text-zinc-400 group-hover:border-zinc-300 group-hover:text-black transition-all">
                                                        <cmd.icon size={14} />
                                                    </div>
                                                    <span className="text-sm font-medium text-zinc-600 group-hover:text-black">{cmd.label}</span>
                                                </button>
                                            )) : filteredUsers.map(user => (
                                                <button key={user.id} onClick={() => insertText(`@${user.name}`)} className="w-full flex items-center gap-3 p-2 hover:bg-zinc-50 rounded-lg transition-colors group text-left">
                                                    <div className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center text-xs font-bold text-zinc-500 group-hover:bg-black group-hover:text-white transition-all">
                                                        {user.name.charAt(0)}
                                                    </div>
                                                    <span className="text-sm font-medium text-zinc-600 group-hover:text-black">{user.name}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
};

export default KnowledgeDocumentEditor;
