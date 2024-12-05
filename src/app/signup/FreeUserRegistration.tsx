import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const freeUserSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters long"),
  plan_id: z.string(),
  plan_type: z.literal("free"),
});

type FreeUserFormData = z.infer<typeof freeUserSchema>;

interface FreeUserRegistrationProps {
  onSubmit: (data: FreeUserFormData) => void;
  plan_id: string;
  plan_type: "free";
  onBack: () => void;
}

export default function FreeUserRegistration({
  plan_id,
  plan_type,
  onSubmit,
  onBack,
}: FreeUserRegistrationProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FreeUserFormData>({
    resolver: zodResolver(freeUserSchema),
    defaultValues: {
      plan_id,
      plan_type,
    },
  });

  const handleFreeUserSubmit = (data: FreeUserFormData) => {
    console.log("Free user registration data:", data);
    onSubmit(data);
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <form onSubmit={handleSubmit(handleFreeUserSubmit)}>
        <CardHeader>
          <CardTitle>Visitor Registration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" {...register("email")} />
            {errors.email && (
              <p className="text-red-500 text-sm mt-1">
                {errors.email.message}
              </p>
            )}
          </div>
          <div>
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" {...register("password")} />
            {errors.password && (
              <p className="text-red-500 text-sm mt-1">
                {errors.password.message}
              </p>
            )}
          </div>
          <input type="hidden" {...register("plan_id")} />
          <input type="hidden" {...register("plan_type")} />
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button type="button" variant="outline" onClick={onBack}>
            Back
          </Button>
          <Button type="submit">Complete visitor Registration</Button>
        </CardFooter>
      </form>
    </Card>
  );
}
