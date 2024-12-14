import { z } from "zod";

const timeRangeSchema = z.object({
  open: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
  close: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
});

const dayScheduleSchema = z.array(timeRangeSchema);

export const visitingHoursSchema = z.object({
  id: z.string().uuid().optional(),
  user_id: z.string().uuid(),
  hours: z.record(z.string(), dayScheduleSchema),
});

export type VisitingHours = z.infer<typeof visitingHoursSchema>;
export type DaySchedule = z.infer<typeof dayScheduleSchema>;
export type TimeRange = z.infer<typeof timeRangeSchema>;
