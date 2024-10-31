import { ParticipantUser, User } from "@/utils/user-types";

export function getUserDetails(user: User | undefined) {
  if (!user) return null;

  return {
    userId: user.userId,
    userName: user.userName,
    ...(user.type === "participant" && {
      slug: (user as ParticipantUser).slug,
    }),
  };
}

export function getOrganizerDetails(user: User | undefined) {
  if (!user) return null;

  return {
    userId: user.userId,
    userName: user.userName,
    ...(user.type === "participant" && {
      slug: (user as ParticipantUser).slug,
      mapId: (user as ParticipantUser).mapInfo.id,
      mapPlaceName: (user as ParticipantUser).mapInfo.place_name,
    }),
  };
}
