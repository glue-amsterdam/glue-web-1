import { TabsContent } from "@/components/ui/tabs";
import { isParticipantUser } from "@/constants";
import { UserWithPlanDetails } from "@/schemas/usersSchemas";
import { MapPin } from "lucide-react";
import React from "react";

type Props = {
  selectedUser: UserWithPlanDetails;
};

function InfoView({ selectedUser }: Props) {
  return (
    <TabsContent value="info">
      <p className="flex gap-2">
        <strong>User Type:</strong>
        {isParticipantUser(selectedUser) && selectedUser.isCurated ? (
          "CURATED"
        ) : (
          <span className="uppercase">
            {selectedUser.planDetails.planLabel}
          </span>
        )}

        <span className="uppercase">{selectedUser.type}</span>
      </p>
      <p className="mt-2 text-sm">
        {isParticipantUser(selectedUser)
          ? selectedUser.description
          : "Basic user info"}
      </p>
      {isParticipantUser(selectedUser) && (
        <div className="mt-4 flex items-center">
          <MapPin className="mr-2 text-glueBlue" size={16} />
          <span>{selectedUser.mapInfo.place_name}</span>
        </div>
      )}
    </TabsContent>
  );
}

export default InfoView;
