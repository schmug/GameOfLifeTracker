import React from "react";

interface GameStatsProps {
  generation: number;
  livingCells: number;
  density: number;
  speed: number;
}

export default function GameStats({
  generation,
  livingCells,
  density,
  speed,
}: GameStatsProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-grid p-4 mb-4">
      <h2 className="text-lg font-semibold mb-3">Statistics</h2>
      
      <div className="space-y-3">
        <div className="flex justify-between items-center pb-2 border-b border-grid">
          <span className="text-gray-600">Generation</span>
          <span className="font-medium text-lg">{generation}</span>
        </div>
        
        <div className="flex justify-between items-center pb-2 border-b border-grid">
          <span className="text-gray-600">Living Cells</span>
          <span className="font-medium text-lg">{livingCells}</span>
        </div>
        
        <div className="flex justify-between items-center pb-2 border-b border-grid">
          <span className="text-gray-600">Population Density</span>
          <span className="font-medium text-lg">{density}%</span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-gray-600">Speed</span>
          <span className="font-medium text-lg">{speed} gen/s</span>
        </div>
      </div>
    </div>
  );
}
