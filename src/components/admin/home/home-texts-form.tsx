"use client";

import { useEffect, useState } from "react";
import { useForm, useFieldArray, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { createSubmitHandler } from "@/utils/form-helpers";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2 } from "lucide-react";
import { SaveChangesButton } from "@/app/admin/components/save-changes-button";
import { useRouter } from "next/navigation";
import { mutate } from "swr";
import { ColorPicker } from "@/components/ui/color-picker";
import {
  homeTextsFormSchema,
  type HomeTextPlacement,
  type HomeTextsFormData,
} from "@/schemas/mainSchema";

const FOOTER_LEFT: HomeTextPlacement = "footer_left";
const FOOTER_RIGHT: HomeTextPlacement = "footer_right";
const MARQUEE: HomeTextPlacement = "marquee";

interface HomeTextsFormProps {
  initialData: HomeTextsFormData;
}

const createFooterBootstrapPayload = (placement: HomeTextPlacement) => ({
  label: placement === FOOTER_LEFT ? "Footer left" : "Footer right",
  color: null,
  href: null,
  placement,
  sort_order: 0,
});

const HomeTextRowFields = ({
  index,
  errors,
  register,
  watch,
  setValue,
  showDelete,
  onDelete,
}: {
  index: number;
  errors: ReturnType<typeof useForm<HomeTextsFormData>>["formState"]["errors"];
  register: ReturnType<typeof useForm<HomeTextsFormData>>["register"];
  watch: ReturnType<typeof useForm<HomeTextsFormData>>["watch"];
  setValue: ReturnType<typeof useForm<HomeTextsFormData>>["setValue"];
  showDelete: boolean;
  onDelete?: () => void;
}) => (
  <div className="flex items-start justify-between gap-4">
    <input type="hidden" {...register(`homeTexts.${index}.placement`)} />
    <div className="grid flex-1 grid-cols-1 gap-4 md:grid-cols-2">
      <div className="space-y-2">
        <Label htmlFor={`homeTexts.${index}.label`}>Text</Label>
        <Input
          id={`homeTexts.${index}.label`}
          className="dashboard-input"
          {...register(`homeTexts.${index}.label`)}
          placeholder="Display text"
        />
        {errors.homeTexts?.[index]?.label && (
          <p className="base-text-size text-red-500">
            {errors.homeTexts[index]?.label?.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor={`homeTexts.${index}.href`}>Link (optional)</Label>
        <Input
          id={`homeTexts.${index}.href`}
          className="dashboard-input"
          {...register(`homeTexts.${index}.href`)}
          placeholder="/about or https://example.com"
        />
        {errors.homeTexts?.[index]?.href && (
          <p className="base-text-size text-red-500">
            {errors.homeTexts[index]?.href?.message}
          </p>
        )}
      </div>

      <div>
        <ColorPicker
          value={watch(`homeTexts.${index}.color`) || "#ffffff"}
          onChange={(val) =>
            setValue(`homeTexts.${index}.color`, val, { shouldDirty: true })
          }
          name={`homeTexts.${index}.color`}
          label="Color (optional)"
        />
      </div>
    </div>

    {showDelete && onDelete ? (
      <Button
        type="button"
        variant="destructive"
        size="sm"
        onClick={onDelete}
        className="flex shrink-0 items-center space-x-1"
        aria-label="Delete marquee text row"
      >
        <Trash2 className="h-4 w-4" />
        <span>Delete</span>
      </Button>
    ) : null}
  </div>
);

export default function HomeTextsForm({ initialData }: HomeTextsFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [isBootstrapping, setIsBootstrapping] = useState(() => {
    const hasLeft = initialData.homeTexts.some(
      (item) => item.placement === FOOTER_LEFT
    );
    const hasRight = initialData.homeTexts.some(
      (item) => item.placement === FOOTER_RIGHT
    );
    return !hasLeft || !hasRight;
  });
  const { toast } = useToast();
  const router = useRouter();

  const methods = useForm<HomeTextsFormData>({
    resolver: zodResolver(homeTextsFormSchema),
    defaultValues: initialData,
  });

  const {
    control,
    handleSubmit,
    formState: { errors },
    register,
    reset,
    getValues,
    setValue,
    watch,
  } = methods;

  const { fields, append, remove } = useFieldArray({
    control,
    name: "homeTexts",
  });

  const homeTexts = watch("homeTexts");

  const footerLeftIndex = homeTexts.findIndex(
    (item) => item.placement === FOOTER_LEFT
  );
  const footerRightIndex = homeTexts.findIndex(
    (item) => item.placement === FOOTER_RIGHT
  );
  const marqueeIndices = homeTexts
    .map((item, index) => (item.placement === MARQUEE ? index : -1))
    .filter((index) => index >= 0);

  useEffect(() => {
    const ensureFooterSlots = async () => {
      try {
        const currentTexts = initialData.homeTexts;
        const hasLeft = currentTexts.some(
          (item) => item.placement === FOOTER_LEFT
        );
        const hasRight = currentTexts.some(
          (item) => item.placement === FOOTER_RIGHT
        );

        if (hasLeft && hasRight) {
          return;
        }

        const createdItems = [];

        if (!hasLeft) {
          const response = await fetch("/api/admin/main/home_text", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(createFooterBootstrapPayload(FOOTER_LEFT)),
          });
          if (!response.ok) {
            throw new Error("Failed to create footer left slot");
          }
          createdItems.push(await response.json());
        }

        if (!hasRight) {
          const response = await fetch("/api/admin/main/home_text", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(createFooterBootstrapPayload(FOOTER_RIGHT)),
          });
          if (!response.ok) {
            throw new Error("Failed to create footer right slot");
          }
          createdItems.push(await response.json());
        }

        if (createdItems.length > 0) {
          reset({ homeTexts: [...currentTexts, ...createdItems] });
          await mutate("/api/admin/main/home_text");
        }
      } catch (error) {
        console.error("Error ensuring footer slots:", error);
        toast({
          title: "Error",
          description: "Failed to initialize footer text slots.",
          variant: "destructive",
        });
      } finally {
        setIsBootstrapping(false);
      }
    };

    void ensureFooterSlots();
  }, [initialData, reset, toast]);

  const onSubmit = createSubmitHandler<HomeTextsFormData>(
    "/api/admin/main/home_text",
    async (data) => {
      toast({
        title: "Home texts updated",
        description: "Footer and marquee texts have been successfully updated.",
      });
      reset(data);
      await mutate("/api/admin/main/home_text");
      router.refresh();
    },
    (error) => {
      toast({
        title: "Error",
        description: "Failed to update home texts. " + error,
        variant: "destructive",
      });
    }
  );

  const handleFormSubmit = async (data: HomeTextsFormData) => {
    setIsSubmitting(true);
    await onSubmit(data);
    setIsSubmitting(false);
  };

  const handleAddMarquee = async () => {
    setIsAdding(true);
    try {
      const response = await fetch("/api/admin/main/home_text", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          label: "",
          color: null,
          href: null,
          placement: MARQUEE,
          sort_order: fields.length,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create marquee text row");
      }

      const newItem = await response.json();
      append(newItem);

      toast({
        title: "Marquee text added",
        description: "A new marquee row has been added.",
      });
    } catch (error) {
      console.error("Error adding marquee text row:", error);
      toast({
        title: "Error",
        description: "Failed to add marquee text row. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsAdding(false);
    }
  };

  const handleDeleteMarquee = async (index: number, id?: string) => {
    if (!id) return;

    try {
      const response = await fetch(`/api/admin/main/home_text?id=${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete marquee text row");
      }

      remove(index);

      toast({
        title: "Marquee text deleted",
        description: "The marquee row has been deleted.",
      });
    } catch (error) {
      console.error("Error deleting marquee text row:", error);
      toast({
        title: "Error",
        description: "Failed to delete marquee text row. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (isBootstrapping && (footerLeftIndex === -1 || footerRightIndex === -1)) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-zinc-900" />
      </div>
    );
  }

  return (
    <FormProvider {...methods}>
      <div className="space-y-8">
        <p className="base-text-size text-zinc-600">
          Manage marquee and footer texts shown in the bottom banner. Footer
          left and right are fixed to one text each; you can add multiple
          marquee items.
        </p>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-8">
          <section className="space-y-4 rounded-md border p-4">
            <h3 className="title-text">Footer left</h3>
            {footerLeftIndex >= 0 ? (
              <HomeTextRowFields
                index={footerLeftIndex}
                errors={errors}
                register={register}
                watch={watch}
                setValue={setValue}
                showDelete={false}
              />
            ) : null}
          </section>

          <section className="space-y-4 rounded-md border p-4">
            <h3 className="title-text">Footer right</h3>
            {footerRightIndex >= 0 ? (
              <HomeTextRowFields
                index={footerRightIndex}
                errors={errors}
                register={register}
                watch={watch}
                setValue={setValue}
                showDelete={false}
              />
            ) : null}
          </section>

          <section className="space-y-4 rounded-md border p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h3 className="title-text">Marquee</h3>
              <Button
                type="button"
                onClick={handleAddMarquee}
                disabled={isAdding}
                className="flex items-center space-x-2"
              >
                <Plus className="h-4 w-4" />
                <span>{isAdding ? "Adding..." : "Add marquee text"}</span>
              </Button>
            </div>

            {marqueeIndices.length === 0 ? (
              <p className="base-text-size text-zinc-500">
                No marquee texts yet. Click &quot;Add marquee text&quot; to
                create one.
              </p>
            ) : (
              marqueeIndices.map((index) => {
                const rowId = getValues(`homeTexts.${index}.id`);
                return (
                  <div
                    key={fields[index]?.id ?? index}
                    className="space-y-4 rounded-md border border-zinc-200 p-4"
                  >
                    <HomeTextRowFields
                      index={index}
                      errors={errors}
                      register={register}
                      watch={watch}
                      setValue={setValue}
                      showDelete
                      onDelete={() => handleDeleteMarquee(index, rowId)}
                    />
                  </div>
                );
              })
            )}
          </section>

          {fields.length > 0 && (
            <div className="flex justify-start">
              <SaveChangesButton
                watchFields={["homeTexts"]}
                isSubmitting={isSubmitting}
              />
            </div>
          )}
        </form>
      </div>
    </FormProvider>
  );
}
