"use client";

import { createContext, useContext, type ReactNode } from "react";
import {
  buildCategoryFilterOptions,
  type CategoryFilterOption,
  type ParticipantCategory,
} from "@/lib/participants/participant-categories";

type ParticipantCategoriesContextValue = {
  categories: ParticipantCategory[];
  filterOptions: CategoryFilterOption[];
  categorySlugs: string[];
};

const ParticipantCategoriesContext =
  createContext<ParticipantCategoriesContextValue | null>(null);

export const ParticipantCategoriesProvider = ({
  categories,
  children,
}: {
  categories: ParticipantCategory[];
  children: ReactNode;
}) => {
  const filterOptions = buildCategoryFilterOptions(categories);
  const categorySlugs = categories.map((c) => c.slug);

  return (
    <ParticipantCategoriesContext.Provider
      value={{ categories, filterOptions, categorySlugs }}
    >
      {children}
    </ParticipantCategoriesContext.Provider>
  );
};

export const useParticipantCategories = (): ParticipantCategoriesContextValue => {
  const context = useContext(ParticipantCategoriesContext);
  if (!context) {
    throw new Error(
      "useParticipantCategories must be used within ParticipantCategoriesProvider"
    );
  }
  return context;
};

export const useParticipantCategoriesOptional =
  (): ParticipantCategoriesContextValue | null =>
    useContext(ParticipantCategoriesContext);
