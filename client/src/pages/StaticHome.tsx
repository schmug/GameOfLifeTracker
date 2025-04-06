import { useEffect, useState } from 'react';
import GameGrid from '@/components/GameGrid';
import GameControls from '@/components/GameControls';
import GameStats from '@/components/GameStats';
import HighScores from '@/components/HighScores';
import RuleExplanation from '@/components/RuleExplanation';
import GameIntroduction from '@/components/GameIntroduction';
import { getSessionId, saveHighScore, getHighScoreBySessionId, updateHighScore, getAllTimeBestScores } from '@/lib/staticStorage';
import { HighScore } from '@shared/schema';

interface AllTimeBestScores {
  maxGenerations: HighScore | null;
  maxPopulation: HighScore | null;
  longestPattern: HighScore | null;
}

export default function StaticHome() {
  // Session
  const [sessionId] = useState(getSessionId());

  // Game state
  const [gridSize, setGridSize] = useState(25);
  const [gameRunning, setGameRunning] = useState(false);
  const [speed, setSpeed] = useState(10);
  const [generation, setGeneration] = useState(0);
  const [livingCells, setLivingCells] = useState(0);
  const [density, setDensity] = useState(0);
  const [longestPattern, setLongestPattern] = useState(0);
  
  // High scores
  const [currentScore, setCurrentScore] = useState<HighScore | null>(null);
  const [allTimeBestScores, setAllTimeBestScores] = useState<AllTimeBestScores>({
    maxGenerations: null,
    maxPopulation: null,
    longestPattern: null
  });
  const [isLoading, setIsLoading] = useState(true);
  
  // Initialize high scores
  useEffect(() => {
    async function initializeScores() {
      try {
        setIsLoading(true);
        
        // Get or create the current session's high score
        let sessionScore = await getHighScoreBySessionId(sessionId);
        
        if (!sessionScore) {
          // Create a new score entry if none exists
          sessionScore = await saveHighScore({
            sessionId,
            maxGenerations: 0,
            maxPopulation: 0,
            longestPattern: 0,
            gridSize,
            date: new Date().toISOString(),
          });
        }
        
        setCurrentScore(sessionScore);
        
        // Get all-time best scores
        const bestScores = await getAllTimeBestScores();
        setAllTimeBestScores(bestScores);
      } catch (error) {
        console.error('Error loading scores:', error);
      } finally {
        setIsLoading(false);
      }
    }
    
    initializeScores();
  }, [sessionId, gridSize]);
  
  // Update high scores when relevant stats change
  useEffect(() => {
    if (!sessionId) return;
    
    async function updateScores() {
      // Skip update if no currentScore exists yet
      if (!currentScore) return;
      try {
        // Update max generations if current generation is higher
        if (generation > (currentScore?.maxGenerations || 0)) {
          const updatedScore = await updateHighScore(sessionId, { maxGenerations: generation });
          if (updatedScore) {
            setCurrentScore(updatedScore);
          }
        }
        
        // Update max population if current living cells count is higher
        if (livingCells > (currentScore?.maxPopulation || 0)) {
          const updatedScore = await updateHighScore(sessionId, { maxPopulation: livingCells });
          if (updatedScore) {
            setCurrentScore(updatedScore);
          }
        }
        
        // Update longest pattern if current pattern length is higher
        if (longestPattern > (currentScore?.longestPattern || 0)) {
          const updatedScore = await updateHighScore(sessionId, { longestPattern });
          if (updatedScore) {
            setCurrentScore(updatedScore);
          }
        }
        
        // Get updated all-time best scores
        const bestScores = await getAllTimeBestScores();
        setAllTimeBestScores(bestScores);
      } catch (error) {
        console.error('Error updating scores:', error);
      }
    }
    
    updateScores();
  }, [generation, livingCells, longestPattern, currentScore, sessionId]);

  return (
    <div className="container py-4 mx-auto">
      <h1 className="mb-8 text-4xl font-bold text-center">Conway's Game of Life</h1>
      
      <div className="mb-6">
        <GameIntroduction />
      </div>
      
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="md:col-span-2">
          <div className="p-4 overflow-hidden bg-white rounded-lg shadow-md dark:bg-gray-800">
            <GameGrid
              gridSize={gridSize}
              setGridSize={setGridSize}
              gameRunning={gameRunning}
              setGameRunning={setGameRunning}
              speed={speed}
              setGeneration={setGeneration}
              setLivingCells={setLivingCells}
              setDensity={setDensity}
              setLongestPattern={setLongestPattern}
            />
            
            <div className="flex flex-wrap gap-4 mt-4">
              <GameControls 
                gameRunning={gameRunning}
                setGameRunning={setGameRunning}
                speed={speed}
                setSpeed={setSpeed}
              />
            </div>
          </div>
        </div>
        
        <div className="space-y-6">
          <GameStats
            generation={generation}
            livingCells={livingCells}
            density={density}
            speed={speed}
          />
          
          <HighScores
            currentSessionActive={!isLoading && !!currentScore}
            currentMaxGen={currentScore?.maxGenerations || 0}
            currentMaxPop={currentScore?.maxPopulation || 0}
            currentLongest={currentScore?.longestPattern || 0}
            allTimeBestScores={allTimeBestScores}
            isLoading={isLoading}
            sessionId={sessionId}
          />
          
          <RuleExplanation />
        </div>
      </div>
      
      <div className="mt-8 text-sm text-center text-gray-500">
        <p>
          This is the static version of Conway's Game of Life, deployed on GitHub Pages. 
          High scores are stored in your browser's localStorage.
        </p>
      </div>
    </div>
  );
}