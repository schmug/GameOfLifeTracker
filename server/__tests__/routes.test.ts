import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import express from 'express';
import { registerRoutes } from '../routes';
import { MemStorage } from '../storage';
import type { Server } from 'http';

let server: Server;
let baseUrl: string;

beforeAll(async () => {
  const app = express();
  app.use(express.json());
  server = await registerRoutes(app, new MemStorage());
  await new Promise<void>(resolve => server.listen(0, resolve));
  const addr = server.address();
  if (addr && typeof addr === 'object') {
    baseUrl = `http://127.0.0.1:${addr.port}`;
  } else {
    throw new Error('failed to start server');
  }
});

afterAll(() => {
  server.close();
});

describe('high score routes', () => {
  it('creates and retrieves a high score', async () => {
    const body = {
      sessionId: 'test',
      maxGenerations: 5,
      maxPopulation: 5,
      longestPattern: 2,
      gridSize: 25,
      date: new Date().toISOString()
    };
    const postRes = await fetch(`${baseUrl}/api/high-scores`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    expect(postRes.status).toBe(201);
    const created = await postRes.json();
    const getRes = await fetch(`${baseUrl}/api/high-scores/test`);
    expect(getRes.status).toBe(200);
    const fetched = await getRes.json();
    expect(fetched.id).toBe(created.id);
  });

  it('returns all-time best scores', async () => {
    const res = await fetch(`${baseUrl}/api/high-scores/best/all-time`);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data).toHaveProperty('maxGenerations');
  });
});

describe('share routes', () => {
  it('stores and retrieves a pattern', async () => {
    const res = await fetch(`${baseUrl}/api/share/abc`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pattern: '3o2b' })
    });
    expect(res.status).toBe(200);

    const getRes = await fetch(`${baseUrl}/api/share/abc`);
    expect(getRes.status).toBe(200);
    const body = await getRes.json();
    expect(body.pattern).toBe('3o2b');
  });
});
