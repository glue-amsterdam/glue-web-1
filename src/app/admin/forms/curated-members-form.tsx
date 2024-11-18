"use client";

import { useEffect } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { z } from "zod";
import { curatedMembersSectionSchema } from "@/schemas/baseSchema";

type CuratedMembersSection = z.infer<typeof curatedMembersSectionSchema>;

export default function CuratedMembersForm() {
  const methods = useForm<CuratedMembersSection>({
    resolver: zodResolver(curatedMembersSectionSchema),
  });

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = methods;

  useEffect(() => {
    // Fetch curated members section content
    fetch("/api/about")
      .then((res) => res.json())
      .then((data) => {
        setValue("title", data.curatedMembersSection.title);
        setValue("description", data.curatedMembersSection.description);
      });
  }, [setValue]);

  const onSubmit = async (data: CuratedMembersSection) => {
    console.log(data);
    // Uncomment when ready to submit to API
    /* await fetch("/api/curated-members-section", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }); */
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-4">
          <div>
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              {...register("title")}
              placeholder="Section Title"
            />
            {errors.title && (
              <p className="text-red-500">{errors.title.message}</p>
            )}
          </div>
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              {...register("description")}
              placeholder="Section Description"
            />
            {errors.description && (
              <p className="text-red-500">{errors.description.message}</p>
            )}
          </div>
        </div>
        <p className="text-sm text-gray-500">
          {`To add or remove displayed curated members, please manage them from the user administration by marking/unmarking them as "curated/sticky."`}
        </p>
        <Button type="submit">Save Changes</Button>
      </form>
    </FormProvider>
  );
}
