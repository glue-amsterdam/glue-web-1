import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function PostNotFound() {
  return (
    <div className="space-y-4 border-t pt-8">
      <p className="base-text-size text-muted-foreground">
        This post does not exist or may have been deleted.
      </p>
      <Button type="button" variant="outline" asChild>
        <Link href="/admin/posts">Back to posts</Link>
      </Button>
    </div>
  );
}
