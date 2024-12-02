"use client";

import { useForm, useFieldArray, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { createSubmitHandler } from "@/utils/form-helpers";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";
import { Instagram, Linkedin, Globe, Youtube } from "lucide-react";
import { SaveChangesButton } from "@/app/admin/components/save-changes-button";
import { useRouter } from "next/navigation";
import { LinkItem, mainLinksSchema } from "@/schemas/mainSchema";

interface MainLinksFormProps {
  initialData: { mainLinks: LinkItem[] };
}

const platformIcons: { [key: string]: React.ReactNode } = {
  instagram: <Instagram className="h-5 w-5" />,
  linkedin: <Linkedin className="h-5 w-5" />,
  newsletter: <Globe className="h-5 w-5" />,
  youtube: <Youtube className="h-5 w-5" />,
};

export default function MainLinksForm({ initialData }: MainLinksFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const methods = useForm<{ mainLinks: LinkItem[] }>({
    resolver: zodResolver(mainLinksSchema),
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

  const onSubmit = createSubmitHandler<{ mainLinks: LinkItem[] }>(
    "/api/admin/main/links",
    () => {
      console.log("Form submitted successfully");
      toast({
        title: "Links updated",
        description: "The main links have been successfully updated.",
      });
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

  const handleFormSubmit = async (data: { mainLinks: LinkItem[] }) => {
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

  useEffect(() => {
    console.log("Form errors:", errors);
  }, [errors]);

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
            <div className="flex-grow space-y-2">
              <Input
                {...methods.register(`mainLinks.${index}.link`)}
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
              />
            </div>
          </div>
        ))}
        <SaveChangesButton
          isSubmitting={isSubmitting}
          className="w-full"
          watchFields={["mainLinks"]}
        />
      </form>
    </FormProvider>
  );
}
