import { AN_HOUR_IN_S, BASE_URL } from "@/constants";
import { PlansArraySchema, PlansArrayType } from "@/schemas/plansSchema";

const PLANS_MOCK_DATA: PlansArrayType = {
  plans: [
    {
      plan_id: "planId-0",
      plan_label: "FREE PLAN",
      plan_price: "0",
      plan_type: "free",
      plan_currency: "EUR",
      currency_logo: "€",
      plan_description: "Free plan to get started",
      plan_items: [
        {
          label: "Access to view the GLUE map",
        },
      ],
    },
    {
      plan_id: "planId-1",
      plan_label: "MEMBERSHIP ONLY",
      plan_price: "250",
      plan_type: "member",
      plan_currency: "EUR",
      currency_logo: "€",
      plan_description: "Membership only plan",
      plan_items: [
        {
          label: "Invitation to 2/3 GLUE Community Cocktails",
        },
        {
          label: "1 personal invite for the Paradiso opening party",
        },
        {
          label: "The use of 'Proud GLUE Member' email signature",
        },
        {
          label: "Option to upgrade to participant status",
        },
      ],
    },
    {
      plan_id: "planId-2",
      plan_label: "STICKY",
      plan_price: "450",
      plan_type: "participant",
      plan_currency: "EUR",
      currency_logo: "€",
      plan_description:
        "For individual designers, architects, makers & artists only. Branding during GLUE will be based on your personal name (not a studio/label name).",
      plan_items: [
        {
          label: "Personal page on GLUE website",
        },
        {
          label: "Dot on the GLUE map",
        },
        {
          label: "Street signage during design route",
        },
        {
          label: "1 post/reel on Instagram",
        },
        {
          label: "1 year GLUE Membership",
        },
        {
          label: "Special event mention in Program",
        },
        {
          label: "Invitation to GLUE Community Cocktails",
        },
        {
          label: "1 Personal invite for the Paradiso opening party",
        },
      ],
    },
    {
      plan_id: "planId-3",
      plan_label: "BINDER",
      plan_price: "950",
      plan_type: "participant",
      plan_currency: "EUR",
      currency_logo: "€",
      plan_description:
        "For studios, design brands/labels, architectural firms, and showrooms with one to nine FTE's",
      plan_items: [
        {
          label: "Personal page on GLUE website",
        },
        {
          label: "Dot on the GLUE map",
        },
        {
          label: "Street signage during design route",
        },
        {
          label: "2 posts/reels on Instagram",
        },
        {
          label: "1 year GLUE membership",
        },
        {
          label: "Special event mention in Program",
        },
        {
          label: "Invitation to GLUE Community Cocktails",
        },
        {
          label: "1 Personal invite for the Paradiso opening party",
        },
      ],
    },
    {
      plan_id: "planId-4",
      plan_label: "CEMENT",
      plan_price: "1950",
      plan_type: "participant",
      plan_currency: "EUR",
      currency_logo: "€",
      plan_description:
        "For studios, design brands/labels, architectural firms, and showrooms with ten or more FTE's, and firms with two or more brands/labels",
      plan_items: [
        {
          label: "Personal page on GLUE website",
        },
        {
          label: "Dot on the GLUE map",
        },
        {
          label: "Street signage during design route",
        },
        {
          label: "3 posts/reels on Instagram",
        },
        {
          label: "1 year GLUE membership",
        },
        {
          label: "Special event mention in Program",
        },
        {
          label: "Invitation to GLUE Community Cocktails",
        },
        {
          label: "3 Personal invites for the Paradiso opening party",
        },
        {
          label: "Possibility to host a Community Cocktail",
        },
      ],
    },
    {
      plan_id: "planId-5",
      plan_label: "SUPER GLUE",
      plan_price: "4000",
      plan_type: "participant",
      plan_currency: "EUR",
      currency_logo: "€",
      plan_description:
        "For design labels and collective showrooms, who want more exposure and awareness during GLUE. As a SUPER GLUE participant you have the opportunity to put something extraordinary on the map.",
      plan_items: [
        {
          label: "Personal page on GLUE website",
        },
        {
          label: "Dot on the GLUE map",
        },
        {
          label: "Street signage during design route",
        },
        {
          label: "4 posts on Instagram",
        },
        {
          label: "2 years GLUE memberships",
        },
        {
          label: "Special event mention in Program",
        },
        {
          label: "Invitation to GLUE Community Cocktails",
        },
        {
          label: "4 Personal invites for the Paradiso opening party",
        },
        {
          label: "2 VIP invites for pre-opening party",
        },
        {
          label: "Possibility to host a Community Cocktail",
        },
        {
          label: "Possibility to host a unique tailor-made event",
        },
      ],
    },
  ],
};

export async function fetchPlans(): Promise<PlansArrayType> {
  try {
    const response = await fetch(`${BASE_URL}/plans`, {
      next: { revalidate: AN_HOUR_IN_S },
    });

    if (!response.ok) {
      if (
        process.env.NODE_ENV === "production" &&
        process.env.NEXT_PHASE === "phase-production-build"
      ) {
        console.log("Build environment detected, using mock data");
        return getPlansMockData();
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    const validatedData = PlansArraySchema.parse(data);

    return validatedData;
  } catch (error) {
    console.error("Last error in the tryCatch block in Plans fetcher:", error);
    return getPlansMockData();
  }
}
export function getPlansMockData(): PlansArrayType {
  return PLANS_MOCK_DATA;
}
