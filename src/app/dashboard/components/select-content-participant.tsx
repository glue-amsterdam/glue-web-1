"use client";

import { useEffect, useState } from "react";
import { SelectContent, SelectItem } from "@/components/ui/select";
import { fetchAllHubParticipants } from "@/utils/api";
import { EnhancedUser } from "@/schemas/eventSchemas";

export function SelectContentParticipant() {
  const [hubParticipants, setHubParticipants] = useState<EnhancedUser[]>([]);

  useEffect(() => {
    async function loadAllHubParticipants() {
      const hubParticipant = await fetchAllHubParticipants();
      setTimeout(() => setHubParticipants(hubParticipant), 1000); // Simulate loading
    }
    loadAllHubParticipants();
  }, []);

  return (
    <SelectContent className="dashboard-input ">
      {hubParticipants.map((hubParticipant) => (
        <SelectItem key={hubParticipant.userId} value={hubParticipant.userId}>
          {hubParticipant.userName} - (id:{hubParticipant.userId})
        </SelectItem>
      ))}
    </SelectContent>
  );
}