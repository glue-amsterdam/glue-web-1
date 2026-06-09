import { sanitizePostHtml } from "@/lib/sanitize-html";
import { normalizePostImagesForDisplay } from "@/lib/posts/normalize-post-html";

type PostContentProps = {
  html: string;
};

const PostContent = ({ html }: PostContentProps) => {
  const sanitizedHtml = normalizePostImagesForDisplay(sanitizePostHtml(html));

  if (!sanitizedHtml) {
    return null;
  }

  return (
    <div
      className="post-content base-text-size pt-[40px]"
      dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
    />
  );
};

export default PostContent;
