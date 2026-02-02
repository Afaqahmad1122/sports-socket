import { z } from "zod";

// Match status constants
export const MATCH_STATUS = {
  SCHEDULED: "scheduled",
  LIVE: "live",
  FINISHED: "finished",
};

// List matches query schema - validates optional limit parameter
export const listMatchesQuerySchema = z.object({
  limit: z.coerce.number().int().positive().max(100).optional(),
});

// Match ID parameter schema - validates required id parameter
export const matchIdParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});

// Create match schema - validates match creation data
export const createMatchSchema = z
  .object({
    sport: z.string().min(1, "Sport must be a non-empty string"),
    homeTeam: z.string().min(1, "Home team must be a non-empty string"),
    awayTeam: z.string().min(1, "Away team must be a non-empty string"),
    startTime: z.string().refine(
      (val) => {
        const date = new Date(val);
        return !isNaN(date.getTime()) && val === date.toISOString();
      },
      { message: "startTime must be a valid ISO date string" }
    ),
    endTime: z.string().refine(
      (val) => {
        const date = new Date(val);
        return !isNaN(date.getTime()) && val === date.toISOString();
      },
      { message: "endTime must be a valid ISO date string" }
    ),
    homeScore: z.coerce.number().int().nonnegative().optional(),
    awayScore: z.coerce.number().int().nonnegative().optional(),
  })
  .superRefine((data, ctx) => {
    const startTime = new Date(data.startTime);
    const endTime = new Date(data.endTime);

    if (endTime <= startTime) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "endTime must be chronologically after startTime",
        path: ["endTime"],
      });
    }
  });

// Update score schema - validates score update data
export const updateScoreSchema = z.object({
  homeScore: z.coerce.number().int().nonnegative(),
  awayScore: z.coerce.number().int().nonnegative(),
});
