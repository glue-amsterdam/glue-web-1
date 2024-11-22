"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import { PlanType } from "@/utils/sign-in.types";

type PlansContextType = {
  plans: PlanType[];
  setPlans: React.Dispatch<React.SetStateAction<PlanType[]>>;
  updatePlan: (updatedPlan: PlanType) => void;
};

const PlansContext = createContext<PlansContextType | undefined>(undefined);

export const usePlans = () => {
  const context = useContext(PlansContext);
  if (!context) {
    throw new Error("usePlans must be used within a PlansProvider");
  }
  return context;
};

export const PlansProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [plans, setPlans] = useState<PlanType[]>([]);

  const updatePlan = useCallback((updatedPlan: PlanType) => {
    setPlans((currentPlans) =>
      currentPlans.map((plan) =>
        plan.planId === updatedPlan.planId ? updatedPlan : plan
      )
    );
  }, []);

  return (
    <PlansContext.Provider value={{ plans, setPlans, updatePlan }}>
      {children}
    </PlansContext.Provider>
  );
};
