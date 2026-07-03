import { cn } from "@/lib/utils";
import { sanitizeHtml } from "@/lib/sanitize-html";
import {
  splitHtmlIntoGridItems,
  type HtmlGridSplitStrategy,
} from "@/lib/html/split-html-grid-items";

type Props = {
  html: string;
  splitStrategy?: HtmlGridSplitStrategy;
  className?: string;
  itemClassName?: string;
};

const SanitizedHtmlGrid = ({
  html,
  splitStrategy = "auto",
  className,
  itemClassName,
}: Props) => {
  const items = splitHtmlIntoGridItems(html, splitStrategy);

  if (items.length === 0) {
    return null;
  }

  if (items.length === 1) {
    return (
      <div
        className={cn("post-content post-content-tight", className, itemClassName)}
        dangerouslySetInnerHTML={{ __html: sanitizeHtml(items[0]) }}
      />
    );
  }

  return (
    <div
      className={cn(
        "grid grid-cols-1 lg:grid-cols-2 gap-x-[30px] gap-y-[40px] lg:gap-y-[100px]",
        className
      )}
    >
      {items.map((item, index) => (
        <div
          key={index}
          className={cn("post-content post-content-tight versal-body-text", itemClassName)}
          dangerouslySetInnerHTML={{ __html: sanitizeHtml(item) }}
        />
      ))}
    </div>
  );
};

export default SanitizedHtmlGrid;
