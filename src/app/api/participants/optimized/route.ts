import { users } from "@/lib/mockMembers";
import { ParticipantUser } from "@/schemas/usersSchemas";

export type OptimizedParticipant = {
  userId: string;
  slug: string;
  userName: string;
  shortDescription: string;
  imageUrl: string;
  planId: string;
};

export async function GET() {
  const participants: ParticipantUser[] = users.filter(
    (user) => user.type === "participant"
  );

  const optimizedParticipants: OptimizedParticipant[] = participants.map(
    (user) => {
      const { userId, userName, slug, shortDescription } = user;
      return {
        userId,
        userName,
        slug,
        shortDescription,
        imageUrl: user.images?.[0].imageUrl || "",
        planId: user.planId,
      };
    }
  );

  return new Response(JSON.stringify(optimizedParticipants), {
    headers: { "Content-Type": "application/json" },
  });
}
