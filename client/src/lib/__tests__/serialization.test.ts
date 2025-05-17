import { describe, it, expect } from 'vitest';
import { createEmptyGrid } from '../gameOfLife';
import { serializeGrid, deserializeGrid } from '../serialization';

describe('serialization', () => {
  it('round trips a grid', () => {
    const grid = createEmptyGrid(3);
    grid[0][1].alive = true;
    grid[2][2].alive = true;
    const str = serializeGrid(grid);
    const decoded = deserializeGrid(str);
    expect(decoded.length).toBe(3);
    expect(decoded[0][1].alive).toBe(true);
    expect(decoded[2][2].alive).toBe(true);
  });
});
