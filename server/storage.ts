import {
  users,
  highScores,
  type User,
  type InsertUser,
  type HighScore,
  type InsertHighScore,
  type UpdateHighScore,
} from "@shared/schema";
import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import { eq, desc, gt } from "drizzle-orm";

// modify the interface with any CRUD methods
// you might need

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // High Score methods
  getAllHighScores(): Promise<HighScore[]>;
  getHighScoreBySessionId(sessionId: string): Promise<HighScore | undefined>;
  createHighScore(highScore: InsertHighScore & { date: Date }): Promise<HighScore>;
  updateHighScoreBySessionId(sessionId: string, data: UpdateHighScore): Promise<HighScore | undefined>;
  getAllTimeBestScores(): Promise<any>; // Returns formatted best scores
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private highScores: Map<number, HighScore>;
  userCurrentId: number;
  highScoreCurrentId: number;

  constructor() {
    this.users = new Map();
    this.highScores = new Map();
    this.userCurrentId = 1;
    this.highScoreCurrentId = 1;
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userCurrentId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }
  
  // High Score methods implementation
  async getAllHighScores(): Promise<HighScore[]> {
    return Array.from(this.highScores.values());
  }
  
  async getHighScoreBySessionId(sessionId: string): Promise<HighScore | undefined> {
    return Array.from(this.highScores.values()).find(
      (score) => score.sessionId === sessionId
    );
  }
  
  async createHighScore(highScore: InsertHighScore & { date: Date }): Promise<HighScore> {
    const id = this.highScoreCurrentId++;
    
    // Create a copy of the highScore object without the Date object
    const { date, ...restHighScore } = highScore;
    
    // Ensure we have a date in ISO string format for consistent handling
    const dateISOString = date instanceof Date 
      ? date.toISOString()
      : new Date().toISOString();
      
    // Create the new high score with the date as string
    const newHighScore: HighScore = { 
      ...restHighScore, 
      id,
      date: dateISOString // Store as ISO string
    };
    
    this.highScores.set(id, newHighScore);
    return newHighScore;
  }
  
  async updateHighScoreBySessionId(sessionId: string, data: UpdateHighScore): Promise<HighScore | undefined> {
    const existingHighScore = await this.getHighScoreBySessionId(sessionId);
    
    if (!existingHighScore) {
      return undefined;
    }
    
    const updatedHighScore = { ...existingHighScore, ...data };
    this.highScores.set(existingHighScore.id, updatedHighScore);
    
    return updatedHighScore;
  }
  
  async getAllTimeBestScores(): Promise<{
    maxGenerations: HighScore | null,
    maxPopulation: HighScore | null,
    longestPattern: HighScore | null
  }> {
    const scores = Array.from(this.highScores.values());
    
    if (scores.length === 0) {
      return {
        maxGenerations: null,
        maxPopulation: null,
        longestPattern: null
      };
    }
    
    // Filter out scores with zero values
    const nonZeroGenScores = scores.filter(score => score.maxGenerations > 0);
    const nonZeroPopScores = scores.filter(score => score.maxPopulation > 0);
    const nonZeroPatternScores = scores.filter(score => score.longestPattern > 0);
    
    // Find highest max generations
    const maxGenScore = nonZeroGenScores.length > 0 
      ? nonZeroGenScores.reduce((prev, current) => 
          (prev.maxGenerations > current.maxGenerations) ? prev : current)
      : null;
    
    // Find highest max population
    const maxPopScore = nonZeroPopScores.length > 0
      ? nonZeroPopScores.reduce((prev, current) => 
          (prev.maxPopulation > current.maxPopulation) ? prev : current)
      : null;
    
    // Find longest pattern
    const longestPatternScore = nonZeroPatternScores.length > 0
      ? nonZeroPatternScores.reduce((prev, current) => 
          (prev.longestPattern > current.longestPattern) ? prev : current)
      : null;
    
    return {
      maxGenerations: maxGenScore,
      maxPopulation: maxPopScore,
      longestPattern: longestPatternScore
    };
  }
}

export class DatabaseStorage implements IStorage {
  private db;

  constructor(url: string) {
    const client = neon(url);
    this.db = drizzle(client);
  }

  async getUser(id: number): Promise<User | undefined> {
    const rows = await this.db.select().from(users).where(eq(users.id, id));
    return rows[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const rows = await this.db
      .select()
      .from(users)
      .where(eq(users.username, username));
    return rows[0];
  }

  async createUser(user: InsertUser): Promise<User> {
    const rows = await this.db.insert(users).values(user).returning();
    return rows[0];
  }

  async getAllHighScores(): Promise<HighScore[]> {
    const rows = await this.db.select().from(highScores);
    return rows.map((r) => ({ ...r, date: r.date.toISOString() }));
  }

  async getHighScoreBySessionId(sessionId: string): Promise<HighScore | undefined> {
    const rows = await this.db
      .select()
      .from(highScores)
      .where(eq(highScores.sessionId, sessionId));
    const row = rows[0];
    return row ? { ...row, date: row.date.toISOString() } : undefined;
  }

  async createHighScore(highScore: InsertHighScore & { date: Date }): Promise<HighScore> {
    const rows = await this.db.insert(highScores).values(highScore).returning();
    const row = rows[0];
    return { ...row, date: row.date.toISOString() };
  }

  async updateHighScoreBySessionId(
    sessionId: string,
    data: UpdateHighScore,
  ): Promise<HighScore | undefined> {
    const rows = await this.db
      .update(highScores)
      .set(data)
      .where(eq(highScores.sessionId, sessionId))
      .returning();
    const row = rows[0];
    return row ? { ...row, date: row.date.toISOString() } : undefined;
  }

  async getAllTimeBestScores(): Promise<{
    maxGenerations: HighScore | null;
    maxPopulation: HighScore | null;
    longestPattern: HighScore | null;
  }> {
    const [maxGen] = await this.db
      .select()
      .from(highScores)
      .where(gt(highScores.maxGenerations, 0))
      .orderBy(desc(highScores.maxGenerations))
      .limit(1);

    const [maxPop] = await this.db
      .select()
      .from(highScores)
      .where(gt(highScores.maxPopulation, 0))
      .orderBy(desc(highScores.maxPopulation))
      .limit(1);

    const [longest] = await this.db
      .select()
      .from(highScores)
      .where(gt(highScores.longestPattern, 0))
      .orderBy(desc(highScores.longestPattern))
      .limit(1);

    const toHS = (row: any): HighScore => ({ ...row, date: row.date.toISOString() });

    return {
      maxGenerations: maxGen ? toHS(maxGen) : null,
      maxPopulation: maxPop ? toHS(maxPop) : null,
      longestPattern: longest ? toHS(longest) : null,
    };
  }
}

export let storage: IStorage = new MemStorage();

export function setStorage(newStorage: IStorage) {
  storage = newStorage;
}


