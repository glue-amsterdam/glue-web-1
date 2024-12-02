"use client";

import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { createSubmitHandler } from "@/utils/form-helpers";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { SaveChangesButton } from "@/app/admin/components/save-changes-button";
import { useRouter } from "next/navigation";
import { MainMenuData, mainMenuSchema } from "@/schemas/mainSchema";

interface MainSectionFormProps {
  initialData: MainMenuData;
}

export default function MainSectionForm({ initialData }: MainSectionFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const methods = useForm<MainMenuData>({
    resolver: zodResolver(mainMenuSchema),
    defaultValues: initialData,
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = methods;

  const onSubmit = createSubmitHandler<MainMenuData>(
    "/api/admin/main/menu",
    () => {
      toast({
        title: "Main menu updated",
        description: "The main menu has been successfully updated.",
      });
      router.refresh();
    },
    (error) => {
      console.error("Form submission error:", error);
      toast({
        title: "Error",
        description: "Failed to update main menu. Please try again.",
        variant: "destructive",
      });
    }
  );

  const handleFormSubmit = async (data: MainMenuData) => {
    setIsSubmitting(true);
    try {
      await onSubmit(data);
    } catch (error) {
      console.error("Error in handleFormSubmit:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  console.log("Form is valid:", isValid);
  console.log("Form errors:", errors);

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
        {[0, 1, 2, 3].map((index) => (
          <div key={index} className="space-y-4 p-4 border rounded-md">
            <div className="flex items-center space-x-2">
              <Input
                {...register(`mainMenu.${index}.label`)}
                placeholder={`Label ${index + 1}`}
                className="dashboard-input"
              />
              {errors.mainMenu?.[index]?.label && (
                <p className="text-red-500">
                  {errors.mainMenu[index]?.label?.message}
                </p>
              )}
            </div>
            <div className="hidden">
              <Input {...register(`mainMenu.${index}.section`)} readOnly />
            </div>
            <div className="hidden">
              <Input {...register(`mainMenu.${index}.className`)} readOnly />
            </div>
            <div className="hidden">
              <Input {...register(`mainMenu.${index}.menu_id`)} readOnly />
            </div>
          </div>
        ))}
        <SaveChangesButton
          watchFields={["mainMenu"]}
          isSubmitting={isSubmitting}
          className="w-full"
        />
      </form>
    </FormProvider>
  );
}
