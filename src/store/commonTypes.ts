import { CellType, Coordinate, Grid, MaterialType } from '@/types/game';
import { MazeSettings } from '@/lib/mazeGenerator';

export interface GameState {
  grid: Grid;
  gridSize: { width: number; height: number };
  startPos: Coordinate;
  endPos: Coordinate;
  isFinished: boolean;
  setGrid: (newGrid: Grid) => void;
  handleCellClick: (pos: Coordinate) => void;
  resetGame: () => void;
}

export type GameStore = () => GameState & (EscapeState | BuilderState);

export interface EscapeState {
  optimalPath: Coordinate[];
  dangerZones: Coordinate[];
  playerPos: Coordinate | null;
  playerPath: Coordinate[];
  items: {
    hasRedKey: boolean;
    hasBlueKey: boolean;
    hasCrowbar: boolean;
  };
}

export type MajorTool = 'build' | 'select' | 'erase';
export type MinorTool = 'brush' | 'fill' | 'rect' | 'select_area' | 'rotate' | 'mirror' | 'move';

export interface BuilderState {
  majorTool: MajorTool;
  minorTool: MinorTool;
  currentMaterial: MaterialType;
  isSimulating: boolean;
  simulationTime: number | null;
  isPathPossible: boolean;
  bestTime: number;
  mazeSettings: MazeSettings;
  movingObject: { type: CellType; originalPos: Coordinate } | null;
  selectionStart: Coordinate | null;
  selectionEnd: Coordinate | null;
  selection: Coordinate[];
  clipboard: { grid: Grid; relativeStart: Coordinate } | null;
  setMajorTool: (tool: MajorTool) => void;
  setMinorTool: (tool: MinorTool) => void;
  setCurrentMaterial: (material: MaterialType) => void;
  setBestTime: (time: number) => void;
  setMazeSettings: (settings: Partial<MazeSettings>) => void;
  resizeGrid: (width: number, height: number) => void;
  startSimulation: () => void;
  resetBuilder: () => void;
  generateMaze: () => void;
  exportLevel: (grid: Grid) => void;
  importLevel: (jsonString: string) => void;
  setSelectionStart: (pos: Coordinate) => void;
  setSelectionEnd: (pos: Coordinate) => void;
  applySelectionAction: (actionTool?: MinorTool) => void;
}