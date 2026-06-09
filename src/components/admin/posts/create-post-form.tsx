"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const CreatePostForm = () => {
  const router = useRouter();
  const { toast } = useToast();
  const [title, setTitle] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      toast({
        title: "Title required",
        description: "Please enter a title before creating the post.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/admin/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: trimmedTitle }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || "Failed to create post");
      }

      const data = await response.json();
      router.push(`/admin/posts/${data.id}`);
      router.refresh();
    } catch (error) {
      toast({
        title: "Could not create post",
        description:
          error instanceof Error ? error.message : "An error occurred.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-lg space-y-6">
      <div className="space-y-2">
        <Label htmlFor="new-post-title">Title</Label>
        <Input
          id="new-post-title"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="Enter the post title"
          autoFocus
          required
          disabled={isSubmitting}
        />
        <p className="text-sm text-muted-foreground">
          The post will be created as a draft. You can edit the content in the
          next step.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button type="submit" disabled={isSubmitting || !title.trim()}>
          {isSubmitting ? "Creating…" : "Create and continue"}
        </Button>
        <Button type="button" variant="outline" asChild disabled={isSubmitting}>
          <Link href="/admin/posts">Cancel</Link>
        </Button>
      </div>
    </form>
  );
};

export default CreatePostForm;
