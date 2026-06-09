"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import TextAlign from "@tiptap/extension-text-align";
import {
  PostImage,
  type PostImageAlign,
  type PostImageAttributes,
} from "@/app/components/tiptap-post-image";
import type { Editor } from "@tiptap/react";
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  Bold,
  Heading1,
  Heading2,
  Heading3,
  ImageIcon,
  Italic,
  LinkIcon,
  List,
  ListOrdered,
  Redo,
  Settings2,
  Undo,
  VideoIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Video } from "@/app/components/tiptap-video";
import { config } from "@/config";
import {
  createUploadProgressHandler,
  ImageUploadOverlay,
  type UploadState,
} from "@/components/image-upload-overlay";
import {
  uploadImage,
  uploadVideo,
} from "@/utils/supabase/storage/client";
import { validateVideoFile } from "@/utils/supabase/storage/media-helpers";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export const IMAGE_SIZE_PRESETS = [
  { label: "Small", value: "400px" },
  { label: "Medium", value: "600px" },
  { label: "Large", value: "800px" },
  { label: "Full width", value: "100%" },
] as const;

type ImageSizePreset = (typeof IMAGE_SIZE_PRESETS)[number]["value"];

type ImageDialogMode = "new" | "edit";

type ImageDialogState = {
  mode: ImageDialogMode;
  src: string;
  maxWidth: ImageSizePreset;
  href: string;
  align: PostImageAlign;
};

type PostRichTextEditorProps = {
  value: string;
  onChange: (content: string) => void;
  readOnly?: boolean;
};

const getActiveAlign = (editor: Editor): PostImageAlign => {
  if (editor.isActive("image")) {
    return (editor.getAttributes("image").align as PostImageAlign) ?? "left";
  }
  if (editor.isActive({ textAlign: "center" })) return "center";
  if (editor.isActive({ textAlign: "right" })) return "right";
  return "left";
};

