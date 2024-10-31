import { TabsContent } from "@/components/ui/tabs";
import React from "react";

type Props = {
  invoiceData: {
    invoiceCompanyName: string;
    invoiceZipCode: string;
    invoiceAddress: string;
    invoiceCountry: string;
    invoiceCity: string;
    invoiceExtra?: string;
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
            <p>{invoiceData.invoiceCompanyName}</p>
            <p>
              <strong>Address:</strong>
            </p>
            <p>{invoiceData.invoiceAddress}</p>
            <p>
              <strong>Zip Code:</strong>
            </p>
            <p>{invoiceData.invoiceZipCode}</p>
            <p>
              <strong>City:</strong>
            </p>
            <p>{invoiceData.invoiceCity}</p>
            <p>
              <strong>Country:</strong>
            </p>
            <p>{invoiceData.invoiceCountry}</p>
            {invoiceData.invoiceExtra && (
              <>
                <p>
                  <strong>Extra Data:</strong>
                </p>
                <p>{invoiceData.invoiceExtra}</p>
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
