import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ParticipantsSectionContent } from "@/utils/about-types";
import { useFormContext } from "react-hook-form";

type FormData = {
  aboutSection: {
    participantsSection: ParticipantsSectionContent;
  };
};

function ParticipantsForm() {
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
          {...register("aboutSection.participantsSection.title", {
            required: "Title is required",
          })}
          placeholder="Section Title"
        />
        {errors.aboutSection?.participantsSection?.title && (
          <p className="text-red-500">
            {errors.aboutSection.participantsSection.title.message}
          </p>
        )}
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          {...register("aboutSection.participantsSection.description", {
            required: "Description is required",
          })}
          placeholder="Section Description"
        />
        {errors.aboutSection?.participantsSection?.description && (
          <p className="text-red-500">
            {errors.aboutSection.participantsSection.description.message}
          </p>
        )}
      </div>
      <p>{`To add or remove displayed participants, please manage them from the user administration by marking/unmarking them as "participant."`}</p>
    </div>
  );
}

export default ParticipantsForm;
