import React from "react";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";

interface HighScoresProps {
  currentSessionActive: boolean;
  currentMaxGen: number;
  currentMaxPop: number;
  currentLongest: number;
  allTimeBestScores?: any;
  isLoading: boolean;
}

export default function HighScores({
  currentSessionActive,
  currentMaxGen,
  currentMaxPop,
  currentLongest,
  allTimeBestScores,
  isLoading,
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
          <div className="flex items-center justify-between pb-2 border-b border-grid">
            <div>
              <div className="font-medium">Generations</div>
              <div className="text-xs text-gray-500">
                {allTimeBestScores?.generationsDate || "N/A"}
              </div>
            </div>
            <div className="text-lg font-semibold">
              {allTimeBestScores?.maxGenerations || 0}
            </div>
          </div>
          
          <div className="flex items-center justify-between pb-2 border-b border-grid">
            <div>
              <div className="font-medium">Population</div>
              <div className="text-xs text-gray-500">
                {allTimeBestScores?.populationDate || "N/A"}
              </div>
            </div>
            <div className="text-lg font-semibold">
              {allTimeBestScores?.maxPopulation || 0}
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium">Pattern Longevity</div>
              <div className="text-xs text-gray-500">
                {allTimeBestScores?.longevityDate || "N/A"}
              </div>
            </div>
            <div className="text-lg font-semibold">
              {allTimeBestScores?.longestPattern || 0} gens
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
