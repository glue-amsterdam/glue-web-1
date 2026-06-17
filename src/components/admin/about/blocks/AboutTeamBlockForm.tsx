"use client";

import React, { useEffect, useRef, useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { SaveChangesButton } from "@/app/admin/components/save-changes-button";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RichTextEditor } from "@/components/editor";
import { uploadImage } from "@/utils/supabase/storage/client";
import { config } from "@/config";
import { Plus, Trash2 } from "lucide-react";
import { ABOUT_BLOCK_IDS } from "@/schemas/aboutPageSchema";
import { AdminImagePreview } from "@/components/admin/admin-image-preview";
import type { AboutBlockAdminData } from "@/lib/about/fetch-about-block-admin";
import { getAboutBlockAdmin, saveAboutBlock } from "@/app/actions/admin/about";
import { useRouter } from "next/navigation";
import {
  createUploadProgressHandler,
  type UploadState,
} from "@/components/image-upload-overlay";

const memberSchema = z.object({
  name: z.string().min(1),
  role: z.string(),
  email: z.string(),
  phone: z.string().optional(),
  description: z.string().optional(),
});

const formSchema = z.object({
  title: z.string().min(1),
  description: z.string(),
  is_visible: z.boolean(),
  image_src: z.string().optional(),
  image_alt: z.string().optional(),
  members: z.array(memberSchema),
});

type FormData = z.infer<typeof formSchema>;

type Props = {
  initialData?: AboutBlockAdminData | null;
};

const mapInitialDataToForm = (data: AboutBlockAdminData): FormData => ({
  title: data.block?.title ?? "Team",
  description: data.block?.description ?? "",
  is_visible: data.block?.is_visible ?? false,
  image_src: data.media?.image_src ?? "",
  image_alt: data.media?.image_alt ?? "",
  members: (data.members ?? []).map((m) => ({
    name: m.name,
    role: m.role,
    email: (m.email as string | undefined) ?? "",
    phone: (m.phone as string | undefined) ?? "",
    description: (m.description as string | undefined) ?? "",
  })),
});

