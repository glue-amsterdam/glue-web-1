import React from "react";
import { Button } from "@/components/ui/button";
import { useFormContext } from "react-hook-form";

interface SaveChangesButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isSubmitting: boolean;
}

export function SaveChangesButton({
  isSubmitting,
  ...props
}: SaveChangesButtonProps) {
  const {
    formState: { isDirty },
  } = useFormContext();

  return (
    <Button type="submit" disabled={isSubmitting || !isDirty} {...props}>
      {isSubmitting ? "Saving..." : "Save Changes"}
    </Button>
  );
}
