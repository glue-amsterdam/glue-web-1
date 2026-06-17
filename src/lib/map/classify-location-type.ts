import type { ExhibitorType } from "@/lib/participants/exhibitor-types";

export const classifyLocationType = (
  memberCount: number,
  primarySpecialProgram: boolean
): ExhibitorType => {
  if (memberCount > 3) return "hub";
  if (primarySpecialProgram) return "special-program";
  return "up-to-three-participants";
};
