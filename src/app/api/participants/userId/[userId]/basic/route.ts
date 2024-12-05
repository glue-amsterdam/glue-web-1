import { users } from "@/lib/mockMembers";
import { ParticipantUserBase } from "@/schemas/usersSchemas";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  props: { params: Promise<{ user_id: string }> }
) {
  const params = await props.params;
  if (!params || !params.user_id) {
    return NextResponse.json(
      { message: "Participant user_id is required" },
      { status: 400 }
    );
  }

  const { user_id } = params;

  const participants = users.filter(
    (user) => user.type === "participant"
  ) as ParticipantUserBase[];

  const filteredUser = participants.find((user) => user.user_id === user_id);

  if (!filteredUser) {
    return NextResponse.json(
      { message: "Participant by ID not found" },
      { status: 404 }
    );
  }

  const {
    images,
    slug,
    user_name,
    short_description: shortDescription,
    description,
    visiting_hours: visitingHours,
    phone_number: phoneNumber,
    visible_email: visibleEmail,
    visible_website: visibleWebsite,
    social_media: socialMedia,
    plan_id: planId,
  } = filteredUser;

  // Create the base response object
  const responseData = {
    images,
    slug,
    planId,
    user_name,
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
    const userWithMap = filteredUser;
    return NextResponse.json({
      ...responseData,
      mapId: userWithMap,
    });
  } else if ("noAddress" in filteredUser) {
    const userWithoutMap = filteredUser;
    return NextResponse.json({
      ...responseData,
      noAddress: userWithoutMap,
    });
  }

  // If neither mapId nor noAddress is present (this should not happen based on the types, but we'll handle it just in case)
  return NextResponse.json(
    { message: "Invalid participant data" },
    { status: 500 }
  );
}
