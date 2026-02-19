"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { EmailRichTextEditor } from "./EmailRichTextEditor";

const emailTemplateSchema = z.object({
  subject: z.string().min(1, "Subject is required"),
  html_content: z.string().min(1, "HTML content is required"),
  description: z.string().nullable().optional(),
});

export type EmailTemplateFormValues = z.infer<typeof emailTemplateSchema>;

/** Variables available per template slug (used for admin hint and test replacement) */
const getTemplateVariableNames = (slug: string): string[] => {
  const base = ["email", "user_name"];
  if (slug === "password-reset") {
    return [...base, "reset_link"];
  }
  return base;
};

interface EmailTemplateFormProps {
  template: {
    id: string;
    slug: string;
    subject: string;
    html_content: string;
    description: string | null;
  };
  onSave: () => void;
  onCancel: () => void;
}

export default function EmailTemplateForm({
  template,
  onSave,
  onCancel,
}: EmailTemplateFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [testEmail, setTestEmail] = useState("");
  const [isSendingTest, setIsSendingTest] = useState(false);
  const { toast } = useToast();

  const form = useForm<EmailTemplateFormValues>({
    resolver: zodResolver(emailTemplateSchema),
    defaultValues: {
      subject: template.subject,
      html_content: template.html_content,
    },
  });

  const handleSubmit = async (data: EmailTemplateFormValues) => {
    setIsSubmitting(true);
    try {
      const response = await fetch(
        `/api/admin/email-templates/${template.slug}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            subject: data.subject,
            html_content: data.html_content,
            description: template.description || null,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update email template");
      }

      toast({
        title: "Email template updated",
        description: "The email template has been successfully updated.",
      });
      onSave();
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to update email template.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSendTest = async () => {
    if (!testEmail || !testEmail.includes("@")) {
      toast({
        title: "Invalid email",
        description: "Please enter a valid email address",
        variant: "destructive",
      });
      return;
    }

    setIsSendingTest(true);
    try {
      // Get current form values to test with current content (even if not saved)
      const formValues = form.getValues();
      const response = await fetch(
        `/api/admin/email-templates/${template.slug}/test`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            testEmail,
            subject: formValues.subject,
            html_content: formValues.html_content,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to send test email");
      }

      toast({
        title: "Test email sent",
        description: `Test email has been sent to ${testEmail}`,
      });
      setTestEmail("");
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to send test email.",
        variant: "destructive",
      });
    } finally {
      setIsSendingTest(false);
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className="space-y-6 text-black w-full max-w-full overflow-x-hidden px-1 md:px-4"
      >
        <FormField
          control={form.control}
          name="subject"
          render={({ field }) => (
            <FormItem className="w-full max-w-full">
              <FormLabel className="text-black">Subject Line</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Email subject" className="text-black w-full max-w-full" />
              </FormControl>
              <FormDescription className="text-black">
                {`The subject line that will appear in the recipient's inbox.`}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="html_content"
          render={({ field }) => (
            <FormItem className="w-full max-w-full">
              <FormLabel className="text-black">Email Content</FormLabel>
              <FormControl>
                <div className="w-full max-w-full">
                  <EmailRichTextEditor
                    value={field.value || ""}
                    onChange={field.onChange}
                  />
                </div>
              </FormControl>
              <FormDescription className="text-black">
                You can use variables{" "}
                {(() => {
                  const vars = getTemplateVariableNames(template.slug);
                  const last = vars.length - 1;
                  return vars.map((name, i) => (
                    <span key={name}>
                      {i > 0 && (i === last ? " and " : ", ")}
                      <code className="bg-gray-100 px-1 rounded text-black">
                        {"{{" + name + "}}"}
                      </code>
                    </span>
                  ));
                })()}{" "}
                which will be replaced with actual values when the email is
                sent.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="border-t pt-4 mt-6">
          <div className="space-y-3">
            <div>
              <label
                htmlFor="test-email"
                className="text-sm font-medium text-black mb-2 block"
              >
                Send Test Email
              </label>
              <div className="flex gap-2 w-full max-w-full">
                <Input
                  id="test-email"
                  type="email"
                  placeholder="Enter email address to send test"
                  value={testEmail}
                  onChange={(e) => setTestEmail(e.target.value)}
                  className="text-black flex-1 min-w-0"
                  disabled={isSendingTest || isSubmitting}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleSendTest}
                  disabled={isSendingTest || isSubmitting || !testEmail}
                  className="flex-shrink-0"
                >
                  {isSendingTest ? "Sending..." : "Send Test"}
                </Button>
              </div>
              <p className="text-xs text-black mt-1">
                Send a test email with the current template content to verify
                how it looks.
              </p>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-4 w-full max-w-full flex-wrap">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isSubmitting || isSendingTest}
            className="flex-shrink-0"
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting || isSendingTest} className="flex-shrink-0">
            {isSubmitting ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
