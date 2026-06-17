import { Node, mergeAttributes } from "@tiptap/core";

export type VideoOptions = {
  HTMLAttributes: Record<string, unknown>;
};

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    video: {
      setVideo: (options: {
        src: string;
        style?: string;
        controls?: boolean;
      }) => ReturnType;
    };
  }
}

export const Video = Node.create<VideoOptions>({
  name: "video",
  group: "block",
  atom: true,
  selectable: true,
  draggable: true,

  addOptions() {
    return {
      HTMLAttributes: {},
    };
  },

  addAttributes() {
    return {
      src: {
        default: null,
      },
      controls: {
        default: true,
        parseHTML: () => true,
        renderHTML: (attributes) =>
          attributes.controls ? { controls: "controls" } : {},
      },
      style: {
        default: "max-width: 100%; height: auto;",
      },
    };
  },

  parseHTML() {
    return [{ tag: "video[src]" }];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "video",
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes),
    ];
  },

  addCommands() {
    return {
      setVideo:
        (options) =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            attrs: options,
          });
        },
    };
  },
});
