import { users } from "@/lib/mockMembers";
import { ParticipantUser } from "@/schemas/usersSchemas";

export type OptimizedParticipant = {
  user_id: string;
  slug: string;
  user_name: string;
  short_description: string;
  image_url: string;
  planId: string;
};

export async function GET() {
  const participants: ParticipantUser[] = users.filter(
    (user) => user.type === "participant"
  );

  const optimizedParticipants: OptimizedParticipant[] = participants.map(
    (user) => {
      const { user_id, user_name, slug, short_description } = user;
      return {
        user_id,
        user_name,
        slug,
        short_description,
        image_url: user.images?.[0].image_url || "",
        planId: user.plan_id,
      };
    }
  );

  return new Response(JSON.stringify(optimizedParticipants), {
    headers: { "Content-Type": "application/json" },
  });
}
