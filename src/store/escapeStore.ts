import { create } from 'zustand';
import { GameState } from './commonTypes';
import { getPath } from '@/lib/pathfinding';
import { loadLevel } from '@/lib/levelLoader';
import { CellType, Coordinate, Grid } from '@/types/game';
import { soundPlayer, SoundType } from '@/lib/soundPlayer';


interface EscapeState {
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

interface EscapeStateExtended extends EscapeState {
  isLoading: boolean;
  levelId: number | null;
  isPathInvalid: boolean;
  loadAndResetGame: (levelId: number) => Promise<void>;
  movePlayer: (dx: number, dy: number) => void;
  undoMove: () => void;
}

const createInitialState = (): Omit<GameState & EscapeStateExtended,
  'setGrid' | 'handleCellClick' | 'resetGame' | 'loadAndResetGame' | 'movePlayer' | 'undoMove'> => ({
  grid: [],
  gridSize: { width: 0, height: 0 },
  startPos: { x: -1, y: -1 },
  endPos: { x: -1, y: -1 },
  optimalPath: [],
  isFinished: false,
  isLoading: true,
  levelId: null,
  isPathInvalid: false,
  dangerZones: [],
  playerPos: null,
  playerPath: [],
  items: { hasRedKey: false, hasBlueKey: false, hasCrowbar: false },
});

const getDangerZones = (grid: Grid, width: number, height: number): Coordinate[] => {
  const zones: Coordinate[] = [];
  const directions = [[0, -1], [0, 1], [-1, 0], [1, 0]];
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const cell = grid[y][x];
      if (cell === CellType.GUARD || cell === CellType.THUG) {
        for (const [dx, dy] of directions) {
          const nx = x + dx;
          const ny = y + dy;
          if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
            zones.push({ x: nx, y: ny });
          }
        }
      }
    }
  }
  return zones;
};

export const useEscapeStore = create<GameState & EscapeStateExtended>((set, get) => ({
  ...createInitialState(),

  setGrid: (newGrid) => set({ grid: newGrid }),

  loadAndResetGame: async (levelId: number) => {
    if (!levelId || typeof levelId !== 'number') {
      console.error("loadAndResetGame called with invalid levelId:", levelId);
      set({ isLoading: false, grid: [[]] });
      return;
    }
    set({ isLoading: true, levelId });
    try {
      const { grid, startPos, endPos, width, height } = await loadLevel(levelId);

      const optimalPath = getPath(grid, startPos, endPos) || [];
      const dangerZones = getDangerZones(grid, width, height);

      set({
        ...createInitialState(),
        levelId,
        grid,
        gridSize: { width, height },
        startPos,
        endPos,
        optimalPath,
        dangerZones,
        playerPos: startPos,
        playerPath: [startPos],
        isLoading: false,
      });
    } catch (error) {
      console.error(`Error processing level ${levelId}:`, error);
      set({ isLoading: false, grid: [[]] });
    }
  },

  resetGame: () => {
    const { levelId } = get();
    if (levelId) {
      get().loadAndResetGame(levelId);
    }
  },

  movePlayer: (dx: number, dy: number) => {
    const { isFinished, playerPos, grid, gridSize, items, dangerZones, endPos } = get();
    if (isFinished || !playerPos) return;

    const newPos = { x: playerPos.x + dx, y: playerPos.y + dy };

    if (newPos.x < 0 || newPos.x >= gridSize.width || newPos.y < 0 || newPos.y >= gridSize.height) {
      return;
    }

    const targetCell = grid[newPos.y][newPos.x];
    const newItems = { ...items };
    
    if (targetCell === CellType.DOOR_RED && !items.hasRedKey) return;
    if (targetCell === CellType.DOOR_BLUE && !items.hasBlueKey) return;
    if (targetCell === CellType.PLANK && !items.hasCrowbar) return;
    if (targetCell === CellType.WALL || targetCell === CellType.WALL_BRICK) return;

    soundPlayer.play(SoundType.WALK);

    const isInDangerZone = dangerZones.some(z => z.x === newPos.x && z.y === newPos.y);
    if (isInDangerZone && !(newPos.x === endPos.x && newPos.y === endPos.y)) {
        soundPlayer.stop(SoundType.WALK);
        set({ isPathInvalid: true, isFinished: true });
        return;
    }

    const newGrid = grid.map(r => [...r]);
    if (targetCell === CellType.KEY_RED || targetCell === CellType.KEY_BLUE || targetCell === CellType.CROWBAR) {
      soundPlayer.play(SoundType.UNLOCK);
      if (targetCell === CellType.KEY_RED) newItems.hasRedKey = true;
      if (targetCell === CellType.KEY_BLUE) newItems.hasBlueKey = true;
      if (targetCell === CellType.CROWBAR) newItems.hasCrowbar = true;
      newGrid[newPos.y][newPos.x] = CellType.EMPTY;
    }
    
    if (targetCell === CellType.PLANK && items.hasCrowbar) {
      soundPlayer.play(SoundType.BREAK_PLANK);
      newGrid[newPos.y][newPos.x] = CellType.EMPTY;
    }
    
    const levelFinished = newPos.x === endPos.x && newPos.y === endPos.y;
    if (levelFinished) {
      soundPlayer.stop(SoundType.WALK);
      soundPlayer.play(SoundType.VICTORY);
    }


    set(state => ({
      playerPos: newPos,
      playerPath: [...state.playerPath, newPos],
      items: newItems,
      grid: newGrid,
      isFinished: levelFinished
    }));
  },

  undoMove: () => {
    const { playerPath, isFinished, startPos } = get();
    if (isFinished || playerPath.length <= 1) return;

    const newPath = playerPath.slice(0, -1);
    const newPlayerPos = newPath.length > 0 ? newPath[newPath.length - 1] : startPos;
    
    get().loadAndResetGame(get().levelId!).then(() => {
        const initialState = get();
        let tempItems = { ...initialState.items };
        let tempGrid = initialState.grid.map(r => [...r]);

        for(let i=1; i < newPath.length; i++) {
            const pos = newPath[i];
            const cell = tempGrid[pos.y][pos.x];
            if (cell === CellType.KEY_RED) { tempItems.hasRedKey = true; tempGrid[pos.y][pos.x] = CellType.EMPTY; }
            if (cell === CellType.KEY_BLUE) { tempItems.hasBlueKey = true; tempGrid[pos.y][pos.x] = CellType.EMPTY; }
            if (cell === CellType.CROWBAR) { tempItems.hasCrowbar = true; tempGrid[pos.y][pos.x] = CellType.EMPTY; }
            if (cell === CellType.PLANK && tempItems.hasCrowbar) { tempGrid[pos.y][pos.x] = CellType.EMPTY; }
        }

        set({
            playerPath: newPath,
            playerPos: newPlayerPos,
            items: tempItems,
            grid: tempGrid,
            isFinished: false,
            isPathInvalid: false,
        });
    });
  },

  handleCellClick: () => {}, 
}));