"use client";

import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { createSubmitHandler } from "@/utils/form-helpers";
import { useToast } from "@/hooks/use-toast";
import { useEffect, useState } from "react";
import { SaveChangesButton } from "@/app/admin/components/save-changes-button";
import { useRouter } from "next/navigation";
import { MainMenuData, mainMenuSchema } from "@/schemas/mainSchema";
import { mutate } from "swr";

interface MainMenuFormProps {
  initialData: MainMenuData;
}

export default function MainMenuForm({ initialData }: MainMenuFormProps) {
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
    reset,
    formState: { errors },
  } = methods;

  useEffect(() => {
    reset(initialData);
  }, [initialData, reset]);

  const onSubmit = createSubmitHandler<MainMenuData>(
    "/api/admin/main/menu",
    async (data) => {
      console.log("Form submitted successfully", data);
      toast({
        title: "Main menu updated",
        description: "The main menu has been successfully updated.",
      });
      await mutate("/api/admin/main/menu");
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
        {initialData.mainMenu.map((item, index) => (
          <div key={item.menu_id} className="space-y-4 p-4 border rounded-md">
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
