import {
  ParticipantUser,
  ParticipantUserWithMap,
  User,
} from "@/schemas/usersSchemas";
import { EnhancedUser, EnhancedOrganizer } from "@/schemas/eventSchemas";

export function getUserDetails(user: User | undefined): EnhancedUser | null {
  if (!user) return null;

  const baseDetails: EnhancedUser = {
    user_id: user.user_id,
    user_name: user.user_name,
  };

  if (user.type === "participant") {
    const participantUser = user as ParticipantUser;
    const enhancedUser: EnhancedUser = {
      ...baseDetails,
      slug: participantUser.slug,
    };

    if ("map_id" in participantUser) {
      enhancedUser.map_id = participantUser.map_id?.id;
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
    user_id: user.user_id,
    user_name: user.user_name,
    map_id: "", // Default empty string for map_id
  };

  if (user.type === "participant") {
    const participantUser = user as ParticipantUser;
    const participantDetails = {
      ...baseDetails,
      slug: participantUser.slug,
    };

    if ("map_id" in participantUser) {
      const userWithMap = participantUser as ParticipantUserWithMap;
      return {
        ...participantDetails,
        map_id: userWithMap.map_id.id,
      };
    } else if ("noAddress" in participantUser) {
      return {
        ...participantDetails,
        map_id: "", // Empty string for users without an address
      };
    }

    // If neither map_id nor noAddress is present (this should not happen based on the types, but we'll handle it just in case)
    return participantDetails;
  }

  return baseDetails;
}
