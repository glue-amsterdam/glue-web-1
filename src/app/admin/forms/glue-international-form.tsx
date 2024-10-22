"use client";

import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { GlueInternationalContent } from "@/utils/about-types";

interface GlueInternationalFormProps {
  initialData: GlueInternationalContent;
}

export default function GlueInternationalForm({
  initialData,
}: GlueInternationalFormProps) {
  const { register, handleSubmit } = useForm<GlueInternationalContent>({
    defaultValues: initialData,
  });

  const onSubmit = (data: GlueInternationalContent) => {
    console.log(data);
    alert("GLUE International content updated successfully!");
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-4 bg-indigo-50 p-4 rounded-lg"
    >
      <Input {...register("title")} placeholder="Title" />
      <Input {...register("subtitle")} placeholder="Subtitle" />
      <Input {...register("buttonText")} placeholder="Button Text" />
      <Input {...register("website")} placeholder="Website URL" />
      <Button
        type="submit"
        className="w-full bg-indigo-500 hover:bg-indigo-600"
      >
        Update GLUE International
      </Button>
    </form>
  );
}
