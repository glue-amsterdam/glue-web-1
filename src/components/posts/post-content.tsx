import { sanitizePostHtml } from "@/lib/sanitize-html";
import { normalizePostImagesForDisplay } from "@/lib/posts/normalize-post-html";

type PostContentProps = {
  html: string;
};

const PostContent = ({ html }: PostContentProps) => {
  const sanitizedHtml = sanitizePostHtml(normalizePostImagesForDisplay(html));

  if (!sanitizedHtml) {
    return null;
  }

  return (
    <div
      className="post-content body-text pt-[40px] [&_img]:block [&_img]:h-auto [&_img]:w-auto [&_img]:max-w-full [&_img]:object-contain [&_img]:!max-h-[340px] lg:[&_img]:!max-h-[674px]"
      dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
    />
  );
};

export default PostContent;
