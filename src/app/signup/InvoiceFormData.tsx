import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { invoiceDataTypeSchema } from "@/schemas/invoiceSchemas";

export type InvoiceFormData = z.infer<typeof invoiceDataTypeSchema>;

interface InvoiceFormProps {
  onSubmit: (data: InvoiceFormData) => void;
  onBack: () => void;
}

export function InvoiceForm({ onSubmit, onBack }: InvoiceFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<InvoiceFormData>({
    resolver: zodResolver(invoiceDataTypeSchema),
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <Label htmlFor="invoice_company_name">Company Name</Label>
        <Input
          id="invoice_company_name"
          {...register("invoice_company_name")}
        />
        {errors.invoice_company_name && (
          <p className="text-red-500 text-sm mt-1">
            {errors.invoice_company_name.message}
          </p>
        )}
      </div>
      <div>
        <Label htmlFor="invoice_zip_code">Zip Code</Label>
        <Input id="invoice_zip_code" {...register("invoice_zip_code")} />
        {errors.invoice_zip_code && (
          <p className="text-red-500 text-sm mt-1">
            {errors.invoice_zip_code.message}
          </p>
        )}
      </div>
      <div>
        <Label htmlFor="invoice_address">Address</Label>
        <Input id="invoice_address" {...register("invoice_address")} />
        {errors.invoice_address && (
          <p className="text-red-500 text-sm mt-1">
            {errors.invoice_address.message}
          </p>
        )}
      </div>
      <div>
        <Label htmlFor="invoice_country">Country</Label>
        <Input id="invoice_country" {...register("invoice_country")} />
        {errors.invoice_country && (
          <p className="text-red-500 text-sm mt-1">
            {errors.invoice_country.message}
          </p>
        )}
      </div>
      <div>
        <Label htmlFor="invoice_city">City</Label>
        <Input id="invoice_city" {...register("invoice_city")} />
        {errors.invoice_city && (
          <p className="text-red-500 text-sm mt-1">
            {errors.invoice_city.message}
          </p>
        )}
      </div>
      <div>
        <Label htmlFor="invoice_extra">Additional Information (Optional)</Label>
        <Input id="invoice_extra" {...register("invoice_extra")} />
        {errors.invoice_extra && (
          <p className="text-red-500 text-sm mt-1">
            {errors.invoice_extra.message}
          </p>
        )}
      </div>
      <div className="flex justify-between">
        <Button type="button" variant="outline" onClick={onBack}>
          Back to Plan Selection
        </Button>
        <Button type="submit">Next: Account Information</Button>
      </div>
    </form>
  );
}
