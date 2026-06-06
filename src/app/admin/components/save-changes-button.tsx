"use client";

import React, { useEffect, useState } from "react";
import { getBigButtonClassName } from "@/components/big-button";
import { useFormContext } from "react-hook-form";

interface SaveChangesButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isSubmitting?: boolean;
  watchFields?: string[];
  label?: string;
  isDirty?: boolean;
}

export function SaveChangesButton({
  isSubmitting,
  watchFields = [],
  label,
  isDirty: isDirtyProp,
  className,
  children,
  disabled: disabledProp,
  ...props
}: SaveChangesButtonProps) {
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

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

  const isDirty =
    isDirtyProp ||
    (watchFields.length > 0 ? isDirtyFromWatchFields : formIsDirty);

  const isDisabled = !hasMounted
    ? true
    : Boolean(
        isSubmitting || disabledProp || (!isDirty && !isDirtyProp)
      );

  return (
    <button
      type="submit"
      disabled={isDisabled}
      className={getBigButtonClassName({ mode: "big", className })}
      {...props}
    >
      {children ?? label ?? (isSubmitting ? "Saving..." : "Save Changes")}
    </button>
  );
}
