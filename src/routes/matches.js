import express from "express";
import { createMatchSchema, MATCH_STATUS, listMatchesQuerySchema } from "../validation/matches.js";
import { db } from "../db/db.js";
import { matches } from "../db/schema.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    // Validate query parameters
    const queryParams = listMatchesQuerySchema.safeParse(req.query);
    
    if (!queryParams.success) {
      return res.status(400).json({
        message: "Invalid query parameters",
        errors: queryParams.error.errors,
      });
    }

    // Build query with limit
    let query = db.select().from(matches);
    
    // Apply limit if provided
    if (queryParams.data.limit) {
      query = query.limit(queryParams.data.limit);
    }
    
    // Execute query
    const matchesList = await query;

    res.status(200).json({
      message: "Matches fetched successfully",
      count: matchesList.length,
      data: matchesList,
    });
  } catch (error) {
    console.error("Error fetching matches:", error);
    res.status(500).json({ 
      message: "Internal server error", 
      error: error.message 
    });
  }
});

// post
router.post("/", async (req, res) => {
  const parsed = createMatchSchema.safeParse(req.body);

  if (!parsed.success) {
    return res
      .status(400)
      .json({ message: "Invalid request body", errors: parsed.error.errors });
  }

  const { startTime, endTime, homeScore, awayScore } = parsed.data;

  try {
    const [event] = await db
      .insert(matches)
      .values({
        ...parsed.data,
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        homeScore: homeScore ?? 0,
        awayScore: awayScore ?? 0,
        status: MATCH_STATUS.SCHEDULED,
      })
      .returning();

    res
      .status(201)
      .json({ message: "Match created successfully", data: event });
  } catch (error) {
    console.error("Error creating match:", error);
    res.status(500).json({
      message: "Failed to create match",
      error: error.message,
    });
  }
});

export default router;
