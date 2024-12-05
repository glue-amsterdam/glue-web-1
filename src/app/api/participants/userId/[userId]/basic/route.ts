import { users } from "@/lib/mockMembers";
import { ParticipantUserBase } from "@/schemas/usersSchemas";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  props: { params: Promise<{ userId: string }> }
) {
  const params = await props.params;

  console.log(params);
  if (!params || !params.userId) {
    return NextResponse.json(
      { message: "Participant user_id is required" },
      { status: 400 }
    );
  }

  const { userId } = params;

  const participants = users.filter(
    (user) => user.type === "participant"
  ) as ParticipantUserBase[];

  const filteredUser = participants.find((user) => user.user_id === userId);

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
    short_description,
    description,
    visiting_hours,
    phone_number,
    visible_email,
    visible_website,
    social_media,
    plan_id,
  } = filteredUser;

  // Create the base response object
  const responseData = {
    images,
    slug,
    plan_id,
    user_name,
    short_description,
    description,
    visiting_hours,
    phone_number,
    visible_email,
    visible_website,
    social_media,
  };

  console.log(responseData);

  // Check if the user has a mapId or noAddress
  if ("map_id" in filteredUser) {
    const userWithMap = filteredUser;
    return NextResponse.json({
      ...responseData,
      mapId: userWithMap,
    });
  } else if ("no_address" in filteredUser) {
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
