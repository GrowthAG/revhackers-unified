import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer, NodeViewWrapper } from '@tiptap/react';
import React from 'react';
import { FileText, ExternalLink } from 'lucide-react';

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    documentLink: {
      setDocumentLink: (options: { docId: string, libId: string, title: string, isExternal?: boolean, url?: string }) => ReturnType;
    }
  }
}

const DocumentLinkComponent = (props: any) => {
  const { title, libId, docId, isExternal, url } = props.node.attrs;
  
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isExternal && url) {
      window.open(url, '_blank');
    } else if (libId && docId) {
      window.open(`/admin/knowledge/${libId}/doc/${docId}`, '_blank');
    }
  };

  return (
    <NodeViewWrapper 
      as="span" 
      data-drag-handle
      className="inline-flex items-center gap-1.5 px-2 py-0.5 mx-1 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 hover:bg-zinc-200 dark:hover:bg-zinc-700 font-medium text-sm transition-colors border border-zinc-200 dark:border-zinc-700 cursor-pointer shadow-sm select-none"
      onClick={handleClick}
    >
      {isExternal ? <ExternalLink className="w-3.5 h-3.5 text-zinc-700" /> : <FileText className="w-3.5 h-3.5 text-revhackers" />}
      {title}
    </NodeViewWrapper>
  );
};

export const DocumentLinkExtension = Node.create({
  name: 'documentLink',
  group: 'inline',
  inline: true,
  selectable: true,
  atom: true,

  addAttributes() {
    return {
      docId: { default: null },
      libId: { default: null },
      title: { default: 'Documento Desconhecido' },
      isExternal: { default: false },
      url: { default: null }
    };
  },

  parseHTML() {
    return [{ tag: 'document-link' }];
  },

  renderHTML({ HTMLAttributes }) {
    return ['document-link', mergeAttributes(HTMLAttributes)];
  },

  addNodeView() {
    return ReactNodeViewRenderer(DocumentLinkComponent);
  },

  addCommands() {
    return {
      setDocumentLink: (options) => ({ commands }: any) => {
        return commands.insertContent({
          type: this.name,
          attrs: options,
        });
      },
    };
  },
});
