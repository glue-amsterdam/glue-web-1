import { Node, mergeAttributes } from "@tiptap/core";
import { GLUE_GRID_ITEM_HR } from "@/lib/html/split-html-grid-items";

export { GLUE_GRID_ITEM_HR };

export const GridItemBreak = Node.create({
  name: "gridItemBreak",
  group: "block",
  atom: true,
  selectable: true,

  parseHTML() {
    return [{ tag: "hr[data-glue-grid-item]" }];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "hr",
      mergeAttributes(HTMLAttributes, { "data-glue-grid-item": "" }),
    ];
  },

  addCommands() {
    return {
      insertGridItemBreak:
        () =>
        ({ commands }) =>
          commands.insertContent(GLUE_GRID_ITEM_HR),
    };
  },
});

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    gridItemBreak: {
      insertGridItemBreak: () => ReturnType;
    };
  }
}
