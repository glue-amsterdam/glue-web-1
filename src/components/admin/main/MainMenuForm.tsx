"use client";

import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createActionSubmitHandler } from "@/utils/form-helpers";
import { useToast } from "@/hooks/use-toast";
import { useEffect, useMemo, useState } from "react";
import { SaveChangesButton } from "@/app/admin/components/save-changes-button";
import { useRouter } from "next/navigation";
import {
  type MainMenuData,
  type MainMenuFormData,
  mainMenuSchema,
} from "@/schemas/mainSchema";
import { parseNavOrder } from "@/lib/nav/build-navbar-links";
import { saveMainMenu } from "@/app/actions/admin/main";

interface MainMenuFormProps {
  initialData: MainMenuData;
}

export default function MainMenuForm({ initialData }: MainMenuFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const methods = useForm<MainMenuFormData, unknown, MainMenuData>({
    resolver: zodResolver(mainMenuSchema),
    defaultValues: initialData,
  });

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = methods;

  const watchedMenu = watch("mainMenu");

  const sortedIndices = useMemo(() => {
    if (!watchedMenu?.length) return [];
    return watchedMenu
      .map((_, index) => index)
      .sort(
        (a, b) =>
          parseNavOrder(watchedMenu[a]?.className ?? "") -
          parseNavOrder(watchedMenu[b]?.className ?? "")
      );
  }, [watchedMenu]);

  useEffect(() => {
    reset(initialData);
  }, [initialData, reset]);

  const onSubmit = createActionSubmitHandler<MainMenuData>(
    saveMainMenu,
    async (data) => {
      toast({
        title: "Main menu updated",
        description: "The main menu has been successfully updated.",
      });
      reset(data);
      router.refresh();
    },
    () => {
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
      const payload: MainMenuData = {
        mainMenu: data.mainMenu.map((item) => ({
          ...item,
          subItems:
            initialData.mainMenu.find((m) => m.menu_id === item.menu_id)
              ?.subItems ?? null,
        })),
      };
      await onSubmit(payload);
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
        <h2 className="text-xl font-semibold">Navigation Labels</h2>
        <p className="text-sm text-gray-600">
          Order 1 = first link in the navbar (left). Set each row&apos;s section
          in the database to match the route (exhibitors, map, program, about).
        </p>
        {sortedIndices.map((index) => {
          const item = watchedMenu[index];
          if (!item) return null;

          return (
            <div
              key={item.menu_id}
              className="space-y-3 p-4 border rounded-md"
            >
              <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                Section: {item.section}
              </p>
              <div className="grid grid-cols-[80px_1fr] gap-3 items-start">
                <div className="space-y-1">
                  <Label
                    htmlFor={`mainMenu-${index}-order`}
                    className="text-xs font-medium text-gray-700"
                  >
                    Order
                  </Label>
                  <Input
                    id={`mainMenu-${index}-order`}
                    {...register(`mainMenu.${index}.className`)}
                    type="text"
                    inputMode="numeric"
                    placeholder="1"
                    className="dashboard-input"
                    aria-label={`Order for ${item.section}`}
                  />
                  {errors.mainMenu?.[index]?.className && (
                    <p className="text-red-500 text-xs">
                      {errors.mainMenu[index]?.className?.message}
                    </p>
                  )}
                </div>
                <div className="space-y-1">
                  <Label
                    htmlFor={`mainMenu-${index}-label`}
                    className="text-xs font-medium text-gray-700"
                  >
                    Label
                  </Label>
                  <Input
                    id={`mainMenu-${index}-label`}
                    {...register(`mainMenu.${index}.label`)}
                    placeholder={`Label for ${item.section}`}
                    className="dashboard-input"
                    aria-label={`Label for ${item.section}`}
                  />
                  {errors.mainMenu?.[index]?.label && (
                    <p className="text-red-500 text-xs">
                      {errors.mainMenu[index]?.label?.message}
                    </p>
                  )}
                </div>
              </div>
              <div className="hidden">
                <Input {...register(`mainMenu.${index}.section`)} readOnly />
                <Input {...register(`mainMenu.${index}.menu_id`)} readOnly />
              </div>
            </div>
          );
        })}
        <div className="flex justify-start">
          <SaveChangesButton
            watchFields={["mainMenu"]}
            isSubmitting={isSubmitting}
          /></div>
      </form>
    </FormProvider>
  );
}
