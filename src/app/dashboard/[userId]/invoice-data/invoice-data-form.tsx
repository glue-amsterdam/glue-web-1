"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { AlertCircle } from "lucide-react";
import { InvoiceData, invoiceData } from "@/schemas/invoiceSchemas";
import { useToast } from "@/hooks/use-toast";
import { mutate } from "swr";
import { createSubmitHandler } from "@/utils/form-helpers";
import { SaveChangesButton } from "@/app/admin/components/save-changes-button";

export function InvoiceDataForm({
  initialData,
  isMod,
  targetUserId,
  embedded = false,
}: {
  initialData: InvoiceData | null;
  isMod: boolean;
  targetUserId: string | undefined;
  embedded?: boolean;
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const form = useForm<InvoiceData>({
    resolver: zodResolver(invoiceData),
    defaultValues: {
      user_id: targetUserId || "",
      invoice_company_name: initialData?.invoice_company_name || "",
      invoice_zip_code: initialData?.invoice_zip_code || "",
      invoice_address: initialData?.invoice_address || "",
      invoice_country: initialData?.invoice_country || "",
      invoice_city: initialData?.invoice_city || "",
      invoice_extra: initialData?.invoice_extra || "",
    },
  });

  const onSubmit = createSubmitHandler<InvoiceData>(
    `/api/users/participants/${targetUserId}/invoice`,
    async () => {
      toast({
        title: "Success",
        description: "Participant details updated successfully.",
      });
      await mutate(`/api/users/participants/${targetUserId}/invoice`);
      router.refresh();
    },
    (error) => {
      toast({
        title: "Error",
        description:
          "Failed to update Participant details. Please try again. " + error,
        variant: "destructive",
      });
    },
    initialData ? "PUT" : "POST"
  );

  const handleSubmit = async (values: InvoiceData) => {
    setIsSubmitting(true);
    onSubmit({ ...values, user_id: targetUserId! });
    setIsSubmitting(false);
  };

  useEffect(() => {
    form.reset(initialData as InvoiceData);
  }, [form, initialData]);

  const formContent = (
    <>
      {!isMod && (
        <div
          className="flex gap-3 pt-[15px] max-w-[600px] mx-auto"
          role="alert"
        >
          <div>
            <p className="base-text-size">
              if you want to change invoice data, please let the
              team know!
            </p>
          </div>
        </div>
      )}
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(handleSubmit)}
          className="space-y-1 pt-[15px] max-w-[600px] mx-auto"
        >
          <FormField
            control={form.control}
            name="invoice_company_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Company Name</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    className="bg-white text-black"
                    disabled={!isMod}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="invoice_zip_code"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Zip Code</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    className="bg-white text-black"
                    disabled={!isMod}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="invoice_address"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Address</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    className="bg-white text-black"
                    disabled={!isMod}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="invoice_country"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Country</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    className="bg-white text-black"
                    disabled={!isMod}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="invoice_city"
            render={({ field }) => (
              <FormItem>
                <FormLabel>City</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    className="bg-white text-black"
                    disabled={!isMod}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="invoice_extra"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Additional Information</FormLabel>
                <FormControl>
                  <Textarea
                    {...field}
                    className="bg-white text-black"
                    value={field.value || ""}
                    onChange={(e) => field.onChange(e.target.value)}
                    disabled={!isMod}
                  />
                </FormControl>
                <FormDescription>
                  Any additional information for invoicing (optional)
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {isMod && (
            <div className="flex justify-center mini-padding">
              <SaveChangesButton
                watchFields={[
                  "invoice_company_name",
                  "invoice_zip_code",
                  "invoice_address",
                  "invoice_country",
                  "invoice_city",
                  "invoice_extra",
                ]}
                isSubmitting={isSubmitting}
                disabled={isSubmitting}
                label={
                  isSubmitting
                    ? "Updating..."
                    : (initialData ? "Update" : "Create") + " Invoice Data"
                }
              />
            </div>
          )}
        </form>
      </Form>
    </>
  );

  if (embedded) {
    return formContent;
  }

  return (
    <div className="w-full max-w-[80%] mx-auto space-y-4">
      <h1 className="text-2xl font-bold">Invoice Data</h1>
      {formContent}
    </div>
  );
}
