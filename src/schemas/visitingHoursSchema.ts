import { z } from "zod";

const timeRangeSchema = z.object({
  open: z.string(),
  close: z.string(),
});

export const visitingHoursDaySchema = z.object({
  user_id: z.string().uuid(),
  day_id: z.string(),
  hours: z.array(timeRangeSchema),
});

export const visitingHoursDaysSchema = z.object({
  visitingHours: z.array(visitingHoursDaySchema),
});

export type VisitingHoursDays = z.infer<typeof visitingHoursDaySchema>;
