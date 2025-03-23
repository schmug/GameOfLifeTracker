import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export const highScores = pgTable("high_scores", {
  id: serial("id").primaryKey(),
  maxGenerations: integer("max_generations").notNull(),
  maxPopulation: integer("max_population").notNull(),
  longestPattern: integer("longest_pattern").notNull(),
  gridSize: integer("grid_size").notNull(),
  date: timestamp("date").notNull(),
  sessionId: text("session_id").notNull(),
});

export const insertHighScoreSchema = createInsertSchema(highScores).pick({
  maxGenerations: true,
  maxPopulation: true,
  longestPattern: true,
  gridSize: true,
  sessionId: true,
});

export type InsertHighScore = z.infer<typeof insertHighScoreSchema>;
export type HighScore = typeof highScores.$inferSelect;

export const updateHighScoreSchema = insertHighScoreSchema.partial();

export type UpdateHighScore = z.infer<typeof updateHighScoreSchema>;
