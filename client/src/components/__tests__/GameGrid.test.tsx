/* vitest-environment jsdom */
import React from 'react';
import { describe, it, expect } from 'vitest';
import { act } from 'react-dom/test-utils';
import { createRoot } from 'react-dom/client';
import GameGrid from '../GameGrid';

function renderGrid(gridSize: number) {
  const container = document.createElement('div');
  document.body.appendChild(container);
  act(() => {
    createRoot(container).render(
      <GameGrid
        gridSize={gridSize}
        setGridSize={() => {}}
        gameRunning={false}
        setGameRunning={() => {}}
        speed={1}
        setGeneration={() => {}}
        setLivingCells={() => {}}
        setDensity={() => {}}
        setLongestPattern={() => {}}
      />
    );
  });
  return container;
}

describe('GameGrid', () => {
  it('renders correct number of cells', () => {
    const container = renderGrid(3);
    const cells = container.querySelectorAll('.cell');
    expect(cells.length).toBe(9);
  });
});
