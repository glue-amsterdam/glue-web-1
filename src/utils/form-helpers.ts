import { FieldValues } from "react-hook-form";

export function createSubmitHandler<T extends FieldValues>(
  endpoint: string,
  onSuccess?: (data: T) => void | Promise<void>,
  onError?: (error: unknown) => void
) {
  return async (data: T) => {
    try {
      const response = await fetch(endpoint, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error(`Failed to update: ${response.statusText}`);
      }

      if (onSuccess) {
        await onSuccess(data);
      }
    } catch (error) {
      console.error(`Error updating:`, error);
      if (onError) {
        onError(error);
      }
    }
  };
}
