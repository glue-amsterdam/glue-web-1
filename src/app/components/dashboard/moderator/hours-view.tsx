import { TabsContent } from "@/components/ui/tabs";
import { isParticipantUser } from "@/constants";
import { UserWithPlanDetails } from "@/schemas/usersSchemas";
import { Clock } from "lucide-react";
import React from "react";

type Props = { selectedUser: UserWithPlanDetails };

function HoursView({ selectedUser }: Props) {
  return (
    <TabsContent value="hours">
      <div className="space-y-2 text-sm">
        {isParticipantUser(selectedUser) &&
        selectedUser.visitingHours &&
        selectedUser.visitingHours.length > 0 ? (
          selectedUser.visitingHours.map((day) => (
            <div
              key={day.dayId}
              className="flex flex-wrap sm:w-[200px] justify-between"
            >
              <div className="flex items-center">
                <Clock className="mr-2" size={16} />
                <span className="font-medium">{day.label}:</span>
              </div>

              <span className="ml-2">
                {day.ranges &&
                  day.ranges?.map((timeRange, index) => (
                    <span key={index}>
                      {timeRange.open} - {timeRange.close}
                      {index < (day.ranges?.length || 0) - 1 && (
                        <>
                          {","}
                          <br />
                        </>
                      )}
                    </span>
                  ))}
              </span>
            </div>
          ))
        ) : (
          <p>No visiting hours data available.</p>
        )}
      </div>
    </TabsContent>
  );
}

export default HoursView;
