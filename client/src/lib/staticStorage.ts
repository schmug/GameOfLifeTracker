import { nanoid } from 'nanoid';
import { HighScore } from '@shared/schema';

// Local storage keys
const SESSION_ID_KEY = 'conway_session_id';
const HIGH_SCORES_KEY = 'conway_high_scores';

// Get or create a session ID
export function getSessionId(): string {
  let sessionId = localStorage.getItem(SESSION_ID_KEY);
  if (!sessionId) {
    sessionId = nanoid();
    localStorage.setItem(SESSION_ID_KEY, sessionId);
  }
  return sessionId;
}

// Initialize high scores array in localStorage if it doesn't exist
function initializeHighScores() {
  if (!localStorage.getItem(HIGH_SCORES_KEY)) {
    localStorage.setItem(HIGH_SCORES_KEY, JSON.stringify([]));
  }
  return JSON.parse(localStorage.getItem(HIGH_SCORES_KEY) || '[]');
}

// Save a new high score
export async function saveHighScore(highScore: Omit<HighScore, 'id'>): Promise<HighScore> {
  const scores = initializeHighScores();
  const sessionId = getSessionId();
  
  // Check if a score for this session already exists
  const existingScoreIndex = scores.findIndex((s: HighScore) => s.sessionId === sessionId);
  
  // Create a new score with an ID
  const scoreWithId: HighScore = {
    ...highScore,
    id: existingScoreIndex >= 0 ? scores[existingScoreIndex].id : scores.length + 1,
    date: new Date().toISOString()
  };
  
  if (existingScoreIndex >= 0) {
    // Update existing score
    scores[existingScoreIndex] = scoreWithId;
  } else {
    // Add new score
    scores.push(scoreWithId);
  }
  
  // Save to localStorage
  localStorage.setItem(HIGH_SCORES_KEY, JSON.stringify(scores));
  
  return scoreWithId;
}

// Get a high score by session ID
export async function getHighScoreBySessionId(sessionId: string): Promise<HighScore | undefined> {
  const scores = initializeHighScores();
  return scores.find((s: HighScore) => s.sessionId === sessionId);
}

// Update an existing high score
export async function updateHighScore(
  sessionId: string, 
  updates: Partial<Omit<HighScore, 'id' | 'sessionId' | 'date'>>
): Promise<HighScore | undefined> {
  const scores = initializeHighScores();
  
  // Find the score by session ID
  const scoreIndex = scores.findIndex((s: HighScore) => s.sessionId === sessionId);
  
  if (scoreIndex === -1) {
    return undefined;
  }
  
  // Update the score
  const updatedScore: HighScore = {
    ...scores[scoreIndex],
    ...updates,
    date: new Date().toISOString()
  };
  
  scores[scoreIndex] = updatedScore;
  
  // Save to localStorage
  localStorage.setItem(HIGH_SCORES_KEY, JSON.stringify(scores));
  
  // Update all-time best scores
  updateBestScores(updatedScore);
  
  return updatedScore;
}

// Get all-time best scores
export async function getAllTimeBestScores(): Promise<{
  maxGenerations: HighScore | null;
  maxPopulation: HighScore | null;
  longestPattern: HighScore | null;
}> {
  const scores = initializeHighScores();
  
  if (scores.length === 0) {
    return {
      maxGenerations: null,
      maxPopulation: null,
      longestPattern: null
    };
  }
  
  // Find the highest scores
  let maxGenerations = scores[0];
  let maxPopulation = scores[0];
  let longestPattern = scores[0];
  
  for (const score of scores) {
    if (score.maxGenerations > maxGenerations.maxGenerations) {
      maxGenerations = score;
    }
    if (score.maxPopulation > maxPopulation.maxPopulation) {
      maxPopulation = score;
    }
    if (score.longestPattern > longestPattern.longestPattern) {
      longestPattern = score;
    }
  }
  
  return {
    maxGenerations: maxGenerations.maxGenerations > 0 ? maxGenerations : null,
    maxPopulation: maxPopulation.maxPopulation > 0 ? maxPopulation : null,
    longestPattern: longestPattern.longestPattern > 0 ? longestPattern : null
  };
}

// Helper function to update the all-time best scores
function updateBestScores(score: HighScore) {
  const scores = initializeHighScores();
  let updated = false;
  
  // Find existing score
  const existingIndex = scores.findIndex((s: HighScore) => s.id === score.id);
  
  if (existingIndex >= 0) {
    scores[existingIndex] = score;
    updated = true;
  }
  
  if (!updated) {
    scores.push(score);
  }
  
  localStorage.setItem(HIGH_SCORES_KEY, JSON.stringify(scores));
}