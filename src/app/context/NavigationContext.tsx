"use client";
import { createContext, useContext, useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

const NavigationContext = createContext<{
  previousUrl: string | null;
}>({
  previousUrl: null,
});

export function NavigationProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const prevPathRef = useRef<string | null>(null);
  const [previousUrl, setPreviousUrl] = useState<string | null>(null);

  useEffect(() => {
    const lastPath = sessionStorage.getItem("lastPath");
    if (pathname === "/") {
      setPreviousUrl(lastPath);
      prevPathRef.current = lastPath;
      return;
    }
    setPreviousUrl(lastPath);
    prevPathRef.current = lastPath;
    sessionStorage.setItem("lastPath", pathname);
  }, [pathname]);

  return (
    <NavigationContext.Provider value={{ previousUrl }}>
      {children}
    </NavigationContext.Provider>
  );
}

export function useNavigation() {
  return useContext(NavigationContext);
}
