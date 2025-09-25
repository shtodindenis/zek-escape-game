import { Grid, CellType, Coordinate } from '@/types/game';

const charToCellType: Record<string, CellType> = {
  'W': CellType.WALL,
  'B': CellType.WALL_BRICK,
  'S': CellType.START,
  'E': CellType.END,
  'G': CellType.GUARD,
  'T': CellType.THUG,
  '_': CellType.EMPTY,
  ' ': CellType.EMPTY,
  'p': CellType.PLANK,
  'c': CellType.CROWBAR,
  '1': CellType.DOOR_RED,
  '!': CellType.KEY_RED,
  '2': CellType.DOOR_BLUE,
  '@': CellType.KEY_BLUE,
};

interface LevelData {
  id: number;
  layout: string[];
}

interface ParsedLevel {
  grid: Grid;
  startPos: Coordinate;
  endPos: Coordinate;
  width: number;
  height: number;
}

export function parseLevelLayout(levelData: LevelData): ParsedLevel {
  let startPos: Coordinate = { x: -1, y: -1 };
  let endPos: Coordinate = { x: -1, y: -1 };

  const grid: Grid = levelData.layout.map((rowString, y) => {
    return rowString.split('').map((char, x) => {
      if (char === 'S') {
        startPos = { x, y };
      }
      if (char === 'E') {
        endPos = { x, y };
      }
      return charToCellType[char] || CellType.EMPTY;
    });
  });

  if (startPos.x === -1 || endPos.x === -1) {
    throw new Error(`Level ${levelData.id} is missing a Start (S) or End (E) point.`);
  }

  const height = grid.length;
  const width = grid.length > 0 ? grid[0].length : 0;
  
  return { grid, startPos, endPos, width, height };
}

export const loadLevel = async (levelId: number): Promise<ParsedLevel> => {
  try {
    const levelModule = await import(`../levels/level-${levelId}.json`);
    const levelData: LevelData = levelModule.default;
    return parseLevelLayout(levelData);
  } catch (error) {
    console.error(`Failed to load level ${levelId}:`, error);
    throw new Error(`Level ${levelId} not found or is invalid.`);
  }
};