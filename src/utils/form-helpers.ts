export async function handleFormSubmit<T>(
  endpoint: string,
  data: T
): Promise<Response> {
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

  return response;
}

export function createSubmitHandler<T>(
  endpoint: string,
  onSuccess?: () => void,
  onError?: (error: unknown) => void
): (data: T) => Promise<void> {
  return async (data: T) => {
    try {
      await handleFormSubmit(endpoint, data);
      onSuccess?.();
    } catch (error) {
      console.error(`Error updating:`, error);
      onError?.(error);
    }
  };
}
