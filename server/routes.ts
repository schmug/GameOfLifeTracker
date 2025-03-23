import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertHighScoreSchema, updateHighScoreSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // High Scores API Routes
  
  // Get all high scores
  app.get("/api/high-scores", async (_req, res) => {
    try {
      const highScores = await storage.getAllHighScores();
      res.json(highScores);
    } catch (error) {
      console.error("Error fetching high scores:", error);
      res.status(500).json({ message: "Failed to fetch high scores" });
    }
  });

  // Create a new high score
  app.post("/api/high-scores", async (req, res) => {
    try {
      // If date is provided in the request body, use it, otherwise use current date
      let date = req.body.date ? new Date(req.body.date) : new Date();
      
      const validatedData = insertHighScoreSchema.parse({
        ...req.body,
        date
      });
      
      const newHighScore = await storage.createHighScore(validatedData);
      res.status(201).json(newHighScore);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid high score data", errors: error.errors });
      } else {
        console.error("Error creating high score:", error);
        res.status(500).json({ message: "Failed to create high score" });
      }
    }
  });

  // Update a high score by session ID
  app.patch("/api/high-scores/:sessionId", async (req, res) => {
    try {
      const { sessionId } = req.params;
      const validatedData = updateHighScoreSchema.parse(req.body);
      
      const updatedHighScore = await storage.updateHighScoreBySessionId(sessionId, validatedData);
      
      if (!updatedHighScore) {
        return res.status(404).json({ message: "High score not found" });
      }
      
      res.json(updatedHighScore);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid high score data", errors: error.errors });
      } else {
        console.error("Error updating high score:", error);
        res.status(500).json({ message: "Failed to update high score" });
      }
    }
  });

  // Get the all time best high scores (must be defined before the dynamic :sessionId route)
  app.get("/api/high-scores/best/all-time", async (_req, res) => {
    try {
      const bestScores = await storage.getAllTimeBestScores();
      res.json(bestScores);
    } catch (error) {
      console.error("Error fetching best scores:", error);
      res.status(500).json({ message: "Failed to fetch best scores" });
    }
  });

  // Get a high score by session ID
  app.get("/api/high-scores/:sessionId", async (req, res) => {
    try {
      const { sessionId } = req.params;
      const highScore = await storage.getHighScoreBySessionId(sessionId);
      
      if (!highScore) {
        return res.status(404).json({ message: "High score not found" });
      }
      
      res.json(highScore);
    } catch (error) {
      console.error("Error fetching high score:", error);
      res.status(500).json({ message: "Failed to fetch high score" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
