"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { usePathname } from "next/navigation";

export type VisitorIdentity = {
  id: string;
  full_name: string;
  email: string;
};

type VisitorContextType = {
  visitor: VisitorIdentity | null;
  isVisitorLoading: boolean;
  refreshVisitor: () => Promise<void>;
  /** Clears visitor cookie and local visitor state (does not touch Supabase auth). */
  visitorLogout: () => Promise<void>;
};

const VisitorContext = createContext<VisitorContextType | undefined>(undefined);

export function VisitorProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [visitor, setVisitor] = useState<VisitorIdentity | null>(null);
  const [isVisitorLoading, setIsVisitorLoading] = useState(true);

  const refreshVisitor = useCallback(async () => {
    setIsVisitorLoading(true);
    try {
      const res = await fetch("/api/visitors/me", {
        credentials: "include",
        cache: "no-store",
      });
      const data = await res.json().catch(() => ({}));
      const v = data?.visitor;
      if (
        v &&
        typeof v.id === "string" &&
        typeof v.full_name === "string" &&
        typeof v.email === "string"
      ) {
        setVisitor({
          id: v.id,
          full_name: v.full_name,
          email: v.email,
        });
      } else {
        setVisitor(null);
      }
    } catch {
      setVisitor(null);
    } finally {
      setIsVisitorLoading(false);
    }
  }, []);

  const visitorLogout = useCallback(async () => {
    try {
      await fetch("/api/visitors/logout", {
        method: "POST",
        credentials: "include",
      });
    } catch (err) {
      console.error("visitorLogout:", err);
    } finally {
      setVisitor(null);
    }
  }, []);

  useEffect(() => {
    void refreshVisitor();
  }, [pathname, refreshVisitor]);

  return (
    <VisitorContext.Provider
      value={{
        visitor,
        isVisitorLoading,
        refreshVisitor,
        visitorLogout,
      }}
    >
      {children}
    </VisitorContext.Provider>
  );
}

export function useVisitor() {
  const ctx = useContext(VisitorContext);
  if (ctx === undefined) {
    throw new Error("useVisitor must be used within a VisitorProvider");
  }
  return ctx;
}
