export interface InvoiceDataType {
  invoiceCompanyName: string;
  invoiceZipCode: string;
  invoiceAddress: string;
  invoiceCountry: string;
  invoiceCity: string;
  invoiceExtra?: string;
}

export interface InvoiceDataCall {
  invoiceId: string /* FOREING KEY */;
  userId: string /* RELACION USER */;
  invoiceData: InvoiceDataType;
  createdAt: Date;
  updatedAt: Date;
}
