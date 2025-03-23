import { useState, useRef, useEffect, useCallback } from "react";
import { calculateNextGeneration, createEmptyGrid, createRandomGrid } from "@/lib/gameOfLife";

interface GameGridProps {
  gridSize: number;
  setGridSize: (size: number) => void;
  gameRunning: boolean;
  speed: number;
  setGeneration: (gen: number) => void;
  setLivingCells: (count: number) => void;
  setDensity: (density: number) => void;
  setLongestPattern: (gens: number) => void;
}

export default function GameGrid({
  gridSize,
  setGridSize,
  gameRunning,
  speed,
  setGeneration,
  setLivingCells,
  setDensity,
  setLongestPattern,
}: GameGridProps) {
  const [grid, setGrid] = useState<boolean[][]>(() => createEmptyGrid(gridSize));
  const [stableGenerations, setStableGenerations] = useState(0);
  const [previousLivingCells, setPreviousLivingCells] = useState(0);
  const generationRef = useRef(0);
  const gridRef = useRef(grid);
  const animationFrameRef = useRef<number | null>(null);
  const lastUpdateTimeRef = useRef(0);
  
  // Reset everything when grid size changes
  useEffect(() => {
    setGrid(createEmptyGrid(gridSize));
    gridRef.current = createEmptyGrid(gridSize);
    generationRef.current = 0;
    setGeneration(0);
    setStableGenerations(0);
    setPreviousLivingCells(0);
  }, [gridSize, setGeneration]);

  // Update grid reference when grid changes
  useEffect(() => {
    gridRef.current = grid;
  }, [grid]);

  // Count living cells and update stats
  const updateStats = useCallback(() => {
    let livingCount = 0;
    
    for (let i = 0; i < gridRef.current.length; i++) {
      for (let j = 0; j < gridRef.current[i].length; j++) {
        if (gridRef.current[i][j]) {
          livingCount++;
        }
      }
    }
    
    setLivingCells(livingCount);
    const calculatedDensity = Math.round((livingCount / (gridSize * gridSize)) * 100);
    setDensity(calculatedDensity);
    
    // Update stable pattern detection
    if (livingCount === previousLivingCells && livingCount > 0) {
      setStableGenerations(prev => prev + 1);
    } else if (livingCount !== previousLivingCells) {
      setStableGenerations(0);
    }
    
    // Update longest pattern
    if (stableGenerations > 0) {
      setLongestPattern(stableGenerations);
    }
    
    setPreviousLivingCells(livingCount);
  }, [gridSize, setLivingCells, setDensity, previousLivingCells, stableGenerations, setLongestPattern]);

  // Game loop
  const gameLoop = useCallback((timestamp: number) => {
    const interval = 1000 / speed;
    const elapsed = timestamp - lastUpdateTimeRef.current;
    
    if (elapsed > interval) {
      const nextGrid = calculateNextGeneration(gridRef.current);
      setGrid(nextGrid);
      gridRef.current = nextGrid;
      
      generationRef.current++;
      setGeneration(generationRef.current);
      
      updateStats();
      lastUpdateTimeRef.current = timestamp;
    }
    
    if (gameRunning) {
      animationFrameRef.current = requestAnimationFrame(gameLoop);
    }
  }, [gameRunning, speed, setGeneration, updateStats]);

  // Start/stop game loop based on gameRunning state
  useEffect(() => {
    if (gameRunning) {
      lastUpdateTimeRef.current = performance.now();
      animationFrameRef.current = requestAnimationFrame(gameLoop);
    } else if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [gameRunning, gameLoop]);

  // Toggle cell state on click
  const toggleCell = (rowIndex: number, colIndex: number) => {
    if (gameRunning) return;
    
    const newGrid = [...grid];
    newGrid[rowIndex] = [...newGrid[rowIndex]];
    newGrid[rowIndex][colIndex] = !newGrid[rowIndex][colIndex];
    
    setGrid(newGrid);
    updateStats();
  };

  // Step forward one generation
  const stepForward = () => {
    const nextGrid = calculateNextGeneration(grid);
    setGrid(nextGrid);
    generationRef.current++;
    setGeneration(generationRef.current);
    updateStats();
  };

  // Clear the grid
  const clearGrid = () => {
    const emptyGrid = createEmptyGrid(gridSize);
    setGrid(emptyGrid);
    gridRef.current = emptyGrid;
    generationRef.current = 0;
    setGeneration(0);
    setStableGenerations(0);
    updateStats();
  };

  // Randomize the grid
  const randomizeGrid = () => {
    const randomGrid = createRandomGrid(gridSize);
    setGrid(randomGrid);
    gridRef.current = randomGrid;
    generationRef.current = 0;
    setGeneration(0);
    setStableGenerations(0);
    updateStats();
  };

  // Increase grid size
  const increaseGridSize = () => {
    const newSize = Math.min(gridSize + 5, 50);
    if (newSize !== gridSize) {
      setGridSize(newSize);
    }
  };

  // Decrease grid size
  const decreaseGridSize = () => {
    const newSize = Math.max(gridSize - 5, 10);
    if (newSize !== gridSize) {
      setGridSize(newSize);
    }
  };

  // Expose these methods to parent via refs
  useEffect(() => {
    // Make these methods available to the parent component
    (window as any).gameGridAPI = {
      stepForward,
      clearGrid,
      randomizeGrid,
    };
    
    return () => {
      delete (window as any).gameGridAPI;
    };
  }, [grid, gridSize]);

  return (
    <div className="relative border border-grid rounded-lg shadow-sm bg-white overflow-hidden">
      {/* Grid size controls */}
      <div className="absolute top-4 right-4 z-10 bg-white/80 backdrop-blur-sm rounded-lg shadow-sm px-3 py-2 flex items-center space-x-2">
        <button 
          className="text-sm font-medium text-gray-600 hover:text-primary"
          onClick={decreaseGridSize}
        >
          -
        </button>
        <span className="text-sm font-medium">{gridSize} × {gridSize}</span>
        <button
          className="text-sm font-medium text-gray-600 hover:text-primary"
          onClick={increaseGridSize}
        >
          +
        </button>
      </div>
      
      {/* The actual game grid */}
      <div 
        className="game-grid w-full" 
        style={{ 
          display: 'grid',
          gridTemplateColumns: `repeat(${gridSize}, 1fr)`,
          aspectRatio: '1/1'
        }}
      >
        {grid.map((row, rowIndex) =>
          row.map((cell, colIndex) => (
            <div
              key={`${rowIndex}-${colIndex}`}
              className="cell border border-grid"
              style={{ 
                backgroundColor: cell ? '#10B981' : '#F3F4F6',
                transition: 'background-color 0.2s ease'
              }}
              onClick={() => toggleCell(rowIndex, colIndex)}
            />
          ))
        )}
      </div>
    </div>
  );
}
