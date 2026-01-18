import type React from "react";
import { ControllerRenderProps, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

export const participantExtraDataSchema = z.object({
  short_description: z
    .string()
    .min(1, "Short description is required")
    .max(500, "Short description must be 500 characters or less"),
  phone_numbers: z
    .array(z.string())
    .max(3, "Only 3 items max")
    .nullable()
    .optional(),
  social_media: z.record(z.string(), z.any()).nullable().optional(),
  visible_emails: z.array(z.string()).max(3, "Only 3 items max").nullable(),
  glue_communication_email: z
    .string()
    .min(1, "Email for practical GLUE communication is required")
    .email("Please enter a valid email address"),
  visible_websites: z
    .array(z.string())
    .max(3, "Only 3 items max")
    .nullable()
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
  const form = useForm<ParticipantExtraDataFormData>({
    resolver: zodResolver(participantExtraDataSchema),
    defaultValues: {
      phone_numbers: [],
      visible_emails: [],
      glue_communication_email: "",
      visible_websites: [],
      social_media: {},
    },
  });

  const handleArrayChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    field: ControllerRenderProps<ParticipantExtraDataFormData>
  ) => {
    const newValue = e.target.value.split(",").map((s) => s.trim());
    field.onChange(newValue);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="short_description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Short Description</FormLabel>
              <FormControl>
                <Textarea {...field} />
              </FormControl>
              <FormDescription>
                Provide a brief description (max 500 characters)
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="glue_communication_email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email for Practical GLUE Communication</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  type="email"
                  value={typeof field.value === "string" ? field.value : ""}
                  onChange={(e) => field.onChange(e.target.value)}
                  placeholder="Enter email for practical GLUE communication"
                />
              </FormControl>
              <FormDescription>
                This email will be used for practical GLUE communication
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="phone_numbers"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Phone Number(s)</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  value={field.value?.join(", ") || ""}
                  onChange={(e) => handleArrayChange(e, field)}
                  placeholder="Enter phone numbers separated by commas"
                />
              </FormControl>
              <FormDescription>
                Enter phone numbers separated by commas (max 3)
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="visible_emails"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Visible Email(s)</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  value={field.value?.join(", ") || ""}
                  onChange={(e) => handleArrayChange(e, field)}
                  placeholder="Enter visible emails separated by commas"
                />
              </FormControl>
              <FormDescription>
                Enter visible email addresses separated by commas (max 3)
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="visible_websites"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Visible Website(s)</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  value={field.value?.join(", ") || ""}
                  onChange={(e) => handleArrayChange(e, field)}
                  placeholder="Enter visible websites separated by commas"
                />
              </FormControl>
              <FormDescription>
                Enter visible websites separated by commas (max 3)
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Social Media</h3>
          <FormField
            control={form.control}
            name="social_media.facebookLink"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Facebook Link</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    value={field.value || ""}
                    className="bg-white text-black"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="social_media.linkedinLink"
            render={({ field }) => (
              <FormItem>
                <FormLabel>LinkedIn Link</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    value={field.value || ""}
                    className="bg-white text-black"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="social_media.instagramLink"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Instagram Link</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    value={field.value || ""}
                    className="bg-white text-black"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-between flex-wrap gap-2">
          <Button type="button" variant="outline" onClick={onBack}>
            Back
          </Button>
          <Button
            className="bg-[var(--color-box1)] hover:bg-[var(--color-box1)] hover:opacity-75 text-pretty h-fit"
            type="submit"
          >
            Next Step
          </Button>
        </div>
      </form>
    </Form>
  );
}
