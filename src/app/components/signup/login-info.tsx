"use client";

import { useFormContext } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface LoginInfoProps {
  attemptedNextStep: boolean;
}

export default function LoginInfo({ attemptedNextStep }: LoginInfoProps) {
  const {
    register,
    formState: { errors },
  } = useFormContext();

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white">Login Information</h2>
      <div className="space-y-4">
        <div>
          <Label htmlFor="loginEmail" className="text-white">
            Login Email
          </Label>
          <Input
            id="loginEmail"
            type="email"
            {...register("loginEmail", {
              required: "Login email is required",
              pattern: {
                value: /\S+@\S+\.\S+/,
                message: "Invalid email address",
              },
            })}
            className="dashboard-input"
          />
          {attemptedNextStep && errors.loginEmail && (
            <p className="text-red-500 text-sm">
              {errors.loginEmail.message as string}
            </p>
          )}
        </div>
        <div>
          <Label htmlFor="password" className="text-white">
            Password
          </Label>
          <Input
            id="password"
            type="password"
            {...register("password", {
              required: "Password is required",
              minLength: {
                value: 8,
                message: "Password must be at least 8 characters long",
              },
            })}
            className="dashboard-input"
          />
          {attemptedNextStep && errors.password && (
            <p className="text-red-500 text-sm">
              {errors.password.message as string}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
