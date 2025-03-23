// Define a cell with both alive state and color
export interface Cell {
  alive: boolean;
  color: string;
}

// Function to generate a random vibrant color
export function getRandomColor(): string {
  // Use HSL to ensure vibrant colors (high saturation)
  const hue = Math.floor(Math.random() * 360); // 0-359 degrees on the color wheel
  const saturation = 70 + Math.floor(Math.random() * 30); // 70-100% saturation for vibrant colors
  const lightness = 40 + Math.floor(Math.random() * 20); // 40-60% lightness for balanced brightness
  
  return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
}

// Create an empty grid of specified size
export function createEmptyGrid(size: number): Cell[][] {
  return Array(size).fill(null).map(() => 
    Array(size).fill(null).map(() => ({ 
      alive: false, 
      color: getRandomColor() 
    }))
  );
}

// Create a random grid of specified size
export function createRandomGrid(size: number): Cell[][] {
  return Array(size).fill(null).map(() => 
    Array(size).fill(null).map(() => ({ 
      alive: Math.random() > 0.7,
      color: getRandomColor()
    }))
  );
}

// Count live neighbors for a cell and collect their colors
function countLiveNeighbors(grid: Cell[][], row: number, col: number): { count: number, colors: string[] } {
  const rows = grid.length;
  const cols = grid[0].length;
  let count = 0;
  const neighborColors: string[] = [];
  
  // Check all 8 neighboring cells
  for (let i = -1; i <= 1; i++) {
    for (let j = -1; j <= 1; j++) {
      // Skip the cell itself
      if (i === 0 && j === 0) continue;
      
      // Calculate neighbor coordinates with wrapping
      const neighborRow = (row + i + rows) % rows;
      const neighborCol = (col + j + cols) % cols;
      
      // Count live neighbors and collect their colors
      if (grid[neighborRow][neighborCol].alive) {
        count++;
        neighborColors.push(grid[neighborRow][neighborCol].color);
      }
    }
  }
  
  return { count, colors: neighborColors };
}

// Function to blend parent cell colors (select a parent's color)
function blendColors(colors: string[]): string {
  if (colors.length === 0) return getRandomColor();
  if (colors.length === 1) return colors[0];
  
  // For simplicity, just pick a random parent color
  // This simulates genetic inheritance from one of the parents
  return colors[Math.floor(Math.random() * colors.length)];
}

// Calculate the next generation based on Conway's Game of Life rules
export function calculateNextGeneration(grid: Cell[][]): Cell[][] {
  const rows = grid.length;
  const cols = grid[0].length;
  // Create a new grid while preserving colors of dead cells
  const nextGen = Array(rows).fill(null).map((_, i) => 
    Array(cols).fill(null).map((_, j) => ({ 
      alive: false, 
      color: grid[i][j].color 
    }))
  );
  
  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      const { count: liveNeighbors, colors: neighborColors } = countLiveNeighbors(grid, i, j);
      const isAlive = grid[i][j].alive;
      
      // Apply Conway's Game of Life rules
      if (isAlive) {
        // Survival: A live cell with 2 or 3 live neighbors survives
        if (liveNeighbors === 2 || liveNeighbors === 3) {
          nextGen[i][j].alive = true;
          // Keep its existing color
        }
      } else {
        // Birth: A dead cell with exactly 3 live neighbors becomes alive
        if (liveNeighbors === 3) {
          nextGen[i][j].alive = true;
          // Inherit color from neighbors
          nextGen[i][j].color = blendColors(neighborColors);
        }
      }
    }
  }
  
  return nextGen;
}
