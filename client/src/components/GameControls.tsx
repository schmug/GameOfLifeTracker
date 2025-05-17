import { useState, useEffect } from "react";
import { nanoid } from "nanoid";
import { serializeGrid } from "@/lib/serialization";
import { apiRequest } from "@/lib/queryClient";

interface GameControlsProps {
  gameRunning: boolean;
  setGameRunning: (running: boolean) => void;
  speed: number;
  setSpeed: (speed: number) => void;
}

export default function GameControls({
  gameRunning,
  setGameRunning,
  speed,
  setSpeed,
}: GameControlsProps) {
  const [speedLabel, setSpeedLabel] = useState("Normal");
  const [shareLink, setShareLink] = useState<string | null>(null);

  // Start the simulation
  const startGame = () => {
    if (!gameRunning) {
      setGameRunning(true);
    }
  };

  // Pause the simulation
  const pauseGame = () => {
    if (gameRunning) {
      setGameRunning(false);
    }
  };

  // Step forward one generation
  const stepForward = () => {
    if (!gameRunning && (window as any).gameGridAPI) {
      (window as any).gameGridAPI.stepForward();
    }
  };

  // Clear the grid
  const clearGrid = () => {
    setGameRunning(false);
    if ((window as any).gameGridAPI) {
      (window as any).gameGridAPI.clearGrid();
    }
  };

  // Randomize the grid
  const randomizeGrid = () => {
    setGameRunning(false);
    if ((window as any).gameGridAPI) {
      (window as any).gameGridAPI.randomizeGrid();
    }
  };

  const shareGrid = async () => {
    if (!(window as any).gameGridAPI) return;
    const grid = (window as any).gameGridAPI.getGrid();
    const code = nanoid(8);
    const pattern = serializeGrid(grid);
    await apiRequest('POST', `/api/share/${code}`, { pattern });
    const url = `${window.location.origin}${window.location.pathname}?share=${code}`;
    try {
      await navigator.clipboard.writeText(url);
      setShareLink(url);
    } catch (e) {
      setShareLink(url);
    }
  };

  // Update speed label based on speed value
  useEffect(() => {
    if (speed <= 5) setSpeedLabel("Slow");
    else if (speed <= 10) setSpeedLabel("Normal");
    else if (speed <= 15) setSpeedLabel("Fast");
    else setSpeedLabel("Very Fast");
  }, [speed]);

  return (
    <div className="mt-4 bg-white rounded-lg shadow-sm border border-grid p-4">
      <div className="flex flex-wrap gap-3">
        <button 
          onClick={startGame}
          className={`px-4 py-2 rounded-md font-medium transition-colors ${
            gameRunning 
              ? "bg-gray-200 text-gray-700 hover:bg-gray-300" 
              : "bg-primary text-white hover:bg-indigo-600"
          }`}
        >
          Start
        </button>
        <button 
          onClick={pauseGame}
          className={`px-4 py-2 rounded-md font-medium transition-colors ${
            gameRunning 
              ? "bg-primary text-white hover:bg-indigo-600" 
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
        >
          Pause
        </button>
        <button 
          onClick={stepForward}
          className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md font-medium hover:bg-gray-300 transition-colors"
        >
          Next Gen
        </button>
        <button 
          onClick={clearGrid}
          className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md font-medium hover:bg-gray-300 transition-colors"
        >
          Clear
        </button>
        <button
          onClick={randomizeGrid}
          className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md font-medium hover:bg-gray-300 transition-colors"
        >
          Random
        </button>
        <button
          onClick={shareGrid}
          className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md font-medium hover:bg-gray-300 transition-colors"
        >
          Share
        </button>
      </div>

      <div className="mt-4">
        <label className="flex items-center space-x-2">
          <span className="text-sm font-medium">Speed: </span>
          <span className="text-xs text-gray-500">{speedLabel}</span>
        </label>
        <input
          type="range"
          min="1"
          max="20"
          value={speed}
          onChange={(e) => setSpeed(parseInt(e.target.value))}
          className="w-full mt-1"
          style={{
            WebkitAppearance: 'none',
            appearance: 'none',
            height: '6px',
            background: '#E5E7EB',
            borderRadius: '3px',
            outline: 'none',
          }}
        />
      </div>

      {shareLink && (
        <div className="mt-2 text-xs text-gray-500 break-all">
          Share link copied: <a href={shareLink}>{shareLink}</a>
        </div>
      )}
    </div>
  );
}
