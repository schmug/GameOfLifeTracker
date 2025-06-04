/* vitest-environment jsdom */
import React from 'react';
import { describe, it, expect } from 'vitest';
import { act } from 'react-dom/test-utils';
import { createRoot } from 'react-dom/client';
import HighScores from '../HighScores';

function renderComponent(props: any) {
  const container = document.createElement('div');
  document.body.appendChild(container);
  act(() => {
    createRoot(container).render(<HighScores {...props} />);
  });
  return container;
}

describe('HighScores', () => {
  it('shows skeletons when loading', () => {
    const container = renderComponent({
      currentSessionActive: true,
      currentMaxGen: 0,
      currentMaxPop: 0,
      currentLongest: 0,
      isLoading: true,
      sessionId: 's1'
    });
    expect(container.querySelectorAll('.animate-pulse').length).toBeGreaterThan(0);
  });

  it('displays best scores', () => {
    const scores = {
      maxGenerations: { sessionId: 's1', maxGenerations: 10, maxPopulation: 5, longestPattern: 3, gridSize: 25, date: new Date().toISOString(), id: 1 },
      maxPopulation: { sessionId: 's2', maxGenerations: 8, maxPopulation: 20, longestPattern: 2, gridSize: 25, date: new Date().toISOString(), id: 2 },
      longestPattern: { sessionId: 's3', maxGenerations: 5, maxPopulation: 5, longestPattern: 15, gridSize: 25, date: new Date().toISOString(), id: 3 }
    };
    const container = renderComponent({
      currentSessionActive: false,
      currentMaxGen: 1,
      currentMaxPop: 2,
      currentLongest: 3,
      allTimeBestScores: scores,
      isLoading: false,
      sessionId: 'x'
    });
    expect(container.textContent).toContain('10');
    expect(container.textContent).toContain('20');
    expect(container.textContent).toContain('15 gens');
  });
});
