export { serializeGrid, deserializeGrid };

import { Cell, getRandomColor } from './gameOfLife';

// Serialize grid using simple run length encoding
function serializeGrid(grid: Cell[][]): string {
  const size = grid.length;
  if (size === 0) return '0:';
  const bits = grid.flat().map(c => (c.alive ? '1' : '0'));
  let out = '';
  let prev = bits[0];
  let count = 1;
  for (let i = 1; i < bits.length; i++) {
    const cur = bits[i];
    if (cur === prev) count++; else {
      out += `${count}${prev === '1' ? 'o' : 'b'}`;
      prev = cur;
      count = 1;
    }
  }
  out += `${count}${prev === '1' ? 'o' : 'b'}`;
  return `${size}:${out}`;
}

// Deserialize grid back from run length encoding
function deserializeGrid(data: string): Cell[][] {
  if (!data) return [];
  const [sizeStr, encoded] = data.split(':');
  const size = parseInt(sizeStr, 10);
  if (!encoded) return Array(size).fill(null).map(() => Array(size).fill(null).map(() => ({alive:false,color:getRandomColor()})));
  const cells: Cell[] = [];
  const regex = /(\d+)([ob])/g;
  let match: RegExpExecArray | null;
  while ((match = regex.exec(encoded))) {
    const count = parseInt(match[1], 10);
    const alive = match[2] === 'o';
    for (let i = 0; i < count; i++) {
      cells.push({ alive, color: getRandomColor() });
    }
  }
  const grid: Cell[][] = [];
  for (let r = 0; r < size; r++) {
    grid.push(cells.slice(r * size, (r + 1) * size));
  }
  return grid;
}
