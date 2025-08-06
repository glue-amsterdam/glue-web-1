import { Mark, mergeAttributes, type RawCommands } from "@tiptap/core";

export interface FontSizeOptions {
  types: string[];
}

export const FontSize = Mark.create<FontSizeOptions>({
  name: "fontSize",

  addOptions() {
    return {
      types: ["textStyle"],
    };
  },

  addAttributes() {
    return {
      fontSize: {
        default: null,
        parseHTML: (element: HTMLElement) => element.style.fontSize || null,
        renderHTML: (attributes: { fontSize?: string }) => {
          if (!attributes.fontSize) {
            return {};
          }
          return {
            style: `font-size: ${attributes.fontSize}`,
          };
        },
      },
    };
  },

  parseHTML() {
    return [
      {
        style: "font-size",
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ["span", mergeAttributes(HTMLAttributes), 0];
  },

  addCommands() {
    return {
      setFontSize:
        (fontSize: string) =>
        ({ commands }: { commands: RawCommands }) => {
          return commands.setMark(this.name, { fontSize });
        },
      unsetFontSize:
        () =>
        ({ commands }: { commands: RawCommands }) => {
          return commands.unsetMark(this.name);
        },
    } as Partial<RawCommands>;
  },
});
