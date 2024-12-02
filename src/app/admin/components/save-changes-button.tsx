import React from "react";
import { Button } from "@/components/ui/button";
import { useFormContext } from "react-hook-form";

interface SaveChangesButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isSubmitting?: boolean;
  watchFields: string[];
}

export function SaveChangesButton({
  isSubmitting,
  watchFields,
  ...props
}: SaveChangesButtonProps) {
  const {
    formState: { dirtyFields },
  } = useFormContext();

  const isDirty = watchFields.some((field) => {
    const fieldParts = field.split(".");
    let currentDirtyField = dirtyFields;
    for (const part of fieldParts) {
      if (
        currentDirtyField &&
        typeof currentDirtyField === "object" &&
        part in currentDirtyField
      ) {
        currentDirtyField = currentDirtyField[part];
      } else {
        return false;
      }
    }
    return !!currentDirtyField;
  });

  return (
    <Button type="submit" disabled={isSubmitting || !isDirty} {...props}>
      {isSubmitting ? "Saving..." : "Save Changes"}
    </Button>
  );
}
