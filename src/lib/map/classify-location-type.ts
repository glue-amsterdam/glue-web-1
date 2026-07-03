import type { ExhibitorType } from "@/lib/participants/exhibitor-types";
import type { ParticipantCategory } from "@/lib/participants/participant-categories";
import { classifyCategory } from "@/lib/participants/participant-categories";

export const classifyLocationType = (
  memberCount: number,
  assignedCategory: string | null | undefined,
  categories: ParticipantCategory[]
): ExhibitorType =>
  classifyCategory(memberCount, assignedCategory, categories);
