/* vitest-environment jsdom */
import React from "react";
import { describe, it, expect } from "vitest";
import { act } from "react-dom/test-utils";
import { createRoot } from "react-dom/client";
import GameGrid from "../GameGrid";
import { patterns } from "@/lib/patterns";

function renderGrid(gridSize: number) {
  const container = document.createElement("div");
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
      />,
    );
  });
  return container;
}

describe("GameGrid", () => {
  it("renders correct number of cells", () => {
    const container = renderGrid(3);
    const cells = container.querySelectorAll(".cell");
    expect(cells.length).toBe(9);
  });

  it("loads patterns correctly", () => {
    const container = renderGrid(10);
    act(() => {
      (window as any).gameGridAPI.loadPattern(patterns.Block);
    });
    const cells = container.querySelectorAll(".cell");
    const alive = Array.from(cells).filter(
      (c) => (c as HTMLElement).style.backgroundColor !== "rgb(243, 244, 246)",
    );
    expect(alive.length).toBe(patterns.Block.length);
  });
});
