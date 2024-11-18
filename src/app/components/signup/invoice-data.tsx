"use client";

import { useFormContext } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface InvoiceDataProps {
  attemptedNextStep: boolean;
}

export default function InvoiceData({ attemptedNextStep }: InvoiceDataProps) {
  const {
    register,
    formState: { errors },
  } = useFormContext();

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white">Invoice Data</h2>
      <div className="space-y-4">
        <div>
          <Label htmlFor="invoiceName" className="text-white">
            Invoice to{`(*)`}
          </Label>
          <Input
            id="invoiceName"
            placeholder="Invoice Name"
            {...register("invoiceName", {
              required: "Invoice name is required",
            })}
            className="dashboard-input placeholder:text-sm"
          />
          {attemptedNextStep && errors.invoiceName && (
            <p className="text-red-500 text-sm">
              {errors.invoiceName.message as string}
            </p>
          )}
        </div>
        <div>
          <Label htmlFor="invoiceCountry" className="text-white">
            Country{`(*)`}
          </Label>
          <Input
            id="invoiceCountry"
            placeholder="United States"
            {...register("invoiceCountry", { required: "Country is required" })}
            className="dashboard-input placeholder:text-sm"
          />
          {attemptedNextStep && errors.invoiceCountry && (
            <p className="text-red-500 text-sm">
              {errors.invoiceCountry.message as string}
            </p>
          )}
        </div>
        <div>
          <Label htmlFor="invoiceState" className="text-white">
            State/Province{`(*)`}
          </Label>
          <Input
            id="invoiceState"
            placeholder="New York"
            {...register("invoiceState", {
              required: "State/Province is required",
            })}
            className="dashboard-input placeholder:text-sm"
          />
          {attemptedNextStep && errors.invoiceState && (
            <p className="text-red-500 text-sm">
              {errors.invoiceState.message as string}
            </p>
          )}
        </div>
        <div>
          <Label htmlFor="invoiceCity" className="text-white">
            City{`(*)`}
          </Label>
          <Input
            id="invoiceCity"
            placeholder="Manhattan"
            {...register("invoiceCity", { required: "City is required" })}
            className="dashboard-input placeholder:text-sm"
          />
          {attemptedNextStep && errors.invoiceCity && (
            <p className="text-red-500 text-sm">
              {errors.invoiceCity.message as string}
            </p>
          )}
        </div>
        <div>
          <Label htmlFor="invoiceZip" className="text-white">
            ZIP/Postal Code{`(*)`}
          </Label>
          <Input
            placeholder="10001"
            id="invoiceZip"
            {...register("invoiceZip", {
              required: "ZIP/Postal Code is required",
            })}
            className="dashboard-input placeholder:text-sm"
          />
          {attemptedNextStep && errors.invoiceZip && (
            <p className="text-red-500 text-sm">
              {errors.invoiceZip.message as string}
            </p>
          )}
        </div>
        <div>
          <Label htmlFor="invoiceExtra" className="text-white">
            Extra Information for Invoice
          </Label>
          <Textarea
            placeholder="Extra information for invoice if needed"
            id="invoiceExtra"
            {...register("invoiceExtra")}
            className="dashboard-input placeholder:text-sm"
          />
        </div>
      </div>
    </div>
  );
}
