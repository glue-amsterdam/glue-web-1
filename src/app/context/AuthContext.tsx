"use client";

import { MOCKUSER_ADMIN_PARTICIPANT } from "@/constants";
import { User } from "@/utils/user-types";
import { useRouter } from "next/navigation";
import React, { createContext, useContext, useState, useCallback } from "react";

type AuthContextType = {
  user: User | null;
  isLoginModalOpen: boolean;
  loginError: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
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
  const openLoginModal = useCallback(() => setIsLoginModalOpen(true), []);
  const closeLoginModal = useCallback(() => setIsLoginModalOpen(false), []);
  const clearLoginError = useCallback(() => setLoginError(null), []);

  const login = useCallback(
    async (email: string, password: string) => {
      try {
        setLoginError(null);
        // Simulate an API call
        await new Promise((resolve) => setTimeout(resolve, 1000));
        console.log("Login attempt:", email, password);

        // Check credentials against environment variables
        if (
          email === process.env.NEXT_PUBLIC_ADMIN_USERNAME &&
          password === process.env.NEXT_PUBLIC_ADMIN_PASSWORD
        ) {
          const loggedInUser = MOCKUSER_ADMIN_PARTICIPANT;
          if (!loggedInUser || !loggedInUser.userId) {
            throw new Error("Invalid user data");
          }
          setUser(loggedInUser);
          closeLoginModal();
          router.push(`/dashboard/${loggedInUser.userId}/member-data`);
        } else {
          throw new Error("Invalid credentials");
        }
      } catch (error) {
        const errorMessage =
          "Failed to log in. Please check your credentials and try again.";
        setLoginError(errorMessage);
        throw error;
      }
    },
    [router, closeLoginModal]
  );

  const logout = useCallback(() => {
    setUser(null);
    router.push("/");
  }, [router]);

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
