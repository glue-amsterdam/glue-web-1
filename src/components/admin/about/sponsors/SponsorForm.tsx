"use client";

import React, { useRef } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sponsor, sponsorSchema, SponsorType } from "@/schemas/sponsorsSchema";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import {
  addAboutSponsor,
  saveAboutSponsor,
} from "@/app/actions/admin/about";
import { uploadImage } from "@/utils/supabase/storage/client";
import { SaveChangesButton } from "@/app/admin/components/save-changes-button";
import { config } from "@/config";
import { AdminImagePreview } from "@/components/admin/admin-image-preview";
import {
  createUploadProgressHandler,
  type UploadState,
} from "@/components/image-upload-overlay";
import { sponsorMatchesType } from "@/lib/about/sponsor-type-utils";

interface SponsorFormProps {
  initialData?: Sponsor;
  sponsorTypes: SponsorType[];
  defaultTypeId?: string;
  variant?: "card" | "plain";
  onSponsorAdded?: () => void;
  onSponsorUpdated?: () => void;
}

export default function SponsorForm({
  initialData,
  sponsorTypes,
  defaultTypeId,
  variant = "card",
  onSponsorAdded,
  onSponsorUpdated,
}: SponsorFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadState, setUploadState] = useState<UploadState | null>(null);
  const { toast } = useToast();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const handleUploadProgress = createUploadProgressHandler(setUploadState);

  const methods = useForm<Sponsor>({
    resolver: zodResolver(sponsorSchema),
    defaultValues: initialData || {
      name: "",
      website: "",
      sponsor_type: defaultTypeId || sponsorTypes[0]?.id || "",
      image_url: "",
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = methods;

  useEffect(() => {
    if (!initialData?.sponsor_type) {
      return;
    }

    const hasMatchingId = sponsorTypes.some((type) =>
      sponsorMatchesType(initialData.sponsor_type, type)
    );

    if (hasMatchingId) {
      return;
    }

    const matchByLabel = sponsorTypes.find(
      (type) => type.label === initialData.sponsor_type
    );

    if (matchByLabel) {
      setValue("sponsor_type", matchByLabel.id, { shouldDirty: false });
    }
  }, [initialData, sponsorTypes, setValue]);

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const imageUrl = URL.createObjectURL(file);

      setValue("image_url", imageUrl, { shouldDirty: true });
      setValue("file", file, { shouldDirty: true });
    }
  };

  const onSubmit = async (data: Sponsor) => {
    setIsSubmitting(true);
    try {
      let newImageUrl = data.image_url;
      if (data.file) {
        setUploadState({ stage: "compressing", progress: 5 });

        const { imageUrl, error } = await uploadImage({
          file: data.file,
          bucket: config.bucketName,
          folder: "about/sponsors",
          onProgress: handleUploadProgress,
        });
        if (error) {
          throw new Error(`Failed to upload image: ${error}`);
        }
        newImageUrl = imageUrl;
      }

      setUploadState({ stage: "saving", progress: 96 });

      const sponsorData = {
        ...data,
        image_url: newImageUrl,
      };

      if (initialData) {
        await saveAboutSponsor(sponsorData);
      } else {
        await addAboutSponsor(sponsorData);
      }

      toast({
        title: `Sponsor ${initialData ? "updated" : "added"}`,
        description: `The sponsor has been successfully ${
          initialData ? "updated" : "added"
        }.`,
      });

      if (initialData && onSponsorUpdated) {
        onSponsorUpdated();
      } else if (onSponsorAdded) {
        onSponsorAdded();
      }

      router.refresh();
      reset();
    } catch (error) {
      console.error("Form submission error:", error);
      toast({
        title: "Error",
        description: `Failed to ${
          initialData ? "update" : "add"
        } sponsor. Please try again.`,
        variant: "destructive",
      });
    } finally {
      setUploadState(null);
      setIsSubmitting(false);
    }
  };

  const imageUrl = watch("image_url");
  const selectedTypeId = watch("sponsor_type");
  const pendingFile = watch("file");
  const isBusy = isSubmitting || uploadState !== null;

  const formContent = (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div>
          <Label htmlFor="name">Partner name</Label>
          <Input id="name" {...register("name")} />
          {errors.name && (
            <p className="text-red-500">{errors.name.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="website">Website</Label>
          <Input id="website" {...register("website")} />
          {errors.website && (
            <p className="text-red-500">{errors.website.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="sponsor_type">Partner group</Label>
          <Select
            value={selectedTypeId}
            onValueChange={(value) =>
              setValue("sponsor_type", value, { shouldDirty: true })
            }
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a partner group" />
            </SelectTrigger>
            <SelectContent>
              {sponsorTypes.map((type) => (
                <SelectItem key={type.id} value={type.id}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.sponsor_type && (
            <p className="text-red-500">{errors.sponsor_type.message}</p>
          )}
        </div>

        <div>
          <Label>Logo</Label>
          <AdminImagePreview
            src={imageUrl}
            alt="Sponsor logo"
            uploadState={uploadState}
            aspectClassName="h-52 w-full"
          />
          {pendingFile && !uploadState && (
            <p className="mt-2 text-sm text-muted-foreground">
              New file selected — save to apply
            </p>
          )}
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="mt-2 w-full"
            disabled={isBusy}
            onClick={() => fileInputRef.current?.click()}
          >
            {imageUrl ? "Change logo" : "Upload logo"}
          </Button>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            ref={fileInputRef}
            className="hidden"
            disabled={isBusy}
          />
          {errors.image_url && (
            <p className="text-red-500">{errors.image_url.message}</p>
          )}
        </div>

        <SaveChangesButton
          watchFields={["name", "website", "sponsor_type", "image_url"]}
          isSubmitting={isSubmitting}
        >
          {isSubmitting ? "Saving..." : "Save partner"}
        </SaveChangesButton>
      </form>
    </FormProvider>
  );

  if (variant === "plain") {
    return formContent;
  }

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>
          {initialData ? "Edit partner" : "Add new partner"}
        </CardTitle>
      </CardHeader>
      <CardContent>{formContent}</CardContent>
    </Card>
  );
}
