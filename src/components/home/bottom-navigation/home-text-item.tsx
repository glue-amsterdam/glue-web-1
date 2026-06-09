import Link from "next/link";

import type { HomeTextItem } from "@/schemas/mainSchema";
import { cn } from "@/lib/utils";

type HomeTextItemProps = {
  item: HomeTextItem;
  className?: string;
  defaultColorClassName?: string;
};

const HomeTextItemDisplay = ({
  item,
  className,
  defaultColorClassName,
}: HomeTextItemProps) => {
  const style = item.color ? { color: item.color } : undefined;
  const mergedClassName = cn(defaultColorClassName, className);

  if (item.href) {
    const isExternal = item.href.startsWith("http");

    if (isExternal) {
      return (
        <a
          href={item.href}
          className={mergedClassName}
          style={style}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={item.label}
        >
          {item.label}
        </a>
      );
    }

    return (
      <Link href={item.href} className={mergedClassName} style={style}>
        {item.label}
      </Link>
    );
  }

  return (
    <p className={mergedClassName} style={style}>
      {item.label}
    </p>
  );
};

export default HomeTextItemDisplay;
