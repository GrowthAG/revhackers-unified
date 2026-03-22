import { Editor, Range } from '@tiptap/core';
import { Heading1, Heading2, Heading3, List, ListOrdered, CheckSquare, Type, FileText, Play } from 'lucide-react';
import { getEmbedUrl } from './iframe-extension';

export interface CommandItemProps {
  title: string;
  description: string;
  icon: any;
  command: ({ editor, range }: { editor: Editor; range: Range }) => void;
}

export const getSuggestionItems = ({ query }: { query: string }): CommandItemProps[] => {
  return [
    {
      title: 'Texto Padrão',
      description: 'Comece a escrever texto corrido.',
      icon: Type,
      command: ({ editor, range }) => {
        editor.chain().focus().deleteRange(range).setParagraph().run()
      },
    },
    {
      title: 'Título 1',
      description: 'Cabeçalho de seção grande.',
      icon: Heading1,
      command: ({ editor, range }) => {
        editor.chain().focus().deleteRange(range).setNode('heading', { level: 1 }).run()
      },
    },
    {
      title: 'Título 2',
      description: 'Cabeçalho de seção médio.',
      icon: Heading2,
      command: ({ editor, range }) => {
        editor.chain().focus().deleteRange(range).setNode('heading', { level: 2 }).run()
      },
    },
    {
      title: 'Título 3',
      description: 'Cabeçalho de seção pequeno.',
      icon: Heading3,
      command: ({ editor, range }) => {
        editor.chain().focus().deleteRange(range).setNode('heading', { level: 3 }).run()
      },
    },
    {
      title: 'Lista de Tarefas',
      description: 'Crie um checklist estruturado.',
      icon: CheckSquare,
      command: ({ editor, range }) => {
        editor.chain().focus().deleteRange(range).toggleTaskList().run()
      },
    },
    {
      title: 'Lista com Marcadores',
      description: 'Crie uma lista simples.',
      icon: List,
      command: ({ editor, range }) => {
        editor.chain().focus().deleteRange(range).toggleBulletList().run()
      },
    },
    {
      title: 'Lista Numerada',
      description: 'Crie uma lista com ordem.',
      icon: ListOrdered,
      command: ({ editor, range }) => {
        editor.chain().focus().deleteRange(range).toggleOrderedList().run()
      },
    },
    {
      title: 'Linkar Documento',
      description: 'Anexe um documento do Hub.',
      icon: FileText,
      command: ({ editor, range }) => {
        editor.chain().focus().deleteRange(range).run()
        // Dispara o evento que o OrqflowEditor escuta para abrir o Picker
        document.dispatchEvent(new CustomEvent('open-os-document-modal'));
      },
    },
    {
      title: 'Embed Vídeo (YouTube/Loom)',
      description: 'Incorpore um vídeo via URL.',
      icon: Play,
      command: ({ editor, range }) => {
        editor.chain().focus().deleteRange(range).run()
        const url = window.prompt('Cole o link do YouTube ou Loom:');
        if (url) {
          editor.commands.setIframe({ src: getEmbedUrl(url) })
        }
      },
    },
  ].filter(item => item.title.toLowerCase().startsWith(query.toLowerCase())).slice(0, 10)
}
