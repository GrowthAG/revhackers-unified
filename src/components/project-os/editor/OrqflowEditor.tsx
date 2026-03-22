import React, { useEffect, useRef } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import { Bold, Italic, Strikethrough, Heading1, Heading2, List, ListOrdered, CheckSquare, Type } from 'lucide-react';
import { SlashCommand } from './slash-command';
import { Iframe } from './iframe-extension';
import { DocumentLinkExtension } from './document-link-extension';
import { DocumentPickerModal } from './DocumentPickerModal';

interface OrqflowEditorProps {
  initialContent?: any;
  onChange?: (json: any) => void;
  editable?: boolean;
  projectId?: string;
}

export const OrqflowEditor: React.FC<OrqflowEditorProps> = ({ initialContent, onChange, editable = true, projectId }) => {
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const [isDocumentPickerOpen, setIsDocumentPickerOpen] = React.useState(false);

  useEffect(() => {
    const handleOpenPicker = () => {
      setIsDocumentPickerOpen(true);
    };
    document.addEventListener('open-os-document-modal', handleOpenPicker);
    return () => {
      document.removeEventListener('open-os-document-modal', handleOpenPicker);
    };
  }, []);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
        bulletList: { keepMarks: true, keepAttributes: false },
        orderedList: { keepMarks: true, keepAttributes: false },
      }),
      Placeholder.configure({
        placeholder: 'Pressione "/" para ver os comandos ou digite algo...',
        emptyEditorClass: 'is-editor-empty',
      }),
      TaskList,
      TaskItem.configure({
        nested: true,
      }),
      SlashCommand,
      Iframe,
      DocumentLinkExtension,
    ],
    content: initialContent || '',
    editable,
    onUpdate: ({ editor }) => {
      const json = editor.getJSON();
      
      // Debounce the backend onChange to prevent DDosing the database
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
      
      debounceTimerRef.current = setTimeout(() => {
        onChange?.(json);
      }, 1000);
    },
    editorProps: {
      attributes: {
        class: 'prose dark:prose-invert prose-sm sm:prose-base max-w-none focus:outline-none min-h-[200px] text-zinc-900 dark:text-zinc-300',
      },
    },
  });

  // Effect to update content if it changes externally
  useEffect(() => {
    if (editor && initialContent && editor.getJSON() !== initialContent) {
      editor.commands.setContent(initialContent);
    }
  }, [initialContent, editor]);

  if (!editor) return null;

  return (
    <>
      <div className="w-full relative group flex flex-col border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden bg-white dark:bg-zinc-950">
        {/* Static Fixed Toolbar */}
      {editor && (
        <div className="bg-zinc-50 dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 px-3 py-2 flex items-center gap-1 overflow-x-auto custom-scrollbar">
          <button
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={`p-1.5 rounded transition-colors ${editor.isActive('bold') ? 'bg-zinc-200 text-zinc-900 dark:bg-zinc-700 dark:text-white' : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-800'}`}
            title="Negrito"
          >
            <Bold className="w-4 h-4" />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={`p-1.5 rounded transition-colors ${editor.isActive('italic') ? 'bg-zinc-200 text-zinc-900 dark:bg-zinc-700 dark:text-white' : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-800'}`}
            title="Itálico"
          >
            <Italic className="w-4 h-4" />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleStrike().run()}
            className={`p-1.5 rounded transition-colors ${editor.isActive('strike') ? 'bg-zinc-200 text-zinc-900 dark:bg-zinc-700 dark:text-white' : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-800'}`}
            title="Tachado"
          >
            <Strikethrough className="w-4 h-4" />
          </button>
          <div className="w-px h-4 bg-zinc-300 dark:bg-zinc-800 mx-2 shrink-0" />
          <button
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            className={`p-1.5 rounded transition-colors ${editor.isActive('heading', { level: 1 }) ? 'bg-zinc-200 text-zinc-900 dark:bg-zinc-700 dark:text-white' : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-800'}`}
            title="Título 1"
          >
            <Heading1 className="w-4 h-4" />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            className={`p-1.5 rounded transition-colors ${editor.isActive('heading', { level: 2 }) ? 'bg-zinc-200 text-zinc-900 dark:bg-zinc-700 dark:text-white' : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-800'}`}
            title="Título 2"
          >
            <Heading2 className="w-4 h-4" />
          </button>
          <div className="w-px h-4 bg-zinc-300 dark:bg-zinc-800 mx-2 shrink-0" />
          <button
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={`p-1.5 rounded transition-colors ${editor.isActive('bulletList') ? 'bg-zinc-200 text-zinc-900 dark:bg-zinc-700 dark:text-white' : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-800'}`}
            title="Lista"
          >
            <List className="w-4 h-4" />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={`p-1.5 rounded transition-colors ${editor.isActive('orderedList') ? 'bg-zinc-200 text-zinc-900 dark:bg-zinc-700 dark:text-white' : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-800'}`}
            title="Lista Numerada"
          >
            <ListOrdered className="w-4 h-4" />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleTaskList().run()}
            className={`p-1.5 rounded transition-colors ${editor.isActive('taskList') ? 'bg-zinc-200 text-zinc-900 dark:bg-zinc-700 dark:text-white' : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-800'}`}
            title="Checklist"
          >
            <CheckSquare className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Exibindo a "Página Branca" do Editor Notion */}
      <div className="p-4 cursor-text w-full flex-1">
        <EditorContent editor={editor} />
      </div>

      <style>{`
        /* Minimalist Tiptap Overrides */
        .ProseMirror p.is-editor-empty:first-child::before {
          content: attr(data-placeholder);
          float: left;
          color: #a1a1aa; /* zinc-400 for better visibility in both modes */
          pointer-events: none;
          height: 0;
        }
        .ProseMirror ul[data-type="taskList"] {
          list-style: none;
          padding: 0;
        }
        .ProseMirror ul[data-type="taskList"] li {
          display: flex;
          align-items: flex-start;
          margin-bottom: 0.5rem;
        }
        .ProseMirror ul[data-type="taskList"] li > label {
          margin-right: 0.5rem;
          margin-top: 0.25rem;
          user-select: none;
        }
        .ProseMirror ul[data-type="taskList"] li > div {
          flex: 1;
        }
      `}</style>
    </div>

      <DocumentPickerModal 
        projectId={projectId || ''} 
        isOpen={isDocumentPickerOpen} 
        onClose={() => setIsDocumentPickerOpen(false)} 
        onSelect={(doc, libId) => {
          editor.commands.setDocumentLink({
            docId: doc.id,
            libId: libId,
            title: doc.title || doc.filename,
            isExternal: doc.metadata?.type === 'external_link',
            url: doc.metadata?.url
          });
          editor.commands.focus();
        }}
      />
    </>
  );
};
