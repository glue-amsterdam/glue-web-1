"use client";

import { NavigationProvider } from "./context/NavigationContext";

export default function Template({ children }: { children: React.ReactNode }) {
  return <NavigationProvider>{children}</NavigationProvider>;
}
