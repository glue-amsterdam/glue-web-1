"use client";

import { useEffect } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { createActionSubmitHandler } from "@/utils/form-helpers";
import { SaveChangesButton } from "@/app/admin/components/save-changes-button";
import { saveHomeStickyCta } from "@/app/actions/admin/home";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  homeStickyCtaSchema,
  type HomeStickyCta,
} from "@/schemas/homeStickyCtaSchema";

type Props = {
  initialData: HomeStickyCta;
};

const HomeStickyCtaAdminForm = ({ initialData }: Props) => {
  const { toast } = useToast();
  const router = useRouter();

  const methods = useForm<HomeStickyCta>({
    resolver: zodResolver(homeStickyCtaSchema),
    defaultValues: initialData,
  });

  const { control, handleSubmit, reset, formState } = methods;

  useEffect(() => {
    reset(initialData);
  }, [initialData, reset]);

  const onSubmit = createActionSubmitHandler(
    saveHomeStickyCta,
    async (saved) => {
      reset(saved);
      toast({
        title: "Success",
        description: "Sticky participants button saved.",
      });
      router.refresh();
    },
    (error) => {
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to save sticky participants button.",
        variant: "destructive",
      });
    }
  );

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={control}
          name="button_label"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Button label</FormLabel>
              <FormControl>
                <Input
                  type="text"
                  value={field.value || ""}
                  onChange={field.onChange}
                  aria-label="Sticky participants button label"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="button_link"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Button link</FormLabel>
              <FormControl>
                <Input
                  type="text"
                  value={field.value || ""}
                  onChange={field.onChange}
                  placeholder="/path or #anchor"
                  aria-label="Sticky participants button link"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <SaveChangesButton
          isSubmitting={formState.isSubmitting}
          isDirty={formState.isDirty}
        />
      </form>
    </FormProvider>
  );
};

export default HomeStickyCtaAdminForm;
