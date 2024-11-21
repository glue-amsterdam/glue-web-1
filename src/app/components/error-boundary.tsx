"use client";

import { useEffect, ReactNode } from "react";

export default function ErrorBoundary({
  error,
  children,
}: {
  error: Error;
  children: ReactNode;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h2 className="text-2xl font-bold mb-4">Something went wrong!</h2>
      <button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
        Try again
      </button>
      <div>{children}</div>
    </div>
  );
}
