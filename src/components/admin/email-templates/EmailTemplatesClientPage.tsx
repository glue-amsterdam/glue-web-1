"use client";

import { useEffect, useState } from "react";
import AdminHeader from "@/components/admin/AdminHeader";
import AdminBackHeader from "@/components/admin/AdminBackHeader";
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
    // Refetch templates after update
    fetch("/api/admin/email-templates")
      .then((res) => res.json())
      .then((data) => setTemplates(data))
      .catch((err) => setError(err.message));
  };

  if (isLoading) {
    return (
      <div className="container mx-auto text-black min-h-dvh h-full pt-[6rem] pb-4">
        <div className="bg-white p-4 rounded-lg shadow-md flex flex-col gap-4">
          <AdminHeader />
          <AdminBackHeader backLink="/admin" sectionTitle="Email Templates" />
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto text-black min-h-dvh h-full pt-[6rem] pb-4">
        <div className="bg-white p-4 rounded-lg shadow-md flex flex-col gap-4">
          <AdminHeader />
          <AdminBackHeader backLink="/admin" sectionTitle="Email Templates" />
          <div className="text-red-500 p-4">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto text-black min-h-dvh h-full pt-[6rem] pb-4">
      <div className="bg-white p-4 rounded-lg shadow-md flex flex-col gap-4">
        <AdminHeader />
        <AdminBackHeader backLink="/admin" sectionTitle="Email Templates" />
        <EmailTemplatesList
          templates={templates}
          onTemplateUpdate={handleTemplateUpdate}
        />
      </div>
    </div>
  );
}
