"use client";

import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useFormContext } from "react-hook-form";
import type { ParticipantDetailsInput } from "@/schemas/participantDetailsSchemas";

const inputClassName =
  "bg-(--white-color) text-(--black-color) disabled:opacity-60";

const parseCommaSeparatedList = (value: string): string[] =>
  value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

type ContactFieldsProps = {
  readOnly?: boolean;
};

export const ContactFields = ({ readOnly = false }: ContactFieldsProps) => {
  const { control } = useFormContext<ParticipantDetailsInput>();

  return (
    <div className="mini-padding space-y-[15px]">
      <FormField
        control={control}
        name="display_name"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Display name</FormLabel>
            <FormControl>
              <Input
                {...field}
                value={field.value || ""}
                disabled={readOnly}
                className={inputClassName}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="phone_numbers"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Phone numbers</FormLabel>
            <FormControl>
              <Input
                value={field.value?.join(", ") || ""}
                disabled={readOnly}
                className={inputClassName}
                onChange={(e) =>
                  field.onChange(parseCommaSeparatedList(e.target.value))
                }
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
        control={control}
        name="visible_emails"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Visible emails</FormLabel>
            <FormControl>
              <Input
                value={field.value?.join(", ") || ""}
                disabled={readOnly}
                className={inputClassName}
                onChange={(e) =>
                  field.onChange(parseCommaSeparatedList(e.target.value))
                }
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
        control={control}
        name="glue_communication_email"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Email for practical GLUE communication</FormLabel>
            <FormControl>
              <Input
                type="email"
                value={typeof field.value === "string" ? field.value : ""}
                disabled={readOnly}
                className={inputClassName}
                placeholder="Enter email for practical GLUE communication"
                onChange={field.onChange}
                onBlur={field.onBlur}
                name={field.name}
                ref={field.ref}
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
        control={control}
        name="visible_websites"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Visible websites</FormLabel>
            <FormControl>
              <Input
                value={field.value?.join(", ") || ""}
                disabled={readOnly}
                className={inputClassName}
                onChange={(e) =>
                  field.onChange(parseCommaSeparatedList(e.target.value))
                }
              />
            </FormControl>
            <FormDescription>
              Enter visible websites separated by commas (max 3)
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};
