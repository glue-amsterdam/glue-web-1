"use client";

import { useSanitizedHTML } from "@/app/hooks/useSanitizedHTML";

type TermsContentProps = {
  content: string;
};

export const TermsContent = ({ content }: TermsContentProps) => {
  const sanitizedContent = useSanitizedHTML(content);

  return (
    <div
      className="base-text-size max-w-none"
      dangerouslySetInnerHTML={{
        __html: sanitizedContent || "<p>No terms and conditions available.</p>",
      }}
    />
  );
};
