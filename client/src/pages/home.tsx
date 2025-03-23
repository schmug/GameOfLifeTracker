import { useState, useEffect } from "react";
import { nanoid } from "nanoid";
import GameGrid from "@/components/GameGrid";
import GameControls from "@/components/GameControls";
import GameStats from "@/components/GameStats";
import HighScores from "@/components/HighScores";
import RuleExplanation from "@/components/RuleExplanation";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function Home() {
  const { toast } = useToast();
  const [sessionId] = useState(() => nanoid());
  const [gridSize, setGridSize] = useState(25);
  const [gameRunning, setGameRunning] = useState(false);
  const [speed, setSpeed] = useState(10);
  const [generation, setGeneration] = useState(0);
  const [livingCells, setLivingCells] = useState(0);
  const [density, setDensity] = useState(0);
  const [maxGeneration, setMaxGeneration] = useState(0);
  const [maxPopulation, setMaxPopulation] = useState(0);
  const [longestPattern, setLongestPattern] = useState(0);
  const [initialScoreCreated, setInitialScoreCreated] = useState(false);

  // Query for all-time best scores
  const { data: allTimeBestScores, isLoading: isLoadingBestScores } = useQuery({
    queryKey: ['/api/high-scores/best/all-time'],
  });

  // Query for current session high score
  const { data: sessionHighScore, isLoading: isLoadingSessionScore } = useQuery({
    queryKey: [`/api/high-scores/${sessionId}`],
    enabled: initialScoreCreated, // Only fetch once the initial score is created
  });

  // Create a new high score for this session
  const createHighScoreMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", "/api/high-scores", data);
      return res.json();
    },
    onSuccess: () => {
      setInitialScoreCreated(true);
    },
    onError: (error) => {
      toast({
        title: "Error creating high score",
        description: String(error),
        variant: "destructive",
      });
    }
  });

  // Update high score for this session
  const updateHighScoreMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("PATCH", `/api/high-scores/${sessionId}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/high-scores/${sessionId}`] });
    },
    onError: (error) => {
      toast({
        title: "Error updating high score",
        description: String(error),
        variant: "destructive",
      });
    }
  });

  // Initialize the session high score when component mounts
  useEffect(() => {
    createHighScoreMutation.mutate({
      maxGenerations: 0,
      maxPopulation: 0,
      longestPattern: 0,
      gridSize,
      sessionId,
      date: new Date(),
    });
  }, []);

  // Update high scores when they change
  useEffect(() => {
    if (!initialScoreCreated) return;
    
    const shouldUpdate = 
      maxGeneration > (sessionHighScore?.maxGenerations || 0) ||
      maxPopulation > (sessionHighScore?.maxPopulation || 0) ||
      longestPattern > (sessionHighScore?.longestPattern || 0);

    if (shouldUpdate) {
      updateHighScoreMutation.mutate({
        maxGenerations: Math.max(maxGeneration, sessionHighScore?.maxGenerations || 0),
        maxPopulation: Math.max(maxPopulation, sessionHighScore?.maxPopulation || 0),
        longestPattern: Math.max(longestPattern, sessionHighScore?.longestPattern || 0),
      });
    }
  }, [maxGeneration, maxPopulation, longestPattern, sessionHighScore, initialScoreCreated]);

  // Update max scores
  useEffect(() => {
    if (generation > maxGeneration) {
      setMaxGeneration(generation);
    }
    if (livingCells > maxPopulation) {
      setMaxPopulation(livingCells);
    }
    // Longest pattern is tracked in the GameGrid component
  }, [generation, livingCells]);

  return (
    <div className="min-h-screen bg-background text-text">
      <div className="container mx-auto px-4 py-8">
        <header className="mb-6 text-center">
          <h1 className="text-3xl font-semibold mb-2">Conway's Game of Life</h1>
          <p className="text-gray-600">Watch cellular automation in action</p>
        </header>
        
        <div className="lg:flex lg:gap-8">
          {/* Game Grid Container */}
          <div className="lg:w-2/3 mb-6 lg:mb-0">
            <GameGrid 
              gridSize={gridSize}
              setGridSize={setGridSize}
              gameRunning={gameRunning}
              speed={speed}
              setGeneration={setGeneration}
              setLivingCells={setLivingCells}
              setDensity={setDensity}
              setLongestPattern={setLongestPattern}
            />
            
            <GameControls 
              gameRunning={gameRunning}
              setGameRunning={setGameRunning}
              speed={speed}
              setSpeed={setSpeed}
            />
          </div>
          
          {/* Stats and High Scores */}
          <div className="lg:w-1/3">
            <GameStats 
              generation={generation}
              livingCells={livingCells}
              density={density}
              speed={speed}
            />
            
            <HighScores 
              currentSessionActive={gameRunning}
              currentMaxGen={maxGeneration}
              currentMaxPop={maxPopulation}
              currentLongest={longestPattern}
              allTimeBestScores={allTimeBestScores}
              isLoading={isLoadingBestScores || isLoadingSessionScore}
            />
          </div>
        </div>
        
        <RuleExplanation />
      </div>
    </div>
  );
}
