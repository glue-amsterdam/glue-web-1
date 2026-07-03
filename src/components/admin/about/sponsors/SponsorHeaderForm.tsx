"use client";

import { useForm, useFieldArray, FormProvider, Control } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";
import { SponsorsHeader, sponsorsHeaderSchema } from "@/schemas/sponsorsSchema";
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { SaveChangesButton } from "@/app/admin/components/save-changes-button";
import { createActionSubmitHandler } from "@/utils/form-helpers";
import { saveAboutSponsorsHeader } from "@/app/actions/admin/about";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import { RichTextEditor } from "@/components/editor";
import { slugifySponsorTypeId } from "@/lib/about/sponsor-type-utils";

type SponsorHeaderFormProps = {
  initialData: SponsorsHeader;
};

export const SponsorSectionSettingsCard = ({
  control,
}: {
  control: Control<SponsorsHeader>;
}) => (
  <div className="space-y-6">
    <FormField
      control={control}
      name="is_visible"
      render={({ field }) => (
        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
          <div className="space-y-0.5">
            <FormLabel className="text-base">Visible</FormLabel>
            <FormDescription>
              Show or hide the partners section in the site footer
            </FormDescription>
          </div>
          <FormControl>
            <Switch checked={field.value} onCheckedChange={field.onChange} />
          </FormControl>
        </FormItem>
      )}
    />
    <FormField
      control={control}
      name="title"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Section title</FormLabel>
          <FormControl>
            <Input value={field.value || ""} onChange={field.onChange} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
    <FormField
      control={control}
      name="description"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Description</FormLabel>
          <FormControl>
            <RichTextEditor value={field.value || ""} onChange={field.onChange} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  </div>
);

export const SponsorGroupsCard = ({
  control,
  register,
  errors,
}: {
  control: Control<SponsorsHeader>;
  register: ReturnType<typeof useForm<SponsorsHeader>>["register"];
  errors: ReturnType<typeof useForm<SponsorsHeader>>["formState"]["errors"];
}) => {
  const { fields, append, remove } = useFieldArray({
    control,
    name: "sponsors_types",
  });

  const handleAddGroup = () => {
    const baseId = slugifySponsorTypeId(`group-${fields.length + 1}`);
    append({ id: baseId, label: "" });
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Partner groups define how sponsors are organized in the footer. Renaming
        a group label does not break existing partners.
      </p>
      {fields.map((field, index) => (
        <div
          key={field.id}
          className="flex items-center gap-3 rounded-lg border p-3"
        >
          <div className="min-w-0 flex-1">
            <input
              type="hidden"
              {...register(`sponsors_types.${index}.id`)}
            />
            <Input
              {...register(`sponsors_types.${index}.label`)}
              placeholder="Group label"
            />
          </div>
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => remove(index)}
            aria-label={`Remove group ${field.label || field.id}`}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ))}
      {errors.sponsors_types && (
        <p className="text-red-500">
          {Array.isArray(errors.sponsors_types)
            ? errors.sponsors_types[0]?.label?.message
            : errors.sponsors_types.message}
        </p>
      )}
      <Button type="button" variant="outline" size="sm" onClick={handleAddGroup}>
        <Plus className="mr-2 h-4 w-4" />
        Add group
      </Button>
    </div>
  );
};

export default function SponsorHeaderForm({
  initialData,
}: SponsorHeaderFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const methods = useForm<SponsorsHeader>({
    resolver: zodResolver(sponsorsHeaderSchema),
    defaultValues: initialData,
  });

  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = methods;

  useEffect(() => {
    reset(initialData);
  }, [initialData, reset]);

  const onSubmit = createActionSubmitHandler<SponsorsHeader>(
    saveAboutSponsorsHeader,
    async () => {
      toast({
        title: "Sponsors section updated",
        description: "Partners section settings were saved successfully.",
      });
      router.refresh();
    },
    (error) => {
      toast({
        title: "Error",
        description: `Failed to update sponsors section. ${error}`,
        variant: "destructive",
      });
    }
  );

  const handleFormSubmit = async (data: SponsorsHeader) => {
    setIsSubmitting(true);
    await onSubmit(data);
    setIsSubmitting(false);
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-8">
        <section className="rounded-lg border p-4">
          <h3 className="mb-4 text-lg font-semibold">Section settings</h3>
          <SponsorSectionSettingsCard control={control} />
        </section>

        <section className="rounded-lg border p-4">
          <h3 className="mb-4 text-lg font-semibold">Partner groups</h3>
          <SponsorGroupsCard
            control={control}
            register={register}
            errors={errors}
          />
        </section>

        <SaveChangesButton
          isSubmitting={isSubmitting}
          watchFields={[
            "title",
            "description",
            "sponsors_types",
            "is_visible",
          ]}
          className="w-full sm:w-auto"
        />
      </form>
    </FormProvider>
  );
}