const MenuBar = ({
  editor,
  onImageClick,
  onVideoClick,
  onOpenImageSettings,
  disabled,
}: {
  editor: Editor | null;
  onImageClick: () => void;
  onVideoClick: () => void;
  onOpenImageSettings: () => void;
  disabled?: boolean;
}) => {
  if (!editor) {
    return null;
  }

  const isImageActive = editor.isActive("image");
  const activeAlign = getActiveAlign(editor);

  const handleLinkClick = () => {
    if (isImageActive) {
      const previousUrl = editor.getAttributes("image").href ?? "";
      const url = window.prompt("Enter image link URL", previousUrl);

      if (url === null) {
        return;
      }

      editor
        .chain()
        .focus()
        .updatePostImageAttributes({ href: url.trim() || null })
        .run();
      return;
    }

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
        editor.chain().focus().setLink({ href: url }).run();
      } else {
        editor
          .chain()
          .focus()
          .insertContent(`<a href="${url}">${url}</a>`)
          .run();
      }
    }
  };

  const handleHeading = (level: 1 | 2 | 3) => {
    editor.chain().focus().toggleHeading({ level }).run();
  };

  const handleAlign = (align: PostImageAlign) => {
    if (isImageActive) {
      editor.chain().focus().updatePostImageAttributes({ align }).run();
      return;
    }

    editor.chain().focus().setTextAlign(align).run();
  };

  return (
    <div className="bg-gray flex flex-wrap gap-1 border-b pb-2">
      <Button
        type="button"
        variant="ghost"
        size="icon"
        disabled={disabled}
        onClick={() => handleHeading(1)}
        className={cn(
          "text-black hover:bg-uiblack/30",
          editor.isActive("heading", { level: 1 }) && "bg-uiblack/20"
        )}
        aria-label="Heading 1"
      >
        <Heading1 className="h-4 w-4" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        disabled={disabled}
        onClick={() => handleHeading(2)}
        className={cn(
          "text-black hover:bg-uiblack/30",
          editor.isActive("heading", { level: 2 }) && "bg-uiblack/20"
        )}
        aria-label="Heading 2"
      >
        <Heading2 className="h-4 w-4" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        disabled={disabled}
        onClick={() => handleHeading(3)}
        className={cn(
          "text-black hover:bg-uiblack/30",
          editor.isActive("heading", { level: 3 }) && "bg-uiblack/20"
        )}
        aria-label="Heading 3"
      >
        <Heading3 className="h-4 w-4" />
      </Button>

      <Separator orientation="vertical" className="mx-1 h-6 bg-uiblack/30" />

      <Button
        type="button"
        variant="ghost"
        size="icon"
        disabled={disabled}
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={cn(
          "text-black hover:bg-uiblack/30",
          editor.isActive("bold") && "bg-uiblack/20"
        )}
        aria-label="Bold"
      >
        <Bold className="h-4 w-4" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        disabled={disabled}
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={cn(
          "text-black hover:bg-uiblack/30",
          editor.isActive("italic") && "bg-uiblack/20"
        )}
        aria-label="Italic"
      >
        <Italic className="h-4 w-4" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        disabled={disabled}
        onClick={handleLinkClick}
        className={cn(
          "text-black hover:bg-uiblack/30",
          (editor.isActive("link") || (isImageActive && editor.getAttributes("image").href)) &&
            "bg-uiblack/20"
        )}
        aria-label={isImageActive ? "Image link" : "Insert link"}
      >
        <LinkIcon className="h-4 w-4" />
      </Button>

      <Separator orientation="vertical" className="mx-1 h-6 bg-uiblack/30" />

      <Button
        type="button"
        variant="ghost"
        size="icon"
        disabled={disabled}
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={cn(
          "text-black hover:bg-uiblack/30",
          editor.isActive("bulletList") && "bg-uiblack/20"
        )}
        aria-label="Bullet list"
      >
        <List className="h-4 w-4" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        disabled={disabled}
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={cn(
          "text-black hover:bg-uiblack/30",
          editor.isActive("orderedList") && "bg-uiblack/20"
        )}
        aria-label="Ordered list"
      >
        <ListOrdered className="h-4 w-4" />
      </Button>

      <Separator orientation="vertical" className="mx-1 h-6 bg-uiblack/30" />

      <Button
        type="button"
        variant="ghost"
        size="icon"
        disabled={disabled}
        onClick={() => handleAlign("left")}
        className={cn(
          "text-black hover:bg-uiblack/30",
          activeAlign === "left" && "bg-uiblack/20"
        )}
        aria-label="Align left"
      >
        <AlignLeft className="h-4 w-4" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        disabled={disabled}
        onClick={() => handleAlign("center")}
        className={cn(
          "text-black hover:bg-uiblack/30",
          activeAlign === "center" && "bg-uiblack/20"
        )}
        aria-label="Align center"
      >
        <AlignCenter className="h-4 w-4" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        disabled={disabled}
        onClick={() => handleAlign("right")}
        className={cn(
          "text-black hover:bg-uiblack/30",
          activeAlign === "right" && "bg-uiblack/20"
        )}
        aria-label="Align right"
      >
        <AlignRight className="h-4 w-4" />
      </Button>

      <Separator orientation="vertical" className="mx-1 h-6 bg-uiblack/30" />

      <Button
        type="button"
        variant="ghost"
        size="icon"
        disabled={disabled}
        onClick={onImageClick}
        aria-label="Insert image"
        className="text-black hover:bg-uiblack/30"
      >
        <ImageIcon className="h-4 w-4" />
      </Button>
      {isImageActive ? (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          disabled={disabled}
          onClick={onOpenImageSettings}
          aria-label="Image settings"
          className="text-black hover:bg-uiblack/30"
        >
          <Settings2 className="h-4 w-4" />
        </Button>
      ) : null}
      <Button
        type="button"
        variant="ghost"
        size="icon"
        disabled={disabled}
        onClick={onVideoClick}
        aria-label="Insert video"
        className="text-black hover:bg-uiblack/30"
      >
        <VideoIcon className="h-4 w-4" />
      </Button>

      <Separator orientation="vertical" className="mx-1 h-6 bg-uiblack/30" />

      <Button
        type="button"
        variant="ghost"
        size="icon"
        disabled={disabled || !editor.can().chain().focus().undo().run()}
        onClick={() => editor.chain().focus().undo().run()}
        aria-label="Undo"
        className="text-black hover:bg-uiblack/30"
      >
        <Undo className="h-4 w-4" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        disabled={disabled || !editor.can().chain().focus().redo().run()}
        onClick={() => editor.chain().focus().redo().run()}
        aria-label="Redo"
        className="text-black hover:bg-uiblack/30"
      >
        <Redo className="h-4 w-4" />
      </Button>
    </div>
  );
};

