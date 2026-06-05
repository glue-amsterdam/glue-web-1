"use client";

import { useRouter } from "next/navigation";
import { User } from "@supabase/supabase-js";
import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { createBrowserClient } from "@supabase/ssr";
import type { NavbarIdentity } from "@/lib/users/get-navbar-identity";

export type LoginResult = {
  user: User;
  dashboardHref: string | null;
  isParticipant: boolean;
  isVisitorOnly: boolean;
};

type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  navbarIdentity: NavbarIdentity | null;
  isLoginModalOpen: boolean;
  loginError: string | null;
  login: (email: string, password: string) => Promise<LoginResult>;
  logout: () => Promise<void>;
  openLoginModal: () => void;
  closeLoginModal: () => void;
  clearLoginError: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [navbarIdentity, setNavbarIdentity] = useState<NavbarIdentity | null>(
    null
  );
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    const initializeAuth = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
      setIsLoading(false);

      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange((event, session) => {
        setUser(session?.user ?? null);
        if (event === "SIGNED_OUT") {
          setNavbarIdentity(null);
          router.refresh();
        }
      });

      return () => subscription.unsubscribe();
    };

    initializeAuth();
  }, [supabase.auth, router]);

  useEffect(() => {
    if (!user && !isLoading) {
      const currentPath = window.location.pathname;
      if (currentPath.startsWith("/dashboard")) {
        router.push(`/`);
      }
    }
  }, [user, isLoading, router]);

  const openLoginModal = useCallback(() => setIsLoginModalOpen(true), []);
  const closeLoginModal = useCallback(() => setIsLoginModalOpen(false), []);
  const clearLoginError = useCallback(() => setLoginError(null), []);

  const logout = useCallback(async () => {
    setUser(null);
    setNavbarIdentity(null);

    try {
      const [response] = await Promise.all([
        fetch("/api/auth/logout", { method: "POST" }),
        supabase.auth.signOut(),
      ]);

      if (!response.ok) {
        throw new Error("Logout failed");
      }

      router.refresh();
      router.push("/");
    } catch (error) {
      console.error("Logout error:", error);
    }
  }, [router, supabase.auth]);

  const login = useCallback(
    async (email: string, password: string): Promise<LoginResult> => {
      try {
        setLoginError(null);
        const response = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to log in");
        }

        if (data.user) {
          const identity: NavbarIdentity = {
            isParticipant: data.isParticipant === true,
            isVisitorOnly: data.isVisitorOnly === true,
            dashboardHref:
              typeof data.dashboardHref === "string" ? data.dashboardHref : null,
          };

          setNavbarIdentity(identity);
          setUser(data.user);
          closeLoginModal();
          router.refresh();
          return {
            user: data.user,
            dashboardHref: identity.dashboardHref,
            isParticipant: identity.isParticipant,
            isVisitorOnly: identity.isVisitorOnly,
          };
        }

        throw new Error("No user returned from server");
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : "Failed to log in. Please check your credentials and try again.";
        setLoginError(errorMessage);
        throw error;
      }
    },

    [closeLoginModal, router]
  );

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        navbarIdentity,
        isLoginModalOpen,
        loginError,
        login,
        logout,
        openLoginModal,
        closeLoginModal,
        clearLoginError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
