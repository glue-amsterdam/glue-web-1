import { z } from "zod";

// InvoiceDataType schema
export const invoiceDataTypeSchema = z.object({
  invoice_company_name: z.string().min(3, "Company name is required"),
  invoice_zip_code: z.string().min(5, "Zip code is required"),
  invoice_address: z.string().min(3, "Address is required"),
  invoice_country: z.string().min(3, "Country is required"),
  invoice_city: z.string().min(3, "City is required"),
  invoice_extra: z.string().optional().nullable(),
});
export const invoiceData = z.object({
  user_id: z.string().uuid(),
  invoice_company_name: z.string().min(3, "Company name is required"),
  invoice_zip_code: z.string().min(5, "Zip code is required"),
  invoice_address: z.string().min(3, "Address is required"),
  invoice_country: z.string().min(3, "Country is required"),
  invoice_city: z.string().min(3, "City is required"),
  invoice_extra: z.string().optional().nullable(),
});

// InvoiceDataCall schema
export const invoiceDataCallSchema = z.object({
  invoice_id: z.string(),
  user_id: z.string(),
  invoice_data: invoiceDataTypeSchema,
});

// Inferred types from the schemas
export type InvoiceDataType = z.infer<typeof invoiceDataTypeSchema>;
export type InvoiceDataCall = z.infer<typeof invoiceDataCallSchema>;
export type InvoiceData = z.infer<typeof invoiceData>;
