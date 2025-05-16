import { describe, it, expect } from 'vitest'
import { calculateNextGeneration, Cell } from '../gameOfLife'

describe('Game of Life', () => {
  it('survives with two neighbors', () => {
    const grid: Cell[][] = [
      [ { alive: false, color: 'white' }, { alive: true, color: 'green' }, { alive: false, color: 'white' } ],
      [ { alive: true, color: 'blue' }, { alive: true, color: 'red' }, { alive: false, color: 'white' } ],
      [ { alive: false, color: 'white' }, { alive: false, color: 'white' }, { alive: false, color: 'white' } ],
    ]

    const next = calculateNextGeneration(grid)
    expect(next[1][1].alive).toBe(true)
    expect(next[1][1].color).toBe('red')
  })

  it('survives with three neighbors', () => {
    const grid: Cell[][] = [
      [ { alive: true, color: 'green' }, { alive: true, color: 'blue' }, { alive: false, color: 'white' } ],
      [ { alive: true, color: 'yellow' }, { alive: true, color: 'red' }, { alive: false, color: 'white' } ],
      [ { alive: false, color: 'white' }, { alive: false, color: 'white' }, { alive: false, color: 'white' } ],
    ]
    // add third neighbor
    grid[0][2].alive = true
    grid[0][2].color = 'purple'

    const next = calculateNextGeneration(grid)
    expect(next[1][1].alive).toBe(true)
    expect(next[1][1].color).toBe('red')
  })

  it('birth with exactly three neighbors inherits color', () => {
    const grid: Cell[][] = [
      [ { alive: false, color: 'white' }, { alive: true, color: 'red' }, { alive: false, color: 'white' } ],
      [ { alive: true, color: 'green' }, { alive: false, color: 'white' }, { alive: true, color: 'blue' } ],
      [ { alive: false, color: 'white' }, { alive: false, color: 'white' }, { alive: false, color: 'white' } ],
    ]

    const next = calculateNextGeneration(grid)
    expect(next[1][1].alive).toBe(true)
    expect(['red', 'green', 'blue']).toContain(next[1][1].color)
    // parent colors remain
    expect(grid[0][1].color).toBe('red')
    expect(grid[1][0].color).toBe('green')
    expect(grid[1][2].color).toBe('blue')
  })
})
