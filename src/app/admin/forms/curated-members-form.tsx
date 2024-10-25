"use client";

import { useFormContext } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CuratedMemberSectionContent } from "@/utils/about-types";
import { Textarea } from "@/components/ui/textarea";

type FormData = {
  aboutSection: {
    curatedMembersSection: CuratedMemberSectionContent;
  };
};

export default function CuratedMembersForm() {
  const {
    register,
    formState: { errors },
  } = useFormContext<FormData>();

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          {...register("aboutSection.curatedMembersSection.title", {
            required: "Title is required",
          })}
          placeholder="Section Title"
        />
        {errors.aboutSection?.curatedMembersSection?.title && (
          <p className="text-red-500">
            {errors.aboutSection.curatedMembersSection.title.message}
          </p>
        )}
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          {...register("aboutSection.curatedMembersSection.description", {
            required: "Description is required",
          })}
          placeholder="Section Description"
        />
        {errors.aboutSection?.curatedMembersSection?.description && (
          <p className="text-red-500">
            {errors.aboutSection.curatedMembersSection.description.message}
          </p>
        )}
      </div>
      <p>{`To add or remove displayed curated, please manage them from the user administration by marking/unmarking them as "curated/sticky."`}</p>
    </div>
  );
}
