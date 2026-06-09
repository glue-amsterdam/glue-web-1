export const devLog = (scope: string, message: string, data?: unknown) => {
  if (process.env.NODE_ENV !== "development") {
    return;
  }

  if (data !== undefined) {
    console.debug(`[${scope}] ${message}`, data);
    return;
  }

  console.debug(`[${scope}] ${message}`);
};
