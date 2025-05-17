import { describe, expect, it, beforeEach } from 'vitest';
import { MemStorage, type IStorage } from '../storage';

let storage: IStorage;

beforeEach(() => {
  storage = new MemStorage();
});

describe('high score CRUD', () => {
  it('creates and fetches a high score', async () => {
    const created = await storage.createHighScore({
      sessionId: 'abc',
      maxGenerations: 10,
      maxPopulation: 20,
      longestPattern: 5,
      gridSize: 25,
      date: new Date(),
    });

    const fetched = await storage.getHighScoreBySessionId('abc');
    expect(fetched).toEqual(created);
  });

  it('updates a high score', async () => {
    await storage.createHighScore({
      sessionId: 'abc',
      maxGenerations: 10,
      maxPopulation: 20,
      longestPattern: 5,
      gridSize: 25,
      date: new Date(),
    });

    const updated = await storage.updateHighScoreBySessionId('abc', {
      maxGenerations: 50,
    });

    expect(updated?.maxGenerations).toBe(50);
  });

  it('returns all-time best scores', async () => {
    await storage.createHighScore({
      sessionId: 'a',
      maxGenerations: 1,
      maxPopulation: 2,
      longestPattern: 3,
      gridSize: 25,
      date: new Date(),
    });
    await storage.createHighScore({
      sessionId: 'b',
      maxGenerations: 5,
      maxPopulation: 1,
      longestPattern: 4,
      gridSize: 25,
      date: new Date(),
    });

    const best = await storage.getAllTimeBestScores();
    expect(best.maxGenerations?.maxGenerations).toBe(5);
    expect(best.longestPattern?.longestPattern).toBe(4);
  });
});

