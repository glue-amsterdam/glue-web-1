"use client";

import React, { useEffect, useRef } from "react";
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
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { ImageIcon } from "lucide-react";
import Image from "next/image";
import { uploadImage } from "@/utils/supabase/storage/client";
import { SaveChangesButton } from "@/app/admin/components/save-changes-button";
import { config } from "@/env";

interface SponsorFormProps {
  initialData?: Sponsor;
  sponsorTypes: SponsorType[];
  onSponsorAdded?: () => void;
  onSponsorUpdated?: () => void;
}

export default function SponsorForm({
  initialData,
  sponsorTypes,
  onSponsorAdded,
  onSponsorUpdated,
}: SponsorFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getAlt = (name: string, sponsorType: string) => {
    return `The logo of ${name}, one of our ${sponsorType}`;
  };

  const methods = useForm<Sponsor>({
    resolver: zodResolver(sponsorSchema),
    defaultValues: initialData || {
      name: "",
      website: "",
      sponsor_type: "",
      image_url: "",
      alt: "",
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

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const imageUrl = URL.createObjectURL(file);

      setValue("image_url", imageUrl, { shouldDirty: true });
      setValue("file", file, { shouldDirty: true });

      // Trigger rerender to show the new image immediately
      setValue("alt", file.name, { shouldDirty: true });
    }
  };

  const name = watch("name");
  const sponsorType = watch("sponsor_type");
  const imageUrl = watch("image_url");

  useEffect(() => {
    if (name && sponsorType && imageUrl) {
      const generatedAlt = getAlt(name, sponsorType);
      setValue("alt", generatedAlt, { shouldDirty: true });
    }
  }, [setValue, name, sponsorType, imageUrl]);

  const onSubmit = async (data: Sponsor) => {
    setIsSubmitting(true);
    try {
      let newImageUrl = data.image_url;
      if (data.file) {
        const { imageUrl, error } = await uploadImage({
          file: data.file,
          bucket: config.bucketName,
          folder: "about/sponsors",
        });
        if (error) {
          throw new Error(`Failed to upload image: ${error}`);
        }
        newImageUrl = imageUrl;
      }

      const sponsorData = {
        ...data,
        image_url: newImageUrl,
      };

      const response = await fetch("/api/admin/about/sponsors", {
        method: initialData ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(sponsorData),
      });

      if (!response.ok) {
        throw new Error("Failed to save sponsor");
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
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>
          {initialData ? "Edit Sponsor" : "Add New Sponsor"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <FormProvider {...methods}>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <Label htmlFor="name">Sponsor Name</Label>
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
              <Label htmlFor="sponsor_type">Sponsor Type</Label>
              <Select
                onValueChange={(value) => setValue("sponsor_type", value)}
                defaultValue={initialData?.sponsor_type || ""}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a sponsor type" />
                </SelectTrigger>
                <SelectContent>
                  {sponsorTypes.map((type) => (
                    <SelectItem key={type.label} value={type.label}>
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
              <div className="w-full h-52 bg-gray object-cover rounded-md relative mb-2">
                {watch("image_url") ? (
                  <Image
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    src={watch("image_url")}
                    alt={watch("alt") || "Sponsor logo"}
                    className="object-cover rounded-md"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-200 rounded-md">
                    <ImageIcon className="w-12 h-12 text-gray-400" />
                  </div>
                )}
              </div>
              <Button
                type="button"
                variant="secondary"
                onClick={() => fileInputRef.current?.click()}
                className="w-full mb-2"
              >
                {watch("image_url") ? "Change Logo" : "Upload Logo"}
              </Button>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                ref={fileInputRef}
                className="hidden"
              />
              {errors.image_url && (
                <p className="text-red-500">{errors.image_url.message}</p>
              )}
            </div>

            <SaveChangesButton
              watchFields={[
                "name",
                "website",
                "sponsor_type",
                "image_url",
                "alt",
              ]}
              isSubmitting={isSubmitting}
            >
              {isSubmitting ? "Saving..." : "Save Sponsor"}
            </SaveChangesButton>
          </form>
        </FormProvider>
      </CardContent>
    </Card>
  );
}
