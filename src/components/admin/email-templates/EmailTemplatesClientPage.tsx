"use client";

import { useEffect, useState } from "react";
import EmailTemplatesList from "./EmailTemplatesList";

type EmailTemplate = {
  id: string;
  slug: string;
  subject: string;
  html_content: string;
  description: string | null;
  created_at: string;
  updated_at: string;
};

export default function EmailTemplatesClientPage() {
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const response = await fetch("/api/admin/email-templates");
        if (!response.ok) {
          throw new Error("Failed to fetch email templates");
        }
        const data = await response.json();
        setTemplates(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setIsLoading(false);
      }
    };

    fetchTemplates();
  }, []);

  const handleTemplateUpdate = () => {
    fetch("/api/admin/email-templates")
      .then((res) => res.json())
      .then((data) => setTemplates(data))
      .catch((err) => setError(err.message));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-gray-900" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg bg-white p-4 shadow-md">
        <div className="base-text-size p-4 text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 rounded-lg bg-white p-4 shadow-md">
      <EmailTemplatesList
        templates={templates}
        onTemplateUpdate={handleTemplateUpdate}
      />
    </div>
  );
}
