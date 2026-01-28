"use client";

import { useEffect, useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
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
  ChevronUp,
  ChevronDown,
  LinkIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { FontSize } from "./tiptap-font-size";
import { TextStyle } from "@tiptap/extension-text-style";
import type { Editor } from "@tiptap/react";

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

const MenuBar = ({ editor }: { editor: Editor | null }) => {
  if (!editor) {
    return null;
  }

  const handleIncreaseFontSize = () => {
    const current = getCurrentFontSize(editor);
    const next = getNextFontSize(current, 1);
    editor.chain().focus().setFontSize(next).run();
  };

  const handleDecreaseFontSize = () => {
    const current = getCurrentFontSize(editor);
    const next = getNextFontSize(current, -1);
    editor.chain().focus().setFontSize(next).run();
  };

  const handleLinkClick = () => {
    if (editor.isActive("link")) {
      editor.chain().focus().unsetLink().run();
      return;
    }

    const previousUrl = editor.getAttributes("link").href;
    const url = window.prompt("Enter the URL", previousUrl || "");
    
    if (url) {
      const { from, to } = editor.state.selection;
      const selectedText = editor.state.doc.textBetween(from, to);
      
      if (selectedText) {
        // Text is selected, apply link to selection
        editor.chain().focus().setLink({ href: url }).run();
      } else {
        // No text selected, insert link with URL as text
        editor.chain().focus().insertContent(`<a href="${url}">${url}</a>`).run();
      }
    }
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
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={handleLinkClick}
        className={cn(
          "text-black hover:bg-uiblack/30",
          editor.isActive("link") && "bg-uiblack/20"
        )}
        title="Insert Link"
      >
        <LinkIcon className="h-4 w-4" />
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

export const RichTextEditor = ({
  value,
  onChange,
}: {
  value: string;
  onChange: (content: string) => void;
}) => {
  const [isMounted, setIsMounted] = useState(false);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-blue-500 underline cursor-pointer",
        },
      }),
      TextStyle,
      FontSize,
    ],
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class:
          "min-h-[200px] max-h-[50dvh] lg:max-h-[40dvh] overflow-y-auto bg-white font-overpass text-black w-full p-2 focus:outline-none prose prose-sm max-w-none [&_a]:text-blue-500 [&_a]:underline [&_a]:cursor-pointer",
      },
    },
  });

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value);
    }
  }, [editor, value]);

  if (!isMounted) {
    return null;
  }

  return (
    <div className="border rounded-md overflow-hidden">
      <style dangerouslySetInnerHTML={{
        __html: `
          .ProseMirror a {
            color: #3b82f6 !important;
            text-decoration: underline !important;
            cursor: pointer !important;
          }
          .ProseMirror a:hover {
            color: #2563eb !important;
          }
        `
      }} />
      {editor && <MenuBar editor={editor} />}
      <EditorContent editor={editor} />
    </div>
  );
};
