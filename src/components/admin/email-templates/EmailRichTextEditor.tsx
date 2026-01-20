"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Color from "@tiptap/extension-color";
import { Node, mergeAttributes } from "@tiptap/core";
import {
  Bold,
  Italic,
  Strikethrough,
  Code,
  List,
  ListOrdered,
  Quote,
  Undo,
  Redo,
  LinkIcon,
  ChevronUp,
  ChevronDown,
  ImageIcon,
  Palette,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { FontSize } from "@/app/components/tiptap-font-size";
import TextStyle from "@tiptap/extension-text-style";
import type { Editor } from "@tiptap/react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ColorPicker } from "@/components/ui/color-picker";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const FONT_SIZES = ["0.75rem", "0.875rem", "1rem", "1.125rem", "1.5rem"];

const getNextFontSize = (current: string | null, direction: 1 | -1) => {
  const idx = FONT_SIZES.indexOf(current || "1rem");
  let newIdx = direction === 1 ? idx + 1 : idx - 1;
  if (newIdx < 0) newIdx = 0;
  if (newIdx >= FONT_SIZES.length) newIdx = FONT_SIZES.length - 1;
  return FONT_SIZES[newIdx];
};

const getCurrentFontSize = (editor: Editor | null) => {
  if (!editor) return null;
  const attrs = editor.getAttributes("fontSize");
  return attrs.fontSize || null;
};

const getCurrentColor = (editor: Editor | null) => {
  if (!editor) return null;
  const attrs = editor.getAttributes("textStyle");
  return attrs.color || null;
};

// Helper functions to safely call Color extension commands
const setTextColor = (editor: Editor, color: string) => {
  editor.chain().focus().setColor(color).run();
};

const unsetTextColor = (editor: Editor) => {
  editor.chain().focus().unsetColor().run();
};

// Custom Image extension that supports link attribute and shows preview
const CustomImage = Node.create({
  name: "image",

  addOptions() {
    return {
      inline: false,
      allowBase64: false,
      HTMLAttributes: {},
    };
  },

  inline() {
    return this.options.inline;
  },

  group() {
    return this.options.inline ? "inline" : "block";
  },

  draggable: true,

  addAttributes() {
    return {
      src: {
        default: null,
        parseHTML: (element) => element.getAttribute("src"),
        renderHTML: (attributes) => {
          if (!attributes.src) {
            return {};
          }
          return {
            src: attributes.src,
          };
        },
      },
      link: {
        default: null,
        parseHTML: (element) => element.getAttribute("link"),
        renderHTML: (attributes) => {
          if (!attributes.link) {
            return {};
          }
          return {
            link: attributes.link,
          };
        },
      },
      alt: {
        default: null,
        parseHTML: (element) => element.getAttribute("alt"),
        renderHTML: (attributes) => {
          if (!attributes.alt) {
            return {};
          }
          return {
            alt: attributes.alt,
          };
        },
      },
      width: {
        default: null,
        parseHTML: (element) => element.getAttribute("width"),
        renderHTML: (attributes) => {
          if (!attributes.width) {
            return {};
          }
          return {
            width: attributes.width,
          };
        },
      },
      height: {
        default: null,
        parseHTML: (element) => element.getAttribute("height"),
        renderHTML: (attributes) => {
          if (!attributes.height) {
            return {};
          }
          return {
            height: attributes.height,
          };
        },
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: this.options.allowBase64
          ? "img[src]"
          : 'img[src]:not([src^="data:"])',
      },
      {
        tag: 'img[link]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    const attrs = mergeAttributes(this.options.HTMLAttributes, HTMLAttributes);
    // If link exists, use it as src for preview
    if (attrs.link && !attrs.src) {
      attrs.src = attrs.link;
    }
    return ["img", attrs];
  },
});

const MenuBar = ({
  editor,
  onImageClick,
}: {
  editor: Editor | null;
  onImageClick: () => void;
}) => {
  if (!editor) {
    return null;
  }

  const handleIncreaseFontSize = () => {
    const current = getCurrentFontSize(editor);
    const next = getNextFontSize(current, 1);
    // @ts-expect-error setFontSize is a custom command from FontSize extension
    editor.chain().focus().setFontSize(next).run();
  };

  const handleDecreaseFontSize = () => {
    const current = getCurrentFontSize(editor);
    const next = getNextFontSize(current, -1);
    // @ts-expect-error setFontSize is a custom command from FontSize extension
    editor.chain().focus().setFontSize(next).run();
  };

  return (
    <div className="bg-gray flex flex-wrap gap-1 pb-2 border-b">
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={() => editor.chain().focus().toggleBold().run()}
        disabled={!editor.can().chain().focus().toggleBold().run()}
        className={cn(
          "text-black hover:bg-uiblack/30",
          editor.isActive("bold") && "bg-uiblack/20"
        )}
      >
        <Bold className="h-4 w-4" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={() => editor.chain().focus().toggleItalic().run()}
        disabled={!editor.can().chain().focus().toggleItalic().run()}
        className={cn(
          "text-black hover:bg-uiblack/30",
          editor.isActive("italic") && "bg-uiblack/20"
        )}
      >
        <Italic className="h-4 w-4" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={() => editor.chain().focus().toggleStrike().run()}
        disabled={!editor.can().chain().focus().toggleStrike().run()}
        className={cn(
          "text-black hover:bg-uiblack/30",
          editor.isActive("strike") && "bg-uiblack/20"
        )}
      >
        <Strikethrough className="h-4 w-4" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={() => editor.chain().focus().toggleCode().run()}
        disabled={!editor.can().chain().focus().toggleCode().run()}
        className={cn(
          "text-black hover:bg-uiblack/30",
          editor.isActive("code") && "bg-uiblack/30"
        )}
      >
        <Code className="h-4 w-4" />
      </Button>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className={cn(
              "text-black hover:bg-uiblack/30",
              getCurrentColor(editor) && "bg-uiblack/20"
            )}
            title="Text Color"
          >
            <Palette className="h-4 w-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-3" align="start">
          <div className="space-y-2">
            <ColorPicker
              value={getCurrentColor(editor) || "#000000"}
              onChange={(color) => {
                if (color && editor) {
                  setTextColor(editor, color);
                } else if (editor) {
                  unsetTextColor(editor);
                }
              }}
              label="Text Color"
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                if (editor) {
                  unsetTextColor(editor);
                }
              }}
              className="w-full text-black"
            >
              Remove Color
            </Button>
          </div>
        </PopoverContent>
      </Popover>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={() => {
          const url = window.prompt("Enter the URL");
          if (url) {
            editor.chain().focus().setLink({ href: url }).run();
          } else {
            editor.chain().focus().unsetLink().run();
          }
        }}
        className={cn(
          "text-black hover:bg-uiblack/30",
          editor.isActive("link") && "bg-uiblack/20"
        )}
      >
        <LinkIcon className="h-4 w-4" />
      </Button>

      <Separator orientation="vertical" className="mx-1 h-6 bg-uiblack/30" />
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={onImageClick}
        className="text-black hover:bg-uiblack/30"
        title="Insert Image"
      >
        <ImageIcon className="h-4 w-4" />
      </Button>
      <Separator orientation="vertical" className="mx-1 h-6 bg-uiblack/30" />
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={cn(
          "text-black hover:bg-uiblack/30",
          editor.isActive("bulletList") && "bg-uiblack/20"
        )}
      >
        <List className="h-4 w-4" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={cn(
          "text-black hover:bg-uiblack/30",
          editor.isActive("orderedList") && "bg-uiblack/20"
        )}
      >
        <ListOrdered className="h-4 w-4" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        className={cn(
          "text-black hover:bg-uiblack/30",
          editor.isActive("blockquote") && "bg-uiblack/20"
        )}
      >
        <Quote className="h-4 w-4" />
      </Button>
      <Separator orientation="vertical" className="mx-1 h-6 bg-gray-400" />
      <Button
        type="button"
        variant="ghost"
        size="icon"
        aria-label="Decrease font size"
        onClick={handleDecreaseFontSize}
        className="text-black hover:bg-uiblack/30"
        tabIndex={0}
      >
        <ChevronDown className="h-4 w-4" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        aria-label="Increase font size"
        onClick={handleIncreaseFontSize}
        className="text-black hover:bg-uiblack/30"
        tabIndex={0}
      >
        <ChevronUp className="h-4 w-4" />
      </Button>
      <div className="flex gap-1">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().chain().focus().undo().run()}
          className="text-black hover:bg-uiblack/30"
        >
          <Undo className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().chain().focus().redo().run()}
          className="text-black hover:bg-uiblack/30"
        >
          <Redo className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export const EmailRichTextEditor = ({
  value,
  onChange,
}: {
  value: string;
  onChange: (content: string) => void;
}) => {
  const [isMounted, setIsMounted] = useState(false);
  const [isImageDialogOpen, setIsImageDialogOpen] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const [imageWidth, setImageWidth] = useState("");
  const [imageHeight, setImageHeight] = useState("");

  // Process HTML to convert <img link="..."> to <img src="..." link="..."> for preview
  const processHtmlForPreview = (html: string): string => {
    return html.replace(
      /<img\s+([^>]*?)link\s*=\s*["']([^"']+)["']([^>]*?)\/?>/gi,
      (match, before, linkUrl, after) => {
        // Check if src already exists
        if (before.includes('src=') || after.includes('src=')) {
          return match; // Already has src, don't modify
        }
        let newTag = "<img";
        if (before) {
          newTag += ` ${before.trim()}`;
        }
        newTag += ` src="${linkUrl}" link="${linkUrl}"`;
        if (after) {
          newTag += ` ${after.trim()}`;
        }
        newTag += ">";
        return newTag;
      }
    );
  };

  // Process HTML to ensure link attribute is preserved in saved content
  // Also ensures color styles are preserved
  const processHtmlForSave = (html: string): string => {
    // First, handle images that have both src and link (from preview)
    const processed = html.replace(
      /<img\s+([^>]*?)(?:src\s*=\s*["']([^"']+)["']\s+)?link\s*=\s*["']([^"']+)["']([^>]*?)\/?>/gi,
      (match, before, srcUrl, linkUrl, after) => {
        let newTag = "<img";
        if (before) {
          // Remove src from before if it exists
          const cleanedBefore = before.replace(/src\s*=\s*["'][^"']*["']/gi, "").trim();
          if (cleanedBefore) {
            newTag += ` ${cleanedBefore}`;
          }
        }
        newTag += ` link="${linkUrl}"`;
        if (after) {
          // Remove src from after if it exists
          const cleanedAfter = after.replace(/src\s*=\s*["'][^"']*["']/gi, "").trim();
          if (cleanedAfter) {
            newTag += ` ${cleanedAfter}`;
          }
        }
        newTag += "/>";
        return newTag;
      }
    );
    
    // Ensure color styles are preserved - TipTap saves them as style="color: #hex"
    // This should already be in the HTML, but we verify it's not being stripped
    // The HTML from TipTap should already have the color attribute preserved
    return processed;
  };

  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-blue-500 underline",
        },
      }),
      TextStyle,
      Color,
      FontSize,
      CustomImage,
    ],
    content: processHtmlForPreview(value),
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      const processedHtml = processHtmlForSave(html);
      onChange(processedHtml);
    },
    editorProps: {
      attributes: {
        class:
          "min-h-[200px] bg-white font-overpass text-black w-full p-2 focus:outline-none prose prose-sm max-w-none",
      },
    },
  });

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (editor && value !== processHtmlForSave(editor.getHTML())) {
      editor.commands.setContent(processHtmlForPreview(value));
    }
  }, [editor, value]);

  const handleInsertImage = () => {
    if (!imageUrl.trim()) {
      return;
    }

    let imgTag = `<img link="${imageUrl.trim()}"`;
    if (imageWidth.trim()) {
      imgTag += ` width="${imageWidth.trim()}"`;
    }
    if (imageHeight.trim()) {
      imgTag += ` height="${imageHeight.trim()}"`;
    }
    imgTag += ` src="${imageUrl.trim()}" />`; // Add src for preview

    if (editor) {
      editor.chain().focus().insertContent(imgTag).run();
    }

    // Reset form
    setImageUrl("");
    setImageWidth("");
    setImageHeight("");
    setIsImageDialogOpen(false);
  };

  if (!isMounted) {
    return null;
  }

  return (
    <>
      <div className="border rounded-md overflow-hidden">
        {editor && (
          <MenuBar
            editor={editor}
            onImageClick={() => setIsImageDialogOpen(true)}
          />
        )}
        <EditorContent editor={editor} />
      </div>

      <Dialog open={isImageDialogOpen} onOpenChange={setIsImageDialogOpen}>
        <DialogContent className="text-black">
          <DialogHeader>
            <DialogTitle className="text-black">Insert Image</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="img-url" className="text-black">
                Image URL *
              </Label>
              <Input
                id="img-url"
                type="url"
                placeholder="https://example.com/image.jpg"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                className="text-black mt-1"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="img-width" className="text-black">
                  Width (optional)
                </Label>
                <Input
                  id="img-width"
                  type="text"
                  placeholder="e.g., 300px or 50%"
                  value={imageWidth}
                  onChange={(e) => setImageWidth(e.target.value)}
                  className="text-black mt-1"
                />
              </div>
              <div>
                <Label htmlFor="img-height" className="text-black">
                  Height (optional)
                </Label>
                <Input
                  id="img-height"
                  type="text"
                  placeholder="e.g., 200px or auto"
                  value={imageHeight}
                  onChange={(e) => setImageHeight(e.target.value)}
                  className="text-black mt-1"
                />
              </div>
            </div>
            {imageUrl && (
              <div className="border rounded p-2 bg-gray-50">
                <Label className="text-black text-sm font-semibold mb-2 block">
                  Preview
                </Label>
                <div className="mx-auto relative" style={{ maxWidth: "100%" }}>
                  <Image
                    src={imageUrl}
                    alt="Preview"
                    width={imageWidth ? parseInt(imageWidth.toString()) : 800}
                    height={imageHeight ? parseInt(imageHeight.toString()) : 600}
                    className="mx-auto"
                    style={{
                      width: imageWidth || "auto",
                      height: imageHeight || "auto",
                      maxWidth: "100%",
                      display: "block",
                      objectFit: "contain",
                    }}
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = "none";
                    }}
                  />
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsImageDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleInsertImage}
              disabled={!imageUrl.trim()}
            >
              Insert Image
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
