import { useState } from "react";
import {
  useForm,
  UseFormProps,
  FieldValues,
  UseFormReturn,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { ZodSchema } from "zod";

interface UseFormWithSubmitProps<T extends FieldValues>
  extends UseFormProps<T> {
  schema: ZodSchema;
  onSubmit: (data: T) => Promise<void>;
  successMessage: string;
  errorMessage: string;
}

interface UseFormWithSubmitReturn<T extends FieldValues>
  extends Omit<UseFormReturn<T>, "handleSubmit"> {
  isSubmitting: boolean;
  handleSubmit: (e?: React.BaseSyntheticEvent) => Promise<void>;
}

export function useFormWithSubmit<T extends FieldValues>({
  schema,
  onSubmit,
  successMessage,
  errorMessage,
  ...formProps
}: UseFormWithSubmitProps<T>): UseFormWithSubmitReturn<T> {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const form = useForm<T>({
    ...formProps,
    resolver: zodResolver(schema),
  });

  const handleSubmit = form.handleSubmit(async (data: T) => {
    setIsSubmitting(true);
    try {
      await onSubmit(data);
      toast({
        title: "Success",
        description: successMessage,
      });
      form.reset(data);
      router.refresh();
    } catch (error) {
      console.error("Form submission error:", error);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  });

  return {
    ...form,
    isSubmitting,
    handleSubmit,
  };
}
