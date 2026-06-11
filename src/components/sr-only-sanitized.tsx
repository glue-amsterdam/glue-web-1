"use client";

import { useSanitizedHTML } from "@/hooks/useSanitizedHTML";

type Props = {
  html: string;
};

const SrOnlySanitized = ({ html }: Props) => {
  const sanitizedContent = useSanitizedHTML(html);

  return (
    <p
      className="sr-only"
      dangerouslySetInnerHTML={{ __html: sanitizedContent }}
    />
  );
};

export default SrOnlySanitized;
