"use client";

import { useSanitizedHTML } from "@/app/hooks/useSanitizedHTML";
import { useEffect, useState } from "react";

export default function TermsContent() {
  const [termsContent, setTermsContent] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const sanitizedContent = useSanitizedHTML(termsContent);

  useEffect(() => {
    const fetchTerms = async () => {
      try {
        const response = await fetch("/api/terms");
        if (response.ok) {
          const data = await response.json();
          const content = data.content || "";
          setTermsContent(content);
        } else {
          setTermsContent("<p>Failed to load terms and conditions.</p>");
        }
      } catch (error) {
        console.error("Failed to fetch terms:", error);
        setTermsContent("<p>Failed to load terms and conditions.</p>");
      } finally {
        setIsLoading(false);
      }
    };

    fetchTerms();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div
      className="prose prose-sm max-w-none text-sm"
      dangerouslySetInnerHTML={{
        __html: sanitizedContent || "<p>No terms and conditions available.</p>",
      }}
    />
  );
}
