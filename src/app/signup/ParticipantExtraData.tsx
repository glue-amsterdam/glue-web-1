import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const phoneRegex = /^[+]?[0-9\s()-]{7,20}$/;

const socialMediaLinksSchema = z.object({
  instagramLink: z.string().url("Invalid Instagram URL").or(z.literal("")),
  facebookLink: z.string().url("Invalid Facebook URL").or(z.literal("")),
  linkedinLink: z.string().url("Invalid LinkedIn URL").or(z.literal("")),
});

export const participantExtraDataSchema = z.object({
  short_description: z
    .string()
    .min(1, "Short description is required")
    .max(500, "Short description must be 500 characters or less"),
  phone_number: z.array(
    z
      .string()
      .regex(phoneRegex, "Invalid phone number format")
      .or(z.literal(""))
  ),
  social_media: socialMediaLinksSchema.optional(),
  visible_email: z
    .array(z.string().email("Invalid email address").or(z.literal("")))
    .optional(),
  visible_website: z
    .array(z.string().url("Invalid URL").or(z.literal("")))
    .optional(),
});
export type ParticipantExtraDataFormData = z.infer<
  typeof participantExtraDataSchema
>;

interface ParticipantExtraDataFormProps {
  onSubmit: (data: ParticipantExtraDataFormData) => void;
  onBack: () => void;
}

export function ParticipantExtraDataForm({
  onSubmit,
  onBack,
}: ParticipantExtraDataFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ParticipantExtraDataFormData>({
    resolver: zodResolver(participantExtraDataSchema),
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <Label htmlFor="short_description">Short Description</Label>
        <Textarea id="short_description" {...register("short_description")} />
        {errors.short_description && (
          <p className="text-red-500 text-sm mt-1">
            {errors.short_description.message}
          </p>
        )}
      </div>
      <div>
        <Label htmlFor="phone_number">Phone Number(s)</Label>
        <Input
          id="phone_number"
          {...register("phone_number.0")}
          placeholder="Primary phone number"
        />
        <Input
          {...register("phone_number.1")}
          placeholder="Secondary phone number (optional)"
          className="mt-2"
        />
        {errors.phone_number && (
          <p className="text-red-500 text-sm mt-1">
            {errors.phone_number.message}
          </p>
        )}
      </div>

      <div>
        <Label htmlFor="visible_email">Visible Email(s)</Label>
        <Input
          id="visible_email"
          {...register("visible_email.0")}
          placeholder="Primary visible email (optional)"
        />
        <Input
          {...register("visible_email.1")}
          placeholder="Secondary visible email (optional)"
          className="mt-2"
        />
        {errors.visible_email && errors.visible_email[0] && (
          <p className="text-red-500 text-sm mt-1">
            {errors.visible_email[0].message}
          </p>
        )}
        {errors.visible_email && errors.visible_email[1] && (
          <p className="text-red-500 text-sm mt-1">
            {errors.visible_email[1].message}
          </p>
        )}
      </div>
      <div>
        <Label htmlFor="visible_website">Visible Website(s)</Label>
        <Input
          id="visible_website"
          {...register("visible_website.0")}
          placeholder="Primary website URL (optional)"
        />
        <Input
          {...register("visible_website.1")}
          placeholder="Secondary website URL (optional)"
          className="mt-2"
        />
        {errors.visible_website && errors.visible_website[0] && (
          <p className="text-red-500 text-sm mt-1">
            {errors.visible_website[0].message}
          </p>
        )}
        {errors.visible_website && errors.visible_website[1] && (
          <p className="text-red-500 text-sm mt-1">
            {errors.visible_website[1].message}
          </p>
        )}
      </div>
      <div>
        <Label>Social Media Links</Label>
        <Input
          {...register("social_media.instagramLink")}
          placeholder="Instagram URL"
          className="mt-2"
        />
        {errors.social_media?.instagramLink && (
          <p className="text-red-500 text-sm mt-1">
            {errors.social_media.instagramLink.message}
          </p>
        )}
        <Input
          {...register("social_media.facebookLink")}
          placeholder="Facebook URL"
          className="mt-2"
        />
        {errors.social_media?.facebookLink && (
          <p className="text-red-500 text-sm mt-1">
            {errors.social_media.facebookLink.message}
          </p>
        )}
        <Input
          {...register("social_media.linkedinLink")}
          placeholder="LinkedIn URL"
          className="mt-2"
        />
        {errors.social_media?.linkedinLink && (
          <p className="text-red-500 text-sm mt-1">
            {errors.social_media.linkedinLink.message}
          </p>
        )}
      </div>
      <div className="flex justify-between">
        <Button type="button" variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button
          className="bg-[var(--color-box1)] hover:bg-[var(--color-box1)] hover:opacity-75"
          type="submit"
        >
          Next: Account Information
        </Button>
      </div>
    </form>
  );
}
