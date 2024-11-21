"use client";

import { RouteValues } from "@/schemas/mapSchema";
import { fetchAllRoutes } from "@/utils/api";
import React, { createContext, useContext, useState, useEffect } from "react";

type Route = RouteValues & { id: string };

interface RouteContextType {
  routes: Route[];
  deleteRoute: (id: string) => void;
  updateRoute: (id: string, updatedRoute: RouteValues) => void;
}

const RouteContext = createContext<RouteContextType | undefined>(undefined);

export function RouteProvider({ children }: { children: React.ReactNode }) {
  const [routes, setRoutes] = useState<Route[]>([]);

  useEffect(() => {
    // Fetch routes from your API here
    fetchAllRoutes()
      .then((routes) => {
        setRoutes(routes);
      })
      .catch((error) => {
        throw new Error("Failed to fetch routes in provider:", error);
      });
    // For now, we'll use mock data
  }, []);

  const deleteRoute = (id: string) => {
    // Delete route from your API here
    setRoutes(routes.filter((route) => route.id !== id));
  };

  const updateRoute = (id: string, updatedRoute: RouteValues) => {
    // Update route in your API here
    setRoutes(
      routes.map((route) =>
        route.id === id ? { ...route, ...updatedRoute } : route
      )
    );
  };

  return (
    <RouteContext.Provider value={{ routes, deleteRoute, updateRoute }}>
      {children}
    </RouteContext.Provider>
  );
}

export function useRoutes() {
  const context = useContext(RouteContext);
  if (context === undefined) {
    throw new Error("useRoutes must be used within a RouteProvider");
  }
  return context;
}
