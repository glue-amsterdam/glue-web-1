"use client";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { FormDataWithName, loginSchemaWithName } from "@/schemas/loginSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Lock, Mail } from "lucide-react";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import BigButton from "@/components/big-button";

const AdminLoginForm = () => {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const form = useForm<FormDataWithName>({
    resolver: zodResolver(loginSchemaWithName),
    defaultValues: {
      userName: "",
      password: "",
    },
  });

  const handleSubmit = async (data: FormDataWithName) => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        router.push("/admin");
      } else {
        throw new Error("Login failed");
      }
    } catch {
      form.setError("root", {
        type: "manual",
        message: "Invalid username or password",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className="space-y-6 text-black mini-padding"
      >
        <FormField
          control={form.control}
          name="userName"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xs">username</FormLabel>
              <FormControl>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                  <Input
                    {...field}
                    placeholder="Enter your user name"
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
              <FormLabel className="text-xs">password</FormLabel>
              <FormControl>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                  <Input
                    {...field}
                    type="password"
                    placeholder="Enter your password"
                    className="pl-10"
                  />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {form.formState.errors.root && (
          <p className="text-red-500">{form.formState.errors.root.message}</p>
        )}
        <div className="flex justify-start">
          <BigButton
            mode="big"
            as="button"
            onClick={form.handleSubmit(handleSubmit)}
            disabled={isLoading}
            label={isLoading ? "logging in..." : "enter"}
          />

        </div>
      </form>
    </Form>
  );
};

export default AdminLoginForm;
