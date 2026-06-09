"use client";

import { useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { PostSummary } from "@/schemas/postSchema";

type PostsListClientProps = {
  initialPosts: PostSummary[];
};

const PostsListClient = ({ initialPosts }: PostsListClientProps) => {
  const { toast } = useToast();
  const [posts, setPosts] = useState(initialPosts);

  const handleRefresh = async () => {
    try {
      const response = await fetch("/api/admin/posts");
      if (!response.ok) {
        throw new Error("Failed to refresh posts");
      }
      const data = await response.json();
      setPosts(data.posts ?? []);
    } catch (error) {
      toast({
        title: "Refresh failed",
        description:
          error instanceof Error ? error.message : "Could not refresh list.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          {posts.length} post{posts.length === 1 ? "" : "s"}
        </p>
        <div className="flex gap-2">
          <Button type="button" variant="outline" onClick={handleRefresh}>
            Refresh
          </Button>
          <Button type="button" asChild>
            <Link href="/admin/posts/new">New post</Link>
          </Button>
        </div>
      </div>

      {posts.length === 0 ? (
        <div className="rounded-md border border-dashed p-8 text-center text-muted-foreground">
          <p>No posts yet. Create your first post to get started.</p>
          <Button type="button" className="mt-4" asChild>
            <Link href="/admin/posts/new">New post</Link>
          </Button>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-md border">
          <table className="w-full min-w-[480px] text-left text-sm">
            <thead className="border-b bg-muted/40">
              <tr>
                <th className="px-4 py-3 font-medium">Title</th>
                <th className="px-4 py-3 font-medium">Created</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {posts.map((post) => (
                <tr key={post.id} className="border-b last:border-b-0">
                  <td className="px-4 py-3 font-medium">{post.title}</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {format(new Date(post.created_at), "dd MMM yyyy, HH:mm")}
                  </td>
                  <td className="px-4 py-3">
                    <Badge
                      variant={
                        post.status === "published" ? "default" : "secondary"
                      }
                    >
                      {post.status}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Button type="button" variant="outline" size="sm" asChild>
                      <Link href={`/admin/posts/${post.id}`}>Edit</Link>
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default PostsListClient;
