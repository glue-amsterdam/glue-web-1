import ContactView from "@/app/components/dashboard/moderator/contact-view";
import HoursView from "@/app/components/dashboard/moderator/hours-view";
import InfoView from "@/app/components/dashboard/moderator/info-view";
import InvoiceView from "@/app/components/dashboard/moderator/invoice-view";
import { CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { isPaidUser, isParticipantUser } from "@/constants";
import { UserWithPlanDetails } from "@/schemas/usersSchemas";
import React from "react";

type Props = {
  selectedUser: UserWithPlanDetails;
};

function UserFullViewContent({ selectedUser }: Props) {
  return (
    <CardContent>
      <Tabs defaultValue="info">
        <TabsList>
          <TabsTrigger value="info">Info</TabsTrigger>
          {isParticipantUser(selectedUser) && (
            <>
              <TabsTrigger value="contact">Contact</TabsTrigger>
              <TabsTrigger value="hours">Hours</TabsTrigger>
            </>
          )}
          {isPaidUser(selectedUser) && (
            <TabsTrigger value="invoice">Invoice</TabsTrigger>
          )}
        </TabsList>
        <InfoView selectedUser={selectedUser} />
        <ContactView selectedUser={selectedUser} />
        <HoursView selectedUser={selectedUser} />
        {isPaidUser(selectedUser) && (
          <InvoiceView invoiceData={selectedUser.invoice_data.invoice_data} />
        )}
      </Tabs>
    </CardContent>
  );
}

export default UserFullViewContent;
