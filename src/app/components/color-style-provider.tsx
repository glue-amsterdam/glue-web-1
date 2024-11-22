"use client";

import { useEffect } from "react";

function createColorStyles(colors: Record<string, string>) {
  return Object.entries(colors).reduce((acc, [key, value]) => {
    acc[`--color-${key}`] = value;
    return acc;
  }, {} as Record<string, string>);
}

export function ColorStyleProvider({
  children,
  colors,
}: {
  children: React.ReactNode;
  colors: Record<string, string>;
}) {
  useEffect(() => {
    const root = document.documentElement;
    const styles = createColorStyles(colors);
    Object.entries(styles).forEach(([key, value]) => {
      root.style.setProperty(key, value);
    });
  }, [colors]);

  return <>{children}</>;
}
