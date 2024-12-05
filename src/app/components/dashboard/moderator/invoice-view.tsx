import { TabsContent } from "@/components/ui/tabs";
import React from "react";

type Props = {
  invoiceData: {
    invoice_company_name: string;
    invoice_zip_code: string;
    invoice_address: string;
    invoice_country: string;
    invoice_city: string;
    invoice_extra?: string;
  };
};

function InvoiceView({ invoiceData }: Props) {
  return (
    <TabsContent value="invoice">
      {invoiceData ? (
        <div className="space-y-2">
          <h3 className="text-lg font-semibold">Invoice Data</h3>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <p>
              <strong>Company Name:</strong>
            </p>
            <p>{invoiceData.invoice_company_name}</p>
            <p>
              <strong>Address:</strong>
            </p>
            <p>{invoiceData.invoice_address}</p>
            <p>
              <strong>Zip Code:</strong>
            </p>
            <p>{invoiceData.invoice_zip_code}</p>
            <p>
              <strong>City:</strong>
            </p>
            <p>{invoiceData.invoice_city}</p>
            <p>
              <strong>Country:</strong>
            </p>
            <p>{invoiceData.invoice_country}</p>
            {invoiceData.invoice_extra && (
              <>
                <p>
                  <strong>Extra Data:</strong>
                </p>
                <p>{invoiceData.invoice_extra}</p>
              </>
            )}
          </div>
        </div>
      ) : (
        <p>No invoice data available.</p>
      )}
    </TabsContent>
  );
}

export default InvoiceView;
