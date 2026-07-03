import type { ParticipantCategory } from "@/lib/participants/participant-categories";
import type { ParticipantCategoryUserFormData } from "@/schemas/participantCategorySchema";

export const categoryToFormData = (
  category: ParticipantCategory
): ParticipantCategoryUserFormData => ({
  id: category.id,
  label: category.label,
  bgColor: category.bgColor,
  fontColor: category.fontColor,
  sortOrder: category.sortOrder,
});

export const emptyCategoryFormData = (): ParticipantCategoryUserFormData => ({
  label: "",
  bgColor: "#000000",
  fontColor: "#ffffff",
  sortOrder: 10,
});
