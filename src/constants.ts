import {
  MemberUser,
  ParticipantUser,
  PlanResponseById,
  User,
} from "@/utils/user-types";

export const NAVBAR_HEIGHT: number = 5;

export const DAYS = [
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
  "Other",
] as const;

export const EVENT_TYPES = [
  "Lecture",
  "Workshop",
  "Drink",
  "Guided Tour",
  "Other",
] as const;

export function isParticipantUser(
  user: User
): user is ParticipantUser & { planDetails: PlanResponseById } {
  return user.type === "participant";
}

export function isPaidUser(
  user: User
): user is (ParticipantUser | MemberUser) & { planDetails: PlanResponseById } {
  return user.type === "participant" || user.type === "member";
}
