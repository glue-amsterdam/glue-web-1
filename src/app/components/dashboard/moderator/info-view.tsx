import { TabsContent } from "@/components/ui/tabs";
import { isParticipantUser } from "@/constants";
import { UserWithPlanDetails } from "@/schemas/usersSchemas";
import { MapPin, MapPinOff } from "lucide-react";
import React from "react";

type Props = {
  selectedUser: UserWithPlanDetails;
};

function InfoView({ selectedUser }: Props) {
  return (
    <TabsContent value="info" className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <p className="flex items-center gap-2">
          <strong>User Type:</strong>
          {isParticipantUser(selectedUser) &&
          "isCurated" in selectedUser &&
          selectedUser.isCurated ? (
            <span className="inline-flex items-center rounded-full bg-primary px-2.5 py-0.5 text-xs font-medium text-primary-foreground">
              CURATED
            </span>
          ) : (
            <span className="inline-flex items-center rounded-full bg-secondary px-2.5 py-0.5 text-xs font-medium text-secondary-foreground uppercase">
              {selectedUser.planDetails.plan_label}
            </span>
          )}
        </p>
        <p className="flex items-center">
          <span className="inline-flex items-center rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground uppercase">
            {selectedUser.type}
          </span>
        </p>
      </div>

      <p className="text-sm text-muted-foreground font-overpass">
        {isParticipantUser(selectedUser)
          ? selectedUser.description || "No description provided"
          : "Basic user info"}
      </p>

      {isParticipantUser(selectedUser) && (
        <div className="flex items-center text-sm">
          {"mapId" in selectedUser ? (
            <>
              <MapPin className="mr-2 text-primary" size={16} />
              <span>Map ID: {selectedUser.map_id?.id}</span>
            </>
          ) : "noAddress" in selectedUser && selectedUser.noAddress ? (
            <>
              <MapPinOff className="mr-2 text-muted-foreground" size={16} />
              <span>No address provided</span>
            </>
          ) : (
            <span className="text-muted-foreground">
              Location information unavailable
            </span>
          )}
        </div>
      )}
    </TabsContent>
  );
}

export default InfoView;
