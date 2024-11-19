"use client";

import { useEffect } from "react";
import { useEditor, EditorContent, Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { BoldIcon, ItalicIcon, StrikethroughIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { MdHorizontalRule } from "react-icons/md";

function MenuBar({ editor }: { editor: Editor | null }) {
  if (!editor) return null;

  return (
    <div className="flex gap-2 pb-2 bg-uiblack h-full">
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBold().run()}
        disabled={!editor.can().chain().focus().toggleBold().run()}
        className={cn(
          "flex gap-2 border-gray border items-center justify-center rounded-lg px-1 py-1",
          editor.isActive("bold") ? "bg-white text-black" : "bg-white/50"
        )}
      >
        <BoldIcon className="size-4" />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleItalic().run()}
        disabled={!editor.can().chain().focus().toggleItalic().run()}
        className={cn(
          "flex gap-2 border-gray border items-center justify-center rounded-lg px-1 py-1",
          editor.isActive("italic") ? "bg-white text-black" : "bg-white/50"
        )}
      >
        <ItalicIcon className="size-4" />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleStrike().run()}
        disabled={!editor.can().chain().focus().toggleStrike().run()}
        className={cn(
          "flex gap-2 border-gray border items-center justify-center rounded-lg px-1 py-1",
          editor.isActive("strike") ? "bg-white text-black" : "bg-white/50"
        )}
      >
        <StrikethroughIcon className="size-4" />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().setHorizontalRule().run()}
        className={cn(
          "flex gap-2 border-gray bg-white/50 text-black border items-center justify-center rounded-lg px-1 py-1"
        )}
      >
        <MdHorizontalRule className="size-4" />
      </button>
    </div>
  );
}

export const RichTextEditor = ({
  value,
  onChange,
}: {
  value: string;
  onChange: (content: string) => void;
}) => {
  const editor = useEditor({
    extensions: [StarterKit],
    content: value,
    onUpdate: ({ editor }) => {
      const content = editor.getHTML();
      onChange(content);
    },
    immediatelyRender: false,
  });

  useEffect(() => {
    if (editor) {
      editor.commands.setContent(value);
    }
  }, [editor, value]);

  return (
    <div className="bg-uiwhite text-black">
      {editor && <MenuBar editor={editor} />}
      <EditorContent className="px-2 py-4 min-h-10" editor={editor} />
    </div>
  );
};
