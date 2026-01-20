import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import TermsContent from "./components/TermsContent";

export const emailPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters long"),
  user_name: z.string().min(1, "User name is required").max(50),
  termsAccepted: z.boolean().refine((val) => val === true, {
    message: "You must accept the General terms and conditions",
  }),
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
  const [isTermsDialogOpen, setIsTermsDialogOpen] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<EmailPasswordFormData>({
    resolver: zodResolver(emailPasswordSchema),
    defaultValues: {
      termsAccepted: false,
    },
  });

  const termsAccepted = watch("termsAccepted");

  const handleOpenTerms = () => {
    setIsTermsDialogOpen(true);
  };

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
      <div className="flex items-start space-x-2">
        <Checkbox
          id="termsAccepted"
          checked={termsAccepted}
          onCheckedChange={(checked) => setValue("termsAccepted", checked === true)}
        />
        <div className="grid gap-1.5 leading-none">
          <Label
            htmlFor="termsAccepted"
            className="text-sm font-normal leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
          >
            I accept the{" "}
            <button
              type="button"
              onClick={handleOpenTerms}
              className="text-primary underline hover:no-underline focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded"
              tabIndex={0}
              aria-label="Open General terms and conditions"
            >
              General terms and conditions
            </button>
          </Label>
          {errors.termsAccepted && (
            <p className="text-red-500 text-sm mt-1">
              {errors.termsAccepted.message}
            </p>
          )}
        </div>
      </div>
      <Dialog open={isTermsDialogOpen} onOpenChange={setIsTermsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="sr-only">General Terms and Conditions</DialogTitle>
            <DialogDescription className="sr-only">
              Please read the following terms and conditions carefully.
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4 space-y-4">
            {isTermsDialogOpen && <TermsContent />}
          </div>
        </DialogContent>
      </Dialog>
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
