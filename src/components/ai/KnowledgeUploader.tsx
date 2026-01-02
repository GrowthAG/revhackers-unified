import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileText, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface KnowledgeUploaderProps {
    files: File[];
    onFilesChange: (files: File[]) => void;
}

export const KnowledgeUploader = ({ files, onFilesChange }: KnowledgeUploaderProps) => {
    const [isUploading, setIsUploading] = useState(false);

    const onDrop = useCallback((acceptedFiles: File[], rejectedFiles: any[]) => {
        console.group('[ELIMINAÇÃO] Evento Drop Detectado');
        console.log(`- Recebidos: ${acceptedFiles.length} aceitos, ${rejectedFiles.length} rejeitados.`);

        if (rejectedFiles.length > 0) {
            rejectedFiles.forEach((rej, i) => {
                console.warn(`- Rejeitado[${i}]: ${rej.file.name} | Motivo:`, rej.errors);
                toast.error(`Arquivo rejeitado: ${rej.file.name} (Formato não suportado)`);
            });
        }

        if (acceptedFiles.length === 0 && rejectedFiles.length === 0) {
            console.error('- Nenhum arquivo foi detectado pelo Dropzone (Vazio).');
            toast.error('O sistema de drag-and-drop não detectou nenhum arquivo.');
            console.groupEnd();
            return;
        }

        // Filter for text/pdf/md
        const validFiles = acceptedFiles.filter(file => {
            const isMatch = file.type === 'application/pdf' ||
                file.type === 'text/plain' ||
                file.type === 'text/markdown' ||
                file.name.toLowerCase().endsWith('.pdf') ||
                file.name.toLowerCase().endsWith('.md') ||
                file.name.toLowerCase().endsWith('.txt');

            console.log(`- Validando: ${file.name} (${file.type || 'sem tipo'}) -> ${isMatch ? 'ACEITO' : 'REJEITADO (FILTRO)'}`);
            return isMatch;
        });

        if (validFiles.length > 0) {
            toast.success(`${validFiles.length} arquivo(s) preparado(s) no estado local.`);
            console.log(`- Enviando ${validFiles.length} arquivos para o estado do Builder.`);
            onFilesChange([...files, ...validFiles]);
        } else if (acceptedFiles.length > 0) {
            toast.error('Os arquivos foram detectados, mas nenhum passou no filtro PDF/TXT.');
        }

        console.groupEnd();
    }, [files, onFilesChange]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        // Looping restrictions to let custom filter handle it with logs
        maxSize: 10 * 1024 * 1024 // 10MB
    });

    const removeFile = (index: number) => {
        const newFiles = [...files];
        newFiles.splice(index, 1);
        onFilesChange(newFiles);
    };

    return (
        <div className="space-y-4">
            <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${isDragActive ? 'border-revgreen bg-revgreen/5' : 'border-zinc-200 hover:border-zinc-300'
                    }`}
            >
                <input {...getInputProps()} />
                <div className="flex flex-col items-center gap-2">
                    <div className="w-10 h-10 bg-zinc-100 rounded-full flex items-center justify-center">
                        <Upload className="w-5 h-5 text-zinc-500" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-zinc-900">Clique para upload ou arraste arquivos</p>
                        <p className="text-xs text-zinc-500">PDF, TXT, MD (Max 10MB)</p>
                    </div>
                </div>
            </div>

            {/* FALLBACK: Botão de Seleção Manual (Eliminação) */}
            <div className="flex justify-center mt-2">
                <label className="text-[10px] font-bold text-revgreen cursor-pointer hover:underline flex items-center gap-2 bg-revgreen/5 px-3 py-1.5 rounded-full border border-revgreen/20">
                    <input
                        type="file"
                        multiple
                        accept=".pdf,.txt,.md"
                        className="hidden"
                        onChange={(e) => {
                            const selected = Array.from(e.target.files || []);
                            console.log('[ELIMINAÇÃO] Seleção Manual via Input HTML:', selected.length, "arquivos.");
                            // We call onDrop manually to reuse the filtering and state logic
                            onDrop(selected, []);
                        }}
                    />
                    ( ELIMINAÇÃO: CLIQUE AQUI SE O ARRASTAR FALHAR )
                </label>
            </div>

            {files.length > 0 && (
                <div className="space-y-2">
                    <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Arquivos Selecionados</p>
                    <div className="grid gap-2">
                        {files.map((file, idx) => (
                            <div key={idx} className="flex items-center justify-between p-3 bg-zinc-50 border border-zinc-100 rounded-md">
                                <div className="flex items-center gap-3">
                                    <FileText className="w-4 h-4 text-zinc-400" />
                                    <div className="flex flex-col">
                                        <span className="text-sm font-medium text-zinc-700 truncate max-w-[200px]">{file.name}</span>
                                        <span className="text-[10px] text-zinc-400">{(file.size / 1024).toFixed(0)} KB</span>
                                    </div>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        removeFile(idx);
                                    }}
                                    className="h-8 w-8 hover:bg-zinc-200"
                                >
                                    <X className="w-4 h-4 text-zinc-500" />
                                </Button>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};
