import { users, type User, type InsertUser, type HighScore, type InsertHighScore, type UpdateHighScore } from "@shared/schema";

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
    const newHighScore: HighScore = { ...highScore, id };
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
  
  async getAllTimeBestScores(): Promise<any> {
    const scores = Array.from(this.highScores.values());
    
    if (scores.length === 0) {
      return {
        maxGenerations: null,
        maxPopulation: null,
        longestPattern: null
      };
    }
    
    // Find highest max generations
    const maxGenScore = scores.reduce((prev, current) => 
      (prev.maxGenerations > current.maxGenerations) ? prev : current
    );
    
    // Find highest max population
    const maxPopScore = scores.reduce((prev, current) => 
      (prev.maxPopulation > current.maxPopulation) ? prev : current
    );
    
    // Find longest pattern
    const longestPatternScore = scores.reduce((prev, current) => 
      (prev.longestPattern > current.longestPattern) ? prev : current
    );
    
    return {
      maxGenerations: maxGenScore.maxGenerations > 0 ? maxGenScore : null,
      maxPopulation: maxPopScore.maxPopulation > 0 ? maxPopScore : null,
      longestPattern: longestPatternScore.longestPattern > 0 ? longestPatternScore : null
    };
  }
}

export const storage = new MemStorage();
