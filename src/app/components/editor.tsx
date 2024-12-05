"use client";

import { useEffect, useState } from "react";
import { useEditor, Editor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
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
  Heading1,
  Heading2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

const MenuBar = ({
  editor,
  showPreview,
  setShowPreview,
}: {
  editor: Editor | null;
  showPreview: boolean;
  setShowPreview: (show: boolean) => void;
}) => {
  if (!editor) return null;

  return (
    <div className="bg-gray flex flex-wrap gap-1 pb-2 bg-gray-200 border-b">
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
      <Separator orientation="vertical" className="mx-1 h-6 bg-gray-400" />
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        className={cn(
          "text-black hover:bg-uiblack/30",
          editor.isActive("heading", { level: 1 }) && "bg-uiblack/30"
        )}
      >
        <Heading1 className="h-4 w-4" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        className={cn(
          "text-black hover:bg-uiblack/30",
          editor.isActive("heading", { level: 2 }) && "bg-uiblack/30"
        )}
      >
        <Heading2 className="h-4 w-4" />
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
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => setShowPreview(!showPreview)}
        className="text-black hover:bg-uiblack/30 ml-auto"
      ></Button>
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
  const [showPreview, setShowPreview] = useState(false);

  const editor = useEditor({
    extensions: [StarterKit],
    immediatelyRender: false,
    content: value,
    onUpdate: ({ editor }) => {
      const content = editor.getHTML();
      onChange(content);
    },
    editorProps: {
      attributes: {
        class:
          "min-h-[200px] bg-white font-overpass text-black w-full p-2 focus:outline-none prose prose-sm sm:prose lg:prose-lg xl:prose-2xl max-w-none",
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
      {editor && (
        <MenuBar
          editor={editor}
          showPreview={showPreview}
          setShowPreview={setShowPreview}
        />
      )}
      {showPreview ? (
        <div
          className="min-h-[200px] bg-white font-overpass text-black w-full p-2 focus:outline-none prose prose-sm sm:prose lg:prose-lg xl:prose-2xl max-w-none"
          dangerouslySetInnerHTML={{ __html: editor?.getHTML() || "" }}
        />
      ) : (
        <EditorContent editor={editor} />
      )}
    </div>
  );
};
