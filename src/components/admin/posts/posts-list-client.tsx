"use client";

import Link from "next/link";
import { format } from "date-fns";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { PostSummary } from "@/schemas/postSchema";

type PostsListClientProps = {
  initialPosts: PostSummary[];
};

const PostsListClient = ({ initialPosts }: PostsListClientProps) => {
  const router = useRouter();

  const handleRefresh = () => {
    router.refresh();
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          {initialPosts.length} post{initialPosts.length === 1 ? "" : "s"}
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

      {initialPosts.length === 0 ? (
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
              {initialPosts.map((post) => (
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
