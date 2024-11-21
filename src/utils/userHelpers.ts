import {
  ParticipantUser,
  ParticipantUserWithMap,
  User,
} from "@/schemas/usersSchemas";
import { EnhancedUser, EnhancedOrganizer } from "@/schemas/eventSchemas";

export function getUserDetails(user: User | undefined): EnhancedUser | null {
  if (!user) return null;

  const baseDetails: EnhancedUser = {
    userId: user.userId,
    userName: user.userName,
  };

  if (user.type === "participant") {
    const participantUser = user as ParticipantUser;
    const enhancedUser: EnhancedUser = {
      ...baseDetails,
      slug: participantUser.slug,
    };

    if ("mapId" in participantUser) {
      enhancedUser.mapId = participantUser.mapId.id;
    }

    return enhancedUser;
  }

  return baseDetails;
}

export function getOrganizerDetails(
  user: User | undefined
): EnhancedOrganizer | null {
  if (!user) return null;

  const baseDetails: EnhancedOrganizer = {
    userId: user.userId,
    userName: user.userName,
    mapId: "", // Default empty string for mapId
  };

  if (user.type === "participant") {
    const participantUser = user as ParticipantUser;
    const participantDetails = {
      ...baseDetails,
      slug: participantUser.slug,
    };

    if ("mapId" in participantUser) {
      const userWithMap = participantUser as ParticipantUserWithMap;
      return {
        ...participantDetails,
        mapId: userWithMap.mapId.id,
      };
    } else if ("noAddress" in participantUser) {
      return {
        ...participantDetails,
        mapId: "", // Empty string for users without an address
      };
    }

    // If neither mapId nor noAddress is present (this should not happen based on the types, but we'll handle it just in case)
    return participantDetails;
  }

  return baseDetails;
}
