// Create an empty grid of specified size
export function createEmptyGrid(size: number): boolean[][] {
  return Array(size).fill(null).map(() => Array(size).fill(false));
}

// Create a random grid of specified size
export function createRandomGrid(size: number): boolean[][] {
  return Array(size).fill(null).map(() => 
    Array(size).fill(null).map(() => Math.random() > 0.7)
  );
}

// Count live neighbors for a cell
function countLiveNeighbors(grid: boolean[][], row: number, col: number): number {
  const rows = grid.length;
  const cols = grid[0].length;
  let count = 0;
  
  // Check all 8 neighboring cells
  for (let i = -1; i <= 1; i++) {
    for (let j = -1; j <= 1; j++) {
      // Skip the cell itself
      if (i === 0 && j === 0) continue;
      
      // Calculate neighbor coordinates with wrapping
      const neighborRow = (row + i + rows) % rows;
      const neighborCol = (col + j + cols) % cols;
      
      // Count live neighbors
      if (grid[neighborRow][neighborCol]) {
        count++;
      }
    }
  }
  
  return count;
}

// Calculate the next generation based on Conway's Game of Life rules
export function calculateNextGeneration(grid: boolean[][]): boolean[][] {
  const rows = grid.length;
  const cols = grid[0].length;
  const nextGen = createEmptyGrid(rows);
  
  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      const liveNeighbors = countLiveNeighbors(grid, i, j);
      const isAlive = grid[i][j];
      
      // Apply Conway's Game of Life rules
      if (isAlive) {
        // Survival: A live cell with 2 or 3 live neighbors survives
        nextGen[i][j] = liveNeighbors === 2 || liveNeighbors === 3;
      } else {
        // Birth: A dead cell with exactly 3 live neighbors becomes alive
        nextGen[i][j] = liveNeighbors === 3;
      }
    }
  }
  
  return nextGen;
}
