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
import { FormDataWithEmail, loginSchemaWithEmail } from "@/schemas/loginSchema";
import { LoggedInUserType } from "@/schemas/usersSchemas";

interface LoginFormProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: LoggedInUserType) => void;
}

export default function LoginForm({
  isOpen,
  onClose,
  onLoginSuccess,
}: LoginFormProps) {
  const { login, loginError } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<FormDataWithEmail>({
    resolver: zodResolver(loginSchemaWithEmail),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: FormDataWithEmail) => {
    setIsLoading(true);
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

  const handlePasswordForgot = () => {
    /* API CALL TO FORGOT PASSWORD */
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
                Sign up
              </Button>
            </div>
            <div className="text-center">
              <a
                onClick={handlePasswordForgot}
                className="text-sm text-primary hover:underline"
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
