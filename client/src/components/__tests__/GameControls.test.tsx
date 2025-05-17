/* vitest-environment jsdom */
import React from 'react';
import { describe, it, expect } from 'vitest';
import { act } from 'react-dom/test-utils';
import { createRoot } from 'react-dom/client';
import GameControls from '../GameControls';

describe('GameControls', () => {
  it('calls setGameRunning on Start and Pause', () => {
    const startSpy = vi.fn();
    const pauseSpy = vi.fn();
    let running = false;
    const setRunning = (val: boolean) => {
      running = val;
      if (val) startSpy(); else pauseSpy();
    };
    const container = document.createElement('div');
    document.body.appendChild(container);
    act(() => {
      createRoot(container).render(
        <GameControls
          gameRunning={running}
          setGameRunning={setRunning}
          speed={1}
          setSpeed={() => {}}
        />
      );
    });
    const [startBtn, pauseBtn] = container.querySelectorAll('button');
    act(() => { startBtn!.dispatchEvent(new MouseEvent('click', { bubbles: true })); });
    expect(startSpy).toHaveBeenCalled();
    act(() => { pauseBtn!.dispatchEvent(new MouseEvent('click', { bubbles: true })); });
    expect(pauseSpy).toHaveBeenCalled();
  });

  it('updates speed via slider', () => {
    const speedSpy = vi.fn();
    const container = document.createElement('div');
    document.body.appendChild(container);
    act(() => {
      createRoot(container).render(
        <GameControls
          gameRunning={false}
          setGameRunning={() => {}}
          speed={5}
          setSpeed={speedSpy}
        />
      );
    });
    const slider = container.querySelector('input[type="range"]') as HTMLInputElement;
    act(() => {
      slider.value = '8';
      slider.dispatchEvent(new Event('input', { bubbles: true }));
      slider.dispatchEvent(new Event('change', { bubbles: true }));
    });
    expect(speedSpy).toHaveBeenCalledWith(8);
  });
});