export const PostRichTextEditor = ({
  value,
  onChange,
  readOnly = false,
}: PostRichTextEditorProps) => {
  const [isMounted, setIsMounted] = useState(false);
  const [uploadState, setUploadState] = useState<UploadState | null>(null);
  const [isImageDialogOpen, setIsImageDialogOpen] = useState(false);
  const [imageDialog, setImageDialog] = useState<ImageDialogState | null>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const openImageDialog = useCallback((state: ImageDialogState) => {
    setImageDialog(state);
    setIsImageDialogOpen(true);
  }, []);

  const openEditImageDialog = useCallback(
    (attrs: PostImageAttributes) => {
      openImageDialog({
        mode: "edit",
        src: attrs.src,
        maxWidth: (attrs.maxWidth as ImageSizePreset) ?? "600px",
        href: attrs.href ?? "",
        align: attrs.align ?? "left",
      });
    },
    [openImageDialog]
  );

  const editImageRef = useRef(openEditImageDialog);
  editImageRef.current = openEditImageDialog;

  const editor = useEditor({
    immediatelyRender: false,
    editable: !readOnly,
    extensions: [
      StarterKit,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-blue-500 underline cursor-pointer",
        },
      }),
      TextAlign.configure({
        types: ["heading", "paragraph"],
        alignments: ["left", "center", "right"],
      }),
      PostImage.configure({
        inline: false,
        allowBase64: false,
        onEditImage: (attrs) => editImageRef.current(attrs),
      }),
      Video,
    ],
    content: value,
    onUpdate: ({ editor: currentEditor }) => {
      onChange(currentEditor.getHTML());
    },
    editorProps: {
      attributes: {
        class:
          "min-h-[300px] max-h-[60dvh] overflow-y-auto bg-white text-black w-full p-4 focus:outline-none prose prose-sm max-w-none [&_a]:text-blue-500 [&_a]:underline [&_a]:cursor-pointer [&_video]:h-auto",
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

  useEffect(() => {
    if (editor) {
      editor.setEditable(!readOnly && !uploadState);
    }
  }, [editor, readOnly, uploadState]);

  const insertImage = useCallback(
    (attrs: {
      src: string;
      maxWidth: ImageSizePreset;
      align: PostImageAlign;
      href: string;
    }) => {
      if (!editor) return;

      editor
        .chain()
        .focus()
        .insertPostImage({
          src: attrs.src,
          maxWidth: attrs.maxWidth,
          align: attrs.align,
          href: attrs.href.trim() || null,
        })
        .run();
    },
    [editor]
  );

  const updateSelectedImage = useCallback(
    (attrs: {
      maxWidth: ImageSizePreset;
      align: PostImageAlign;
      href: string;
    }) => {
      if (!editor) return;

      editor
        .chain()
        .focus()
        .updatePostImageAttributes({
          maxWidth: attrs.maxWidth,
          align: attrs.align,
          href: attrs.href.trim() || null,
        })
        .run();
    },
    [editor]
  );

  const handleImageFile = useCallback(
    async (file: File) => {
      if (!editor) return;

      setUploadState({ stage: "uploading", progress: 5 });

      const { imageUrl, error } = await uploadImage({
        file,
        bucket: config.bucketName,
        folder: "posts/images",
        maxSizeMB: 3,
        maxWidthOrHeight: 1920,
        onProgress: createUploadProgressHandler(setUploadState),
      });

      setUploadState(null);

      if (error || !imageUrl) {
        toast({
          title: "Image upload failed",
          description: error || "Could not upload image.",
          variant: "destructive",
        });
        return;
      }

      openImageDialog({
        mode: "new",
        src: imageUrl,
        maxWidth: "600px",
        href: "",
        align: "left",
      });
    },
    [editor, toast, openImageDialog]
  );

  const handleVideoFile = useCallback(
    async (file: File) => {
      if (!editor) return;

      const isValid = validateVideoFile(file, {
        onInvalidType: () =>
          toast({
            title: "Invalid file",
            description: "Please select a video file (.mp4, .webm, or .mov).",
            variant: "destructive",
          }),
        onTooLarge: () =>
          toast({
            title: "Video too large",
            description: "Video must be 10 MB or smaller.",
            variant: "destructive",
          }),
      });

      if (!isValid) return;

      setUploadState({ stage: "uploading", progress: 10 });

      const { videoUrl, error } = await uploadVideo({
        file,
        bucket: config.bucketName,
        folder: "posts/videos",
        onProgress: (progress) => {
          setUploadState({ stage: "uploading", progress });
        },
      });

      setUploadState(null);

      if (error || !videoUrl) {
        toast({
          title: "Video upload failed",
          description: error || "Could not upload video.",
          variant: "destructive",
        });
        return;
      }

      editor
        .chain()
        .focus()
        .setVideo({
          src: videoUrl,
          style: "max-width: 100%; height: auto;",
          controls: true,
        })
        .run();
    },
    [editor, toast]
  );

  const handleImageInputChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    void handleImageFile(file);
  };

  const handleVideoInputChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    void handleVideoFile(file);
  };

  const handleImageClick = () => {
    imageInputRef.current?.click();
  };

  const handleVideoClick = () => {
    videoInputRef.current?.click();
  };

  const handleOpenImageSettings = () => {
    if (!editor?.isActive("image")) return;

    const attrs = editor.getAttributes("image");
    openEditImageDialog({
      src: attrs.src,
      maxWidth: attrs.maxWidth,
      align: attrs.align,
      href: attrs.href,
    });
  };

  const handleImageDialogApply = () => {
    if (!imageDialog || !editor) return;

    if (imageDialog.mode === "new") {
      insertImage({
        src: imageDialog.src,
        maxWidth: imageDialog.maxWidth,
        align: imageDialog.align,
        href: imageDialog.href,
      });
    } else {
      updateSelectedImage({
        maxWidth: imageDialog.maxWidth,
        align: imageDialog.align,
        href: imageDialog.href,
      });
    }

    setIsImageDialogOpen(false);
    setImageDialog(null);
  };

  const handleRemoveImageLink = () => {
    if (!editor?.isActive("image")) return;
    editor.chain().focus().updatePostImageAttributes({ href: null }).run();
    setImageDialog((current) => (current ? { ...current, href: "" } : null));
  };

  const handleDeleteImage = () => {
    if (!editor) return;
    editor.chain().focus().removePostImage().run();
    setIsImageDialogOpen(false);
    setImageDialog(null);
  };

  const handleImageDialogClose = (open: boolean) => {
    setIsImageDialogOpen(open);
    if (!open) {
      setImageDialog(null);
    }
  };

  if (!isMounted) {
    return null;
  }

  return (
    <>
      <div className="relative overflow-hidden rounded-md border">
        {uploadState ? (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-white/70">
            <div className="relative h-24 w-full max-w-sm">
              <ImageUploadOverlay
                stage={uploadState.stage}
                progress={uploadState.progress}
              />
            </div>
          </div>
        ) : null}

        {editor && !readOnly ? (
          <MenuBar
            editor={editor}
            onImageClick={handleImageClick}
            onVideoClick={handleVideoClick}
            onOpenImageSettings={handleOpenImageSettings}
            disabled={Boolean(uploadState)}
          />
        ) : null}

        <EditorContent editor={editor} />

        <input
          ref={imageInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          aria-hidden="true"
          tabIndex={-1}
          onChange={handleImageInputChange}
        />
        <input
          ref={videoInputRef}
          type="file"
          accept="video/mp4,video/webm,video/quicktime,.mp4,.webm,.mov"
          className="hidden"
          aria-hidden="true"
          tabIndex={-1}
          onChange={handleVideoInputChange}
        />
      </div>

      <Dialog open={isImageDialogOpen} onOpenChange={handleImageDialogClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {imageDialog?.mode === "edit" ? "Image settings" : "Insert image"}
            </DialogTitle>
          </DialogHeader>

          {imageDialog ? (
            <div className="space-y-4">
              {imageDialog.mode === "new" ? (
                <div className="overflow-hidden rounded-md border">
                  <img
                    src={imageDialog.src}
                    alt="Preview"
                    className="mx-auto max-h-40 w-auto object-contain"
                  />
                </div>
              ) : null}

              <div className="space-y-2">
                <Label>Size</Label>
                <div className="grid grid-cols-2 gap-2">
                  {IMAGE_SIZE_PRESETS.map((preset) => (
                    <Button
                      key={preset.value}
                      type="button"
                      variant={
                        imageDialog.maxWidth === preset.value
                          ? "default"
                          : "outline"
                      }
                      onClick={() =>
                        setImageDialog((current) =>
                          current
                            ? { ...current, maxWidth: preset.value }
                            : current
                        )
                      }
                    >
                      {preset.label}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Alignment</Label>
                <div className="flex gap-2">
                  {(["left", "center", "right"] as const).map((align) => (
                    <Button
                      key={align}
                      type="button"
                      variant={
                        imageDialog.align === align ? "default" : "outline"
                      }
                      onClick={() =>
                        setImageDialog((current) =>
                          current ? { ...current, align } : current
                        )
                      }
                      className="flex-1 capitalize"
                    >
                      {align}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="image-link-url">Link URL (optional)</Label>
                <Input
                  id="image-link-url"
                  value={imageDialog.href}
                  onChange={(event) =>
                    setImageDialog((current) =>
                      current
                        ? { ...current, href: event.target.value }
                        : current
                    )
                  }
                  placeholder="https://example.com"
                />
              </div>
            </div>
          ) : null}

          <DialogFooter className="flex-wrap gap-2 sm:justify-between">
            <div className="flex flex-wrap gap-2">
              {imageDialog?.mode === "edit" ? (
                <>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleRemoveImageLink}
                    disabled={!imageDialog.href}
                  >
                    Remove link
                  </Button>
                  <Button
                    type="button"
                    variant="destructive"
                    onClick={handleDeleteImage}
                  >
                    Delete image
                  </Button>
                </>
              ) : null}
            </div>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => handleImageDialogClose(false)}
              >
                Cancel
              </Button>
              <Button type="button" onClick={handleImageDialogApply}>
                Apply
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
