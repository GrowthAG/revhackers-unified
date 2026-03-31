import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { FileText, Loader2, ExternalLink } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

export interface DocumentPickerModalProps {
  projectId: string;
  isOpen: boolean;
  onClose: () => void;
  onSelect: (doc: any, libId: string) => void;
}

export const DocumentPickerModal: React.FC<DocumentPickerModalProps> = ({ projectId, isOpen, onClose, onSelect }) => {
  const [docs, setDocs] = useState<any[]>([]);
  const [libId, setLibId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isOpen && projectId) {
      fetchDocuments();
    }
  }, [isOpen, projectId]);

  const fetchDocuments = async () => {
    setIsLoading(true);
    try {
      const { data: lib, error: libError } = await (supabase as any)
        .from('knowledge_libraries')
        .select('id')
        .eq('project_id', projectId)
        .single();
        
      if (libError && libError.code !== 'PGRST116') throw libError;
      
      if (lib) {
        setLibId(lib.id);
        const { data: documents } = await (supabase as any)
          .from('agent_documents')
          .select('*')
          .eq('library_id', lib.id)
          .order('created_at', { ascending: false });
        setDocs(documents || []);
      } else {
        setDocs([]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-xl md:w-[600px] h-full max-h-[80vh] flex flex-col bg-zinc-50 dark:bg-zinc-950 p-0 border border-zinc-200 dark:border-zinc-800">
        <DialogHeader className="px-6 py-4 border-b border-zinc-200 dark:border-zinc-900 bg-white dark:bg-zinc-900">
          <DialogTitle className="text-lg font-black uppercase text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <FileText className="w-5 h-5 text-revhackers" />
            Vincular Documento da Wiki
          </DialogTitle>
          <p className="text-xs text-zinc-500 font-medium">Selecione uma Ata, Playbook ou Dash da biblioteca do projeto.</p>
        </DialogHeader>
        
        <div className="flex-1 overflow-y-auto p-4 hide-scrollbar">
          {isLoading ? (
            <div className="flex h-40 items-center justify-center">
               <Loader2 className="w-6 h-6 animate-spin text-zinc-400" />
            </div>
          ) : docs.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-center h-40">
               <div className="w-12 h-12 bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center mb-3">
                  <FileText className="w-6 h-6 text-zinc-400" />
               </div>
               <p className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">Nenhum documento encontrado.</p>
               <p className="text-xs text-zinc-500 max-w-[250px] mt-1">
                 A Wiki desse projeto ainda está vazia. Crie documentos na aba Wiki & Documentos primeiro.
               </p>
            </div>
          ) : (
             <div className="grid grid-cols-1 gap-2">
                {docs.map(doc => {
                  const isExternal = doc.metadata?.type === 'external_link';
                  return (
                    <button
                      key={doc.id}
                      onClick={() => {
                        onSelect(doc, libId as string);
                        onClose();
                      }}
                      className="flex items-center justify-between w-full text-left p-3 hover:bg-white dark:hover:bg-zinc-900 border border-transparent hover:border-zinc-200 dark:hover:border-zinc-800 transition-all group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-400 group-hover:text-black dark:group-hover:text-white transition-colors">
                           {isExternal ? <ExternalLink className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
                        </div>
                        <div className="flex flex-col">
                           <span className="text-sm font-bold text-zinc-900 dark:text-zinc-100 line-clamp-1">{doc.title || doc.filename}</span>
                           <span className="text-xs text-zinc-400 font-medium">{isExternal ? 'Link Externo' : 'Documento Base'} • {doc.metadata?.category || 'Geral'}</span>
                        </div>
                      </div>
                      <span className="text-xxs font-black uppercase text-zinc-400 opacity-0 group-hover:opacity-100 transition-opacity">
                         Vincular +
                      </span>
                    </button>
                  );
                })}
             </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
