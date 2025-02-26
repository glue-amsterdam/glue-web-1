"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAuth } from "@/app/context/AuthContext";
import GlueLogoSVG from "@/app/components/glue-logo-svg";
import { motion } from "framer-motion";
import { Mail, Lock, Loader2, Settings } from "lucide-react";
import { z } from "zod";
import Link from "next/link";
import { User } from "@supabase/supabase-js";
import { getCookieConsent } from "@/app/actions/cookieConsent";
import { CookieSettingsModal } from "@/components/cookies/cookies-modal";

const loginSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters" }),
});

const resetPasswordSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
});

type LoginFormData = z.infer<typeof loginSchema>;
type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

interface LoginFormProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: User) => void;
}

export default function LoginForm({
  isOpen,
  onClose,
  onLoginSuccess,
}: LoginFormProps) {
  const { login, loginError, clearLoginError } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isResetLoading, setIsResetLoading] = useState(false);
  const [cookieError, setCookieError] = useState<string | null>(null);
  const [isCookieSettingsOpen, setIsCookieSettingsOpen] = useState(false);
  const [isResetPasswordOpen, setIsResetPasswordOpen] = useState(false);

  const loginForm = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const resetPasswordForm = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    clearLoginError();
    setCookieError(null);

    try {
      const hasConsent = await getCookieConsent();
      if (!hasConsent) {
        setCookieError(
          "Cookie consent is required to log in. Please enable cookies."
        );
        setIsLoading(false);
        return;
      }

      const user = await login(data.email, data.password);
      onClose();
      onLoginSuccess(user);
    } catch (error) {
      console.error("Failed to log in:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordForgot = async (data: ResetPasswordFormData) => {
    setIsResetLoading(true);
    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: data.email,
        }),
      });
      if (!response.ok) throw new Error("Failed to send reset email");
      alert("Password reset email sent. Please check your inbox.");
      setIsResetPasswordOpen(false);
    } catch (error) {
      console.error("Error sending password reset email:", error);
      alert("Failed to send password reset email. Please try again.");
    } finally {
      setIsResetLoading(false);
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[425px] bg-uiwhite backdrop-blur-sm border border-primary/20 rounded-lg shadow-xl p-6 text-black">
          <DialogHeader>
            <DialogTitle className="text-3xl font-bold text-center text-primary">
              Log In
            </DialogTitle>
            <DialogDescription className="text-center text-muted-foreground">
              Enter your credentials to access your account.
            </DialogDescription>
          </DialogHeader>
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="flex justify-center w-full mb-6 text-black"
          >
            <GlueLogoSVG isVisible className="w-32 h-32" />
          </motion.div>
          {loginError && (
            <div className="text-red-500 text-sm bg-red-100 p-2 rounded">
              {loginError}
            </div>
          )}
          {cookieError && (
            <div className="text-red-500 text-sm bg-red-100 p-2 rounded flex flex-col flex-wrap">
              <span>{cookieError}</span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setIsCookieSettingsOpen(true)}
                className="text-sm text-primary hover:underline"
              >
                <Settings className="w-4 h-4 mr-2" />
                Change Settings
              </Button>
            </div>
          )}

          <Button
            type="button"
            variant="outline"
            className="w-full text-white hover:text-white bg-black hover:bg-[var(--color-triangle)]"
          >
            <Link href="signup/?step=1">Sign up</Link>
          </Button>

          <Form {...loginForm}>
            <form
              onSubmit={loginForm.handleSubmit(onSubmit)}
              className="space-y-4"
            >
              <p className="text-xs">
                Already signed in? Log in to your account:
              </p>
              <FormField
                control={loginForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-primary">Email</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                        <Input
                          placeholder="Enter your email"
                          {...field}
                          className="pl-10 bg-white"
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={loginForm.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-primary">Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                        <Input
                          type="password"
                          placeholder="Enter your password"
                          {...field}
                          className="pl-10 bg-white"
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex flex-col space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4">
                <Button
                  type="submit"
                  className="w-full hover:bg-[var(--color-box2)]"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Logging in...
                    </>
                  ) : (
                    "Log In"
                  )}
                </Button>
              </div>

              <Button
                type="button"
                variant="link"
                onClick={() => setIsResetPasswordOpen(true)}
                className="text-sm text-primary hover:underline text-center w-full"
              >
                Forgot your password?
              </Button>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      <Dialog open={isResetPasswordOpen} onOpenChange={setIsResetPasswordOpen}>
        <DialogContent className="sm:max-w-[425px] bg-gradient-to-br from-primary/10 to-secondary/10 backdrop-blur-sm border border-primary/20 rounded-lg shadow-xl p-6 text-black">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-center text-primary">
              Reset Password
            </DialogTitle>
            <DialogDescription className="text-center text-muted-foreground">
              Enter your email to receive a password reset link.
            </DialogDescription>
          </DialogHeader>
          <Form {...resetPasswordForm}>
            <form
              onSubmit={resetPasswordForm.handleSubmit(handlePasswordForgot)}
              className="space-y-4"
            >
              <FormField
                control={resetPasswordForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-primary">Email</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                        <Input
                          placeholder="Enter your email"
                          {...field}
                          className="pl-10 bg-white"
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                type="submit"
                className="w-full"
                disabled={isResetLoading}
              >
                {isResetLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  "Send Reset Link"
                )}
              </Button>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      <CookieSettingsModal
        isOpen={isCookieSettingsOpen}
        onClose={() => setIsCookieSettingsOpen(false)}
      />
    </>
  );
}
