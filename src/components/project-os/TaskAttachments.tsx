import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Paperclip, Plus, Loader2, File, FileText, Image, Archive, Download, Trash2 } from 'lucide-react';

interface Attachment {
  id: string;
  task_id: string;
  file_name: string;
  file_size: number;
  file_type: string;
  storage_path: string;
  uploaded_by: string | null;
  created_at: string;
}

interface TaskAttachmentsProps {
  taskId: string;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getFileIcon(mimeType: string): React.ReactNode {
  if (mimeType.startsWith('image/')) {
    return <Image className="w-4 h-4 text-zinc-500" />;
  }
  if (mimeType === 'application/pdf') {
    return <FileText className="w-4 h-4 text-zinc-500" />;
  }
  if (mimeType === 'application/zip' || mimeType.startsWith('application/x-zip')) {
    return <Archive className="w-4 h-4 text-zinc-500" />;
  }
  return <File className="w-4 h-4 text-zinc-500" />;
}

export const TaskAttachments: React.FC<TaskAttachmentsProps> = ({ taskId }) => {
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    loadAttachments();
  }, [taskId]);

  const loadAttachments = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('orqflow_task_attachments' as any)
        .select('*')
        .eq('task_id', taskId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAttachments((data as Attachment[]) || []);
    } catch (e: any) {
      toast({ title: 'Erro ao carregar anexos', description: e.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const MAX_SIZE_MB = 50;
    const MAX_FILES = 10;
    const BLOCKED_TYPES = ['application/x-msdownload', 'application/x-sh', 'application/x-bat'];

    const fileArray = Array.from(files);

    if (fileArray.length > MAX_FILES) {
      toast({ title: 'Limite excedido', description: `Maximo de ${MAX_FILES} arquivos por vez.`, variant: 'destructive' });
      return;
    }

    for (const file of fileArray) {
      if (file.size > MAX_SIZE_MB * 1024 * 1024) {
        toast({ title: 'Arquivo muito grande', description: `"${file.name}" excede ${MAX_SIZE_MB}MB.`, variant: 'destructive' });
        return;
      }
      if (BLOCKED_TYPES.includes(file.type)) {
        toast({ title: 'Tipo nao permitido', description: `"${file.name}" e um tipo de arquivo bloqueado.`, variant: 'destructive' });
        return;
      }
    }

    setUploading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();

      for (const file of fileArray) {
        const path = `${taskId}/${crypto.randomUUID()}/${file.name}`;

        const { error: uploadError } = await supabase.storage
          .from('task-attachments')
          .upload(path, file, { upsert: false });

        if (uploadError) throw uploadError;

        const { error: insertError } = await supabase
          .from('orqflow_task_attachments' as any)
          .insert({
            task_id: taskId,
            file_name: file.name,
            file_size: file.size,
            file_type: file.type,
            storage_path: path,
            uploaded_by: user?.id ?? null,
          });

        if (insertError) throw insertError;
      }

      toast({ title: 'Arquivo enviado', description: 'Anexo salvo com sucesso.' });
      await loadAttachments();
    } catch (e: any) {
      toast({ title: 'Erro ao enviar arquivo', description: e.message, variant: 'destructive' });
    } finally {
      setUploading(false);
      // Reset input so same file can be re-uploaded if needed
      e.target.value = '';
    }
  };

  const handleDownload = async (attachment: Attachment) => {
    try {
      const { data, error } = await supabase.storage
        .from('task-attachments')
        .createSignedUrl(attachment.storage_path, 300);

      if (error) throw error;
      if (data?.signedUrl) {
        window.open(data.signedUrl, '_blank', 'noopener,noreferrer');
      }
    } catch (e: any) {
      toast({ title: 'Erro ao baixar arquivo', description: e.message, variant: 'destructive' });
    }
  };

  const handleDelete = async (attachment: Attachment) => {
    try {
      const { error: storageError } = await supabase.storage
        .from('task-attachments')
        .remove([attachment.storage_path]);

      if (storageError) throw storageError;

      const { error: dbError } = await supabase
        .from('orqflow_task_attachments' as any)
        .delete()
        .eq('id', attachment.id);

      if (dbError) throw dbError;

      setAttachments(prev => prev.filter(a => a.id !== attachment.id));
      toast({ title: 'Anexo removido', description: 'O arquivo foi deletado.' });
    } catch (e: any) {
      toast({ title: 'Erro ao remover anexo', description: e.message, variant: 'destructive' });
    }
  };

  return (
    <div className="mt-6 pt-6 border-t border-zinc-200">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Paperclip className="w-4 h-4 text-zinc-400" />
          <h3 className="text-sm font-bold text-zinc-700 uppercase tracking-widest">Anexos</h3>
          <span className="text-xs text-zinc-400">({attachments.length})</span>
        </div>
        <label className="cursor-pointer px-3 py-1.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-xs font-bold transition-colors flex items-center gap-1.5 border border-zinc-200">
          {uploading ? (
            <Loader2 className="w-3 h-3 animate-spin" />
          ) : (
            <Plus className="w-3 h-3" />
          )}
          Anexar arquivo
          <input
            type="file"
            className="hidden"
            onChange={handleFileSelect}
            multiple
            accept="*"
            disabled={uploading}
          />
        </label>
      </div>

      <div className="space-y-2">
        {attachments.map(att => (
          <div
            key={att.id}
            className="flex items-center gap-3 p-3 border border-zinc-100 bg-zinc-50 hover:bg-zinc-100 group transition-colors"
          >
            <div className="w-8 h-8 bg-white border border-zinc-200 flex items-center justify-center shrink-0">
              {getFileIcon(att.file_type)}
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-zinc-800 truncate">{att.file_name}</p>
              <p className="text-xs text-zinc-400">{formatFileSize(att.file_size)}</p>
            </div>

            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={() => handleDownload(att)}
                className="p-1.5 hover:bg-zinc-200 transition-colors"
                title="Baixar"
              >
                <Download className="w-3.5 h-3.5 text-zinc-600" />
              </button>
              <button
                onClick={() => handleDelete(att)}
                className="p-1.5 hover:bg-red-50 transition-colors"
                title="Remover"
              >
                <Trash2 className="w-3.5 h-3.5 text-red-400" />
              </button>
            </div>
          </div>
        ))}

        {attachments.length === 0 && !loading && (
          <p className="text-sm text-zinc-400 text-center py-4">Nenhum arquivo anexado</p>
        )}

        {loading && (
          <div className="flex items-center justify-center py-4">
            <Loader2 className="w-4 h-4 animate-spin text-zinc-400" />
          </div>
        )}
      </div>
    </div>
  );
};
