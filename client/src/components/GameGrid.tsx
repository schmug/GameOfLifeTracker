import { useState, useRef, useEffect, useCallback } from "react";
import { calculateNextGeneration, createEmptyGrid, createRandomGrid, getRandomColor, Cell } from "@/lib/gameOfLife";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface GameGridProps {
  gridSize: number;
  setGridSize: (size: number) => void;
  gameRunning: boolean;
  setGameRunning: (running: boolean) => void;
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
  setGameRunning,
  speed,
  setGeneration,
  setLivingCells,
  setDensity,
  setLongestPattern,
}: GameGridProps) {
  // State and refs
  const [grid, setGrid] = useState<Cell[][]>(() => createEmptyGrid(gridSize));
  const [stableGenerations, setStableGenerations] = useState(0);
  const [previousLivingCells, setPreviousLivingCells] = useState(0);
  const generationRef = useRef(0);
  const gridRef = useRef(grid);
  const animationFrameRef = useRef<number | null>(null);
  const lastUpdateTimeRef = useRef(0);
  
  // Update grid reference when grid changes
  useEffect(() => {
    gridRef.current = grid;
  }, [grid]);
  
  // Reset everything when grid size changes
  useEffect(() => {
    setGrid(createEmptyGrid(gridSize));
    gridRef.current = createEmptyGrid(gridSize);
    generationRef.current = 0;
    setGeneration(0);
    setStableGenerations(0);
    setPreviousLivingCells(0);
  }, [gridSize, setGeneration]);
  
  // Function to update statistics based on the current grid
  const updateStats = useCallback(() => {
    let livingCount = 0;
    
    for (let i = 0; i < gridRef.current.length; i++) {
      for (let j = 0; j < gridRef.current[i].length; j++) {
        if (gridRef.current[i][j].alive) {
          livingCount++;
        }
      }
    }
    
    setLivingCells(livingCount);
    const calculatedDensity = Math.round((livingCount / (gridSize * gridSize)) * 100);
    setDensity(calculatedDensity);
    
    // Update stable pattern detection
    if (livingCount === previousLivingCells && livingCount > 0) {
      const newStableGenerations = stableGenerations + 1;
      setStableGenerations(newStableGenerations);
      
      // Only update the longest pattern when the current stable pattern length increases
      // and exceeds the previous longest pattern
      setLongestPattern(prevLongest => Math.max(prevLongest, newStableGenerations));
    } else if (livingCount !== previousLivingCells) {
      setStableGenerations(0);
    }
    
    setPreviousLivingCells(livingCount);
  }, [gridSize, previousLivingCells, stableGenerations, setDensity, setLivingCells, setLongestPattern]);
  
  // Randomize the grid
  const randomizeGrid = useCallback(() => {
    const randomGrid = createRandomGrid(gridSize);
    setGrid(randomGrid);
    gridRef.current = randomGrid;
    generationRef.current = 0;
    setGeneration(0);
    setStableGenerations(0);
    updateStats();
  }, [gridSize, setGeneration, updateStats]);
  
  // Clear the grid
  const clearGrid = useCallback(() => {
    const emptyGrid = createEmptyGrid(gridSize);
    setGrid(emptyGrid);
    gridRef.current = emptyGrid;
    generationRef.current = 0;
    setGeneration(0);
    setStableGenerations(0);
    updateStats();
  }, [gridSize, setGeneration, updateStats]);
  
  // Step forward one generation
  const stepForward = useCallback(() => {
    const nextGrid = calculateNextGeneration(grid);
    setGrid(nextGrid);
    generationRef.current++;
    setGeneration(generationRef.current);
    updateStats();
  }, [grid, setGeneration, updateStats]);
  
  // State for game over dialog
  const [gameOverDialogOpen, setGameOverDialogOpen] = useState(false);
  const [gameOverMessage, setGameOverMessage] = useState("");
  
  // Function for game over actions
  const handleGameOver = useCallback((message: string) => {
    setGameOverMessage(message);
    setGameOverDialogOpen(true);
    setGameRunning(false);
  }, [setGameRunning]);
  
  // These functions are no longer needed with the simplified dialog approach
  // Users will use the existing controls in the UI to restart or randomize

  // Game loop
  const gameLoop = useCallback((timestamp: number) => {
    const interval = 1000 / speed;
    const elapsed = timestamp - lastUpdateTimeRef.current;
    
    if (elapsed > interval) {
      const nextGrid = calculateNextGeneration(gridRef.current);
      
      // Check for end conditions
      
      // End condition 1: No living cells
      let hasLivingCells = false;
      for (let i = 0; i < nextGrid.length; i++) {
        for (let j = 0; j < nextGrid[i].length; j++) {
          if (nextGrid[i][j].alive) {
            hasLivingCells = true;
            break;
          }
        }
        if (hasLivingCells) break;
      }
      
      if (!hasLivingCells) {
        // Game is over - no more living cells
        handleGameOver('Game over! All cells have died.');
        return;
      }
      
      // End condition 2: Pattern has stabilized (handled via stableGenerations)
      if (stableGenerations > 10) {
        handleGameOver('Game over! Pattern has stabilized for 10 generations.');
        return;
      }
      
      // Continue the game
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
  }, [gameRunning, setGameRunning, speed, stableGenerations, updateStats, setGeneration, handleGameOver]);
  
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
  
  // State for keeping track of mouse state
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawMode, setDrawMode] = useState<'create' | 'erase'>('create');

  // Function to toggle cell at a specific position
  const toggleCell = useCallback((rowIndex: number, colIndex: number, forcedState?: boolean) => {
    if (gameRunning) return;
    
    const newGrid = [...grid];
    newGrid[rowIndex] = [...newGrid[rowIndex]];
    const cell = newGrid[rowIndex][colIndex];
    
    // If forcedState is provided, use it; otherwise toggle
    const newAlive = forcedState !== undefined ? forcedState : !cell.alive;
    
    // Update cell with new state
    newGrid[rowIndex][colIndex] = {
      alive: newAlive,
      color: newAlive && !cell.alive ? getRandomColor() : cell.color
    };
    
    setGrid(newGrid);
    updateStats();
  }, [gameRunning, grid, updateStats]);
  
  // Handle mouse down to start drawing
  const handleMouseDown = useCallback((rowIndex: number, colIndex: number) => {
    if (gameRunning) return;
    
    // Determine draw mode based on initial cell state
    const initialCellState = grid[rowIndex][colIndex].alive;
    setDrawMode(initialCellState ? 'erase' : 'create');
    
    // Toggle this cell
    toggleCell(rowIndex, colIndex);
    
    // Mark that we're drawing
    setIsDrawing(true);
  }, [gameRunning, grid, toggleCell]);
  
  // Handle mouse enter while drawing
  const handleMouseEnter = useCallback((rowIndex: number, colIndex: number) => {
    if (!isDrawing || gameRunning) return;
    
    // Apply the appropriate action based on draw mode
    if (drawMode === 'create') {
      toggleCell(rowIndex, colIndex, true); // Force cell to be alive
    } else {
      toggleCell(rowIndex, colIndex, false); // Force cell to be dead
    }
  }, [isDrawing, gameRunning, drawMode, toggleCell]);
  
  // Handle mouse up to stop drawing
  const handleMouseUp = useCallback(() => {
    setIsDrawing(false);
  }, []);
  
  // Increase grid size
  const increaseGridSize = useCallback(() => {
    const newSize = Math.min(gridSize + 5, 50);
    if (newSize !== gridSize) {
      setGridSize(newSize);
    }
  }, [gridSize, setGridSize]);
  
  // Decrease grid size
  const decreaseGridSize = useCallback(() => {
    const newSize = Math.max(gridSize - 5, 10);
    if (newSize !== gridSize) {
      setGridSize(newSize);
    }
  }, [gridSize, setGridSize]);
  
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
  }, [clearGrid, randomizeGrid, stepForward]);
  
  return (
    <div className="relative border border-grid rounded-lg shadow-sm bg-white overflow-hidden">
      {/* Grid painting notice */}
      {!gameRunning && (
        <div className="absolute top-4 left-4 z-10 bg-white/80 backdrop-blur-sm rounded-lg shadow-sm px-3 py-2">
          <span className="text-xs text-gray-500">
            {isDrawing ? 
              (drawMode === 'create' ? 'Drawing cells...' : 'Erasing cells...') : 
              'Click and drag to paint cells'}
          </span>
        </div>
      )}
      
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
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        // Prevent the default browser drag behavior
        onDragStart={(e) => e.preventDefault()}
        draggable="false"
      >
        {grid.map((row, rowIndex) =>
          row.map((cell, colIndex) => (
            <div
              key={`${rowIndex}-${colIndex}`}
              className="cell border border-grid"
              style={{ 
                backgroundColor: cell.alive ? cell.color : '#F3F4F6',
                transition: 'background-color 0.2s ease',
                cursor: gameRunning ? 'not-allowed' : 'pointer'
              }}
              onMouseDown={() => handleMouseDown(rowIndex, colIndex)}
              onMouseEnter={() => handleMouseEnter(rowIndex, colIndex)}
              draggable="false"
              onDragStart={(e) => e.preventDefault()}
            />
          ))
        )}
      </div>
      
      {/* Game Over Dialog */}
      <Dialog open={gameOverDialogOpen} onOpenChange={setGameOverDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Game Over</DialogTitle>
            <DialogDescription>
              {gameOverMessage}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex justify-center mt-4">
            <Button 
              variant="default" 
              onClick={() => setGameOverDialogOpen(false)}
              className="w-32"
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
