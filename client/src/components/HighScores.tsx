import React from "react";
import { format, formatDistanceToNow } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

// Define high score interface
interface HighScore {
  id?: number;
  sessionId: string;
  maxGenerations: number;
  maxPopulation: number;
  longestPattern: number;
  gridSize: number;
  date: Date | string;
}

// Interface for all-time best scores
interface AllTimeBestScores {
  maxGenerations: HighScore | null;
  maxPopulation: HighScore | null;
  longestPattern: HighScore | null;
}

interface HighScoresProps {
  currentSessionActive: boolean;
  currentMaxGen: number;
  currentMaxPop: number;
  currentLongest: number;
  allTimeBestScores?: AllTimeBestScores;
  isLoading: boolean;
  sessionId: string;
}

export default function HighScores({
  currentSessionActive,
  currentMaxGen,
  currentMaxPop,
  currentLongest,
  allTimeBestScores,
  isLoading,
  sessionId,
}: HighScoresProps) {
  const sessionDate = format(new Date(), "yyyy-MM-dd 'at' HH:mm");
  
  return (
    <div className="bg-white rounded-lg shadow-sm border border-grid p-4">
      <h2 className="text-lg font-semibold mb-3">High Scores</h2>
      
      <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-3 mb-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm text-indigo-700 font-medium">Current Session</div>
            <div className="text-xs text-indigo-600">{sessionDate}</div>
          </div>
          <div className="flex items-center text-xs text-indigo-700 font-medium">
            {currentSessionActive ? "ACTIVE" : "PAUSED"}
          </div>
        </div>
        
        <div className="mt-2 space-y-1">
          <div className="flex justify-between">
            <span className="text-sm text-gray-600">Max Generations</span>
            <span className="text-sm font-medium">{currentMaxGen}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-gray-600">Max Population</span>
            <span className="text-sm font-medium">{currentMaxPop}</span>
          </div>
          <div className={`flex justify-between ${currentLongest > 0 ? "pulse-animation" : ""}`}>
            <span className="text-sm text-gray-600">Longest Surviving Pattern</span>
            <span className="text-sm font-medium text-primary">{currentLongest} gens</span>
          </div>
        </div>
      </div>
      
      <h3 className="text-md font-medium mb-2">All Time Bests</h3>
      
      {isLoading ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-grid">
            <Skeleton className="w-24 h-10" />
            <Skeleton className="w-12 h-8" />
          </div>
          <div className="flex items-center justify-between pb-2 border-b border-grid">
            <Skeleton className="w-24 h-10" />
            <Skeleton className="w-12 h-8" />
          </div>
          <div className="flex items-center justify-between">
            <Skeleton className="w-24 h-10" />
            <Skeleton className="w-12 h-8" />
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Generations record */}
          <div className="pb-2 border-b border-grid">
            <div className="flex items-center justify-between">
              <div className="font-medium">Max Generations</div>
              <div className="text-lg font-semibold">
                {allTimeBestScores?.maxGenerations?.maxGenerations || 0}
              </div>
            </div>
            
            {allTimeBestScores?.maxGenerations && (
              <div className="mt-1 flex flex-wrap items-start gap-1">
                {allTimeBestScores.maxGenerations.sessionId === sessionId && (
                  <Badge variant="outline" className="text-xs bg-green-50 border-green-200 text-green-700">You</Badge>
                )}
                <div className="text-xs text-gray-500 ml-auto">
                  Grid: {allTimeBestScores.maxGenerations.gridSize}×{allTimeBestScores.maxGenerations.gridSize} • 
                  {' '}
                  {formatDistanceToNow(new Date(allTimeBestScores.maxGenerations.date), { addSuffix: true })}
                </div>
              </div>
            )}
          </div>
          
          {/* Population record */}
          <div className="pb-2 border-b border-grid">
            <div className="flex items-center justify-between">
              <div className="font-medium">Max Population</div>
              <div className="text-lg font-semibold">
                {allTimeBestScores?.maxPopulation?.maxPopulation || 0}
              </div>
            </div>
            
            {allTimeBestScores?.maxPopulation && (
              <div className="mt-1 flex flex-wrap items-start gap-1">
                {allTimeBestScores.maxPopulation.sessionId === sessionId && (
                  <Badge variant="outline" className="text-xs bg-green-50 border-green-200 text-green-700">You</Badge>
                )}
                <div className="text-xs text-gray-500 ml-auto">
                  Grid: {allTimeBestScores.maxPopulation.gridSize}×{allTimeBestScores.maxPopulation.gridSize} • 
                  {' '}
                  {formatDistanceToNow(new Date(allTimeBestScores.maxPopulation.date), { addSuffix: true })}
                </div>
              </div>
            )}
          </div>
          
          {/* Pattern longevity record */}
          <div>
            <div className="flex items-center justify-between">
              <div className="font-medium">Longest Pattern</div>
              <div className="text-lg font-semibold">
                {allTimeBestScores?.longestPattern?.longestPattern || 0} gens
              </div>
            </div>
            
            {allTimeBestScores?.longestPattern && (
              <div className="mt-1 flex flex-wrap items-start gap-1">
                {allTimeBestScores.longestPattern.sessionId === sessionId && (
                  <Badge variant="outline" className="text-xs bg-green-50 border-green-200 text-green-700">You</Badge>
                )}
                <div className="text-xs text-gray-500 ml-auto">
                  Grid: {allTimeBestScores.longestPattern.gridSize}×{allTimeBestScores.longestPattern.gridSize} • 
                  {' '}
                  {formatDistanceToNow(new Date(allTimeBestScores.longestPattern.date), { addSuffix: true })}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
