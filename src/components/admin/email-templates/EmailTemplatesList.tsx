"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import EmailTemplateForm from "./EmailTemplateForm";

type EmailTemplate = {
  id: string;
  slug: string;
  subject: string;
  html_content: string;
  description: string | null;
  created_at: string;
  updated_at: string;
};

interface EmailTemplatesListProps {
  templates: EmailTemplate[];
  onTemplateUpdate: () => void;
}

const getTemplateDisplayInfo = (slug: string) => {
  const templateInfo: Record<
    string,
    { label: string; description: string; color: string }
  > = {
    "participant-accepted": {
      label: "Participant Accepted",
      description: "Sent when a participant application is accepted",
      color: "bg-green-500",
    },
    "participant-reactivated": {
      label: "Participant Reactivated",
      description: "Sent when a participant account is reactivated",
      color: "bg-blue-500",
    },
    "upgrade-request-accepted": {
      label: "Upgrade Request Accepted",
      description:
        "Sent when a user's upgrade request to become a participant is accepted",
      color: "bg-purple-500",
    },
    "participant-registration": {
      label: "Participant Registration",
      description: "Sent when a new participant completes registration",
      color: "bg-orange-500",
    },
    "password-reset": {
      label: "Password Reset",
      description: "Sent when a user requests a password reset",
      color: "bg-amber-500",
    },
  };

  return (
    templateInfo[slug] || {
      label: slug,
      description: "Email template",
      color: "bg-gray-500",
    }
  );
};

export default function EmailTemplatesList({
  templates,
  onTemplateUpdate,
}: EmailTemplatesListProps) {
  const [selectedTemplate, setSelectedTemplate] =
    useState<EmailTemplate | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleEdit = (template: EmailTemplate) => {
    setSelectedTemplate(template);
    setIsDialogOpen(true);
  };

  const handleClose = () => {
    setIsDialogOpen(false);
    setSelectedTemplate(null);
  };

  const handleSave = () => {
    onTemplateUpdate();
    handleClose();
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-600 mb-4">
        Manage email templates sent to users. Click on a template to edit it.
      </p>
      <div className="grid gap-4">
        {templates.map((template) => {
          const displayInfo = getTemplateDisplayInfo(template.slug);
          return (
            <Card
              key={template.id}
              className="cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => handleEdit(template)}
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{displayInfo.label}</CardTitle>
                  <Badge className={displayInfo.color}>{template.slug}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-2">
                  {template.description || displayInfo.description}
                </p>
                <p className="text-sm font-medium">Subject:</p>
                <p className="text-sm text-gray-700 mb-2">{template.subject}</p>
                <p className="text-xs text-gray-500">
                  Last updated: {new Date(template.updated_at).toLocaleString()}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-[90vw] md:max-w-4xl h-[90vh] overflow-y-auto overflow-x-hidden px-1 md:px-4 text-black w-[90vw] md:w-auto">
          <DialogHeader className="w-full max-w-full">
            <DialogTitle className="text-black">
              {selectedTemplate &&
                getTemplateDisplayInfo(selectedTemplate.slug).label}
            </DialogTitle>
          </DialogHeader>
          {selectedTemplate && (
            <div className="w-full max-w-full overflow-x-hidden">
              <EmailTemplateForm
                template={selectedTemplate}
                onSave={handleSave}
                onCancel={handleClose}
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
