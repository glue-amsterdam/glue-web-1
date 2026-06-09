"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { useAutosave } from "@/hooks/useAutosave";
import { PostRichTextEditor } from "./post-rich-text-editor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import type { PostWithMedia } from "@/schemas/postSchema";

type PostEditorFormProps = {
  initialData: PostWithMedia;
};

type EditorFormState = {
  title: string;
  author: string;
  keywords: string[];
  content_html: string;
};

type SaveStatus = "idle" | "saving" | "saved" | "error";

const parseKeywordsInput = (value: string): string[] => {
  return value
    .split(",")
    .map((keyword) => keyword.trim())
    .filter(Boolean);
};

const PostEditorForm = ({ initialData }: PostEditorFormProps) => {
  const router = useRouter();
  const { toast } = useToast();
  const [title, setTitle] = useState(initialData.title);
  const [author, setAuthor] = useState(initialData.author ?? "");
  const [keywordsInput, setKeywordsInput] = useState(
    initialData.keywords.join(", ")
  );
  const [contentHtml, setContentHtml] = useState(initialData.content_html);
  const [status, setStatus] = useState(initialData.status);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const [savedAt, setSavedAt] = useState<Date | null>(null);
  const [isPublishing, setIsPublishing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    setTitle(initialData.title);
    setAuthor(initialData.author ?? "");
    setKeywordsInput(initialData.keywords.join(", "));
    setContentHtml(initialData.content_html);
    setStatus(initialData.status);
  }, [initialData]);

  const formState = useMemo<EditorFormState>(
    () => ({
      title,
      author,
      keywords: parseKeywordsInput(keywordsInput),
      content_html: contentHtml,
    }),
    [title, author, keywordsInput, contentHtml]
  );

  const [savedBaseline, setSavedBaseline] = useState(() =>
    JSON.stringify({
      title: initialData.title,
      author: initialData.author ?? "",
      keywords: initialData.keywords,
      content_html: initialData.content_html,
    })
  );

  useEffect(() => {
    setSavedBaseline(
      JSON.stringify({
        title: initialData.title,
        author: initialData.author ?? "",
        keywords: initialData.keywords,
        content_html: initialData.content_html,
      })
    );
  }, [initialData]);

  const isDirty = useMemo(() => {
    return JSON.stringify(formState) !== savedBaseline;
  }, [formState, savedBaseline]);

  const patchPost = useCallback(
    async (payload: Record<string, unknown>) => {
      const response = await fetch(`/api/admin/posts/${initialData.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || "Failed to save post");
      }

      return response.json();
    },
    [initialData.id]
  );

  const handleAutosave = useCallback(
    async (data: EditorFormState) => {
      await patchPost({
        title: data.title,
        author: data.author.trim() ? data.author.trim() : null,
        keywords: data.keywords,
        content_html: data.content_html,
        status: "draft",
      });
      setStatus("draft");
      setSavedBaseline(JSON.stringify(data));
    },
    [patchPost]
  );

  const { markSaved } = useAutosave({
    data: formState,
    isDirty,
    intervalMs: 15000,
    enabled: true,
    onSave: handleAutosave,
    onStatusChange: (nextStatus, nextSavedAt) => {
      setSaveStatus(nextStatus);
      setSavedAt(nextSavedAt);
    },
  });

  const handlePublish = async () => {
    if (!title.trim()) {
      toast({
        title: "Title required",
        description: "Please add a title before publishing.",
        variant: "destructive",
      });
      return;
    }

    setIsPublishing(true);
    setSaveStatus("saving");

    try {
      await patchPost({
        title: title.trim(),
        author: author.trim() ? author.trim() : null,
        keywords: parseKeywordsInput(keywordsInput),
        content_html: contentHtml,
        status: "published",
      });
      const publishedState = {
        title: title.trim(),
        author: author.trim(),
        keywords: parseKeywordsInput(keywordsInput),
        content_html: contentHtml,
      };
      setStatus("published");
      setSaveStatus("saved");
      setSavedAt(new Date());
      setSavedBaseline(JSON.stringify(publishedState));
      markSaved(publishedState);
      toast({
        title: "Published",
        description: "The post is now published.",
      });
      router.refresh();
    } catch (error) {
      setSaveStatus("error");
      toast({
        title: "Publish failed",
        description:
          error instanceof Error ? error.message : "Could not publish post.",
        variant: "destructive",
      });
    } finally {
      setIsPublishing(false);
    }
  };

  const handleDelete = async () => {
    const confirmed = window.confirm(
      "Delete this post? This action cannot be undone."
    );
    if (!confirmed) return;

    setIsDeleting(true);

    try {
      const response = await fetch(`/api/admin/posts/${initialData.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || "Failed to delete post");
      }

      toast({
        title: "Post deleted",
        description: "The post was removed successfully.",
      });
      router.push("/admin/posts");
      router.refresh();
    } catch (error) {
      toast({
        title: "Delete failed",
        description:
          error instanceof Error ? error.message : "Could not delete post.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const saveStatusLabel = () => {
    if (saveStatus === "saving") return "Saving…";
    if (saveStatus === "error") return "Save error";
    if (saveStatus === "saved" && savedAt) {
      return `Saved at ${format(savedAt, "HH:mm")}`;
    }
    if (isDirty) return "Unsaved changes";
    return "All changes saved";
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant={status === "published" ? "default" : "secondary"}>
            {status}
          </Badge>
          <span className="text-sm text-muted-foreground" aria-live="polite">
            {saveStatusLabel()}
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button type="button" variant="outline" asChild>
            <Link href="/admin/posts">Back to list</Link>
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleDelete}
            disabled={isDeleting || isPublishing}
          >
            {isDeleting ? "Deleting…" : "Delete"}
          </Button>
          <Button
            type="button"
            onClick={handlePublish}
            disabled={isPublishing || isDeleting}
          >
            {isPublishing ? "Publishing…" : "Publish"}
          </Button>
        </div>
      </div>

      <div className="grid gap-4">
        <div className="grid gap-2">
          <Label htmlFor="post-title">Title</Label>
          <Input
            id="post-title"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Post title"
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="post-author">Author (optional)</Label>
          <Input
            id="post-author"
            value={author}
            onChange={(event) => setAuthor(event.target.value)}
            placeholder="Leave empty for institutional posts"
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="post-keywords">Keywords (comma-separated)</Label>
          <Input
            id="post-keywords"
            value={keywordsInput}
            onChange={(event) => setKeywordsInput(event.target.value)}
            placeholder="design, milan, glue"
          />
        </div>

        <div className="grid gap-2">
          <Label>Content</Label>
          <PostRichTextEditor value={contentHtml} onChange={setContentHtml} />
        </div>
      </div>
    </div>
  );
};

export default PostEditorForm;
