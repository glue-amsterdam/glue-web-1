"use client";
import { MOCKUSER_ADMIN_PARTICIPANT } from "@/constants";
import { useRouter } from "next/navigation";
import { LoggedInUserType } from "@/schemas/usersSchemas";
import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";

type AuthContextType = {
  user: LoggedInUserType | null;
  isLoginModalOpen: boolean;
  loginError: string | null;
  login: (email: string, password: string) => Promise<LoggedInUserType>;
  logout: () => void;
  openLoginModal: () => void;
  closeLoginModal: () => void;
  clearLoginError: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<null | LoggedInUserType>(null);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  const checkLoggedInUser = useCallback(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  useEffect(() => {
    checkLoggedInUser();
  }, [checkLoggedInUser]);

  const openLoginModal = useCallback(() => setIsLoginModalOpen(true), []);
  const closeLoginModal = useCallback(() => setIsLoginModalOpen(false), []);
  const clearLoginError = useCallback(() => setLoginError(null), []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem("user");
    router.push("/");
  }, [router]);

  const login = useCallback(
    async (email: string, password: string): Promise<LoggedInUserType> => {
      try {
        setLoginError(null);
        await new Promise((resolve) => setTimeout(resolve, 1000));
        console.log("Login attempt:", email, password);

        if (
          email === process.env.NEXT_PUBLIC_ADMIN_USERNAME &&
          password === process.env.NEXT_PUBLIC_ADMIN_PASSWORD
        ) {
          const loggedInUser = MOCKUSER_ADMIN_PARTICIPANT;
          if (!loggedInUser || !loggedInUser.userId) {
            throw new Error("Invalid user data");
          }
          const { userId, userName, isMod, type } = loggedInUser;
          const userData = { userId, userName, isMod, userType: type };

          localStorage.setItem("user", JSON.stringify(userData));
          setUser(userData);
          closeLoginModal();
          setTimeout(() => {
            logout();
          }, 3600000);
          return userData;
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
    [closeLoginModal, logout]
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
