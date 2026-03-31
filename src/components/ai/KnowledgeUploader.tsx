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

        if (rejectedFiles.length > 0) {
            rejectedFiles.forEach((rej, i) => {
                console.warn(`- Rejeitado[${i}]: ${rej.file.name} | Motivo:`, rej.errors);
                toast.error(`Arquivo rejeitado: ${rej.file.name} (Formato não suportado)`);
            });
        }

        if (acceptedFiles.length === 0 && rejectedFiles.length === 0) {
            console.error('Nenhum arquivo foi detectado pelo Dropzone.');
            toast.error('O sistema de drag-and-drop não detectou nenhum arquivo.');
            return;
        }

        // Filter for text/pdf/md/docx/csv/json
        const validFiles = acceptedFiles.filter(file => {
            const name = file.name.toLowerCase();
            const type = file.type;

            const isMatch =
                type === 'application/pdf' ||
                type === 'text/plain' ||
                type === 'text/markdown' ||
                type === 'text/csv' ||
                type === 'application/json' ||
                type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
                name.endsWith('.pdf') ||
                name.endsWith('.md') ||
                name.endsWith('.txt') ||
                name.endsWith('.csv') ||
                name.endsWith('.json') ||
                name.endsWith('.docx');

            return isMatch;
        });

        if (validFiles.length > 0) {
            toast.success(`${validFiles.length} arquivo(s) preparado(s) no estado local.`);
            onFilesChange([...files, ...validFiles]);
        } else if (acceptedFiles.length > 0) {
            toast.error('Formato não suportado. Use PDF, DOCX, TXT, MD, CSV ou JSON.');
        }

    }, [files, onFilesChange]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
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
                className={`border-2 border-dashed p-8 text-center cursor-pointer transition-colors ${isDragActive ? 'border-revgreen bg-revgreen/5' : 'border-zinc-200 hover:border-zinc-300'
                    }`}
            >
                <input {...getInputProps()} />
                <div className="flex flex-col items-center gap-2">
                    <div className="w-10 h-10 bg-zinc-100 rounded-full flex items-center justify-center">
                        <Upload className="w-5 h-5 text-zinc-500" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-zinc-900">Clique para upload ou arraste arquivos</p>
                        <p className="text-xs text-zinc-500">PDF, DOCX, TXT, MD, CSV, JSON (Max 10MB)</p>
                    </div>
                </div>
            </div>

            {files.length > 0 && (
                <div className="space-y-2">
                    <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Arquivos Selecionados</p>
                    <div className="grid gap-2">
                        {files.map((file, idx) => (
                            <div key={idx} className="flex items-center justify-between p-3 bg-zinc-50 border border-zinc-100 ">
                                <div className="flex items-center gap-3">
                                    <FileText className="w-4 h-4 text-zinc-400" />
                                    <div className="flex flex-col">
                                        <span className="text-sm font-medium text-zinc-700 truncate max-w-[200px]">{file.name}</span>
                                        <span className="text-xxs text-zinc-400">{(file.size / 1024).toFixed(0)} KB</span>
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
