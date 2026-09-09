import { z } from "zod";

export const DEFAULT_HOME_STICKY_BUTTON_LABEL = "show details";
export const DEFAULT_HOME_STICKY_BUTTON_LINK =
  "/map?view=category&type=sticky-participants";

export const homeStickyCtaSchema = z.object({
  id: z.string().uuid().optional(),
  button_label: z.string().min(1, "Button label is required"),
  button_link: z.string().min(1, "Button link is required"),
});

export type HomeStickyCta = z.infer<typeof homeStickyCtaSchema>;
