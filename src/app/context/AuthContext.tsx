"use client";

import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useRouter } from "next/navigation";
import { User } from "@supabase/supabase-js";
import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";

type AuthContextType = {
  user: User | null;
  isLoginModalOpen: boolean;
  loginError: string | null;
  login: (email: string, password: string) => Promise<User>;
  logout: () => Promise<void>;
  openLoginModal: () => void;
  closeLoginModal: () => void;
  clearLoginError: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  const supabase = createClientComponentClient();

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        setUser(session.user);
      } else {
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, [supabase.auth]);

  const openLoginModal = useCallback(() => setIsLoginModalOpen(true), []);
  const closeLoginModal = useCallback(() => setIsLoginModalOpen(false), []);
  const clearLoginError = useCallback(() => setLoginError(null), []);

  const logout = useCallback(async () => {
    await supabase.auth.signOut();
    setUser(null);
    router.push("/");
  }, [supabase.auth, router]);

  const login = useCallback(
    async (email: string, password: string): Promise<User> => {
      try {
        setLoginError(null);
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          throw error;
        }

        if (data.user) {
          setUser(data.user);

          // Set up a recurring session refresh
          const refreshInterval = setInterval(async () => {
            const { data: refreshData, error: refreshError } =
              await supabase.auth.refreshSession();
            if (refreshError) {
              console.error("Failed to refresh session:", refreshError);
              clearInterval(refreshInterval);
            } else if (refreshData.session) {
              console.log(
                "Session refreshed, new expiry:",
                new Date(refreshData.session.expires_at!).toLocaleString()
              );
            }
          }, 29 * 24 * 60 * 60 * 1000); // Refresh every 29 days

          // Clear the interval when the component unmounts
          const cleanup = () => clearInterval(refreshInterval);

          closeLoginModal();

          // Return cleanup function and user
          cleanup();
          return data.user;
        } else {
          throw new Error("No user returned from Supabase");
        }
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : "Failed to log in. Please check your credentials and try again.";
        setLoginError(errorMessage);
        throw error;
      }
    },
    [supabase.auth, closeLoginModal]
  );

  return (
    <AuthContext.Provider
      value={{
        user,
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
