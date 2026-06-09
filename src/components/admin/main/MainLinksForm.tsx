"use client";

import { useForm, useFieldArray, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { Globe } from "lucide-react";
import {
  FaInstagram,
  FaLinkedinIn,
  FaYoutube,
} from "react-icons/fa6";
import { SaveChangesButton } from "@/app/admin/components/save-changes-button";
import { useRouter } from "next/navigation";
import { LinkItemAdmin, mainLinksAdminSchema } from "@/schemas/mainSchema";
import { mutate } from "swr";
import { createSubmitHandler } from "@/utils/form-helpers";

interface MainLinksFormProps {
  initialData: { mainLinks: LinkItemAdmin[] };
}

const platformIcons: { [key: string]: React.ReactNode } = {
  instagram: <FaInstagram className="h-5 w-5" aria-hidden />,
  linkedin: <FaLinkedinIn className="h-5 w-5" aria-hidden />,
  newsletter: <Globe className="h-5 w-5" aria-hidden />,
  youtube: <FaYoutube className="h-5 w-5" aria-hidden />,
};

export default function MainLinksForm({ initialData }: MainLinksFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const methods = useForm<{ mainLinks: LinkItemAdmin[] }>({
    resolver: zodResolver(mainLinksAdminSchema),
    defaultValues: initialData,
  });

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = methods;

  const { fields } = useFieldArray({
    control,
    name: "mainLinks",
  });

  const onSubmit = createSubmitHandler<{ mainLinks: LinkItemAdmin[] }>(
    "/api/admin/main/links",
    async (data) => {
      console.log("Form submitted successfully", data);
      toast({
        title: "Links updated",
        description: "The main links have been successfully updated.",
      });
      methods.reset(data);
      await mutate("/api/admin/main/links");
      router.refresh();
    },
    (error) => {
      console.error("Form submission error:", error);
      toast({
        title: "Error",
        description: "Failed to update main links. Please try again.",
        variant: "destructive",
      });
    }
  );

  const handleFormSubmit = async (data: { mainLinks: LinkItemAdmin[] }) => {
    console.log("handleFormSubmit called with data:", data);
    setIsSubmitting(true);
    try {
      await onSubmit(data);
    } catch (error) {
      console.error("Error in handleFormSubmit:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
        {fields.map((field, index) => (
          <div key={field.id} className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 w-1/3">
              {platformIcons[field.platform.toLowerCase()] ||
                platformIcons.default}
              <span className="font-medium">{field.platform}</span>
            </div>
            <div className="grow space-y-2">
              <Input
                {...methods.register(`mainLinks.${index}.link`)}
                defaultValue={field.link}
                placeholder="Link URL"
                className="dashboard-input"
              />
              {errors.mainLinks?.[index]?.link && (
                <p className="text-red-500">
                  {errors.mainLinks[index]?.link?.message}
                </p>
              )}
              <Input
                type="hidden"
                {...methods.register(`mainLinks.${index}.platform`)}
                defaultValue={field.platform}
              />
            </div>
          </div>
        ))}
        <div className="flex justify-start">
          <SaveChangesButton
            watchFields={["mainLinks"]}
            isSubmitting={isSubmitting}
          /></div>
      </form>
    </FormProvider>
  );
}
