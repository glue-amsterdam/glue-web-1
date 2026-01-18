import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

export const emailPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters long"),
  user_name: z.string().min(1, "User name is required").max(50),
});

export type EmailPasswordFormData = z.infer<typeof emailPasswordSchema>;

interface EmailPasswordFormProps {
  onSubmit: (data: EmailPasswordFormData) => void;
  onBack?: () => void;
  submitButtonText?: string;
}

export function EmailPasswordForm({
  onSubmit,
  onBack,
  submitButtonText = "Complete Registration",
}: EmailPasswordFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<EmailPasswordFormData>({
    resolver: zodResolver(emailPasswordSchema),
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" {...register("email")} />
        {errors.email && (
          <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
        )}
      </div>
      <div>
        <Label htmlFor="password">Password</Label>
        <Input id="password" type="password" {...register("password")} />
        {errors.password && (
          <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
        )}
      </div>
      <div>
        <Label htmlFor="user_name">User Name</Label>
        <Input id="user_name" {...register("user_name")} />
        {errors.user_name && (
          <p className="text-red-500 text-sm mt-1">
            {errors.user_name.message}
          </p>
        )}
      </div>
      <div className="flex justify-between gap-2 flex-wrap">
        {onBack && (
          <Button type="button" variant="outline" onClick={onBack}>
            Back
          </Button>
        )}
        <Button
          type="submit"
          className={`${
            onBack ? "" : "w-full"
          } bg-[var(--color-box1)] hover:bg-[var(--color-box1)] hover:opacity-75 text-pretty h-fit`}
        >
          {submitButtonText}
        </Button>
      </div>
    </form>
  );
}
