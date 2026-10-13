import { z } from "zod";

export const startChallengeSchema = z.object({
  started_on: z.iso.date("Pick the day you started."),
  timezone: z.string().min(1),
  backfill: z.boolean().default(false),
});

export type StartChallengeInput = z.output<typeof startChallengeSchema>;
