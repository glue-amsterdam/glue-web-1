"use client";

import { useForm, useFieldArray, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { mainMenuSchema } from "@/schemas/baseSchema";
import { MainMenuItem } from "@/utils/menu-types";
import { createSubmitHandler } from "@/utils/form-helpers";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { SaveChangesButton } from "@/app/admin/components/save-changes-button";
import { useRouter } from "next/navigation";

interface MainSectionFormProps {
  initialData: { mainMenu: MainMenuItem[] };
}

export default function MainSectionForm({ initialData }: MainSectionFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const methods = useForm<{ mainMenu: MainMenuItem[] }>({
    resolver: zodResolver(mainMenuSchema),
    defaultValues: initialData,
  });

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = methods;

  const { fields: menuFields } = useFieldArray({
    control,
    name: "mainMenu",
  });

  const onSubmit = createSubmitHandler<{ mainMenu: MainMenuItem[] }>(
    "/api/admin/main/menu",
    () => {
      console.log("Form submitted successfully");
      toast({
        title: "Main section updated",
        description: "The main menu labels have been successfully updated.",
      });
      router.refresh();
    },
    (error) => {
      console.error("Form submission error:", error);
      toast({
        title: "Error",
        description: "Failed to update main menu labels. Please try again.",
        variant: "destructive",
      });
    }
  );

  const handleFormSubmit = async (data: { mainMenu: MainMenuItem[] }) => {
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
      <form
        onSubmit={(e) => {
          console.log("Form onSubmit event triggered");
          handleSubmit(handleFormSubmit)(e);
        }}
        className="space-y-6"
      >
        {menuFields.map((field, index) => (
          <div key={field.menu_id} className="space-y-4">
            <div className="flex items-center space-x-2">
              <Input
                {...methods.register(`mainMenu.${index}.label`)}
                placeholder={`Label ${index + 1}`}
                className="dashboard-input"
              />
              {errors.mainMenu?.[index]?.label && (
                <p className="text-red-500">
                  {errors.mainMenu[index]?.label?.message}
                </p>
              )}
            </div>
            <div className="hidden items-center space-x-2">
              <span className="font-medium">Section:</span>
              <Input
                {...methods.register(`mainMenu.${index}.section`)}
                readOnly
                className="dashboard-input bg-gray-100"
              />
            </div>
            <div className="hidden items-center space-x-2">
              <span className="font-medium">Class Name:</span>
              <Input
                {...methods.register(`mainMenu.${index}.className`)}
                readOnly
                className="dashboard-input bg-gray-100"
              />
            </div>
          </div>
        ))}
        <SaveChangesButton isSubmitting={isSubmitting} className="w-full" />
      </form>
    </FormProvider>
  );
}
