"use client";

import { useForm, FormProvider, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { createSubmitHandler } from "@/utils/form-helpers";
import { useToast } from "@/hooks/use-toast";
import { useEffect, useState } from "react";
import { SaveChangesButton } from "@/app/admin/components/save-changes-button";
import { useRouter } from "next/navigation";
import { type MainMenuData, mainMenuSchema } from "@/schemas/mainSchema";
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
    control,
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
      reset(data);
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
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!initialData.mainMenu || initialData.mainMenu.length === 0) {
    return (
      <div className="p-4 border rounded-md">
        <p>No menu items available. Please add some items to the main menu.</p>
      </div>
    );
  }

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
              <Input {...register(`mainMenu.${index}.className`)} readOnly />
              <Input {...register(`mainMenu.${index}.menu_id`)} readOnly />
            </div>

            {item.section === "about" &&
              item.subItems &&
              Array.isArray(item.subItems) && (
                <div className="mt-4">
                  <h3 className="text-lg font-semibold mb-2">Sub Items</h3>
                  {item.subItems?.map((subItem, subIndex) => (
                    <div
                      key={subIndex}
                      className="flex items-center space-x-4 mb-4"
                    >
                      <div className="flex items-center space-x-2">
                        <Label
                          htmlFor={`subItem-${subIndex}-visible`}
                          className="text-sm font-medium"
                        >
                          Show
                        </Label>
                        <Controller
                          name={`mainMenu.${index}.subItems.${subIndex}.is_visible`}
                          control={control}
                          render={({ field }) => (
                            <Switch
                              id={`subItem-${subIndex}-visible`}
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          )}
                        />
                      </div>
                      <div className="flex-grow">
                        <Label
                          htmlFor={`subItem-${subIndex}-title`}
                          className="text-sm font-medium sr-only"
                        >
                          Title
                        </Label>
                        <Input
                          id={`subItem-${subIndex}-title`}
                          {...register(
                            `mainMenu.${index}.subItems.${subIndex}.title`
                          )}
                          placeholder="Title"
                          className="mt-1"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
          </div>
        ))}
        <SaveChangesButton
          watchFields={["mainMenu", "mainMenu.3.subItems"]}
          isSubmitting={isSubmitting}
          className="w-full"
        />
      </form>
    </FormProvider>
  );
}
