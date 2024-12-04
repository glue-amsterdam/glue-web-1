import { generateTimestamps } from "@/mockConstants";
import { PlansResponse } from "@/utils/sign-in.types";

const plans: PlansResponse = {
  plans: [
    {
      planId: "planId-0",
      planLabel: "FREE PLAN",
      planPrice: "0",
      planType: "free",
      planCurrency: "EUR",
      currencyLogo: "€",
      planDescription: "Free plan to get started",
      planItems: [
        {
          label: "Access to view the GLUE map",
        },
      ],
      ...generateTimestamps(),
    },
    {
      planId: "planId-1",
      planLabel: "MEMBERSHIP ONLY",
      planPrice: "250",
      planType: "member",
      planCurrency: "EUR",
      currencyLogo: "€",
      planDescription: "Membership only plan",
      planItems: [
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
      ...generateTimestamps(),
    },
    {
      planId: "planId-2",
      planLabel: "STICKY",
      planPrice: "450",
      planType: "participant",
      planCurrency: "EUR",
      currencyLogo: "€",
      planDescription:
        "For individual designers, architects, makers & artists only. Branding during GLUE will be based on your personal name (not a studio/label name).",
      planItems: [
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
      ...generateTimestamps(),
    },
    {
      planId: "planId-3",
      planLabel: "BINDER",
      planPrice: "950",
      planType: "participant",
      planCurrency: "EUR",
      currencyLogo: "€",
      planDescription:
        "For studios, design brands/labels, architectural firms, and showrooms with one to nine FTE's",
      planItems: [
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
      ...generateTimestamps(),
    },
    {
      planId: "planId-4",
      planLabel: "CEMENT",
      planPrice: "1950",
      planType: "participant",
      planCurrency: "EUR",
      currencyLogo: "€",
      planDescription:
        "For studios, design brands/labels, architectural firms, and showrooms with ten or more FTE's, and firms with two or more brands/labels",
      planItems: [
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
      ...generateTimestamps(),
    },
    {
      planId: "planId-5",
      planLabel: "SUPER GLUE",
      planPrice: "4000",
      planType: "participant",
      planCurrency: "EUR",
      currencyLogo: "€",
      planDescription:
        "For design labels and collective showrooms, who want more exposure and awareness during GLUE. As a SUPER GLUE participant you have the opportunity to put something extraordinary on the map.",
      planItems: [
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
      ...generateTimestamps(),
    },
  ],
};

export default plans;
