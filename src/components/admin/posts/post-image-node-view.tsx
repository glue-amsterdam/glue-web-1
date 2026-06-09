"use client";

import { NodeViewWrapper, type NodeViewProps } from "@tiptap/react";
import type { PostImageAlign } from "@/app/components/tiptap-post-image";
import { getResponsiveImageStyleObject } from "@/lib/posts/normalize-post-html";
import { cn } from "@/lib/utils";

export const PostImageNodeView = ({
  node,
  selected,
  extension,
}: NodeViewProps) => {
  const { src, alt, maxWidth, align, href } = node.attrs as {
    src: string;
    alt?: string;
    maxWidth?: string;
    align?: PostImageAlign;
    href?: string | null;
  };

  const imageAlign = align ?? "left";
  const widthStyle = maxWidth ?? "600px";

  const handleDoubleClick = () => {
    extension.options.onEditImage?.({
      src,
      alt,
      maxWidth: widthStyle,
      align: imageAlign,
      href: href ?? null,
    });
  };

  const imageElement = (
    <img
      src={src}
      alt={alt || ""}
      draggable={false}
      className={cn(
        "post-image rounded-md",
        selected && "ring-2 ring-blue-500 ring-offset-2"
      )}
      style={getResponsiveImageStyleObject(widthStyle)}
      data-align={imageAlign}
    />
  );

  return (
    <NodeViewWrapper
      as="div"
      className={cn("post-image-wrapper my-2", `post-image-wrapper--${imageAlign}`)}
      data-drag-handle
      onDoubleClick={handleDoubleClick}
    >
      {href ? (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(event) => event.preventDefault()}
          className="post-image-link inline-block max-w-full"
          aria-label={alt || "Linked image"}
        >
          {imageElement}
        </a>
      ) : (
        imageElement
      )}
    </NodeViewWrapper>
  );
};
