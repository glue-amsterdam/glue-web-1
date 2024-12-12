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
import { Mail, Lock, Loader2 } from "lucide-react";
import { z } from "zod";
import Link from "next/link";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { User } from "@supabase/supabase-js";

const loginSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters" }),
});

type FormData = z.infer<typeof loginSchema>;

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
  const supabase = createClientComponentClient();

  const form = useForm<FormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: FormData) => {
    setIsLoading(true);
    clearLoginError();
    try {
      const user = await login(data.email, data.password);
      onClose();
      onLoginSuccess(user);
    } catch (error) {
      console.error("Failed to log in:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordForgot = async () => {
    const email = form.getValues("email");
    if (!email) {
      form.setError("email", {
        type: "manual",
        message: "Please enter your email",
      });
      return;
    }

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      if (error) throw error;
      alert("Password reset email sent. Please check your inbox.");
    } catch (error) {
      console.error("Error sending password reset email:", error);
      alert("Failed to send password reset email. Please try again.");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] bg-gradient-to-br from-primary/10 to-secondary/10 backdrop-blur-sm border border-primary/20 rounded-lg shadow-xl p-6 text-black">
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
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
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
                        className="pl-10"
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
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
                        className="pl-10"
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex flex-col space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4">
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Logging in...
                  </>
                ) : (
                  "Log In"
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                className="w-full text-black"
              >
                <Link href="signup/?step=1">Sign up</Link>
              </Button>
            </div>
            <div className="text-center">
              <a
                onClick={handlePasswordForgot}
                className="text-sm text-primary hover:underline cursor-pointer"
              >
                Forgot your password?
              </a>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
