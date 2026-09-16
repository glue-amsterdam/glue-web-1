import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { SupabaseClient } from "@supabase/supabase-js";
import { ExhibitorNotFoundError } from "./exhibitor-detail-types";
import { requireHubUuid } from "./require-hub-uuid";

const VALID_HUB_ID = "c16f973d-30b3-4822-9252-fd8ccc890f7b";
const DIRTY_HUB_IDS = [
  "c16f973d-30b3-4822-9252-fd8ccc890f7b)",
  "45235550-a5c6-4abd-9e84-e1f8ad6e0f3c&quot",
  "45235550-a5c6-4abd-9e84-e1f8ad6e0f3c%26quot",
] as const;

/**
 * Mirrors getExhibitorHubById's early gate: validate UUID, then query.
 * Kept local so the unit test does not import Next-bound modules.
 */
const queryHubIdIfValid = async (
  supabase: SupabaseClient,
  hubId: string
): Promise<string> => {
  const parsedHubId = requireHubUuid(hubId);
  const { error } = await supabase
    .from("hubs")
    .select("id")
    .eq("id", parsedHubId)
    .single();

  if (error) {
    throw new ExhibitorNotFoundError();
  }

  return parsedHubId;
};

const createFailingSupabase = (): SupabaseClient =>
  ({
    from: () => {
      assert.fail("should not query supabase");
    },
  }) as unknown as SupabaseClient;

const createHubsQuerySupabase = (options: {
  onEqId: (id: string) => void;
}): SupabaseClient =>
  ({
    from: (table: string) => {
      assert.equal(table, "hubs");
      return {
        select: () => ({
          eq: (_column: string, id: string) => {
            options.onEqId(id);
            return {
              single: async () => ({
                data: { id },
                error: null,
              }),
            };
          },
        }),
      };
    },
  }) as unknown as SupabaseClient;

describe("requireHubUuid / getExhibitorHubById gate", () => {
  for (const dirtyId of DIRTY_HUB_IDS) {
    it(`throws without querying supabase for ${JSON.stringify(dirtyId)}`, async () => {
      await assert.rejects(
        () => queryHubIdIfValid(createFailingSupabase(), dirtyId),
        (error: unknown) => error instanceof ExhibitorNotFoundError
      );
    });
  }

  it("rejects dirty ids via requireHubUuid", () => {
    assert.throws(
      () => requireHubUuid(`${VALID_HUB_ID})`),
      (error: unknown) => error instanceof ExhibitorNotFoundError
    );
  });

  it("queries hubs with the clean UUID when hubId is valid", async () => {
    let eqId: string | null = null;
    const supabase = createHubsQuerySupabase({
      onEqId: (id) => {
        eqId = id;
      },
    });

    const result = await queryHubIdIfValid(supabase, VALID_HUB_ID);
    assert.equal(result, VALID_HUB_ID);
    assert.equal(eqId, VALID_HUB_ID);
  });
});
