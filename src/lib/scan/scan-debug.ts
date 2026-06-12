import { isDataDebugEnabled } from "@/lib/data-debug";

export const scanDebug = (scope: string, step: string, meta?: Record<string, unknown>) => {
  if (!isDataDebugEnabled()) return;
  console.log(
    `[${scope}] ${step}`,
    meta && Object.keys(meta).length > 0 ? JSON.stringify(meta) : "",
  );
};
