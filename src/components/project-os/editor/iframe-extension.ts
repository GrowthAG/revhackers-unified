import { Node, mergeAttributes } from '@tiptap/core';

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    iframe: {
      setIframe: (options: { src: string }) => ReturnType;
    }
  }
}


export const Iframe = Node.create({
  name: 'iframe',
  group: 'block',
  selectable: true,

  addOptions() {
    return {
      allowFullscreen: true,
      HTMLAttributes: {
        class: 'w-full aspect-video rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-800 my-4 shadow-sm',
      },
    };
  },

  addAttributes() {
    return {
      src: {
        default: null,
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'iframe',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', this.options.HTMLAttributes, ['iframe', mergeAttributes(HTMLAttributes, {
      frameborder: '0',
      allowfullscreen: this.options.allowFullscreen ? 'true' : 'false',
    })]];
  },
  
  addCommands() {
    return {
      setIframe: (options: { src: string }) => ({ commands }: any) => {
        return commands.insertContent({
          type: this.name,
          attrs: options,
        });
      },
    }
  },
});

export function getEmbedUrl(url: string) {
  if (url.includes('youtube.com/watch?v=') || url.includes('youtu.be/')) {
    const videoId = url.split('v=')[1] || url.split('youtu.be/')[1] || '';
    const ampersandPosition = videoId.indexOf('&');
    const finalId = ampersandPosition !== -1 ? videoId.substring(0, ampersandPosition) : videoId;
    return `https://www.youtube.com/embed/${finalId}`;
  }
  if (url.includes('loom.com/share/')) {
    const videoId = url.split('share/')[1];
    return `https://www.loom.com/embed/${videoId}`;
  }
  return url;
}
