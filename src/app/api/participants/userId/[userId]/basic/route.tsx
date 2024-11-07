import { users } from "@/lib/mockMembers";
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

  const participants = users.filter((user) => user.type === "participant");

  const filteredUser = participants.filter((user) => user.userId === userId);

  const {
    createdAt,
    images,
    slug,
    userName,
    shortDescription,
    description,
    mapInfo,
    visitingHours,
    phoneNumber,
    visibleEmail,
    visibleWebsite,
    socialMedia,
    updatedAt,
    planId,
  } = filteredUser[0];

  const { id, place_name } = mapInfo;

  if (filteredUser.length === 0) {
    return NextResponse.json(
      { message: "Participant by ID not found" },
      { status: 404 }
    );
  }

  return NextResponse.json({
    updatedAt,
    createdAt,
    images,
    slug,
    planId,
    userName,
    shortDescription,
    description,
    mapId: id,
    mapPlaceName: place_name,
    visitingHours,
    phoneNumber,
    visibleEmail,
    visibleWebsite,
    socialMedia,
  });
}
