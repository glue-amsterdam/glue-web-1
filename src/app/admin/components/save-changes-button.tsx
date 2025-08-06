"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { useFormContext } from "react-hook-form";

interface SaveChangesButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isSubmitting?: boolean;
  watchFields: string[];
  label?: string;
  isDirty?: boolean;
}

export function SaveChangesButton({
  isSubmitting,
  watchFields,
  label,
  isDirty: isDirtyProp,
  ...props
}: SaveChangesButtonProps) {
  const {
    formState: { dirtyFields, isDirty: formIsDirty },
  } = useFormContext();

  const isDirtyFromWatchFields = watchFields.some((field) => {
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

  const isDirty = isDirtyFromWatchFields || isDirtyProp || formIsDirty;

  return (
    <Button
      type="submit"
      disabled={isSubmitting || (!isDirty && !isDirtyProp)}
      {...props}
    >
      {label ? label : isSubmitting ? "Saving..." : "Save Changes"}
    </Button>
  );
}
