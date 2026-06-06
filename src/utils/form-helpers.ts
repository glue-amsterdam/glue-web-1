import type { FieldValues, Path, UseFormReturn } from "react-hook-form";

export function createSubmitHandler<T extends FieldValues>(
  endpoint: string,
  onSuccess?: (data: T) => void | Promise<void>,
  onError?: (error: unknown) => void,
  method: "PUT" | "POST" = "PUT"
) {
  return async (data: T) => {
    try {
      const response = await fetch(endpoint, {
        method: method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error(`Failed to update: ${response.statusText}`);
      }

      const responseData = await response.json();

      if (onSuccess) {
        await onSuccess(responseData);
      }
    } catch (error) {
      console.error(`Error updating:`, error);
      if (onError) {
        onError(error);
      }
    }
  };
}

export const resetWatchedFieldsDirtyState = <T extends FieldValues>(
  form: UseFormReturn<T>,
  fields: readonly string[]
) => {
  for (const field of fields) {
    const fieldPath = field as Path<T>;
    form.resetField(fieldPath, { defaultValue: form.getValues(fieldPath) });
  }
};
