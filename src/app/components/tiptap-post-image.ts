import Image from "@tiptap/extension-image";
import { mergeAttributes } from "@tiptap/core";
import { ReactNodeViewRenderer } from "@tiptap/react";
import { PostImageNodeView } from "@/components/admin/posts/post-image-node-view";
import { buildResponsiveImageStyle } from "@/lib/posts/normalize-post-html";

export type PostImageAlign = "left" | "center" | "right";

export type PostImageAttributes = {
  src: string;
  alt?: string;
  maxWidth?: string;
  align?: PostImageAlign;
  href?: string | null;
};

export type PostImageOptions = {
  inline: boolean;
  allowBase64: boolean;
  HTMLAttributes: Record<string, unknown>;
  onEditImage?: (attrs: PostImageAttributes) => void;
};

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    postImage: {
      insertPostImage: (attrs: PostImageAttributes) => ReturnType;
      updatePostImageAttributes: (attrs: Partial<PostImageAttributes>) => ReturnType;
      removePostImage: () => ReturnType;
    };
  }
}

const parseAlign = (value: string | null): PostImageAlign => {
  if (value === "center" || value === "right") {
    return value;
  }
  return "left";
};

export const PostImage = Image.extend<PostImageOptions>({
  addOptions() {
    return {
      ...this.parent?.(),
      inline: this.parent?.().inline ?? false,
      allowBase64: this.parent?.().allowBase64 ?? false,
      HTMLAttributes: this.parent?.().HTMLAttributes ?? {},
      onEditImage: undefined,
    };
  },

  addAttributes() {
    return {
      ...this.parent?.(),
      alt: {
        default: "",
        parseHTML: (element) => element.getAttribute("alt") ?? "",
        renderHTML: (attributes) => {
          if (!attributes.alt) {
            return {};
          }
          return { alt: attributes.alt };
        },
      },
      maxWidth: {
        default: "600px",
        parseHTML: (element) => {
          const style = element.getAttribute("style");
          const minMatch = style?.match(/max-width:\s*min\(\s*([^,]+)\s*,/i);
          if (minMatch) {
            return minMatch[1].trim();
          }

          const match = style?.match(/max-width:\s*([^;]+)/i);
          return match ? match[1].trim() : "600px";
        },
      },
      align: {
        default: "left" as PostImageAlign,
        parseHTML: (element) => parseAlign(element.getAttribute("data-align")),
        renderHTML: (attributes) => ({
          "data-align": (attributes.align as PostImageAlign) ?? "left",
        }),
      },
      href: {
        default: null,
        parseHTML: (element) => {
          const parent = element.parentElement;
          if (parent?.tagName === "A") {
            return parent.getAttribute("href");
          }
          return null;
        },
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: "img[src]",
        getAttrs: (element) => {
          if (!(element instanceof HTMLElement)) {
            return false;
          }

          const style = element.getAttribute("style");
          const minMatch = style?.match(/max-width:\s*min\(\s*([^,]+)\s*,/i);
          const maxWidthMatch =
            minMatch ?? style?.match(/max-width:\s*([^;]+)/i);

          return {
            src: element.getAttribute("src"),
            alt: element.getAttribute("alt") ?? "",
            maxWidth: maxWidthMatch ? maxWidthMatch[1].trim() : "600px",
            align: parseAlign(element.getAttribute("data-align")),
            href:
              element.parentElement?.tagName === "A"
                ? element.parentElement.getAttribute("href")
                : null,
          };
        },
      },
    ];
  },

  renderHTML({ node }) {
    const { src, alt, maxWidth, align, href } = node.attrs;
    const imgAttrs = mergeAttributes(this.options.HTMLAttributes, {
      class: "post-image rounded-md",
      "data-align": align as PostImageAlign,
      style: buildResponsiveImageStyle((maxWidth as string) || "600px"),
      src,
      alt: alt || "",
    });

    const img: [string, Record<string, unknown>] = ["img", imgAttrs];

    if (href) {
      return [
        "a",
        {
          href,
          target: "_blank",
          rel: "noopener noreferrer",
          class: "post-image-link",
        },
        img,
      ];
    }

    return img;
  },

  addNodeView() {
    return ReactNodeViewRenderer(PostImageNodeView);
  },

  addCommands() {
    return {
      ...this.parent?.(),
      insertPostImage:
        (attrs) =>
        ({ chain }) => {
          return chain()
            .insertContent({
              type: this.name,
              attrs: {
                src: attrs.src,
                alt: attrs.alt ?? "",
                maxWidth: attrs.maxWidth ?? "600px",
                align: attrs.align ?? "left",
                href: attrs.href ?? null,
              },
            })
            .run();
        },
      updatePostImageAttributes:
        (attrs) =>
        ({ chain }) => {
          return chain().updateAttributes(this.name, attrs).run();
        },
      removePostImage:
        () =>
        ({ chain }) => {
          return chain().deleteSelection().run();
        },
    };
  },
});
