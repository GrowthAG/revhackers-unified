import React, { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { MessageSquare, Send, Loader2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface WorkspaceUser {
  id: string;
  full_name: string | null;
  email: string | null;
}

interface CommentContent {
  text: string;
  mentions: string[];
}

interface TaskComment {
  id: string;
  task_id: string;
  user_id: string;
  content: CommentContent;
  created_at: string | null;
}

export interface TaskCommentsProps {
  taskId: string;
  workspaceUsers: WorkspaceUser[];
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getInitials(user: WorkspaceUser): string {
  const name = user.full_name || user.email || '?';
  return name.substring(0, 2).toUpperCase();
}

function getDisplayName(user: WorkspaceUser): string {
  return user.full_name || user.email || 'Usuario';
}

/** Parse comment text and wrap @mentions with bold styling. */
function renderTextWithMentions(text: string): React.ReactNode {
  const parts = text.split(/(@\S+)/g);
  return parts.map((part, i) => {
    if (part.startsWith('@')) {
      return (
        <span key={i} className="font-bold text-zinc-900">
          {part}
        </span>
      );
    }
    return <React.Fragment key={i}>{part}</React.Fragment>;
  });
}

/** Extract the current @-word being typed at cursor position. */
function extractMentionQuery(text: string, cursorPos: number): string | null {
  const beforeCursor = text.slice(0, cursorPos);
  const match = beforeCursor.match(/@(\S*)$/);
  return match ? match[1] : null;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export const TaskComments: React.FC<TaskCommentsProps> = ({ taskId, workspaceUsers }) => {
  const [comments, setComments] = useState<TaskComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [inputText, setInputText] = useState('');
  const [mentionSearch, setMentionSearch] = useState<string | null>(null);
  const [showMentionList, setShowMentionList] = useState(false);
  const [pendingMentions, setPendingMentions] = useState<string[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const listEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when comments grow
  useEffect(() => {
    listEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [comments]);

  // Resolve current user once
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setCurrentUserId(data.user?.id ?? null);
    });
  }, []);

  // Load comments + subscribe to realtime on taskId change
  useEffect(() => {
    if (!taskId) return;

    setLoading(true);
    setComments([]);

    // Initial fetch
    supabase
      .from('orqflow_task_comments')
      .select('*')
      .eq('task_id', taskId)
      .order('created_at', { ascending: true })
      .then(({ data, error }) => {
        if (!error && data) {
          setComments(
            data.map((row) => ({
              ...row,
              content: row.content as CommentContent,
            }))
          );
        }
        setLoading(false);
      });

    // Realtime subscription
    const channel = supabase
      .channel(`comments:${taskId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'orqflow_task_comments',
          filter: `task_id=eq.${taskId}`,
        },
        (payload) => {
          const newRow = payload.new as TaskComment;
          setComments((prev) => {
            // Avoid duplicates if the optimistic insert already added it
            if (prev.some((c) => c.id === newRow.id)) return prev;
            return [...prev, { ...newRow, content: newRow.content as CommentContent }];
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [taskId]);

  // Filtered users for @mention dropdown
  const filteredUsers = mentionSearch !== null
    ? workspaceUsers.filter((u) => {
        const q = mentionSearch.toLowerCase();
        return (
          (u.full_name?.toLowerCase().includes(q) ?? false) ||
          (u.email?.toLowerCase().includes(q) ?? false)
        );
      })
    : [];

  // Handle textarea change - detect @mention trigger
  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const value = e.target.value;
      setInputText(value);

      const cursor = e.target.selectionStart ?? value.length;
      const query = extractMentionQuery(value, cursor);

      if (query !== null) {
        setMentionSearch(query);
        setShowMentionList(true);
      } else {
        setMentionSearch(null);
        setShowMentionList(false);
      }
    },
    []
  );

  // Handle keyboard in textarea - close mention list on Escape
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Escape') {
        setShowMentionList(false);
        setMentionSearch(null);
      }
      if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        sendComment();
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [inputText, pendingMentions]
  );

  // Select a user from the @mention dropdown
  const selectMention = useCallback(
    (user: WorkspaceUser) => {
      const textarea = textareaRef.current;
      if (!textarea) return;

      const cursor = textarea.selectionStart ?? inputText.length;
      const before = inputText.slice(0, cursor);
      const after = inputText.slice(cursor);

      // Replace the partial @query with the full display name
      const replaced = before.replace(/@(\S*)$/, `@${getDisplayName(user)} `);
      const newText = replaced + after;

      setInputText(newText);
      setPendingMentions((prev) =>
        prev.includes(user.id) ? prev : [...prev, user.id]
      );
      setShowMentionList(false);
      setMentionSearch(null);

      // Restore focus and move cursor to end of inserted mention
      setTimeout(() => {
        textarea.focus();
        const pos = replaced.length;
        textarea.setSelectionRange(pos, pos);
      }, 0);
    },
    [inputText]
  );

  // Post a comment
  const sendComment = useCallback(async () => {
    const trimmed = inputText.trim();
    if (!trimmed || sending) return;

    setSending(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        console.error('TaskComments: unauthenticated send attempt');
        return;
      }

      await supabase.from('orqflow_task_comments').insert({
        task_id: taskId,
        user_id: user.id,
        content: { text: trimmed, mentions: pendingMentions } as any,
      });

      setInputText('');
      setPendingMentions([]);
      setShowMentionList(false);
      setMentionSearch(null);
    } catch (err) {
      console.error('TaskComments: failed to send comment', err);
    } finally {
      setSending(false);
    }
  }, [inputText, sending, taskId, pendingMentions]);

  // Resolve display info for a comment author
  const resolveAuthor = (userId: string): WorkspaceUser => {
    return (
      workspaceUsers.find((u) => u.id === userId) ?? {
        id: userId,
        full_name: null,
        email: null,
      }
    );
  };

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <div className="mt-8 pt-6 border-t border-zinc-200">
      {/* Section header */}
      <div className="flex items-center gap-2 mb-4">
        <MessageSquare className="w-4 h-4 text-zinc-400" />
        <h3 className="text-sm font-black text-zinc-700 uppercase tracking-widest">
          Chat & Atividade
        </h3>
        <span className="text-xs text-zinc-400 ml-auto">
          {comments.length} {comments.length === 1 ? 'mensagem' : 'mensagens'}
        </span>
      </div>

      {/* Comments list */}
      <div className="space-y-4 mb-4 max-h-80 overflow-y-auto pr-1">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-5 h-5 animate-spin text-zinc-400" />
          </div>
        ) : comments.length === 0 ? (
          <p className="text-xs text-zinc-400 text-center py-6">
            Nenhum comentario ainda. Seja o primeiro a comentar.
          </p>
        ) : (
          comments.map((comment) => {
            const author = resolveAuthor(comment.user_id);
            const isOwn = currentUserId !== null && comment.user_id === currentUserId;
            const relativeTime = comment.created_at
              ? formatDistanceToNow(new Date(comment.created_at), {
                  addSuffix: true,
                  locale: ptBR,
                })
              : '';

            return (
              <div key={comment.id} className="flex gap-3 items-start">
                {/* Avatar */}
                <div className="w-8 h-8 shrink-0 rounded-full bg-zinc-100 text-zinc-700 text-xs font-bold flex items-center justify-center border border-zinc-200">
                  {getInitials(author)}
                </div>

                {/* Bubble */}
                <div className="flex-1 min-w-0">
                  {/* Author + timestamp */}
                  <div className="flex items-baseline gap-2 mb-1">
                    <span className="text-sm font-bold text-zinc-900 truncate">
                      {getDisplayName(author)}
                    </span>
                    <span className="text-xs text-zinc-400 shrink-0">{relativeTime}</span>
                  </div>

                  {/* Message text */}
                  <div
                    className={[
                      'text-sm text-zinc-600 leading-relaxed pl-3',
                      isOwn ? 'border-l-2 border-[#00CC6A]' : 'border-l-2 border-zinc-100',
                    ].join(' ')}
                  >
                    {renderTextWithMentions(comment.content?.text ?? '')}
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={listEndRef} />
      </div>

      {/* Input area */}
      <div className="relative">
        <textarea
          ref={textareaRef}
          value={inputText}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder="Escreva um comentario... use @ para mencionar alguem"
          rows={3}
          className="w-full resize-none border border-zinc-200 rounded-xl p-3 text-sm text-zinc-700 outline-none focus:border-zinc-400 focus:ring-1 focus:ring-zinc-300 placeholder:text-zinc-400 min-h-[80px] bg-white"
        />

        {/* @mention dropdown */}
        {showMentionList && filteredUsers.length > 0 && (
          <div className="absolute bottom-full left-0 mb-1 w-64 bg-white border border-zinc-200 rounded-xl shadow-sm z-50 overflow-hidden">
            {filteredUsers.map((user) => (
              <button
                key={user.id}
                type="button"
                onMouseDown={(e) => {
                  // Prevent textarea blur before the click registers
                  e.preventDefault();
                  selectMention(user);
                }}
                className="w-full text-left px-4 py-2.5 hover:bg-zinc-50 flex items-center gap-3 text-sm transition-colors"
              >
                <div className="w-6 h-6 shrink-0 rounded-full bg-zinc-100 text-zinc-700 text-[10px] font-bold flex items-center justify-center border border-zinc-200">
                  {getInitials(user)}
                </div>
                <span className="font-medium text-zinc-800 truncate">
                  {getDisplayName(user)}
                </span>
              </button>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between mt-2">
          <span className="text-[10px] text-zinc-400 select-none">
            Ctrl+Enter para enviar
          </span>
          <button
            type="button"
            onClick={sendComment}
            disabled={sending || !inputText.trim()}
            className="px-4 py-2 bg-zinc-950 text-white text-xs font-bold rounded-lg hover:bg-zinc-800 disabled:opacity-40 transition-colors flex items-center gap-2"
          >
            {sending ? (
              <Loader2 className="w-3 h-3 animate-spin" />
            ) : (
              <Send className="w-3 h-3" />
            )}
            Enviar
          </button>
        </div>
      </div>
    </div>
  );
};
