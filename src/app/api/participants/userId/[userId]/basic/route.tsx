import { users } from "@/lib/mockMembers";
import {
  ParticipantUser,
  ParticipantUserWithMap,
  ParticipantUserWithoutMap,
} from "@/schemas/usersSchemas";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: { userId: string } }
) {
  if (!params || !params.userId) {
    return NextResponse.json(
      { message: "Participant userId is required" },
      { status: 400 }
    );
  }

  const { userId } = params;

  const participants = users.filter(
    (user) => user.type === "participant"
  ) as ParticipantUser[];

  const filteredUser = participants.find((user) => user.userId === userId);

  if (!filteredUser) {
    return NextResponse.json(
      { message: "Participant by ID not found" },
      { status: 404 }
    );
  }

  const {
    createdAt,
    images,
    slug,
    userName,
    shortDescription,
    description,
    visitingHours,
    phoneNumber,
    visibleEmail,
    visibleWebsite,
    socialMedia,
    updatedAt,
    planId,
  } = filteredUser;

  // Create the base response object
  const responseData = {
    updatedAt,
    createdAt,
    images,
    slug,
    planId,
    userName,
    shortDescription,
    description,
    visitingHours,
    phoneNumber,
    visibleEmail,
    visibleWebsite,
    socialMedia,
  };

  // Check if the user has a mapId or noAddress
  if ("mapId" in filteredUser) {
    const userWithMap = filteredUser as ParticipantUserWithMap;
    return NextResponse.json({
      ...responseData,
      mapId: userWithMap.mapId.id,
    });
  } else if ("noAddress" in filteredUser) {
    const userWithoutMap = filteredUser as ParticipantUserWithoutMap;
    return NextResponse.json({
      ...responseData,
      noAddress: userWithoutMap.noAddress,
    });
  }

  // If neither mapId nor noAddress is present (this should not happen based on the types, but we'll handle it just in case)
  return NextResponse.json(
    { message: "Invalid participant data" },
    { status: 500 }
  );
}
