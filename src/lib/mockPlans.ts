import { generateTimestamps } from "@/mockConstants";
import { PlansResponse } from "@/utils/sign-in.types";

const plans: PlansResponse = {
  plans: [
    {
      planId: "planId-0",
      planLabel: "FREE PLAN",
      planPrice: "0",
      planCurrency: "EUR",
      currencyLogo: "€",
      planItems: [
        {
          id: "plan-0-item-0",
          plan_id: "plan-0-planId",
          label: "Access to view the GLUE map",
        },
      ],
      ...generateTimestamps(),
    },
    {
      planId: "planId-1",
      planLabel: "MEMBERSHIP ONLY",
      planPrice: "250",
      planCurrency: "EUR",
      currencyLogo: "€",
      planItems: [
        {
          id: "plan-1-item-0",
          plan_id: "plan-1-planId",
          label: "Invitation to 2/3 GLUE Community Cocktails",
        },
        {
          id: "plan-1-item-1",
          plan_id: "plan-1-planId",
          label: "1 personal invite for the Paradiso opening party",
        },
        {
          id: "plan-1-item-2",
          plan_id: "plan-1-planId",
          label: "The use of 'Proud GLUE Member' email signature",
        },
        {
          id: "plan-1-item-3",
          plan_id: "plan-1-planId",
          label: "Option to upgrade to participant status",
        },
      ],
      ...generateTimestamps(),
    },
    {
      planId: "planId-2",
      planLabel: "STICKY",
      planPrice: "450",
      planCurrency: "EUR",
      currencyLogo: "€",
      planItems: [
        {
          id: "plan-2-item-0",
          plan_id: "plan-2-planId",
          label: "Personal page on GLUE website",
        },
        {
          id: "plan-2-item-1",
          plan_id: "plan-2-planId",
          label: "Dot on the GLUE map",
        },
        {
          id: "plan-2-item-2",
          plan_id: "plan-2-planId",
          label: "Street signage during design route",
        },
        {
          id: "plan-2-item-3",
          plan_id: "plan-2-planId",
          label: "1 post/reel on Instagram",
        },
        {
          id: "plan-2-item-4",
          plan_id: "plan-2-planId",
          label: "1 year GLUE Membership",
        },
        {
          id: "plan-2-item-5",
          plan_id: "plan-2-planId",
          label: "Special event mention in Program",
        },
        {
          id: "plan-2-item-6",
          plan_id: "plan-2-planId",
          label: "Invitation to GLUE Community Cocktails",
        },
        {
          id: "plan-2-item-7",
          plan_id: "plan-2-planId",
          label: "1 Personal invite for the Paradiso opening party",
        },
      ],
      ...generateTimestamps(),
    },
    {
      planId: "planId-3",
      planLabel: "BINDER",
      planPrice: "950",
      planCurrency: "EUR",
      currencyLogo: "€",
      planItems: [
        {
          id: "plan-3-item-0",
          plan_id: "plan-3-planId",
          label: "Personal page on GLUE website",
        },
        {
          id: "plan-3-item-1",
          plan_id: "plan-3-planId",
          label: "Dot on the GLUE map",
        },
        {
          id: "plan-3-item-2",
          plan_id: "plan-3-planId",
          label: "Street signage during design route",
        },
        {
          id: "plan-3-item-3",
          plan_id: "plan-3-planId",
          label: "2 posts/reels on Instagram",
        },
        {
          id: "plan-3-item-4",
          plan_id: "plan-3-planId",
          label: "1 year GLUE membership",
        },
        {
          id: "plan-3-item-5",
          plan_id: "plan-3-planId",
          label: "Special event mention in Program",
        },
        {
          id: "plan-3-item-6",
          plan_id: "plan-3-planId",
          label: "Invitation to GLUE Community Cocktails",
        },
        {
          id: "plan-3-item-7",
          plan_id: "plan-3-planId",
          label: "1 Personal invite for the Paradiso opening party",
        },
      ],
      ...generateTimestamps(),
    },
    {
      planId: "planId-4",
      planLabel: "CEMENT",
      planPrice: "1950",
      planCurrency: "EUR",
      currencyLogo: "€",
      planItems: [
        {
          id: "plan-4-item-0",
          plan_id: "plan-4-planId",
          label: "Personal page on GLUE website",
        },
        {
          id: "plan-4-item-1",
          plan_id: "plan-4-planId",
          label: "Dot on the GLUE map",
        },
        {
          id: "plan-4-item-2",
          plan_id: "plan-4-planId",
          label: "Street signage during design route",
        },
        {
          id: "plan-4-item-3",
          plan_id: "plan-4-planId",
          label: "3 posts/reels on Instagram",
        },
        {
          id: "plan-4-item-4",
          plan_id: "plan-4-planId",
          label: "1 year GLUE membership",
        },
        {
          id: "plan-4-item-5",
          plan_id: "plan-4-planId",
          label: "Special event mention in Program",
        },
        {
          id: "plan-4-item-6",
          plan_id: "plan-4-planId",
          label: "Invitation to GLUE Community Cocktails",
        },
        {
          id: "plan-4-item-7",
          plan_id: "plan-4-planId",
          label: "3 Personal invites for the Paradiso opening party",
        },
        {
          id: "plan-4-item-8",
          plan_id: "plan-4-planId",
          label: "Possibility to host a Community Cocktail",
        },
      ],
      ...generateTimestamps(),
    },
    {
      planId: "planId-5",
      planLabel: "SUPER GLUE",
      planPrice: "4000",
      planCurrency: "EUR",
      currencyLogo: "€",
      planItems: [
        {
          id: "plan-5-item-0",
          plan_id: "plan-5-planId",
          label: "Personal page on GLUE website",
        },
        {
          id: "plan-5-item-1",
          plan_id: "plan-5-planId",
          label: "Dot on the GLUE map",
        },
        {
          id: "plan-5-item-2",
          plan_id: "plan-5-planId",
          label: "Street signage during design route",
        },
        {
          id: "plan-5-item-3",
          plan_id: "plan-5-planId",
          label: "4 posts on Instagram",
        },
        {
          id: "plan-5-item-4",
          plan_id: "plan-5-planId",
          label: "2 years GLUE memberships",
        },
        {
          id: "plan-5-item-5",
          plan_id: "plan-5-planId",
          label: "Special event mention in Program",
        },
        {
          id: "plan-5-item-6",
          plan_id: "plan-5-planId",
          label: "Invitation to GLUE Community Cocktails",
        },
        {
          id: "plan-5-item-7",
          plan_id: "plan-5-planId",
          label: "4 Personal invites for the Paradiso opening party",
        },
        {
          id: "plan-5-item-8",
          plan_id: "plan-5-planId",
          label: "2 VIP invites for pre-opening party",
        },
        {
          id: "plan-5-item-9",
          plan_id: "plan-5-planId",
          label: "Possibility to host a Community Cocktail",
        },
        {
          id: "plan-5-item-10",
          plan_id: "plan-5-planId",
          label: "Possibility to host a unique tailor-made event",
        },
      ],
      ...generateTimestamps(),
    },
  ],
};

export default plans;
