export enum CellType {
  EMPTY,
  WALL,
  START,
  END,
  GUARD,
  THUG,
  PLAYER_PATH,
  OPTIMAL_PATH,
  WALL_BRICK,
  PLANK,
  CROWBAR,
  DOOR_RED,
  KEY_RED,
  DOOR_BLUE,
  KEY_BLUE,
  PLAYER,
}

export enum BuilderTool {
  MOVE = 100,
  FILL = 101,
  SELECT = 102,
}

export type ToolType = BuilderTool;
export type MaterialType = CellType;

export type Coordinate = {
  x: number;
  y: number;
};

export type Grid = CellType[][];

export const GAME_CONFIG = {
  WIDTH: 35,
  HEIGHT: 21,
  OBSTACLE_DENSITY: 0.25,
  STEP_TIME_MS: 100,
};

export type AspectRatio = '16:9' | '4:3' | '21:9' | 'auto';