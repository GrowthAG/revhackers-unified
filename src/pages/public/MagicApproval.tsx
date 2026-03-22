import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { CheckCircle2, XCircle, Loader2, Link2, CheckSquare } from 'lucide-react';
import { generateHTML } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';

export default function MagicApproval() {
  const { token } = useParams<{ token: string }>();
  const [loading, setLoading] = useState(true);
  const [magicLink, setMagicLink] = useState<any>(null);
  const [task, setTask] = useState<any>(null);
  const [htmlContent, setHtmlContent] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (token) loadLink();
  }, [token]);

  const loadLink = async () => {
    setLoading(true);
    try {
      // 1. Fetch Magic Link
      const { data: linkData, error: linkError } = await supabase
        .from('orqflow_magic_links')
        .select('*')
        .eq('token', token)
        .single();

      if (linkError || !linkData) throw new Error('Link Mágico inválido ou expirado.');

      // Verificar TTL: link expirado nao pode ser usado
      if (linkData.expires_at && new Date(linkData.expires_at) < new Date()) {
        throw new Error('Este link expirou. Solicite um novo link de aprovacao ao responsavel do projeto.');
      }

      setMagicLink(linkData);

      // 2. Fetch Task Associated with Link (Public via RLS)
      const { data: taskData, error: taskError } = await supabase
        .from('orqflow_tasks')
        .select('*')
        .eq('id', linkData.task_id)
        .single();
        
      if (taskError || !taskData) throw new Error('A tarefa referente a este link não existe mais.');
      setTask(taskData);

      // Render JSONB to HTML
      if (taskData.content) {
        try {
           const html = generateHTML(taskData.content, [
             StarterKit, TaskList, TaskItem
           ]);
           setHtmlContent(html);
        } catch(e) { console.error(e) }
      }

    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (status: 'approved' | 'rejected') => {
    setActionLoading(true);
    try {
      // Idempotencia: so atualiza se ainda estiver pendente
      if (magicLink?.status !== 'pending') {
        toast.error('Esta avaliacao ja foi registrada anteriormente.');
        return;
      }

      // Verificar TTL novamente no momento da acao (protecao dupla)
      if (magicLink?.expires_at && new Date(magicLink.expires_at) < new Date()) {
        setError('Este link expirou. Solicite um novo link ao responsavel do projeto.');
        return;
      }

      // 1. Atualizar magic link com audit trail
      const { error: linkError } = await supabase
        .from('orqflow_magic_links')
        .update({
          status,
          approved_at: new Date().toISOString(),
          approver_user_agent: navigator.userAgent.substring(0, 255),
        } as any)
        .eq('token', token)
        .eq('status', 'pending'); // Clausula de idempotencia no DB

      if (linkError) throw linkError;

      // 2. Sincronizar status da task com a decisao
      if (task?.id) {
        const newTaskStatus = status === 'approved' ? 'done' : 'review';
        await supabase
          .from('orqflow_tasks')
          .update({ status: newTaskStatus })
          .eq('id', task.id);
      }

      setMagicLink({ ...magicLink, status });
      toast.success(status === 'approved' ? "Peca Aprovada com Sucesso!" : "Ajuste Solicitado. O time foi notificado.");
    } catch (e: any) {
      toast.error("Erro ao validar: " + e.message);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center">
         <Loader2 className="w-8 h-8 text-revhackers animate-spin" />
         <p className="text-zinc-500 mt-4 font-semibold text-sm tracking-widest uppercase">Decodificando Hash...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
        <div className="max-w-md bg-zinc-900 border border-red-900/50 p-8 rounded-2xl text-center shadow-2xl">
           <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
           <h2 className="text-white text-xl font-bold mb-2">Acesso Negado</h2>
           <p className="text-zinc-400 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  const isApproved = magicLink.status === 'approved';
  const isRejected = magicLink.status === 'rejected';
  const isPending = magicLink.status === 'pending';

  return (
    <div className="min-h-screen bg-zinc-950 text-white font-sans selection:bg-revhackers/30 selection:text-white pb-24">
      {/* Header Escudo Corporativo */}
      <header className="bg-zinc-900 border-b border-zinc-800 sticky top-0 z-10 backdrop-blur-xl bg-opacity-80">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
           <div className="flex items-center gap-2">
             <div className="w-8 h-8 bg-revhackers rounded-lg flex items-center justify-center shadow-lg shadow-revhackers/20 text-black font-black text-xs">RH</div>
             <span className="font-bold text-sm tracking-widest uppercase text-zinc-300">Approval Room</span>
           </div>
           {isApproved && <span className="text-emerald-400 text-xs font-bold uppercase tracking-wider bg-emerald-400/10 px-3 py-1.5 rounded-full border border-emerald-400/20 flex items-center gap-1"><CheckCircle2 className="w-3 h-3"/> APROVADO</span>}
           {isRejected && <span className="text-red-400 text-xs font-bold uppercase tracking-wider bg-red-400/10 px-3 py-1.5 rounded-full border border-red-400/20 flex items-center gap-1"><XCircle className="w-3 h-3"/> AJUSTE SOLICITADO</span>}
           {isPending && <span className="text-amber-400 text-xs font-bold uppercase tracking-wider bg-amber-400/10 px-3 py-1.5 rounded-full border border-amber-400/20">Aguardando Avaliação</span>}
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 mt-12">
         {/* Título da Peça */}
         <div className="mb-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
           <div className="flex items-center gap-2 text-zinc-500 text-sm mb-3">
             <CheckSquare className="w-4 h-4" />
             <span>Peça para Aprovação Confidencial</span>
           </div>
           <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-white mb-4">
             {task.title}
           </h1>
           <p className="text-zinc-400">Criado em {new Date(task.created_at).toLocaleDateString()}</p>
         </div>

         {/* Content Box */}
         <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 md:p-12 shadow-2xl animate-in fade-in slide-in-from-bottom-8 duration-700 delay-150 relative overflow-hidden">
            {/* Decal Background */}
            <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-revhackers/5 rounded-full blur-3xl mix-blend-screen pointer-events-none" />
            
            <div 
              className="prose prose-invert prose-revhackers max-w-none prose-p:leading-relaxed prose-headings:font-bold prose-a:text-revhackers prose-li:my-1"
              dangerouslySetInnerHTML={{ __html: htmlContent || '<p class="text-zinc-500 italic">Nenhum detalhe adicional na tarefa.</p>' }}
            />
         </div>

         {/* Action Bar */}
         {isPending && (
           <div className="mt-12 flex flex-col sm:flex-row gap-4 justify-center animate-in fade-in slide-in-from-bottom-10 duration-700 delay-300">
              <button 
                onClick={() => handleAction('rejected')}
                disabled={actionLoading}
                className="flex items-center justify-center gap-2 px-8 py-4 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 rounded-xl font-bold transition-all border border-zinc-800 disabled:opacity-50"
              >
                <XCircle className="w-5 h-5" /> REPROVAR (PEDIR AJUSTE)
              </button>
              <button 
                onClick={() => handleAction('approved')}
                disabled={actionLoading}
                className="flex items-center justify-center gap-2 px-8 py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold transition-all shadow-xl shadow-emerald-500/20 disabled:opacity-50"
              >
                {actionLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle2 className="w-5 h-5" />} APROVAR PEÇA
              </button>
           </div>
         )}

         {!isPending && (
           <div className="mt-12 text-center text-zinc-500 text-sm border-t border-zinc-800/50 pt-8">
             Esta peça já foi avaliada e a decisão foi registrada em nossa central de operações de Growth. <br/>
             A automação Orqflow moveu automaticamente a tarefa para os responsáveis.
           </div>
         )}
      </main>
    </div>
  );
}
