export type Pattern = [number, number][];

export const patterns: Record<string, Pattern> = {
  Block: [
    [0, 0],
    [0, 1],
    [1, 0],
    [1, 1],
  ],
  Beehive: [
    [0, 1],
    [0, 2],
    [1, 0],
    [1, 3],
    [2, 1],
    [2, 2],
  ],
  Blinker: [
    [1, 0],
    [1, 1],
    [1, 2],
  ],
  Glider: [
    [0, 1],
    [1, 2],
    [2, 0],
    [2, 1],
    [2, 2],
  ],
};
