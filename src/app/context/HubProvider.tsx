"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { HubValues } from "@/schemas/hubSchema";

interface Hub extends HubValues {
  hubId: string;
}

interface HubContextType {
  hubs: Hub[];
  addHub: (hub: HubValues) => Promise<void>;
  updateHub: (id: string, hub: HubValues) => Promise<void>;
  deleteHub: (id: string) => Promise<void>;
}

const HubContext = createContext<HubContextType | undefined>(undefined);

export function HubProvider({ children }: { children: React.ReactNode }) {
  const [hubs, setHubs] = useState<Hub[]>([]);

  useEffect(() => {
    // Fetch hubs from API
    fetchHubs();
  }, []);

  const fetchHubs = async () => {
    // Implement API call to fetch hubs
    // For now, we'll use mock data
    const mockHubs: Hub[] = [
      {
        hubId: "1",
        name: "Hub 1",
        description: "Description for Hub 1",
        hubMembers: [
          { userId: "963852741", userName: "Seletti" },
          { userId: "789654123", userName: "Graypants" },
          { userId: "654654984", userName: "FRAMAdsdfsd" },
        ],
        hubPlace: {
          mapbox_id: "place.8765",
          place_name:
            "Van Gogh Museum, Museumplein 6, 1071 DJ Amsterdam, Netherlands",
        },
      },
      {
        hubId: "2",
        name: "Hub 2",
        description: "Description for Hub 2",
        hubMembers: [
          { userId: "963852741", userName: "Seletti" },
          { userId: "789654123", userName: "Graypants" },
          { userId: "654654984", userName: "FRAMAdsdfsd" },
        ],
        hubPlace: {
          mapbox_id: "place.8765",
          place_name:
            "Van Gogh Museum, Museumplein 6, 1071 DJ Amsterdam, Netherlands",
        },
      },
    ];
    setHubs(mockHubs);
  };

  const addHub = async (hub: HubValues) => {
    // Implement API call to add hub
    const newHub: Hub = { ...hub, hubId: Date.now().toString() };
    setHubs([...hubs, newHub]);
  };

  const updateHub = async (id: string, updatedHub: HubValues) => {
    // Implement API call to update hub
    setHubs(
      hubs.map((hub) => (hub.hubId === id ? { ...updatedHub, hubId: id } : hub))
    );
  };

  const deleteHub = async (id: string) => {
    // Implement API call to delete hub
    setHubs(hubs.filter((hub) => hub.hubId !== id));
  };

  return (
    <HubContext.Provider value={{ hubs, addHub, updateHub, deleteHub }}>
      {children}
    </HubContext.Provider>
  );
}

export const useHubs = () => {
  const context = useContext(HubContext);
  if (context === undefined) {
    throw new Error("useHubs must be used within a HubProvider");
  }
  return context;
};