export default function AboutTeamBlockForm({ initialData }: Props) {
  const { toast } = useToast();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(!initialData);
  const [uploadState, setUploadState] = useState<UploadState | null>(null);
  const [openMemberId, setOpenMemberId] = useState<string | undefined>();
  const pendingOpenLastRef = useRef(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const blockId = ABOUT_BLOCK_IDS.TEAM;
  const handleUploadProgress = createUploadProgressHandler(setUploadState);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData
      ? mapInitialDataToForm(initialData)
      : {
        title: "Team",
        description: "",
        is_visible: false,
        image_src: "",
        image_alt: "",
        members: [],
      },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "members",
  });

  const watchedMembers = form.watch("members");

  useEffect(() => {
    if (pendingOpenLastRef.current && fields.length > 0) {
      setOpenMemberId(fields[fields.length - 1].id);
      pendingOpenLastRef.current = false;
    }
  }, [fields]);

  useEffect(() => {
    if (initialData) {
      form.reset(mapInitialDataToForm(initialData));
      setOpenMemberId(undefined);
      setIsLoading(false);
      return;
    }

    const load = async () => {
      setIsLoading(true);
      try {
        const data = await getAboutBlockAdmin(blockId);
        if (data) {
          form.reset(mapInitialDataToForm(data));
        }
        setOpenMemberId(undefined);
      } catch {
        toast({
          title: "Error",
          description: "Failed to load team block",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [blockId, form, initialData, toast]);

  const handleAddMember = () => {
    pendingOpenLastRef.current = true;
    append({ name: "", role: "", email: "", phone: "", description: "" });
  };

  const handleRemoveMember = (index: number, fieldId: string) => {
    remove(index);
    if (openMemberId === fieldId) {
      setOpenMemberId(undefined);
    }
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) {
      return;
    }
    const file = e.target.files[0];

    try {
      setUploadState({ stage: "compressing", progress: 5 });

      const { imageUrl, error } = await uploadImage({
        file,
        bucket: config.bucketName,
        folder: `about/blocks/${blockId}`,
        onProgress: handleUploadProgress,
      });

      if (error) {
        throw new Error(error);
      }

      form.setValue("image_src", imageUrl, { shouldDirty: true });
    } catch (error) {
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "Upload failed",
        variant: "destructive",
      });
    } finally {
      setUploadState(null);
      e.target.value = "";
    }
  };

  const handleSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    try {
      await saveAboutBlock(blockId, {
        title: data.title,
        description: data.description,
        is_visible: data.is_visible,
        image_src: data.image_src,
        image_alt: data.image_alt,
      });

      const membersRes = await fetch(
        `/api/admin/about/blocks/meet-the-team/members`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            members: data.members.map((m, index) => ({
              ...m,
              display_order: index,
            })),
          }),
        }
      );
      if (!membersRes.ok) {
        throw new Error("Members update failed");
      }

      toast({ title: "Team updated", description: "Block saved successfully." });
      router.refresh();
    } catch {
      toast({
        title: "Error",
        description: "Failed to update team block",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <p>Loading Team block...</p>;
  }

  const imageSrc = form.watch("image_src");
  const isUploading = uploadState !== null;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <h2 className="text-lg font-semibold">Team</h2>

        <FormField
          control={form.control}
          name="is_visible"
          render={({ field }) => (
            <FormItem className="flex items-center justify-between gap-4">
              <FormLabel>Visible</FormLabel>
              <FormControl>
                <Switch checked={field.value} onCheckedChange={field.onChange} />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <RichTextEditor value={field.value} onChange={field.onChange} />
              </FormControl>
            </FormItem>
          )}
        />

        <div>
          <AdminImagePreview
            src={imageSrc}
            alt="Team block image"
            uploadState={uploadState}
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="mt-2"
            disabled={isUploading}
            onClick={() => fileInputRef.current?.click()}
          >
            Upload Image
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            disabled={isUploading}
            onChange={handleImageChange}
          />
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-medium">Team Members</h3>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAddMember}
            >
              <Plus className="w-4 h-4 mr-1" /> Add Member
            </Button>
          </div>

          {fields.length === 0 ? (
            <p className="text-sm text-muted-foreground">No members yet.</p>
          ) : (
            <Accordion
              type="single"
              collapsible
              value={openMemberId}
              onValueChange={setOpenMemberId}
              className="space-y-2"
            >
              {fields.map((field, index) => {
                const member = watchedMembers[index];
                const memberLabel =
                  member?.name?.trim() ||
                  (member?.role?.trim()
                    ? `Member ${index + 1} — ${member.role.trim()}`
                    : `Member ${index + 1}`);

                return (
                  <AccordionItem
                    key={field.id}
                    value={field.id}
                    className="rounded-lg border border-gray-200 px-4 border-b"
                  >
                    <div className="flex items-center gap-2">
                      <AccordionTrigger className="flex-1 py-3 text-left font-medium hover:no-underline">
                        {memberLabel}
                      </AccordionTrigger>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="shrink-0"
                        aria-label={`Remove ${memberLabel}`}
                        onClick={() => handleRemoveMember(index, field.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                    <AccordionContent className="space-y-3 pb-4">
                      <FormField
                        control={form.control}
                        name={`members.${index}.name`}
                        render={({ field: f }) => (
                          <FormItem>
                            <FormLabel>Name</FormLabel>
                            <FormControl>
                              <Input {...f} />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`members.${index}.role`}
                        render={({ field: f }) => (
                          <FormItem>
                            <FormLabel>Role</FormLabel>
                            <FormControl>
                              <Input {...f} />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`members.${index}.email`}
                        render={({ field: f }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input {...f} type="email" />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`members.${index}.phone`}
                        render={({ field: f }) => (
                          <FormItem>
                            <FormLabel>Phone</FormLabel>
                            <FormControl>
                              <Input {...f} />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`members.${index}.description`}
                        render={({ field: f }) => (
                          <FormItem>
                            <FormLabel>Description</FormLabel>
                            <FormControl>
                              <Textarea {...f} rows={3} />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </AccordionContent>
                  </AccordionItem>
                );
              })}
            </Accordion>
          )}
        </div>

        <SaveChangesButton isSubmitting={isSubmitting} className="w-full" />
      </form>
    </Form>
  );
}
