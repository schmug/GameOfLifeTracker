import { nanoid } from 'nanoid';
import { HighScore } from '@shared/schema';

// localStorage keys
const SESSION_ID_KEY = 'game_of_life_session_id';
const HIGH_SCORES_KEY = 'game_of_life_high_scores';
const BEST_SCORES_KEY = 'game_of_life_best_scores';

// Get or create a session ID
export function getSessionId(): string {
  let sessionId = localStorage.getItem(SESSION_ID_KEY);
  if (!sessionId) {
    sessionId = nanoid();
    localStorage.setItem(SESSION_ID_KEY, sessionId);
  }
  return sessionId;
}

// Initialize high scores in localStorage if they don't exist
function initializeHighScores() {
  if (!localStorage.getItem(HIGH_SCORES_KEY)) {
    localStorage.setItem(HIGH_SCORES_KEY, JSON.stringify([]));
  }
  if (!localStorage.getItem(BEST_SCORES_KEY)) {
    localStorage.setItem(BEST_SCORES_KEY, JSON.stringify({
      maxGenerations: null,
      maxPopulation: null,
      longestPattern: null
    }));
  }
}

// Save high score
export async function saveHighScore(highScore: Omit<HighScore, 'id'>): Promise<HighScore> {
  initializeHighScores();
  const sessionId = getSessionId();
  
  // Try to get existing high score for this session
  const scores = JSON.parse(localStorage.getItem(HIGH_SCORES_KEY) || '[]');
  const existingScoreIndex = scores.findIndex((s: HighScore) => s.sessionId === sessionId);
  
  // Prepare the score object
  const scoreWithId: HighScore = {
    ...highScore,
    id: existingScoreIndex >= 0 ? scores[existingScoreIndex].id : Date.now(),
    sessionId
  };
  
  // Update or add the score
  if (existingScoreIndex >= 0) {
    scores[existingScoreIndex] = scoreWithId;
  } else {
    scores.push(scoreWithId);
  }
  
  localStorage.setItem(HIGH_SCORES_KEY, JSON.stringify(scores));
  
  // Update best scores
  updateBestScores(scoreWithId);
  
  return scoreWithId;
}

// Get high score by session ID
export async function getHighScoreBySessionId(sessionId: string): Promise<HighScore | undefined> {
  initializeHighScores();
  const scores = JSON.parse(localStorage.getItem(HIGH_SCORES_KEY) || '[]');
  return scores.find((s: HighScore) => s.sessionId === sessionId);
}

// Update high score for session
export async function updateHighScore(
  sessionId: string, 
  updates: Partial<HighScore>
): Promise<HighScore | undefined> {
  initializeHighScores();
  const scores = JSON.parse(localStorage.getItem(HIGH_SCORES_KEY) || '[]');
  const scoreIndex = scores.findIndex((s: HighScore) => s.sessionId === sessionId);
  
  if (scoreIndex === -1) return undefined;
  
  const updatedScore: HighScore = {
    ...scores[scoreIndex],
    ...updates
  };
  
  scores[scoreIndex] = updatedScore;
  localStorage.setItem(HIGH_SCORES_KEY, JSON.stringify(scores));
  
  // Update best scores
  updateBestScores(updatedScore);
  
  return updatedScore;
}

// Get all-time best scores
export async function getAllTimeBestScores(): Promise<{
  maxGenerations: HighScore | null;
  maxPopulation: HighScore | null;
  longestPattern: HighScore | null;
}> {
  initializeHighScores();
  return JSON.parse(localStorage.getItem(BEST_SCORES_KEY) || '{}');
}

// Update best scores if new score is better
function updateBestScores(score: HighScore) {
  const bestScores = JSON.parse(localStorage.getItem(BEST_SCORES_KEY) || '{}');
  
  // Check max generations
  if (!bestScores.maxGenerations || score.maxGenerations > bestScores.maxGenerations.maxGenerations) {
    bestScores.maxGenerations = score;
  }
  
  // Check max population
  if (!bestScores.maxPopulation || score.maxPopulation > bestScores.maxPopulation.maxPopulation) {
    bestScores.maxPopulation = score;
  }
  
  // Check longest pattern
  if (!bestScores.longestPattern || score.longestPattern > bestScores.longestPattern.longestPattern) {
    bestScores.longestPattern = score;
  }
  
  localStorage.setItem(BEST_SCORES_KEY, JSON.stringify(bestScores));
}